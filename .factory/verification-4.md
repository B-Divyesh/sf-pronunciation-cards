# Verify saved pronunciations for technical words — FAIL

Verified at **2026-09-06T01:38:50Z**.

- Verdict: **FAIL**
- Findings: **1** (0 critical, 0 high, 0 medium, 1 low)
- Untested claims: **0**
- Implementation reviewed: `71b1143bb85e8048e44f47b0923e2ddf10cc9757`
- Documentation baseline: `73e9488ec87a4ddaf6eb1919bf8eb3403f18ceda`
- Live URL: `https://pronunciation-cards.sociobot.in`

The implementation and documentation SHAs differ only because `73e9488`
changes `.factory/handoff.md`. Every public runtime file from a fresh build of
the candidate matches the live deployment byte for byte. The live ZIP has
different timestamp metadata, but all nine extracted files match.

## Job, audience, and first action

Before scrolling in fresh 1440×900 and 390×844 browser contexts:

- Job: save pronunciations for technical words.
- Audience: blind and low-vision screen-reader users who need technical names
  read predictably.
- First action: **Try it with sample data**. The adjacent text says it opens a
  populated sample glossary.

The headline, audience sentence, and first action were fully visible at both
sizes. The phone page had no horizontal overflow.

## Finding

### Low — the demo label and exit controls do not remain visible on a phone

The demo contract requires a persistent sample-data banner with **Reset demo**
and **Start for real**. The live `/demo/` banner is a normal static element.
At 390×844, the populated page is 3,298 CSS pixels tall. At the bottom of the
page, `scrollY` is 2,454 and the banner spans `-2386` to `-2249.8` relative to
the viewport. The sample label and both controls are therefore completely out
of view while a user works with the lower cards.

The sandbox itself is isolated and the lower actions say “sample,” so this is
not a data-loss defect. It is still a failure of the required persistent demo
state. Evidence:
`/work/.evidence/verification-4/fresh-phone-demo.png` and
`/work/.evidence/verification-4/fresh-phone-demo-bottom.png`.

Expected: keep the sample-data label and its reset/exit controls visible while
the demo is in use, including at the bottom of the phone layout.

## Clean-checkout checks

A separate clone was checked out detached at documentation SHA `73e9488`.
Node was 22.23.2, npm was 10.9.8, and Playwright Chromium was 1.58.2.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 268 packages installed; 0 vulnerabilities. |
| `npm run lint` | PASS | ESLint completed without findings. |
| `npm run typecheck` | PASS | WXT preparation and `tsc --noEmit` completed. |
| `npm test` | PASS | 6 unit tests and 21 browser tests passed. |
| `npm audit --audit-level=low` | PASS | 0 vulnerabilities. |
| `npm audit --omit=dev --audit-level=low` | PASS | 0 vulnerabilities. |
| `npm run test:release` | PASS | 15,453-byte ZIP and nine matching extension files. |

The fresh build produced `dist/extension/chrome-mv3/`, `dist/site/`, and the
download ZIP. Initial site JavaScript is 0.98 kB gzip, CSS is 3.95 kB gzip,
the mobile AVIF is 36,708 bytes, and the unpacked extension is 32.07 kB.

## Declared claims

`.factory/claims.json` contains 12 entries. Each ID appears in exactly one
tagged test. Every declared command was run separately from the clean checkout.

| Claim | Command result | Observed outcome |
| --- | --- | --- |
| `demo-isolation` | PASS | Four sample cards and transformed text loaded; the real-data sentinel was unchanged. |
| `demo-reset` | PASS | Removing ngrok and resetting restored all four cards. |
| `browser-preview` | PASS | The browser speech fixture received `cue burr NET eez`. |
| `selected-text` | PASS | Whole-term, overlapping, case, punctuation, and inside-word rules passed. |
| `ssml-copy` | PASS | Kubernetes produced copyable IPA SSML. |
| `json-export` | PASS | The downloaded JSON parsed and contained all four sample cards. |
| `private-demo` | PASS | Requests stayed first-party, cookies stayed empty, and storage was namespaced. |
| `offline-demo` | PASS | A dedicated context reloaded the populated demo offline. |
| `extension-local-storage` | PASS | The packaged extension saved a card locally with no outside request. |
| `json-import` | PASS | Merge and full replacement both changed the packaged glossary correctly. |
| `explicit-permissions` | PASS | Manifest permissions are action-scoped and host permissions are empty. |
| `free-download` | PASS | The no-account download returned a valid ZIP larger than 10 kB. |

The landing page, demo, legal pages, extension copy, and README were checked
against this inventory. No public claim was missing, false, incomplete, or
left untested. `untested_claim_count` is therefore 0.

## Live demo and site checks

- The one-click action opened `/demo/` with Kubernetes, OAuth, PostgreSQL, and
  ngrok. The populated output was `cue burr NET eez services use oh auth with
  POST gres cue ell.`
