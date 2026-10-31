# Sistemul vizual Praxis · Fizică

Linkurile folosesc culoarea comună verde petrol Praxis, prin `--praxis-color-link`, inclusiv în starea vizitată. Sursa este `public/design-system/links.css`. `scripts/link-presentation.mjs` aplică aceeași regulă tuturor paginilor integrate și exporturilor autonome, fără a modifica sursele originale. În lecții, linkurile care arată ca butoane folosesc o suprafață deschisă pentru a păstra contrastul textului. Nu adăuga culori locale pentru linkuri în lecții. Biblioteca poate defini rolurile explicite `--praxis-link-ink` și `--praxis-link-button-background` pentru acțiuni cu text deschis pe petrol, acțiunea mentă și navigarea selectată; valorile implicite din lecții rămân identice.

Acesta este contractul comun pentru biblioteca și toate laboratoarele aplicației. Orice pagină nouă reutilizează componentele de aici. Nu creează o paletă și dimensiuni proprii pentru controalele obișnuite.

## Tipuri de conținut și pictograme comune

Catalogul unic este `public/design-system/content-types.json`, descris în [docs/CATALOG_CONTINUT.md](docs/CATALOG_CONTINUT.md). Folosește cele șapte familii SVG locale pentru explicații, simulări/experimente, grafice, formule, probleme, verificare și resurse. Nu adăuga o pictogramă nouă doar pentru un subiect de fizică. În conținutul nou, marchează titlurile relevante cu `data-content-type="simulation"` (sau tipul din catalog); antetul comun le aplică automat pictograma. Păstrează eticheta textuală și folosește maximum o pictogramă pe titlu. `data-no-content-icon` exclude un titlu. Nu insera pictograme în formule, Canvas, jurnale editabile, fiecare paragraf sau fiecare control.

Paleta interfeței folosește cerneală închisă, teal profund, fundal cald și suprafețe discrete, cu contrast de lectură. `premium.css`, împachetat în componentele comune la build, gestionează finisajul. Paletele științifice Praxis/Vii rămân semantice și se schimbă exclusiv prin registrul comun existent.

## Biblioteca — Laborator de descoperire (31 octombrie 2026)

`public/library.css`, încărcat exclusiv în `body.praxis-library`, definește identitatea expresivă a bibliotecii: introducere petrol `#103f3b`, ivory `#f7f5ee`, mentă `#b9f279` și auriu `#e8b85c`. Textul auriu mic folosește `#f3cb80` pentru contrast inclusiv pe zona cea mai luminoasă a gradientului. Ilustrația decorativă locală este `public/assets/discovery-field.svg`, fără animație continuă. Accesul direct din introducere deschide laboratorul real Oglinzi și lentile, prin mecanismul existent de revenire.

Starea `data-library-view` (`home`, `chapter`, `search`) compactează introducerea în filtre și ascunde accesul direct când acesta ar distrage de la rezultate. Capitolele au suprafețe consecvente, pictograme colorate și selecție petrol. Cardurile experimentelor folosesc titluri închise, descrieri lizibile și acțiuni petrol cu text deschis. Sidebarul rămâne accesibil pe desktop și devine panou peste antet pe mobil. Modul tablă păstrează controllerul și paginarea existente.

Biblioteca nu mai încarcă `compact.css`: regulile sale istorice de catalog suprascriau spațierea noii compoziții. Densitatea și adaptarea bibliotecii sunt gestionate în `library.css`; lecțiile păstrează `compact.css`. Fonturile rămân locale. Verificarea vizuală și funcțională este descrisă în [docs/UI_BIBLIOTECA_2026-10-31.md](docs/UI_BIBLIOTECA_2026-10-31.md).

## Laboratoarele — aceeași direcție premium (31 octombrie 2026)

`public/design-system/laboratory-premium.css` extinde identitatea bibliotecii în laboratoare: introducere petrol compactă cu titlu deschis și accent mentă, navigare selectată petrol cu reper mentă, acțiuni principale contrastante și contururi/umbre discrete. Acestea sunt roluri de interfață; culorile științifice, fundalurile scenelor, legendele, formulele și textul din desene nu sunt selectate de noile reguli. Titlul deschis din `.praxis-lab-intro` este excepția explicită de contrast față de culoarea obișnuită a titlurilor din conținut.

`scripts/prepare-presentation.mjs` include idempotent fișierul în `laboratory.css`, între marcajele `praxis:lab-discovery`. Astfel, toate lecțiile existente și optica autonomă reutilizează aceeași sursă fără cereri externe. Optica se regenerează prin `npm run sync:optics`. Rolurile `--praxis-link-ink` și `--praxis-link-button-background` sunt permise și acțiunilor explicite ale laboratoarelor, pentru contrast; linkurile obișnuite păstrează regula comună.

