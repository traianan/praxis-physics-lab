# Structura unitară a laboratoarelor

Implementare și verificare: 2 noiembrie 2026. Ramură: `codex/laboratoare-unitare`.

## Rezultatul

Cele 19 laboratoare folosesc același strat de prezentare: antet compact, titlu și navigare consecvente, preferințe grupate, zone explicite pentru comenzi/scenă/grafice și explicații secundare accesibile. Home și paginile capitolelor păstrează structura existentă. Nu există un mod Experiment suplimentar.

Sursele comune sunt `public/shared/lab-workspace.js`, `public/design-system/lab-workspace.css` și registrul explicit `public/design-system/lab-workspaces.json`. `scripts/prepare-presentation.mjs` le include în bundle-urile existente ale laboratoarelor, fără a adăuga runtime-ul în bundle-ul bibliotecii. Elementele științifice își păstrează identitatea și evenimentele. Elementele administrate de React nu sunt mutate.

Pe desktop, comenzile și scena stau alături unde geometria experimentului permite. Pe mobil, comenzile figurilor și ale grilelor comune preced scena. Derularea paginii rămâne disponibilă, fără panouri text cu derulare proprie și fără micșorarea globală a fonturilor. Explicațiile se deschid prin controale native `details/summary`.

## Acoperire individuală

Numărul de grupuri de mai jos reprezintă grupuri DOM experimentale, nu numărul de lecții sau demonstrații fizice independente. Grupurile de instrumente ale undelor pot fi cuprinse și în grupurile secțiunilor lor.

| Laborator | Grupuri în registrul aplicat | Organizare |
| --- | ---: | --- |
| Oglinzi și lentile | 1 | Antet comun compact; păstrate instrumentul optic și dialogurile native de control, care evită deja derularea pentru reglaje. |
| Mișcarea rectilinie | 6 | Acces direct la MRU, mărimi de bază, convertor și două mobile; transport în coloana parametrilor, scena și graficele în zona principală; aceeași organizare pentru MRUV. |
| Unde mecanice | 32 | Navigarea nativă pe teme și părți, scenele și instrumentele folosesc reperele comune; păstrată proprietatea DOM React. |
| Calcul vectorial | 10 | Figură prioritară; comenzi lângă desen, explicații extensibile după instrument. |
| Viteza și accelerația | 3 | Aceeași grilă de comenzi/scenă, cu reprezentările sincronizate native. |
| Mișcarea curbilinie plană | 3 | Parametrii în coloana comună, scena și valorile calculate alături. |
| Noțiuni termodinamice | 12 | Figuri cu comenzi laterale și explicații secundare. |
| Calorimetrie | 7 | Aceeași organizare pentru instrument, comenzi și explicații; păstrate figurile cu două canvasuri. |
| Principiul I al termodinamicii | 4 | Teoria introductivă se poate deschide separat; calculatoarele și diagramele rămân prioritare. |
| Interacții atomice | 1 | Comenzi în coloana comună, atomii și graficul energiei alături. |
| Aplicații ale principiului I | 8 | Demonstrația înaintea explicațiilor ample; păstrate comenzile și modelele fiecărei transformări. |
| Transformări de stare de agregare | 10 | Demonstrații prioritare și explicații extensibile; navigarea originală păstrată. |
| Oscilator mecanic | 11 | Selectarea directă a demonstrației; explicații grupate; demonstrațiile ascunse își păstrează timpul și nu emit sunete. |
| Oscilatori mecanici cuplați | 4 | Antet și repere comune peste cele patru standuri native cu scenă și grafice asociate. |
| Compunerea oscilațiilor | 1 | Grila comună pentru parametri și zona vizuală, cu graficele native asociate. |
| Figuri Chladni | 1 | Antet comun compact și păstrarea standului cu frecvență, comenzi și disc. |
| Mișcarea circulară uniformă | 2 | Antet și repere comune; păstrate geometria și comenzile scenelor React. |
| Principiile mecanicii newtoniene | 7 | Coloana comună de parametri/comenzi lângă fiecare scenă. |
| Motoare termice | 9 | Aceeași organizare a figurilor: comenzi alături de scenă, explicații secundare. |

