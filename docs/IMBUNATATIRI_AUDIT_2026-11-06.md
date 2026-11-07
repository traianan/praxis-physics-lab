# Îmbunătățiri după audit — 6 noiembrie 2026

Auditul original este păstrat ca raport istoric. Propunerile lui nu constituie
automat decizii de produs sau schimbări aprobate ale politicii de date.

## Închiderea etapei — 7 noiembrie 2026

Lucrările începute la 6 noiembrie sunt încheiate: optimizările Home și KaTeX,
corecțiile de localizare și accesibilitate descrise mai jos, manifestul unic,
metadatele web, CI și curățarea artefactelor temporare. Planul structural are
toți pașii finalizați. [Raportul curățării](CURATARE_PROIECT_2026-11-06.md)
documentează cele 3.681 de fișiere eliminate și corecția împachetării locale.

Reverificare la 7 noiembrie:

- `npm run build`: reușit; distribuția locală regenerată.
- Registru: 26 de laboratoare, fișiere generate conforme manifestului.
- Sintaxă: 278 de fișiere JavaScript, zero erori.
- Suita completă: **424/424 teste trecute**, zero eșecuri. Prima rulare în
  sandbox a blocat exclusiv testul serverului prin EACCES la localhost;
  reluarea întregii suite cu acces local permis a trecut.
- Loguri: `outputs/finalizare-2026-11-07-build.log`,
  `outputs/finalizare-2026-11-07-check.log` (prima rulare) și
  `outputs/finalizare-2026-11-07-tests.log` (suita finală).

Politica de păstrare a datelor rămâne neschimbată. Modificările sunt locale,
fără commit sau publicare. Verificările de browser descrise mai jos sunt cele
din 6 noiembrie; nu au fost repetate la închiderea etapei.

Auditul integral nu este declarat închis: auditul complet de accesibilitate,
migrarea snapshoturilor cu verificarea provenienței și verificările pe
dispozitive reale rămân etape distincte. PWA, căutarea full-text și conținutul
nou rămân propuneri ulterioare. Secțiunile de mai jos păstrează cronologia;
constatările intermediare despre KaTeX și manifest sunt rezolvate de continuarea
structurală de la finalul documentului.

## Implementat

- **Home:** bundle-ul de clasificare conține numai catalogul și componenta de
  clasificare/ghid. Nu mai include motorul matematic, fonturile și adaptoarele
  Canvas ale lecțiilor. Generarea este corectată în `prepare-presentation.mjs`;
  antetul laboratoarelor își păstrează funcționalitatea existentă.
- **Măsurat:** bundle de la 688.283 la 6.266 octeți (aproximativ −99,1%).
  Browserul a încărcat 76.149 octeți de scripturi pe Home. Sunt dimensiuni
  necomprimate ale resurselor locale, nu o măsurare pe rețea mobilă reală.
- **Fără JavaScript:** lista tuturor laboratoarelor și contorul se generează din
  catalog la build. Cele 26 de linkuri sunt vizibile în context fără scripturi;
  mesajul explică faptul că simulările interactive necesită JavaScript.
- **Imagini:** cardurile laboratoarelor folosesc încărcare lazy și decodare async;
  ilustrația principală își păstrează încărcarea prioritară.
- **Condensator:** șase traduceri adăugate în sursa `translations.tsv`: Laborator,
  Teorie, subtitlul complet și trei etichete de navigare. Importatorul a regenerat
  dicționarele RO/EN, pagina integrată și evidența provenienței. Arhiva autonomă
  a fost regenerată și distribuția `dist/` reconstruită.
- **Verificări:** `check-syntax.mjs` descoperă automat fișierele JS/MJS/CJS din
  `public/` și `scripts/`, exceptând directoarele vendor și node_modules.
  Fragmentul `waves-jsx-adapter.js`, introdus de importator în corpul unei funcții,
  este analizat în acel context; nu este omis. Sunt verificate 271 de fișiere,
  inclusiv copiile livrate ale tuturor modulelor Condensatorului.
- Trei teste de regresie acoperă bugetul bundle-ului Home, linkurile statice și
  traducerile lipsă. Toate au eșuat înaintea remedierilor și au trecut după ele.

## Verificări efectuate

- Build reușit; verificare sintactică: 271 fișiere, zero erori.
- Prima suită: 409/410 teste trecute; testul serverului a primit EACCES de la
  sandbox pentru localhost. Reluarea izolată cu acces permis a trecut.
- Reluarea finală a suitei complete cu acces la localhost: **410/410 teste trecute,
  zero eșecuri** (aproximativ 21 s).
- Browser Chromium, distribuție locală: Home RO → EN → RO, ghidul de conținut
  prezent, fără depășire orizontală la 390 px; fallback cu 26 de linkuri într-un
  iframe fără permisiune de execuție JavaScript.
