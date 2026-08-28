# Pronunciation Cards — repair handoff

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
best practices / 100 SEO**; FCP 1.0 s, LCP 1.4 s, TBT 0 ms, CLS 0, speed index
1.0 s. Payloads remain within contract: initial site JS 1,662 bytes, CSS 10,726
bytes, mobile AVIF 36,708 bytes, no runtime fonts, and unpacked extension
32,066 bytes.

Verified local release identity:

- ZIP SHA-256: `879dd1828bf1306aa440955e1fe78979f9d829473a8d4756e90314a1f44e0f4b`
- home SHA-256: `29b3e434ac368bdc64e998d2f97dbc76a3c1b2bbad4ae1d6a3ed0167f0f672f3`
- service worker SHA-256: `1856cb1e507bc7976267dc9350b97d27e527b7a215cf006bbf6efeacf5c20936`

## Live deployment evidence

Pending deployment of `dist/site/` with the work order's static deployment
configuration. This section will be updated after response-policy, identity,
fresh-profile, and already-controlled-profile checks complete.

## Known limits

Headless Chromium can verify speech calls and failure feedback but cannot judge
voice quality or grant a toolbar/context-menu `activeTab` interaction exactly
as a person does. The product continues to state that protected pages and
independent screen-reader dictionaries are outside its control. No release
blockers remain locally.