## Măsurători MRU

În browser, înainte de reorganizare, la 1920 × 1080 CSS px, scena începea la y ≈ 1595 px, iar graficele la y ≈ 1937 px. După reorganizare, scena începe aproximativ la y = 379–387 px, iar ambele grafice se termină aproximativ la y = 941–949 px, în funcție de limbă și emularea tactilă. Start, scena și ambele grafice sunt vizibile simultan la text 100%, fără derulare între ele.

Au fost verificate atât 3840 × 2160 CSS px la DPR 1, cât și 1920 × 1080 CSS px la DPR 2. A doua variantă corespunde unei suprafețe fizice de 3840 × 2160 pixeli cu scalare 200%. La DPR 2, scena de 1266 × 130 CSS px are buffer 2532 × 260, iar fiecare grafic de 605 × 220 CSS px are buffer 1210 × 440. Verificările sunt emulări în browser, nu o testare fizică pe tabla școlii.

## Verificări efectuate

- `npm run build`: reușit; distribuția `dist/` actualizată.
- `npm run check`: 205 teste trecute, 0 eșecuri; include verificările de sintaxă și suita proiectului. Testele HTTP necesită acces loopback; execuția exclusiv în sandbox a dat inițial EACCES, iar execuția cu permisiunea necesară a trecut.
- Matrice în browser: toate cele 19 laboratoare la 3840 × 2160, 1920 × 1080, 1366 × 768, 1024 × 768 și 390 × 844 CSS px, RO/EN, text 100%/200%: 380 combinații ale stării inițiale.
- Navigare suplimentară între taburi, activități, teme și părți la 1920 × 1080 și 1024 × 768, RO/EN, text 100%/200%. Auditul cumulat cuprinde 2132 stări verificate, fără depășiri orizontale ale paginii, grupuri selectate inconsistent, selectori lipsă sau nealinierea comenzilor figurilor pe desktop. Aceasta este o verificare geometrică și de navigare; nu reprezintă inspectarea vizuală manuală a fiecărui pixel din fiecare stare.
- MRU: identitatea și valorile inputurilor păstrate la montare repetată și schimbarea activității; Start avansează timpul, Pauză îl oprește; schimbarea limbii și mărimii textului păstrează valoarea numerică a timpului și parametrii.
- MRUV: butoanele „Vezi” deschid automat simulatorul și apoi execută handlerul original de încărcare a presetului și derulare.
- Figurile standard: comenzile și canvasul încep pe aceeași linie pe desktop; pe mobil, comenzile preced scena. Verificare geometrică explicită pe Calcul vectorial, fig. 1.
- Oscilator: verificare în browser și test de regresie pe schedulerul importat pentru a exclude progresul timpului, randarea și sunetele de cadru ale activităților ascunse. Schimbarea activității oprește tonurile existente fără resetarea timpului.
- Mod tablă: activare/dezactivare verificată pentru mecanismul comun MRU și modul nativ al opticii, inclusiv vizibilitatea ieșirii.
- Tastatură: Enter deschide preferințele, Tab ajunge la selectorul de culori; Shift+Tab și Enter închid secțiunea, cu focusul păstrat pe `summary`.
- Home: 7 carduri de capitole; capitolul Mișcare: 6 carduri de simulări. Nu primesc atributul de workspace sau navigarea activităților și nu au overflow orizontal la verificarea desktop.
- Reimportate Mișcarea rectilinie și Calcul vectorial prin importatorul oficial; Oscilator mecanic regenerat prin importatorul propriu. Modificările structurale rămân în stratul comun; corecția schedulerului este în importator, nu exclusiv în fișierul generat.
- Regenerate cele 18 arhive autonome ale cursurilor, cu resursele comune încorporate, și copia integrată a opticii prin `sync-optics.mjs`. Deschidere directă `file://` verificată pentru MRU, Calcul vectorial, Unde mecanice și optică. MRU și undele nu au erori de consolă; optica intră și iese din Mod tablă.

