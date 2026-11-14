# Mișcarea în câmp gravitațional

Lecție nativă Praxis, 14 noiembrie 2026. Capitol: **Mișcare**. Identificator: `miscarea-in-camp-gravitational`.

## Conținut și sursă

Sursa furnizată: `D:/Scoala/traian/catedra de fizica 2026-2027 - N. Iorga/Manuale IX PDF/Litera-87-92.pdf`. Fișierul are șase pagini; numerele tipărite sunt 85–90, diferite de numele fișierului. Au fost extrase textele și inspectate schemele. PDF-ul original nu este copiat în aplicație. Explicațiile, scenele și problemele lecției sunt implementate și redactate pentru Praxis.

Solicitările ulterioare ale utilizatorului prevalează asupra conținutului PDF: **fără plan înclinat**; **parabola de siguranță inclusă la aruncarea oblică**.

Șapte secțiuni RO/EN:

- Laborator: cădere din repaus, aruncare verticală în jos/în sus, aruncare orizontală/oblică. Parametri h₀, v₀, α, g; pornire/pauză/pas/resetare, vârf, impact, deplasare pe axa timpului. Schimbarea condițiilor inițiale resetează experimentul; schimbarea limbii, graficului sau afișajului nu îl resetează.
- Teorie: șase subiecte selectabile, cu formule, ipoteze și legătură spre Mecanica cerească.
- Comparații: cădere versus lansare orizontală; unghiuri complementare la același nivel și de la înălțime. Cele două corpuri folosesc același ceas; după impact fiecare rămâne la sol.
- Energie și măsurători: variația masei, energiile cinetică/potențială/totală, 12 stări în jurnal și export CSV cu parametrii de lansare.
- Șase probleme numerice, cu indiciu, rezolvare și feedback; sunt acceptate atât virgula, cât și punctul zecimal.
- Verificare cu șapte întrebări și explicații.
- Hartă interactivă a conceptelor cu legături către secțiuni.

## Model fizic și parabola de siguranță

Model analitic în SI: câmp uniform, sol orizontal y = 0, fără aer; +x spre dreapta, +y în sus. Mișcarea se oprește exact la primul contact cu solul. Viteza afișată atunci este cea imediat înainte de impact; nu se modelează ciocnirea. Pasul de animație nu introduce erori de integrare în traiectorie.

`x = v₀ cos(α)t`, `y = h₀ + v₀ sin(α)t − gt²/2`, `vₓ = v₀ cos(α)`, `vᵧ = v₀ sin(α) − gt`.

Timpul de impact folosește rădăcina pozitivă, calculată stabil și pentru lansări în jos de la înălțimi foarte mici. Cazurile h₀ = 0 și vᵧ₀ ≤ 0 au durată zero. În cazul vertical, vₓ este fixat exact la zero. Energia este verificată înainte de impact, nu după o eventuală ciocnire.

Pentru v₀ > 0, anvelopa este `y_s(x) = h₀ + v₀²/(2g) − gx²/(2v₀²)`. Se reprezintă ramura x ≥ 0 deasupra solului, ca linie punctată, plus o familie de cinci traiectorii la unghiuri diferite și aceeași viteză inițială. Vizibilitatea este comutabilă. Anvelopa nu este prezentată drept traiectoria unui singur corp. Pentru v₀ = 0 este ascunsă și cazul este explicat.

La un punct x > 0 al anvelopei, traiectoria tangentă are `tan α = v₀²/(gx)`. Testele verifică egalitatea în punctul de tangență, egalitatea pantelor și faptul că traiectoriile familiei nu depășesc anvelopa.

Distincții explicate explicit:

- La vârful unei aruncări oblice se anulează vᵧ, nu întreaga viteză; accelerația rămâne orientată în jos.
- Bătaia maximă la 45° și egalitatea bătăilor pentru unghiuri complementare presupun lansare/aterizare la același nivel, fără aer și cu g constant.
- La lansare de la înălțime, unghiul optim este mai mic de 45°; se prezintă formula și condițiile ei.
- Timpul de cădere nu depinde de masa corpului sau de viteza sa orizontală în modelul ideal.
- Vitezele și accelerația au scări grafice distincte, declarate. Axele spațiale x și y folosesc aceeași scară.

## Integrare și biblioteci

Surse: `public/simulari/miscarea-in-camp-gravitational/{index.html,content.js,model.js,app.js,style.css}`. Lecția este înregistrată în manifest, catalog, traducerile capitolului, workspace și adăugările recente. Miniatură SVG originală în `public/assets/`.

uPlot 1.6.32 este utilizat local pentru y(t), vᵧ(t), vₓ(t), cu cursor sincronizat cu ceasul experimentului. Nu sunt necesare Planck sau Matter pentru mișcarea analitică fără coliziuni. Scenele și barele de energie folosesc SVG. Graficul uPlot este randat la densitatea politicii `PraxisCanvasResolution`, cu redimensionare de afișare; nu se modifică `window.devicePixelRatio`. Valorile curente și jurnalul oferă alternative textuale la reprezentarea grafică.

Sunt reutilizate antetul, breadcrumbs, Mod tablă, sunetul, traducerile, formulele și comenzile tactile Praxis. Preferința de mișcare redusă dezactivează redarea continuă, păstrând pasul manual. La ascunderea secțiunii/documentului sau ieșirea scenei din ecran, animația se suspendă.

Export autonom: `public/simulari/miscarea-in-camp-gravitational/miscarea-in-camp-gravitational.zip`. Generare prin `node scripts/build-courses-offline.mjs --course=miscarea-in-camp-gravitational`. JavaScript, uPlot, CSS și traducerile comune sunt incluse local; licența uPlot este păstrată în arhivă. Linkul spre lecția conexă este ascuns în exportul autonom, unde acea lecție nu există.

## Verificări

- Șapte teste independente de interfață: cădere/aruncări, evenimentul de impact, degenerări, independența axelor, complementare și unghi optim, conservarea energiei/independența masei, anvelopă și tangență.
- Suita generală: `npm run check`, **465/465**. Build reușit. Testele catalogului au fost actualizate pentru 36 de laboratoare, nouă în Mișcare, și ordinea adăugărilor.
- `scripts/qa/gravity-motion.mjs`: șapte secțiuni × RO/EN × text 100/200% × 390/1024/1366/1920/3840 px, cu DPR 1/2/3. Subiectele teoretice sunt verificate separat. Fără overflow orizontal, erori JS/matematice sau texte românești cu diacritice rămase în EN.
- Verificate cinci moduri, vectori/anvelopă, grafice, pauză/pas/reset, suspendare, navigarea temporală, comparații, masa/energia, CSV, răspunsuri numerice și câmp gol, quiz 0/7 și 7/7/reset, hartă, tastatură și touch emulat. Capturi desktop/mobil inspectate vizual.
- `scripts/qa/gravity-motion-delivery.mjs`: intrare Home/capitol, refresh, breadcrumbs, URL direct cu secțiune, lecția conexă, Mod tablă, continuitatea sunetului și mute, selector mobil, caz extrem lunar și păstrarea stării la traducere. Încadrarea scenei/graficului/comenzilor pe desktop 1366×768 și densitatea Canvas sunt verificate prin măsurători.
- Arhivă verificată CRC și licență; file:// la 1366/390 px, șapte secțiuni RO/EN, cu HTTP blocat.

Rapoarte și capturi locale: `outputs/gravity-motion/`. Verificarea mobilă este emulare Chrome; telefonul fizic, tabla fizică și Safari/iOS nu au fost testate. Publicarea lecției și a corecției de stabilitate a fost autorizată ulterior de utilizator.