- Condensator RO → EN → RO: taburi și atribute traduse, schimbarea tabului Teorie
  funcțională, tensiunea setată la 18 V păstrată. În exportul autonom deschis prin
  `file://`: traduceri corecte, motor matematic prezent, zero cereri HTTP/HTTPS.
- `git diff --check` fără probleme. Modificările sunt locale, fără publicare.

## Constatări rămase după prima intervenție

**Persistența pendulului:** auditul descrie corect pierderea datelor la reîncărcare,
dar recomandarea de a permite `pendul.v1.*` contrazice politica actuală din
`scripts/site-pages.mjs`: răspunsurile, rezultatele și însemnările nu se păstrează
între vizite. Testele de confidențialitate confirmă aceeași separare între
preferințe și rezultate. Nu a fost schimbată această politică. Rămâne de aliniat
mesajul pendulului cu politica sau de decis explicit o funcție de salvare locală.

La încheierea primei intervenții rămâneau: dimensiunea antetului matematic al
laboratoarelor, toate traducerile celorlalte lecții, etichetele sliderelor, CI,
manifestul unic, SEO, PWA și reorganizarea surselor. Nu s-au efectuat teste pe
Android, Safari ori tablă fizică și nici un audit complet al celor 26 de lecții.

## Continuare — prioritățile P1 și P2

- **Politica de date păstrată:** niciun rezultat nou nu este permis în lista de
  preferințe persistente. Adaptorul pendulului păstrează măsurătorile și bifele în
  memoria paginii, inclusiv în exportul autonom, și explică pierderea la reload.
  Fișierele exportate explicit de utilizator rămân în responsabilitatea acestuia.
- **Antet web:** fonturile KaTeX nu mai sunt incluse base64 în JavaScript.
  Dimensiunea antetului este 359.537 octeți. CSS-ul de rezervă folosește WOFF2 locale
  și `font-display: swap`; este injectat numai fără MathML nativ. În testul Chromium
  cu MathML dezactivat: 49 formule de rezervă, trei fonturi locale cu HTTP 200,
  zero erori de randare. Cu MathML activ, pendulul nu solicită fonturi de rezervă.
- **Offline:** toate cele 22 de arhive au fost regenerate, iar optica sincronizată.
  Exporturile autonome păstrează fonturile încorporate. Condensatorul deschis prin
  `file://`, cu MathML dezactivat, afișează 49 formule de rezervă fără cereri HTTP.
- **Localizare:** cele 16 valori EN identice cu texte românești cu diacritice au
  fost traduse în dicționare și în sursele de traducere. Au fost regenerate lecțiile
  Unde, Calorimetrie, Noțiuni termodinamice, Motoare termice și Principiul I.
  Testul global detectează revenirea acestor șiruri; nu înlocuiește un audit vizual
  integral al tuturor taburilor. Cuprins și fazele motorului folosesc traducerea
  explicită și la randările dinamice.
- **Accesibilitate:** stepper-ele folosesc etichetele asociate prin `for`, pe lângă
  etichetele care înconjoară inputul. Verificat în EN: „Source voltage E” și
  „ℓ String length”, inclusiv butoanele de creștere/scădere.
- **Home:** cele mai noi două laboratoare din fiecare capitol; intrările fără
  dată sunt păstrate ca rezervă. Numerotarea folosește poziția în capitol.
- **Descoperire web:** build-ul generează șapte pagini statice de capitol, sitemap
  cu Home + șapte capitole + 26 laboratoare, robots și metadate description,
  canonical și Open Graph pentru laboratoare. URL-urile canonice derivă din Home.
  Exporturile autonome nu primesc metadatele distribuției web. Nu sunt declarate
  URL-uri hreflang fictive: schimbarea RO/EN folosește în continuare aceeași adresă.
- **Mentenanță:** `.editorconfig`, index de documentație, eliminarea contoarelor
  învechite din introducerea README și flux CI fără deployment. Șase suite care
  cer `sources/` neversionat rămân în verificarea locală completă și sunt excluse
  explicit din CI; restul testelor și verificarea sintactică sunt incluse în CI.
  Workflow-ul nu a fost executat pe GitHub și nu s-a publicat nimic.

### Lucrări structurale rămase

Motorul KaTeX este încă inclus sincron, deoarece API-ul actual generează și MathML
prin KaTeX. Importul asincron cere tratarea explicită a încărcării și a rerandării,
nu doar eliminarea unui script. Pragul automat al antetului este 400 KB; ținta
orientativă de 250 KB pentru orice pagină nu este încă atinsă de laboratoare.

Manifestul unic, migrarea snapshoturilor cu actualizarea importatoarelor, auditul
axe și verificarea vizuală exhaustivă rămân separate. Nu a fost aleasă o licență în
numele proprietarului. PWA, căutarea full-text, extinderea conținutului și funcțiile
de produs sunt ulterioare. Progresul persistent nu se introduce sub politica
actuală. Nici testele automate, nici emularea Chromium nu reprezintă verificare pe
tablă fizică, Android ori Safari.