Review-ul independent a identificat cele trei regresii descrise mai sus (legătura MRUV, alinierea figurilor și schedulerul activităților ascunse); toate au fost reproduse înainte de corecție și reverificate după aceasta.

## Limite și rezultate locale

La text 200% și pe telefon, derularea poate rămâne necesară. Instrumentele cu multe grafice sau parametri nu sunt forțate într-o singură vedere prin micșorarea conținutului. Textul, câmpurile și scenele își păstrează spațiul necesar.

La deschiderea Calculului vectorial prin `file://`, Chromium raportează blocarea manifestului PWA de politica CORS pentru originea `null`. Referința la manifest exista anterior; lecția, cele 10 grupuri de lucru și resursele comune încorporate funcționează. Instalarea ca PWA se face prin servirea HTTP, nu prin deschiderea fișierului local.

Rapoartele detaliate ale matricei sunt în `outputs/workspace-layout/deep-a.json`, `deep-b.json` și `deep-c.json`; logurile de build, import, pachete și verificări sunt în același folder local, exclus din Git. Capturile reprezentative sunt salvate în acest folder. Nu s-a făcut push, merge sau deploy.

## Ajustare ulterioară: două figuri termodinamice pe același rând

La cererea utilizatorului, în secțiunea „Difuzie și mișcare browniană”, figurile 2 și 3 („Grade de libertate”) se așază alături când fiecare dispune de minimum 43rem. Pragul depinde de mărimea textului: pe ecrane înguste și la text mărit se revine automat la un singur rând de figuri pe verticală. Se folosește CSS în `public/shared/thermodynamics.css`, fără mutarea nodurilor și fără schimbarea modelelor sau parametrilor.

La 1920 × 1080, RO/EN și text 100%, înălțimea grupului scade de la 1166,3 la 564,8 CSS px, economisind aproximativ 601 px (52%). Cele două figuri au aceeași poziție verticală. Au fost verificate 20 de combinații (cele cinci dimensiuni de ecran, două limbi și două mărimi de text), fără overflow și cu păstrarea parametrului modificat. Cele trei tipuri de molecule rămân funcționale. Build-ul și arhiva autonomă a acestui laborator au fost actualizate.

## Corecție ulterioară: dimensiune și claritate în laboratorul de unde

Captura utilizatorului a evidențiat o regresie: regula comună `[data-workspace-role] { max-width:100% }` anula limita calculată pentru figurile undelor. Scena de suprafață de 800 × 350 unități era întinsă la aproximativ 1572 × 688 CSS px, mărind toate textele desenate în Canvas de circa 1,97 ori. Limita figurilor este acum respectată explicit, iar demonstrațiile mari au dimensiunea implicită egală cu dimensiunea logică. Diagramele mici păstrează mărirea moderată anterioară.

Standurile folosesc atribute de prezentare pe nodurile React existente: scenă și analiză în stânga, parametri și comenzi în dreapta când containerul dispune de cel puțin 70rem. Pragul urmărește containerul real, nu doar viewport-ul; standurile interioare înguste și textul mărit folosesc așezarea pe verticală. Grupurile care includ alte scene nu sunt tratate ca simple panouri de parametri. Textele auxiliare și etichetele folosesc dimensiunea comună de control, iar titlurile standurilor au 1rem.

Pentru exemplul din captură: scena are 800 × 350 CSS px, analiza 800 × 170 CSS px. La DPR 2, bufferele active sunt 1600 × 700 și 1600 × 340. Verificarea reutilizabilă este `scripts/qa/waves-size-audit.browser.js`. Randerele inactive pot elibera bufferul DPR pentru memorie; auditul clarității se face după intrarea în zona vizibilă.

