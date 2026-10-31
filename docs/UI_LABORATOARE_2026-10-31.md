# Direcția premium în laboratoarele Praxis

Data: 31 octombrie 2026. Cerere: extinderea direcției vizuale aprobate pentru bibliotecă în paginile laboratoarelor, păstrând culorile și lizibilitatea diagramelor.

## Implementare

Introducere petrol compactă cu titlu ivory și accent mentă; selecție petrol în navigarea principală și taburile interne; suprafețe calde, acțiuni principale contrastante și rame discrete pentru panouri. Tipografia lecțiilor și dimensiunile controalelor folosesc contractul existent. Nicio dependență sau font extern nou, nicio animație decorativă continuă.

Sursa este `public/design-system/laboratory-premium.css`, inclusă automat și idempotent în `laboratory.css`. Optica este sincronizată cu fișierul inclus în HTML, prin mecanismul existent. Registrele de culori, modelele, formulele și codul de desen nu au fost modificate.

Optica folosește documentul normal derulabil în afara Mod tablă, astfel încât antetul contextual și introducerea să nu comprime scena. Scena păstrează minimum 24rem. În ecranul complet nativ folosește spațiul disponibil flexibil; Mod tablă își păstrează regulile originale. Pe telefon, exportul din introducere este sub text. Fundalul lecturii întunecate rămâne cel existent.

## Verificări

- `npm run sync:optics` și `npm run build`: reușite.
- `npm run check`: 200 de teste trecute, 0 eșecuri, inclusiv verificările de import/conservare a conținutului și testele fizice existente.
- Reconstruirea repetată a bundle-ului produce conținut identic; există un singur bloc generat. Distribuția integrată a opticii include aceeași sursă.
- Audit în browser al paginii inițiale din toate cele 19 laboratoare la 1440 px: introduceri stilizate, fără depășirea lățimii paginii, resurse HTTP eșuate sau imagini lipsă observate.
- Aceleași 19 pagini, în engleză la 390 px: fără depășirea lățimii paginii, fără titluri tăiate și fără resurse eșuate observate.
- Tabletă 1024 px: optică, vectori, unde și motoare termice verificate în engleză; fără depășirea lățimii paginii. Scena optică are 384 px.
- În optică au fost comparate stilurile calculate pentru 80 de elemente SVG cu și fără stratul premium: culorile fill/stroke și fonturile sunt identice. Comparația separată a elementelor SVG din figurile motoarelor termice a rămas identică înainte/după schimbare.
- În Motoare termice: schimbarea Praxis/Vii și activarea Mod tactil păstrează valorile celor trei cursoare vizibile. Navigarea în tabul motoarelor funcționează, cu text deschis pe selecție petrol.
- Optică, ecran complet nativ: card de 1000 px, scenă de 819 px, `flex: 1 1 0%`; intrare efectuată prin butonul real, după aducerea filei în prim-plan.
- Optică, Mod tablă: introducere ascunsă, scenă de 743 px în viewportul testat; la ieșire, scenă normală de 420 px.
- Optică, telefon: introducere în coloană, export sub descriere, titlu netăiat, fără depășire orizontală; scenă de 420 px în viewportul de 1000 px înălțime.
- Mișcare rectilinie în lectura întunecată: fundalul rămâne `#14211d`; titlul introductiv are contrast deschis. Stilurile sunt evaluate după încheierea tranziției native.

## Review

Reviewul independent a identificat o problemă P2: înălțimea normală a scenei optice putea suprascrie creșterea ei în fullscreen nativ. Regula a fost corectată explicit pentru `.scene-card:fullscreen` și verificată în browser. Reviewerul a confirmat integrarea și idempotenta bundle-ului; verificările vizuale, tactile și de culori au fost efectuate de implementator prin conexiunea activă de browser.

Auditul nu reprezintă testarea manuală a fiecărei combinații de parametri din fiecare tab al celor 19 lecții. Comportamentul modelelor este acoperit suplimentar de suita existentă; modificarea privește prezentarea.

## Dovezi locale

Capturile `lab-premium-optics-desktop.png`, `lab-premium-engines-desktop.png`, `lab-premium-optics-mobile.png` și raportul `lab-discovery-qa.json` sunt în folderul local `outputs/`, ignorat de Git. Jurnale: `lab-discovery-sync.log`, `lab-discovery-build.log`, `lab-discovery-check.log`.

Implementarea a fost pregătită în `codex/laboratory-discovery`. Ulterior, la 31 octombrie 2026, utilizatorul a cerut explicit publicarea modificărilor pe GitHub, în `main`; această solicitare autorizează commitul, integrarea și pushul pentru actualizarea aplicației online.
