/**
 * dsh-browser offline smoke test — verifies the plugin wiring without a full
 * dsh boot: apply() against a stub Cordis context, then exercise the HTTP
 * route handler on a real node:http server.
 *
 * Requires the peers @deepseek-ai/dsh-tools and @deepseek-ai/schemastery to
 * resolve (a node_modules junction to the DSH profile's hoisted store works).
 * playwright-core is deliberately NOT expected here — the lazy-import path is
 * part of what this test verifies.
 *
 * Run: node scripts/smoke.mjs
 */
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const libUrl = new URL("../lib/index.js", import.meta.url);
const plugin = await import(libUrl.href);

let failures = 0;
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

// ── stub Cordis context ──────────────────────────────────────────────────────
const registeredRoutes = [];
const registeredTools = [];
const promptSections = [];
const eventListeners = new Map();
const disposers = [];
const ctx = {
  logger: {
    warn: (error) => console.warn(`[ctx.warn] ${error?.message ?? error}`),
    error: (error) => console.error(`[ctx.error] ${error?.message ?? error}`)
  },
  on(event, fn) {
    if (!eventListeners.has(event)) eventListeners.set(event, []);
    eventListeners.get(event).push(fn);
    return () => {
      const list = eventListeners.get(event);
      if (list) {
        const at = list.indexOf(fn);
        if (at !== -1) list.splice(at, 1);
      }
    };
  },
  effect(fn) {
    const disposer = fn();
    if (typeof disposer === "function") disposers.push(disposer);
  },
  webServer: {
    register(route) {
      registeredRoutes.push(route);
      return () => {
        const at = registeredRoutes.indexOf(route);
        if (at !== -1) registeredRoutes.splice(at, 1);
      };
    }
  },
  tools: {
    register(tool) {
      registeredTools.push(tool);
    }
  },
  systemPrompt: {
    section(section) {
      promptSections.push(section);
    }
  }
};

console.log("dsh-browser smoke test\n");

// ── apply ────────────────────────────────────────────────────────────────────
const config = {
  headless: true,
  channel: undefined,
  executablePath: undefined,
  viewportWidth: 1280,
  viewportHeight: 800,
  navTimeoutMs: 30000,
  snapshotMaxChars: 12000,
  htmlMaxChars: 100000,
  allowEval: false,
  launchArgs: [],
  panelWidth: 460
};
plugin.apply(ctx, config);

console.log("wiring:");
check("plugin exports name/inject/Config/apply", plugin.name === "dsh-browser" && Array.isArray(plugin.inject) && plugin.Config !== undefined && typeof plugin.apply === "function");
check(`route registered: prefix ${plugin.API_PREFIX}`, registeredRoutes.length === 1 && registeredRoutes[0].kind === "prefix" && registeredRoutes[0].path === plugin.API_PREFIX);
check("index-inject listener attached", eventListeners.has("webserver/index-inject") && eventListeners.get("webserver/index-inject").length === 1);
check(`tools registered (${registeredTools.length})`, registeredTools.length >= 10);
check("systemPrompt section registered", promptSections.some((s) => s.name === "tool:browser"));
check("browser_eval absent when allowEval=false", !registeredTools.some((t) => t.name === "browser_eval"));
check("tools are not concurrency-safe (shared browser)", registeredTools.every((t) => t.isConcurrencySafe() === false));

// index injection rows
const table = [];
for (const fn of eventListeners.get("webserver/index-inject") ?? []) fn(table);
const styleRow = table.find((r) => r.kind === "style" && typeof r.text === "string");
check("injection: style row", styleRow !== undefined && styleRow.text.includes("#dsh-browser-root"));
check("injection: split CSS var", styleRow !== undefined && styleRow.text.includes("--dshb-split"));
check("injection: split shrinks app", styleRow !== undefined && styleRow.text.includes("html.dshb-split #root"));
check("injection: container div row", table.some((r) => r.kind === "html" && r.placement === "body" && r.html.includes("dsh-browser-root")));
check("injection: panel script-src row", table.some((r) => r.kind === "script-src" && r.src === `${plugin.API_PREFIX}/panel.js`));

// tool definition contract (exercises the real dsh-tools compile paths)
console.log("tool definitions:");
for (const tool of registeredTools) {
  const params = tool.parameters; // getter compiles the property map → throws on a bad spec
  check(`${tool.name}: parameters compile`, params !== undefined && typeof params === "object");
  check(`${tool.name}: output render present`, typeof tool.output?.render === "function");
  check(`${tool.name}: execute present`, typeof tool.execute === "function");
}

// ── real HTTP behavior ───────────────────────────────────────────────────────
const handler = registeredRoutes[0].handler;
const server = createServer(handler);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}${plugin.API_PREFIX}`;

async function get(path) {
  const res = await fetch(`${base}${path}`);
  return { status: res.status, body: await res.text() };
}
async function post(path, payload) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload ?? {})
  });
  return { status: res.status, body: await res.text() };
}

console.log("http:");
{
  const { status, body } = await get("/state");
  const parsed = JSON.parse(body);
  check("GET /state → 200 {launched:false}", status === 200 && parsed.launched === false && typeof parsed.rev === "number");
}
{
  const { status, body } = await get("/panel.js");
  check(
    "GET /panel.js → 200 JS with shadow DOM + controls",
    status === 200 &&
      body.includes("attachShadow") &&
      body.includes("dshb-panel") &&
      body.includes('data-action="close"') &&
      body.includes("dshb-resize") &&
      body.includes("dshb-read") &&
      body.includes('data-action="read"') &&
      body.includes('classList.toggle("dshb-split"') &&
      body.includes("--dshb-split") &&
      body.includes("dshb")
  );
}
{
  const { status, body } = await post("/eval", { expression: "1+1" });
  check("POST /eval → 403 when allowEval=false", status === 403 && JSON.parse(body).error.includes("allowEval"));
}
{
  const { status } = await post("/navigate", { url: "example.com" });
  check("POST /navigate → 500 with playwright guidance (missing playwright-core)", status === 500);
}
{
  const { status } = await get("/text");
  check("GET /text → 500 (browser cannot launch without playwright-core)", status === 500);
}
{
  const { status } = await get("/html");
  check("GET /html → 500 (browser cannot launch without playwright-core)", status === 500);
}
{
  const { status } = await post("/reset");
  check("POST /reset → 200 (idle state)", status === 200);
}
{
  const { status } = await get("/frame");
  check("GET /frame → 500 (browser cannot launch without playwright-core)", status === 500);
}
{
  const { status, body } = await get("/state");
  check("GET /state still healthy after failed launches", status === 200 && JSON.parse(body).launched === false);
}
{
  const { status } = await get("/nope");
  check("GET /nope → 404", status === 404);
}
{
  const { status } = await post("/click", { x: "a", y: 1 });
  check("POST /click with non-numeric x → 400", status === 400);
}

server.closeAllConnections();
await new Promise((resolve) => server.close(resolve));
for (const dispose of disposers) dispose();

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
process.exitCode = failures === 0 ? 0 : 1;
