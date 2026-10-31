# Library Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. User approved the design and direct implementation on 2026-10-31.

**Goal:** Give the existing physics library an expressive, premium visual identity while preserving learning and navigation behavior.

**Architecture:** Keep the existing HTML, catalog and controllers. Add a library-scoped stylesheet and a local decorative SVG; use explicit link presentation variables for contrasting action surfaces. Preserve shared lesson rendering.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node.js built-in tests, Chrome DevTools MCP.

**Spec:** `docs/superpowers/specs/2026-10-31-library-discovery-design.md`

## Global Constraints

- Existing local fonts; no dependencies, external font services or publishing.
- Petrol `#103F3B`, ivory `#F7F5EE`, mentă `#B9F279`, auriu `#E8B85C`.
- Preserve scientific colors and lesson content, RO/EN, board mode and restored library state.
- Minimum interactive targets 44 px; respect reduced motion; avoid horizontal page scrolling.

## Review Focus

- Long English titles must wrap without overlapping controls or overflowing cards.
- Empty chapters and search results must keep navigation and filtering usable.
- Hero entry into optics must preserve the library return state.
- Mobile chapter drawer must remain above the common sticky header and trap no hidden focus.
- Library-specific action colors must not change the appearance of lesson links.

### Task 1: Library composition and identity

**Files:** `public/index.html`, `public/library.css`, `public/assets/discovery-field.svg`, `public/app.js`, `public/design-system/links.css`.

**Interfaces:** existing catalog, chapter routes, translation dictionary and `data-simulation` return-state capture. New `body.praxis-library` scope; `data-library-view` home/chapter/search. Link color roles `--praxis-link-ink` and `--praxis-link-button-background` with existing colors as defaults.

- [x] Add hero action to the existing optics laboratory, original vector artwork, library scope and home-only action behavior.
- [x] Implement responsive styling, readable cards, chapter accents, explicit primary actions and sidebar hierarchy.
- [x] Make global link presentation honor optional local role variables while retaining identical defaults for lessons; regenerate through build.
- [x] Verify in browser: hierarchy, grid/list, chapter/search/empty states, translated copy and responsive widths.

### Task 2: Integration and validation

**Files:** generated public presentation files, `DESIGN_SYSTEM.md`, `docs/UI_BIBLIOTECA_2026-10-31.md`, screenshots and QA evidence in ignored `outputs/`.

- [x] Run `npm run build`, then `npm run check`; inspect actual failures before editing.
- [x] Exercise desktop 1440 px, tablet 1024 px, mobile 390 px and narrow 320 px, keyboard focus, drawer, board mode, RO/EN and optics return.
- [x] Measure key contrast pairs; save desktop/mobile screenshots and QA report.
- [x] Obtain an independent read-only review of the complete change; address material issues and rerun affected verification.
- [x] Update the design contract and record the verification results.

## Execution ledger

- User approved direct implementation and delegated technical decisions; no further design or execution-method handoff is required.
- Work in the requested folder on a dedicated `codex/` branch so the result is available in the user's normal local launch flow; do not relocate the application into another worktree.
- Presentation changes are reversible; use the existing test suite and meaningful browser behavior checks, rather than tests that duplicate CSS declarations.
- No automatic commits, merge, push or deploy; leave the reviewable changes in the workspace.

- Final verification: build passed; npm run check 200/200; independent source review found no must-fix or minor findings. Browser QA completed at 320–1440 px.
