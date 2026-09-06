# Pronunciation Cards

Pronunciation Cards is a local Chrome-compatible browser extension for blind
and low-vision screen-reader users who need technical names read predictably.

Use the [sample glossary](https://pronunciation-cards.sociobot.in/demo/) before
installing. It opens with four technical terms, a reading preview, SSML, JSON
export, Reset demo, and Start for real. Demo data uses its own browser-storage
key and does not change extension data.

## What it does

- Saves a written term, spoken alias, optional IPA, and private note in browser
  extension storage.
- Previews the alias with the browser speech API.
- Applies saved aliases to matching selected text without changing parts of
  other words.
- Copies SSML from a card for a reading tool that supports the markup.
- Exports readable JSON and imports it by merging terms or replacing a
  glossary.
- Requires no account. The extension ZIP is free to download.
- Requests page access only after an explicit extension action. It has no
  persistent all-sites host permission.

The demo reloads with its populated sample after its first visit while offline.
The website and demo use no cookies or third-party runtime requests. See
[Privacy](https://pronunciation-cards.sociobot.in/privacy/) and
[Terms](https://pronunciation-cards.sociobot.in/terms/).

Check important text in the reading tool where it will be used. Browser voices
and SSML support can differ between systems.

## Install a release build

1. Download `pronunciation-cards-chrome.zip` from the website and unzip it.
2. Open `chrome://extensions` in a Chromium-based browser.
3. Enable Developer mode, choose **Load unpacked**, and select the folder that
   contains `manifest.json`.
4. Pin Pronunciation Cards. Select a term on a regular web page and open it.

## Develop and verify

Requirements: Node.js 20+ and npm.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Run the entire claim suite with `npm run test:claims`. Each public claim and
its one tagged outcome check is listed in `.factory/claims.json`. Run a single
claim from a clean checkout with its declared command, for example:

```sh
npm run test:claims -- --grep @claim:demo-isolation
```

`npm run build` writes the unpacked MV3 extension to
`dist/extension/chrome-mv3/`, the static site to `dist/site/`, and the release
ZIP to `dist/site/downloads/pronunciation-cards-chrome.zip`. Deploy `dist/site/`
as the static root.

## Project layout

- `entrypoints/` — the MV3 popup and service worker.
- `lib/` — card transforms and extension-local storage.
- `site/` — landing page, legal pages, demo, and service worker.
- `tests/` — unit, packaged-extension, browser, accessibility, and claim
  checks.
- `.factory/demo.md` — demo data, URL, reset behavior, and storage namespace.

## License

MIT. See [LICENSE](./LICENSE).
