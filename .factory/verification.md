# Independent product verification — FAIL

Verified at **2026-08-28T05:47:04Z**.

- Candidate: `4580902278537b02c39fda9253bc58830aad9827`
- Branch/source: `main`, `https://github.com/B-Divyesh/sf-pronunciation-cards.git`
- Deployment: `https://pronunciation-cards.sociobot.in`
- Overall result: **FAIL**

The candidate builds and its packaged extension works locally, but the deployed
product cannot be installed: all three download calls to action resolve to a
missing release ZIP. This fails the smallest useful product and the end-to-end
definition of done.

## Defects

### Critical — the live extension download is 404

All three live install links point to
`/downloads/pronunciation-cards-chrome.zip`. Fresh HTTP and Playwright requests
returned **404**. The landing page therefore advertises an installation path
that no user can complete.

Evidence:

- `GET https://pronunciation-cards.sociobot.in/downloads/pronunciation-cards-chrome.zip` → `404` on 2026-08-28.
- The clean candidate build does contain the file: 15,485 bytes,
  SHA-256 `6ba24693a73e2d65ba019e8a993d2be5b899eed10397a8977e0f7872053db355`.
- Unzipping that candidate artifact into a clean directory produced nine files;
  it was byte-identical to `dist/extension/chrome-mv3/` and loaded successfully
  in Chromium.

Expected: a `200` response containing the candidate ZIP at the linked URL.

### High — service-worker updates can leave stale HTML and extension ZIPs indefinitely

`site/public/sw.js` uses cache-first for every same-origin GET and the fixed
cache name `pronunciation-cards-site-v1`. It never revalidates a cache hit. The
download ZIP uses a stable URL and is not refreshed during service-worker
install. A replacement deployment can therefore leave existing visitors on an
old page or old extension package, even while online.

Fresh-browser reproduction:

1. Load the live site and wait for its service worker to control the page.
2. Put a sentinel response for `/` into `pronunciation-cards-site-v1`.
3. Call `registration.update()` while online and reload.
4. The page still returned `STALE SHELL SENTINEL` from the cache.

The same cache-first behavior applies to a successful future download response.
Use versioned content URLs or network-first/revalidate behavior for HTML and
downloads, and bump/clean the cache on every release.

### Medium — several mobile/extension controls miss the 44×44 px target contract

Measured at a 390×844 CSS-pixel viewport:

- Header brand link: 170×40 px.
- Footer brand link: 358×34.5 px.
- Footer Privacy/Terms/Source links: 22.1 px high; Terms is also only 41 px wide.
- Extension import file control: 347×24 px.
- Extension skip link: 131.3×40 px.
- The extension undo button is explicitly allowed to shrink to 36 px high.

This is especially relevant for the stated low-vision audience. Visible focus
itself is clear and keyboard traversal has no trap.

### Medium — the development dependency tree has known vulnerabilities

Fresh `npm ci` reported **12 vulnerabilities: 2 moderate, 6 high, 4 critical**.
Direct affected tools include `vite@7.1.3`, `vitest@3.2.4`, and
`sharp@0.34.3`; `wxt` also brings vulnerable `web-ext-run` dependencies.
`npm audit --omit=dev` is clean, so these are not shipped browser runtime
dependencies, but they remain build/test workstation exposure.

### Low — extension tab semantics produce one axe best-practice violation

The extension popup has no serious or critical axe findings, but axe reports one
moderate `region` finding. The `<nav>` is assigned `role="tablist"`, overriding
its navigation-landmark role, so the tab list is not contained by any landmark.

### Low — the deployed AVIF has an incorrect response type

`/assets/pronunciation-cards-hero-960.avif` is served as
`application/octet-stream` rather than `image/avif`. Chromium still decoded it
and Lighthouse loaded it, but the response metadata is incorrect. Also,
non-fingerprinted mark/hero assets receive one-year `immutable` caching, which
adds to the cache invalidation risk above.

## Clean-checkout gates

