# Praxis · Fizică interactivă

**Adăugat la 30 octombrie 2026:** [Mișcarea circulară uniformă](docs/INTEGRARE_MCU.md), în **Mișcare**: șapte taburi, două laboratoare, probleme și test, culori deschise, RO/EN și touch. Biblioteca cuprinde acum **17 laboratoare**.

**Adăugat la 30 octombrie 2026:** [Figuri Chladni](docs/INTEGRARE_FIGURI_CHLADNI.md), în **Sunete și unde**: 19 familii modale, excitator mobil prin touch, teorie și activități, RO/EN și arhivă offline.

**Adăugat la 30 octombrie 2026:** [Compunerea oscilațiilor](docs/INTEGRARE_COMPUNEREA_OSCILATIILOR.md), în **Sunete și unde**, cu întregul laborator și teoria, RO/EN, touch, export PNG și randare la rezoluția ecranului.

**Adăugat la 29 octombrie 2026:** [Aplicații ale principiului I al termodinamicii](docs/INTEGRARE_PRINCIPIUL_I_APLICATII.md), în **Căldură și termodinamică**: 11 subiecte, nouă demonstrații, șase probleme rezolvate și 13 întrebări, cu interfața comună RO/EN și arhivă offline.

Bibliotecă în română și engleză, cu șapte capitole de fizică. Sunt incluse **Oglinzi și lentile** în **Lumină și radiații**, plus **Mișcarea rectilinie**, **Calcul vectorial**, **Viteza și accelerația** și **Mișcarea curbilinie plană** în **Mișcare**, **Unde mecanice** în **Sunete și unde**, și **Noțiuni termodinamice de bază**, **Calorimetrie**, **Principiul I al termodinamicii** și **Interacții atomice** în **Căldură și termodinamică**. Conținutul celorlalte capitole va fi decis ulterior; nu au fost create simulări fictive. Cele două lecții importate păstrează integral conținutul și au traducere RO/EN pentru explicații, exerciții, teste și grafice.

Integrarea și verificarea conținutului sunt documentate în [docs/INTEGRARE_LECTII.md](docs/INTEGRARE_LECTII.md).

## Reguli comune pentru dezvoltare

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): tipurile de componente, culori, text, formule, slidere și atingere; stilurile comune se aplică în bibliotecă și în laborator.
- [docs/LOCALIZARE.md](docs/LOCALIZARE.md): RO/EN în 98 de fișiere JSON, împărțite pe șapte capitole, interfață comună, optică și secțiunile celor două lecții importate. Selectorul memorează limba, iar laboratorul autonom de optică include ambele limbi.
- [docs/MONETIZARE.md](docs/MONETIZARE.md): decizia de monetizare numai prin reclame și punctele pregătite, inactive și fără spațiu gol.

Volumul va fi adăugat atunci când implementăm un laborator în care sunetul face parte din fenomenul studiat.

Distribuția actualizată este `outputs/Praxis-Fizica-local.zip`. Pentru laboratorul individual bilingv, fișierul autonom este `dist/simulari/oglinzi-si-lentile/index.html`. Verificările acestei versiuni sunt în [docs/VERIFICARE_RO_EN.md](docs/VERIFICARE_RO_EN.md).

## O singură sursă pentru online și local

Proiect: `D:/ProiecteAI/Praxis-Fizica`.

- `public/`: catalogul, interfața, ilustrațiile originale și copia de distribuție a opticii.
- `public/catalog.js`: cele șapte capitole și registrul simulărilor; aici adăugăm viitoarele simulări.
- `public/simulari/oglinzi-si-lentile/index.html`: laboratorul existent, inclus integral; nu depinde de site-ul privat sau de un cont ChatGPT.
- `scripts/`: construire, server local și sincronizarea opticii.
- `dist/`: distribuția generată, identică pentru rulare locală și publicare statică.
- `vercel.json`: configurarea pregătită pentru o publicare viitoare; nu a fost efectuată nicio publicare.

## Pornire locală, fără internet