Verificat: toate cele 37 de ecrane pentru rezoluția figurilor active; 532 de stări în matricea laboratorului (cinci dimensiuni, RO/EN, text 100%/200%, inclusiv navigarea secundară), fără overflow final. Verificarea a descoperit și corectat extinderea standurilor seismice interioare la text 200%. Testul nou verifică direct dimensiunea figurii generate de adaptor, iar testul de proveniență confirmă păstrarea sursei și a modelelor fizice. Review-ul independent nu a găsit alte probleme materiale. Distribuția locală și arhiva autonomă a undelor sunt regenerate.

## Păstrarea sunetului și claritatea demonstrațiilor oscilatorii

Sunetul se pierdea la navigare atunci când preferințele persistente nu erau acceptate: bridge-ul de confidențialitate păstra valoarea localStorage numai în memoria documentului. `sound.js` păstrează acum alegerea operațională în `sessionStorage`, pe durata sesiunii din filă. O preferință persistentă disponibilă are prioritate la încărcare; evenimentele de sincronizare și revenirea unei pagini din BFCache actualizează și starea sesiunii. Inițializarea preferinței nu creează un AudioContext. Memorarea între sesiuni rămâne dependentă de acordul existent; textul descriptiv al paginii de confidențialitate precizează păstrarea temporară a sunetului.

Verificare efectivă în browser fără preferințe persistente acceptate: sunet activ și buton activ în toate cele 19 laboratoare. Testat separat Biblioteca cu sunet inactiv → Oscilator cu activare → Back către Biblioteca restaurată din BFCache (`pageshow.persisted=true`): butonul și sunetul reflectă alegerea activă. Testele acoperă și dezactivarea, sesiunea nouă, preferința persistentă, retragerea persistenței și sincronizarea între pagini.

Cele trei demonstrații introductive din Oscilator (diapazon, exemple periodice, pendul) erau afișate la 960 px pentru coordonate logice de 640 unități. Deși bufferul respecta DPR, această mărire și eșantionarea fixă a curbei diapazonului accentuau aspectul grosier. Afișarea implicită are acum 640 px, cu scalarea explicită păstrată la text mărit. Rendererul primește opțional `minDpr:2` doar pentru oscilator; ceilalți utilizatori ai rendererului păstrează comportamentul implicit. Curba diapazonului este eșantionată după transformarea de desen, cu cel puțin două puncte pe pixel efectiv și minimum 900 de intervale, fără schimbarea ecuației, anvelopei sau sunetului.

La text 100%, DPR 1 și 2: diapazon 640 × 320 CSS / 1280 × 640 bitmap; exemple 640 × 280 CSS / 1280 × 560 bitmap; pendul 640 × 320 CSS / 1280 × 640 bitmap. Verificarea reutilizabilă este `scripts/qa/oscillator-resolution.browser.js`. RO/EN și text 100%/200% păstrează parametrii și nu produc overflow al paginii. Sunt actualizate copia integrată a opticii și toate cele 18 arhive autonome, deoarece folosesc componenta comună de sunet.

Verificări finale: `npm run check` — 212 teste trecute; `npm run build` reușit. La 390 × 844, DPR 3, exemplele se rearanjează la 324 × 480 CSS cu buffer 972 × 1440, iar celelalte două scene păstrează panoul de explorare al diagramei fără overflow al paginii. Arhiva Oscilatorului a fost deschisă direct prin `file://` și verificată cu același audit de densitate. Captura locală: `outputs/workspace-layout/oscilator-rezolutie-corectata.png`. Review-ul independent nu a identificat alte regresii materiale.

## Extindere la Mărimi caracteristice, Amortizare și Model armonic

Aceeași scară de 40rem este aplicată acum tuturor celor 11 demonstrații, inclusiv celor opt din celelalte trei taburi. La text 100%, cele opt scene scad de la 960 × 480 CSS la 640 × 320 CSS, cu bitmap 1280 × 640 la DPR 1 sau 2. Textul mărit păstrează scalarea intenționată, iar densitatea rendererului rămâne independentă de coordonatele fizice.

