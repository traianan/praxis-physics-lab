# Rezoluția figurilor în toate laboratoarele

Extinderea include cele 19 laboratoare din bibliotecă. Politica comună este în `public/shared/canvas-resolution.js`, inclusă prin antetul comun atât pe site, cât și în pachetele autonome.

## Afișare și modele

- Canvasurile de afișare folosesc minimum două mostre pe pixel CSS; ținta pentru ecrane dense este 1,5 × densitatea nativă. Supraeșantionarea are un buget de 8 megapixeli; densitatea nativă se păstrează peste acest buget, cu limita de 8192 pixeli pe latură.
- Coordonatele logice, selecția cu mouse-ul, timpul, istoricul numeric și grilele modelelor rămân independente de dimensiunea bitmapului. Curbele analitice necesare sunt reeșantionate; istoricul integrării nu este inventat sau interpolat pentru a modifica modelul.
- La schimbarea densității ecranului se redesenează inclusiv scenele oprite. Monitorizarea se suspendă când pagina este ascunsă și nu dublează temporizatoarele la revenirea din cache.
- Auditul cu redimensionări repetate a identificat un prim cadru cu marcaj temporal anterior pornirii buclei în simulările termice. Intervalele negative sunt acum limitate la zero, iar cadrele fără timp scurs redesenează fără integrare fizică. Regresia folosește modelul real de particule, inclusiv cazul pistonului care împarte deplasarea la intervalul de timp.
- Schemele SVG și formulele vectoriale își păstrează reprezentarea vectorială. Fotografiile finite din Motoare termice sunt dimensionate după rezoluția lor reală și își păstrează proporțiile.
- În Unde mecanice, schimbarea rezoluției reexecută comenzile desenului curent, fără repornirea efectelor sau a ceasului simulării. Datele raster ale modelului de interferență își păstrează grila logică. Jurnalul comenzilor este limitat; pentru un desen excepțional de peste 100.000 de comenzi există o rezervă bitmap.
- În Viteza și accelerația, marcajele vectoriale existente din legendă sunt păstrate de formatarea comună: șase simboluri cu săgeată, cu indicii atașați bazei corecte.
- Verificarea în profilul online existent a identificat un antet vechi păstrat de service worker-ul lecției Calcul vectorial. Codul modificabil se revalidează din rețea, rezerva offline folosește exclusiv cache-ul versiunii curente, iar înregistrarea verifică explicit actualizările. Cache-urile celorlalte aplicații nu sunt șterse sau folosite ca rezervă. Am păstrat starea lecției, fără reîncărcare forțată.

## Verificare repetabilă

`npm run check` verifică modelele, importurile, distribuțiile și regresiile de afișare. Testele noi acoperă densitatea, limitele bitmapurilor, ciclul de viață, coordonatele, păstrarea stării și redesenarea figurilor ascunse.

`node scripts/qa/scientific-math-browser.mjs --all-resolution --matrix --motion-controls` parcurge taburile și activitățile în RO/EN la DPR 1/2, apoi inspectează o scenă reprezentativă pe desktop, tabletă, mobil cu DPR 3, ecran 4K și text la 200%. Auditul pentru unde enumeră explicit toate secțiunile, activitățile și taburile imbricate. Suprafețele de analiză ale instrumentelor sunt dezvăluite temporar numai pentru măsurare, fără pornirea înregistrării sau sunetului. Lipsa acoperirii este eroare de audit.

Raportul compact al versiunii verificate se află în `VERIFICARE_REZOLUTIE_GLOBALA_2026-11-03.json`.
