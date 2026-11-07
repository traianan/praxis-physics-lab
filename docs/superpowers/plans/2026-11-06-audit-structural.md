# Audit structural — plan de implementare

**Goal:** Separarea motorului matematic de antet și centralizarea registrului laboratoarelor fără modificarea politicii de date.

**Architecture:** Web-ul încarcă KaTeX local la prima formulă. API-ul de randare rămâne sincron și emite temporar text sigur pentru HTML; la disponibilitatea motorului, gazdele native sunt reafișate din sursa actuală, iar React primește un eveniment de actualizare. Exporturile autonome păstrează motorul sincron încorporat. Manifestul autoritativ generează catalogul și configurația comună.

**Tech Stack:** JavaScript, Node ≥22, teste `node:test`, Chromium.

**Spec:** `docs/AUDIT_GENERAL_2026-11-06.md`, `docs/REGULI_LABORATOARE.md` și solicitarea utilizatorului de păstrare a politicii de date.

## Global Constraints

- Fără publicare; fără persistență nouă a rezultatelor.
- Importatoarele și sursele autoritative produc fișierele distribuite.
- React își gestionează propriul DOM; schimbarea randării păstrează parametrii.
- Offline autonom fără cereri HTTP; URL-urile web funcționează și din subdirector.

## Review Focus

- Rețea lentă sau încărcare eșuată: textul formulei rămâne vizibil, fără excepții necontrolate.
- Două formule simultane: o singură încărcare a motorului.
- Parametru/limbă schimbate în timpul încărcării: se afișează valoarea actuală.
- React și motor preexistent: nu se înlocuiesc noduri gestionate de React și nu se încarcă motor duplicat.
- Export autonom și browser fără MathML: formule și fonturi locale complete.

## Pași

- [x] Teste pentru loader: încărcare la cerere, deduplicare, eroare/reîncercare și motor existent.
- [x] `public/shared/math-engine-loader.js`, integrare în `scripts/scientific-math-runtime.mjs`; renderer de așteptare și notificare React în adaptorul MCU.
- [x] Teste și verificări în browser: native, React, lipsă MathML, offline.
- [x] Manifest: conservarea exactă a catalogului, configurației workspace și listei de arhive; generare deterministă și validare.
- [x] Build, arhive, teste complete și actualizarea raportului.