Regulile de compoziție nouă exclud Mod tablă. În optica normală, documentul poate crește vertical, antetul comun rămâne vizibil, iar scena are minimum 24rem; aceasta nu se comprimă pentru a încăpea sub introducere. Scena fullscreen nativă își reia creșterea flexibilă, separat de Mod tablă. În lectura întunecată se păstrează fundalurile existente. Pe telefon, acțiunea din introducere se așază sub text.

Vezi [docs/UI_LABORATOARE_2026-10-31.md](docs/UI_LABORATOARE_2026-10-31.md) pentru verificarea culorilor, a navigării și a dimensiunilor responsive.

## Fișierele care controlează aspectul

- `public/design-system/tokens.css`: culori, fonturi, spațiere, raze, dimensiuni tactile și umbre.
- `public/design-system/components.css`: stiluri comune aplicate efectiv în bibliotecă și în laboratorul inclus.
- `public/design-system/components.json`: inventarul componentelor și regulile lor, într-un format reutilizabil de instrumente.
- `public/styles.css`, `public/board.css`: organizarea specifică bibliotecii; folosesc variabilele comune.
- `public/shared/course.css`, `public/shared/course.js`: adaptoare pentru lecțiile importate; mapează `.btn`, `.icon-btn`, `.ctl`, `.fig` și `.eq` la sistemul comun fără să rescrie simulările sau conținutul.
- `public/shared/lab-header.js` și `public/design-system/lab-layout.css`: **unicul antet al laboratoarelor**, folosit de optică, mișcare și vectori. Aceeași siglă Home, înălțime de 76 px pe desktop, breadcrumb, revenire, sunet, limbă și aceleași stiluri pentru titlul și navigarea secțiunilor. Acțiunile specifice sunt transmise componentei. Nu se adaugă un al doilea antet peste cel original.

Sigla duce la Home în toate paginile; Home șterge filtrul de căutare și revine la toate capitolele, păstrând preferința Mod tablă. Cardurile capitolelor folosesc același fundal și contur, fără excepții după poziția în grilă. Pictogramele pot avea culorile semantice ale capitolelor.

Ordinea de încărcare: tokens → stiluri specifice paginii → components. În distribuția autonomă a opticii, sincronizarea include aceste fișiere CSS în HTML. Modificările comune se fac la sursă, apoi se rulează `npm run sync:optics` și `npm run build`.

## Tipuri de conținut

| Tip | Selector / contract | Reguli |
| --- | --- | --- |
| Buton principal | `.button.primary` | Verde Praxis, text alb, o acțiune principală clară |
| Buton secundar | `.button.secondary` | Suprafață albă, contur și text verde |
| Buton cu pictogramă | `.icon-button`, `.tool-button` | Zonă de atingere minimum 44×44 px; nume accesibil obligatoriu |
| Slider | `input[type=range]` | Accent verde, cursor tactil de 26 px; asociat cu etichetă, valoare și unitate |
| Reglaj fin | `.range-step-button` | Butoane −/+ de minimum 44 px; pasul vine din modelul fizic |
| Valoare numerică | `input[type=number]` | Valoarea rămâne numerică, unitatea separată; rezultatele sunt formatate pentru limba activă |
| Selector de limbă | `.praxis-language` | RO/EN, alegerea memorată și comună tuturor paginilor |
| Sunet | `.praxis-sound-toggle` | Oprit inițial; feedback discret. Volumul se adaugă când un laborator are sunet fizic |
| Formulă | `.formula`, `.fraction`, `.equation-main` | Font serif, semne și indici lizibili; fără traducerea simbolurilor științifice |
| Card | `.chapter-card`, `.simulation-card`, `.lb-chapter` | Suprafață albă, contur discret, rază comună de 12 px |
| Fereastră | `dialog` | Titlu, închidere explicită, focus accesibil, Escape; dimensiune adaptată ecranului |
| Publicitate viitoare | `.ad-slot` | Ascunsă fără spațiu gol cât este inactivă; exclusă din simulări și Mod tablă |

## Culori și ierarhie

Folosește variabilele `--praxis-color-ink`, `--praxis-color-muted`, `--praxis-color-primary`, `--praxis-color-surface`, `--praxis-color-canvas`, `--praxis-color-border` și `--praxis-color-focus`. Fontul interfeței este local, Segoe UI / Arial, fără descărcări de fonturi. Scara de spațiere este 4, 8, 12, 16, 24, 32 px. Textul obișnuit are reperul 16 px, etichetele 14 px, textul auxiliar 13 px; Mod tablă le mărește împreună cu controalele.

