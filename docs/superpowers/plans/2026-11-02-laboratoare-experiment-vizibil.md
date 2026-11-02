# Laboratoare unitare cu experimentul vizibil — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Reorganize all 19 laboratories around controls, scene and associated graphs, with one consistent presentation system.

**Architecture:** Extend the existing shared laboratory presentation layer, rather than create separate page designs. A declarative registry describes each lesson's experimental groups; shared runtime and CSS implement the same workspace contract. Keep scientific models and original source archives intact, and integrate adaptations through the existing generation pipelines.

**Tech Stack:** Existing JavaScript, CSS Grid, native accessible disclosure controls, Node.js test runner, local browser geometry and interaction audits. No new UI framework or external runtime service.

**Spec:** `docs/superpowers/specs/2026-11-02-laboratoare-experiment-vizibil-design.md` (approved with explicit requirement of application-wide consistency).

## Global Constraints

- All 19 laboratories use one presentation system; Home and chapter structure remain unchanged.
- Primary hardware: interactive board 3840 × 2160 physical pixels; use actual CSS viewport for responsive behavior.
- Preserve 100–200% text adjustment and touch targets of at least 44 CSS px.
- Preserve physical models, formulas, animation state, parameters, presets and journal entries.
- Do not add internal text scrolling, page scroll locks, global font shrinking or transform-based page scaling.
- Changes must survive import/build and remain functional in local and standalone distributions.
- No deployment, publishing or Android/monetization changes.

## Review Focus

- Reducing viewport or increasing text while running must preserve animation and all controls (Task 3 browser matrix).
- Navigating directly to an experiment must not initialize it twice or discard entered values (Tasks 2–3 interaction audit).
- Collapsed secondary content must not leave focus trapped or hide indispensable instructions (Tasks 1–3 keyboard audit).
- Shared generated CSS/JS must not affect Home or chapter pages (Tasks 1 and 4 regression checks).
- Importing again or opening a standalone package must retain the same workspace and local dependencies (Task 4 regeneration checks).

## File responsibilities

- Create `public/shared/lab-workspace.js`: idempotent mounting and accessible local experiment navigation; presentation only.
- Create `public/design-system/lab-workspace.css`: shared chrome, parameter/scene/graph/secondary-content layout and responsive rules, strictly laboratory-scoped.
- Create `public/design-system/lab-workspaces.json`: explicit entries for the 19 catalog laboratory IDs and their experimental groups; use existing selectors and native navigation.
- Modify `scripts/prepare-presentation.mjs`: embed registry/runtime only in laboratory shared runtime, and append workspace CSS after existing laboratory presentation rules with replaceable generation markers. Do not add workspace runtime to the library content bundle.
- Modify `public/shared/course.js`, `public/shared/site-navigation.js` and their laboratory-scoped styles where needed: supply common lifecycle hooks and compact laboratory chrome, preserve library behavior.
- Modify lesson import/adaptation sources only when a declarative configuration and CSS cannot express a correct layout; no edits solely to generated scientific code.
- Create `test/lab-workspace.test.mjs` for meaningful mounting/navigation and integration contracts using existing test infrastructure.
- Create `scripts/qa/lab-workspace-audit.browser.js` for repeatable geometry and interaction measurements; create `docs/LABORATOARE_STRUCTURA_UNITARA.md` for per-laboratory outcomes and measured limits.

### Task 1: Shared workspace infrastructure and chrome

**Consumes:** Existing `PraxisLabHeader.mount`, course mount lifecycle, catalog simulation IDs and common navigation.

**Produces:** `window.PraxisLabWorkspace.mount(root = document): void`, called after lesson chrome is mounted; safe to call repeatedly. Registry embedded as `window.PraxisLabWorkspaceConfig`. Body attribute `data-praxis-workspace` and role attributes `data-workspace-role="controls|scene|graphs|secondary"` form the shared CSS contract. Explicit group IDs retain their existing native identities.

- [x] Record clean Git baseline and existing test results. Use a separate `codex/` feature branch and follow the worktree preference agreed at handoff; never implement on main.
- [x] Write failing behavior tests: repeated mount does not duplicate controls; mounting a library/unknown page changes nothing; mounting preserves existing input node identity and value; secondary disclosure removes closed content from keyboard reach and reopens without state loss.
- [x] Run `node --test test/lab-workspace.test.mjs` and observe expected failures before production changes.
- [x] Implement the registry/runtime and shared CSS, grouping laboratory preferences and reducing redundant chrome. Keep full library chrome outside laboratory selectors. Announce controls with real labels and translated strings using existing RO/EN catalogs.
- [x] Integrate through `prepare-presentation.mjs` and mount hooks without registering duplicate resize/mutation observers. Browser resize must notify existing canvas redraw pathways without resetting models.
- [x] Run the new tests and existing presentation/navigation tests. Visually compare Home and one chapter before/after at identical viewport.
- [x] Commit this deliverable on the feature branch with a focused message.

### Task 2: MRU reference implementation

