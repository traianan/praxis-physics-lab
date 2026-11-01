# Mod tablă, atingere și mărimea textului — 1 noiembrie 2026

La cererea utilizatorului se verifică toate cele 19 laboratoare online, inclusiv combinarea modurilor de afișare. Verificarea se face într-un context Chrome izolat, fără modificarea preferințelor utilizatorului.

## Corecții comune

1. La text 200%, regula obligatorie a lecției mărea la 28 px inclusiv selectorul RO/EN de 64 px din antet; valoarea nu mai încăpea. Antetul comun păstrează acum fontul său de 14 px pentru controale. Textul, formulele și comenzile din lecție urmează în continuare mărimea aleasă; dimensiunile tactile minime se păstrează.
2. Modul comun de tablă aplica `font-size:1.125em` doar containerelor. Paragrafele și comenzile foloseau roluri în rem și nu se măreau. În `html[data-site-board=true] body[data-praxis-laboratory]` se măresc acum rolurile tipografice: corp 18 px și etichete 16 px la 100%; cu preferința 200%, acestea devin 36 px și 32 px. Titlurile cresc proporțional.
3. În Mișcarea rectilinie, titlul și adnotarea graficelor erau elemente flex într-un card care ascunde depășirile. La 200%, unele etichete depășeau cardul pe telefon și în combinația tablă+tactil pe tabletă. Titlul, reperul colorat și adnotarea curg acum pe rânduri; adnotarea se mărește relativ cu titlul, iar pe telefon spațiul de desen este mai puțin îngustat de padding. Nu se micșorează textul ales și nu se schimbă modelele sau textele explicațiilor. Regresia locală a parcurs cele trei dimensiuni și patru moduri, în 72 de stări de navigare, fără tăieri sau suprapuneri.

Optica folosește modul dedicat `data-board`, cu scenă extinsă, pagini de reglaje și mărire preferată 100–300%, adaptată spațiului disponibil. Nu primește rolurile modului comun `data-site-board`; mecanismul său de adaptare rămâne separat. Celelalte 18 lecții folosesc modul comun de lectură mărită; acesta nu promite un laborator fullscreen cu geometria opticii.

## Verificare înainte de publicarea corecției

- Problema selectorului a fost reprodusă online la 390 px: text de aproximativ 38 px plus padding și indicator într-un control de 62 px utili. După corecție fontul este 14 px și valoarea încape.
- Înainte de corecție, paragraful rămânea la 16 px în modul comun de tablă; după corecție are 18 px, respectiv 36 px cu preferința 200%.
- Pilot local: Motoare termice la 390×844, Unde mecanice la 1024×768, Calcul vectorial la 390×844. Fiecare a fost parcurs în tactil 100%, text 200%, tablă 100% și tablă+tactil+200%: **360 de stări de navigare**, fără tăieri, suprapuneri sau depășire a documentului.
- Optica online: 1440×1000, 1024×768 și 390×844; tactil și tablă la 100/200/300% preferat, inclusiv toate paginile de reglaje și dialogurile principale: **138 de stări** fără probleme semnalate. La ecrane înguste, procentul aplicat poate fi mai mic decât cel preferat; acest lucru este indicat în interfață.
- `npm run check`: **201/201 teste trecute**. Verificarea independentă nu a identificat probleme în corecțiile CSS.

## Repetarea auditului

Se injectează `scripts/qa/production-responsive-audit.browser.js`, apoi `scripts/qa/display-modes-audit.browser.js`, înaintea scripturilor paginii. `window.PraxisDisplayAudit.run()` acționează controalele reale pentru mărime, atingere, tablă și dialoguri. Helperul de bază verifică și dialogurile deschise și controalele fixe, cu filtrarea conținutului din spatele unui dialog modal.

Acoperirea limbilor este explicită: o stare inițială RO pentru fiecare mod și parcurgerea taburilor/secțiunilor în EN. Nu se afirmă o parcurgere completă a tuturor stărilor în ambele limbi. Rapoartele, capturile și rezultatele auditului complet online sunt păstrate separat în `outputs/praxis-display-modes-audit/`, exclus din Git. Helperii QA nu sunt incluși în aplicația publicată.