Culorile cu sens fizic sunt excepții deliberate: lungimi de undă, raze, obiect, imagine, capitole. Optica păstrează cele două palete selectabile; nu înlocuim violetul luminii cu verdele mărcii. Semnificația este indicată și prin etichete, poziție sau tip de linie.

**Decizie 28 octombrie 2026:** modul Culori vii este universal pentru toate laboratoarele. Registrul unic este `public/shared/scientific-colors.js`: roșu `#ed2929`, albastru `#0066ff`, verde `#00a350`, portocaliu `#ff8a00`, violet `#922de0`, turcoaz `#00a2be`, galben `#f4c400`. Aceleași familii de culori sunt folosite în Canvas, gradiente, SVG și legende; nu se definesc palete Vii independente în fiecare laborator. Culorile care codifică efectiv lungimi de undă nu se remapează. Alegerea Praxis/Vii se memorează exclusiv în `praxis-course-colors`, inclusiv pentru optică, și se sincronizează între paginile deschise pe aceeași origine. Distribuțiile autonome includ registrul local, fără CDN sau cereri suplimentare.

## Atingere, tastatură și Mod tablă

Nu condiționa accesul la o funcție de hover. Gesturile de tragere folosesc Pointer Events și capturarea pointerului; există și reglaj fin și introducere numerică. Focusul tastaturii este vizibil. Animațiile decorative respectă preferința de mișcare redusă.

În Mod tablă, scena primește spațiul principal. Controalele și explicațiile ample se deschid la cerere; catalogul este paginat. Mărimea preferată 100–300% se adaptează la spațiul disponibil, fără a micșora zonele de atingere sub reperul de 44 px. La dimensiuni foarte mici pot exista pagini suplimentare de opțiuni. Nu rezolva overflowul prin tăierea conținutului necesar.

## Limbă și conținut

Textele sunt în JSON, împărțite pe capitole și laboratoare; vezi `docs/LOCALIZARE.md`. Nu introduce texte traduse în CSS. Testează RO și EN: lungimea etichetelor diferă. Orice componentă nouă se adaugă și în inventarul JSON de mai sus.

## Prezentarea științifică a lecțiilor importate

Bara `.praxis-course-tools` oferă Culori și Mod tactil. Preferințe memorate în `praxis-course-colors` și `praxis-course-touch`; aplicare prin `data-course-colors` / `data-course-touch`. Perechile Praxis / Vii schimbă paleta semantică a graficelor, prin variabile CSS și adaptorul Canvas comun. Controalele UI păstrează culorile generale ale aplicației.

Minimum tactil: 52 px pentru butoane, selectoare și câmpuri numerice, 32 px diametrul cursorului, 34 px raza de prindere a vectorilor 2D. Păstrează Pointer Events și `touch-action:none` pe scene, `manipulation` pe butoane. Schimbarea prezentării redesenează fără resetarea parametrilor. Nu afișa numere decorative ale secțiunilor în navigare sau titluri; păstrează numerele funcționale ale problemelor.

## Ierarhia titlurilor, obligatorie în lecțiile importate

Toate h1–h4 din conținutul lecțiilor folosesc tokenurile comune, inclusiv titlurile din `.hero` și `.text`: titlu 1.875rem, secțiune 1.5rem, subtitlu 1.25rem, nivel secundar 1.125rem, aceeași familie Segoe UI/Arial și culoare a textului. La baza de 16 px rezultă 30/24/20/18 px. Unitățile rem păstrează mărirea din Text/afișare. Nu se folosesc dimensiuni viewport pentru titlurile de lecție, italice decorative sau culori parțiale.

Antetul secțiunii este un bloc pe lățimea disponibilă; coloana numerelor eliminate nu trebuie păstrată în grilă. Spațierile secțiunilor utilizează tokenurile comune.

## Reguli obligatorii pentru toate laboratoarele

`design-system/laboratory.css` se încarcă după stilurile sursei în toate distribuțiile. Scope: `body[data-praxis-laboratory]`. Titluri H1/H2/H3/H4 30/24/20/18 px, text de lectură 16 px cu line-height 1.6, etichete și controale 14 px, explicații secundare/captions 13 px, la scară 100%. Toate dimensiunile textului folosesc rem și tokenurile comune. Butoane și câmpuri minimum 44 px, 52 px în modul tactil; colțuri 7 px; suprafață albă, contur comun, stare activă în culoarea comună. Paletele științifice se păstrează ca semnificație a desenelor.

Slidere: pistă 4 px, cursoare circulare 26 px (32 px touch), același contur și aceeași culoare; −/+ folosesc aceleași componente de control. În React, wrapperul cu −/+ este creat de rendererul JSX, pentru a nu muta manual noduri gestionate de React. Câmpurile de jurnal editabile nu se modifică prin traducere. Formulele și diagramele își păstrează simbolurile, coordonatele și ierarhia matematică; regulile de text se referă la rolurile interfeței, nu la egalizarea arbitrară a tuturor etichetelor din desene.

