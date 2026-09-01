/**
 * dsh-browser — built-in browser for DeepSeek Harness (web surface).
 *
 * One host plugin providing:
 *  - a shared Playwright-backed browser (`lib/manager.js`), launched on demand
 *    against the system browser (Edge/Chrome by default — no downloads);
 *  - an HTTP API under `/dsh-browser/*` serving the live viewport frames,
 *    navigation, and interaction endpoints for the in-GUI panel;
 *  - a visible browser panel injected into the served GUI index (webServer
 *    index-injection: one container div, its styles, and the panel script);
 *  - agent-facing tools (`browser_navigate`, `browser_snapshot`, ...) with
 *    prompt guidance and call/result presentation.
 *
 * The panel and the tools drive the SAME page, so the user sees exactly what
 * the agent is browsing (Codex-style), and user clicks in the panel land in
 * the agent's browser.
 *
 * Route note: `/dsh-browser` is a distinct prefix — the harness reserves
 * `/api` (client-connection, trust-fenced) and `/plugins` (client-modules).
 *
 * @module dsh-browser
 */
import z from "@deepseek-ai/schemastery";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { BrowserManager, normalizeUrl } from "./manager.js";

/** Cordis plugin name used by loader diagnostics. */
export const name = "dsh-browser";
/** Services required by this plugin. */
export const inject = ["webServer", "tools", "systemPrompt"];

/** HTTP prefix owning every dsh-browser request. */
export const API_PREFIX = "/dsh-browser";
/** The panel script served from this package and injected into the GUI index. */
export const PANEL_JS_PATH = fileURLToPath(new URL("./panel.js", import.meta.url));

export const Config = z.object({
  /** Run the browser without a desktop window. */
  headless: z.boolean().default(true),
  /** Launch channel: msedge | chrome | chromium (Windows default: msedge). */
  channel: z.string().required(false),
  /** Absolute browser path; takes precedence over `channel`. */
  executablePath: z.string().required(false),
  viewportWidth: z.number().default(1280),
  viewportHeight: z.number().default(800),
  /** Per-navigation budget (ms). */
  navTimeoutMs: z.number().default(30000),
  /** browser_snapshot text cap (chars). */
  snapshotMaxChars: z.number().default(12000),
  /** Cap for the panel's /html route (chars of outerHTML). */
  htmlMaxChars: z.number().default(100000),
  /** Enable the gated browser_eval tool and /eval route. */
  allowEval: z.boolean().default(false),
  /** Extra chromium launch arguments. */
  launchArgs: z.array(z.string()).default([]),
  /** In-GUI panel width (px). */
  panelWidth: z.number().default(460)
});

function assertPositiveInteger(field, value) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`dsh-browser: ${field} must be a positive integer`);
}

// ── tiny node:http helpers ──────────────────────────────────────────────────

function json(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(value));
}

