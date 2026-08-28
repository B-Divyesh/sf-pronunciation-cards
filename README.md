# Pronunciation Cards

Pronunciation Cards is a local-first Chrome-compatible browser extension for
blind and low-vision readers who encounter technical terms, acronyms, and names
that speech software says unpredictably.

Select a term on a web page, write the pronunciation you want, preview it with
an installed browser voice, and save it as a reusable card. The extension can
then read selected web text with matching aliases applied, copy standards-based
SSML, and import or export the glossary as plain JSON.

Live site: <https://pronunciation-cards.sociobot.in>

## What v1 does

- Captures the current page selection after an explicit extension action.
- Stores phonetic aliases, optional IPA, and private notes locally.
- Previews aliases with the browser's documented Web Speech API.
- Reads selected web text after applying every matching local card.
- Copies `<sub>` or IPA `<phoneme>` SSML for use in compatible tools.
- Searches, edits, deletes with undo, and imports/exports versioned JSON.
- Works without an account, analytics, cloud TTS, or a network connection.

It does **not** modify the dictionary inside an independent screen reader.
Protected browser pages can also block selection access and speech injection.
These limitations are stated in the product UI instead of being hidden.

## Install a release build

1. Download `pronunciation-cards-chrome.zip` from the website and unzip it.
2. Open `chrome://extensions` in a Chromium-based browser.
3. Enable Developer mode, choose **Load unpacked**, and select the unzipped
   directory containing `manifest.json`.
4. Pin Pronunciation Cards. Select a term on a normal web page and open it.

The extension requests `storage`, `contextMenus`, `activeTab`, and `scripting`.
The last two only provide page access following an explicit toolbar or
context-menu action; there is no persistent all-sites permission.

## Develop

Requirements: Node.js 20+ and npm.

```sh
npm ci
npm run dev          # WXT extension development
npm run dev:site     # landing site development
npm run typecheck
npm test             # unit tests, clean production build, Playwright + axe
npm run build        # exact production command
```

`npm run build` writes:

- the unpacked MV3 extension to `dist/extension/chrome-mv3/`;
- the deployable static site to `dist/site/`;
- the downloadable build to
  `dist/site/downloads/pronunciation-cards-chrome.zip`.

Deploy `dist/site/` as the static root. `npm run build:site` always repackages
the extension after Vite clears the site output, so the linked ZIP survives a
site-only rebuild. The service worker uses fresh network responses for pages
and downloads, with an offline fallback for previously visited pages.

## Project layout

- `entrypoints/` — WXT popup and service worker.
- `lib/` — pure glossary transforms and extension-local persistence.
- `site/` — Vite landing site, legal pages, and offline shell.
- `assets/src/` — authored mark and generated hero source/provenance.
- `tests/` — Vitest domain tests and Playwright/axe browser tests.
- `.factory/design.md` — palette, typography, interaction, motion, and imagery
  decisions.

## Privacy and security

Glossaries use `browser.storage.local`. Selection matching and speech happen on
device. The site ships no analytics, cookies, CDN dependencies, or third-party
runtime scripts. Exported JSON can contain private notes, so review it before
sharing. See the full [privacy policy](https://pronunciation-cards.sociobot.in/privacy/).

## License

MIT. See [LICENSE](./LICENSE).
