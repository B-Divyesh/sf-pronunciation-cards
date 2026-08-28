# Independent product verification 3 — PASS

Verified at **2026-08-28T06:50:47Z**.

- Candidate: `50e5b28b7f2be6df6bbeaeba1149ab0ab2a3e987`
- Source: `main`, `https://github.com/B-Divyesh/sf-pronunciation-cards.git`
- Live URL: `https://pronunciation-cards.sociobot.in`
- Overall result: **PASS**

This is a fresh, independent verification from a clean checkout. No product
source was modified. The earlier deployment-only ZIP failure is repaired: the
live download returns a valid package whose nine unpacked files are each
byte-identical to this candidate build.

## Clean-checkout quality gates

Environment: Node 22.23.2, npm 10.9.8, Playwright Chromium 1.58.2.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| `npm ci` | PASS | 268 packages installed; audit reported 0 vulnerabilities. |
| `npm audit` / `npm audit --omit=dev` | PASS | 0 vulnerabilities in both trees. |
| `npm run lint` | PASS | ESLint completed without findings. |
| `npm run typecheck` | PASS | WXT preparation plus `tsc --noEmit`. |
| `npm run build` | PASS | Produced `dist/extension/chrome-mv3/`, `dist/site/`, and the release ZIP. |
| `npm run test:release` | PASS | 15,453-byte ZIP; all 9 packaged files match the unpacked MV3 build. |
| `npm test` | PASS | 6 Vitest tests and all 8 repository Playwright tests passed. |

Fresh build payloads are within the static-product budgets: site JavaScript is
1,662 bytes, CSS 10,726 bytes, the mobile AVIF is 36,708 bytes, no runtime
fonts are loaded, and the unpacked extension is 32,066 bytes.

## End-to-end product exercises

I loaded the extension from the live ZIP expanded into a clean temporary
directory, rather than from source. The following independent paths passed:

- selected-term handoff, empty required-field recovery and focus return;
- protected-page/read-selection error with actionable recovery copy;
- 80-character term boundary; case-insensitive duplicate rejection;
- normal card creation with alias, IPA containing XML-sensitive characters,
  and private notes; search miss and recovery; SSML clipboard feedback;
- delete cancel, confirmed delete, and Undo restoration;
- empty and malformed JSON import recovery; merge import of 20 cards; JSON
  export download; persisted local storage after popup reload;
- keyboard tab-arrow navigation, 390px native file input target (368 x 44 px),
  extension console/page-error capture (none);
- landing-page local Web Speech preview, with a controlled speech API probe:
  it spoke `cue burr net eez` at rate 0.86 and announced `Sample finished.`
  with no console errors.

The normal toolbar/context-menu `activeTab` grant cannot be performed exactly
in a headless test because the popup must be opened as a browser action rather
than as a test tab. The packaged popup, selection handoff, applied-pronunciation
unit cases, and restricted-page recovery were tested; this remains a browser
automation limitation, not a release defect.

## Live deployment and browser QA

All candidate public assets match the live deployment byte-for-byte: HTML,
JavaScript, CSS, images, legal pages, robots, sitemap, and service worker. The
outer ZIP SHA differs because ZIP timestamps are packaging metadata, but each
of its 9 extracted files matches the fresh candidate build byte-for-byte.

- `GET /downloads/pronunciation-cards-chrome.zip` is `200`, begins `PK`, is
  15,453 bytes, and is served as `application/zip` with
  `no-cache, must-revalidate`.
- The AVIF is served as `image/avif`; HTML has HSTS, CSP restricted to `self`,
  `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and a
  restrictive camera/microphone/geolocation permissions policy.
- `/opt/fleet/lib/verify-url.sh` passed against the live URL: 200 response,
  658 ms load, title/lang/one h1/main/alt/button checks, and zero errors.
- Desktop (1440 x 900) and mobile (390 x 844) had no horizontal overflow,
  console/page errors, or failed resource responses. Runtime capture observed
  only `https://pronunciation-cards.sociobot.in`; source and output inspection
  found no analytics, cookies, CDN fonts/scripts, telemetry, or cloud TTS.
- Axe scans found zero violations on home, privacy, terms, and the extension
  popup; specifically zero serious/critical findings.
- Keyboard starts on the visible skip link. Activating it sets `#main`; the
  next Tab lands on the first main action rather than the repeated header
  navigation. Focus styling is a visible solid outline.
- `prefers-reduced-motion: reduce` gives hero animation duration `1e-05s`.
  All checked mobile header/footer and popup controls are at least 44 px in
  the relevant dimension.
- The live service worker controls the page, supports offline reload after a
  visit, and rejects seeded stale HTML and ZIP cache entries while online.

Local-first privacy is confirmed: glossary/settings use `browser.storage.local`;
selection matching and Web Speech calls stay in-browser; the manifest requests
only `storage`, `contextMenus`, `activeTab`, and `scripting`, with no host
permissions.

## Performance measurement

Lighthouse 13.4.1 mobile collected scores of **100 performance / 100
accessibility / 100 best practices / 100 SEO** with FCP 1.0 s, LCP 1.1 s, TBT
70 ms, CLS 0, speed index 1.0 s, and 44 KiB transfer. The command exited
non-zero afterward because Chromium crashed while Lighthouse captured its
full-page screenshot (`TARGET_CRASHED`); the normal Playwright browser checks,
verify-url script, and report metrics all completed cleanly. Treat the score
as collected evidence with that harness caveat, not as a product runtime error.

## Defects

No release-blocking, high, medium, or low defects found in this candidate.

## Disposition

**PASS.** Candidate `50e5b28b7f2be6df6bbeaeba1149ab0ab2a3e987` meets the
researched brief and acceptance contract in fresh local and live verification.
