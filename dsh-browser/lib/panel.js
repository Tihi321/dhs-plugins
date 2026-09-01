/**
 * dsh-browser — the visible in-GUI browser panel (Codex-style).
 *
 * Served by the host plugin at /dsh-browser/panel.js and injected into the
 * served GUI index via webServer index injection. Plain vanilla JS in a
 * shadow root: no framework, no client-bundle build, full style isolation.
 *
 * It renders the agent's ACTUAL browser: the viewport image is a live JPEG
 * frame from the shared Playwright page (/dsh-browser/frame), clicks and
 * scrolls are forwarded back into that same page, and the address bar drives
 * /dsh-browser/navigate. The user sees exactly what the agent sees.
 *
 * Controls: ✕ collapses the panel, ⏻ stops the browser process, ▶ launches
 * it, the left-edge handle resizes the panel (persisted), the type box sends
 * keystrokes to the focused page element, and 📄 Read opens a text/HTML view
 * of the current page for debugging.
 */
(() => {
  const API = "/dsh-browser";
  const POLL_MS = 1500;
  const WIDTH_KEY = "dsh-browser:panelWidth";
  const WIDTH_MIN = 240;
  // Cap the split so the chat column always keeps ~35% of the viewport.
  const WIDTH_MAX = () => Math.max(360, Math.floor(window.innerWidth * 0.65));

  const root = document.getElementById("dsh-browser-root");
  if (!root) return;

  const host = root.attachShadow({ mode: "open" });
  host.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      .dshb-tab {
        position: absolute; top: 50%; right: 0; transform: translateY(-50%);
        pointer-events: auto; cursor: pointer; writing-mode: vertical-rl;
        border: 0; border-radius: 8px 0 0 8px; padding: 12px 7px;
        font: 600 12px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
        color: var(--dsw-alias-label-secondary, #8a8f98);
        background: var(--dsw-specific-menu, #1e222a);
        box-shadow: var(--dsw-shadow-lv2, 0 4px 16px rgba(0,0,0,.35));
        transition: background .12s, color .12s;
        letter-spacing: .08em;
      }
      .dshb-tab:hover { color: var(--dsw-alias-label-primary, #e6e6e6); background: var(--dsw-specific-menu-hover, #242933); }
      .dshb-panel {
        position: absolute; inset: 0; display: none; flex-direction: column;
        pointer-events: auto; overflow: hidden;
        background: var(--dsw-specific-menu, #1e222a);
        border-left: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08));
        color: var(--dsw-alias-label-primary, #e6e6e6);
        font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .dshb-panel[data-open="true"] { display: flex; }
      .dshb-resize {
        position: absolute; left: -3px; top: 0; bottom: 0; width: 6px;
        cursor: ew-resize; touch-action: none; z-index: 1;
      }
      .dshb-resize:hover { background: var(--dsw-alias-accent, #4f8cff); opacity: .6; }
      .dshb-toolbar { display: flex; align-items: center; gap: 6px; padding: 8px; border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
      .dshb-btn {
        flex: none; height: 28px; min-width: 28px; padding: 0 8px;
        border: 0; border-radius: 6px; cursor: pointer;
        background: var(--dsw-alias-fill-l2, #2a2f3a);
        color: var(--dsw-alias-label-primary, #e6e6e6);
        font: 13px/1 system-ui, sans-serif;
      }
      .dshb-btn:hover { background: var(--dsw-alias-fill-l3, #343a47); }
      .dshb-btn[data-active="true"] { background: var(--dsw-alias-accent, #4f8cff); color: #fff; }
      .dshb-address {
        flex: 1; min-width: 0; height: 28px; padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.12));
        border-radius: 6px; outline: none;
        background: var(--dsw-alias-fill-l1, #161a20);
        color: var(--dsw-alias-label-primary, #e6e6e6);
        font: 12px/1.4 ui-monospace, "Cascadia Code", Consolas, monospace;
      }
      .dshb-address:focus { border-color: var(--dsw-alias-accent, #4f8cff); }
      .dshb-actions { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
      .dshb-type {
        flex: 1; min-width: 0; height: 26px; padding: 0 8px;
        border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.12));
        border-radius: 6px; outline: none;
        background: var(--dsw-alias-fill-l1, #161a20);
        color: var(--dsw-alias-label-primary, #e6e6e6);
        font: 12px/1.4 ui-monospace, "Cascadia Code", Consolas, monospace;
      }
      .dshb-chrome { display: flex; align-items: center; gap: 8px; padding: 5px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
      .dshb-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary, #a0a5ad); font-size: 12px; }
      .dshb-status { flex: none; color: var(--dsw-alias-label-tertiary, #7a7f88); font-size: 11px; font-variant-numeric: tabular-nums; }
      .dshb-viewport { position: relative; flex: 1; min-height: 0; background: var(--dsw-alias-fill-l1, #101318); }
      .dshb-frame { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; display: none; }
      .dshb-idle { position: absolute; inset: 0; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 24px; text-align: center; color: var(--dsw-alias-label-secondary, #a0a5ad); }
      .dshb-idle strong { color: var(--dsw-alias-label-primary, #e6e6e6); font-size: 14px; }
      .dshb-idle small { font-size: 12px; line-height: 1.6; max-width: 320px; }
      .dshb-read { display: none; flex-direction: column; flex: 0 0 38%; min-height: 120px; border-top: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
      .dshb-read[data-open="true"] { display: flex; }
      .dshb-read-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
      .dshb-read-tabs { display: flex; gap: 4px; flex: 1; }
      .dshb-read-tab {
        border: 0; border-radius: 6px; padding: 3px 10px; cursor: pointer;
        background: transparent; color: var(--dsw-alias-label-tertiary, #7a7f88);
        font: 600 11px/1.6 system-ui, sans-serif;
      }
      .dshb-read-tab[data-active="true"] { background: var(--dsw-alias-fill-l2, #2a2f3a); color: var(--dsw-alias-label-primary, #e6e6e6); }
      .dshb-read-body { flex: 1; min-height: 0; overflow: auto; background: var(--dsw-alias-fill-l1, #0d1015); }
      .dshb-read-body pre { margin: 0; padding: 8px 10px; white-space: pre-wrap; word-break: break-word; font: 11px/1.5 ui-monospace, "Cascadia Code", Consolas, monospace; color: var(--dsw-alias-label-secondary, #a0a5ad); }
      .dshb-read-note { flex: none; padding: 3px 8px; color: var(--dsw-alias-label-tertiary, #7a7f88); font-size: 11px; border-top: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.08)); }
    </style>
    <button class="dshb-tab" type="button" title="Open browser">Browser</button>
    <section class="dshb-panel" data-open="false">
      <div class="dshb-resize" title="Drag to resize"></div>
      <div class="dshb-toolbar">
        <button class="dshb-btn" data-action="back" title="Back">←</button>
        <button class="dshb-btn" data-action="forward" title="Forward">→</button>
        <button class="dshb-btn" data-action="reload" title="Reload">⟳</button>
        <input class="dshb-address" type="text" spellcheck="false" placeholder="Enter URL…" />
        <button class="dshb-btn" data-action="launch" title="Launch browser">▶</button>
        <button class="dshb-btn" data-action="reset" title="Stop browser (relaunches on next use)">⏻</button>
        <button class="dshb-btn" data-action="close" title="Hide panel">✕</button>
      </div>
      <div class="dshb-actions">
        <input class="dshb-type" type="text" spellcheck="false" placeholder="Type into focused element…" />
        <button class="dshb-btn" data-action="send" title="Send keystrokes">Send</button>
        <button class="dshb-btn" data-action="read" title="Read the page (text/HTML)">📄 Read</button>
      </div>
      <div class="dshb-chrome">
        <span class="dshb-title"></span>
        <span class="dshb-status"></span>
      </div>
      <div class="dshb-viewport">
        <img class="dshb-frame" alt="Browser viewport" />
        <div class="dshb-idle">
          <strong>Browser idle</strong>
          <small>The agent launches the browser on first use — or click ▶ to open it now. Your clicks and scrolls here control the same page the agent sees.</small>
        </div>
      </div>
      <div class="dshb-read" data-open="false">
        <div class="dshb-read-head">
          <div class="dshb-read-tabs">
            <button class="dshb-read-tab" data-tab="text" data-active="true">Text</button>
            <button class="dshb-read-tab" data-tab="html">HTML</button>
          </div>
          <button class="dshb-btn" data-action="copy" title="Copy to clipboard">Copy</button>
          <button class="dshb-btn" data-action="refresh-read" title="Refresh">⟳</button>
        </div>
        <div class="dshb-read-body"><pre></pre></div>
        <div class="dshb-read-note"></div>
      </div>
    </section>
  `;

  const $ = (selector) => host.querySelector(selector);
  const tab = $(".dshb-tab");
  const panel = $(".dshb-panel");
  const urlInput = $(".dshb-address");
  const typeInput = $(".dshb-type");
  const titleEl = $(".dshb-title");
  const statusEl = $(".dshb-status");
  const idleEl = $(".dshb-idle");
  const img = $(".dshb-frame");
  const readEl = $(".dshb-read");
  const readBody = $(".dshb-read-body pre");
  const readNote = $(".dshb-read-note");
  const readTabs = Array.from(host.querySelectorAll(".dshb-read-tab"));
  const resizeEl = $(".dshb-resize");

  let open = false;
  let lastRev = null;
  let force = false;
  let timer = null;
  let readOpen = false;
  let readTab = "text";
  let lastReadRev = null;

  // ── panel width (persisted, drag-resizable) ──────────────────────────────
  function applyWidth() {
    const stored = Number(localStorage.getItem(WIDTH_KEY));
    const width = Number.isFinite(stored) && stored >= WIDTH_MIN ? Math.min(stored, WIDTH_MAX()) : null;
    document.documentElement.style.setProperty("--dshb-split", width === null ? "" : `${width}px`);
  }
  applyWidth();
  window.addEventListener("resize", applyWidth);

  resizeEl.addEventListener("pointerdown", (event) => {
    const startX = event.clientX;
    const startWidth = root.getBoundingClientRect().width;
    resizeEl.setPointerCapture(event.pointerId);
    const move = (moveEvent) => {
      const next = Math.max(WIDTH_MIN, Math.min(WIDTH_MAX(), startWidth + (startX - moveEvent.clientX)));
      document.documentElement.style.setProperty("--dshb-split", `${next}px`);
    };
    const up = (upEvent) => {
      resizeEl.releasePointerCapture(upEvent.pointerId);
      resizeEl.removeEventListener("pointermove", move);
      resizeEl.removeEventListener("pointerup", up);
      resizeEl.removeEventListener("pointercancel", up);
      localStorage.setItem(WIDTH_KEY, String(Math.round(root.getBoundingClientRect().width)));
    };
    resizeEl.addEventListener("pointermove", move);
    resizeEl.addEventListener("pointerup", up);
    resizeEl.addEventListener("pointercancel", up);
  });

  // ── open/close ─────────────────────────────────────────────────────────────
  function setOpen(value) {
    open = value;
    root.dataset.open = String(value);
    panel.dataset.open = String(value);
    tab.style.display = value ? "none" : "";
    // Split view: the app shrinks to the left, the browser docks on the right.
    document.documentElement.classList.toggle("dshb-split", value);
    if (value) {
      refresh();
      if (timer === null) timer = setInterval(refresh, POLL_MS);
    } else if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  async function api(path, options) {
    const res = await fetch(`${API}${path}`, options);
    let body = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON response (image bytes)
    }
    if (!res.ok) throw new Error((body && body.error) || `HTTP ${res.status}`);
    return body;
  }

  async function refresh() {
    if (document.hidden) return;
    try {
      const state = await api("/state");
      if (state.url && document.activeElement !== urlInput) urlInput.value = state.url;
      titleEl.textContent = state.title || "";
      statusEl.textContent = state.error
        ? `⚠ ${state.error}`
        : state.launched
          ? "live"
          : "idle";
      if (!state.launched) {
        idleEl.style.display = "flex";
        img.style.display = "none";
        return;
      }
      idleEl.style.display = "none";
      img.style.display = "block";
      if (force || state.rev !== lastRev) {
        lastRev = state.rev;
        img.src = `${API}/frame?ts=${state.rev}`;
      }
      force = false;
      if (readOpen && state.rev !== lastReadRev) loadRead();
    } catch (error) {
      statusEl.textContent = `⚠ ${error.message}`;
    }
  }

  async function act(path, payload) {
    try {
      await api(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload ?? {})
      });
    } catch (error) {
      statusEl.textContent = `⚠ ${error.message}`;
    }
    force = true;
    await refresh();
  }

  // ── read pane (text / html) ────────────────────────────────────────────────
  function setReadOpen(value) {
    readOpen = value;
    readEl.dataset.open = String(value);
    if (value) {
      lastReadRev = null;
      loadRead();
    }
  }

  async function loadRead() {
    const requested = readTab;
    readNote.textContent = "Loading…";
    try {
      const result = await api(requested === "html" ? "/html" : "/text");
      if (requested !== readTab) return; // tab switched mid-flight
      lastReadRev = lastRev;
      readBody.textContent = requested === "html" ? result.html : result.text;
      readNote.textContent = requested === "html"
        ? `${result.html.length} chars${result.truncated ? " (truncated)" : ""}`
        : `${result.text.length} chars`;
    } catch (error) {
      if (requested !== readTab) return;
      readBody.textContent = "";
      readNote.textContent = `⚠ ${error.message}`;
    }
  }

  // ── events ─────────────────────────────────────────────────────────────────
  tab.addEventListener("click", () => setOpen(true));

  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close") setOpen(false);
    else if (action === "launch") void act("/launch");
    else if (action === "reset") void act("/reset");
    else if (action === "back") void act("/back");
    else if (action === "forward") void act("/forward");
    else if (action === "reload") void act("/reload");
    else if (action === "send") {
      const text = typeInput.value;
      if (text) {
        void act("/type", { text });
        typeInput.value = "";
      }
    } else if (action === "read") setReadOpen(!readOpen);
    else if (action === "refresh-read") loadRead();
    else if (action === "copy") {
      const text = readBody.textContent ?? "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        void navigator.clipboard.writeText(text).catch(() => {});
      }
    }
  });

  readTabs.forEach((tabButton) => {
    tabButton.addEventListener("click", () => {
      readTab = tabButton.dataset.tab;
      readTabs.forEach((other) => {
        other.dataset.active = String(other === tabButton);
      });
      lastReadRev = null;
      loadRead();
    });
  });

  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const url = urlInput.value.trim();
      if (url) void act("/navigate", { url });
    }
  });

  typeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const text = typeInput.value;
      if (text) {
        void act("/type", { text });
        typeInput.value = "";
      }
    }
  });

  img.addEventListener("click", (event) => {
    const rect = img.getBoundingClientRect();
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (iw === 0 || ih === 0) return;
    const scale = Math.min(rect.width / iw, rect.height / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (rect.width - dw) / 2;
    const dy = (rect.height - dh) / 2;
    const x = Math.max(0, Math.min(iw - 1, Math.round((event.clientX - rect.left - dx) / scale)));
    const y = Math.max(0, Math.min(ih - 1, Math.round((event.clientY - rect.top - dy) / scale)));
    void act("/click", { x, y });
  });

  img.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      void act("/scroll", { dx: Math.round(event.deltaX), dy: Math.round(event.deltaY) });
    },
    { passive: false }
  );

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && open) refresh();
  });

  setOpen(false);
  // Deep link: ?dshb=1 opens the panel (also handy for automated checks).
  if (new URLSearchParams(window.location.search).get("dshb") === "1") setOpen(true);
})();