function bytes(res, mime, buffer) {
  res.writeHead(200, { "content-type": mime, "cache-control": "no-store" });
  res.end(buffer);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  let text;
  try {
    text = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(text);
  } catch (error) {
    throw new SyntaxError(`invalid JSON body: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Serve the panel script itself (same-origin, cache-busted by the injected src). */
function servePanel(res) {
  const source = readFileSync(PANEL_JS_PATH, "utf8");
  bytes(res, "text/javascript; charset=utf-8", Buffer.from(source, "utf8"));
}

/** Serve the current live frame; a matching `ts` query serves the cached JPEG. */
async function serveFrame(req, res, manager) {
  const ts = new URL(req.url ?? "/", "http://dsh.local").searchParams.get("ts");
  const requested = ts === null ? undefined : Number(ts);
  const cached = requested !== undefined ? manager.frameFor(requested) : null;
  if (cached !== null) return bytes(res, "image/jpeg", cached);
  try {
    await manager.capture();
    const frame = manager.frame;
    if (frame === null) return json(res, 503, { error: "browser not ready" });
    return bytes(res, "image/jpeg", frame.buffer);
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
}

/** One handle() for the whole prefix: dispatch on method + relative path. */
function makeHandler(manager, config) {
  return async (req, res) => {
    const pathname = new URL(req.url ?? "/", "http://dsh.local").pathname;
    const relative = pathname.slice(API_PREFIX.length);
    try {
      if (req.method === "GET" && relative === "/panel.js") return servePanel(res);
      if (req.method === "GET" && relative === "/state") return json(res, 200, await manager.state());
      if (req.method === "GET" && relative === "/text") return json(res, 200, await manager.text());
      if (req.method === "GET" && relative === "/html") return json(res, 200, await manager.html(config.htmlMaxChars));
      if (req.method === "GET" && (relative === "/frame" || relative === "/screenshot")) {
        return serveFrame(req, res, manager);
      }
      if (req.method === "POST" && relative === "/launch") {
        await manager.ensurePage();
        return json(res, 200, await manager.state());
      }
      if (req.method === "POST" && relative === "/reset") {
        await manager.reset();
        return json(res, 200, await manager.state());
      }
      if (req.method === "POST" && relative === "/navigate") {
        const body = await readJsonBody(req);
        return json(res, 200, await manager.navigate(body.url, config.navTimeoutMs));
      }
      if (req.method === "POST" && relative === "/click") {
        const body = await readJsonBody(req);
        const x = Number(body.x);
        const y = Number(body.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError("x and y must be numbers");
        return json(res, 200, await manager.click(x, y));
      }
      if (req.method === "POST" && relative === "/type") {
        const body = await readJsonBody(req);
        return json(res, 200, await manager.type(String(body.text ?? ""), body.selector));
      }
      if (req.method === "POST" && relative === "/scroll") {
        const body = await readJsonBody(req);
        return json(res, 200, await manager.scroll(Number(body.dx ?? 0), Number(body.dy ?? 0)));
      }
      if (req.method === "POST" && relative === "/back") return json(res, 200, await manager.back());
      if (req.method === "POST" && relative === "/forward") return json(res, 200, await manager.forward());
      if (req.method === "POST" && relative === "/reload") return json(res, 200, await manager.reload());
      if (req.method === "POST" && relative === "/eval") {
        if (!config.allowEval) return json(res, 403, { error: "browser_eval is disabled — set dsh-browser config allowEval: true to enable" });
        const body = await readJsonBody(req);
        const expression = String(body.expression ?? "");
        if (expression.length === 0) throw new Error("expression must be a non-empty string");
        const value = await manager.evaluate(expression);
        return json(res, 200, { value });
      }
      return json(res, 404, { error: `dsh-browser: unknown ${req.method} ${relative}` });
    } catch (error) {
      const status =
        error instanceof SyntaxError || error instanceof TypeError || error instanceof RangeError ? 400 : 500;
      const message = error instanceof Error ? error.message : String(error);
      try {
        json(res, status, { error: message });
      } catch {
        // response already started; nothing more to do
      }
    }
  };
}

// ── the in-GUI panel: styles + container + script via index injection ────────

function panelInjections(config) {
  const width = Number.isInteger(config.panelWidth) && config.panelWidth > 0 ? config.panelWidth : 460;
  const style = `
:root{--dshb-split:${width}px}
/* Split view: when the panel is open, the app shrinks to the left and the
   browser docks in the freed right strip (a true split, not an overlay). */
html.dshb-split body{padding-right:var(--dshb-split)}
html.dshb-split #root{width:calc(100vw - var(--dshb-split))}
#dsh-browser-root{position:fixed;top:0;right:0;height:100%;width:var(--dshb-split);max-width:100vw;z-index:2147483000;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;pointer-events:none}
#dsh-browser-root[data-open="true"]{box-shadow:var(--dsw-shadow-lv3,0 8px 40px rgba(0,0,0,.5))}
`;
  return [
    { kind: "style", text: style },
    { kind: "html", placement: "body", html: '<div id="dsh-browser-root" data-open="false"></div>' },
    { kind: "script-src", placement: "body", src: `${API_PREFIX}/panel.js` }
  ];
}

// ── agent tools ──────────────────────────────────────────────────────────────

function textRender(text) {
  return (_args, value) => [{ type: "text", text: text(value) }];
}

function browserTool(def, config, { timeoutMs } = {}) {
  return defineTool({
    timeoutMs: timeoutMs ?? config.navTimeoutMs,
    isConcurrencySafe: () => false,
    ...def
  });
}

function registerTools(ctx, manager, config) {
  const nav = config.navTimeoutMs;
  const short = Math.min(nav, 15000);

  ctx.systemPrompt.section({
    name: "tool:browser",
    order: 200,
    text:
      "A built-in browser is available. Use browser_navigate to open a URL, browser_snapshot to read the current page as text, " +
      "browser_click_selector/browser_click to click (prefer a CSS selector; coordinates only when the page has no stable selector), " +
      "browser_type to type into the focused element or a selector, browser_scroll to scroll, and browser_screenshot to capture the page. " +
      "The user can see this browser live in the GUI panel; describe what you see and confirm before destructive actions."
  });

  ctx.tools.register(browserTool({
    name: "browser_navigate",
    description: "Open a URL in the built-in browser. Accepts a bare host (e.g. example.com) and returns the page URL, title, and HTTP status.",
    parameters: { url: { type: "string", required: true, description: "The URL (or bare host) to open." } },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          url: { type: "string", required: true },
          title: { type: "string", required: true },
          status: { type: "integer" },
          error: { type: "string" }
        }
      },
      render: textRender((v) => `Opened ${v.url}${v.title ? ` — ${v.title}` : ""}${v.status !== undefined ? ` (HTTP ${v.status})` : ""}${v.error ? `\nError: ${v.error}` : ""}`),
      presentationMeta: (_args, v) => ({ url: v.url, title: v.title })
    },
    async execute(args) {
      return manager.navigate(args.url, nav);
    },
    presentCall: (args) => ({ card: "generic", title: args.url, kind: "browser", rawInput: args.url })
  }, config, { timeoutMs: nav }));

  ctx.tools.register(browserTool({
    name: "browser_snapshot",
    description: "Read the current browser page as visible text (title, URL, and the page's inner text, capped). Use before deciding the next action.",
    parameters: { maxChars: { type: "integer", description: "Optional text cap; defaults to the configured snapshotMaxChars." } },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          url: { type: "string", required: true },
          title: { type: "string", required: true },
          text: { type: "string", required: true },
          truncated: { type: "boolean", required: true }
        }
      },
      render: textRender((v) => `Page: ${v.title} (${v.url})\n\n${v.text}${v.truncated ? "\n\n(Text truncated — use browser_screenshot for the visual page.)" : ""}`)
    },
    async execute(args) {
      const cap = args.maxChars !== undefined ? args.maxChars : config.snapshotMaxChars;
      return manager.snapshot(cap);
    },
    presentCall: () => ({ card: "generic", title: "Reading the page…", kind: "browser", rawInput: "snapshot" })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_click_selector",
    description: "Click an element in the browser by CSS selector.",
    parameters: { selector: { type: "string", required: true, description: "CSS selector of the element to click." } },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { selector: { type: "string", required: true } } },
      render: textRender((v) => `Clicked ${v.selector}`)
    },
    async execute(args) {
      return manager.clickSelector(args.selector, short);
    },
    presentCall: (args) => ({ card: "generic", title: `Click ${args.selector}`, kind: "browser", rawInput: args.selector })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_click",
    description: "Click at pixel coordinates in the browser viewport (viewport size is configured; screenshot dims match it). Use browser_click_selector when a selector exists.",
    parameters: {
      x: { type: "integer", required: true, description: "Viewport x in CSS pixels." },
      y: { type: "integer", required: true, description: "Viewport y in CSS pixels." }
    },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { x: { type: "integer", required: true }, y: { type: "integer", required: true } } },
      render: textRender((v) => `Clicked at (${v.x}, ${v.y})`)
    },
    async execute(args) {
      return manager.click(args.x, args.y);
    },
    presentCall: (args) => ({ card: "generic", title: `Click (${args.x}, ${args.y})`, kind: "browser", rawInput: `${args.x}, ${args.y}` })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_type",
    description: "Type text in the browser. With a selector, fills that element; without one, types into the focused element.",
    parameters: {
      text: { type: "string", required: true, description: "The text to type." },
      selector: { type: "string", description: "Optional CSS selector to fill." }
    },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { chars: { type: "integer", required: true }, selector: { type: "string" } } },
      render: textRender((v) => `Typed ${v.chars} chars${v.selector ? ` into ${v.selector}` : ""}`)
    },
    async execute(args) {
      return manager.type(args.text, args.selector);
    },
    presentCall: (args) => ({ card: "generic", title: "Typing…", kind: "browser", rawInput: args.selector ?? "(focused)" })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_scroll",
    description: "Scroll the browser page (mouse wheel deltas, in CSS pixels).",
    parameters: {
      dx: { type: "integer", description: "Horizontal delta; default 0." },
      dy: { type: "integer", description: "Vertical delta; default 0." }
    },
    output: {
      schema: { type: "object", additionalProperties: false, properties: { dx: { type: "integer", required: true }, dy: { type: "integer", required: true } } },
      render: textRender((v) => `Scrolled by (${v.dx}, ${v.dy})`)
    },
    async execute(args) {
      return manager.scroll(args.dx ?? 0, args.dy ?? 0);
    },
    presentCall: (args) => ({ card: "generic", title: "Scrolling…", kind: "browser", rawInput: `${args.dx ?? 0}, ${args.dy ?? 0}` })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_back",
    description: "Go back in the browser history.",
    parameters: {},
    output: {
      schema: { type: "object", additionalProperties: false, properties: { url: { type: "string", required: true }, title: { type: "string", required: true } } },
      render: textRender((v) => `Back to ${v.url}${v.title ? ` — ${v.title}` : ""}`)
    },
    async execute() {
      return manager.back();
    },
    presentCall: () => ({ card: "generic", title: "Back", kind: "browser", rawInput: "back" })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_forward",
    description: "Go forward in the browser history.",
    parameters: {},
    output: {
      schema: { type: "object", additionalProperties: false, properties: { url: { type: "string", required: true }, title: { type: "string", required: true } } },
      render: textRender((v) => `Forward to ${v.url}${v.title ? ` — ${v.title}` : ""}`)
    },
    async execute() {
      return manager.forward();
    },
    presentCall: () => ({ card: "generic", title: "Forward", kind: "browser", rawInput: "forward" })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_reload",
    description: "Reload the current browser page.",
    parameters: {},
    output: {
      schema: { type: "object", additionalProperties: false, properties: { url: { type: "string", required: true }, title: { type: "string", required: true } } },
      render: textRender((v) => `Reloaded ${v.url}${v.title ? ` — ${v.title}` : ""}`)
    },
    async execute() {
      return manager.reload();
    },
    presentCall: () => ({ card: "generic", title: "Reload", kind: "browser", rawInput: "reload" })
  }, config, { timeoutMs: short }));

  ctx.tools.register(browserTool({
    name: "browser_screenshot",
    description: "Capture the current browser page as a screenshot; the result embeds a view of the live page (same image the GUI panel shows).",
    parameters: {},
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          url: { type: "string", required: true },
          title: { type: "string", required: true },
          rev: { type: "integer", required: true }
        }
      },
      render: textRender((v) => `Screenshot of ${v.url}${v.title ? ` — ${v.title}` : ""}\n\n![browser view](/dsh-browser/frame?ts=${v.rev})`),
      presentationMeta: (_args, v) => ({ url: v.url, title: v.title })
    },
    async execute() {
      await manager.capture();
      const state = await manager.state();
      return { url: state.url, title: state.title, rev: state.rev };
    },
    presentCall: () => ({ card: "generic", title: "Capturing the page…", kind: "browser", rawInput: "screenshot" })
  }, config, { timeoutMs: 20000 }));

  if (config.allowEval) {
    ctx.tools.register(browserTool({
      name: "browser_eval",
      description: "Run a JavaScript expression in the current page (gated; enabled by the allowEval config).",
      parameters: { expression: { type: "string", required: true, description: "JavaScript expression to evaluate in the page." } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: { value: { type: "string", required: true } } },
        render: textRender((v) => String(v.value))
      },
      async execute(args) {
        const value = await manager.evaluate(args.expression);
        return { value: typeof value === "string" ? value : JSON.stringify(value) };
      },
      presentCall: (args) => ({ card: "generic", title: "Evaluating JS…", kind: "browser", rawInput: args.expression })
    }, config, { timeoutMs: short }));
  }
}

// ── plugin entry ─────────────────────────────────────────────────────────────

export function apply(ctx, config) {
  assertPositiveInteger("navTimeoutMs", config.navTimeoutMs);
  assertPositiveInteger("snapshotMaxChars", config.snapshotMaxChars);
  assertPositiveInteger("htmlMaxChars", config.htmlMaxChars);
  assertPositiveInteger("viewportWidth", config.viewportWidth);
  assertPositiveInteger("viewportHeight", config.viewportHeight);

  const manager = new BrowserManager(config);
  const handler = makeHandler(manager, config);

  // Routes: /dsh-browser/* (panel script, state, frames, interactions).
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: API_PREFIX,
    handler
  }), "dsh-browser: api route");

  // Index injection: the visible panel rides on the served GUI index.
  ctx.on("webserver/index-inject", (table) => {
    table.push(...panelInjections(config));
  });

  // Agent tools + prompt guidance (effect-scoped by the registries).
  registerTools(ctx, manager, config);

  // Close the browser when the plugin goes away.
  ctx.effect(() => () => {
    void manager.close();
  }, "dsh-browser: teardown");
}
