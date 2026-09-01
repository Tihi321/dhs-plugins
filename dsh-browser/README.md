# dsh-browser

A built-in browser for DeepSeek Harness (web surface), Codex-style:

- **Visible in-GUI panel** — a collapsible browser pane on the right edge of the
  web app at `http://127.0.0.1:3080`, showing the agent's live page (JPEG frame
  stream) with an address bar, back/forward/reload, click-through and
  scroll-through. What you click is what the agent's browser sees.
- **Agent browser tools** — `browser_navigate`, `browser_snapshot`,
  `browser_click_selector`, `browser_click`, `browser_type`, `browser_scroll`,
  `browser_back`, `browser_forward`, `browser_reload`, `browser_screenshot`,
  and (gated) `browser_eval`.
- **One shared browser** — the panel and the tools drive the same Playwright
  page, so the GUI always shows exactly what the agent is browsing.

It is a DSH plugin **bundle**: an npm package that declares
`dsh.bundle.patch` and inserts one host plugin row. The panel itself is
injected into the served GUI index through the harness's `webserver/index-inject`
escape hatch — no client-bundle rebuild is needed.

## Install

From a terminal (network required once, to fetch `playwright-core`):

```sh
dsh plugin --profile web add file:C:\projects\Local\DSH\dsh-browser
```

Then restart `dsh web` and refresh the GUI. A vertical **Browser** tab appears
on the right edge; click it to open the panel. The browser launches on first
use — no configuration needed: the plugin auto-discovers your installed
browser (Edge → Chrome → Brave → Chromium → a Playwright-bundled chromium),
so no browser download is required.

## Configuration

Override rows in the profile's patch layers (e.g.
`C:\Users\<you>\.dsh\profiles\web\cordis.patch.yml`):

```yaml
- id: dsh-browser
  config:
    headless: true
    # channel: msedge        # force a channel: msedge | chrome | chromium
    # executablePath: 'C:\path\to\browser.exe'   # absolute path (wins over channel)
    viewportWidth: 1280
    viewportHeight: 800
    navTimeoutMs: 30000
    snapshotMaxChars: 12000
    allowEval: false       # enable the gated browser_eval tool + /eval route
```

If no browser can be launched, the error message tells you exactly which config
key to set (`channel` or `executablePath`).

## How it works

| Piece | Location | Mechanism |
|---|---|---|
| Browser service | `lib/manager.js` | lazy Playwright page; one per harness process |
| HTTP API | `lib/index.js` | prefix route `/dsh-browser/*` on the harness webServer |
| Visible panel | `lib/panel.js` | shadow-DOM panel injected via `webserver/index-inject` |
| Agent tools | `lib/index.js` | `ctx.tools.register(defineTool(...))` + prompt section |

`/dsh-browser` is a distinct prefix — the harness reserves `/api` and
`/plugins`. Frames are JPEG captures with a `rev` counter; the panel only
refetches when the page changes.

## Split view

Opening the panel puts the GUI into a **split layout**: the app (conversation
+ input) shrinks to the left and the browser docks on the right — no overlay.
The drag handle on the panel's left edge resizes the split (240px – 65% of
the window) and the width is remembered. `?dshb=1` in the URL opens the
panel automatically.

## Development

```sh
node scripts/smoke.mjs   # offline wiring + HTTP behavior checks
```

`dsh plugin ... add file:...` installs a **copy** of this folder into the
profile. After editing the source, refresh it with
`dsh plugin --profile web remove dsh-browser` followed by the same `add`
(pnpm's `file:` store can reuse a stale copy), then restart `dsh web`.

## Security notes

- Endpoints are same-origin on the local web app and carry no auth — the same
  trust model as the rest of the GUI.
- `browser_eval` / page JavaScript evaluation is disabled by default
  (`allowEval: false`).
- Browsing is un-sandboxed by design (it is a real browser). Treat
  credentials entered in it as you would in any browser.
