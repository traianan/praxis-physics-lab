# Audit general — Praxis · Fizică interactivă

Data auditului: 6 noiembrie 2026. Domeniu: aplicația din `D:/ProiecteAI/Praxis-Fizica`
(cod, conținut, distribuție, accesibilitate, performanță, mentenanță).
Auditul nu a modificat codul aplicației; singurul fișier adăugat este acest raport.

## 1. Rezumat executiv

Aplicația este într-o stare bună pentru un produs educațional: 26 de laboratoare,
407 teste automate care trec, conținut RO/EN, fără dependențe externe la rulare,
consimțământ pentru stocare locală, suport pentru `prefers-reduced-motion` și un mod
tablă funcțional. Problemele găsite sunt concentrate în patru zone:

| Zonă | Stare | Observație scurtă |
| --- | --- | --- |
| Corectitudine științifică | Bună | Teste dedicate modelelor; verificări documentate per laborator. |
| Testare și verificare | Bună, cu goluri | 407/407 trec, dar unele module comune nu sunt verificate sintactic, iar CI lipsește. |
| Localizare RO/EN | Bună, cu scăpări | Texte vizibile rămân în română în EN; verificarea automată e punctuală, nu sistematică. |
| Performanță | Slabă | 672 KB de bundle încărcat pe Home fără a fi necesar; ~690 KB de antet cu fonturi base64 pe fiecare laborator. |
| Mentenanță | Medie | 5 locuri de actualizat pentru fiecare laborator nou; surse duplicate la rădăcină; documentație dispersată. |
| Accesibilitate | Medie | Nume accesibile tehnice (`inLen`, `sVolt`) pe slidere; câteva texte dinamice netraduse. |
| SEO / distribuire | Slabă | Capitolele sunt doar rute hash, fără sitemap/robots; fallback fără JavaScript inutilizabil. |

Prioritățile recomandate, în ordinea impactului: (1) remedierea persistenței locale
pentru pendul, (2) curățarea performanței pe Home și în laboratoare, (3) completarea
localizării EN și automatizarea verificării ei, (4) extinderea verificărilor și CI,
(5) curățenie de depozit și un manifest unic al laboratoarelor.

## 2. Metodă și dovezi

- `npm run check` — a trecut integral: validare sintactică + **407 teste, 0 eșecuri**
  (~30 s). Testele acoperă modele fizice, Canvas, sunet, localizare, server, catalog.
- Browser real, servind `dist/` prin `node scripts/serve.mjs`: Home la 1440×900,
  1024×600, 512×384, 390×844; laboratoarele Condensatorul, Unde mecanice,
  Noțiuni termodinamice, Pendulul gravitațional; RO→EN→RO; mod tablă.
- Măsurători de rețea și DOM în browser (transfer, noduri, timpi), plus inspecție
  de cod și de fișiere. Nu s-a testat pe tablă fizică sau pe dispozitiv Android.
- Nu s-au rulat scripturile de QA din `scripts/qa/` (necesită Playwright/browser
  separat); concluziile de layout se bazează pe verificările din browserul de audit.

Rezultate bune confirmate: fără overflow orizontal la 390×844, 512×384, 1024×600;
mod tablă fără overflow la 512×384 (pagina 1/4, 2 capitole/pagină); nicio resursă
externă încărcată la rulare (doar linkuri externe în text); schimbarea limbii pe Home
nu lasă text românesc vizibil; comutatorul de sunet și bannerul de consimțământ
funcționează.

## 3. Constatări

### P1 — Persistența locală este ruptă pentru pendul (bug funcțional)

`public/shared/privacy.js` aplică un „pod” peste `Storage` și permite scrierea reală
doar pentru cheile din lista `preferenceKeys`. Laboratorul Pendulul gravitațional
salvează sub prefixul `pendul.v1.` (`public/simulari/pendulul-gravitational/app.js:36-37`),
care **nu este în listă**. Efectul, reprodus în browser după acceptarea preferințelor:

1. „Add point (ℓ, T)” afișează „Point added…” și valoarea există în memorie;
2. `localStorage` nu conține `pendul.v1.points`;
3. după reload, punctul, măsurătorile și bifele au dispărut.

Contrazice și textul propriu al laboratorului („Măsurătorile și bifele se salvează
doar local (localStorage)…”). Remediere: includerea prefixului `pendul.v1.` (sau o
regulă pe prefix) în lista de preferințe și un test care compară cheile scrise în cod
cu lista permisă.

### P1 — Performanță: bundle-uri mari încărcate necondiționat

