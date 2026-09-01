# dsh-plugins

A collection of DeepSeek Harness (DSH) plugin bundles. Each subfolder is a
standalone DSH plugin you can install into a profile with:

```sh
dsh plugin --profile web add file:<path-to-this-folder>
```

Then restart `dsh web` (a client-bundle rebuild is not needed — client-modules
serves each plugin's browser half at `/plugins/<id>/client.js`).

## Plugins

| Plugin | What it adds | Install |
|---|---|---|
| [`dsh-browser`](./dsh-browser) | Built-in browser: a visible in-GUI browser panel + agent browser tools (`browser_navigate`, `browser_snapshot`, …), Codex-style. | `dsh plugin --profile web add file:.<path>` → `dsh-browser` |
| [`dsh-theme-selector`](./dsh-theme-selector) | A **Theme** settings section (below Plugins) with the built-in DSH theme, Claude Code, user-added custom themes (name + hex colors with live previews), and per-theme color swatches. | `dsh plugin --profile web add file:.<path>` → `dsh-theme-selector` |

## Install one plugin

```sh
# from the plugin folder you want
dsh plugin --profile web add file:C:\path\to\this\repo\dsh-theme-selector
```

The `web` profile picks the plugin up on the next `dsh web` start. See each
plugin's README for specifics.

## New plugins

Add a subfolder following the same layout: a `package.json` with a
`dsh.bundle.patch` (host patch) and, for browser-side plugins, a `dsh.client`
declaration plus a `./client` bundle served by client-modules. Add a row to
this README's table.