- Preview sent the saved alias to the controlled speech API. Copy SSML returned
  `<speak><phoneme ...>Kubernetes</phoneme></speak>`. JSON export contained all
  four realistic cards.
- Remove changed the count from four to three. Reset restored four cards and
  announced that real extension data was unchanged.
- The demo wrote only `demo:pronunciation-cards:cards`; a real-data sentinel
  remained unchanged. **Start for real** removed the demo key, preserved the
  real sentinel, and opened `/#install`.
- All observed website and demo requests were first-party and cookies were
  empty.
- A dedicated service-worker context reloaded the populated demo offline.
  Seeded stale demo and ZIP responses were bypassed online; the new page loaded
  and the download still began with `PK`.
- Every internal link returned 200 or had a valid fragment target. `/`,
  `/demo/`, `/privacy/`, and `/terms/` have distinct correct titles.
- `/review-missing-route-verify4` deliberately returned HTTP 404 with title
  `Page not found — Pronunciation Cards`, one H1, and a route back. Chromium's
  expected failed-resource message for that deliberate document 404 is not a
  product error.
- The standard URL verifier passed with title, `lang=en`, one H1, one main,
  image alternatives, labelled controls, and no console errors.

## Accessibility, keyboard, and performance

- Playwright Axe scans found zero violations on home, demo, privacy, terms,
  the designed 404, and the installed extension panels.
- `@axe-core/cli` could not start because this worker has no ChromeDriver. The
  required Axe engine was exercised through the repository's pinned
  Playwright integration and an independent live scan, so no accessibility
  check was left untested.
- Keyboard focus starts on the visible skip link. Activating it moves the next
  Tab into the main content. All sampled focus outlines were 3 px lantern
  yellow, tab arrow navigation worked, dialog focus began on **Keep card**, and
  no trap was found.
- Every visible link, button, summary, and form control on all five phone routes
  measured at least 44×44 CSS pixels. The routes also reflowed at 320 px with
  no clipped content or horizontal overflow.
- Reduced motion changed both hero animations to `0.00001s` and restored normal
  scroll behavior.
- Lighthouse mobile scored 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. FCP was 0.9 s, LCP 1.1 s, TBT 40 ms, CLS 0, and total
  transfer 45 KiB. The JSON report is
  `/work/.evidence/verification-4/lighthouse.json`.

## Installed extension checks

The live ZIP was expanded into a new directory and loaded as an MV3 extension
in a fresh Chromium profile.

- Empty save and empty preview gave specific recovery text; empty save returned
  focus to the written-term field.
- An 80-character boundary term saved. A case-insensitive duplicate was
  rejected. Kubernetes then saved with alias, IPA, and a private note.
- Preview used the saved alias at rate 0.9. SSML escaped XML-sensitive IPA.
- Search miss and recovery, delete cancel, confirmed delete, Undo, export,
  empty import, malformed JSON, unsupported schema, merge import, replace
  import, and storage persistence after reload all worked.
- A pending selected term populated the editor. Reading from a protected
  extension page returned the documented “Try a regular web page” guidance.
- The popup had one H1, one main, `lang=en`, clear focus, 44 px controls, zero
  Axe violations, and no console or page errors.
- Every recorded request used the extension's own `chrome-extension://`
  origin. The manifest requests `storage`, `contextMenus`, `activeTab`, and
  `scripting`, with no persistent host permission.

Opening the toolbar popup with a browser-granted `activeTab` selection cannot
be reproduced in headless Chromium. The packaged handoff, replacement logic,
pending-selection flow, permissions, and protected-page recovery were tested.
This automation limit is not a product finding.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live release ZIP returned 404 | Resolved; the live 15,453-byte ZIP is 200 `application/zip`, and all nine files match the candidate. |
| Service worker retained stale page and ZIP content | Resolved; seeded stale entries were bypassed online and the demo reloaded offline. |
| Mobile and popup targets were smaller than 44 px | Resolved; full live-route and popup measurements passed. |
| Development dependency vulnerabilities | Resolved; both full and production-only audits report zero vulnerabilities. |
| Popup tab list lacked a landmark | Resolved; independent Axe scans report zero violations. |
| AVIF MIME and immutable stable assets | Resolved; AVIF is `image/avif`, the ZIP is `no-cache, must-revalidate`, and update probes passed. |
| No one-click isolated sample | Mostly resolved; the demo is isolated and functional, but the new finding above covers its non-persistent phone banner. |
| Missing claim inventory and commands | Resolved; all 12 unique claim commands passed. |
| First screen omitted the audience and sample action | Resolved on desktop and phone before scrolling. |
| Unknown routes returned the home page | Resolved with a designed HTTP 404. |
| `fflate` advisory | Resolved by 0.8.3; both audits are clean. |

## Verdict

**FAIL — 1 finding and 0 untested claims.** The product works and every public
claim passed, but a PASS requires zero findings. Keep the demo label and its
reset/exit controls visible throughout the phone demo, then rerun the live
phone check.