Mod tablă al opticii păstrează regulile adaptive de mărire și încadrare; stilul comun nu îi impune dimensiuni fixe de titlu sau buton. Pentru Unde mecanice există volum general și comutator global de sunet; toate contexte AudioContext sunt rutate printr-un gain master fără schimbarea frecvențelor sau a căilor de înregistrare.

## Densitate și suprafețe de desen

`compact.css` se încarcă ultimul și aplică spațierea compactă în bibliotecă și toate laboratoarele, păstrând textul și țintele tactile. Antetul standard are 68 px. Containerele lecțiilor sunt limitate în rem, astfel încât mărirea textului pentru tablă să mărească și suprafața utilă; nu se păstrează o coloană goală după ascunderea unui meniu.

În Unde mecanice, canvasurile stau în figure care păstrează raportul matematic original și au dimensiuni limitate în rem; nu se taie desenul și nu se modifică sistemul de coordonate. Instrumentele folosesc două coloane pe desktop și stivuire pe mobil. Ajutorul pentru înregistrare este extensibil. Graficele fără semnal sunt înlocuite temporar de o indicație compactă, apoi devin vizibile la redare/înregistrare. Pe restul paginilor sunt reduse marginile, paddingurile și dimensiunile decorative ale previzualizărilor; sliderele și butoanele rămân de minimum 44/52 px.

## Spațiere uniformă a formulelor și mod tactil

Casetele cu formule folosesc padding de 0,75 rem vertical și 1 rem orizontal (12/16 px la text 100%), cu distanțe uzuale de 0,75 rem între blocuri. Formulele KaTeX păstrează spațiul propriu pentru fracții și indici. Nu se elimină paddingul cardurilor cu text. Excepția este cardul structural `.card.sim` din Mișcarea rectilinie, ale cărui coloane sunt deja căptușite separat.

Compactarea reduce marginile secțiunilor, spațiul dintre grupuri și paddingurile excesive, păstrând textul și țintele tactile. În optică, regulile compacte pentru formule exclud Mod tablă.

Mod tactil poate fi comutat prin atingerea butonului sau cu mouseul. Atingerea funcționează și cu modul oprit. Opțiunea mărește țintele minime de la 44 la 52 px și cursoarele sliderelor de la 26 la 32 px. Calcul vectorial extinde suplimentar zona de prindere a punctelor. Preferința `praxis-course-touch` se memorează în browser pentru aceeași origine, inclusiv în optică. Optica folosește atributul `data-touch`; celelalte lecții folosesc `data-course-touch`, ambele activate în stilul comun. Mod tablă își păstrează reglajele adaptive.


## Previzualizarea pe capitole și tablete

Prima pagină arată maximum două laboratoare pe capitol, în grupuri distincte. De la 1200 px, grupul are două coloane; un singur laborator ocupă primul loc, fără a fi asociat cu alt capitol. Comutatorul Listă păstrează o coloană. Capitolul și căutarea folosesc registrul complet. În Calcul vectorial, până la 1199 px, navigarea laterală este înlocuită de selectorul comun, iar textul și figurile au o singură coloană. Formulele păstrează dimensiunea de lectură și paddingul comun.


La integrarea lecțiilor ample, folosește taburi și, când sunt necesare, subtaburi. Afișează doar subiectul selectat; nu concatena toate capitolele într-o pagină cu derulare foarte lungă. Păstrează starea simulărilor și a exercițiilor între taburi, activează tabul potrivit pentru cuprins/căutare/ancore și oprește animațiile ascunse. Taburile trebuie să se rearanjeze pe rânduri pe tabletă, fără derulare orizontală.


Pentru valorile din casete, simbolurile din atomi și etichetele rândurilor, păstrează poziția legată de obiect. `PraxisCanvasTypography.textInBox` centrează cerneala efectivă a glifelor pe orizontală și verticală și rezervă caseta pentru celelalte adnotări. Nu trece aceste texte prin repoziționarea liberă a etichetelor. Într-o enumerare de mărimi din antet, folosește virgule; punctul median se păstrează pentru înmulțirea din formule.

## Meniul superior comun

`public/shared/site-navigation.js` și `site-navigation.css` definesc meniul superior pentru bibliotecă, paginile informative și laboratoarele online. Ordinea, suprafețele, fonturile, înălțimea și pozițiile comenzilor sunt comune. Nu se construiește un antet paralel: componenta reutilizează comenzile native și păstrează comenzile specifice lecției într-un rând de context separat. Variantele dedicate Mod tablă rămân gestionate de controllerele lor existente.
