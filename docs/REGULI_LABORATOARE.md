# Reguli pentru laboratoarele Praxis · Fizică

Decizii sintetizate la 2 noiembrie 2026 din implementările și corecțiile cerute de utilizator. Acest document este ghidul de lucru pentru laboratoarele noi și pentru modificările celor existente. Instrucțiunile ulterioare explicite ale utilizatorului au prioritate.

Obiectiv: elevul sau profesorul trebuie să poată controla experimentul, observa rezultatele și reveni la capitol fără să caute comenzi prin pagină sau să depindă de butonul Back al browserului.

## 1. Integrare unitară și surse

- Reutilizează [sistemul vizual](../DESIGN_SYSTEM.md), componentele și mecanismele comune. Nu crea un antet, o paletă sau un sistem de navigare separat pentru un laborator nou.
- Înregistrează laboratorul în `public/catalog.js`, în capitolul corect, cu identificator stabil, descriere, imagine și data adăugării conform convenției catalogului. Nu introduce laboratoare fictive pentru a umple capitolele.
- Integrează laboratorul în `public/design-system/lab-workspaces.json`. Folosește marcajele și montarea comună din `public/shared/lab-workspace.js`, inclusiv configurația activităților când există mai multe experimente.
- Clasifică titlurile relevante prin `data-content-type`, potrivit [catalogului de conținut](CATALOG_CONTINUT.md). Păstrează textul lângă pictograme.
- Modifică sursa autoritativă, adaptorul sau importatorul. Nu lăsa o corecție doar într-un fișier generat din `public/simulari/`, într-un bundle sau în `dist/`.
- Pentru optică, respectă separarea dintre proiectul `Optica-Lab` și adaptarea lui în aplicație. Reguli comune de prezentare se pot implementa în stratul comun; schimbările motorului se fac în sursa autoritativă.

## 2. Experimentul trebuie să fie accesibil imediat

- Prioritizează comenzile de pornire/pauză/resetare, scena și graficele folosite împreună. Pe desktop și tablă, urmărește să fie vizibile simultan în zona de lucru, fără derulare repetată între ele.
- Folosește spațiul orizontal disponibil înainte de a adăuga conținut pe verticală. Așază alături scenele, graficele sau figurile care se compară și încap lizibil.
- Pentru standurile cu o singură scenă și mai mulți parametri, preferă scena în stânga și comenzile în dreapta, cu sliderele unul sub altul. Respectă configurația existentă a instrumentelor care au altă organizare justificată.
- Alege pragul de reorganizare după lățimea reală a containerului și după dimensiunea textului. Un viewport mare nu garantează că un stand interior are loc pentru două coloane.
- Pe telefon, în containere înguste și la text mărit, revino la o organizare verticală lizibilă. Nu forța două coloane prin micșorarea textului sau a scenelor.
- Păstrează introducerile și barele de instrumente compacte. Explicațiile lungi, formulele de referință și preferințele secundare pot fi în secțiuni pliabile, cu etichete clare. Nu ascunde comenzile necesare experimentului.
- Dacă o secțiune are mai multe experimente, oferă selecție explicită între activități. Un preset sau un link către o activitate trebuie întâi să o facă vizibilă, apoi să execute acțiunea existentă.
- Nu aplica automat reorganizarea laboratoarelor paginii Home sau paginilor de capitol. Acestea au structură proprie.

## 3. Scară, text și spațiere

