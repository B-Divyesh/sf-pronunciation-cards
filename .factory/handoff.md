# Pronunciation Cards — verification handoff

## Verdict: FAIL

Independent verification of candidate
`4580902278537b02c39fda9253bc58830aad9827` at
`https://pronunciation-cards.sociobot.in` completed on 2026-08-28.

The clean candidate passes type checking, production build, unit tests, and
repository Playwright tests. Its generated ZIP installs and the extension's
local card, preview, SSML, import/export, delete/undo, invalid-input, keyboard,
and persistence paths work. The release still fails because the live extension
ZIP returns **404**, making the deployed product impossible to install.

Full evidence and reproductions are in `.factory/verification.md`.

## Commands verified

```sh
npm ci
npm run typecheck
npm run build
npm test
npm audit --omit=dev
npm audit
```

Additional verification used the packaged MV3 ZIP in a clean Chromium profile,
Playwright 1.58.2 with axe, the factory `verify-url.sh`, SHA-256 comparisons,
HTTP header/request inspection, service-worker offline/update probes, 390 px
mobile and desktop viewports, reduced motion, keyboard-only navigation, target
measurements, and Lighthouse 13 mobile.

## Defects to resolve

1. **Critical:** publish
   `/downloads/pronunciation-cards-chrome.zip`; all live download CTAs currently
   return 404.
2. **High:** fix cache-first service-worker update behavior so HTML and the
   stable download URL cannot remain stale indefinitely.
3. **Medium:** bring mobile/footer and extension file/skip/undo targets up to
   44×44 px.
4. **Medium:** update the vulnerable development dependency tree (12 audit
   findings; production audit is clean).
5. **Low:** contain the tab list in a landmark and remove axe's moderate
   `region` finding.
6. **Low:** serve AVIF as `image/avif` and avoid immutable caching on
   non-fingerprinted assets.

## Passing evidence

- `npm run typecheck`: passed.
- `npm run build`: passed; site and 31,845-byte unpacked extension generated.
- `npm test`: passed; 6 unit and 6 Playwright tests.
- Clean packaged-extension exercise: passed, including a 20-card glossary.
- Live home/legal semantics, console, serious/critical axe, desktop/mobile,
  keyboard focus, reduced motion, privacy/request capture, and offline reload:
  passed.
- Lighthouse mobile: 100 performance / 100 accessibility / 100 best practices /
  100 SEO; LCP 1.1 s, TBT 90 ms, CLS 0.
- Bundles: 1.665 KB JS, 10.604 KB CSS, 38.946 KB mobile AVIF, no web fonts.
- Live served files match the candidate byte-for-byte except for the absent ZIP.

## Next verification

After publishing the ZIP and changing the service worker, verify both a fresh
profile and a profile controlled by `pronunciation-cards-site-v1`; confirm the
new HTML and download replace cached versions. Repeat the live ZIP hash/install
test and all clean-checkout gates before changing the verdict to PASS.
