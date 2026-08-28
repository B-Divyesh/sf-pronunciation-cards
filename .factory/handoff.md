# Pronunciation Cards v1 — handoff

## Shipped

- A WXT + TypeScript Manifest V3 extension in `dist/extension/chrome-mv3/`.
- A responsive static landing site in `dist/site/`, including `/privacy/`,
  `/terms/`, offline shell caching, install instructions, and the packaged ZIP
  at `dist/site/downloads/pronunciation-cards-chrome.zip`.
- End-to-end card workflow: capture selected text, add phonetic alias and
  optional IPA, choose an installed voice/rate, preview, save/edit/search,
  delete with undo, and apply matching cards while speaking page selections.
- Portable output: escaped alias/IPA SSML per card and versioned JSON
  merge/replace import plus export.
- Local-only persistence through extension storage. The extension uses
  `storage`, `contextMenus`, `activeTab`, and `scripting`; it does not request
  persistent access to every site and has no remote runtime code.
- The product-specific night-market visual system, original SVG mark, and
  original generated hero with prompt/model provenance in `.factory/design.md`
  and `assets/src/`.

## Build and verify

From a clean clone with Node.js 20+:

```sh
npm ci
npm run typecheck
npm test
```

The exact production command is `npm run build`. It recreates all optimized
assets, extension output, static site, and download ZIP.

Verification completed 2026-08-28:

- `npm run typecheck`: passed.
- `npm test`: passed — 6 Vitest domain tests and 6 Playwright browser tests.
- Playwright loads the real MV3 build in Chromium, saves/searches a card, and
  runs axe against the popup.
- Playwright checks home/privacy/terms semantics, serious/critical axe findings,
  390 px layout, keyboard skip link, offline state, and downloadable ZIP.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence`:
  passed; 0 console errors, title/lang/main present, one h1, 0 missing image alt,
  and 0 unlabeled buttons.
- Lighthouse 13 mobile: performance **100**, accessibility **100**, best
  practices **100**, SEO **100**. FCP 1.0 s, LCP 1.3 s, TBT 0 ms, CLS 0.
- First-load payload: site JS 1.67 KB, CSS 10.60 KB, mobile hero 38.95 KB AVIF
  (54.74 KB WebP fallback). Extension total 31.85 KB. All are below budget.
- `npm audit --omit=dev`: 0 production dependency vulnerabilities.

## Known gaps and next steps

- Browser extensions cannot override an independent screen reader's internal
  pronunciation dictionary. The UI states this clearly; SSML must be pasted
  into a reader that supports the relevant elements.
- Installed speech voices, IPA support, and exact audio differ by operating
  system. Preview intentionally uses the phonetic alias because Web Speech does
  not document direct IPA input.
- Protected browser pages reject `activeTab` script injection. Manual card entry
  and popup preview remain available there.
- The release is a Chrome-compatible unpacked ZIP; store signing and Firefox
  packaging are factory follow-up work, not repository infrastructure work.
- Lighthouse and URL verification used the local production server. Deployment,
  DNS, and post-deploy smoke checks remain with the factory.
