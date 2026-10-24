---
name: WhereRUKitty
description: Handheld feline acoustic caller and listening-window radar for mobile and tablet
colors:
  salmon-coral: "#B83227"
  salmon-coral-deep: "#99261C"
  salmon-coral-soft: "#FCEAE8"
  salmon-coral-border: "#EDAFA9"
  marigold-amber: "#8F5105"
  marigold-amber-bright: "#E59838"
  marigold-amber-soft: "#FDF2E1"
  marigold-amber-border: "#E8C389"
  cat-eye-emerald: "#116647"
  cat-eye-emerald-bright: "#2CC990"
  cat-eye-emerald-soft: "#E4F5EE"
  cat-eye-emerald-border: "#98D6BE"
  sardine-navy: "#122038"
  sardine-navy-elevated: "#1B2E4F"
  sardine-navy-subtle: "#263E68"
  sardine-shell-text: "#F4F7FB"
  sardine-shell-muted: "#C4D3E8"
  harbor-pewter: "#EEF2F7"
  porcelain-surface: "#FFFFFF"
  slate-tin: "#E2E8F0"
  slate-tin-hover: "#D5DFEC"
  navy-slate-ink: "#334766"
  navy-slate-muted: "#4A6082"
  border-subtle: "#CBD5E1"
  border-strong: "#94A3B8"
  scrollbar-thumb: "#64748B"
typography:
  display:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.35
    fontFeature: "tnum"
  caption:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    fontFeature: "tnum"
  badge:
    fontFamily: "'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  xs: "0.25rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.75rem"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.salmon-coral}"
    textColor: "{colors.porcelain-surface}"
    rounded: "{rounded.md}"
    padding: "8px 18px"
  button-primary-hover:
    backgroundColor: "{colors.salmon-coral-deep}"
  button-secondary:
    backgroundColor: "{colors.slate-tin}"
    textColor: "{colors.sardine-navy}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  card-panel:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.sardine-navy}"
    rounded: "{rounded.lg}"
    padding: "18px"
---

# Design System: WhereRUKitty

## Overview

**Creative North Star: "The Coastal Apothecary & Gourmet Tin"**

WhereRUKitty is an Operate-mode handheld utility used by cat owners walking through rooms, peeking under beds, and checking closets with a phone or tablet in one hand. Its visual language draws from gourmet wet cat food tin lithography and clean veterinary apothecary labels: a Deep Sardine Navy top shell that anchors the live Call-and-Listen transport deck, paired with Cool Harbor Pewter and Porcelain surfaces that keep the 12 acoustic triggers scannable at a glance.

Every visual decision serves the core acoustic ritual: calling the cat for a timed window, then falling silent so the owner and the Ear-Perk microphone radar can catch a faint meow reply. Colors encode real acoustic states rather than decoration, and a one-tap Dim-Room mode plus an Under-Sofa Screen Torch adapt the surface for dark corners without blinding the user or startling a timid cat.

**Key Characteristics:**
- Committed Deep Sardine Navy shell contrasting against Cool Harbor Pewter and Porcelain work panels
- Semantic three-state acoustic signaling: Salmon-Coral for active emission, Marigold Amber for the silent listening window, and Cat-Eye Emerald for detected feline replies
- Single-family Thai/Latin workhorse sans-serif with strict tabular numerals on all timers, frequencies, and decibel readouts
- Container-query and breakpoint-driven responsive architecture scaling from a one-thumb phone transceiver to a two-column tablet field console

## Colors

The palette pairs a high-contrast maritime tin shell with crisp clinical-grade light panels and three unmistakable state accents.

### Primary
- **Rich Salmon-Coral** (`#B83227` day / `#F47B6E` dim): Primary call-to-action buttons, active sound emission indicators, and range slider progress fills.
- **Salmon-Coral Soft Tint** (`#FCEAE8`): Selected scenario preset background and active sound pad highlight.

### Secondary
- **Marigold Amber** (`#8F5105` badge / `#E59838` meter): Marks the Quiet Listening Window phase when speaker output pauses and the microphone watches for a reply.
- **Marigold Amber Soft Tint** (`#FDF2E1`): Highlight fill for sounds currently queued in the automatic rotation.

### Tertiary
- **Cat-Eye Emerald** (`#116647` day / `#2CC990` spectrum): Signals a detected meow spike during the quiet listening window and marks sounds confirmed to work ("แมวหันแล้ว").

