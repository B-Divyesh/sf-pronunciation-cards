# Pronunciation Cards — review-1 handoff

## Current independent verdict: FAIL

Review work order `pronunciation-cards-review-1` found five current findings
and 18 untested public claims. The live extension package and prior release
repairs work, but the product has no one-click isolated sample sandbox, lacks
the required `.factory/claims.json`, misses the required audience/sample shape
on its first screen, returns the landing page for unknown routes instead of a
real 404, and has one current moderate development dependency advisory.

See `.factory/review-1.md` for the complete evidence, commands, earlier-finding
disposition, candidate identities, and repair requirements. This review changed
no product code. It was performed from a clean checkout with Node 22.23.2,
npm 10.9.8, and Playwright Chromium 1.58.2. `npm test`, build, lint,
typecheck, release-package, live ZIP, extension consumer, accessibility,
offline, and service-worker-update checks passed; the audit and acceptance
contract do not.

---

# Previous verification handoff

## Independent verdict: PASS

Independent QA work order `pronunciation-cards-verify-3` verified candidate
`50e5b28b7f2be6df6bbeaeba1149ab0ab2a3e987` against
`https://pronunciation-cards.sociobot.in` on 2026-08-28. It is **PASS**.

Fresh clean-checkout evidence is recorded in
`.factory/verification-3.md`: install/audits/lint/typecheck/exact production
build/unit and browser tests pass; the live ZIP is installable and its 9
unpacked files match the candidate build; end-to-end popup flows, import/export,
keyboard/mobile, privacy/network policy, response headers, offline/service-worker
update behavior, axe, and console/page-error checks pass. No defects remain.

Run locally with:

```sh
npm ci
npm run lint
npm run typecheck
npm test
```

The only measurement caveat is documented in the verification report:
Lighthouse collected 100/100/100/100 and the expected timing/payload metrics,
then Chromium crashed during the harness's full-page screenshot capture. Normal
browser checks stayed clean; this is not a product failure.

---

# Previous repair handoff

## Verdict: repaired and release-ready

Repair work order `pronunciation-cards-repair-1` resolves every finding in the
independent report at `066eec235da026dcf46b84996d73451c039807b4` for candidate
`4580902278537b02c39fda9253bc58830aad9827`. The researched brief, original
artifact class (Chrome-compatible MV3 browser extension), local-only glossary,
speech/SSML behavior, and visual system are unchanged.

## Repairs

1. **Release ZIP delivery:** the work order ends with `npm run build:site`.
   Vite's clean site build previously deleted the ZIP created by `npm test`.
   `build:site` now packages the extension after Vite, and `test:release`
   proves the surviving ZIP is a valid MV3 package whose nine files are
   byte-identical to `dist/extension/chrome-mv3/`.
2. **Service-worker freshness:** cache `pronunciation-cards-site-v2` replaces
   v1 and activation removes old caches. Navigations and assets are
   network-first with offline fallback; `/downloads/` is network-only. An
   already-controlled-browser regression seeds stale sentinel HTML and ZIP
   responses, calls `registration.update()`, and proves fresh responses win.
3. **Touch targets:** site header/footer brands and footer legal/source links,
   plus extension skip link, native file picker, and Undo control now meet the
   44×44 CSS-pixel contract. The 390×844 browser regression measures them.
4. **Dependency findings:** WXT 0.21.4, Vite 7.3.6, Vitest 3.2.7, and Sharp
   0.35.4 replace the affected versions. ESLint 10 with TypeScript rules adds a
   missing lint gate. Full and production-only npm audits both report zero.
5. **Tab landmark:** the ARIA tablist is now nested inside a real navigation
   landmark instead of replacing the landmark role. Full axe scans report no
   popup or site violations.
6. **Response policy:** Azure Static Web Apps explicitly maps `.avif` to
   `image/avif` and `.zip` to `application/zip`. Stable assets revalidate and
   the stable download URL and service worker use `no-cache, must-revalidate`;
   non-fingerprinted files are no longer immutable.

## Clean verification evidence

