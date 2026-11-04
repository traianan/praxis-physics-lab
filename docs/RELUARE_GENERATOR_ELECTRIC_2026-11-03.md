# Reluare — Generatorul electric

**Actualizare la 4 noiembrie:** lucrul a fost reluat. Scena folosește acum repere numerotate, materiale opace, consumator și instrumente conectate; formulele au notație matematică structurală. Starea actuală și rezultatele verificărilor sunt în [raportul de integrare](INTEGRARE_GENERATOR_ELECTRIC.md). Nota de mai jos păstrează istoricul opririi din 3 noiembrie.

Oprire explicită cerută de utilizator în seara de 3 noiembrie 2026. Continuare dorită mâine, 4 noiembrie. Nu există sarcină automată sau monitorizare programată.

## Stare salvată

Proiect: `D:/ProiecteAI/Praxis-Fizica`. Ramură locală: `codex/generator-electric`. Modificările sunt salvate pe disc, încă necomise. Nu s-a făcut push sau publicare remote. Nu șterge și nu reinițializa modificările existente.

Specificația aprobată: `docs/superpowers/specs/2026-11-03-generator-electric-design.md`. Plan: `docs/superpowers/plans/2026-11-03-generator-electric.md`.

Documentare efectuată prin Firecrawl: patru surse PhET/OpenStax, cu URL-uri și observația privind confuzia dintre vârf și medie în exemplul OpenStax 13.6. Modelul ales explicit de utilizator este alternatorul cu bobină rotativă în câmp uniform, nu geometria magnetului rotativ din PhET.

Implementat:

- Motor fizic ES independent: `public/shared/generator-model.js`, soluție analitică, flux/tensiune/curent/puteri/moment și energie stabilă numeric.
- Laborator: `public/simulari/generator-electric/`, cu patru secțiuni, comenzi, grafice, formule, două probleme, șase întrebări și resurse.
- Catalog, workspace și traduceri RO/EN înregistrate. Bibliotecile Three.js 0.187.0 și GSAP 3.15.0 sunt incluse local în `public/vendor/`, cu notificările de licență.
- `public/` este sursa; `dist/` a fost regenerat după ultima schimbare. Nu edita direct dist.
- Teste: `test/generator-model.test.mjs`, `test/generator-integration.test.mjs`; adaptarea testelor catalogului la 20 de laboratoare și data nouă.

## Cerințele vizuale ulterioare ale utilizatorului

Utilizatorul a respins prima scenă SVG ca fiind prea simplistă și a cerut un circuit complex realizat cu Remotion sau HyperFrames. S-a ales HyperFrames: compoziție deterministă GSAP cu renderer Three.js, fără ceas separat de modelul fizic.

Scena actuală are înfășurare, arbore, stator în secțiune, două inele colectoare complete și izolate, perii fixe, conductoare conectate, sarcină rezistivă, întrerupător, ampermetru în serie și voltmetru la bornele generatorului. Există vedere în perspectivă și frontală. Volmetrul este la bornele a/b, deci indică e și când circuitul este deschis; nu este legat exclusiv peste rezistorul izolat de întrerupător.

Două corecții vizuale explicite au urmat:

1. Numele pieselor au fost mutate în laterale, cu linii de indicație și puncte pe componente.
2. Ultima cerere: și casetele A/V, bornele a/b și eticheta normalei n blocau vederea. Și acestea au fost mutate lateral cu linii. Informația despre N și θ a fost mutată în bara de deasupra scenei, astfel încât centrul să rămână liber.

**Ultima mutare a A/V, a/b și n este salvată și construită, dar inspecția vizuală finală și repetarea QA după această mutare au fost întrerupte de oprirea cerută de utilizator. Începe cu această verificare, fără a reface cercetarea sau scena de la zero.**

## Verificări executate și limite

