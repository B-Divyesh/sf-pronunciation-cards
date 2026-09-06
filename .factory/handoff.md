# Pronunciation Cards verification 4 handoff

## Result

**FAIL — 1 low-severity finding and 0 untested claims.**

- Implementation reviewed: `71b1143bb85e8048e44f47b0923e2ddf10cc9757`
- Documentation baseline: `73e9488ec87a4ddaf6eb1919bf8eb3403f18ceda`
- Live URL: `https://pronunciation-cards.sociobot.in`
- Full report: `.factory/verification-4.md`

No product code was changed.

## What was verified

- Fresh checkout: `npm ci`, lint, typecheck, `npm test`, both npm audits, and
  the release package check passed.
- All 12 commands in `.factory/claims.json` were run separately and passed.
- Fresh desktop and phone sessions showed the job, audience, and sample action
  before scrolling.
- The demo loaded four realistic cards, previewed speech, copied SSML, exported
  JSON, reset correctly, preserved a real-data sentinel, discarded demo data
  on **Start for real**, reloaded offline, and made only first-party requests.
- Home, demo, privacy, terms, and the designed HTTP 404 passed semantic and Axe
  checks. Keyboard, focus, reduced motion, touch targets, links, titles,
  metadata, and 320 px reflow passed.
- Lighthouse mobile scored 100 in performance, accessibility, best practices,
  and SEO. LCP was 1.1 s and CLS was 0.
- The live ZIP was installed in a clean Chromium profile. Local save,
  validation, the 80-character boundary, duplicate recovery, speech preview,
  escaped SSML, search, delete/undo, import/export, persistence, permissions,
  and protected-page recovery passed with no outside requests or console
  errors.
- Every public runtime file and every extracted extension file matched the
  implementation build.

## Finding to fix

The `/demo/` sample-data banner is `position: static`. On a 390×844 phone it
scrolls completely out of view while the user works with lower cards, taking
**Reset demo** and **Start for real** with it. The demo contract requires the
sample label and these controls to remain visible throughout the demo.

Keep a compact demo label and the reset/exit actions visible on phone without
covering content. Recheck the top, middle, and bottom of the populated demo at
390×844 with normal and reduced motion.

## How to verify

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
```

Then run every `test` command in `.factory/claims.json` separately. On the live
phone demo, scroll to the final card and confirm that the complete sample label,
**Reset demo**, and **Start for real** remain visible and do not cover controls.

## Evidence

- `.factory/verification-4.md`
- `/work/.evidence/qa-report.md`
- `/work/.evidence/qa-result.json`
- `/work/.evidence/verification-4/`
