# Laboratory Discovery Implementation Plan

> Execute directly using superpowers:executing-plans. The user requested applying the already approved library direction to laboratory pages, preserving scientific colors and diagram readability.

**Goal:** Extend the existing petrol/ivory/mint identity to all 19 laboratory interfaces without recoloring scientific drawings or changing simulation behavior.

**Architecture:** A laboratory-only stylesheet is bundled into the mandatory `laboratory.css` by the existing presentation build. This covers online lessons and the self-contained optics distribution without adding requests or dependencies. Work on `codex/laboratory-discovery` in the requested folder.

**Design:** Reuse the approved `2026-10-31-library-discovery-design.md`. Compact petrol introduction with readable light title, restrained mint/gold accents; ivory page background; clear active navigation and primary actions; subtle panel borders and depth. Leave drawing surfaces, canvas/SVG elements, legends, equations and semantic variables unchanged. Keep the existing common header and lesson typography/spacing contracts. Full-screen board mode retains its own layout and palette. Dark reading mode retains its existing colors.

## Constraints and review focus

- No new fonts, dependencies, generated scientific artwork or continuous decorative animation.
- No model, diagram, scientific registry, journal, translation or lesson-source changes.
- Preserve RO/EN, minimum 44 px targets, 52 px touch mode, text scaling, reduced motion, navigation and board mode.
- Long English chapter names and large tab lists must wrap on tablet/mobile.
- Active states must remain legible after all lesson-specific styles load.
- Bundle must be idempotent and included in the embedded optics page.
- Test scientific SVG computed fills/strokes before/after in representative scenes and confirm scientific source files are unchanged.

## Tasks

- [x] Capture representative laboratory structure and scientific styling before changes.
- [x] Add `public/design-system/laboratory-premium.css` and bundle it idempotently from `scripts/prepare-presentation.mjs` into `laboratory.css`.
- [x] Build, sync optics and build again; inspect actual rendering in different lesson families.
- [x] Check all laboratory pages for loaded styling, usable titles/navigation and missing resources. Inspect representative interactive scenes on desktop/tablet/mobile, RO/EN and board mode.
- [x] Run the full project check; obtain independent source review and fix material issues.
- [x] Record final design rules and verification in project documentation, with local screenshots.

## Execution notes

The change is a direct extension of the approved visual system. Decisions concerning exact spacing, CSS bundling and responsive details are delegated to the implementer. Reversible presentation changes use existing physics/import tests plus browser verification rather than tests that repeat CSS declarations. No deployment is part of this implementation request.

Final review: P2 native optics fullscreen regression fixed and browser-verified. Full check 200/200; all 19 initial pages checked on desktop and mobile EN.