Măsurat pe Home (1440×900, 45 cereri): **887 KB** transfer după încărcarea ambelor
limbi (≈826 KB la prima încărcare), din care `shared/content-types.bundle.js` =
**672 KB** (76%). Bundle-ul include KaTeX complet și fonturile KaTeX ca `data:`
base64, deși Home nu afișează formule.

Pe un laborator (Condensatorul): **937 KB**, din care `shared/lab-header.js` =
**689 KB**. Linia 235 a acestui fișier are **367 KB** doar cu `@font-face` base64;
restul este KaTeX. Fonturile sunt descărcate chiar și în browserele care folosesc
MathML nativ (calea modernă), deci efortul e în mare parte inutil.

Recomandări, în ordinea beneficiului:
1. Scoateți `content-types.bundle.js` de pe Home sau încărcați doar clasificatorul
   necesar (câteva KB) — Home nu are nevoie de matematică.
2. Serviți fonturile KaTeX ca fișiere `.woff2` separate, cu `font-display: swap`;
   injectați CSS-ul de rezervă doar când MathML nu este disponibil.
3. Încărcați KaTeX la cerere (import dinamic) numai când apare o formulă fără MathML.
4. Adăugați un buget de performanță în verificări (ex. JS < 250 KB/pagină) și
   `loading="lazy"` pentru imaginile cardurilor.

### P1 — Localizare: texte românești vizibile în interfața engleză

Verificat în browser și în datele de traducere:

- **Condensatorul**: fila rămâne „Laborator” în EN (lipsește cheia `"Laborator"` din
  `public/locales/capacitor/en.json`); subtitlul devine „Interactive laboratory **de
  electrostatică**” (potrivire parțială, textul complet nu e cheie); aria-label-ul
  „Secțiunile lecției” rămâne în română.
- **Noțiuni termodinamice**: butonul „Cuprins” rămâne în română. Butonul este introdus
  în `nav#praxis-main-menu`, marcat `data-no-i18n` de
  `public/shared/site-navigation.js:12`, deci motorul global nu îl traduce; eticheta
  trebuie tradusă explicit la montare. Faza „Admisie” apare netradusă la prima
  afișare a animației.
- În datele EN există **16 valori identice cu cheia românească** (ex.
  `courses/unde-mecanice/basics/en.json`: „Ecuația undei plane”, „Tub închis la
  ambele capete” în `principiul-i-al-termodinamicii`, două indicii în
  `notiuni-termodinamice`, `placeholder="răspuns"` în trei laboratoare). O parte par
  chei nefolosite, dar nu există o verificare care să le distingă de cele vizibile.

Recomandare: test automat care, pentru fiecare laborator și fiecare tab, randează în
EN și respinge textul cu diacritice românești sau cu cuvinte-funcție românești, plus
un test care compară cheile din dicționare cu textele din DOM. Testele actuale verifică
doar șiruri enumerate manual.

### P2 — Verificarea sintactică ratează module livrate

`npm run check` enumeră manual fișiere. **18 module comune nu sunt verificate**, deși
sunt încărcate de pagini: `shared/site-navigation.js`, `shared/privacy.js`,
`shared/lab-workspace.js`, `shared/canvas-resolution.js`, `shared/panel-layout.js`,
`shared/content-types.js`, `shared/math-compatibility.js`, `shared/info-page.js`,
modelele `waves-*`, `hooke-*`, `faraday-probe.js` etc.

Mai grav, pentru cel mai nou laborator verificarea indică sursa, nu copia livrată:
`condensatorul/js/{lab,teorie,integration}.js` (rădăcină) în loc de
`public/simulari/condensatorul/js/…`; `main.js` și `model.js` nu sunt verificate deloc,
deși pagina le încarcă.

Recomandare: un script `scripts/check-syntax.mjs` care parcurge `public/**/*.js` și
`scripts/**/*.mjs` (cu excluderea `vendor/`), înlocuind linia de ~8 KB din
`package.json`. Reduce riscul și face lista imposibil de uitat.

### P2 — Home fără JavaScript și fără URL-uri indexabile

- Fallback-ul static din `public/index.html` afișează „7 capitole · **3 simulări**” și
  liste goale; fără JS biblioteca este inutilizabilă, iar cifra este greșită (sunt 26).
- Toate cele 26 de laboratoare împart aceeași pagină de bibliotecă (`/`), iar capitolele
  sunt rute `#capitol/<id>`, deci paginile de capitol nu pot fi indexate sau partajate
  cu titlu/descriere proprii. Paginile laboratoarelor au URL propriu, dar le lipsește
  `meta description` și `canonical` (verificat pe Condensatorul, Unde mecanice, Hooke).