- `npm run check`: 359 teste trecute, fără eșecuri, înaintea ultimei relocări a casetelor. Log: `outputs/generator-check.log`.
- `npm run build`: ultima construire a încheiat cu succes după relocarea finală.
- Testele motorului verifică referința, limite, Faraday prin derivată independentă, energia prin cuadratură, conservarea energiei, circuit deschis/scurtcircuit și inversarea rotației.
- Browser QA a trecut cu mouse nativ și touch nativ emulat prin Playwright, inclusiv slider, Start/Pauză/Pas/Reset, reglaje și circuit deschis. Evenimente pointer de încredere confirmate.
- 96 de combinații au trecut: șase viewporturi, RO/EN, text 100%/200%, patru secțiuni, fără overflow de pagină. Dimensiuni: 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 DPR 2, 3840×2160 DPR 1.
- Geometrie verificată la sfert de perioadă: rotor ≈ π/2, normală corespunzătoare, două inele, perii fixe, timeline pe pauză; citiri și grafice sincronizate. Toleranța geometrică este 1e−5, din cauza rotunjirii GSAP.
- Fără erori JavaScript sau cereri externe la rularea laboratorului în testul browser.
- Performanță măsurată în Chrome headless, 1366×768 DPR 1, aproximativ 11 s: 503 cadre, mediană cost randare 10,4 ms, p95 12,1 ms; mediană interval 16,7 ms, p95 33,4 ms, 134 intervale peste 33,3 ms. Testele complete rulau în paralel o parte din timp; repetă măsurarea fără încărcare concurentă înainte de concluzia finală despre fluiditate. Costul măsurat este CPU/submisie, nu timp GPU izolat.
- HyperFrames check a trecut lint/runtime/layout/motion/contrast, fără avertismente craft, pentru versiunea anterioară ultimei relocări. Reîmpachetează și repetă pentru forma finală.
- Touch fizic pe telefon/tablă, Safari/iOS și publicarea pe site-ul live NU au fost verificate.
- Testul cu o filă de fundal prin Chrome DevTools a fost neconcludent: nu îl raporta drept validare reală a document.hidden. Suspendarea la schimbarea secțiunii a fost verificată.

Artefacte: `outputs/generator-browser-qa.json`, `outputs/generator-playwright.log`, `outputs/generator-desktop.png`, `outputs/generator-touch.png`, `outputs/generator-hyperframes-check.json`. Acestea sunt fișiere locale ignorate de Git; păstrează concluziile importante în documentația proiectului.

## Revizuirea independentă

Motorul, semnele și topologia circuitului au fost revizuite. Au fost corectate: stacking pe mobil, formula din Theory la schimbarea limbii, mutațiile inutile ale statusului, spirele care se intersectau, reperul bobinei care nu urmărea rotorul, clippingul etichetelor și paleta științifică a scenei. Ultima relocare a instrumentelor mai necesită inspecția descrisă mai sus.

Convenția geometrică: B pe −y, normala inițială pe −y, rotație pozitivă în jurul +x. Ordinea înfășurării dă normala −y. Primul capăt merge la inelul b (x=3,85), ultimul la a (x=3,08); pentru e pozitiv curentul exterior pleacă din a prin ampermetru/sarcină/întrerupător spre b.

## Pașii următori

1. Citește această notă și starea Git, apoi deschide versiunea construită. Verifică ultima mutare a tuturor casetelor: nimic peste aparat, linii clare, repere pe componente, fără suprapuneri sau text tăiat, în ambele vederi și pe mobil.
2. Repetă QA după eventualele corecții. Completează verificările de navigare Home/capitol/direct, Mod tablă, sunet între pagini și revenirea reală din fundal. Nu descrie operațiile simulate drept verificări pe hardware fizic.
3. Reîmpachetează compoziția: `node scripts/build-generator-composition.mjs`; validează prin `npx --yes hyperframes@0.9.9 check outputs/generator-hyperframes --json --samples 3` și inspectează cadrele. Sursele autoritative sunt scena aplicației și `public/simulari/generator-electric/hyperframes/index.html`; scriptul elimină traversările în afara proiectului din pachetul CLI.
4. Finalizează `docs/INTEGRARE_GENERATOR_ELECTRIC.md`, actualizarea README și starea planului/specificației. Raportează clar verificat/netestat și faptul că publicarea remote nu a avut loc.

## Instrumente și particularități de mediu

- Pentru server/teste HTTP locale, sandboxul a blocat conexiunile. Execuția permisă în afara sandboxului a funcționat. Nu este necesară schimbarea firewallului.
- Servere de lucru pornite în această sesiune: port 4199 funcțional, loopback; port 4198 a fost o încercare în sandbox. Nu presupune că vor rula mâine. Repornește după nevoie.
- Chrome DevTools a funcționat, dar apelurile către pagina inactivă după deschiderea unei file about:blank s-au blocat la final. Selectează explicit pagina cu bringToFront înainte de capturi, sau folosește runnerul Playwright.
- Runner: `scripts/qa/generator.playwright.mjs`. A folosit instalarea Playwright existentă din cache-ul HyperFrames, fără adăugare în package.json. Calea era `C:/Users/traian/AppData/Local/npm-cache/_npx/af752b90495482d7/node_modules/playwright-core/index.mjs`, prin variabila `PRAXIS_PLAYWRIGHT_MODULE`. Browser: Chrome instalat, headless.
- MCP node_repl a eșuat la importul Playwright; nu este necesar pentru reluare. `webcmd doctor` a început descărcarea unui browser nou; operația a fost oprită și nu a fost folosită. Nu instala încă un browser pentru acest proiect.

La reluare verifică rapid instrumentele expuse, conform AGENTS.md; nu relansa întregul inventar sau instalări.
