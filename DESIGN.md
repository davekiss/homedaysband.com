---
name: Homedays
description: Physical objects on a night-lit table — cream card stock, lamp light, walnut-black hardware, Theseasons headings.
colors:
  night-ground: "#100e0b"
  night-lift: "#1a1614"
  lamp-yellow: "#e9d27a"
  card-stock: "#efe6cf"
  spine-stock: "#e6dbbf"
  ink: "#2a2416"
  faded-ink: "#6b5f48"
  ink-raised: "#3a3220"
  lake-fog: "#b9ad8c"
  walnut-black: "#171310"
  walnut-lift: "#241e18"
  cream: "#f5efdd"
  root-parchment: "#e3e0cc"
  root-magenta: "#a41b77"
  root-night: "#0a0a0a"
  root-paper: "#ededed"
  pitch-blue: "#2B44FF"
  pitch-white: "#ffffff"
typography:
  display:
    fontFamily: "Theseasons, Georgia, serif"
    fontSize: "44px (56px at ≥900px, 64px at ≥1180px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Theseasons, Georgia, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.02em"
  spine:
    fontFamily: "Theseasons, Georgia, serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.26em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.18em"
  numeral:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
    fontFeature: "tnum"
rounded:
  none: "0"
  hairline: "1px"
  tight: "2px"
  soft: "4px"
  disc: "50%"
  pill: "9999px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "18px"
  lg: "22px"
  xl: "28px"
  2xl: "34px"
components:
  insert-panel:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    padding: "26px 18px"
  insert-panel-spine:
    backgroundColor: "{colors.spine-stock}"
    textColor: "{colors.ink}"
    typography: "{typography.spine}"
    padding: "12px 18px"
  button-play-disc:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.disc}"
    size: "84px"
  button-play-disc-deck:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.disc}"
    size: "52px"
  button-save:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  button-save-hover:
    backgroundColor: "{colors.ink-raised}"
  button-transport:
    textColor: "{colors.cream}"
    size: "40px"
  link-printed:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-home:
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    padding: "8px 16px 18px"
  deck:
    backgroundColor: "{colors.walnut-black}"
    textColor: "{colors.cream}"
    padding: "10px 14px"
  counter-digit:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    width: "14px"
    height: "22px"
  pitch-button-primary:
    backgroundColor: "{colors.pitch-blue}"
    textColor: "{colors.pitch-white}"
    rounded: "{rounded.soft}"
    padding: "16px 40px"
---

# Design System: Homedays

## Overview

**Creative North Star: "The Night-Lit Table"**

Everything Homedays puts on the web is an object you could pick up: a cassette deck, torn calendar pages, guitar picks, Polaroids, and now the unfolded J-card insert of a single. The screen is not a page; it is a dark wooden table late at night, lit from above by one warm lamp. Objects lie on that table and cast real shadows onto it. Paper is cream card stock with visible creases and a fine grain; hardware is walnut-black with a tape counter; text is printed in ink, never floating on a gradient.

Density is domestic rather than editorial. Small printed captions sit at the foot of things (a year, a catalogue line, "Also on Spotify · Apple Music"), big titles are set in the band's own display face, and the lamp's yellow is light, not paint: it pools on the ground, fills the progress track, rings a focused control, and highlights the lines printed on the NFC card. It never becomes a button colour. The site's atmosphere is the incumbent homepage's: warm, film-grained, nostalgic, a little hissy. The per-venue pitch pages are a separate, scoped surface (a bright blue-on-white one-sheet) and do not share this palette.

Two things this world is confirmed not to be: a smart-link page of stacked platform buttons, and a template artist site. Buttons exist (save-out links, the play disc, the transport), but they read as printed blocks and machined controls, not as a UI kit.

**Key Characteristics:**
- Objects on a dark ground: every surface is a lit thing casting a black, downward shadow onto night.
- Card stock and ink: cream paper, dark brown ink, faded ink for secondary print, visible creases and grain.
- One lamp: a single warm yellow used only as light (pool, fill, focus ring, highlight, selection).
- Theseasons for titles and spines; Geist for everything printed; tabular numerals wherever numbers tick.
- Square-cut paper, round discs, hairline-radius hardware; no soft radii on the house surfaces.
- Authored inline SVG icons at one stroke weight (1.8), round caps.