- Compactează prin structură și eliminarea spațiului inutil, nu prin text microscopic sau reducerea țintelor tactile.
- Nu întinde o scenă doar pentru că există lățime liberă. Mărirea Canvasului mărește și etichetele desenate în el și poate produce exact aspectul de interfață supradimensionată semnalat de utilizator.
- Folosește rolurile tipografice comune și unități relative unde interfața trebuie să urmeze preferința de text. Verifică separat antetul, care are geometrie comună și nu trebuie să se deformeze odată cu lecția.
- Păstrează valorile numerice proporționale cu etichetele lor. În optică s-au ales 22 px pentru valorile celor trei carduri și 13 px pentru unități; acestea sunt un reper pentru acele carduri, nu o dimensiune obligatorie pentru orice rezultat.
- Evită separatorul punct între mărimi sau între o valoare și faza ei, când poate fi confundat cu înmulțirea. Folosește spațiere suficientă, o bară verticală sau rânduri distincte.
- Nu introduce bare de derulare în formulele scurte afișate în text. Formulele bloc prea lungi și scenele care necesită o lățime minimă pot avea derulare locală, fără să lărgească pagina întreagă.
- La text 200%, derularea suplimentară este acceptabilă; textul tăiat, comenzile inaccesibile și pierderea funcțiilor nu sunt.

## 4. Claritatea desenelor și animațiilor

- Separă dimensiunea logică a scenei, dimensiunea CSS și bufferul de pixeli. DPR și redimensionarea nu trebuie să schimbe ecuațiile, coordonatele fizice sau starea simulării.
- Dimensionează bufferul după dimensiunea efectiv afișată și `devicePixelRatio`. Folosește componentele comune de pregătire a Canvasului, unde sunt compatibile.
- Păstrează limitele naturale de afișare ale scenelor. O regulă generică precum `max-width:100%` nu trebuie să anuleze limita de dimensiune calculată de renderer.
- Adaptează eșantionarea curbelor la densitatea efectivă de desen și la variația funcției. Un buffer mai mare nu corectează o curbă construită din prea puține puncte.
- Verifică toate Canvasurile unei demonstrații, nu doar primul. Verifică toate taburile și activitățile, inclusiv după activare, schimbarea dimensiunii și mărirea textului.
- Pentru Oscilator există o alegere explicită de densitate minimă 2 și scene de 640 de unități logice. Reutilizează mecanismul când este potrivit; nu impune aceleași valori tuturor laboratoarelor fără verificare.
- Pe mobil păstrează o dimensiune minimă lizibilă sau construiește o scenă adaptată. Nu micșora automat întreaga scenă de 640 de unități într-un card de aproximativ 300 px dacă etichetele devin ilizibile.

## 5. Starea, timpul și sunetul

- Montarea structurii trebuie să fie repetabilă fără a pierde noduri, handlere, valori sau selecții. Nu înlocui nodurile gestionate de React pentru o simplă reorganizare vizuală.
- Schimbarea limbii, culorilor, dimensiunii textului sau layoutului păstrează parametrii și timpul experimentului. Resetarea se face la comanda explicită a utilizatorului sau când modelul o cere în mod explicat.
- Vederile aceluiași fenomen folosesc același timp și aceeași stare. Nu porni un ceas separat pentru un fazor sau un grafic care trebuie să fie sincronizat cu animația existentă.
- Activitățile ascunse sau documentele inactive nu trebuie să avanseze experimentul ori să emită sunete. Evită buclele de animație duplicate la reluare; respectă mecanismul existent de suspendare a randării în afara ecranului.
- Folosește `PraxisSound`. Sunetul pornește inactiv într-o sesiune nouă și rămâne în starea aleasă la trecerea între bibliotecă și laboratoare în aceeași filă.
- Păstrează alegerea operațională a sunetului în sesiune și respectă mecanismul comun de consimțământ pentru persistență. Nu crea `AudioContext` numai pentru a restaura un buton sau o preferință.
- Verifică și revenirea din istoricul browserului/BFCache. Butonul și comportamentul audio trebuie să reflecte aceeași stare; oprirea globală oprește și tonurile deja active.

## 6. Corectitudine științifică

