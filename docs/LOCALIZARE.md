# Localizare RO / EN

Biblioteca și laboratorul inclus folosesc `public/shared/i18n.js`. Preferința `praxis-language` se păstrează local. Schimbarea limbii nu reîncarcă laboratorul și nu modifică starea experimentului. `document.lang`, numele accesibile, titlurile, etichetele și rezultatele se actualizează împreună.

## Organizare

- `public/locales/common/{ro,en}.json`: navigare, controale generale, Mod tablă și sunet.
- `public/locales/chapters/<id>/{ro,en}.json`: câte o pereche pentru fiecare dintre cele șapte capitole; titluri, descrieri și metadatele simulărilor.
- `public/locales/labs/oglinzi-si-lentile/ui/{ro,en}.json`: controale, etichete SVG și mesaje ale opticii.
- `public/locales/labs/oglinzi-si-lentile/lessons/{ro,en}.json`: explicații, formule și aberații.

Sunt 47 de spații de nume și 94 de fișiere JSON. `courses/shared/{ro,en}.json` conține comenzile comune. Mișcarea rectilinie are șase perechi (ui, motion-types, mru, mruv, problems, test), iar Calcul vectorial are șaisprezece (ui, interactive, section-01…section-14). Conținutul didactic, testele, feedbackul și etichetele desenelor sunt bilingve. Laboratoarele viitoare primesc propriile perechi; nu extind nelimitat fișierul comun. Cheile sunt mesajele-sursă românești (stil gettext). Parametrii numiți, de exemplu `{value}`, trebuie păstrați identic în ambele limbi.

## Utilizare

În pagina nouă încarcă runtimeul și inițializează spațiile de nume necesare prin `PraxisI18n.init`. `createSelector()` produce selectorul comun. După randarea explicită a unui fragment, apelează `apply(fragment)`; pentru un mesaj calculat folosește `tr(mesaj, {value})`. Reafișează rezultatele numerice la evenimentul `praxis-language-change`, folosind `PraxisI18n.locale`. Nu traduce formulele prin înlocuiri în codul motorului.

Catalogul încarcă fișierele JSON de pe același server local. Copia autonomă a opticii include ambele limbi direct în HTML, cu `initEmbedded`, astfel încât schimbarea limbii funcționează și fără server sau internet. Nu edita manual HTML-ul generat: adaptează sursa și `scripts/localize-optics.mjs`, apoi rulează sincronizarea.

Convenția de semne românească rămâne aceeași în EN: Ox pozitiv la dreapta, obiect real x₁ < 0; pentru lentile 1/f = 1/x₂ − 1/x₁ și β = x₂/x₁. Pentru oglinzi 1/f = 1/x₁ + 1/x₂ și β = −x₂/x₁. Traducerea nu schimbă motorul fizic.

`npm run check` verifică egalitatea cheilor și parametrilor, funcționarea traducerii înglobate și validitatea scripturilor distribuției autonome. Verifică suplimentar în browser ferestrele, textele dinamice și încadrarea în Mod tablă în ambele limbi.

## Lecții importate

`shared/course-localization.js` traduce reversibil textul DOM și textele Canvas, fără reîncărcarea paginii. Formulele KaTeX sunt excluse din traducerea DOM; secvențele LaTeX din dicționare rămân identice. Numerele simple se afișează cu punct în EN și virgulă în RO. Schimbarea limbii păstrează parametrii simulării și răspunsurile din testul în curs.

Cele două limbi sunt incluse în HTML la import; arhivele autonome includ și adaptoarele, stilurile, fonturile și bibliotecile locale. Nu se descarcă traduceri de pe internet. Pentru mesaje noi, actualizează perechea JSON a secțiunii și verifică paritatea cheilor/parametrilor. `scripts/course-locale-extras.json` conține completările pentru expresiile dinamice ale surselor importate.

## Unde mecanice

11 perechi în `public/locales/courses/unde-mecanice`: ui, basics, phenomena, acoustics, water, seismic, instruments, measurement, resources, assessment și theory. Textele sursă sunt extrase din modulul aplicației, nu din bibliotecile React. Traducerile păstrează conținutul și se aplică inclusiv desenelor Canvas și fragmentelor separate în sub/sup de rendererul matematic al lecției. Câmpurile editabile ale jurnalului sunt excluse de la traducerea DOM, pentru a păstra datele utilizatorului. Limba se poate schimba fără remontarea aplicației React.

Snapshotul original este păstrat în `sources/unde-mecanice`, ignorat de Git; distribuția și JSON-urile sunt în `public`. Manifestul SHA-256 este `docs/unde-mecanice-source.json`. `scripts/import-waves.mjs` aplică adaptoarele de structură și input; nu reconstruiește motorul fizic.


Noțiunile termodinamice au propriul spațiu de nume `courses/notiuni-termodinamice/ui`, încorporat și în pachetul autonom. Mesajele sunt extrase din HTML și din arborele sintactic JavaScript, fără executarea sursei. Fragmentele TeX și parametrii rămân identici; căutarea cuprinsului indexează și traducerile. Import: `npm run import:thermodynamics`.

## Compunerea oscilațiilor — 30 octombrie 2026

Namespace-ul `composition` conține textele statice și dinamice în RO/EN, inclusiv cele șapte teme teoretice. Pagina include `common`, `courses/shared` și `composition` direct în HTML, pentru funcționare autonomă. Regenerare: `npm run import:composition`.

## Figuri Chladni — 30 octombrie 2026

Namespace-ul `chladni` conține explicațiile, activitățile, verificările și textele dinamice RO/EN. Este inclus în HTML împreună cu `common`, `chapters/sunete-si-unde` și `courses/shared`. Regenerare: `npm run import:chladni`.
