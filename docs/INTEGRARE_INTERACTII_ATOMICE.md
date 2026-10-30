# Interacții atomice — integrare în Termodinamică

Data: 28 octombrie 2026.

Laboratorul este în **Căldură și termodinamică**, la `simulari/interactii-atomice/index.html`. Registrul complet și căutarea îl includ; previzualizarea Home păstrează limita comună de două laboratoare pe capitol.

## Conținut și prezentare

Sursa locală este `interactii-atomice/index.html` și `interactii-atomice/js/app.js`. Importatorul `scripts/import-atomic.mjs` generează pagina integrată și consemnează hashurile sursei în `docs/imported-atomic.json`. Sunt păstrate cele șapte perechi, modelul Lennard-Jones, integrarea dinamicii, parametrii personalizabili, graficele, zoomul, vitezele de redare și cele șase întrebări. Sursa independentă rămâne disponibilă.

Pagina folosește antetul unic Praxis, revenirea la bibliotecă cu contextul salvat, stilurile comune, paletele Praxis/Vii, modul tactil, mărirea textului și controalele −/+. Taburile Simulare / Explicații / Test / Alte lecții păstrează starea. Animația ascunsă nu avansează. Parametrul de distanță poate fi modificat și prin slider și tastatură. La 390 px, scena păstrează integral atomii inclusiv pentru σ = 500 pm.

Textele RO/EN sunt în `public/locales/courses/interactii-atomice/ui/`, generate din `scripts/atomic-translations.json` și incluse în pagină pentru utilizare fără internet. Culorile și textele Canvas urmează preferințele comune. Manifestul și service workerul lipsă din aplicația separată nu sunt înregistrate de versiunea integrată.

## Sunet

Evenimentele originale păstrează frecvența, durata și tipul de oscilator, prin `PraxisSound.startTone`. Comutatorul comun este autoritar, inițial oprit pe un profil nou. Dezactivarea oprește vocile active. Oscilațiile, selecțiile, resetarea și răspunsurile la test folosesc sinteză locală, fără fișiere media sau servicii externe. Sunetele sunt indicii didactice, nu sunete emise de atomi.

## Corecția forțelor cerută de utilizator

În sursa independentă și versiunea integrată, rezultanta interatomică și componentele atracție/respingere sunt desenate pe **ambii** atomi. Fiecare pereche de vectori are aceeași lungime și sensuri opuse, conform principiului acțiunii și reacțiunii. Limitarea comună a lungimii păstrează săgețile în scenă inclusiv pe mobil. Atomul din stânga rămâne fixat; o explicație precizează că fixarea compensează rezultanta și că forța de fixare nu este reprezentată. Ecuațiile mișcării atomului mobil sunt păstrate.

σ este numit parametru de distanță, nu diametru geometric exact. Valorile sunt aproximative; oxigenul atomic din model nu descrie molecula O₂.

Butonul **La echilibru** așază atomul mobil exact la r₀ = 2^(1/6)σ, anulează viteza și pune simularea pe pauză. Păstrează perechea aleasă, σ, ε, zoomul și modul de reprezentare a forțelor. Linia oblică de lângă punctul roșu al atomului din stânga este tija pionezei care indică fixarea, conform explicației de sub scenă.

Paletele diferă și pentru cei patru atomi, curba potențialului, componentele forței, rezultantă și punctul mobil. Praxis folosește tonuri temperate; Vii folosește portocaliu, albastru, roșu și violet saturate. Legenda urmează exact culorile săgeților. Comutarea păstrează parametrii și starea dinamică.

Fereastra comună Text și afișare se deschide centrat și se poate deplasa prin bara titlului, cu mouseul, atingerea sau săgețile tastaturii când bara are focus. Rămâne în limitele ecranului, inclusiv după redimensionare sau mărirea textului.

## Reproducere și verificare

1. `npm run import:atomic`
2. `npm run check`
3. `npm run package:local`

Arhiva autonomă este `dist/simulari/interactii-atomice/interactii-atomice.zip`. După dezarhivare, `index.html` funcționează direct fără Node sau internet. Distribuția completă este `outputs/Praxis-Fizica-local.zip`.

Testele verifică proveniența, întrebările păstrate, relația F = −dU/dr pentru toate perechile și extremele sliderelor, minimul energiei, săgețile egale și opuse, limitele scenei și rutarea audio. Browserul a fost verificat la 390×844, 1024×768 și 1440×1000, RO/EN, taburi, parametri personalizabili, punctaj 6/6, mute și păstrarea stării. Nu s-a făcut publicare online.
