---
name: Tula
description: A Legal Metrology label check, issued as a definitive stamp sheet.
colors:
  paper: "#f3f5f6"
  frame: "#edf1f4"
  sheet: "#ffffff"
  stamp-paper: "#ffffff"
  gutter: "#e3e9ee"
  raised: "#f6f8f9"
  active: "#e3e9ee"
  border: "#e2e7eb"
  rule: "#edf0f3"
  control: "#c5ced6"
  ink: "#15233c"
  muted: "#475468"
  faint: "#5b6778"
  blue: "#1f56a3"
  blue-strong: "#17447f"
  blue-soft: "#e4ecf7"
  green: "#1f6b4e"
  sepia: "#7a4a1d"
  slate: "#3d5566"
  carmine: "#b0173f"
  postmark: "#23272f"
  pill-positive-bg: "#e1f1e9"
  pill-positive-ink: "#0f3d2c"
  pill-negative-bg: "#fbe8ed"
  pill-negative-ink: "#7a0f2b"
  pill-warning-bg: "#fff7e6"
  pill-warning-ink: "#8a4b06"
typography:
  display:
    fontFamily: "Rozha One, Mukta, Georgia, serif"
    fontSize: "clamp(42px, 4.6vw, 68px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Rozha One, Mukta, Georgia, serif"
    fontSize: "clamp(36px, 4.4vw, 64px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  denomination:
    fontFamily: "Rozha One, Mukta, Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.05
    fontFeature: "\"tnum\", \"lnum\""
  title:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
  figure:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "\"tnum\", \"lnum\""
  lead:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0px"
  sm: "3px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  full: "999px"
spacing:
  strip: "3px"
  sheet-inset: "8px"
  stamp-pad: "10px"
  card: "20px"
  page-x: "24px"
  section-y: "144px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.blue-strong}"
    textColor: "{colors.sheet}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.raised}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.active}"
    textColor: "{colors.ink}"
  button-sheet-value:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.blue}"
    rounded: "{rounded.none}"
    padding: "10px 20px"
  button-sheet-value-hover:
    backgroundColor: "{colors.blue-soft}"
  card:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  badge-positive:
    backgroundColor: "{colors.pill-positive-bg}"
    textColor: "{colors.pill-positive-ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "22px"
  badge-negative:
    backgroundColor: "{colors.pill-negative-bg}"
    textColor: "{colors.pill-negative-ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "22px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "34px"
  nav-item-active:
    backgroundColor: "{colors.active}"
    textColor: "{colors.ink}"
  segmented-track:
    backgroundColor: "{colors.active}"
    rounded: "{rounded.lg}"
    padding: "4px"
    height: "40px"
  segmented-option-active:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "32px"
  stamp:
    backgroundColor: "{colors.stamp-paper}"
    rounded: "{rounded.none}"
    padding: "{spacing.stamp-pad}"
---

# Design System: Tula

## Overview

**Creative North Star: "The Definitive Stamp Sheet"**

Every label check is issued as a sheet of six perforated stamps, one per Rule 6 declaration. A declaration that was found is printed in its series ink and cancelled with a circular postmark carrying its clause; one that was not found is overprinted "Not declared" in carmine. The material is philatelic and governmental: cool security paper, intaglio-dark ink, engraved double frames, guilloche underprint, perforated edges. It is a single light world, because the use scene is a desk in daylight; there is no dark theme.

Two registers share the world. The landing page (Persuade) is the sheet at full size: Rozha One inscriptions, large stamps whose picture windows hold real label crops, and the OCR text streaming in the selvedge while cancellations strike. The app (Operate) is a framed sheet: a tinted frame forms an L of sidebar and top bar, and the work happens on a white sheet inset from the window, perforated at its edge on desktop. Inside the app, density and alignment do the work: ledger-line figures, ruled tables, stamp strips as the per-row glyph of compliance.