### Neutral
- **Deep Sardine Navy** (`#122038`): Top header shell, Dual-Phase Transport Deck background, and primary body text ink on light surfaces.
- **Sardine Navy Elevated** (`#1B2E4F`): Transport sub-containers, spectrum housing, and mobile bottom bar buttons.
- **Cool Harbor Pewter** (`#EEF2F7`): Main page ground in Day mode, avoiding generic warm-cream defaults while keeping glare low.
- **Porcelain Surface** (`#FFFFFF`): Elevated section containers for presets, the 12-sound trigger deck, tuning sliders, and checklists.
- **Slate-Tin Panel** (`#E2E8F0`): Secondary interactive surface for unselected preset buttons, category tabs, and radar status banners.
- **Navy-Slate Secondary Ink** (`#334766`): Tinted secondary copy and descriptions (never neutral gray).

### Named Rules
**The Acoustic State Triad Rule.** Salmon-Coral, Marigold Amber, and Cat-Eye Emerald are reserved strictly for the three phases of finding a cat: Calling (emission), Listening (quiet window), and Detected (cat response or confirmed trigger). Never use them as arbitrary decorative splashes.

**The Tinted Secondary Ink Rule.** Secondary text on both Porcelain panels and the Deep Sardine Navy shell is always tinted with navy-slate hue (`#334766` on light, `#C4D3E8` on dark shell) rather than achromatic gray.

## Typography

**Display Font:** Noto Sans Thai (with `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` fallback)
**Body Font:** Noto Sans Thai (with system UI sans fallback)

**Character:** A single, highly legible Thai/Latin humanist UI sans-serif carries every heading, button, frequency label, and checklist item so the user can scan Thai instructions and acoustic units effortlessly while walking.

### Hierarchy
- **Display** (700 weight, `1.625rem`, `1.2` line-height, `-0.015em` tracking): Application title in the top shell header.
- **Headline** (700 weight, `1.25rem`, `1.25` line-height): Section headings across the primary and secondary workspace panels (`1.25x` step above body).
- **Title** (700 weight, `0.9375rem`, `1.35` line-height): Sound pad titles, scenario preset titles, and active transport readout.
- **Body** (400 weight, `1rem`, `1.5` line-height, max `68ch` measure): Supporting instructions and dialog guidance.
- **Label** (600–700 weight, `0.8125rem` / `0.75rem`, `font-variant-numeric: tabular-nums`): Frequency bands (`280 – 1,950 Hz`), countdown timers, dB meters, and action pills.

### Named Rules
**The Tabular Acoustic Readout Rule.** Every element displaying seconds, hertz, percentages, decibels, or checklist counts must apply `font-variant-numeric: tabular-nums` so live updates never jitter horizontally.

**The No-Kicker Rule.** Section headings stand directly at the top of their container without eyebrow labels or uppercase kickers above them.

## Layout

The layout uses a responsive two-tier structure anchored by `max-inline-size: 1200px` and `min-block-size: 100dvh`:
- **Mobile (`< 768px`):** Single-column flow with the Dual-Phase Transport Deck at the top and a fixed four-button One-Thumb Bar (`position: fixed; inset-block-end: 0`) at the bottom for single-handed operation while peeking under furniture.
- **Tablet & Desktop (`≥ 840px`):** Two-column asymmetric console (`grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.95fr); gap: 1.5rem`) placing the Scenario Presets, 12-Sound Pad Deck, and Acoustic Tuning on the left, and the Live Ear-Perk Radar, Custom Voice Recorder, and Hiding Spot Checklist on the right.
- **Component Container Queries:** The sound pad deck uses `@container sound-deck (min-width: 540px)` to switch from 1 column to 2 columns based on its own container width.

## Elevation & Depth

Surfaces rely primarily on structural 1px borders (`#CBD5E1` in Day mode, `#283C5E` in Dim mode) paired with restrained, neutral offset elevation shadows on top-level containers. Colored glow shadows are strictly avoided.

### Shadow Vocabulary
- **Panel Elevation** (`box-shadow: 0 4px 14px rgba(18, 32, 56, 0.07)`): Applied to top-level `.panel-section` containers to lift Porcelain panels off the Harbor Pewter page ground.
- **Shell Elevation** (`box-shadow: 0 6px 20px rgba(10, 18, 34, 0.18)`): Applied to the Deep Sardine Navy top header shell.
- **Button Elevation** (`box-shadow: 0 3px 10px rgba(8, 15, 26, 0.28)`): Neutral depth under the primary Call-and-Listen CTA button inside the dark shell.

