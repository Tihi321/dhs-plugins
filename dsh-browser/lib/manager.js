/**
 * dsh-browser — BrowserManager: one shared Playwright browser for the harness
 * process. Owns launch, navigation, interaction, and screenshot capture; the
 * plugin layer (lib/index.js) owns the HTTP routes, agent tools, and the
 * in-GUI panel.
 *
 * playwright-core is imported lazily on first launch so a missing dependency
 * degrades to a per-call error instead of failing boot. Launch is
 * auto-discovering: explicit `executablePath`/`channel` config wins, then
 * Playwright channels (msedge → chrome → chromium), then known Windows
 * browser paths (Edge, Chrome, Brave, Chromium), then any Playwright-bundled
 * chromium. No browser download is required on a machine with any of those.
 */

import { existsSync } from "node:fs";

let playwrightModule = null;

async function loadPlaywrightCore() {
  if (playwrightModule !== null) return playwrightModule;
  try {
    playwrightModule = await import("playwright-core");
    return playwrightModule;
  } catch (error) {
    throw new Error(
      "dsh-browser: playwright-core is not resolvable from the profile — re-run `dsh plugin --profile web add dsh-browser` (or `pnpm --dir <profile> add playwright-core`) and restart dsh.",
      { cause: error }
    );
  }
}

/** Best-effort page title; never throws (the page may be mid-close). */
async function safeTitle(page) {
  try {
    return await page.title();
  } catch {
    return "";
  }
}

/** Playwright channels tried, in order, when no explicit browser is configured. */
const CHROMIUM_CHANNELS = ["msedge", "chrome", "chromium"];
/** Windows install paths scanned when no channel/executable is configured. */
const WINDOWS_CHROMIUM_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "C:\\Program Files\\Chromium\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Chromium\\Application\\chrome.exe"
];
for (const local of ["Google\\Chrome\\Application\\chrome.exe", "Chromium\\Application\\chrome.exe"]) {
  if (process.env.LOCALAPPDATA) WINDOWS_CHROMIUM_CANDIDATES.push(`${process.env.LOCALAPPDATA}\\${local}`);
}

/** The ordered list of launch attempts for the given config. */
function launchAttempts(config) {
  if (config.executablePath !== undefined && config.executablePath !== null && config.executablePath !== "") {
    return [{ executablePath: config.executablePath, label: `executablePath "${config.executablePath}"` }];
  }
  if (config.channel !== undefined && config.channel !== null && config.channel !== "") {
    return [{ channel: config.channel, label: `channel "${config.channel}"` }];
  }
  const attempts = CHROMIUM_CHANNELS.map((channel) => ({ channel, label: `channel "${channel}"` }));
  if (process.platform === "win32") {
    for (const candidate of WINDOWS_CHROMIUM_CANDIDATES) {
      if (candidate.length > 0 && existsSync(candidate)) attempts.push({ executablePath: candidate, label: candidate });
    }
  }
  // Last resort: a Playwright-bundled chromium (npx playwright install chromium).
  attempts.push({ label: "Playwright-bundled chromium" });
  return attempts;
}

/** Accept a bare host as https://; otherwise pass the URL through. */
export function normalizeUrl(input) {
  const value = String(input ?? "").trim();
  if (value.length === 0) throw new Error("url must be a non-empty string");
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value) ? value : `https://${value}`;
  return new URL(withScheme).href;
}