Graficele oscilației și fazorului, cele trei curbe y/v/a, curba amortizată și anvelopa ei, precum și parabola energiei folosesc numere de eșantioane calculate din transformarea reală de desen. Domeniile, ecuațiile, capetele intervalelor și separarea panourilor rămân aceleași. Un test de regresie pentru densitate a fost observat eșuând cu eșantionarea fixă și trecând cu noua implementare; testul existent pentru limitele celor trei grafice verifică în continuare toate punctele, permițând mai multe eșantioane.

Verificat în browser: toate cele 11 demonstrații la DPR 1 și 2; cele opt extinse în 96 de combinații (1920/1024/390 px, RO/EN, text 100%/200%), fără overflow al paginii și fără schimbarea inputurilor sau checkboxurilor. `npm run check`: 213 teste trecute; build reușit; arhiva autonomă a Oscilatorului regenerată. Auditul `scripts/qa/oscillator-resolution.browser.js` parcurge acum toate cele patru teme. Review independent fără probleme materiale.

## Amortizare: animație la stânga, parametri verticali la dreapta

La cererea utilizatorului, standul `#demo-amort` folosește două coloane când containerul dispune de minimum 62rem: scena de 40rem în stânga, comenzile în dreapta. Coeficientul b și perioada T₀ sunt așezate unul sub altul, urmate de regim, Pauză/Reset și valori calculate. Explicația scurtă rămâne sub instrument. Pe ecrane înguste sau la text mărit se revine la organizarea verticală. Schimbarea este exclusiv CSS și nu mută nodurile ori resetează modelul.

La 1920 × 1080 și text 100%, scena și comenzile au aceeași poziție verticală; coloana de control începe la 24px după marginea scenei. Verificate 20 de combinații (3840/1920/1366/1024/390 px, RO/EN, text 100%/200%), cu slidere stivuite și parametri păstrați, fără overflow al paginii. Build și pachet offline actualizate; 213 teste trecute.

## Grafice y/v/a: trei fazori sincronizați

În dreapta graficelor apare o a doua scenă cu origine comună și unghiurile φ, φ + π/2 și φ + π, unde φ = 2t + φ₀. Rotația este trigonometrică la ω = 2 rad/s. La corecția cerută ulterior de utilizator, fazorii nu mai sunt normalizați: modulele sunt A = 1 m, Aω = 2 m/s și Aω² = 4 m/s². Vârfurile descriu trei cercuri concentrice colorate, cu razele proporționale valorilor maxime în SI (raport 1:2:4). Legenda afișează maximele și valorile instantanee, cu unitățile lor diferite. Culorile, faza inițială și vizibilitatea sunt comune cu graficele. Ambele scene sunt desenate în același tick și folosesc același obiect de stare; nu există un al doilea ceas.

Scenele sunt alăturate de la 82rem disponibili; sub acest prag sunt stivuite, păstrând dimensiunea minimă pentru lizibilitate și derularea locală. Verificat în browser la 3840 × 2160, 1920 × 1080 cu DPR2, mobil390 cu DPR3 și text200%. Auditul de rezoluție verifică acum toate cele12 canvasuri din cele11 demonstrații. Testele verifică independent fazele, sensul rotației, proiecțiile și sincronizarea inclusiv la pauză; `npm run check`: 215 teste trecute. Build și arhivă offline actualizate. Review independent: corectată micșorarea excesivă pe mobil, fără alte probleme importante.

Corecția modulelor a fost verificată și prin teste pentru cele trei cercuri, lungimile constante ale vectorilor, raportul razelor și proiecțiile fizice. Verificare vizuală la 1920 × 1080, DPR2; 215 teste trecute, build și arhivă offline actualizate, review independent fără probleme importante.