- Lipsesc `robots.txt`, `sitemap.xml`, `hreflang` și metadate sociale per laborator.

Recomandare: generare statică la build pentru pagini de capitol (și, ideal, pagini de
intrare per laborator) cu `title`/`description`/`og:image` proprii; `sitemap.xml`
generat din `catalog.js`; actualizarea contorului din fallback la build sau eliminarea
lui. Alternativ, minim: fallback corect + `<noscript>` cu lista laboratoarelor.

### P2 — Home promovează cele mai vechi laboratoare din fiecare capitol

`getHomeSimulations()` ia primele două intrări din ordinea din catalog, nu cele mai
noi. Pe Home apar astfel „Mișcarea rectilinie” și „Calcul vectorial”, nu MCU/Newton;
la Sunete apar „Unde mecanice”/„Oscilatorul mecanic”, nu Chladni/compunerea/pendulul;
la Căldură apar noțiunile și calorimetria, nu motoarele termice sau transformările de
stare. Secțiunea „Ultimele laboratoare” acoperă parțial nevoia, dar cardurile principale
nu reflectă oferta actuală.

Recomandare: fie „cele mai noi două”, fie o listă explicită `featured` în catalog, cu
etichetă clară („Recomandat”, „Nou”). De asemenea, numerotarea cardurilor
(`07`, `09`, `08`) este indexul global, nu ordinea din capitol — fie se numerotează
local, fie se elimină.

### P2 — Accesibilitate: nume tehnice pe controale

Sliderele primesc numele accesibil din `id`-ul intern: „Decrease **inLen** by 0.005”,
„Decrease **inMass**…”, „Decrease **sVolt** by 0.5”, „Decrease **sSpeed** by 0.25”.
Un cititor de ecran nu poate interpreta aceste etichete. Există deja `<label>` textual
lângă ele („String length”, „Source voltage E”) — trebuie legat prin
`aria-labelledby`/`aria-label`, iar butoanelor ± să li se dea etichete umane.

Alte puncte: titluri (`h3`) în interiorul linkurilor din cardurile de capitol;
pe mobil există două intrări în navigație („Open menu” și „☷ Chapters”); nu există
audit automat de accesibilitate. Recomandare: `axe-core` în teste pe 3–4 pagini
reprezentative + corectarea generării comune de slidere (un singur loc).

### P2 — Igienă de depozit și documentație

- La rădăcină sunt snapshoturi de sursă duplicate față de `public/simulari/`:
  `condensatorul/`, `Legea lui Coulomb/`, `Transformari de stare de agregare/`,
  `motoare-termice/`, `interactii-atomice/`, `principiul-i-aplicatii/`,
  `compunerea_oscilatiilor/`, `oscillator-mecanic/`, `pendulul gravitational/`
  (~4,8 MB, unele cu diacritice și spații în nume), deși convenția documentată este
  `sources/` (ignorat de git). Plus trei fișiere unice la rădăcină
  (`gemini-code-*.html`, `chladni.html`, `Mcu-Lectie-Interactiva-Premium.html`).
- README anunță „Biblioteca cuprinde 24 de laboratoare” / „23” / „21”; catalogul are
  **26**. Contorul este actualizat manual, deci va rămâne în urmă.
- 132 de fișiere în `docs/` și 172 în `scripts/`, multe rapoarte istorice; nu există
  index al rapoartelor și nici marcaj clar „actual/istoric”.
- Lipsesc `LICENSE`, `.editorconfig`, lint/format și orice CI (`.github/workflows`).
- README menționează încă „109/109 teste”; acum sunt 407.

Recomandare: mutarea surselor în `sources/<id>/` (sau ștergerea celor deja importate),
un `docs/INDEX.md`, `LICENSE` (dacă se dorește distribuire publică), plus CI minim.

### P3 — Greutatea distribuției

`dist/` are 46 MB, din care **20 MB sunt 22 de arhive `.zip`** servite ca descărcări
din paginile laboratoarelor (fiecare laborator există și ca sursă, și ca arhivă).
`outputs/Praxis-Fizica-local.zip` are 58 MB și include și snapshoturile de sursă.

Recomandare: păstrați arhivele pentru descărcare, dar cu cache lung și, dacă e posibil,
în afara arborelui publicat (bucket separat) sau într-un subdirector `/downloads`
exclus din sitemap. Pentru publicarea Vercel, verificați limita de dimensiune și
timpul de deploy.

### P3 — Alte observații