Este necesar Node.js 22 sau mai nou pe PC, instalat o singură dată. Nu sunt necesare `npm install`, chei, conturi sau servicii externe. Dublu clic pe **Porneste-local.cmd**, apoi deschide `http://127.0.0.1:4190`. Păstrează fereastra serverului deschisă; oprire prin Ctrl+C.

Alternativ, în acest folder:

```text
npm run dev
```

Serverul local servește catalogul și cele 16 laboratoare incluse. A deschide doar `public/index.html` cu dublu clic nu este metoda recomandată: catalogul utilizează module JavaScript și trebuie servit prin HTTP local. Simularea individuală de optică rămâne și un fișier autonom.

## Tabletă sau tablă Android, prin rețeaua locală

Pe PC, pornește **Porneste-in-retea.cmd**. Acesta activează explicit accesul în LAN. PC-ul și dispozitivul Android trebuie conectate la aceeași rețea locală; nu este necesar internetul. Pe tabletă deschide `http://ADRESA-IP-A-PC-ULUI:4190` (adresa reală se află cu `ipconfig`, câmpul IPv4 al conexiunii utilizate). Poate fi necesară permisiunea în firewall pentru rețeaua privată; nu s-au modificat regulile firewall în această sarcină. `127.0.0.1` pe tabletă desemnează tableta, nu PC-ul.

## Actualizarea laboratorului de optică

Proiectul autoritativ al motorului și interfeței de optică rămâne `D:/ProiecteAI/Optica-Lab`. Nu edita manual copia din bibliotecă. După schimbări acolo, rulează:

```text
npm run sync:optics
npm run build
```

Sincronizarea generează fișierul autonom din sursa locală, apoi îl copiază în bibliotecă. `docs/optica-snapshot.json` înregistrează momentul sincronizării. Comanda de construire nu depinde de proiectul vecin, deci va funcționa ulterior și pe Vercel, folosind copia inclusă.

## Publicare viitoare pe GitHub și Vercel

