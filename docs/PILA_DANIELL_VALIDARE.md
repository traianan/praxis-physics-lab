# Pila Daniell — raport de validare, 4 noiembrie 2026

Implementare originală în `public/simulari/pila-daniell/`, motor pur în `public/shared/daniell-model.js`. Înregistrare în catalog, capitolul Electricitate, magnetism și circuite, metadate RO/EN și workspace comun. `public/` este sursa autoritativă; `dist/` este rezultatul buildului. Nu s-a făcut commit, push sau deployment remote. Modificările preexistente din `public/shared/lab-header.js` și `content-types.bundle.js` nu au fost rescrise manual pentru acest laborator.

Documentare și model: [specificație cu cele patru URL-uri](PILA_DANIELL_SPEC.md). Firecrawl a recuperat paginile direct; căutarea generală a expirat. Imaginea utilizatorului a fost folosită pentru compoziție, iar SVG-ul este original. Nu este necesară nicio cerere externă pentru rulare; linkurile surselor se deschid numai la cererea utilizatorului.

## Verificări automate

- `npm run check`: **379/379 teste trecute**, inclusiv serverul HTTP local. Prima rulare în sandbox a blocat conexiunea loopback și a găsit două așteptări vechi ale catalogului (21 laboratoare și vechea ordine). Catalogul are acum 22; așteptările au fost actualizate conform adăugării, iar testele HTTP au trecut în mediul cu acces local.
- După ajustările finale de text/desen: cele 9 teste Daniell trecute din nou și verificarea sintactică a tuturor celor patru module. Modulele au fost adăugate în comanda `check`.
- `node scripts/build.mjs`: trecut; verificarea finală în browser a folosit distribuția regenerată.
- `git diff --check`: trecut (avertismente despre conversia LF/CRLF, fără erori de whitespace).

Motor: E°=1,10 V; ΔrG°=−212267,730664 J/mol; I=0,0916666667 A; U=0,9166666667 V; cazuri Nernst Q=10 și 0,1; bilanțuri independente de atomi și sarcină; energia comparată cu integrare trapezoidală independentă; bilanț de putere; circuit deschis, punte absentă, scurtcircuit, epuizarea zincului, prag Cu²⁺, intrări nevalide. Convergența de ordin 2 și independența față de împărțirea intervalului de timp sunt verificate numeric.

În browser, pornind de la cCu=10 mol/m³, R=10 Ω, cZn=1000 mol/m³: oprire la t≈2021,091251 s, ξ=0,0009 mol, cCu=1 mol/m³, cZn=1009 mol/m³, q≈173,673598 C; curent zero, U nedefinit la limita modelului. Energia externă≈149,246892 J și internă≈29,849378 J. Pragul nu este prezentat drept echilibru electrochimic.

## Browser și interacțiuni

Chrome headless pe Windows; script reproductibil `scripts/qa/daniell-browser.mjs`, folosind o instalare Playwright existentă prin `PRAXIS_PLAYWRIGHT_MODULE`. Server temporar numai pe loopback; nu s-au instalat dependențe noi.

- Mouse real pentru browser și evenimente tactile emulate prin Chromium, cu `isTrusted=true`: Start/Pauză/Reset, pas, întrerupătoare, −/+, glisare slider, editare numerică.
- Circuitul și puntea păstrează avansul chimic; modificarea parametrilor începe o măsurare nouă; pauza nu avansează timpul.
- Schimbarea secțiunii suspendă simularea; revenirea o reia fără saltul timpului petrecut în explicații.
- RO→EN→RO, paleta vivid și revenirea: parametrii și starea fizică se păstrează. Întrebările și feedbackul sunt bilingve.
- Inspecția vizuală a identificat interpretarea greșită a logaritmului ca parte a numitorului în notația simplă Nernst; formula a fost trecută la TeX explicit și numitorul randat este verificat ca fiind exact `2F`. Modelul numeric nu a fost afectat. Formulele sunt randate de mecanismul comun, fără `.science-math-error`; inspecție vizuală a paginii de explicații.
- Export CSV descărcat și citit, cu antete SI și date numerice. Valorile U nedefinite se exportă goale, nu zero. Istoric grafic limitat la primul punct și ultimele 499; exportul păstrează primul și ultimele 9999 de eșantioane.
- Intrare directă → capitol → laborator; Home → laborator; Mod tablă pornit/oprit; sunetul comun își păstrează starea între pagini și la întoarcerea în istoric.
- Nicio eroare JavaScript, resursă HTTP eșuată sau cerere externă în scenariile testate.

Matrice: 3840×2160 DPR1, 1920×1080 DPR2, 1366×768, 1024×768, 390×844; RO și EN; text 100% și 200%; toate cele patru secțiuni. Fără overflow orizontal al documentului; butoane verificate ≥44 px, în modul tactil ≥52 px. La text 100%, scena, graficele și comenzile încap simultan pe ecranele desktop/tabletă testate: marginea de jos a workspace-ului la aproximativ 749 px pe 1366×768 și 713 px pe 1024×768. Pe telefon și la text 200% există derulare verticală. Telefonul are geometrie SVG adaptată, cu ambele semicelule vizibile; nu micșorează schema desktop până la text ilizibil.

## Performanță

Trei probe de circa 2,5 s: interval median 16,7 ms, P95 16,8 ms (~60 FPS). Timpul măsurat este costul JavaScript al actualizării desenului, nu întregul pipeline GPU.

| Viewport / DPR | Mediană desen | P95 desen |
|---|---:|---:|
| 3840×2160 / 1 | 4,0 ms | 5,6 ms |
| 1920×1080 / 2 | 4,0 ms | 7,0 ms |
| 1366×768 / 1 | 3,9 ms | 5,5 ms |

Probă finală după 510 pași, cu istoricul plafonat la 500 și număr egal de marcatori pentru electroni și fiecare familie de contraioni: 183 cadre, mediană desen **3,8 ms**, P95 **5,6 ms**, interval median **16,7 ms**, P95 **16,8 ms**. Numărul limitat de noduri și puncte previne creșterea nelimitată a randării. Nu sunt rezultate de benchmark universal și nu reprezintă un test de autonomie pe mobil.

Dovezi locale: `outputs/daniell-browser.json`, `outputs/daniell-final.json`, `outputs/daniell-check.log`; capturi `daniell-final-desktop.png`, `daniell-final-phone.png`, `daniell-theory.png`. Fișierele outputs sunt artefacte locale de verificare.

## Limite și netestat

- Nu s-au testat un telefon fizic, o tablă interactivă fizică, multitouch, Safari/iOS sau Firefox; touch și DPR sunt emulate în Chrome.
- Nu s-au efectuat măsurători electrochimice reale. Soluțiile ideale și rezistența internă constantă sunt aproximații explicite; nu prezicem polarizarea, difuzia sau încălzirea reală.
- Sunetul a fost verificat ca stare/control comun, nu audiat pe echipament fizic. Nu există sonificare fizică proprie acestui experiment.
- Ascunderea filei este tratată în cod prin `visibilitychange`; testul automat a verificat suspendarea între secțiuni și navigarea în istoric, nu toate politicile de throttling ale sistemelor mobile sau toate restaurările BFCache.
- Nu s-a creat arhivă ZIP autonomă și nu s-a promis suport `file://`/PWA; cererea este pentru integrarea web. Toate resursele laboratorului se livrează împreună în distribuția HTTP.
- Publicarea pe site-ul de producție nu a fost cerută explicit și nu a fost efectuată. Integrarea și verificările sunt locale.
