---
version: alpha
name: Acropad Design System
description: Lightweight, local-first markdown note-taking desktop application built with Flutter and Rust.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  primary-focus: "#1e40af"
  on-primary: "#ffffff"
  canvas-dark: "#0f172a"
  surface-dark: "#1e293b"
  surface-dark-active: "#334155"
  text-dark: "#f8fafc"
  text-dark-muted: "#94a3b8"
  border-dark: "#334155"
  editor-dark-bg: "#0b0f19"
  editor-dark-text: "#f1f5f9"
  canvas-light: "#f8fafc"
  surface-light: "#ffffff"
  surface-light-active: "#f1f5f9"
  text-light: "#0f172a"
  text-light-muted: "#64748b"
  border-light: "#cbd5e1"
  editor-light-bg: "#ffffff"
  editor-light-text: "#0f172a"
typography:
  display-lg:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  display-md:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-md:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
  editor-code:
    fontFamily: "'JetBrains Mono', 'Source Code Pro', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0px
  label-caps:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
components:
  editor-pane-dark:
    backgroundColor: "{colors.editor-dark-bg}"
    textColor: "{colors.editor-dark-text}"
    padding: 16px
  editor-pane-light:
    backgroundColor: "{colors.editor-light-bg}"
    textColor: "{colors.editor-light-text}"
    padding: 16px
  sidebar-pane-dark:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.text-dark}"
    padding: 12px
  sidebar-pane-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.text-light}"
    padding: 12px
  sidebar-item-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.sm}"
    padding: 8px
  sidebar-item-dark-hover:
    backgroundColor: "{colors.surface-dark-active}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.sm}"
    padding: 8px
  sidebar-item-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.sm}"
    padding: 8px
  sidebar-item-light-hover:
    backgroundColor: "{colors.surface-light-active}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.sm}"
    padding: 8px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  button-primary-focus:
    backgroundColor: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 8px
  search-input-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.sm}"
    padding: 8px
  search-input-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.sm}"
    padding: 8px
  meta-text-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark-muted}"
    padding: 4px
  meta-text-light:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-light-muted}"
    padding: 4px
  divider-dark:
    backgroundColor: "{colors.border-dark}"
    height: 1px
  divider-light:
    backgroundColor: "{colors.border-light}"
    height: 1px
---

## Overview

Acropad is a lightweight, local-first markdown note-taking desktop application combining Flutter and Rust. The design system embodies focus, speed, and quiet confidence: an interface that recedes when writing and provides swift, tactile feedback when organizing notes.

## Colors

- **Primary (#2563eb):** Vibrant cobalt blue used as the sole interactive accent color for active selections and primary buttons.
- **Canvas Dark (#0f172a):** Deep slate canvas serving as the main background in dark mode.
- **Surface Dark (#1e293b):** Elevated surface for cards, sidebar panels, and inputs.
- **Text Dark (#f8fafc):** High-contrast readable body text achieving 15.6:1 contrast ratio against canvas dark (exceeding WCAG AAA).
- **Text Dark Muted (#94a3b8):** Secondary metadata text achieving 5.8:1 contrast ratio against surface dark (WCAG AA compliant).
- **Canvas Light (#f8fafc):** Clean, crisp paper-white canvas for light mode.
- **Surface Light (#ffffff):** Pure white container surfaces.
- **Text Light (#0f172a):** Deep ink text achieving 16.2:1 contrast ratio against canvas light.
- **Text Light Muted (#64748b):** Subdued metadata text achieving 4.9:1 contrast ratio against surface light.

## Typography

- **Display Large (28px / Semi-bold):** Used sparingly for top-level vault headers and modal titles.
- **Display Medium (20px / Semi-bold):** Document and note titles.
- **Body Regular (14px / Regular):** UI navigation labels, file tree items, dialog copy.
- **Body Small (12px / Regular):** Timestamp labels, file path breadcrumbs, status indicators.
- **Editor Code (14px / Monospace / 1.6 line height):** The primary markdown editing surface. Uses JetBrains Mono or Source Code Pro with generous line height to prevent visual crowding during long sessions.
- **Label Caps (11px / Semi-bold / uppercase / 0.05em spacing):** Section metadata headers (e.g., "VAULT NOTES", "SEARCH RESULTS").

## Layout

- **Spacing Scale:** Strict 8px grid with 4px half-steps (`xs: 4px`, `sm: 8px`, `md: 12px`, `base: 16px`, `lg: 24px`, `xl: 32px`, `2xl: 48px`).
- **Sidebar Dimensions:** Default width 260px, min width 200px, max width 400px. Toggleable via `Ctrl/Cmd+B`.
- **Responsive Layout:** Adaptive split-view panes. On window resize below 640px, the sidebar collapses automatically into drawer mode to protect editor space.

## Elevation & Depth

Visual hierarchy is maintained through flat tonal separation and crisp 1px borders rather than heavy drop shadows:
- **Level 0 (Canvas):** Lowest layer containing sidebar and app frame.
- **Level 1 (Editor & Cards):** Active editing pane resting on pure editor background.
- **Dividers:** 1px hairline dividers (`#334155` dark / `#cbd5e1` light) providing clean structural boundaries.

## Shapes

- **Corner Radius:** Standardized 4px (`rounded.sm`) corner radius on buttons, input fields, badges, and list hovers.
- **Pills (`rounded.full`):** Reserved exclusively for status indicators and active filter chips.

## Components

- **Editor Pane:** Distraction-free editing canvas with 16px internal padding, line numbering, and soft word-wrap.
- **Sidebar Items:** Compact list tile with 8px padding, 4px rounded selection highlight, and subtle hover transition.
- **Primary Button:** High-visibility action element with accessible white text on primary cobalt background.
- **Search Input:** Embedded search box with clear button (Esc) and immediate visual filtering.
- **Status Bar:** 24px fixed-height utility footer displaying active vault path, note count, word count, and save status.

## Keyboard & IME Composition Rules

- **IME-Safe Enter Composition:** When `event.isComposing` or Flutter `isComposingRangeValid` is active (during CJK character conversion), pressing `Enter` MUST only confirm the IME conversion candidate and MUST NOT trigger auto-submission, newline insertion, or premature disk save.
- **Keyboard Shortcuts:**
  - `Ctrl/Cmd+S`: Trigger debounced manual save.
  - `Ctrl/Cmd+B`: Toggle sidebar visibility.
  - `Ctrl/Cmd+P`: Open file switcher.
  - `Escape`: Clear search filter and return focus to editor pane.
- **Resilient Text Reflow:** Long markdown lines must wrap cleanly without causing horizontal container scrollbars or viewport clipping.

## Do's and Don'ts

- **Do** maintain WCAG AA contrast ratio (>= 4.5:1) on all interactive and readable text elements.
- **Do** respect system dark/light mode preferences while allowing explicit manual overrides.
- **Do** preserve caret position across window resize and debounced auto-saves.
- **Don't** use raw hex color literals in UI code — always bind to semantic tokens.
- **Don't** intercept `Enter` or `Escape` key events during active IME multi-stage character composition.
- **Don't** introduce layout shifts (CLS > 0.1) when files are dynamically added to the sidebar tree.
