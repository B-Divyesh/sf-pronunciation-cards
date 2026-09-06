# Pronunciation Cards — visual thesis

## Direction: a quiet stall in the night market

Pronunciation is invisible metadata. The product makes it tangible as a row of
small, hand-labelled cards under the focused light of a night-market sign. The
surroundings stay ink-dark so the current word and its spoken form feel easy to
locate, while narrow neon edges create depth without becoming spectacle. This
is a working utility, not a nightlife poster: decoration only explains the idea
of portable cards and recedes during editing.

The product is intentionally **single-mode dark**. Its visual metaphor depends
on nighttime contrast, and one carefully tested palette is more predictable for
the low-vision audience than an automatic light/dark switch. Every state also
has text or an icon; hue is never the only signal.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#07111f` | page and popup background |
| `--night` | `#0d1d2e` | raised surfaces |
| `--night-high` | `#142a3d` | active/editing surfaces |
| `--paper` | `#fff8e7` | primary text and cards |
| `--mist` | `#b9c9d2` | secondary text (7.6:1 on ink) |
| `--lantern` | `#ffd166` | primary action/focus (12.4:1 with ink) |
| `--electric` | `#52e5e7` | successful speech/output (12.1:1 on ink) |
| `--orchid` | `#ff79b0` | warning/destructive accent (7.8:1 on ink) |
| `--success` | `#6ee7a5` | success label |
| `--danger` | `#ff8c8c` | errors |

Neon appears as a thin border or restrained shadow around the active object,
never as body text on a glowing background. The off-white “paper” keeps dense
reading comfortable.

## Type

- **Humanist sans:** `Atkinson Hyperlegible Next`, `Atkinson Hyperlegible`,
  `Verdana`, sans-serif where available. The system fallback is deliberate:
  there is no runtime font request, and the open letterforms support low vision.
- **Card notation:** `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace for
  aliases, IPA, and SSML where character distinction matters.
- Scale: 14 / 16 / 20 / 28 / clamp(40–68) px. Body never drops below 16 px on
  the site. Extension support labels may use 14 px but primary fields remain 16.
- Reading measure: 66 characters. Line height: 1.55 body, 1.1 display.

## Space and shape

An 8 px rhythm governs layout: 4 px only for tight label relationships; then
8, 16, 24, 32, 48, 64, and 96 px. Inputs and actions are at least 44 px high,
with 12–16 px rounded corners. Cards use a clipped top-right corner, suggesting
a physical index card without copying paper skeuomorphism. One-pixel borders
provide reliable boundaries at high zoom.

Phone layout drops the decorative hero caption, stacks the tool demo, and keeps
actions full-width. Safe-area padding protects the bottom edge. At 200% zoom,
the two-column layouts become one column without horizontal scrolling.

## Interaction grammar

- The selected term is the “card title”; alias and IPA are its annotations.
- The primary path is linear: select text → open extension → enter a spoken
  alias → preview → save. The popup announces selection and save state.
- Save emits a brief cyan edge glow and status text. Delete requires an exact
  confirmation and offers an undo action for the current session.
- A context-menu command captures selection; the popup also exposes a manual
  term field because browser selection is not always available.
- Tabs for Cards / Import & export use native buttons with `aria-selected` and
  arrow-key navigation.

## Motion

UI transitions run 160–220 ms and change opacity or transform only. The hero
cards settle upward once from their physical origin; saved cards enter from the
editor edge. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms,
scroll behavior, and nonessential transitions become instant while borders and
status copy retain the same hierarchy.

## Asset plan and provenance

- Product mark and interface icons: original hand-authored SVG, simple enough
  to remain crisp at extension sizes. MIT with the repository.
- Hero: one generated editorial still of blank paper pronunciation cards beneath
  abstract neon awnings. It communicates portable reading metadata without
  depicting a capability the extension does not have. Shipped as responsive
  WebP/AVIF with a PNG source retained in `assets/src/`. A 1200×630 WebP social
  preview is a crop of this same original image; no additional generated image
  was introduced for sharing metadata.

### Prompt sheet

**Use case:** stylized-concept. **Asset:** landing-page hero illustration.
**Subject/world:** a small fan of cream index cards, their ruled markings shown
only as abstract embossed strokes, resting on a dark indigo market counter under
overlapping fabric awnings. **Materials:** tactile uncoated paper, ink-blue
lacquer, translucent acrylic neon tubes, subtle rain speckles. **Light/lens:**
close 50 mm editorial still life, shallow depth but crisp card edges; cyan rim
light, warm amber key, a very small magenta reflection. **Palette words:** ink
navy, warm paper, lantern yellow, electric cyan, orchid. **Composition:** wide
landscape, object centered-right with generous quiet dark space and clean outer
edges. **Negative list:** no people, hands, faces, letters, readable text,
logos, brands, watermark, UI screenshot, microphones, headphones, floating
objects, excessive bloom, cyberpunk city, generic gradient.

Generation command/model: `/opt/fleet/lib/gen-image.sh`, deployment
`factory-image`, 1536×1024, medium quality. Generated 2026-08-28. The result is
original AI-generated imagery created for this repository; visual artifacts and
unintended marks are reviewed before inclusion.