Stamp material is a means of explanation, not ornament. Every stamp, strip and tally maps to a declaration and its clause; postmarks and overprints never appear without a declaration behind them. Perforation also edges the sheets themselves (the working sheet, the wordmark's stamp), because the sheet is the world.

**Key Characteristics:**
- Cool security-paper grounds (no cream), deep blue-black ink, stamp blue as the single action color.
- A definitive series of four stamp inks (blue, green, sepia, slate) assigned per declaration; carmine reserved for overprints.
- Perforation by alpha mask, engraved 6px double frames, guilloche underprint, postmarks struck at one fixed angle (-12deg).
- Rozha One for inscriptions and denominations, Mukta for everything read, tabular lining figures for every number.
- Flat paper: depth comes from tint steps and perforation, shadows only on floating layers.

## Colors

A cool, paper-and-ink palette: pale blue-grey grounds, a navy ink, one brand blue, three companion stamp inks, and one alarm red that is only ever struck over something.

### Primary
- **Stamp Blue** (blue): the brand, the primary action, the main data hue in charts and bars, the focus ring, the text selection, the caret, and the first ink of the definitive series (MRP, address). The landing's technical section is set reversed on a full Stamp Blue band.
- **Deep Stamp Blue** (blue-strong): hover and pressed state of Stamp Blue; text on Blue Wash.
- **Blue Wash** (blue-soft): brand tint behind the sheet-value hover, brand badges, the avatar disc and the evidence lines highlighted in the OCR stream.

### Secondary
- **Series Green** (green): definitive-series ink (net quantity, month and year); also the positive status hue.
- **Series Sepia** (sepia): definitive-series ink (country of origin).
- **Series Slate** (slate): definitive-series ink (consumer care).

### Tertiary
- **Overprint Carmine** (carmine): the "Not declared" overprint and its bars, the strike across a missing mini stamp, the negative status, destructive actions. It never fills a surface and never decorates.
- **Postmark Black** (postmark): circular cancellations and their wavy lines only.

### Neutral
- **Security Paper** (paper): the landing ground and the body default.
- **Selvedge** (frame): the app's frame (sidebar and top bar as one L, no rule between).
- **Sheet White** (sheet / stamp-paper): the working sheet, cards, inputs, and the paper inside every stamp.
- **Gutter** (gutter): the sheet between stamps, visible through perforations; the landing hero sheet's tone.
- **Raised** (raised) and **Active** (active): row hover and control tracks; active nav item and segmented track.
- **Hairline** (border), **Rule** (rule), **Control Edge** (control): card borders, table row rules, input and secondary-button strokes; Control Edge also inks unprinted (pending) stamp frames and scrollbar thumbs.
- **Intaglio Ink** (ink): all primary text and the heavy top rule of a ledger line.
- **Muted Ink** (muted) and **Faint Ink** (faint): secondary text, table headers, placeholders, icons.
- **Status pills** (pill-positive-*, pill-negative-*, pill-warning-*): tinted badge pairs; pill-negative-bg is also the paper of a missing mini stamp.

### Named Rules
**The Carmine Reserve Rule.** Carmine marks absence only: overprints, strikes across missing stamps, negative status and destructive actions. If it is not cancelling or flagging something, it is not carmine.

**The Definitive Series Rule.** Declarations take their ink from the series (blue, green, sepia, slate) in sheet order, and the ink travels with the declaration everywhere: stamp frame, denomination, picture window, mini stamp, tally.

**The One Action Ink Rule.** Stamp Blue is the only color for primary actions and links. Series inks are for declarations, never for buttons.

## Typography

**Display Font:** Rozha One (with Mukta, Georgia, serif)
**Body Font:** Mukta (with system-ui, -apple-system, Segoe UI, sans-serif)
**Label/Mono Font:** ui-monospace stack, only inside `<pre><code>` for raw OCR text and regex examples

**Character:** Rozha One is a high-contrast Devanagari-rooted display face, the engraved inscription of a stamp; Mukta is a plain, legible Indian humanist sans for every working word. Both load from Google Fonts (Mukta 400–800, Rozha One 400).

### Hierarchy
- **Display** (Rozha One 400, clamp(42px, 4.6vw, 68px), 1, -0.02em): the landing's sheet inscription (h1). The closing call scales to clamp(40px, 5.2vw, 80px); the footer nameplate to clamp(64px, 15vw, 224px) at 0.85 line height.
- **Headline** (Rozha One 400, clamp(36px, 4.4vw, 64px), 1.02, -0.015em): landing section headings, set directly with no label above them.
- **Denomination** (Rozha One 400, 30px on large stamps, 21px on medium; tabular): the declared value a stamp states, and sheet tallies such as "3 of 6".
- **Title** (Mukta 700, 24px, 1.25): app page headings. Card titles drop to Mukta 600, 16px.
- **Figure** (Mukta 600, 32px, tabular): the lead figure of a ledger-line KPI; other figures Mukta 500, 24px.
- **Lead** (Mukta 400, 18px, 1.6): landing paragraphs, measured to 52–66ch.
- **Body** (Mukta 400, 16px, 1.5): default text; app text runs at 14–15px.
- **Label** (Mukta 500, 14px): form labels, table body, button text at small size.
- **Caption** (Mukta 400, 13px): table headers (normal weight, Muted Ink), hints, badges, stamp heads (12–13px bold, in the stamp's ink).

### Named Rules
**The Tabular Figure Rule.** Every number that can be compared (counts, dates, clauses, prices, KPIs, denominations) is set with tabular lining figures.

**The Sentence Case Rule.** No uppercase labels, no tracked-out small caps, no label above a heading. Headings stand alone; table headers are plain Muted Ink at caption size.

## Layout

The landing runs on a 1376px content measure (the hero sheet at 1392px) with 16px phone gutters and 24–32px wider. Sections breathe on a long vertical rhythm (64px phone, 96px tablet, 128–144px desktop) and split 5/7 on a 12-column grid at `lg`. The hero is one toned sheet: a 60px top selvedge with the wordmark, plain links and the dashboard link; the inscription with the sheet-value box beside it; then a 3x2 sheet of large stamps beside a 268px right selvedge carrying the specimen photo, its tally and the streaming OCR. On phones the stamp sheet becomes a horizontal snap-scroll row, with a one-line instruction.

The app is a framed sheet: a 228px sidebar and a 48px top bar in the frame tint, and a white sheet inset 8px from the window's right and bottom edges. Page padding inside the sheet is 16px phone, 24px wider. Below 1024px the frame falls away, the sidebar becomes a 280px drawer, and the sheet becomes the screen. Dense surfaces use tables with 56px rows separated by single rules, and ledger-line KPI strips (2 columns phone, 3 or 4 wider).

Breakpoints are Tailwind's defaults (640, 768, 1024px); 1024px is where the framed sheet, its perforation and the sidebar appear.

## Elevation & Depth

The world is flat paper. Depth is a stack of tints (frame, gutter, paper, sheet) and the perforated edge where one sheet sits on another; stamps never cast shadows. Shadows exist only on layers that genuinely float above the sheet: the account menu, toasts, chart tooltips and the modal, all tinted with Intaglio Ink rather than black.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 8px 24px rgba(21,35,60,0.12)`): menus and toasts.
- **Tooltip** (`box-shadow: 0 4px 14px rgba(21,35,60,0.10)`): chart tooltips.
- **Dialog** (`box-shadow: 0 24px 48px -12px rgba(21,35,60,0.28)`): the modal, over a scrim of rgba(21,35,60,0.4).

### Named Rules
**The Paper Doesn't Float Rule.** Sheets, cards, stamps and tables sit flat; a shadow means the element can be dismissed.

## Shapes

Paper is square. Stamps, the landing sheet, the working sheet and the sheet-value box have no radius; their edge is either a perforation or an engraved double frame. Perforation is an alpha mask of holes of radius r on a 3r pitch: 5px on large stamps, 4px on medium stamps and the app sheet, 3px small, 1.6px on mini stamps and the wordmark; perforated elements carry at least 2r of padding. The engraved frame is a 6px double border in the stamp's ink. Cards, accordions and buttons keep a near-square 3px corner; inputs, nav items and icon buttons 6px; segmented tracks, menus, toasts and empty states 8px; the modal 10px; badges and avatars are full pills.

Every struck mark (postmark, overprint, mini-stamp strike) rotates to one shared cancel angle of -12deg.

## Components

### Buttons
Squared, firm and quiet; the color does the talking.
- **Shape:** near-square (3px).
- **Primary:** Stamp Blue fill, white Mukta 600 text; 32 / 36 / 48px heights at 14 / 15 / 17px.
- **Hover / Focus:** fill deepens to Deep Stamp Blue; 2px Stamp Blue focus outline at 2px offset; press scales to 0.97 over 140ms.
- **Secondary:** Sheet White with a Control Edge stroke, Raised on hover. **Ghost:** transparent Muted Ink, Active wash on hover. **Danger:** carmine text on white, or a solid carmine fill in confirmations. **Inverse:** white on Stamp Blue bands.
- **Sheet value:** the landing's headline action is a value box, not a pill: a 6px double frame in Stamp Blue on white, Mukta 700 20px "Check a label" over a 14px Muted Ink line; Blue Wash on hover.

### Chips
- **Style:** status badges are 22px full pills in tinted pairs (positive, negative, warning, brand, neutral) at 13px Mukta 500; "Compliant" and "Flagged" are the only status words.

### Cards / Containers
- **Corner Style:** 3px.
- **Background:** Sheet White.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px Hairline.
- **Internal Padding:** 20px; header 16px top.
- **Empty states** keep the frame as an 8px dashed Control Edge box with one sentence and the next step.

### Inputs / Fields
- **Style:** 1px Control Edge stroke on Sheet White, 6px corners, 40px height (selects 36px), 15px text, Faint placeholders, label above at 14px Mukta 500.
- **Focus:** border turns Stamp Blue plus a 2px Stamp Blue outline; caret is Stamp Blue.
- **Error / Disabled:** error text in carmine at 13px tied by aria-describedby; disabled fills Raised.

### Navigation
- **Sidebar:** frame-tinted, wordmark at top, 34px items at 15px with 16px line icons (1.6 stroke); active item is an Active wash in Mukta 600 Ink, idle items Muted Ink. Support links sit at the bottom.
- **Top bar:** 48px in the frame tint, a centred 548px search field, account menu on the right. On phones the bar shows the page title and a menu button that opens the drawer.
- **Landing:** plain text links in the top selvedge, Stamp Blue on hover.

### Stamp
The signature component. A perforated Stamp Paper figure holding an engraved 6px double frame in the declaration's ink, a guilloche underprint at 16% opacity, a head line (clause left, "Tula" right) in the ink, a picture window outlined in the ink whose label crop is greyscaled and screen-blended with the ink, the denomination in Rozha One, and the declaration name in Mukta 700 Ink. States: **present** is cancelled with the postmark at 88% opacity; **missing** carries the carmine overprint ("Not declared" between two bars), over the picture or in the value's place when there is no picture; **issued** is the unmarked series; **pending** is printed in Control Edge at 40% opacity. Sizes: large (landing sheet) and medium.

### Postmark
A circular cancellation in Postmark Black: two concentric rings, "Rule 6 · LMPC 2011" on the arc, the clause and the word "found" in the centre, and four wavy cancel lines running right, struck at -12deg.

### Stamp Strip and Tally
The app's row glyph: six 18x22px mini stamps in sheet order, each filled solid with its series ink when found, or left on negative-pill paper with a carmine strike when missing, followed by a one-line key wherever strips appear in a table. Missing-declaration counts up to 24 listings are tallied as mini stamps (14x18px); beyond that they become bars.

### Ledger-Line KPI Strip
Headline figures as a ledger line: a 2px Intaglio Ink rule above, a Hairline below, cells divided by 1px rules, label over value, no icons and no tiles.

### Wordmark
A single perforated mini stamp of value "6" in Stamp Blue with a Rozha One white numeral, beside "Tula" in Rozha One 24px.

### Motion
Ease-out is cubic-bezier(0.23, 1, 0.32, 1). Postmarks strike in 260ms and overprints in 240ms from a slight over-scale at the cancel angle; OCR lines arrive in 220ms. Landing sections rise 24px on entrance with a 75ms stagger, only at 768px and wider and never under reduced motion; app screens do not perform entrances. Reduced motion collapses strikes to 1ms and removes the press scale.

## Do's and Don'ts

### Do:
- **Do** give each declaration its series ink (blue, green, sepia, slate) and carry it through every stamp, strip and tally.
- **Do** strike every postmark, overprint and strike line at the shared -12deg cancel angle.
- **Do** cut stamp and sheet edges with the perforation mask and give perforated elements at least 2r of padding.
- **Do** set every comparable number in tabular lining figures.
- **Do** build app screens as a framed sheet: frame tint L, white sheet inset 8px, perforated from 1024px.
- **Do** present headline figures as a ledger line (2px Ink rule above, Hairline below, 1px dividers).
- **Do** keep monospace inside `<pre><code>` for raw OCR text and code samples only.

### Don't:
- **Don't** use carmine for anything that is not an overprint, a missing mark, a negative status or a destructive action.
- **Don't** add a dark theme; this world is a desk in daylight.
- **Don't** use cream or warm paper grounds; the paper is cool security white.
- **Don't** put shadows on stamps, sheets, cards or tables.
- **Don't** put an uppercase or tracked label above a heading.
- **Don't** strike a postmark or overprint, or print a stamp, strip or tally, without a declaration behind it.
- **Don't** let a series ink color a button or link; actions are Stamp Blue.
