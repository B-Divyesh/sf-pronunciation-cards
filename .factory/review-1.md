# Review: manage pronunciation rules for technical terms

**Verdict: FAIL**

Reviewed 2026-09-06 against `https://pronunciation-cards.sociobot.in`.

- Job: let a reader save a spoken form for a technical term, preview it, and
  reuse it when reading selected web text or copying SSML.
- Audience: blind and low-vision screen-reader users reading technical
  material with unfamiliar acronyms and names.
- Required first action: **Try it with sample data**, which should open the
  product in a separate sample-data sandbox. The live first action is instead
  **Download extension**.

The implementation reviewed is
`c3c0c3c7bbff6038594589dffbac8ae09b057bba` (`fix: repair release delivery and
cache freshness`). The release/documentation candidate is
`50e5b28b7f2be6df6bbeaeba1149ab0ab2a3e987`; the latest report-only commit is
`f10d04b732efbaed29f1af0a001561fc2bda2c7d`. There are no product-source
changes between the implementation commit and the report-only commits. The
live HTML, legal pages, service worker, and extracted extension files match a
fresh build of that candidate byte-for-byte. The ZIP container hash differs
only because ZIP metadata has a different timestamp.

## Findings

### High — no one-click sample sandbox

The first screen contains no **Try it with sample data** control. `/demo` is
not a product route, and the site has no persistent `Demo — sample data,
nothing is saved` label, **Reset demo**, or **Start for real** action.

The later **Hear sample** button only sends the fixed word “Kubernetes” to Web
Speech. It returned `Sample finished.` in a controlled browser probe and left
site storage unchanged, but it does not open the extension, show populated
cards, or demonstrate import/export/reading. It therefore cannot substitute
for the required browser-extension demo sandbox, and it cannot prove that
sample activity is separate from real extension data.

Evidence: fresh 1440x900 and 390x844 contexts at the live URL found zero
matching demo controls and zero demo-banner controls. Screenshots are
`/work/.evidence/review-1-live/fresh-desktop-top.png` and
`/work/.evidence/review-1-live/fresh-mobile-top.png`.

### High — public claims have no required test inventory or claim commands

`.factory/claims.json` is absent. Consequently there are no declared
`@claim:<id>` tests and no claim commands to run from a clean checkout. The
existing test suite exercises some behavior, but it cannot satisfy the claims
contract without a manifest that maps each visitor-facing promise to one
observable demo test.

I catalogued **18 untested public claims** on the landing page and README:

1. a saved pronunciation is reused;
2. installed browser voices preview aliases;
3. selected text is read with matching aliases;
4. SSML can be copied for compatible tools;
5. terms, aliases, IPA, and notes are local;
6. a glossary stays in the browser;
7. JSON can be exported, inspected, and shared;
8. JSON imports can merge or replace;
9. the product works without an account;
10. it has no analytics;
11. it has no cloud TTS;
12. it works without a network connection;
13. selected page text is not sent by the product;
14. the site has no cookies or third-party runtime resources;
15. active-tab access happens only after an explicit action;
16. protected pages give the stated recovery path;
17. the service worker refreshes pages and downloads while online;
18. installation is “ready in about two minutes.”

Several are plausible and some have ordinary tests, but a missing claims
manifest means none has the required declared sandbox proof. The number above
is the `untested_claim_count` used in the accompanying result JSON.

### Medium — the first screen does not name its audience or give the required sample action

The fresh, unscrolled screen says `Make technical words sound familiar.` and
shows **Download extension** and **Installation guide**. It does not say that
the product is for blind and low-vision screen-reader users. It also uses
non-informational copy such as `Your words. Your voice rules.` and a headline
that does not state the concrete job. The lede is 24 words, over the
plain-words 22-word limit. This misses the required first-screen shape even
apart from the missing demo.

### Medium — an unknown URL is a successful landing page, not a designed 404

`GET /review-missing-route-9c3d` returns `200 text/html`, the landing-page
title, and the landing-page H1. `staticwebapp.config.json` rewrites unknown
routes to `/index.html` and has no 404 override or `404.html`. A deliberate
HTTP 404 would be acceptable; this is a defect because visitors and assistive
technology cannot tell that the requested route does not exist.