export class BrowserManager {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
    this.rev = 0;
    this.frame = null; // { rev, buffer }
    this.launching = null;
    this.captureChain = Promise.resolve();
    this.lastError = null;
  }

  get launched() {
    return this.browser !== null && this.page !== null;
  }

  /** Ensure the browser is up; returns the live page. Serializes concurrent launches. */
  async ensurePage() {
    if (this.launched) return this.page;
    if (this.launching !== null) return this.launching;
    this.launching = this.launch().finally(() => {
      this.launching = null;
    });
    return this.launching;
  }

  async launch() {
    const pw = await loadPlaywrightCore();
    const attempts = launchAttempts(this.config);
    let lastError = null;
    for (const attempt of attempts) {
      const options = {
        headless: this.config.headless,
        args: this.config.launchArgs ?? []
      };
      if (attempt.channel !== undefined) options.channel = attempt.channel;
      else if (attempt.executablePath !== undefined) options.executablePath = attempt.executablePath;
      let browser;
      let page;
      try {
        browser = await pw.chromium.launch(options);
        page = await browser.newPage({
          viewport: { width: this.config.viewportWidth, height: this.config.viewportHeight }
        });
      } catch (error) {
        if (browser !== undefined) {
          try {
            await browser.close();
          } catch {
            // already gone
          }
        }
        lastError = error;
        continue;
      }
      this.browser = browser;
      this.page = page;
      this.lastError = null;
      page.on("close", () => {
        if (this.page === page) this.page = null;
      });
      this.bump();
      return page;
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    this.lastError = message;
    throw new Error(
      `dsh-browser: could not launch any browser (tried ${attempts.map((a) => a.label).join(", ")}). ` +
        `Last error: ${message}. Install a browser or set "channel"/"executablePath" in the profile's cordis.patch.yml.`
    );
  }

  /** Invalidate any cached frame; the panel treats a new rev as "changed". */
  bump() {
    this.rev += 1;
  }

  async state() {
    const launched = this.launched;
    let url = null;
    let title = null;
    if (launched) {
      try {
        url = this.page.url();
      } catch {
        url = null;
      }
      title = await safeTitle(this.page);
    }
    return { launched, url, title, rev: this.rev, error: this.lastError };
  }

  async navigate(input, timeoutMs) {
    const page = await this.ensurePage();
    const url = normalizeUrl(input);
    let status = null;
    let error = null;
    try {
      const response = await page.goto(url, { timeout: timeoutMs, waitUntil: "load" });
      status = response === null ? null : response.status();
    } catch (cause) {
      // Network errors/timeouts leave the page on partial content — report the
      // page state instead of losing it to an exception.
      error = cause instanceof Error ? cause.message : String(cause);
      this.lastError = error;
    }
    this.bump();
    return { url: page.url(), title: await safeTitle(page), status, ...(error !== null ? { error } : {}) };
  }

  async snapshot(maxChars) {
    const page = await this.ensurePage();
    const text = await page.evaluate(() => (document.body ? document.body.innerText : ""));
    return {
      url: page.url(),
      title: await safeTitle(page),
      text: text.slice(0, maxChars),
      truncated: text.length > maxChars
    };
  }

  /** Visible page text, unbounded (the /text route is for the GUI panel). */
  async text() {
    const page = await this.ensurePage();
    const text = await page.evaluate(() => (document.body ? document.body.innerText : ""));
    return { url: page.url(), title: await safeTitle(page), text };
  }

  /** Outer HTML of the page, capped (the /html route is for the GUI panel). */
  async html(maxChars) {
    const page = await this.ensurePage();
    const html = await page.evaluate(() => (document.documentElement ? document.documentElement.outerHTML : ""));
    return {
      url: page.url(),
      title: await safeTitle(page),
      html: html.slice(0, maxChars),
      truncated: html.length > maxChars
    };
  }

  async click(x, y) {
    const page = await this.ensurePage();
    await page.mouse.click(x, y);
    this.bump();
    return { x, y };
  }

  async clickSelector(selector, timeoutMs) {
    const page = await this.ensurePage();
    await page.click(selector, { timeout: Math.min(timeoutMs, 5000) });
    this.bump();
    return { selector };
  }

  async type(text, selector) {
    const page = await this.ensurePage();
    if (selector !== undefined && selector !== null && selector !== "") {
      await page.fill(selector, text);
    } else {
      await page.keyboard.type(text);
    }
    this.bump();
    return { chars: text.length, ...(selector !== undefined && selector !== null && selector !== "" ? { selector } : {}) };
  }

  async scroll(dx, dy) {
    const page = await this.ensurePage();
    await page.mouse.wheel(dx, dy);
    this.bump();
    return { dx, dy };
  }

  async back() {
    const page = await this.ensurePage();
    await page.goBack({ timeout: this.config.navTimeoutMs }).catch(() => null);
    this.bump();
    return { url: page.url(), title: await safeTitle(page) };
  }

  async forward() {
    const page = await this.ensurePage();
    await page.goForward({ timeout: this.config.navTimeoutMs }).catch(() => null);
    this.bump();
    return { url: page.url(), title: await safeTitle(page) };
  }

  async reload() {
    const page = await this.ensurePage();
    await page.reload({ timeout: this.config.navTimeoutMs }).catch(() => null);
    this.bump();
    return { url: page.url(), title: await safeTitle(page) };
  }

  /** Fresh JPEG capture, serialized against other captures; bumps nothing. */
  async capture() {
    const page = await this.ensurePage();
    const run = this.captureChain.then(async () => {
      const buffer = await page.screenshot({ type: "jpeg", quality: 82 });
      this.frame = { rev: this.rev, buffer };
      return buffer;
    });
    this.captureChain = run.catch(() => {});
    return run;
  }

  /** Cached frame for a given rev, or null when it does not match. */
  frameFor(rev) {
    return this.frame !== null && this.frame.rev === rev ? this.frame.buffer : null;
  }

  /** Gated page.evaluate; only reachable when config.allowEval is true. */
  async evaluate(expression) {
    const page = await this.ensurePage();
    const value = await page.evaluate(expression);
    return value;
  }

  async reset() {
    if (this.browser !== null) {
      try {
        await this.browser.close();
      } catch {
        // already gone
      }
      this.browser = null;
    }
    this.page = null;
    this.frame = null;
    this.lastError = null;
    this.bump();
  }

  async close() {
    await this.reset();
  }
}