- O reorganizare vizuală nu schimbă formulele, unitățile, semnele, limitele sau condițiile inițiale. Testează relațiile fizice relevante independent de implementarea desenului.
- Păstrează aceleași culori pentru aceeași mărime în scenă, grafice, legendă și citiri numerice. Folosește paleta științifică comună, inclusiv varianta de contrast.
- Pentru fazorii y/v/a ai oscilatorului, modulele sunt A, Aω și Aω², cu origine comună, defazaje 0, π/2 și π și rotație trigonometrică la ω. Vârfurile descriu cercurile corespunzătoare modulelor; nu normaliza implicit cei trei fazori la aceeași lungime.
- Dacă reprezinți în aceeași diagramă mărimi cu unități diferite, explică scara și arată unitățile în legendă. Pentru exemplul A = 1 m și ω = 2 rad/s, raportul numeric al razelor este 1:2:4; nu generaliza acest raport la alți parametri.
- Verifică sensul rotației ținând cont că axa verticală a Canvasului este inversată față de axa matematică. Proiecțiile și valorile instantanee trebuie să corespundă graficelor.
- Orice normalizare, schimbare de scară sau reprezentare sonoră didactică trebuie indicată clar și să respecte cerința utilizatorului.

## 7. Navigare fără dependență de Back

- Fiecare laborator online afișează permanent traseul clicabil **Bibliotecă / Capitol / Laborator**. Elementul curent are `aria-current="page"`.
- Traseul rămâne în afara meniului mobil pliabil și a zonelor `inert`. Nu ascunde numele capitolului prin reguli de compactare, indiferent de lățime.
- Linkul către capitol trebuie să funcționeze și la intrare directă, fără istoric sau stare salvată. Folosește asocierea din catalog, nu capitolul vizitat anterior.
- Distinge revenirea canonică la capitol de revenirea contextuală la căutarea precedentă. Prima afișează toate laboratoarele capitolului; a doua poate păstra căutarea, afișarea și poziția din Mod tablă.
- Refolosește mecanismul comun `?chapter=1#capitol/<id>` pentru intrarea canonică și `?home=1` pentru Home. Nu reimplementa local restaurarea filtrelor. Verifică și refreshul după eliminarea markerului din URL.
- În Mod tablă, revenirea la capitol deschide laboratoarele acelui capitol, inclusiv după refresh; Home deschide capitolele. Orice mod care ascunde antetul trebuie să ofere ieșire și o cale utilă de revenire.
- Paginile informative au întoarcere clară spre bibliotecă. Verifică linkurile către lecții înrudite, resurse și descărcări, nu doar navigarea din antet.
- Folosește URL-uri care funcționează și când aplicația este servită dintr-un subdirector. Într-un laborator autonom fără bibliotecă inclusă, nu afișa linkuri către pagini inexistente; Home revine la începutul lecției.

## 8. Română, engleză și accesibilitate

- Adaugă și verifică textele în ambele limbi: navigare, comenzi, Canvas, legende, unități, mesaje și atribute accesibile. Folosește [mecanismul de localizare](LOCALIZARE.md).
- Verifică efectiv schimbarea RO → EN → RO. Lungimea textului tradus nu trebuie să ascundă controale ori să schimbe starea experimentului.
- Păstrează ținte interactive de minimum 44 px și comportamentul tactil comun; pentru modul tactil folosește dimensiunile prevăzute de sistemul vizual.
- Asigură acces cu tastatura, focus vizibil, etichete textuale și stări ARIA coerente pentru taburi, meniuri și secțiuni pliabile.
- Respectă textele și punctuația aprobate. Titlul Home în română este pe două rânduri: „Fizica are sens” / „Când o explorezi”, fără puncte. Nu îl rescrie incidental la adăugarea unui laborator.

## 9. Aceeași implementare în distribuții