### Low — the documented clean setup has a current development dependency advisory

Fresh `npm ci` followed by `npm audit --audit-level=low` reports one moderate
advisory for `fflate@0.8.2` (`GHSA-px8p-9vwx-vf98`), with the offered update
outside the declared range. `npm audit --omit=dev --audit-level=low` reports
zero production vulnerabilities. This replaces the earlier, larger
development-tree issue; it remains a clean-workstation quality finding.

## Checks that passed

- Fresh desktop and phone browser contexts loaded the live home page with no
  console or page errors. Phone width was 390px with `scrollWidth` 390px.
- `/opt/fleet/lib/verify-url.sh` passed against the live URL: HTTP 200,
  title, `lang=en`, one H1, main landmark, image alternatives, labelled
  controls, and no console errors.
- Live axe scans had zero violations on `/`, `/privacy/`, and `/terms/`. The
  extracted live extension popup also had zero axe violations and no console
  errors. Keyboard starts at the skip link; mobile header/footer controls and
  visible extension import/undo controls measured at least 44px high.
- The live ZIP returns `200 application/zip`, begins `PK`, unpacks to nine
  files, and those files exactly match the clean candidate build. All public
  links on the landing page returned 200 or a valid external GitHub response.
- In a clean Chromium extension profile loaded from that live ZIP: empty save
  focused the term and announced the recovery; an 80-character term saved;
  a normal Kubernetes card saved; a case-insensitive duplicate was rejected;
  changing it to Docker recovered; malformed JSON gave an actionable error;
  a valid empty glossary imported; delete opened its confirmation and Undo
  restored the card. This covers normal, invalid, boundary, and recovery
  paths without touching existing user data.
- Offline reload passed after first visit and showed the offline notice.
  In a controlled live service-worker client, seeded stale HTML and ZIP cache
  entries were bypassed online; the reloaded page was fresh and the ZIP again
  began `PK`.
- Privacy/runtime capture observed only the first-party origin. The live page
  sends CSP, HSTS, `Referrer-Policy: no-referrer`, `nosniff`, and restrictive
  camera/microphone/geolocation permissions. Privacy and terms titles are
  correct.

## Clean-checkout command evidence

Clean checkout: detached `f10d04b732efbaed29f1af0a001561fc2bda2c7d`, Node
22.23.2, npm 10.9.8, Playwright Chromium 1.58.2.

| Command | Result |
| --- | --- |
| `npm ci` | Pass; installed 268 packages |
| `npm audit --audit-level=low` | Fail; one moderate development advisory |
| `npm audit --omit=dev --audit-level=low` | Pass; zero vulnerabilities |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass; 6 unit and 8 Playwright tests |
| `npm run build:site` | Pass |
| `npm run test:release` | Pass; 15,453-byte ZIP with nine matching files |

There are no declared claim commands because the required claims manifest is
missing. No claim command was skipped or concealed.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live release ZIP was 404 | Resolved: live ZIP is 200/application-zip and extracted contents match the candidate. |
| Service worker could retain stale HTML/ZIP | Resolved: live stale-cache probe bypassed both sentinels while online. |
| Mobile and popup controls were under 44px | Resolved: current sampled controls are 44px or taller; extension import is 368x44 and Undo is 76.8x46. |
| Twelve vulnerable development dependencies | Superseded by the new Low finding: one current moderate `fflate` advisory; production audit remains clean. |
| Popup tab landmark axe issue | Resolved: live-artifact popup axe scan has zero violations. |
| AVIF MIME type and immutable stable assets | Resolved: AVIF is `image/avif`; download is `no-cache, must-revalidate`; stale-cache probe passes. |

## Required disposition

Do not mark this product PASS. Add a direct `/demo` (or `?demo=1`) extension
sandbox with realistic populated data and the persistent demo controls; add
and execute `.factory/claims.json` tests for every public claim; repair the
first-screen language; serve a real designed 404; and resolve or explicitly
update the current `fflate` development dependency advisory. Re-review after
those changes. Until then the result is **FAIL: 5 findings and 18 untested
claims**.
