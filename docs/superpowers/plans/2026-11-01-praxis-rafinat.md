# Praxis rafinat — plan de implementare

**Goal:** Aplicarea variantei A aprobate în bibliotecă și toate laboratoarele.

**Architecture:** Stilurile existente rămân sursa comună. Actualizăm tokens, biblioteca, stratul premium al laboratoarelor și antetul comun; scripturile existente reconstruiesc copiile incluse și arhivele autonome.

**Tech Stack:** HTML/CSS/JavaScript local, Node.js; fără dependențe noi.

**Spec:** `docs/superpowers/specs/2026-11-01-praxis-rafinat-design.md`.

## Constrângeri și verificare

Fizica, culorile semantice, RO/EN, țintele 44/52 px, scara textului și modul tablă sunt păstrate. Modificarea este vizuală și reversibilă: nu adăugăm teste care repetă CSS-ul; folosim suita existentă și verificări reale în browser. Utilizatorul a cerut aplicarea în aplicația locală de pe portul 4190; lucrăm pe ramura `codex/praxis-rafinat` în același checkout pentru ca rezultatul construit să fie vizibil acolo.

## Pași

- [x] Actualizăm paleta în `public/design-system/tokens.css`, spațierea și tipografia în `public/library.css`, mentă în ilustrația `public/assets/discovery-field.svg`.
- [x] Aplicăm finisajul în `public/design-system/premium.css`, `public/design-system/laboratory-premium.css` și `public/shared/site-navigation.css`, fără intervenții în motoare sau date științifice.
- [x] Regenerăm optica, arhivele autonome și distribuția locală folosind comenzile existente; rulăm `npm run check` și `npm run build`.
- [x] Verificăm vizual și funcțional biblioteca și laboratoarele, cu atenție la telefon, navigare lungă EN, scene, modul tablă și text mărit. Corectăm eventualele regresii și documentăm rezultatul.
- [x] Revizuim diferențele finale și prezentăm aplicația pe portul 4190.
