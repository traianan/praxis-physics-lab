# Accesibilitate — 7 noiembrie 2026

## Domeniu și metodă

Audit local cu axe-core 4.14.0 și Playwright/Chrome: Home, cele patru pagini
informative, șapte pagini de capitol și 26 de laboratoare. Laboratoarele sunt
parcurse prin secțiuni și activități, în română și engleză. Verificatorul raportează
explicit ramurile neparcurse și erorile de navigare; acestea nu sunt considerate
rezultate conforme.

Comenzi reproductibile: `npm run audit:a11y`, `npm run audit:a11y:deep` și
`npm run audit:keyboard`. Rapoartele detaliate sunt generate în `outputs/`.
Auditul axe folosește etichetele WCAG 2 A/AA, 2.1 A/AA, 2.2 AA și best-practice,
cu preferința reduced-motion activă pentru stabilizarea măsurătorilor.

## Remedieri

- Nume accesibile pentru controale, vectori, selectoare și butoane cu pictograme;
  etichete vizibile compatibile cu numele accesibile.
- Ierarhii de titluri, regiuni și navigări distincte; eliminarea rolurilor ARIA
  incompatibile și a bannerelor duplicate; structură validă pentru definiții.
- Navigare cu săgeți în taburi, focus vizibil și sincronizarea selectorului mobil.
- Contrast îmbunătățit pentru text, indicatoare și culorile mărimilor fizice,
  inclusiv paletele pentru tema întunecată.
- Formule și zone cu derulare orizontală accesibile de la tastatură; pentru MCU,
  gestionarea rămâne în componenta React care deține conținutul.
- Eliminarea suprapunerii grupurilor de comenzi din standul seismic al lecției
  Unde și introducerea unei verificări pentru această regresie.
- Reașezarea paginilor de capitol pe ecrane înguste, cu text mărit.

Corecțiile sunt în modulele comune și adaptoare, apoi propagate prin import și
build. Snapshoturile originale mutate în `sources/` nu sunt rescrise.

## Rezultate validate

- 38 de rute, verificate cu ambele limbi solicitate: 76 de verificări inițiale,
  fără constatări axe nerezolvate. Paginile statice de capitol nu au comutator de
  limbă; verificarea lor structurală se repetă pe același conținut.
- 304 verificări de lățime/font rădăcină: 1366 și 390 px, font rădăcină de 16 și
  32 px, fără depășire orizontală a documentului. Acesta este un test al reflow-ului
  bazat pe `rem`, nu o afirmație că toate textele definite în pixeli au fost mărite
  de două ori. Tabelele și formulele late își păstrează derularea locală.
- Explorarea extinsă: 650 de stări pe celelalte pagini și 136 în Unde (68 în
  fiecare limbă), cu evidența explicită a ramurilor. Constatările au fost remediate
  și retestate; rezultatele inițiale rămân păstrate ca diagnostic.
- Ultima retestare a 26 de stări: zero constatări nerezolvate după revizuirea
  antetelor matematice în arborele Chromium.
- Noțiuni termodinamice: repetată integral după remedieri, 55 de stări în fiecare
  limbă, fără ramuri omise, erori de navigare sau constatări nerezolvate.
- Home și toate cele 26 de laboratoare au trecut verificarea tastaturii: schimbarea
  taburilor cu săgeți, focus vizibil, selector sincronizat, meniul mobil deschis
  cu Enter și închis cu Escape, revenirea focusului și meniul închis inert.
  Standul seismic nu mai are panouri de comenzi suprapuse.
- 426/426 teste ale proiectului trecute; verificarea sintactică a 282 de fișiere
  a trecut, iar fișierele modificate ulterior au fost reverificate. Build reușit.
- 22 de arhive offline verificate; toate cele 434 de fișiere intermediare
  (37.284.810 octeți) au corespondent binar identic în arhive. Copiile intermediare
  au fost eliminate după verificare.

Rapoarte locale: `outputs/accessibility-baseline-verified.json`,
`outputs/accessibility-rest.json`, `outputs/accessibility-waves-verified.json`,
`outputs/accessibility-last-reviewed.json`, `outputs/accessibility-keyboard-verified.json`
`outputs/accessibility-notions-verified.json` și `outputs/tests-final.log`.
Rezumatul publicabil este în `docs/accessibility-summary-2026-11-07.json`.
Rularea inițială a întâmpinat timeout-uri de browser; rutele respective au fost
reverificate și înlocuite explicit în raportul agregat, nu ignorate.

## Interpretarea rezultatelor

Unele antete cu MathML nativ sunt raportate de axe drept goale. Verificatorul
păstrează constatarea brută și o marchează ca revizuită numai dacă arborele de
accesibilitate Chromium expune efectiv un nume pentru acel antet. Nu se ignoră
global regula `empty-table-header`.

Exemplu de dovadă păstrată: antetul `c_{x}` expune `columnheader "c_{x}"` și
un copil `math: c x`. Snapshoturile Playwright pot cita întreaga linie YAML;
verificatorul acceptă ambele forme de serializare, păstrând numele efectiv.

Verificările automate nu echivalează cu certificarea WCAG sau cu testarea tuturor
combinațiilor posibile ale simulărilor. Testarea cu cititoare de ecran reale,
Safari și dispozitive fizice nu este acoperită de această rulare. Rezultatele
`incomplete` ale axe rămân în rapoarte pentru evaluare contextuală.

Politica de păstrare a datelor nu este modificată. Verificările au rulat local;
publicarea modificărilor pe GitHub a fost autorizată separat de utilizator.