Nu s-a creat niciun repository remote, proiect Vercel, workflow Actions sau site găzduit. La o solicitare ulterioară, folderul acesta poate deveni rădăcina repository-ului. Vercel va utiliza `npm run build`, iar directorul de ieșire este `dist`. Nu există dependențe npm sau CDN-uri. Configurarea urmează [documentația Vercel](https://vercel.com/docs/project-configuration).

Nu este necesară păstrarea a două copii independente online/offline. Distribuția locală folosește exact aceleași fișiere ca varianta pregătită pentru Vercel. Nu sunt incluse artefacte PHET, sigle sau cod PHET; imaginea furnizată a fost folosită ca referință pentru organizarea catalogului.

## Verificări

`npm run check`: validarea sintaxei și testele registrului, căutării, legăturii către optică și serverului local. Testele de server deschid temporar un port numai pe loopback. Au fost verificate în browser cele șapte capitole, stările fără conținut, căutarea cu/fără diacritice, afișarea card/listă și deschiderea laboratorului local. Interfața nu utilizează resurse externe.

Capitole: Mișcare; Sunete și unde; Lucru mecanic, energie și putere; Căldură și termodinamică; Fenomene cuantice; Lumină și radiații; Electricitate, magnetism și circuite.


## Mod tablă al bibliotecii

Butonul „Mod tablă” din antet arată un catalog dedicat atingerii: pagini de capitole, pagini de simulări, căutare și butoane A−/A+ pentru 100–300%. Selectorul procentului arată și mărimea aplicată. Mărimea și modul ales se memorează. La spațiu mic, capacitatea paginii scade și se adaptează mărimea; accesul la toate cele șapte capitole se păstrează prin Înainte/Înapoi, fără derulare. Nu se ascunde conținutul doar pentru a elimina scrollbarul.

## Navigare în aceeași filă

Linkurile nu mai folosesc target=_blank. Contextul bibliotecii (capitol, căutare, card/listă și starea modului tablă) se reține înainte de deschiderea laboratorului. „← Bibliotecă”, disponibil și în modul tablă al opticii, revine în același context. Preferința de mărime este transmisă laboratorului dacă biblioteca este în Mod tablă. Comportamentul standard al browserului pentru deschidere intenționată într-o filă nouă rămâne disponibil.

Adaptorul de integrare este `scripts/optics-library.js`. `sync:optics` îl include, împreună cu componenta comună de sunet, în copia de distribuție. Proiectul autoritativ Optica-Lab nu este modificat de aceste adaptări ale bibliotecii.

## Sunet activ / inactiv

Comutatorul cu difuzor este global, memorat și disponibil în bibliotecă și laboratorul inclus. Inițial sunetul este oprit. Feedbackul discret pentru butoane, selectoare și mutarea obiectelor este sintetizat local. Componenta expune și tonuri continue și sunete de eveniment pentru viitoarele laboratoare: vezi `docs/SONS.md`. În optică feedbackul nu reprezintă un sunet produs de raze. Dezactivarea oprește toate sunetele active.

Verificări suplimentare: Mod tablă la 512×384, 640×360, 1024×600, 1920×1080 și 3840×2160, inclusiv mărime preferată 300%, încadrare fără overflow și acces la toate cele șapte capitole prin paginare; navigare bibliotecă → optică → bibliotecă în aceeași filă, păstrând capitolul și modul; sunet activat în bibliotecă și dezactivat în laborator, cu starea păstrată la revenire. Testele unitare verifică redarea inhibată implicit, oprirea tonurilor la mute și la trecerea în fundal.

## Culori și Mod tactil în lecțiile importate

Mișcarea rectilinie și Calcul vectorial au selector „Culori”: Praxis · tonuri calme / Vii · contrast puternic. Se actualizează și culorile cu semnificație fizică din grafice. „Mod tactil” mărește controalele la minimum 52 px, cursoarele la 32 px și zona de prindere a vectorilor la 34 px. Preferințele se memorează. Butoanele −/+ rămân disponibile. Numerele decorative ale secțiunilor sunt ascunse; numerotarea problemelor se păstrează.

Arhive autonome bilingve, de dezarhivat complet înainte de deschiderea index.html:

- `dist/simulari/miscarea-rectilinie/miscarea-rectilinie-offline.zip`
- `dist/simulari/calcul-vectorial/calcul-vectorial.zip`

Regenerare după modificarea adaptoarelor sau traducerilor: `npm run import:courses`, apoi `npm run offline:courses`, apoi `npm run build`. Generarea folosește numai Node, fără pachete suplimentare.

## Unde mecanice

Integrată ultima versiune compilată din `D:/ProiecteAI/Unde-mecanice-restructurata/Unde-Mecanice.html` (26 octombrie 2026). Sunt păstrate cele 19 teme / 37 de ecrane, toate simulările, patru instrumente sonore, sonometrul, Kundt, osciloscopul, demonstrațiile seismice, cele șapte probleme, două teste, ghidul de lecție, jurnalul editabil și resursele profesorului.

Pagina: `http://127.0.0.1:4190/simulari/unde-mecanice/index.html`. Dicționare RO/EN în 11 perechi, separate după temă. Volum general 0–100%, implicit 35%, cu −/+, memorat; sunetul global rămâne inițial inactiv. Microfonul se activează numai prin butonul propriu și permisiunea browserului; accesul de pe tabletă prin HTTP/LAN poate fi blocat de regulile de context securizat ale browserului. Restul simulărilor și sinteza instrumentelor funcționează fără microfon.

Arhiva autonomă: `dist/simulari/unde-mecanice/unde-mecanice-offline.zip`. Dezarhivează complet și deschide `index.html`. Pentru regenerare din snapshotul local: `npm run import:waves`, apoi `npm run offline:courses`, `npm run build`. Distribuția normală nu depinde de folderul original sau de clonele locale.

Toate cele patru laboratoare încarcă acum `design-system/laboratory.css`: reguli obligatorii de font, text, controale și slidere. Vezi `docs/AUDIT_STILURI_SI_UNDE.md`.

## Compactare și animații

Spațierea este definită în `public/design-system/compact.css`, folosit în catalog și toate laboratoarele. În Unde mecanice, instrumentele au desen și comenzi alături pe desktop, graficele fără semnal au indicatoare compacte, iar ajutorul pentru înregistrare se deschide dintr-un detaliu extensibil. Se păstrează 44/52 px pentru atingere și tot conținutul. Comparația celor 37 de ecrane este în `docs/compactness-audit.json`.

`shared/animation-clock.js` face avansul animațiilor independent de frecvența ecranului. Patchurile strict vizuale sunt inventariate în `scripts/wave-animation-patches.json`; sintetizatoarele audio sunt intacte. Evaluarea HyperFrames și verificările sunt în `docs/COMPACTARE_SI_ANIMATII.md`.

## Verificarea fizică a undelor — 27 octombrie 2026

Corecțiile Huygens, ale instrumentelor, modelelor și baremelor, plus verificările și limitele didactice, sunt în [docs/VERIFICARE_FIZICA_UNDE.md](docs/VERIFICARE_FIZICA_UNDE.md). Versiunile autonome și biblioteca locală au fost actualizate. Mișcarea rectilinie se oprește la schimbarea tipului sau presetului; reluarea cere Start.

## Auditul figurilor și formula de oprire

Verificarea tuturor celor 11 figuri din Calcul vectorial, corecțiile pentru vectorul nul și proiecții, încadrarea desenelor și convenția cu accelerație semnată la oprire sunt documentate în [docs/AUDIT_FIGURI_VECTORI.md](docs/AUDIT_FIGURI_VECTORI.md). Ambele arhive autonome și biblioteca locală includ corecțiile.

## Auditul Mișcării rectilinii

[docs/AUDIT_MISCARII_RECTILINII.md](docs/AUDIT_MISCARII_RECTILINII.md) documentează verificarea formulelor, graficelor, cazurilor cu semne negative, celor 20 de probleme și testelor, precum și corectarea evenimentelor duplicate și a spațierii din jurnal. Distribuția autonomă și biblioteca offline includ corecțiile.

## Viteza și accelerația

Laboratorul din capitolul **Mișcare** include teorie, mișcare rectilinie, patru traiectorii plane și legi polinomiale, cu RO/EN și controale Praxis. Detalii și reproducere: [docs/INTEGRARE_VITEZA_ACCELERATIA.md](docs/INTEGRARE_VITEZA_ACCELERATIA.md). Arhivă autonomă: `dist/simulari/viteza-si-acceleratia/viteza-si-acceleratia-offline.zip`.

## Mișcarea curbilinie plană

Lecția nouă este în **Mișcare**, cu teorie, vectorul viteză, vectorul accelerație, cerc osculator și traiectorie editabilă. Conținutul comun cu alte laboratoare a fost păstrat. [Integrare și verificări](docs/INTEGRARE_MISCARII_CURBILINII_PLANE.md).


## Noțiuni termodinamice de bază

Laboratorul din Căldură și termodinamică include 13 figuri interactive, 14 întrebări, 10 probleme, glosar și căutare. Sunt folosite antetul, tipografia, spațierea, formulele, paletele, sunetul global și modul tactil comune. Trimiterile la manual și numerotarea editorială au fost eliminate; sursa inițială este păstrată separat. Import reproductibil: `npm run import:thermodynamics`. Arhivă autonomă: `public/simulari/notiuni-termodinamice/notiuni-termodinamice.zip`.

## Calorimetrie

Laboratorul din „Căldură și termodinamică” are șase taburi principale și 11 teme: șapte simulări, două experimente cu tabele de măsurători, glosar, 12 întrebări și opt probleme. O singură temă este vizibilă; schimbarea taburilor păstrează determinările și răspunsurile. Sursele originale sunt în `sources/calorimetrie/site`, inventariate în `docs/imported-calorimetry.json`. Folderul furnizat de utilizator este păstrat.

`npm run import:calorimetry` regenerează laboratorul și dicționarele RO/EN. `npm run offline:courses` reface arhivele autonome; după aceasta se rulează `npm run build`. Pachetul individual este `public/simulari/calorimetrie/calorimetrie.zip`. Verificările specifice sunt documentate în `docs/VERIFICARE_CALORIMETRIE.md`.

Favicon unic: `public/assets/favicon.svg`. Construirea aplicației și a arhivelor offline încorporează automat aceeași pictogramă în fiecare pagină, inclusiv în laboratoarele autonome deschise direct din fișier. Verificare: `docs/favicon-verification.json`.

## Principiul I al termodinamicii

Laboratorul din Căldură și termodinamică are șase taburi, simularea bilanțului ΔU = Q − L, 12 grafice interactive și calculatoare pentru transformarea generală, patru exerciții și ecuația de stare. Preferințele comune (RO/EN, culori, text, atingere, sunet și favicon) sunt păstrate. Capitolele afișează toate laboratoarele disponibile; prima pagină păstrează maximum două din fiecare capitol.

Surse: `sources/principiul-i-al-termodinamicii/original.html`. Regenerare: `npm run import:first-law`, `npm run offline:courses`, `npm run build`. Arhivă individuală: `public/simulari/principiul-i-al-termodinamicii/principiul-i-al-termodinamicii.zip`. Verificare: `docs/VERIFICARE_PRINCIPIUL_I.md`.

Laboratorul Principiul I folosește acum slidere cu −/+ pentru toate cele 26 de mărimi, rezultate automate și relații complete cu fracții. Necunoscuta ecuației de stare se alege prin selector.

Pentru transformările izotermă, izobară și izocoră sunt afișate simultan p–V, V–T și p–T. Aceleași trei diagrame reprezintă stările inițială și finală ale transformării generale, fără a presupune un traseu între ele.

În calculatorul transformării generale, parametrii sunt grupați pe două stări, cu formula și rezultatul lângă starea finală și verificarea pV/T într-un rezumat compact. Celelalte calculatoare folosesc grile de parametri fără panouri întinse și goale.

## Calcul vectorial — taburi

Calcul vectorial folosește acum șapte taburi principale și subtaburi pentru cele 14 secțiuni, păstrând starea figurilor și testului. [Organizare și verificări](docs/TABURI_CALCUL_VECTORIAL.md).

## Interacții atomice

Integrată în **Căldură și termodinamică**, cu șapte perechi de atomi, parametri personalizabili, explicații și test, RO/EN, stiluri și sunete Praxis. Forțele interatomice sunt reprezentate pe ambii atomi, egale și opuse. [Integrare și verificări](docs/INTEGRARE_INTERACTII_ATOMICE.md). Arhivă autonomă: `dist/simulari/interactii-atomice/interactii-atomice.zip`. Regenerare: `npm run import:atomic`, `npm run check`, `npm run package:local`.

## Catalog comun și verificări actualizate

[Catalogul tipurilor de conținut](docs/CATALOG_CONTINUT.md) definește 14 tipuri și șapte familii de pictograme SVG locale. Folosiți atributul data-content-type pe titlurile conținuturilor noi. Componentele comune aplică regulile și în lecțiile autonome.

[Auditul ultimei lecții](docs/VERIFICARE_PRINCIPIUL_I_APLICATII.md) documentează lizibilitatea RO/EN, formulele și interacțiunile moleculare. [Restaurarea sursei atomice](docs/RESTAURARE_SURSA_ATOMICA.md) rezolvă testul de proveniență. Verificarea completă: 109/109 teste trecute.

## Transformări de stare de agregare

Lecție integrată în Căldură și termodinamică: 12 secțiuni, 11 demonstrații, două probleme rezolvate și 15 întrebări, RO/EN și offline. [Integrare și verificări](docs/INTEGRARE_TRANSFORMARI_STARE_AGREGARE.md). Regenerare: npm run import:phase-changes.

## Depozitul GitHub

Depozitul proiectului: https://github.com/traianan/praxis-physics-lab

După clonare, cu Node.js 22 sau mai nou, `npm run build` generează distribuția din `public/`, iar `npm run dev` pornește aplicația local. Nu sunt necesare pachete npm suplimentare.

Conform excluderilor proiectului, `dist/`, `outputs/` și snapshoturile originale din `sources/` rămân locale. Aplicația și construirea distribuției funcționează fără aceste snapshoturi; unele teste de proveniență și comenzile de reimport necesită sursele originale descrise în documentația integrărilor.