## Colors

A warm near-monochrome: two dark browns for the ground and the hardware, two creams for paper and print, one dark ink with a faded companion, and a single lamp yellow that behaves as light.

### Primary
- **Lamp Yellow** (`lamp-yellow`): the only chromatic accent on the house surfaces. It is a light source, so it appears as a 16%-alpha radial pool at the top of the night ground, as the progress-slider fill, as the 2px focus ring, as the text-selection colour, as a 55%-alpha highlighter behind lyric lines printed on the card, and as the link colour inside the "tape jammed" error line. It is never a button or panel fill.

### Neutral
- **Night Ground** (`night-ground`) and **Night Lift** (`night-lift`): the table. The page background is a top-to-bottom gradient from Night Lift to Night Ground with the lamp pool over it and a 7% screen-blended fractal grain. Night Lift is the same value the homepage's loader gradient starts from (`#1a1614 → #0f0e0c`), which is how the J-card sits in the same room.
- **Card Stock** (`card-stock`): the paper of the insert; cover panel, lyric fold, and the base of every panel. Carries a 26% multiply-blended grain so it reads as stock, not a flat fill.
- **Spine Stock** (`spine-stock`): one value darker than Card Stock, used for the spine panel so the folded strip catches less light. The back panel sits at its own slightly darker value (`#e9dfc6`) for the same reason; that value is panel-local, not a token.
- **Ink** (`ink`): all primary printed text on paper, the save-button block, the play disc's glyph, and the counter digits' numerals.
- **Faded Ink** (`faded-ink`): secondary print on paper: captions, credit roles, the tracklist side letter, time marks in the lyric margin, and the printed foot line.
- **Ink Raised** (`ink-raised`): the save button on hover, the block lifting one shade as it rises 1px.
- **Lake Fog** (`lake-fog`): the placeholder colour under the single art while it loads; taken from the foggy Lake Erie shoreline in the artwork.
- **Walnut Black** (`walnut-black`) and **Walnut Lift** (`walnut-lift`): the deck. Its face is a gradient from Walnut Lift down to Walnut Black under a 12% cream hairline. The counter window sinks below both to a component-local `#0b0907` well.
- **Cream** (`cream`): text and controls that sit on night or walnut: the home link, transport glyphs, time readouts, the play discs, the slider thumb, and the counter's digit tiles. On dark ground it is used at reduced alpha for secondary states (62% for the home link at rest, 70% for time readouts and seek buttons, 50% for the counter's reset).

### Incumbent root defaults
- **Root Parchment** (`root-parchment`) and **Root Magenta** (`root-magenta`): the `:root` `--background` / `--foreground` pair in `app/globals.css`, with **Root Night** / **Root Paper** as their `prefers-color-scheme: dark` swap. They are the inherited body defaults every built surface overrides; treat them as the fallback ground, not as the house accent.

### Scoped: the pitch pages
- **Pitch Blue** (`pitch-blue`) on **Pitch White** (`pitch-white`): the `/welcome/[band]` one-sheets are a single-hue surface: blue text on white, blue at 85–90% alpha for secondary copy, 15% alpha hairlines and dotted dividers, solid blue bands and CTA blocks with white text. This palette is scoped to that surface and does not travel to the house.

### Named Rules
**The One Lamp Rule.** Lamp Yellow is light, not paint. It may pool, fill a track, ring a focus, highlight a line, or colour selected text. It may not fill a button, a panel, or a heading. If a surface needs a "primary button", the answer is an Ink block with Cream text.

**The Same Room Rule.** A new house surface starts from the Night Lift → Night Ground gradient the homepage loader uses. Objects on it are Card Stock or Walnut Black. Do not introduce a third ground.

**The Faded Ink Rule.** Secondary text on paper is Faded Ink, never Ink at reduced opacity; secondary text on night is Cream at reduced alpha (50–70%), never a grey.

## Typography

