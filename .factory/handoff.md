# Pronunciation Cards — repair 2 handoff

## Result

**PASS — deployed.** The product now meets the researched job: blind and
low-vision screen-reader users can keep a local pronunciation glossary for
technical terms, preview spoken forms, apply aliases to text, copy SSML, and
move a glossary as JSON.

- **Implementation SHA:** `71b1143` (`feat: add isolated pronunciation demo and claims`)
- **Documentation SHA:** recorded by the following report-only handoff commit;
  it contains no product-source changes.
- **Live URL:** `https://pronunciation-cards.sociobot.in`
- **Deployment:** Static Web Apps production deployment of the exact
  `dist/site/` build from the implementation SHA.

## What changed

1. Added `/demo/`, a one-click isolated sample glossary. It immediately shows
   Kubernetes, OAuth, PostgreSQL, and ngrok cards plus transformed reading
   output. The persistent banner says that it is demo data, offers **Reset
   demo** and **Start for real**, and stores only
   `demo:pronunciation-cards:cards`. Leaving the demo discards that key.
2. Added `.factory/claims.json` with 12 public claims and one tagged,
   outcome-based test per claim. The tests cover sample isolation/reset,
   preview speech, SSML, JSON export/import, local extension storage, no
   third-party runtime traffic, offline demo reload, action-scoped
   permissions, selected-text transforms, and the package download.
3. Rewrote the first screen in plain words. It now states the job, audience,
   and required first action before scrolling. The copy audit is in
   `.factory/copy-audit.md`; the catalog description is verb-first and copied
   to `/work/.evidence/catalog-description.txt`.
4. Added a designed `404.html`, configured Static Web Apps to return it with
   HTTP 404 for unknown routes, and added per-route titles, canonical URLs,
   Open Graph/Twitter metadata, apple-touch icon, sitemap entry, and social
   preview artwork derived from the existing original hero image.
5. Updated the service worker to cache the demo shell and its assets for an
   offline sample reload while keeping pages network-first and downloads
   network-only. The cache version is `pronunciation-cards-site-v5`.
6. Updated `fflate` from 0.8.2 to 0.8.3. Both full and production-only npm
   audits now report zero vulnerabilities.

## Earlier findings

| Finding | Disposition |
| --- | --- |
| No one-click isolated sample | Resolved by `/demo/` and the persistent demo banner. |
| Missing claims inventory and commands | Resolved by `.factory/claims.json` and 12 tagged checks. |
| First screen did not name the user or sample action | Resolved with the new job-first hero. |
| Unknown routes showed the home page | Resolved; `/review-missing-route-9c3d` returns HTTP 404 and `Page not found`. |
| `fflate` moderate development advisory | Resolved by 0.8.3; audit is clean. |
| Earlier ZIP, cache freshness, target-size, tab-landmark, AVIF MIME issues | Remain resolved and are still covered by release/browser tests. |

## Verification

Environment: Node 22.23.2, npm 10.9.8, Playwright Chromium 1.58.2.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
```

All commands pass. `npm test` reports 6 unit tests and 21 browser tests.
The release test verifies a 15,453-byte ZIP with nine byte-identical extension
files. Every command declared in `.factory/claims.json` was also run from this
clean setup and passed.

The final build is within the static budget: initial JavaScript is 0.98 kB
gzip, CSS is 3.94 kB gzip, and the mobile AVIF hero is 36,708 bytes. The
extension is 32.07 kB unpacked.

Live verification passed:

- `/opt/fleet/lib/verify-url.sh` reported 200, the expected title/lang/H1/main,
  no missing alt text or unnamed buttons, and no console errors.
- Fresh 1440×900 and 390×844 contexts both showed the job, named audience, and
  **Try it with sample data** before scrolling; the phone had no horizontal
  overflow.
- Axe scans through the Playwright integration found zero violations on home,
  demo, privacy, terms, and the 404 page. `@axe-core/cli` itself could not find
  a Chrome binary in this worker, so it was not treated as a product result.
- The live demo showed four cards and
  `cue burr NET eez services use oh auth with POST gres cue ell.` Reset restored
  a removed sample card; the real-data sentinel was unchanged; all observed
  requests were first-party; and a dedicated context reloaded the sample
  offline.
- The deliberate unknown URL returned HTTP 404, title `Page not found —
  Pronunciation Cards`, and the matching H1.
- Live home HTML and live ZIP SHA-256 values exactly matched the final local
  build. The live ZIP was unpacked in a fresh directory, loaded as an MV3
  extension in a fresh Chromium profile, saved a PostgreSQL card locally, and
  produced no console errors.

## Known limits and next steps

The extension uses documented browser speech APIs. Voice quality and an
extension action's browser-granted `activeTab` interaction still need a human
browser check. Screen readers and third-party reading tools can differ in
their alias and SSML support, so important content should be checked in the
intended reading surface. There is no browser-store listing; users install the
free packaged ZIP as an unpacked Chromium extension.

The Static Web Apps CLI briefly created a local credential helper file during
deployment. It was removed immediately, was never committed, and no credential
is recorded here.
