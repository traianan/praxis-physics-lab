# Mișcarea curbilinie plană — integrare la 28 octombrie 2026

Laboratorul este în **Mișcare → Mișcarea curbilinie plană**, la `simulari/miscarea-curbilinie-plana/index.html`. Capitolul existent „Mișcare” grupează laboratoarele de mecanică; nu a fost creat un capitol duplicat.

Au fost păstrate cele trei secțiuni: teorie, vectorul viteză și vectorul accelerație. Lecția include mărimi medii și instantanee, deosebirea dintre distanță și deplasare, mișcare circulară, eliptică, o curbă generală și o curbă Bézier editabilă, descompunerea accelerației și cercul osculator. Întrebările și răspunsurile sunt păstrate. Atribuirea către autor rămâne în sursa originală arhivată; blocurile de prezentare și autor au fost eliminate din interfață la solicitarea utilizatorului. Conținutul repetat în celelalte laboratoare este inclus intenționat.

## Integrarea vizuală și funcțională

Sunt folosite antetul unic, navigarea, setările de text, paleta, modul tactil și componentele comune Praxis. Blocul de introducere și informațiile despre autor nu se afișează. Fundalurile sunt deschise, culorile științifice au contrast adaptat, iar etichetele se desenează după geometrie, cu încadrare și săgeți vectoriale. Legendele și indicația scării sunt rezervate în calculul pozițiilor etichetelor. Canvasurile păstrează dimensionarea sursei în funcție de densitatea ecranului.

Simulările se opresc la schimbarea secțiunii și la ascunderea paginii. Animația teoretică folosește timpul dintre cadre, prin ceasul comun, în locul unui pas fix de 1/60 s. Curba editabilă păstrează evenimentele Pointer Events originale și ordinea punctelor de control. Perechile slider/câmp numeric folosesc logica sursei; câmpul numeric se confirmă prin Enter sau pierderea focusului.

RO/EN include explicațiile, întrebările, răspunsurile și textele generate de controalele traiectoriilor. Dicționarele sunt incluse în pagină, fără cereri externe pentru traduceri.

## Surse și construire

Fișierul primit `miscarea-curbilinie-plana.html` rămâne în rădăcina proiectului. Copia originală nemodificată este `sources/miscarea-curbilinie-plana/index.html`; inventarul SHA-256 este în `imported-curvilinear.json`. Distribuția este generată separat, fără modificarea originalului.

- `npm run import:curvilinear` — publică dicționarele și reconstruiește laboratorul (Python este necesar numai pentru publicarea dicționarelor).
- `npm run offline:courses` — reconstruiește cele cinci arhive autonome ale lecțiilor importate.
- `npm run build` — actualizează distribuția `dist/`.
- `npm run check` — verifică sintaxa și cele 73 de teste ale aplicației.

Pachet autonom: `dist/simulari/miscarea-curbilinie-plana/miscarea-curbilinie-plana-offline.zip`. Se dezarhivează complet, apoi se deschide `index.html`; nu necesită Node, Python sau internet pentru utilizare.

## Verificare

Testele noi compară derivatele analitice ale celor patru tipuri de traiectorii cu diferențe finite, verifică extremitățile curbei editabile și viteza constantă a mișcării circulare. Au fost verificate și păstrarea sursei și înregistrarea în catalog.

În browser au fost verificate RO/EN, toate secțiunile, cele patru traiectorii, mai multe momente de timp, limitele și suprapunerile etichetelor, butoanele −/+, confirmarea numerică, animația teoretică, pauza la schimbarea secțiunii și actualizarea curbei editabile. La 390 px nu există derulare orizontală în cazurile examinate, iar la densitate 3× bufferul canvasului corespunde dimensiunii afișate.

## Compactarea interfeței

La solicitarea utilizatorului au fost eliminate introducerea și subsolul cu autorul. Marginile secțiunilor, formulelor, explicațiilor, întrebărilor și navigării sunt reduse. Graficele au înălțime de 28 rem, iar comenzile de redare și rezultatele sunt grupate sub desen pentru a reduce spațiul gol de lângă panoul parametrilor. Dimensiunile minime ale controalelor și conținutul didactic sunt păstrate.