**Display Font:** Theseasons (local OTF, weights 400 and 700, with Georgia / serif fallback)
**Body Font:** Geist (via `--font-geist-sans`, with system-ui fallback)
**Label/Mono Font:** Geist with `tabular-nums` for anything that counts; Geist Mono is registered (`--font-geist-mono`) but no built surface uses it yet

**Character:** A hand-cut display face against a plain, even sans. Theseasons carries the band's name and song titles the way hand-lettered stickers do; Geist is the small print on the card, so it stays quiet, tracked open in caps for captions and set tight in tabular figures for times and counters. The root stylesheet applies Theseasons bold to every `h1`–`h3` site-wide (`.bitcount-homedays, h1, h2, h3`), so headings need no per-surface font declaration.

### Hierarchy
- **Display** (700, 44px stepping to 56px at ≥900px and 64px at ≥1180px, line-height 0.95, -0.01em, `text-wrap: balance`): the song title on the back panel. One per surface.
- **Headline** (700, 22px, 0.02em): section titles on paper, e.g. "Lyrics" at the top of the fold.
- **Spine** (700, 15px, uppercase, 0.26em): the artist name along the spine; the song title inside it is Theseasons regular (400) at 20px, lowercase, 0.08em, and the year is Geist 11px at 0.22em in Faded Ink. On desktop the spine runs `vertical-rl` rotated 180° so it reads bottom-to-top like a shelved tape.
- **Body** (400, 15px, line-height 1.55, max 34ch): lyric lines. Notes and liner copy sit at 13px / 1.5 / max 36ch; the credits list at 12.5px / 1.5 in an `auto 1fr` definition grid.
- **Label** (400, 10–12px, uppercase, 0.14–0.22em, Faded Ink on paper or Cream-alpha on night): every printed caption: the cover foot, the meta line under the title, the tracklist, the foot line, the home link, the counter's reset. The 11px / 0.18em pair is the centre of the range.
- **Numeral** (400, 12px, `tabular-nums`): time readouts and lyric time marks. Counter digits are 700 at 14px in the same feature set.

### Named Rules
**The Tabular Rule.** Any number that changes while you watch it (time, counter, duration, a track index) is set in tabular numerals so the digits do not jitter.

**The Printed Caption Rule.** Small uppercase tracked text is a caption printed at the foot or margin of an object, or a subtitle under a title. It is never a kicker or eyebrow placed above a heading.

## Layout

The house surface is a single object on a table. On phones (`< 900px`) the insert is edge to edge: the table has no side padding (`20px 0`), the cover art fills the width at a 1:1 aspect, and the panels stack in one column with horizontal creases between them. The deck is fixed to the bottom edge with `env(safe-area-inset-bottom)` respected, and the table reserves `112px + safe-area` of bottom padding so the last panel clears it.

From `900px` the table is a `1180px` max-width column, padded `28px 32px 120px`, `min-height: 100dvh`, and flex-centred so the whole insert lies flat in one viewport. The insert becomes a grid of `1fr 48px 0.9fr` (cover, spine, back panel), or `1fr 48px 1fr 0.9fr` when a lyric fold is present; creases turn vertical. The deck's inner grid goes from two rows on phones (slider above; transport left, counter right) to one row of `transport | slider | counter | volume` with `20px` gaps, and the volume group, hidden on phones, appears. At `1180px` only the display size steps up.

Spacing rhythm on paper: `18px` side gutters and `26px` top padding per panel on phones, `28px` / `34px` on desktop; `22px` between blocks inside a panel; `12px` inside lists and credit rows; `8–10px` between grouped controls; `4–6px` for hairline seams. Interactive targets on paper are at least `44px` tall (the cover-foot links set `min-height: 44px`); transport buttons are `40px` on a `52px` play disc.

## Elevation & Depth

Depth is physical and hybrid: objects cast soft black shadows onto the table, paper carries multiply-blended grain and crease gradients, and hardware has inset wells. Shadows are always pure black at partial alpha with a negative spread, so they read as a lamp above the table rather than as UI elevation. Nothing has a coloured shadow or a hard offset.