- `public/` este sursa aplicației Web; `dist/` se generează prin `npm run build`. Nu întreține separat o copie online și una locală a aceluiași laborator.
- După schimbări într-un import, rulează importatorul potrivit și verifică reproducerea rezultatului. Modificările comune trebuie să ajungă și în bundle-urile generate.
- Regenerează arhiva autonomă afectată prin `node scripts/build-courses-offline.mjs --course=<id>`. La modificări comune care afectează toate lecțiile, regenerează toate arhivele. Pentru optica integrată folosește `npm run sync:optics`.
- Un laborator nou cu export autonom trebuie înregistrat și în mecanismul de împachetare; includerea în catalog nu este suficientă.
- Verifică funcționarea resurselor și traducerilor fără cereri externe neprevăzute. Raportează separat limitările PWA/manifest la deschiderea `file://`.
- Verificările de proveniență trebuie să distingă schimbările de conținut de conversia LF/CRLF la checkout pe Windows. Nu actualiza hashuri și nu elimina verificări doar ca să ascunzi o diferență neexplicată.

## 10. Verificare și livrare

Înainte de declararea unui laborator nou ca finalizat:

1. Verifică intrarea din Home, din capitol și prin URL direct; revenirea spre capitol și bibliotecă; linkurile înrudite și descărcările.
2. Verifică minimum dimensiunile folosite în acest proiect: 3840 × 2160 CSS px la DPR 1, 1920 × 1080 la DPR 2, 1366 × 768, 1024 × 768 și 390 × 844. Primele două acoperă și diferența dintre rezoluția fizică 4K și scalarea sistemului. Nu descrie emularea drept testare pe tabla fizică.
3. Verifică RO/EN, text 100%/200%, comenzile tactile, intrarea/ieșirea din Mod tablă și toate activitățile noului laborator. Pentru modificări comune, extinde verificarea la toate laboratoarele afectate.
4. Confirmă lipsa overflowului orizontal al paginii, lizibilitatea scenelor, vizibilitatea comenzilor și păstrarea parametrilor. Testează Start/Pauză/Reset, schimbarea activității și păstrarea sunetului între pagini.
5. Rulează teste semnificative pentru modele, sincronizare și regresii, apoi `npm run check` și `npm run build`. Pentru o modificare exclusiv de text sau CSS, folosește verificările proporționale cu impactul; nu crea teste care doar repetă o regulă CSS.
6. Verifică distribuția generată și pachetul autonom afectat. Inspectează rezultatul în browser; existența unui fișier sau a unui buffer mare nu dovedește că afișarea este corectă.
7. Documentează ce ai verificat, rezultatele și limitele reale. Păstrează constatările istorice în rapoarte, fără a le transforma în reguli fixe pentru toate laboratoarele.
8. La solicitarea de publicare pe GitHub a aplicației, livrează modificările în `main`, dacă utilizatorul nu a ales explicit altă destinație. Un push doar pe ramura de lucru nu îndeplinește această cerință. Verifică mai întâi starea remote, integrează fără rescriere forțată și confirmă commitul din `origin/main`.
9. Fără solicitare de publicare, păstrează modificările local. Nu confunda existența commitului pe GitHub cu verificarea unei publicări reușite a site-ului.

## Repere de implementare și verificare

| Domeniu | Sursa de reutilizat |
| --- | --- |
| Stil și tipografie | `public/design-system/`, [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) |
| Catalog și apartenența la capitol | `public/catalog.js` |
| Structura instrumentelor | `lab-workspaces.json`, `lab-workspace.js`, `lab-workspace.css` |
| Antet și traseu | `public/shared/lab-header.js`, `site-navigation.js`, `site-navigation.css` |
| Revenire și Mod tablă | `public/app.js`, `public/board.js` |
| Sunet | `public/shared/sound.js` |
| RO/EN | `public/shared/i18n.js`, `course-localization.js`, `public/locales/` |
| Audit de navigare | `test/navigation.test.mjs`, `scripts/qa/site-navigation.browser.js` |
| Audit de structură și claritate | `scripts/qa/lab-workspace-*.browser.js`, `waves-size-audit.browser.js`, `oscillator-resolution.browser.js` |
| Contextul deciziilor | [Raportul structurii unitare](LABORATOARE_STRUCTURA_UNITARA.md) |