The repository was cloned separately from GitHub and checked out detached at
the candidate. The checkout remained clean after testing. Environment:
Node `v22.23.2`, npm `10.9.8`, Chromium from Playwright `1.58.2`.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS with audit warning | 423 packages installed; lockfile honored |
| `npm run typecheck` | PASS | WXT prepare and `tsc --noEmit` completed |
| Lint | N/A | no lint script/configuration is available |
| `npm run build` | PASS | exact production command created `dist/` and ZIP |
| `npm test` | PASS | 6/6 Vitest and 6/6 repository Playwright tests |
| Candidate package install | PASS | clean unzip, byte comparison, MV3 load in Chromium |
| `npm audit --omit=dev` | PASS | zero production vulnerabilities |
| Full `npm audit` | FAIL | 12 development-tree vulnerabilities |

## Independent product exercises

The clean packaged extension was loaded, not a source/dev version. Independent
browser exercises covered:

- Empty submit and focused recovery message.
- Over-limit 81-character term rejection.
- Normal card creation with alias, IPA, and private note.
- Case-insensitive duplicate rejection.
- Web Speech preview invocation and completion feedback.
- Arrow-key tab navigation, search miss, and search recovery.
- Escaped IPA SSML copied through the clipboard path.
- Delete dialog cancel, confirmed deletion, and undo.
- Invalid JSON rejection followed by successful recovery.
- Merge import to 20 saved terms, export download, and persisted local storage.
- Restricted-page speech-injection error and actionable recovery copy.
- Serious/critical axe scan and console/page error capture.

The pronunciation replacement algorithm also passed its normal, overlapping,
case-insensitive, punctuation, and inside-word unit cases. Real audio quality
and the browser toolbar/context-menu grant of `activeTab` cannot be observed in
headless Chromium; speech calls were instrumented, and the protected-page
failure path was exercised.

## Live deployment evidence

- Home, privacy, and terms returned `200` over HTTPS with no console/page
  errors and no axe violations on the legal pages.
- Home passed at 1440×900 and 390×844 with no horizontal overflow.
- Keyboard first focus is the visible skip link; activation moves to `#main`.
- Reduced-motion computed animation duration was `0.00001s`.
- Fresh offline reload passed after service-worker installation.
- `registration.update()` found the active `/sw.js`, but the stale-cache test
  above failed update correctness.
- Runtime request capture observed only the first-party origin. Source and
  built-output inspection found no analytics, telemetry, cloud TTS, cookies,
  CDN fonts, or third-party runtime scripts. Extension data uses
  `browser.storage.local`.
- `/opt/fleet/lib/verify-url.sh` passed: title/lang/main/one h1/alt/button names,
  739 ms load, zero console errors.
- Response policy on HTML includes HSTS, `Referrer-Policy: no-referrer`,
  `X-Content-Type-Options: nosniff`, a restrictive permissions policy, and CSP
  `default-src 'self' ... object-src 'none'; frame-ancestors 'none'`.

Deployment identity was checked by SHA-256, not appearance. The live home,
privacy, terms, service worker, JS, CSS, SVG, AVIF, WebP files, robots.txt, and
sitemap are byte-for-byte matches for the candidate build. The required ZIP is
the sole missing candidate artifact, so the deployment is a partial candidate
deployment rather than a different UI revision.

## Performance and budgets

Lighthouse 13.0.1 mobile against the live URL:

- Performance **100**, accessibility **100**, best practices **100**, SEO **100**.
- FCP 1.1 s, LCP 1.1 s, TBT 90 ms, CLS 0, speed index 1.1 s.
- Initial transfer 46 KiB.

Build payloads are within contract:

- Site JS: 1,665 bytes (budget 200 KiB).
- Site CSS: 10,604 bytes (budget 50 KiB).
- Mobile AVIF hero: 38,946 bytes (budget 300 KiB).
- Runtime fonts: 0 bytes.
- Total unpacked extension: 31,845 bytes.

## Required disposition

Do not approve this release. Publish the exact candidate ZIP at the advertised
path, correct service-worker cache/update semantics, then rerun deployment
verification from a fresh browser and an already-controlled browser. The
remaining medium/low findings should also be fixed for the accessibility and
security contract.
