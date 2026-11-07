# Slidere și etichete numerice — 7 noiembrie 2026

## Remedieri

- În Newton, sliderele existau, dar două coloane fixe într-un panou îngust lăsau circa 23 px pentru pistă, aproape cât cursorul. Panoul folosește acum coloane care se reorganizează după spațiul disponibil.
- În Unde, comenzile corzii și ale undelor pe apă se comprimau la lățimea de 1024 px. Grilele interioare păstrează acum suficient spațiu pentru piste și butoanele de ajustare.
- Pista sliderelor comune are contrast mai bun. Butoanele tactile și operarea prin tastatură sunt păstrate.
- Etichetele și valorile sunt grupate în panourile native și în componenta React pentru Unde. În Newton, masa și forța includ simbolul, valoarea și unitatea, inclusiv după modificarea parametrilor și schimbarea limbii.
- Desenele Newton afișează valorile masei și forțelor: cărucior, acțiune–reacțiune, compunerea forțelor, frecare și elasticitate. Forțele numerice reprezintă module; săgețile păstrează direcția și sensul. Experimentul conceptual de inerție nu primește valori fizice inventate.
- Modelele fizice și politica de păstrare a datelor nu sunt modificate. Distribuțiile offline și pagina de optică sunt regenerate din sursele autoritative.

## Reproducerea verificărilor

Rezultate locale:

- 26 de laboratoare, RO și EN, 381 de stări de navigare pe limbă și cinci lățimi: 3.810 măsurători de pagină; navigare completă, fără excepții și fără distanțe excesive între etichetele și valorile recunoscute.
- Nicio pistă comprimată rămasă după remedieri. Trei măsurători de 0 px la optică în timpul redimensionării au fost reverificate după stabilizarea interfeței: toate cele 90 de măsurători RO/EN la optică au trecut. Scriptul confirmă acum automat măsurătorile sub prag după 550 ms.
- Newton: 20 de combinații limbă/ecran/mărime de text; sincronizarea comenzilor și a desenului, tastatura, butoanele de ajustare, opt combinații extreme masă/forță/poziție și încadrarea etichetelor numerice din celelalte patru desene modificate au trecut.
- 284 de fișiere JavaScript verificate sintactic; 428 de teste trecute. Testul serverului local a necesitat reluarea cu acces la localhost, blocat inițial de sandbox.
- 22 de arhive ZIP valide; hashurile din manifest coincid cu fișierele distribuite.

Rapoartele locale sunt `outputs/range-layout-verified.json`, `outputs/range-layout-optics-confirmed.json`, `outputs/newton-controls-verification.json` și logurile asociate. Capturile desktop și mobil sunt în același director. În acest mediu, închiderea Chrome prin Playwright a rămas blocată după salvarea rezultatelor; procesele de test au fost oprite după finalizarea verificărilor.

După `npm run build`, rulează `node scripts/qa/newton-controls.mjs` pentru verificările funcționale și geometrice Newton. Scriptul verifică sincronizarea valorilor, comenzile din tastatură și butoanele de ajustare, cinci configurații de ecran, text la 100% și 200%, precum și limitele etichetelor la extremele parametrilor.

Pentru toate laboratoarele, `node scripts/qa/range-layout.mjs` parcurge navigarea și măsoară sliderele vizibile. Variabilele `PRAXIS_RANGE_LANGS=ro,en` și `PRAXIS_RANGE_WIDTHS=1366,390,1024,1920,3840` activează matricea completă. Raportul JSON este scris în `outputs/`; scriptul returnează eroare pentru navigare incompletă, excepții, piste sub 80 px sau separarea excesivă a etichetelor și elementelor `output` recunoscute.

Aceste verificări vizează cele două probleme de prezentare semnalate. Nu constituie o certificare WCAG și nu înlocuiesc testarea pe dispozitive fizice sau inspecția tuturor desenelor Canvas.