### Named Rules
**The No-Nested-CardShadow Rule.** Only top-level `.panel-section` containers carry `var(--shadow-elevated)`. Inner sound pads, sliders, and checklist rows use flat backgrounds and `1px solid var(--border-subtle)` borders without nested shadows.

## Shapes

- **Panel Containers:** `12px` (`0.75rem`) border radius with `1px` solid border.
- **Interactive Pads, Sliders, & Transport Boxes:** `10px` (`0.625rem`) border radius.
- **Compact Buttons & Inputs:** `8px` (`0.5rem`) or `6px` (`0.375rem`) border radius.
- **Phase Badges & Voice Status Pills:** Full pill radius (`999px`).

## Components

### Buttons
- **Shape:** Gently rounded corners (`10px` on primary transport CTAs, `8px` on secondary actions, `6px` on mini pad actions).
- **Primary (`.cycle-cta-btn`):** Rich Salmon-Coral (`#B83227`) background with white (`#FFFFFF`) 700-weight text, `8px 18px` padding, shifting to Marigold Amber (`#8F5105`) when the loop is actively running.
- **Hover / Focus:** Darkens to `#99261C` on hover; `:focus-visible` renders a `2.5px solid` high-contrast outline with `3px` offset.
- **Secondary (`.secondary-btn`):** Slate-Tin (`#E2E8F0`) fill with `1px solid #94A3B8` border and Deep Sardine Navy text.

### Chips
- **Style:** Used in the Sequence Queue strip (`.queue-chip`) and sound pad category tags (`.sound-pad-cat-tag`). Compact `6px` radius with `1px` border and tabular numbering.
- **State:** Active queue chip highlights with `#F48F86` border and `#3E1F28` fill inside the transport shell.

### Cards / Containers
- **Corner Style:** `12px` radius on `.panel-section`; `10px` on `.sound-pad-item`.
- **Background:** Porcelain (`#FFFFFF`) for `.panel-section`; Harbor Pewter (`#EEF2F7`) for inner `.sound-pad-item` rows.
- **Shadow Strategy:** Single neutral offset shadow on `.panel-section`; zero shadow on inner items.
- **Border:** `1px solid #CBD5E1`.
- **Internal Padding:** `18px` (`1.125rem`) on panels; `12px` (`0.75rem`) on sound pads.

### Inputs / Fields
- **Style:** Native `<input type="range">` styled via custom properties (`--slider-progress`) and vendor track/thumb pseudo-elements; native `<input type="checkbox" switch>` for binary toggles; text inputs with `8px` radius and `1px solid #94A3B8` border.
- **Focus:** `2.5px solid` outline with `3px–4px` offset.
- **Error / Disabled:** Text inputs use `:not([type="range"]):user-invalid` to show `#B83227` border and `#FCEAE8` background only after user interaction.

### Navigation
- **Top Header & Mobile Thumb Bar:** Top header holds the brand lockup, Dim-Room theme switch, and Under-Sofa Torch dialog trigger. On viewports `< 768px`, a fixed 4-action bottom thumb bar keeps Start/Stop Loop, Mother Cat Call, Wet Can Open, and Torch within immediate thumb reach.

### Dual-Phase Call & Listen Transport Deck
The signature component of WhereRUKitty sits inside the Deep Sardine Navy header shell. It pairs a two-segment timeline meter (`1. ส่งเสียงเรียก` in Salmon-Coral vs. `2. เงียบฟังเสียงเหมียวตอบ` in Marigold Amber) with a 24-bar HTML5 Canvas frequency spectrum (`400 Hz – 6.0 kHz`) that switches to Cat-Eye Emerald (`#2CC990`) the instant a sound spike is detected during the listening window.

## Do's and Don'ts

### Do:
- **Do** use authored inline SVGs with consistent `1.75px`–`2px` stroke width and rounded caps/joins for all icons.
- **Do** preserve the silent Listening Window in every automatic call loop so the owner can hear faint meows from closets or under furniture.
- **Do** maintain WCAG AA contrast (`≥ 4.5:1` for body text, `≥ 3:1` for large text and UI tracks) across both Day (`[data-theme="day"]`) and Dim-Room (`[data-theme="dim"]`) themes.

### Don't:
- **Don't** place kicker or eyebrow labels above headings (`<h1>`, `<h2>`, `<h3>`).
- **Don't** use Unicode emojis as UI icons or status indicators.
- **Don't** use colored glow `box-shadow` halos on dark surfaces or `border-left` / `border-right` stripes thicker than `1px`.