### Shadow Vocabulary
- **Insert on table** (`box-shadow: 0 30px 60px -20px rgba(0,0,0,0.7), 0 8px 18px -6px rgba(0,0,0,0.5)`): the whole J-card resting on night.
- **Disc at rest** (`0 14px 36px -8px rgba(0,0,0,0.55)`): the 84px cover play disc; it settles to `0 6px 18px -6px rgba(0,0,0,0.5)` while playing.
- **Deck disc** (`0 8px 20px -6px rgba(0,0,0,0.6)`): the 52px play disc on the transport.
- **Deck lip** (`0 -18px 40px -16px rgba(0,0,0,0.8)`): the fixed deck throws its shadow upward onto the table it sits in front of.
- **Counter well** (`inset 0 2px 6px rgba(0,0,0,0.9)`): the digit window is sunk into the deck face.
- **Slider thumb** (`0 2px 8px rgba(0,0,0,0.5)`): the cream thumb, which is scaled to 0 at rest and appears on hover, focus, or drag.

Creases are two stacked gradients of Ink at 26% → 6% (into the fold) and 20% → 4% (out of it), `34px` deep on phones and `40px` wide on desktop, over a 1px Ink hairline at 38% (28% on desktop). Grain is one inline fractal-noise SVG tile: 7% `screen` over night, 26% `multiply` over paper.

### Named Rules
**The Lamp Shadow Rule.** Every shadow is black, blurred, negatively spread, and cast down (or up, from the deck) as if from one overhead lamp. Coloured glows and hard offset shadows do not exist in this world.

**The Paper Has Grain Rule.** Card Stock is never a flat fill; the grain overlay and crease gradients are part of the material, not decoration to be removed for "cleanliness".

## Shapes

Paper is square-cut: the insert, its panels, the save buttons, the tracklist, and the credits block all have `0` radius, with hairline 1px Ink rules at 35% alpha where the print needs a line. Round things are the mechanical parts: play discs are true circles (`50%`), slider thumbs are `12px` circles, tracks are pills (`9999px`). Hardware corners are barely eased: the counter window at `2px` and each digit tile at `1px`. The focus ring shares the `2px` radius. The only softer radius in the codebase is the pitch page's `4px` CTA, and it stays there.

Links printed on paper are underlined by a `1px` bottom border of Ink at 35% (rising to full Ink on hover), not by `text-decoration`; links on night use the default underline offset by `0.2em`.

## Components

### Buttons
Controls feel machined and pressable; printed links feel like ink on stock.
- **Play disc:** a Cream circle with an Ink glyph, `84px` on the cover art and `52px` on the deck (`button-play-disc`, `button-play-disc-deck`). Hover scales to 1.05 (1.04 on the deck), active presses to 0.96 (0.95), each over `200–220ms` on the spring curve `cubic-bezier(0.16, 1, 0.3, 1)`. The glyph nudges right by 8% of its size so the triangle reads centred.
- **Save (primary on paper):** a full-width Ink block with Cream text, `14px 16px` padding, 14px / 600 / 0.02em, a leading 18px brand mark and a trailing 60%-opacity arrow-out icon pushed to the right (`button-save`). Hover lifts 1px and shifts the block to Ink Raised (`button-save-hover`). Square corners.
- **Transport (seek):** `40px` square hit area, no fill, Cream at 70% rising to full Cream on hover; the glyph is a 26px circular-arrow SVG with a tiny "10" numeral (8px, 700) set inside it (`button-transport`).
- **Counter reset / mute:** text-only or glyph-only Cream at 50–60% alpha, full Cream on hover, `200ms ease`.
- **Focus (all):** `2px` solid Lamp Yellow outline, `3px` offset, `2px` radius.

### Printed links
- **Style:** `link-printed`: Label typography in Ink with a 1px Ink-at-35% bottom border under the word only (the icon sits outside the underline); border rises to full Ink on hover over `200ms`. Used for "Also on Spotify / Apple Music" at the cover foot and the site URL on the back panel.

