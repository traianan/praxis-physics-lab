# Comenzi pentru Tipuri de mișcări

Regresie semnalată de utilizator: după schimbarea mișcării, butonul Start dispărea din activitatea „După accelerație”.

Cauza: adaptorul comun muta `#acc-transport` în `#acc-info`; codul nativ înlocuiește `acc-info.innerHTML` când se schimbă explicația. Bara era eliminată împreună cu explicația. Bara rămâne acum în containerul stabil al scenei; comenzile și handlerii originali sunt păstrați.

Pentru cele cinci forme de traiectorie există un buton explicit Start/Pauză, sincronizat cu starea nativă. Comenzile sunt deasupra desenului. Schimbarea formei sau părăsirea activității pune animația în pauză; schimbarea limbii păstrează starea.

Verificare în Chrome local, 1366×768, RO→EN→RO:

- Cele patru variante după accelerație: Start, progres temporal real, Pauză, timp constant în pauză, reluare, Reset la zero, păstrarea identității butonului și vizibilitate în ecran.
- Cele cinci forme de traiectorie: Start, modificarea efectivă a desenului, stabilitate în pauză, reluare, păstrarea butonului și vizibilitate în ecran.
- Proba introdusă înaintea corecției a eșuat pentru toate cele nouă cazuri; după corecție toate verificările au trecut.
- Regresie unitară: rescrierea explicațiilor native nu șterge bara de comenzi și handlerul acesteia.
- `npm run check`: 306/306 teste trecute. Build reușit; cele 18 arhive autonome și optica integrată regenerate pentru adaptorul comun.

Reproducere: `node scripts/qa/scientific-math-browser.mjs --course=miscarea-rectilinie --motion-controls`.

Verificarea generală anterioară acoperea randarea și navigarea; nu detectase pierderea comenzilor după selectarea fiecărei variante. Proba funcțională de mai sus acoperă explicit această regresie.
