# Plan de implementare — Pila Daniell

Specificație: ../../PILA_DANIELL_SPEC.md. Implementare autorizată prin cererea explicită a utilizatorului; alegerile tehnice sunt ale implementării.

1. Model pur `public/shared/daniell-model.js`: validare, stare, pas implicit, energie analitică. Teste numerice `test/daniell-model.test.mjs`.
2. Laborator original `public/simulari/pila-daniell/`: HTML/CSS, `app.js` controller, `view.js` SVG, `content.js` conținut bilingv. Folosește runtime-urile comune.
3. Catalog, imagine SVG originală, workspace și metadate RO/EN. Nu modifica fișierele comune deja murdare.
4. Build/check, verificare browser pe distribuție, raport `docs/PILA_DANIELL_VALIDARE.md`. Rămâne local; fără deployment implicit.