**Consumes:** Shared runtime and role attributes from Task 1; existing MRU DOM IDs and native tab/transport events.

**Produces:** Registry group entries for introductory quantities, MRU and two-body motion; common local navigation demonstrating the contract for the other laboratories.

- [x] Capture baseline geometry and screenshots of controls, track, x(t) and v(t) at 1920 × 1080 and 3840 × 2160. Inspect actual DOM hierarchy before choosing selector entries.
- [x] Add a failing interaction test/audit: selecting MRU exposes its group, existing Start operates the same runner, and parameters/time survive switching groups. At text 100%, scene, transport and both graphs must share a visible workspace at these two desktop sizes.
- [x] Implement direct access to MRU and arrange parameters/transport alongside scene and paired graphs. Keep introductory quantities and converter reachable as separately identified secondary material. Preserve original scientific elements/listeners; use the original navigation controls where possible.
- [x] Verify Start/Pause/Reset, graph scrubbing, positive/negative/zero velocity and existing motion-type explanation stability. Check RO/EN and text 200% without clipping; preserve page scroll when needed.
- [x] Run relevant motion and presentation tests; commit the working reference.

### Task 3: Apply the same system to every remaining laboratory

**Consumes:** Shared workspace contract and MRU reference, not copied per-page visual implementations.

**Produces:** Complete 19-ID registry plus documented experimental groups and justified exceptions.

- [x] Inventory each native screen/tab, its scene/controls/graphs, and renderer ownership. Cover: vector algebra, velocity/acceleration, planar curvilinear motion, circular motion, Newtonian principles, optics, mechanical oscillator, coupled oscillators, oscillation composition, Chladni, mechanical waves, thermodynamic notions, calorimetry, first law, atomic interactions, first-law applications, phase changes and heat engines, in addition to rectilinear motion.
- [x] Extend the browser audit to enumerate all explicit registry groups and fail on missing controls, horizontal page overflow, hidden focusable secondary content or duplicated common navigation. Include representative state snapshots before and after resize/language/text changes.
- [x] Configure each lesson using shared roles and group navigation. Where source adaptation is necessary, add it through its existing importer/adaptation module and a reproducing behavior test. For React-owned content prefer CSS/native source integration; never move managed children with a generic DOM adapter.
- [x] Keep the same chrome and functional ordering everywhere. Adjust graph counts and instrument proportions through configuration/shared responsive modifiers. Do not invent separate toolbars for individual lessons.
- [x] Inspect all experimental groups at 1920 × 1080 and 1024 × 768, in both languages and text 100%/200%; inspect representative layout families at 3840 × 2160, 1366 × 768 and 390 × 844. Run an overflow/accessibility sweep across all 19 labs at all specified sizes. Fully inspect any combination flagged by the sweep.
- [x] Exercise native board mode and fallback board mode where applicable, keyboard navigation and resize during animation. Record real limits rather than forcing every experiment into one screen by shrinking it.
- [x] Run affected lesson tests and shared tests; commit completed registry and adaptations.

### Task 4: Regeneration, distribution and final verification

**Consumes:** Complete registry/runtime and lesson adaptations.

**Produces:** Reproducible distribution, report with measurements and representative screenshots, reviewed implementation.

- [x] Add integration checks that each catalog laboratory receives workspace assets through its supported generation path, that generated markers are idempotent, and that library pages receive no workspace behavior.
- [x] Verify reimport of affected lessons preserves layout changes; regenerate only relevant generated artifacts. Check optics through `scripts/sync-optics.mjs` and imported courses through their own importers.
- [x] Run `npm run build`, `npm run check`, and `npm test` as appropriate without duplicating the full test run if `check` already covers the final identical state. Record any pre-existing failure explicitly.
- [x] Generate affected standalone packages via `scripts/build-courses-offline.mjs` and supported optics pipeline; verify no missing shared dependencies and smoke-test standalone MRU and each distinct packaging path. Verify vector service-worker cache inputs include any new external asset; embedding existing bundles is preferred.
- [x] Save before/after geometry, representative screenshots and per-laboratory coverage in `docs/LABORATOARE_STRUCTURA_UNITARA.md`. State CSS viewport separately from physical resolution and DPR.
- [x] Obtain one independent whole-change review against the approved spec, fix material findings, and rerun checks justified by those changes.
- [x] Commit final verified changes and hand back the local result with file links and verification outcomes. Do not merge, push or deploy without authorization.

## Plan self-review

The common runtime and explicit registry satisfy the consistency condition; MRU supplies the measurable reference; Task 3 covers the other 18 labs; Task 4 covers regeneration and distribution. Review Focus conditions are assigned to checks above. Exact scientific-group selectors are intentionally determined by the DOM inventory, as permitted by the approved design; the runtime interface and CSS role contract are fixed here.

## Execution handoff

User approved the plan and Native execution. Work was performed on the separate branch `codex/laboratoare-unitare` in the existing checkout, with an independent whole-change review. No merge, push or deployment is included. Completion evidence and per-laboratory coverage: `docs/LABORATOARE_STRUCTURA_UNITARA.md`.