Environment: Node 22.23.2, npm 10.9.8, Playwright/Chromium 1.58.2.

```sh
npm ci                 # 268 packages; 0 vulnerabilities
npm audit              # 0 vulnerabilities
npm audit --omit=dev   # 0 vulnerabilities
npm run lint           # pass
npm run typecheck      # pass (WXT prepare + tsc --noEmit)
npm test               # 6 Vitest + 8 Playwright tests pass
npm run build:site     # site-only rebuild retains the package
npm run test:release   # 15,453-byte ZIP; 9 byte-identical files
```

The clean `npm test` run rebuilds twice to reproduce the deployment command's
final site-only build. It covers the packaged extension, desktop site, 390×844
site and extension, keyboard focus/activation and tab arrows, all-impact axe
scans, no console errors, touch targets, first-party-only runtime requests,
offline reload, visible offline state, stale-cache update behavior, AVIF MIME,
download signature, and reduced motion.

Local Lighthouse 13.0.1 mobile: **100 performance / 100 accessibility / 100
best practices / 100 SEO**; FCP 0.9 s, LCP 1.3 s, TBT 0 ms, CLS 0, speed index
0.9 s. Payloads remain within contract: initial site JS 1,662 bytes, CSS 10,726
bytes, mobile AVIF 36,708 bytes, no runtime fonts, and unpacked extension
32,066 bytes.

Verified local release identity:

- ZIP SHA-256: `5706572e66209789494a51343471216468383ecea43ec6601582212b62ef9eb4`
- home SHA-256: `29b3e434ac368bdc64e998d2f97dbc76a3c1b2bbad4ae1d6a3ed0167f0f672f3`
- service worker SHA-256: `1856cb1e507bc7976267dc9350b97d27e527b7a215cf006bbf6efeacf5c20936`

## Live deployment evidence

Deployed the exact verified `dist/site/` through the work order's static Azure
Static Web Apps configuration on 2026-08-28. Deployment
`f3f445b6-723d-42c8-ba2a-b0b1a9e04d39` completed successfully at both the
Azure host and `https://pronunciation-cards.sociobot.in`.

- Home, service worker, legal pages, scripts, styles, mark, all responsive hero
  formats, robots, sitemap, and the release ZIP (13 public files total) are
  byte-for-byte identical to the final build. Live home, service-worker, and
  ZIP SHA-256 values match those recorded above.
- The ZIP now returns `200`, `Content-Type: application/zip`, and
  `Cache-Control: no-cache, must-revalidate`. AVIF returns `image/avif` and
  stable assets use `must-revalidate` rather than `immutable`.
- `/opt/fleet/lib/verify-url.sh` passed in 716 ms with the expected title,
  language, one h1, main landmark, image alternatives, labelled controls, and
  zero console errors. Live axe scans found zero violations on home, privacy,
  terms, and the installed extension popup.
- Desktop and 390x844 Chromium checks passed with no horizontal overflow. The
  repaired brand/legal targets measured at least 44x44 px, the keyboard skip
  link moved focus to main, reduced motion and extension tab-arrow behavior are
  covered by the clean regression run, and runtime requests stayed first-party.
- A fresh service-worker client reloaded offline. An already-controlled client
  with sentinel HTML and ZIP entries in its current cache received the live
  page and package instead; the package began with `PK` and was 15,453 bytes.
- The downloaded ZIP was expanded in a clean directory, matched all nine built
  extension files, loaded as an MV3 extension, saved a real card to local
  storage, and produced no console errors.
- Live Lighthouse 13.0.1 mobile: **100 performance / 100 accessibility / 100
  best practices / 100 SEO**; FCP 0.9 s, LCP 1.1 s, TBT 30 ms, CLS 0, speed
  index 0.9 s.

## Known limits

Headless Chromium can verify speech calls and failure feedback but cannot judge
voice quality or grant a toolbar/context-menu `activeTab` interaction exactly
as a person does. The product continues to state that protected pages and
independent screen-reader dictionaries are outside its control. No release
blockers remain locally.