### Rezultatul verificării finale

- Build web reușit, inclusiv sitemap și pagini de capitol.
- **416/416 teste trecute, zero eșecuri**, cu acces la localhost. În sandbox,
  singurul eșec a fost din nou EACCES în testul serverului; nu o regresie de cod.
- Verificarea recursivă: 271 fișiere fără erori; cele două scripturi adăugate
  ulterior (`site-metadata.mjs`, `check-ci.mjs`) au trecut separat `node --check`.
- `git diff --check` fără probleme după eliminarea unui spațiu final din README.
- Pagina statică Mișcare verificată în browser: șase laboratoare, canonical
  corect, fără depășire orizontală la dimensiunea testată.

## Continuare structurală — KaTeX la cerere și manifest unic

### Implementare

- Antetul web are acum **86.218 octeți**, față de 359.537 după separarea fonturilor.
  Motorul KaTeX de 275.414 octeți este solicitat local la prima formulă și este
  reutilizat dacă lecția l-a încărcat deja. Nu este o reducere la 86 KB a întregii
  pagini: lecțiile care afișează formule continuă să descarce motorul separat.
- Cererile simultane împart aceeași încărcare. Până la disponibilitatea motorului,
  sursa formulei rămâne text HTML sigur. Eșecul nu produce respingeri Promise
  necontrolate sau reîncercări automate în buclă; există reîncercare explicită prin
  `PraxisLoadMathEngine({retry:true})`. În absența motorului rămâne notația textuală.
- Componentele native reafișează sursa și limba actuale. MCU folosește propriul
  abonament React la revizia motorului; nu se rescriu noduri React din exterior și
  încărcarea motorului nu reapelază configurarea experimentului.
- Exporturile autonome păstrează motorul și fonturile încorporate, sincron.
  Cache-ul lecției Calcul vectorial include acum și resursele comune ale motorului
  și fonturilor, cu versiune derivată din conținut.
- **`labs.manifest.json`** centralizează capitolele, metadatele celor 26 de
  laboratoare, workspace-urile/activitățile, namespace-urile ordonate și strategia
  de export. Generează catalogul, configurația workspace și listele pentru
  modulele native. Importatoarele, sitemap-ul și selecția arhivelor citesc manifestul.
- Au fost eliminate scrierile directe în catalog din importatoarele vechi și
  metadatele lor duplicate. Registrele generate sunt verificate la `npm run check`
  și în CI. Procedura este documentată în [REGISTRU_LABORATOARE.md](REGISTRU_LABORATOARE.md).

### Verificare

- **424/424 teste trecute**, zero eșecuri; **278 fișiere JavaScript** fără erori
  sintactice. Build reușit și `git diff --check` fără probleme.
- Toate cele 20 de importatoare vizate au fost executate. Au fost regenerate cele
  22 de arhive autonome și copia integrată a opticii.
- Verificare Chromium la pornire pentru toate cele 26 de laboratoare: după
  stabilizarea încărcării, zero formule în așteptare și zero erori ale rendererului
  matematic. Rezultatele locale sunt în `outputs/audit-structural-browser.json`.
- MCU: 84 formule randate de React; Condensator: 49 formule. Cu motorul ținut
  intenționat în așteptare, schimbarea RO → EN și setarea tensiunii la 18 V au fost
  păstrate după încărcare; toate cele 49 de formule au fost completate.
- Condensator fără MathML nativ: randare de rezervă funcțională și fonturi locale.
  Exportul autonom prin `file://`: 49 formule, fără loader asincron și zero cereri HTTP.

### Limite și pași următori

Verificarea tuturor lecțiilor a acoperit pornirea, nu fiecare tab și fiecare
interacțiune. Nu constituie audit axe, test pe dispozitiv fizic sau Safari.
Acesta era punctul de oprire al etapei structurale. Continuarea din 7 noiembrie
include auditul de accesibilitate și migrarea snapshoturilor, descrise în
[ACCESIBILITATE_2026-11-07.md](ACCESIBILITATE_2026-11-07.md) și
[SURSE.md](SURSE.md). Funcțiile PWA, căutare full-text și conținut nou sunt
etape ulterioare. Politica de date și starea de publicare nu s-au schimbat.

### Continuare — 7 noiembrie: accesibilitate și surse

Migrarea a centralizat 123 de fișiere în `sources/`, cu SHA-256 păstrat și
importatoarele actualizate. Auditul axe și verificările de tastatură au condus la
corecții pentru etichete, titluri, regiuni, contrast, focus, derulare și comenzi
suprapuse. Rezultatele și limitele sunt în raportul de accesibilitate de mai sus.
Suita actuală are 426 de teste trecute; exporturile offline și build-ul au fost
regenerate. Publicarea modificărilor pe GitHub a fost cerută explicit de utilizator
în această continuare; politica de păstrare a datelor rămâne neschimbată.
