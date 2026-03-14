# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `reader/` directory:

```bash
npm install          # Install dependencies (also copies monaco editor)
npm run lint         # Run ESLint across all JS files
```

To load the extension in Chrome: go to `chrome://extensions`, enable Developer Mode, click "Load unpacked", and select the `reader/` directory.

Monaco editor setup: after `npm install`, copy `node_modules/monaco-editor/min/vs` to `reader/monaco/vs`.

## Architecture

This is a Chrome Manifest V3 extension called **JReader** that lets users write per-site CSS rules to create custom reading views.

### Core data flow

1. **Content script** (`content/index.js` → `content/content.js`) runs on every `https://` page. On load it calls `contentInitHost(hostName)` which reads the current hostname's config from `chrome.storage.local` and injects CSS styles into the page.

2. **Storage schema** — `chrome.storage.local` holds per-host objects keyed by hostname (e.g. `"nytimes.com"`):
   - Per-host: `{ default, dark, darkOn, defaultOn, selector, active }`
   - Global: `_default`, `_dark`, `_darkOn`, `_readerOn`

3. **Popup** (`popup/popup.js`) is the main editor UI. It opens a Monaco editor for the current tab's host, lets users write CSS rules, and saves them to storage. The popup opens as both an action popup and a side panel.

4. **Background** (`background/background.js`) is a service worker that updates the toolbar badge on tab change and handles keyboard commands (`Alt+J` open editors, `Alt+K` close, `Ctrl+Shift+D` toggle dark, `Ctrl+Shift+R` toggle reader).

### CSS rule parsing (`shared/parse/`)

CSS stored per host can contain special directives embedded in CSS comments, parsed by `parse.js`:

- `/* @toggle caption selector initial */` — creates a toggle button that shows/hides DOM elements
- `/* @toggle-style caption styleId initial begin ... @end */` — creates a toggle button for a CSS block
- `/* @annoying begin ... @end */` — CSS injected to hide annoying elements
- `/* @contains selector text begin ... @end */` — applies style to element matching text content
- `/* @macro n name */` — macro expansion (handled by `parse/macro.js`)
- `@redirect selector` — redirects to an archive site when a paywall selector is detected

### Selector modes

The `selector` field in per-host config controls how the reader article is extracted:
- Plain selector: selects a single element and wraps it in `#readerarticle`
- Prefix `*`: selects multiple elements
- Prefix `@`: optional — doesn't fail if selector is missing
- "Immersive mode" is active when a selector matches; it applies both general (`_default`/`_dark`) and custom styles

### Key directories

- `content/` — content scripts injected into pages (styles, vault, archive handling, favicon replacement, adblock)
- `popup/` — editor UI with Monaco, tabs for default/dark/selector CSS, switches
- `background/` — service worker, badge management, keyboard command handler
- `shared/` — code shared between content and popup: storage helpers, CSS parser, Monaco suggestions
- `options/` — options page with import/export and immersive style editor
- `lib/` — download and drop utilities
- `assets/favicon/` — static favicons for known archive/paywalled sites