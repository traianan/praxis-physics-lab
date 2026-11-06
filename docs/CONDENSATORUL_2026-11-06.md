# Condensatorul — integrare și verificare

Integrat local la 6 noiembrie 2026 în capitolul Electricitate, magnetism și circuite.
Pagina: `simulari/condensatorul/index.html`. Nu s-a publicat pe GitHub sau Vercel.

## Surse și regenerare

- Surse autoritative: `condensatorul/`; adaptarea vizuală este în `css/praxis.css`, integrarea în `js/integration.js`, traducerile în `translations.tsv`.
- `npm run import:capacitor` generează pagina unificată, scripturile și dicționarele RO/EN; `docs/imported-capacitor.json` înregistrează hashurile normalizate LF.
- `node scripts/build-courses-offline.mjs --course=condensatorul` generează arhiva autonomă.
- `npm run build` generează distribuția Web din `public/`.
- Registrul, capitolul, imaginea, data adăugării și configurația workspace sunt în mecanismele comune existente.

Pagina folosește antetul, traseul, preferințele, sunetul, motorul matematic și rezoluția Canvas comune. Sunetul original nu este încărcat în distribuția integrată. Introducerea originală cu animația decorativă `hero.js` rămâne în sursă, dar nu este parte din laboratorul publicat; intrarea deschide experimentul.

## Corecții

- Referințele la clasa a XI-a au fost eliminate.
- Container de maximum 1680 px, centrat, padding 24/12 px, identic cu Legea lui Coulomb. Text închis pe suprafețe ivory; eliminate culorile palide și panourile gri din tema originală.
- Teoria este împărțită în nouă teme selectabile. Formulele principale au surse TeX explicite, inclusiv `w = W/V = ε₀εᵣE²/2`, cu două fracții reale într-o singură expresie.
- Tema RC: constantă de timp compactă; formule și tabel alături de grafic pe desktop; grafic maximum 640 × 260 CSS px, minimum 180 px înălțime pe telefon; rearanjare la text mărit.
- Calculatoarele plan/RC/energie, șapte întrebări, șase presetări și misiuni sunt păstrate. Calculatorul RC nu se afișa din cauza nepotrivirii `calcRc`/`calcRC`; a fost corectat.
- Polarizarea este explicată separat pentru Q constant și pentru U constant la echilibru. Sunt precizate dielectricul liniar, umplerea completă, efectele de margine neglijate, pierderile și străpungerea omise.
- Ecuația RC este integrată exact, exponențial, eliminând depășirile numerice Euler. Modelul este separat în `js/model.js`.
- Circuitul are rezistor de 1 MΩ la încărcare și descărcare. Întrerupătorul deschis întrerupe efectiv firul desenat. Sursa este înlocuită de conexiune în modul de descărcare.
- Particulele indică sensul curentului convențional, se inversează la descărcare și se opresc la curent neglijabil. Semnele sarcinii și geometria sunt schematice.
- Graficul păstrează semnul curentului și tensiunile peste tensiunea sursei, fără tăiere. Axele folosesc U/24 V și I/24 µA, cu scară verticală adaptivă.
- Timpul animației este dilatat adaptiv: τ vizual între 0,6 și 3,5 s, cu echivalența fizică afișată. Astfel, și ceramica poate fi explorată fără minute de așteptare. Conversia este aplicată soluției RC exacte; nu schimbă C, Q, U, I sau τ fizic.
- Pauza oprește și scena, și graficul; citirile se actualizează imediat la pauză. Temele și filele ascunse suspendă evoluția. Resetarea restaurează timpul, viteza, geometria, dielectricul și misiunile.

## Verificări

- Suita generală: 407 teste trecute. Verificările focalizate model/catalog/navigare: 18 teste trecute.
- Verificare browser cu Chrome DevTools: 3840×2160 DPR1, 1920×1080 DPR2, 1366×768, 1024×768, 390×844. Acestea sunt emulări, nu test pe tablă sau telefon fizic.
- RO/EN, text 100%/200%, toate cele nouă teme, laborator și resurse: fără overflow orizontal al paginii. Textul mărit și ecranele mici permit derulare verticală; tabelele pot avea derulare locală.
- Mod tablă intrare/ieșire, Mod tactil, preferințe, linkuri canonice și înregistrarea Home/capitol verificate. Testele de navigare verifică toate legăturile interne și arhivele.
- Test real în browser, la viteza 4×: aerul a ajuns la 8,9155 V după 2,8012 s de animație; descărcarea la 0,6187 V după intervalul testat. Ceramica: 7,4120 V la 6,0716 s de animație, apoi 2,3621 V. Abaterile față de soluția analitică au fost sub 6×10⁻¹⁶ raportat la C·E. Curent pozitiv la încărcare, negativ la descărcare.
- Capturile Canvas înainte și după o așteptare în pauză sunt identice atât pentru scenă, cât și pentru grafic. Citirile Q/U/I coincid cu starea modelului la apăsarea pauzei.
- Izolare: la dublarea distanței, Q rămâne constant și U se dublează. Schimbarea limbii păstrează Q și parametrii; secțiunea ascunsă nu avansează timpul.
- Test cu răspunsurile corecte: 7/7, păstrat RO/EN. Fiecare mod calculator afișează exact panoul său; R=100 kΩ, C=100 µF produce τ=10 s.
- Arhiva extrasă, deschisă prin `file://`: încărcare, pauză și RO/EN funcționale, fără cereri HTTP și fără erori de consolă. Versiunea integrată nu cere manifest/PWA extern.

## Repere științifice

- [OpenStax — Capacitor with a dielectric](https://openstax.org/books/university-physics-volume-2/pages/8-4-capacitor-with-a-dielectric): distincția dintre sarcină constantă și tensiune constantă.
- [OpenStax — RC circuits](https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits): soluțiile exponențiale, constanta de timp și circuitul de descărcare.

Modelul rămâne didactic și ideal; nu simulează conductivitatea reală a apei, neliniaritatea ceramicii, străpungerea sau franjurarea câmpului.

### Descărcare și notația dielectricului
- Eticheta canvas folosește εᵣ, cu r indice.
- Sarcinile pozitive și negative se estompează simultan, proporțional cu Q/Q inițial la descărcare, inclusiv pentru dielectrici cu capacitate mare.
- Inversarea curentului păstrează pozițiile particulelor și inversează deplasarea lor.
- Verificat în browser: opacități identice pe ambele armături (0,720 → 0,370 → 0,136 → 0,012); particula de pe ramura stângă se deplasează spre stânga la încărcare și spre dreapta la descărcare. Cele șase teste capacitor trec. Arhiva offline regenerată.
