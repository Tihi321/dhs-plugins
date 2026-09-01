/**
 * dsh-theme-selector — theme selector for DeepSeek Harness (web surface).
 *
 * Host half: owns the durable settings namespace that remembers the chosen
 * theme ("system" = the built-in DSH theme, "claude-code" = the Claude Code
 * look, or a user-added custom theme id) and the roster of user-added custom
 * themes (name + hex colors). The browser half (lib/client.js) registers the
 * claude-code theme, re-registers stored custom themes, and renders a Theme
 * section (below Plugins) with per-theme color swatches and a manual theme
 * builder.
 *
 * @module dsh-theme-selector
 */
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";

/** Cordis plugin name used by loader diagnostics. */
export const name = "dsh-theme-selector";

/** Settings namespace owning the persisted theme choice. */
export const THEME_SELECTOR_NAMESPACE = settingsNamespace("dsh-theme-selector");
/** Field carrying the selected theme id. */
export const THEME_SELECTOR_FIELD = "theme";
/** Field carrying the user-added custom themes. */
export const CUSTOM_THEMES_FIELD = "customThemes";
/** Color keys every custom theme stores. */
export const THEME_COLOR_KEYS = ["background", "surface", "text", "accent"];
/**
 * Durable theme schema; also the wire envelope the browser scope validates
 * against. `theme` is the active choice; `customThemes` is the user's own
 * roster (each entry carries its id, display name, and hex colors).
 */
export const ThemeSelectorSchema = z.object({
  [THEME_SELECTOR_FIELD]: z.string().default("system"),
  [CUSTOM_THEMES_FIELD]: z.array(z.object({
    id: z.string().required(),
    name: z.string().required(),
    colors: z.object({
      background: z.string().required(),
      surface: z.string().required(),
      text: z.string().required(),
      accent: z.string().required()
    }).required()
  })).default([])
});

/** Register the durable theme section when the optional settings service is composed. */
export function apply(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    settingsCtx.settings.register(THEME_SELECTOR_NAMESPACE, ThemeSelectorSchema);
  });
}
