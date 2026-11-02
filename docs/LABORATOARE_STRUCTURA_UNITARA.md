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