- **Fără temă întunecată**: 0 fișiere CSS cu `prefers-color-scheme`; `prefers-reduced-motion`
  este tratat în 18 fișiere (bine).
- **Fără PWA/manifest pentru bibliotecă**: doar laboratorul Calcul vectorial înregistrează
  un service worker. Biblioteca necesită server local pentru offline.
- **Fără stare „continuă de unde ai rămas”**: se păstrează doar contextul de navigare
  (sesiune), nu progresul.
- **Căutarea** acoperă doar metadatele catalogului, nu textul lecțiilor.
- **Fenomene cuantice** este singurul capitol complet gol; apare pe Home ca „În pregătire”.
- **Monetizarea** este corect ținută inactivă (fără SDK, fără consimțământ fictiv).

## 4. Idei de îmbunătățire, prioritizate

### Quick wins (1–2 zile fiecare)

1. Repararea listei de persistență din `privacy.js` + test de acoperire a cheilor.
2. Eliminarea bundle-ului de pe Home și a fonturilor base64 din antet (economie de
   ~700 KB/pagină, fără schimbare vizuală).
3. Completarea traducerilor EN găsite (Condensatorul, Cuprins, Admisie) și un test
   „EN fără diacritice românești” pe fiecare laborator.
4. `scripts/check-syntax.mjs` peste tot `public/` + corectarea căii pentru Condensatorul.
5. Fallback static corect (contor + `<noscript>`) și `loading="lazy"` pe imagini.
6. Etichete umane pentru slidere și butoanele ±.

### Structurale (1–3 săptămâni)

7. **Manifest unic al laboratoarelor** (`labs.manifest.json`) din care să derive
   catalogul, listele de verificare, împachetarea, namespace-urile de traducere și
   paginile generate. Astăzi fiecare laborator nou cere modificări în 5 locuri.
8. **Generare statică** pentru pagini de capitol/laborator + `sitemap.xml` + `robots.txt`
   + metadate sociale per laborator. Impact direct pe descoperire și pe partajarea către
   elevi/profesori.
9. **PWA pentru bibliotecă** (manifest + service worker cu versiune derivată din build),
   ca tableta să funcționeze offline fără server local. Extinde modelul deja folosit
   de Calcul vectorial.
10. **Progres local, fără cont**: „continuă de unde ai rămas”, laboratoare vizitate,
    steag „am înțeles” per secțiune, sincronizare opțională doar cu consimțământ.
11. **Căutare full-text la build** peste dicționarele RO/EN, cu link direct la secțiune.
12. **CI GitHub Actions**: `npm run check`, `npm run build`, verificare de linkuri,
    `axe-core` pe 3 pagini, buget de performanță. Publicarea rămâne manuală până la
    decizie.

### Produs / conținut

13. Profesor: „pachet de clasă” (link + cod QR + fișă printabilă), mod prezentare
    (modul tablă există deja — de promovat explicit).
14. Elev: întrebări de predicție înainte de simulare și autoevaluare scurtă după, cu
    feedback imediat (unele laboratoare au deja test; se poate unifica).
15. Acoperirea capitolelor subțiri: Fenomene cuantice (0), Lumină și radiații (1),
    Lucru mecanic (1).
16. Accesibilitate vizuală: contrast verificat automat pe paletele științifice,
    opțiune „text mare” globală (există pe lecții, nu în bibliotecă).

## 5. Plan propus

| Etapă | Conținut | Rezultat |
| --- | --- | --- |
| Săptămâna 1 | P1: persistență, performanță, traduceri EN, check-syntax | Bug-uri funcționale închise; Home sub ~250 KB |
| Săptămâna 2 | Manifest unic, fallback static, CI minim, a11y slidere | Regresii prinse automat; laborator nou mai ieftin de adăugat |
| Săptămâna 3 | Pagini statice + sitemap, PWA bibliotecă | Descoperire mai bună; offline pe tabletă fără server |
| Ulterior | Progres local, căutare full-text, conținut lipsă | Valoare didactică și retenție |

## 6. Limitele auditului

- Nu s-a testat pe tablă fizică, Android sau Safari; verificările de layout sunt în
  browserul de audit, la dimensiunile enumerate.
- Nu s-au rulat scripturile din `scripts/qa/` care necesită Playwright.
- Nu s-au verificat toate cele 26 de laboratoare tab cu tab; localizarea a fost
  verificată pe paginile enumerate în secțiunea 2, plus scanarea dicționarelor.
- Nu s-a evaluat viteza pe rețea reală (măsurătorile sunt localhost, fără compresie).