### Cards / Containers
- **The insert** (`insert-panel`): Card Stock, Ink text, `26px 18px` padding on phones (`34px 28px` on desktop), no radius, the insert-on-table shadow, multiply grain. Panels are separated by creases, not borders.
- **The spine** (`insert-panel-spine`): Spine Stock, Spine typography, `12px 18px` horizontal on phones, `18px 0` vertical on desktop. Decorative (`aria-hidden`); the same facts print elsewhere on the card.
- **The deck** (`deck`): fixed bottom bar, Walnut Lift → Walnut Black gradient, 12%-Cream top hairline, upward deck-lip shadow, `10px 14px` padding plus safe-area (`12px 24px` on desktop).

### Inputs / Fields
No text inputs exist on the house surfaces. The only field-like control is the slider: a `3px` Cream-at-16% pill track, a Lamp Yellow fill, and a `12px` Cream thumb that is invisible at rest and scales in on hover/focus/drag (1.15 while dragging). The volume slider is the same at `2px` / `9px`.

### Navigation
- **Home link** (`nav-home`): a single arrow-left icon plus "Homedays" in Label typography, Cream at 62% rising to full Cream on hover. It sits above the insert on the table and is the only nav on the surface; the back panel's printed URL is the second way home.

### Tape counter
The signature hardware. Four Cream digit tiles (`14 × 22px`, 700, tabular) set in a `#0b0907` well with an inset shadow, a 12%-Cream hairline, `2px` radius, and `2px` gaps. It counts reel revolutions rather than seconds (2.7× clock), blinks its digits at `900ms` in two steps while loading, and has a Reset that zeroes it from the current position.

### Icons
All icons are authored inline SVG on a `24` viewBox: strokes at `1.8` with round caps and joins for arrows, seek, volume; filled paths for play, pause, and the Spotify and Apple Music marks. Sizes: 13px beside printed labels, 14px arrows, 18px in save buttons and the mute control, 22–30px play/pause glyphs. No icon fonts, no image icons, no Unicode glyphs.

### Motion
The insert unfolds on load: each panel rotates from `-62deg` (X on phones, Y on desktop) to flat over `1100ms` on `cubic-bezier(0.16, 1, 0.3, 1)`, staggered `160ms` per panel via `--i`, under `perspective: 1600px`. The cover art breathes to `scale(1.02)` over `1200ms` while playing. Hover and colour transitions are `200ms ease`; press and lift transitions use the spring curve. `prefers-reduced-motion` removes the unfold and the scale transitions entirely.

## Do's and Don'ts

### Do:
- **Do** start every house surface from the Night Lift → Night Ground gradient with the 16% Lamp Yellow pool at top centre and 7% screen grain (The Same Room Rule).
- **Do** place content as objects on that ground with the insert-on-table shadow, square corners, and multiply grain on paper.
- **Do** set titles in Theseasons 700 and let the root `h1`–`h3` rule do it; set all print in Geist, captions in 10–12px uppercase at 0.14–0.22em in Faded Ink.
- **Do** use `tabular-nums` for anything that ticks (The Tabular Rule).
- **Do** make the primary action on paper an Ink block with Cream text, and hover it to Ink Raised with a 1px lift.
- **Do** author icons as inline SVG at 1.8 stroke with round caps, sized 13–30px to their context.
- **Do** ring focus with 2px Lamp Yellow at 3px offset, and honour `prefers-reduced-motion` on every animation and scale transition.
- **Do** keep tappable print at least 44px tall on paper and respect `env(safe-area-inset-bottom)` under fixed hardware.

### Don't:
- **Don't** fill a button, panel, or heading with Lamp Yellow; it is light, not paint (The One Lamp Rule).
- **Don't** use coloured glows, hard offset shadows, or drop shadows on text; every shadow is black, blurred, and negatively spread (The Lamp Shadow Rule).
- **Don't** round the paper; 4px and larger radii belong only to the scoped pitch surface.
- **Don't** put a kicker or eyebrow above a heading; small caps are captions at the foot or a subtitle beneath (The Printed Caption Rule).
- **Don't** use icon fonts, Unicode glyphs, or system display faces; Theseasons is the only display face and icons are authored SVG.
- **Don't** bring Pitch Blue onto the house surfaces, or the house palette onto the pitch pages; they are separate rooms.
- **Don't** render secondary text as Ink at reduced opacity on paper; use Faded Ink (The Faded Ink Rule).
