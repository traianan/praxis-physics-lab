# Claritatea desenelor și spațierea lecțiilor — 29 octombrie 2026

## Randarea lecției Aplicații ale principiului I

Problema era mărirea unui bitmap cu dimensiunile originale: molecula avea 360×190 pixeli, dar era afișată la aproximativ 577×304 CSS px. Densitatea dispozitivului era aplicată dimensiunilor originale, fără a ține cont de mărirea în pagină.

`public/shared/first-law-applications-canvas.js` alocă acum bitmapul din dimensiunea CSS afișată înmulțită cu devicePixelRatio. Sistemul logic original rămâne separat, iar transformarea Canvas mapează coordonatele fizice în rezoluția efectivă. Nu limitează artificial DPR la 2. Nu realocă bitmapul dacă dimensiunile sunt aceleași. Redimensionarea, schimbarea limbii, a textului sau a tabului nu resetează parametrii fizici.

Importatorul folosește același renderer pentru toate cele nouă demonstrații. Arhiva autonomă include rendererul local, ca toate celelalte componente comune.

Verificări efective în Chromium: toate cele nouă canvasuri la DPR 1 și 2; la DPR 2 și text 100%/200%, toate cele 18 măsurători corespund dimensiunii CSS × DPR, cu toleranță sub un pixel pentru rotunjire. De exemplu, molecula este desenată la 1154×609 pixeli pentru aproximativ 577×304 CSS px, DPR 2. Fără erori de consolă. Testele verifică și variații repetate ale lățimii afișate și DPR 1/1,5/2/3, păstrarea coordonatelor logice și bilanțurile fizice.

Cele patru rezultate ale modelului molecular sunt grupate pe un rând pe desktop și două coloane pe mobil; etichetele au dimensiunea comună de lectură. Panoul rezultatelor a scăzut de la aproximativ 258 la 61 px pe desktop, fără eliminarea vreunei valori.

## Auditul celorlalte laboratoare

Au fost inspectate toate cele 11 laboratoare la lățimi de tabletă și desktop. Verificarea pe desktop a parcurs și taburile disponibile în DOM, iar pentru Unde mecanice au fost parcurse explicit toate cele 37 de ecrane, la 1920×1080 și 768×1024. Scenele științifice, formulele, țintele tactile și conținutul nu au fost micșorate sau ascunse pentru a satisface măsurarea.

Corecțiile din `public/design-system/compact.css`:

- Mișcarea rectilinie: panourile laterale și principale își folosesc înălțimea proprie. Golul artificial de aproximativ 314 px din panoul clasificării dispare, la fel ca întinderile panourilor din MRU/MRUV.
- Interacții atomice: scena nu se mai întinde după înălțimea coloanei de controale; eliminate aproximativ 286 px de suprafață goală sub conținut.
- Calorimetrie: întrebările testului nu se mai întind după cele mai înalte vecine; eliminat golul observat de aproximativ 108 px.
- Optică: panoul de controale se termină la propriul conținut. Scena își păstrează înălțimea disponibilă și Mod tablă păstrează regulile sale. Copia autonomă a fost regenerată prin sincronizarea oficială.
- Unde mecanice: grilele aliniază panourile la început, fără întinderea după vecini. Au fost eliminate goluri observate în acustică, seismologie, rezonanța clădirilor și ghidul profesorului.
- Glosarul undelor: glosarul și harta formulelor ocupă grupuri succesive pe lățimea paginii, fiecare cu propria grilă adaptivă. Cele 20 de definiții și toate formulele rămân disponibile, fără coloana goală de circa 1722 px și fără lista îngustă cu derulare internă.

După corecții, verificarea geometrică nu mai identifică golurile de peste 100 px găsite inițial în panourile afectate. În cele 37 de ecrane ale undelor nu s-a detectat depășire orizontală pe desktop sau tabletă.

Celelalte lecții au păstrat organizarea existentă acolo unde verificarea nu a identificat o întindere inutilă. Nu se elimină spațiul necesar traiectoriilor sau graficelor doar fiindcă nu este ocupat de text.

Verificări automate relevante: 29 din 30 trecute. Singura eroare este cea anterioară, de proveniență: lipsește `interactii-atomice/js/app.js` din folderul sursă. Testele modelului atomic, ale noilor canvasuri, ale undelor, ale localizării și ale păstrării sursei undelor trec.

