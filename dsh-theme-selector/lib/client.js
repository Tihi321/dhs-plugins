window.__ModuleLoader__.load({
	id: "dsh-theme-selector",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region section css
		/**
		* Theme settings section (nav order 18, below Plugins): theme cards with
		* their color swatches under the name, plus a manual theme builder whose
		* hex fields each carry a live color-preview box.
		*/
		const css = "._dshTS_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}._dshTS_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}._dshTS_intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}._dshTS_list{flex-direction:column;gap:10px;display:flex}._dshTS_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;cursor:pointer;flex-direction:column;gap:10px;padding:12px 14px;display:flex;outline:none}._dshTS_card:hover{border-color:var(--dsw-alias-border-l3)}._dshTS_card:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 18%,transparent)}._dshTS_card[data-active=true]{border-color:var(--dsw-alias-brand-primary)}._dshTS_cardNameRow{flex-direction:row;align-items:center;gap:8px;display:flex}._dshTS_cardName{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}._dshTS_cardCheck{color:var(--dsw-alias-brand-primary);flex:none}._dshTS_swatchRow{flex-wrap:wrap;align-items:stretch;gap:10px;display:flex}._dshTS_swatch{flex-direction:column;align-items:flex-start;gap:4px;min-width:56px;display:flex}._dshTS_swatchBox{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;width:48px;height:32px;display:inline-block}._dshTS_swatchHex{color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,\"SF Mono\",Consolas,monospace);font-size:11px;line-height:16px}._dshTS_delete{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-state-error-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:3px 10px;font-size:12px;line-height:18px}._dshTS_delete:hover{background:var(--dsw-alias-interactive-bg-hover-danger)}._dshTS_form{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;flex-direction:column;gap:12px;padding:14px;display:flex}._dshTS_formTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:500;line-height:22px}._dshTS_field{flex-direction:column;gap:6px;display:flex}._dshTS_fieldLabel{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}._dshTS_textInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;height:36px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 12px;font-size:13px}._dshTS_textInput::placeholder{color:var(--dsw-alias-label-tertiary)}._dshTS_textInput:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 18%,transparent)}._dshTS_hexRow{flex-direction:row;align-items:center;gap:10px;display:flex}._dshTS_hexInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:150px;height:36px;color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,\"SF Mono\",Consolas,monospace);font-size:13px;border-radius:8px;outline:none;padding:0 12px}._dshTS_hexInput::placeholder{color:var(--dsw-alias-label-tertiary)}._dshTS_hexInput:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-business-primary) 18%,transparent)}._dshTS_previewBox{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;flex:none;width:36px;height:36px;display:inline-block}._dshTS_actions{flex-direction:row;justify-content:flex-end;gap:8px;display:flex}._dshTS_addButton{box-sizing:border-box;height:36px;font:inherit;cursor:pointer;border:none;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:0 16px;font-size:14px;line-height:22px;display:inline-flex;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}._dshTS_addButton:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}._dshTS_addButton:disabled{opacity:.5;cursor:default}._dshTS_error{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}";
		const tagId = "dsh-theme-selector/section.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-theme-selector";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles = {
			"actions": "_dshTS_actions",
			"addButton": "_dshTS_addButton",
			"card": "_dshTS_card",
			"cardCheck": "_dshTS_cardCheck",
			"cardName": "_dshTS_cardName",
			"cardNameRow": "_dshTS_cardNameRow",
			"delete": "_dshTS_delete",
			"error": "_dshTS_error",
			"field": "_dshTS_field",
			"fieldLabel": "_dshTS_fieldLabel",
			"form": "_dshTS_form",
			"formTitle": "_dshTS_formTitle",
			"hexInput": "_dshTS_hexInput",
			"hexRow": "_dshTS_hexRow",
			"intro": "_dshTS_intro",
			"list": "_dshTS_list",
			"previewBox": "_dshTS_previewBox",
			"section": "_dshTS_section",
			"swatch": "_dshTS_swatch",
			"swatchBox": "_dshTS_swatchBox",
			"swatchHex": "_dshTS_swatchHex",
			"swatchRow": "_dshTS_swatchRow",
			"textInput": "_dshTS_textInput",
			"title": "_dshTS_title"
		};
		//#endregion
		//#region clsx (vendored, matching the compiled bundle convention)
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region theme-settings
		/** Settings namespace owned by this plugin (host side registers it). */
		const THEME_SELECTOR_NAMESPACE = "dsh-theme-selector";
		/** Field carrying the selected theme id. */
		const THEME_SELECTOR_FIELD = "theme";
		/** Field carrying the user-added custom themes. */
		const CUSTOM_THEMES_FIELD = "customThemes";
		/** Color keys every custom theme stores (order shown in the form). */
		const COLOR_KEYS = ["background", "surface", "text", "accent"];
		/** Registered theme id for the Claude Code look. */
		const CLAUDE_CODE_THEME_ID = "claude-code";
		//#endregion
		//#region claude-code tokens
		/**
		* Claude Code palette as alias-token overrides. The theme is dark-only;
		* the presenter consumes the `dark` member (the theme's colorScheme), and
		* the `light` member is required by the override validator but unused.
		*/
		const CLAUDE_CODE_TOKENS = {
			"--dsw-alias-bg-base": { light: "#262624", dark: "#262624" },
			"--dsw-alias-bg-layer-1": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-bg-layer-2": { light: "#30302c", dark: "#30302c" },
			"--dsw-alias-bg-layer-3": { light: "#232220", dark: "#232220" },
			"--dsw-alias-bg-mask-1": { light: "rgba(0,0,0,0.60)", dark: "rgba(0,0,0,0.60)" },
			"--dsw-alias-bg-mask-2": { light: "rgba(0,0,0,0.30)", dark: "rgba(0,0,0,0.30)" },
			"--dsw-alias-bg-mask-3": { light: "rgba(0,0,0,0.78)", dark: "rgba(0,0,0,0.78)" },
			"--dsw-alias-bg-mask-drop": { light: "rgba(0,0,0,0.86)", dark: "rgba(0,0,0,0.86)" },
			"--dsw-alias-bg-mask-photo": { light: "rgba(0,0,0,0.90)", dark: "rgba(0,0,0,0.90)" },
			"--dsw-alias-bg-module-platform": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-bg-multi-select": { light: "#33312e", dark: "#33312e" },
			"--dsw-alias-bg-overlay": { light: "#35332f", dark: "#35332f" },
			"--dsw-alias-bg-skeleton": { light: "rgba(255,255,255,0.08)", dark: "rgba(255,255,255,0.08)" },
			"--dsw-alias-border-inverted": { light: "rgba(255,255,255,0.10)", dark: "rgba(255,255,255,0.10)" },
			"--dsw-alias-border-inverted2": { light: "rgba(255,255,255,0.14)", dark: "rgba(255,255,255,0.14)" },
			"--dsw-alias-border-l1": { light: "rgba(255,255,255,0.08)", dark: "rgba(255,255,255,0.08)" },
			"--dsw-alias-border-l2": { light: "rgba(255,255,255,0.14)", dark: "rgba(255,255,255,0.14)" },
			"--dsw-alias-border-l2-darkmode-thin": { light: "rgba(255,255,255,0.07)", dark: "rgba(255,255,255,0.07)" },
			"--dsw-alias-border-l3": { light: "rgba(255,255,255,0.20)", dark: "rgba(255,255,255,0.20)" },
			"--dsw-alias-border-l4": { light: "rgba(255,255,255,0.28)", dark: "rgba(255,255,255,0.28)" },
			"--dsw-alias-brand-primary": { light: "#d97757", dark: "#d97757" },
			"--dsw-alias-brand-primary-invert": { light: "#f0eee6", dark: "#f0eee6" },
			"--dsw-alias-brand-primary-new-colorprimary-new-color": { light: "#d97757", dark: "#d97757" },
			"--dsw-alias-brand-text": { light: "#f0eee6", dark: "#f0eee6" },
			"--dsw-alias-button-contrast-fill": { light: "#f0eee6", dark: "#f0eee6" },
			"--dsw-alias-button-elevated-fill": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-button-floating-fill": { light: "#30302c", dark: "#30302c" },
			"--dsw-alias-button-floating-hover": { light: "#35332f", dark: "#35332f" },
			"--dsw-alias-button-ghost-active-border": { light: "rgba(255,255,255,0.30)", dark: "rgba(255,255,255,0.30)" },
			"--dsw-alias-button-ghost-active-fill": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-button-ghost-active-hover": { light: "#30302c", dark: "#30302c" },
			"--dsw-alias-button-info-fill": { light: "#d97757", dark: "#d97757" },
			"--dsw-alias-button-info-hover": { light: "#e08a6d", dark: "#e08a6d" },
			"--dsw-alias-button-primary-dimmed": { light: "#3a3a35", dark: "#3a3a35" },
			"--dsw-alias-button-primary-fill": { light: "#d97757", dark: "#d97757" },
			"--dsw-alias-button-primary-hover": { light: "#e08a6d", dark: "#e08a6d" },
			"--dsw-alias-button-tool-bar-fill": { light: "rgba(255,255,255,0.12)", dark: "rgba(255,255,255,0.12)" },
			"--dsw-alias-button-tool-bar-fill-invisible": { light: "rgba(255,255,255,0.05)", dark: "rgba(255,255,255,0.05)" },
			"--dsw-alias-button-tool-bar-hover": { light: "rgba(255,255,255,0.18)", dark: "rgba(255,255,255,0.18)" },
			"--dsw-alias-interactive-bg-active": { light: "rgba(255,255,255,0.10)", dark: "rgba(255,255,255,0.10)" },
			"--dsw-alias-interactive-bg-hover": { light: "rgba(255,255,255,0.06)", dark: "rgba(255,255,255,0.06)" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "rgba(217,119,87,0.14)", dark: "rgba(217,119,87,0.14)" },
			"--dsw-alias-interactive-bg-hover-danger": { light: "rgba(229,72,77,0.14)", dark: "rgba(229,72,77,0.14)" },
			"--dsw-alias-interactive-bg-hover-solid": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-label-caption": { light: "#8a8884", dark: "#8a8884" },
			"--dsw-alias-label-dimmed": { light: "#6f6d69", dark: "#6f6d69" },
			"--dsw-alias-label-primary": { light: "#f0eee6", dark: "#f0eee6" },
			"--dsw-alias-label-primary-bluish": { light: "#f0eee6", dark: "#f0eee6" },
			"--dsw-alias-label-primary-dimmed": { light: "#d6d3cc", dark: "#d6d3cc" },
			"--dsw-alias-label-primary-foreground": { light: "#262624", dark: "#262624" },
			"--dsw-alias-label-primary-inverted": { light: "#262624", dark: "#262624" },
			"--dsw-alias-label-secondary": { light: "#b0aeaa", dark: "#b0aeaa" },
			"--dsw-alias-label-tertiary": { light: "#8a8884", dark: "#8a8884" },
			"--dsw-alias-markdown-citation": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-alias-markdown-code-block": { light: "#1a1a18", dark: "#1a1a18" },
			"--dsw-alias-markdown-code-block-banner": { light: "#232220", dark: "#232220" },
			"--dsw-alias-markdown-code-segment-selected": { light: "#30302c", dark: "#30302c" },
			"--dsw-alias-markdown-code-segment-unselected": { light: "#1a1a18", dark: "#1a1a18" },
			"--dsw-alias-markdown-inline-code": { light: "#33312e", dark: "#33312e" },
			"--dsw-alias-markdown-placeholder": { light: "#33312e", dark: "#33312e" },
			"--dsw-alias-markdown-tag": { light: "#33312e", dark: "#33312e" },
			"--dsw-alias-scrollbar-bg-l1": { light: "#3f3e3a", dark: "#3f3e3a" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#33312e", dark: "#33312e" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#4a4844", dark: "#4a4844" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#3f3e3a", dark: "#3f3e3a" },
			"--dsw-alias-state-business-primary": { light: "#d97757", dark: "#d97757" },
			"--dsw-alias-state-business-tertiary": { light: "#3a2a22", dark: "#3a2a22" },
			"--dsw-alias-state-error-primary": { light: "#e5484d", dark: "#e5484d" },
			"--dsw-alias-state-error-secondary": { light: "#e5484d", dark: "#e5484d" },
			"--dsw-alias-state-success-primary": { light: "#46a758", dark: "#46a758" },
			"--dsw-alias-state-success-secondary": { light: "#46a758", dark: "#46a758" },
			"--dsw-alias-state-success-tertiary": { light: "#233c2c", dark: "#233c2c" },
			"--dsw-alias-state-warn-label": { light: "#f5a524", dark: "#f5a524" },
			"--dsw-alias-state-warn-primary": { light: "#f5a524", dark: "#f5a524" },
			"--dsw-alias-state-warn-secondary": { light: "#ffb454", dark: "#ffb454" },
			"--dsw-alias-state-warn-tertiary": { light: "#27241f", dark: "#27241f" },
			"--dsw-alias-toast-bg": { light: "#35332f", dark: "#35332f" },
			"--dsw-alias-tooltip-bg": { light: "#35332f", dark: "#35332f" },
			"--dsw-specific-bubble": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-specific-bubble-highlight": { light: "#33312e", dark: "#33312e" },
			"--dsw-specific-input-major": { light: "#262624", dark: "#262624" },
			"--dsw-specific-login-input": { light: "#232220", dark: "#232220" },
			"--dsw-specific-menu": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-specific-selector": { light: "#2a2a27", dark: "#2a2a27" },
			"--dsw-specific-sidebar-fill": { light: "#1f1e1b", dark: "#1f1e1b" },
			"--dsw-specific-sidebar-nav-item-active": { light: "#33312e", dark: "#33312e" },
			"--dsw-specific-sidebar-nav-item-active-accent": { light: "#d97757", dark: "#d97757" },
			"--dsw-specific-sidebar-nav-item-hover": { light: "rgba(255,255,255,0.06)", dark: "rgba(255,255,255,0.06)" },
			"--dsw-specific-tip": { light: "#2a2a27", dark: "#2a2a27" }
		};
		//#endregion
		//#region custom-theme helpers
		/**
		* Build the alias-token layer for one custom theme from its four hex
		* colors. Derived surfaces use CSS color-mix over the raw colors so the
		* rest of the UI stays coherent without extra inputs.
		* @param colors - the four user-entered hex colors.
		* @returns token-name → { light, dark } pairs for theme.register.
		*/
		function buildCustomTokens(colors) {
			const pair = (value) => ({ light: value, dark: value });
			const mix = (a, pct, b = "transparent") => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
			const bg = colors.background;
			const surface = colors.surface;
			const text = colors.text;
			const accent = colors.accent;
			return {
				"--dsw-alias-bg-base": pair(bg),
				"--dsw-alias-bg-layer-1": pair(surface),
				"--dsw-alias-bg-layer-2": pair(mix(surface, 82, bg)),
				"--dsw-alias-bg-layer-3": pair(mix(surface, 60, bg)),
				"--dsw-alias-bg-mask-1": pair("rgba(0,0,0,0.60)"),
				"--dsw-alias-bg-mask-2": pair("rgba(0,0,0,0.30)"),
				"--dsw-alias-bg-mask-3": pair("rgba(0,0,0,0.78)"),
				"--dsw-alias-bg-mask-drop": pair("rgba(0,0,0,0.86)"),
				"--dsw-alias-bg-mask-photo": pair("rgba(0,0,0,0.90)"),
				"--dsw-alias-bg-module-platform": pair(surface),
				"--dsw-alias-bg-multi-select": pair(mix(surface, 92, bg)),
				"--dsw-alias-bg-overlay": pair(mix(surface, 88, bg)),
				"--dsw-alias-bg-skeleton": pair(mix(text, 8, "transparent")),
				"--dsw-alias-border-inverted": pair(mix(text, 10, "transparent")),
				"--dsw-alias-border-inverted2": pair(mix(text, 14, "transparent")),
				"--dsw-alias-border-l1": pair(mix(text, 12, "transparent")),
				"--dsw-alias-border-l2": pair(mix(text, 20, "transparent")),
				"--dsw-alias-border-l2-darkmode-thin": pair(mix(text, 10, "transparent")),
				"--dsw-alias-border-l3": pair(mix(text, 28, "transparent")),
				"--dsw-alias-border-l4": pair(mix(text, 36, "transparent")),
				"--dsw-alias-brand-primary": pair(accent),
				"--dsw-alias-brand-primary-invert": pair(text),
				"--dsw-alias-brand-primary-new-colorprimary-new-color": pair(accent),
				"--dsw-alias-brand-text": pair(text),
				"--dsw-alias-button-contrast-fill": pair(text),
				"--dsw-alias-button-elevated-fill": pair(surface),
				"--dsw-alias-button-floating-fill": pair(mix(surface, 92, bg)),
				"--dsw-alias-button-floating-hover": pair(mix(surface, 84, bg)),
				"--dsw-alias-button-ghost-active-border": pair(mix(text, 30, "transparent")),
				"--dsw-alias-button-ghost-active-fill": pair(surface),
				"--dsw-alias-button-ghost-active-hover": pair(mix(surface, 84, bg)),
				"--dsw-alias-button-info-fill": pair(accent),
				"--dsw-alias-button-info-hover": pair(mix(accent, 86, bg)),
				"--dsw-alias-button-primary-dimmed": pair(mix(accent, 34, bg)),
				"--dsw-alias-button-primary-fill": pair(accent),
				"--dsw-alias-button-primary-hover": pair(mix(accent, 86, bg)),
				"--dsw-alias-button-tool-bar-fill": pair(mix(text, 12, "transparent")),
				"--dsw-alias-button-tool-bar-fill-invisible": pair(mix(text, 5, "transparent")),
				"--dsw-alias-button-tool-bar-hover": pair(mix(text, 18, "transparent")),
				"--dsw-alias-interactive-bg-active": pair(mix(text, 10, "transparent")),
				"--dsw-alias-interactive-bg-hover": pair(mix(text, 6, "transparent")),
				"--dsw-alias-interactive-bg-hover-accent": pair(mix(accent, 14, "transparent")),
				"--dsw-alias-interactive-bg-hover-danger": pair(mix("#e5484d", 14, "transparent")),
				"--dsw-alias-interactive-bg-hover-solid": pair(surface),
				"--dsw-alias-label-caption": pair(mix(text, 52, bg)),
				"--dsw-alias-label-dimmed": pair(mix(text, 42, bg)),
				"--dsw-alias-label-primary": pair(text),
				"--dsw-alias-label-primary-bluish": pair(text),
				"--dsw-alias-label-primary-dimmed": pair(mix(text, 84, bg)),
				"--dsw-alias-label-primary-foreground": pair(bg),
				"--dsw-alias-label-primary-inverted": pair(bg),
				"--dsw-alias-label-secondary": pair(mix(text, 72, bg)),
				"--dsw-alias-label-tertiary": pair(mix(text, 52, bg)),
				"--dsw-alias-markdown-citation": pair(surface),
				"--dsw-alias-markdown-code-block": pair(mix(bg, 88, surface)),
				"--dsw-alias-markdown-code-block-banner": pair(mix(surface, 48, bg)),
				"--dsw-alias-markdown-code-segment-selected": pair(mix(surface, 92, bg)),
				"--dsw-alias-markdown-code-segment-unselected": pair(mix(bg, 88, surface)),
				"--dsw-alias-markdown-inline-code": pair(mix(surface, 62, bg)),
				"--dsw-alias-markdown-placeholder": pair(mix(bg, 92, surface)),
				"--dsw-alias-markdown-tag": pair(mix(surface, 62, bg)),
				"--dsw-alias-scrollbar-bg-l1": pair(mix(bg, 60, surface)),
				"--dsw-alias-scrollbar-bg-l2": pair(mix(surface, 46, bg)),
				"--dsw-alias-scrollbar-hover-l1": pair(mix(surface, 30, bg)),
				"--dsw-alias-scrollbar-hover-l2": pair(mix(bg, 60, surface)),
				"--dsw-alias-state-business-primary": pair(accent),
				"--dsw-alias-state-business-tertiary": pair(mix(accent, 30, bg)),
				"--dsw-alias-state-error-primary": pair("#e5484d"),
				"--dsw-alias-state-error-secondary": pair("#e5484d"),
				"--dsw-alias-state-success-primary": pair("#46a758"),
				"--dsw-alias-state-success-secondary": pair("#46a758"),
				"--dsw-alias-state-success-tertiary": pair("#233c2c"),
				"--dsw-alias-state-warn-label": pair("#f5a524"),
				"--dsw-alias-state-warn-primary": pair("#f5a524"),
				"--dsw-alias-state-warn-secondary": pair("#ffb454"),
				"--dsw-alias-state-warn-tertiary": pair("#27241f"),
				"--dsw-alias-toast-bg": pair(mix(surface, 88, bg)),
				"--dsw-alias-tooltip-bg": pair(mix(surface, 88, bg)),
				"--dsw-specific-bubble": pair(surface),
				"--dsw-specific-bubble-highlight": pair(mix(surface, 92, bg)),
				"--dsw-specific-input-major": pair(bg),
				"--dsw-specific-login-input": pair(mix(bg, 60, surface)),
				"--dsw-specific-menu": pair(surface),
				"--dsw-specific-selector": pair(surface),
				"--dsw-specific-sidebar-fill": pair(mix(bg, 94, surface)),
				"--dsw-specific-sidebar-nav-item-active": pair(mix(surface, 92, bg)),
				"--dsw-specific-sidebar-nav-item-active-accent": pair(accent),
				"--dsw-specific-sidebar-nav-item-hover": pair(mix(text, 6, "transparent")),
				"--dsw-specific-tip": pair(surface)
			};
		}
		/**
		* Flatten a `{ name: { light, dark } }` token map into the flat
		* `{ name: "<css color>" }` shape `theme.register()` passes through to the
		* presenter. A registered theme carries a single colorScheme, so the
		* presenter needs already-resolved string values — `register()` does not
		* fold light/dark pairs (only `overrideTokens` layers do), and passing the
		* pair objects would set `--token: [object Object]`, i.e. invalid/transparent.
		* @param tokens - token-name → { light, dark } value pairs.
		* @param scheme - the theme's colorScheme (its tokens are scheme-specific).
		* @returns flat token-name → css-color map.
		*/
		function flattenTokens(tokens, scheme) {
			const resolved = {};
			for (const [name, modes] of Object.entries(tokens)) resolved[name] = modes[scheme];
			return resolved;
		}
		/** Accepts `#rgb`, `#rrggbb` (with or without the leading `#`). */
		function isHexColor(value) {
			return /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value.trim());
		}
		/** Normalize a hex string to a CSS color (`#rgb` or `#rrggbb`). */
		function normalizeHex(value) {
			const text = value.trim();
			const bare = text.startsWith("#") ? text.slice(1) : text;
			return `#${bare}`;
		}
		/** Stable id for a new custom theme. */
		function customThemeId(name) {
			const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "theme";
			return `custom-${slug}-${Date.now().toString(36)}`;
		}
		//#endregion
		//#region swatches
		/** Colors shown under the built-in DSH card, by resolved color scheme. */
		const DSH_SWATCHES = {
			light: [
				{ key: "background", hex: "#ffffff" },
				{ key: "surface", hex: "#f5f6f7" },
				{ key: "text", hex: "#0f1115" },
				{ key: "accent", hex: "#4176e6" }
			],
			dark: [
				{ key: "background", hex: "#151517" },
				{ key: "surface", hex: "#232324" },
				{ key: "text", hex: "#f9fafb" },
				{ key: "accent", hex: "#5686fe" }
			]
		};
		/** Colors shown under the Claude Code card. */
		const CLAUDE_CODE_SWATCHES = [
			{ key: "background", hex: "#262624" },
			{ key: "surface", hex: "#2a2a27" },
			{ key: "text", hex: "#f0eee6" },
			{ key: "accent", hex: "#d97757" }
		];
		/** Swatches for one custom theme from its stored colors. */
		function customSwatches(colors) {
			return COLOR_KEYS.map((key) => ({ key, hex: normalizeHex(colors[key]) }));
		}
		//#endregion
		//#region settings-store
		/** Theme section slot store: mirrors preference, resolved scheme, and custom themes. */
		function createThemeSectionStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					preference: "system",
					scheme: "light",
					customThemes: [],
					revision: -1
				}),
				actions: {
					sync: (d, preference, scheme, revision) => {
						if (revision <= d.revision) return;
						d.preference = preference;
						d.scheme = scheme;
						d.revision = revision;
					},
					setCustomThemes: (d, customThemes) => {
						d.customThemes = customThemes;
					}
				}
			});
		}
		//#endregion
		//#region locales
		/** Dictionary namespace owned by this plugin's settings section. */
		const NS = "settings.themeSelector";
		/** Simplified Chinese dictionary (key-set source of truth). */
		const zh = {
			"nav": "主题",
			"title": "主题",
			"intro": "选择界面主题，或添加你自己的主题（名称 + 十六进制颜色）。",
			"active": "当前",
			"dshName": "DSH",
			"claudeCodeName": "Claude Code",
			"delete": "删除",
			"addTitle": "添加主题",
			"nameLabel": "名称",
			"namePlaceholder": "例如：午夜蓝",
			"colors.background": "背景",
			"colors.surface": "表面",
			"colors.text": "文字",
			"colors.accent": "强调色",
			"hexPlaceholder": "#RRGGBB",
			"add": "添加主题",
			"nameRequired": "请为主题命名。",
			"invalidHex": "请输入有效的十六进制颜色（#RGB 或 #RRGGBB）。"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"nav": "Theme",
			"title": "Theme",
			"intro": "Choose an interface theme, or add your own from a name and hex colors.",
			"active": "Active",
			"dshName": "DSH",
			"claudeCodeName": "Claude Code",
			"delete": "Delete",
			"addTitle": "Add theme",
			"nameLabel": "Name",
			"namePlaceholder": "e.g. Midnight",
			"colors.background": "Background",
			"colors.surface": "Surface",
			"colors.text": "Text",
			"colors.accent": "Accent",
			"hexPlaceholder": "#RRGGBB",
			"add": "Add theme",
			"nameRequired": "Give the theme a name.",
			"invalidHex": "Enter a valid hex color (#RGB or #RRGGBB)."
		};
		//#endregion
		//#region add-theme form
		/**
		* One hex color field: label, hex text input, and a live preview box that
		* paints the parsed color (transparent while the input is invalid).
		* @param props - field copy, key, value, and change handler.
		* @returns the field row.
		*/
		function ColorField({ t, colorKey, value, onChange }) {
			const valid = isHexColor(value);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: styles.field,
				children: [(0, react_jsx_runtime.jsx)("label", {
					className: styles.fieldLabel,
					htmlFor: `dshTS-color-${colorKey}`,
					children: t(`colors.${colorKey}`)
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: styles.hexRow,
					children: [(0, react_jsx_runtime.jsx)("input", {
						id: `dshTS-color-${colorKey}`,
						className: styles.hexInput,
						type: "text",
						value,
						placeholder: t("hexPlaceholder"),
						spellCheck: false,
						onChange: (event) => {
							onChange(event.target.value);
						}
					}), (0, react_jsx_runtime.jsx)("span", {
						className: styles.previewBox,
						style: { background: valid ? normalizeHex(value) : "transparent" },
						"aria-hidden": true
					})]
				})]
			});
		}
		/**
		* The manual theme builder: name plus the four color fields, validated on
		* submit. The added theme is registered, persisted, and activated.
		* @param props - copy and the add callback.
		* @returns the form element tree.
		*/
		function AddThemeForm({ t, onAdd }) {
			const [name, setName] = (0, react.useState)("");
			const [colors, setColors] = (0, react.useState)({
				background: "",
				surface: "",
				text: "",
				accent: ""
			});
			const [error, setError] = (0, react.useState)(null);
			const updateColor = (colorKey) => (value) => {
				setColors((previous) => ({
					...previous,
					[colorKey]: value
				}));
				setError(null);
			};
			const submit = () => {
				const trimmed = name.trim();
				if (trimmed === "") {
					setError(t("nameRequired"));
					return;
				}
				for (const colorKey of COLOR_KEYS) if (!isHexColor(colors[colorKey])) {
					setError(t("invalidHex"));
					return;
				}
				const normalized = {};
				for (const colorKey of COLOR_KEYS) normalized[colorKey] = normalizeHex(colors[colorKey]);
				onAdd({ name: trimmed, colors: normalized });
				setName("");
				setColors({
					background: "",
					surface: "",
					text: "",
					accent: ""
				});
				setError(null);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: styles.form,
				children: [(0, react_jsx_runtime.jsx)("h3", {
					className: styles.formTitle,
					children: t("addTitle")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: styles.field,
					children: [(0, react_jsx_runtime.jsx)("label", {
						className: styles.fieldLabel,
						htmlFor: "dshTS-name",
						children: t("nameLabel")
					}), (0, react_jsx_runtime.jsx)("input", {
						id: "dshTS-name",
						className: styles.textInput,
						type: "text",
						value: name,
						placeholder: t("namePlaceholder"),
						onChange: (event) => {
							setName(event.target.value);
							setError(null);
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") submit();
						}
					})]
				}), COLOR_KEYS.map((colorKey) => (0, react_jsx_runtime.jsx)(ColorField, {
					t,
					colorKey,
					value: colors[colorKey],
					onChange: updateColor(colorKey)
				}, colorKey)), error !== null && (0, react_jsx_runtime.jsx)("p", {
					className: styles.error,
					role: "alert",
					children: error
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: styles.actions,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: styles.addButton,
						onClick: submit,
						children: t("add")
					})]
				})]
			});
		}
		//#endregion
		//#region theme card
		/**
		* One selectable theme card: name (with an active check) and the colors
		* the theme uses below it; custom themes also get a delete action.
		* @param props - copy, id, name, swatches, selection, and callbacks.
		* @returns the card element tree.
		*/
		function ThemeCard({ t, id, name, swatches, selected, onSelect, onDelete }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: styles.card,
				role: "button",
				tabIndex: 0,
				"data-active": selected ? "true" : void 0,
				"aria-pressed": selected,
				onClick: onSelect,
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						onSelect();
					}
				},
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: styles.cardNameRow,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: styles.cardName,
						children: name
					}), selected && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {
						className: styles.cardCheck,
						size: 16
					}), onDelete !== void 0 && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: styles.delete,
						onClick: (event) => {
							event.stopPropagation();
							onDelete();
						},
						children: t("delete")
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: styles.swatchRow,
					children: swatches.map(({ key, hex }) => (0, react_jsx_runtime.jsxs)("div", {
						className: styles.swatch,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: styles.swatchBox,
							style: { background: hex },
							title: `${t(`colors.${key}`)} ${hex}`
						}), (0, react_jsx_runtime.jsx)("span", {
							className: styles.swatchHex,
							children: hex
						})]
					}, key))
				})]
			});
		}
		//#endregion
		//#region section component
		/**
		* The Theme settings section: the built-in DSH card, the Claude Code card,
		* every user-added custom card, and the manual theme builder.
		* @param props - composed slot props (t, store hook, injected actions).
		* @returns the section element tree.
		*/
		function ThemeSection({ t, useStore, setTheme, addTheme, deleteTheme }) {
			const preference = useStore((state) => state.preference);
			const scheme = useStore((state) => state.scheme);
			const customThemes = useStore((state) => state.customThemes);
			const customIds = (0, react.useMemo)(() => new Set(customThemes.map((custom) => custom.id)), [customThemes]);
			const dshSelected = preference !== CLAUDE_CODE_THEME_ID && !customIds.has(preference);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: styles.section,
				children: [(0, react_jsx_runtime.jsx)("h2", {
					className: styles.title,
					children: t("title")
				}), (0, react_jsx_runtime.jsx)("p", {
					className: styles.intro,
					children: t("intro")
				}), (0, react_jsx_runtime.jsx)("div", {
					className: styles.list,
					children: [(0, react_jsx_runtime.jsx)(ThemeCard, {
						t,
						id: "system",
						name: t("dshName"),
						swatches: DSH_SWATCHES[scheme],
						selected: dshSelected,
						onSelect: () => {
							setTheme("system");
						}
					}), (0, react_jsx_runtime.jsx)(ThemeCard, {
						t,
						id: CLAUDE_CODE_THEME_ID,
						name: t("claudeCodeName"),
						swatches: CLAUDE_CODE_SWATCHES,
						selected: preference === CLAUDE_CODE_THEME_ID,
						onSelect: () => {
							setTheme(CLAUDE_CODE_THEME_ID);
						}
					}), customThemes.map((custom) => (0, react_jsx_runtime.jsx)(ThemeCard, {
						t,
						id: custom.id,
						name: custom.name,
						swatches: customSwatches(custom.colors),
						selected: preference === custom.id,
						onSelect: () => {
							setTheme(custom.id);
						},
						onDelete: () => {
							deleteTheme(custom.id);
						}
					}, custom.id))]
				}), (0, react_jsx_runtime.jsx)(AddThemeForm, {
					t,
					onAdd: addTheme
				})]
			});
		}
		//#endregion
		//#region client/index
		/**
		* Required services: slots/locale for the section, theme for the registry
		* and preference writes, settingsScope for the durable choice + roster.
		*/
		const inject = ["slots", "locale", "theme", "settingsScope"];
		/**
		* Client plugin body: register the claude-code theme, re-register stored
		* custom themes and adopt the persisted choice, then register the Theme
		* section (below Plugins) with per-theme swatches and the manual builder.
		* @param ctx - client cordis context.
		*/
		function apply(ctx) {
			const theme = ctx.theme;
			// Built-in Claude Code theme (dark palette via alias-token overrides).
			ctx.effect(() => theme.register({
				id: CLAUDE_CODE_THEME_ID,
				colorScheme: "dark",
				tokens: flattenTokens(CLAUDE_CODE_TOKENS, "dark")
			}), "dsh-theme-selector: claude-code theme");
			const scope = ctx.settingsScope.bind({ namespace: THEME_SELECTOR_NAMESPACE });
			/** Registered custom themes by id → their disposer. */
			const customDisposers = /* @__PURE__ */ new Map();
			ctx.effect(() => () => {
				for (const dispose of customDisposers.values()) dispose();
				customDisposers.clear();
			}, "dsh-theme-selector: custom theme disposers");
			/**
			* Re-register every stored custom theme, then adopt the persisted
			* choice (claude-code or a custom id) once the scope resolves.
			* setTheme throws for unregistered ids, so this runs only after the
			* registrations above.
			*/
			const adopt = () => {
				const value = scope.getSnapshot().value;
				if (value === void 0) return;
				for (const custom of value[CUSTOM_THEMES_FIELD] ?? []) {
					if (customDisposers.has(custom.id)) continue;
					const dispose = theme.register({
						id: custom.id,
						colorScheme: "dark",
						tokens: flattenTokens(buildCustomTokens(custom.colors), "dark")
					});
					customDisposers.set(custom.id, dispose);
				}
				const selected = value[THEME_SELECTOR_FIELD];
				if (selected !== void 0 && selected !== "system" && theme.getTheme().themes.some((entry) => entry.id === selected)) theme.setTheme(selected);
			};
			ctx.effect(() => scope.subscribe(adopt), "dsh-theme-selector: stored theme adoption");
			adopt();
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-theme-selector: section dictionaries");
			const store = createThemeSectionStore();
			let bound;
			const sync = () => {
				const snapshot = theme.getTheme();
				const value = scope.getSnapshot().value;
				bound?.sync(snapshot.preference, snapshot.active.colorScheme, snapshot.revision);
				bound?.setCustomThemes(value?.[CUSTOM_THEMES_FIELD] ?? []);
			};
			ctx.on("theme/change", sync);
			ctx.effect(() => scope.subscribe(sync), "dsh-theme-selector: store sync");
			const injected = (actions) => {
				bound = actions;
				sync();
				return {
					setTheme: (id) => {
						theme.setTheme(id);
						void scope.set(THEME_SELECTOR_FIELD, id);
					},
					addTheme: ({ name, colors }) => {
						const id = customThemeId(name);
						const dispose = theme.register({
							id,
							colorScheme: "dark",
							tokens: flattenTokens(buildCustomTokens(colors), "dark")
						});
						customDisposers.set(id, dispose);
						const value = scope.getSnapshot().value;
						const next = [...value?.[CUSTOM_THEMES_FIELD] ?? [], { id, name, colors }];
						void scope.set(CUSTOM_THEMES_FIELD, next);
						theme.setTheme(id);
						void scope.set(THEME_SELECTOR_FIELD, id);
					},
					deleteTheme: (id) => {
						customDisposers.get(id)?.();
						customDisposers.delete(id);
						const value = scope.getSnapshot().value;
						const next = (value?.[CUSTOM_THEMES_FIELD] ?? []).filter((custom) => custom.id !== id);
						void scope.set(CUSTOM_THEMES_FIELD, next);
						if (theme.getTheme().preference === id) {
							theme.setTheme("system");
							void scope.set(THEME_SELECTOR_FIELD, "system");
						}
					}
				};
			};
			// The Theme section sits below Plugins (order 18; plugins=15, agent presets=20).
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "theme",
				order: 18,
				label: () => ctx.locale.bind(NS)("nav"),
				locale: NS,
				store,
				inject: injected
			}, ThemeSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
