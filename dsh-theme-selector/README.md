# dsh-theme-selector

A theme manager for DeepSeek Harness (web surface): a **Theme** settings
section (in Settings, below Plugins) with the built-in DSH theme, a
**Claude Code**-style dark theme, and user-added custom themes.

- **Theme cards** — each theme shows its name and, below it, the colors it
  uses as swatch boxes with hex labels (background / surface / text / accent).
- **One-click switching** — click a card to apply that theme immediately.
- **Manual themes** — add your own from a name and four hex colors; each hex
  field has a live color-preview box next to the input. Custom themes can be
  deleted again.
- **Remembered** — the choice and the custom-theme roster are stored in the
  Host settings document (`dsh-theme-selector.theme` / `.customThemes`) and
  re-applied on the next load.

It is a DSH plugin **bundle** with a client half: the bundle patch inserts one
loader row, and the client half (`dsh.client` declaration + `lib/client.js`)
registers the themes and the settings section in the browser. No client-bundle
rebuild is needed — client-modules serves the bundle at
`/plugins/dsh-theme-selector/client.js`.

## Install

```sh
dsh plugin --profile web add file:C:\projects\Local\DSH\dsh-theme-selector
```

Then restart `dsh web` and refresh the GUI. Open **Settings** (the gear at the
bottom of the sidebar) → **Theme** (below Plugins).

## How it works

| Piece | Location | Mechanism |
|---|---|---|
| Durable choice + roster | `lib/index.js` | `dsh-theme-selector` settings namespace (`theme`, `customThemes`) |
| Claude Code theme | `lib/client.js` | `ctx.theme.register({ id: 'claude-code', colorScheme: 'dark', tokens })` |
| Custom themes | `lib/client.js` | registered from hex colors via derived `--dsw-alias-*` token layers |
| Settings section | `lib/client.js` | `settings.section` entry (order 18, below Plugins) with swatches + add form |

The Claude Code palette is a token layer over the built-in dark theme; custom
themes derive their surfaces from the four entered colors (CSS `color-mix`),
so the whole UI stays coherent with just background / surface / text / accent.

## Development

After editing the source, refresh the installed copy:

```sh
dsh plugin --profile web remove dsh-theme-selector
dsh plugin --profile web add file:C:\projects\Local\DSH\dsh-theme-selector
```

then restart `dsh web`.
