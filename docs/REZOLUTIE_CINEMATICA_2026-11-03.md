# Rezoluția desenelor din Viteza și accelerația

Solicitare: claritate mai mare pentru imaginile și animațiile din toate taburile laboratorului arătat în captură.

Toate cele trei suprafețe Canvas — rectilinie, curbilinie și legi polinomiale — folosesc acum minimum două eșantioane pe pixel CSS, respectiv o țintă de 1,5× densitatea nativă pe ecranele HiDPI. Supersamplingul este limitat la aproximativ 8 megapixeli; dacă densitatea nativă necesită deja mai mult, ea este păstrată, cu o limită de 8192 pixeli pe latură. Nu se modifică dimensiunile logice ale desenelor sau modelele fizice și nu se realocă bitmapul la fiecare cadru.

Teorie și formule conține elemente vectoriale/MathML, fără imagini raster de mărit. Acestea își păstrează randarea nativă.

Auditul a confirmat și o regresie la schimbarea exclusivă a DPR: desenul pe pauză rămânea la vechea rezoluție. Adaptarea urmărește acum media-query-ul de rezoluție și are o verificare de rezervă la 250 ms numai în pagina vizibilă, cu redesenare exclusiv la schimbarea densității. Monitorizarea este oprită când pagina este ascunsă sau părăsită și restaurată fără duplicate, inclusiv prin BFCache.

## Verificări

- 24 stări: patru taburi × șase configurații, RO/EN, text 100/200%, DPR 1/1,25/2/3; 1366×768, 1920×1080, 3840×2160, 1024×768 și 390×844.
- Toate cele 18 probe Canvas ating rezoluția țintă, păstrează proporțiile și timpul fizic și nu produc overflow orizontal al paginii.
- Exemplu rectiliniu, 943×512,5 pixeli CSS: bitmap 1886×1025, față de 943×513 înainte.
- La schimbarea doar a DPR de la 1 la 2: bitmapul rectiliniu trece de la 1886 la 2829 pixeli lățime, iar timpul rămâne 1,25 s. Înainte, bitmapul nu se actualiza.
- Start/Pauză/Reset: trecute pentru toate cele trei laboratoare animate.
- Teste pentru rezoluție, limita de memorie, reutilizarea bufferului și ciclul de viață al monitorizării; suita completă: 315/315 teste trecute.
- Build reușit și pachetul offline Viteza și accelerația regenerat.

Rezultate înainte/după: `docs/VERIFICARE_REZOLUTIE_CINEMATICA_2026-11-03.json`.

Reproducere: `node scripts/qa/scientific-math-browser.mjs --course=viteza-si-acceleratia --velocity-resolution`.