Actualizare 29 octombrie 2026: blocajul de proveniență atomică este rezolvat din sursa originală furnizată. Suita completă trece 109/109 teste; nu există teste omise.

## Stabilizarea panoului Tipuri de mișcări — 30 octombrie 2026

La cererea utilizatorului, panoul explicativ nu are derulare separată. Înălțimea minimă este calculată din cea mai lungă dintre toate cele cinci explicații, folosind exact rendererul lecției și traducerea curentă. Cardul păstrează aceeași înălțime la schimbarea tipului de mișcare. Măsurarea se reface la schimbarea limbii, dimensiunii textului, fonturilor sau lățimii disponibile; nu modifică selecția ori starea animației.

`MR.motionTypeInfoVariants()` reutilizează funcția originală de prezentare cu o țintă temporară. Adaptarea este reproductibilă prin `scripts/motion-behavior-patches.json`; sursa originală rămâne intactă. `public/shared/course.js` măsoară variantele în afara fluxului vizibil și setează `--motion-info-height`. Nu există înălțime fixă ce ar putea tăia textul și nu se folosește `overflow:auto` pentru explicație. Constrângerile de lățime previn lărgirea grilei la texte mai mari.

Introducerea Tipuri de mișcări păstrează padding de 1rem pe verticală și 1,25rem pe orizontală, cu 0,875rem între titlu și paragraf. Fundalul Bibliotecă are minimum 108 px lățime, 46 px înălțime, padding lateral de 20 px, colțuri de 12 px, contur și umbră discrete.

Verificat în Chromium în RO/EN, text 100%/200%, la 1920×1080, 1366×768, 1024×768 și 390×844. În toate cele 16 combinații, cardul are aceeași înălțime pentru cele cinci traiectorii; tot conținutul încape atât vertical cât și orizontal. Pe desktop la text 100%, toate cele cinci carduri au 472 px. Testul de măsurare verifică faptul că generarea tuturor variantelor nu schimbă descrierea selectată.

## Verificarea celorlalte panouri — 30 octombrie 2026

Au fost parcurse toate cele 16 laboratoare, inclusiv secțiunile ascunse prin taburi, la lățimi de 1366, 1024 și 390 px, cu text de 100% și 200%. Au fost verificate spațiul interior, derularea verticală proprie și depășirile paginii. Problemele descoperite la titluri, formule, liste de probleme și tabele au fost corectate; valorile de înălțime din verificările mai vechi de mai sus sunt măsurători istorice, înaintea noii spațieri.

`public/shared/panel-layout.js`, inclus în antetul comun prin `prepare-presentation.mjs`, rezervă înălțimea explicațiilor alternative prin copii temporare inerte, fără a apăsa comenzile reale. Recalculează la schimbarea lățimii, limbii, fonturilor, mărimii textului și modului tactil. Numerele care se schimbă de la un cadru de animație la altul nu provoacă măsurări repetate dacă structura textului este aceeași. Observatorii elementelor înlocuite sunt deconectați.

Acoperire pentru opțiunile dinamice: cele cinci traiectorii și patru regimuri de accelerație din Mișcarea rectilinie; cele patru moduri din Viteza și accelerația; cele două grupuri de câte patru forme din Mișcarea curbilinie; cele 12 preseturi și ambele moduri ale compunerii; cele 19 rezonanțe și trei materiale Chladni; cele două moduri ale experimentului de fierbere. Matricea include RO/EN, 100%/200% și cele trei lățimi. Etichetele și valorile parametrilor au spații stabile; comenzile condiționale păstrează locul fără a putea primi focus cât timp sunt ascunse.

Panourile text au padding de 1rem × 1,25rem, respectiv 0,875rem × 1rem pe ecrane înguste. Jurnalele și listele de probleme se desfășoară în pagina principală. Tabelele comparative dense se transformă în rânduri etichetate la lățimi mici; etichetele vizuale sunt atribute și pseudo-elemente CSS, astfel încât nu modifică valorile celulelor și exporturile CSV. Graficele și formulele lungi păstrează mecanismele de afișare necesare rezoluției și lizibilității lor.

Variantele accelerației reutilizează rendererul original printr-o adaptare reversibilă. Variantele compunerii reutilizează calculele și rendererul lecției, cu restaurarea sincronă a stării chiar dacă măsurarea eșuează. Testele verifică aceste garanții; fișierele originale importate rămân intacte. Aceleași adaptări sunt incluse în distribuția locală și în arhivele autonome.
