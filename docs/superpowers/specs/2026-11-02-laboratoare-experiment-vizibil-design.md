# Laboratoare: experimentul și comenzile în aceeași vedere

Data: 2 noiembrie 2026. Stare: aprobat de utilizator, cu condiția explicită ca implementarea să fie unitară în toată aplicația. Implementarea nu a început.

## Condiția de unitate confirmată

Toate laboratoarele folosesc același sistem de prezentare: ierarhie, navigare, gruparea preferințelor, poziționarea comenzilor față de experiment și tratarea materialelor secundare. Se implementează un singur strat comun, cu configurații explicite pentru particularitățile lecțiilor, fără 19 soluții vizuale independente. Unitatea se aplică paginilor laboratoarelor; excluderea Home și a paginilor de capitol, cerută inițial, rămâne valabilă. Această interpretare este consemnată de implementator pentru a păstra ambele cerințe.

## Scop și decizii confirmate

La utilizarea MRU la școală, profesorul a trebuit să deruleze repetat între Start și graficele x(t), v(t). Ecranul folosit este o tablă interactivă 3840 × 2160. Utilizatorul a ales reorganizarea implicită a tuturor laboratoarelor, în locul unui mod Experiment separat. Home și paginile capitolelor rămân cu organizarea actuală.

Rezoluția fizică a tablei nu garantează un viewport de 3840 × 2160 CSS px: scalarea sistemului, zoomul și browserul pot reduce spațiul disponibil. Organizarea răspunde dimensiunilor CSS reale, fără detecția unui model de tablă.

## Variante analizate

1. Reorganizare implicită: experimentul are prioritate, iar teoria amplă și materialele auxiliare devin secțiuni secundare. Elimină necesitatea activării unui mod suplimentar și este varianta aleasă.
2. Mod Experiment separat: păstrează prezentarea curentă și oferă o vedere suplimentară pentru clasă. Necesită activare și menținerea a două prezentări. Nu este varianta aleasă.

## Structura propusă

Pe ecrane late, fiecare experiment animat are o zonă de lucru alcătuită din parametri și comenzi într-o coloană laterală, scena în zona principală și graficele asociate imediat lângă scenă sau sub aceasta. Start/Pauză/Reset, scena și graficele trebuie să fie vizibile simultan atunci când spațiul și lizibilitatea permit. Nu se aplică o singură grilă rigidă tuturor celor 19 laboratoare: unele au trei grafice, instrumente, tabele sau demonstrații distincte.

Schemă orientativă pentru MRU pe ecran lat:

```text
Antet compact: bibliotecă / titlu / navigare / preferințe
Experimente: Mărimi de bază | MRU | Două mobile
┌─────────────────┬─────────────────────────────────────┐
│ Parametri       │ Scena mișcării și valori curente     │
│ Start / Pauză   ├──────────────────┬──────────────────┤
│ Reset / timp    │ Grafic x(t)      │ Grafic v(t)      │
└─────────────────┴──────────────────┴──────────────────┘
Explicații și formule / Conversii / Probleme și jurnal
```

Aceasta este o propunere a autorului documentului, nu o structură deja aprobată în detaliu. MRU rămâne în lecția Mișcarea rectilinie; subnavigarea locală permite accesul direct la simulare fără traversarea mărimilor introductive și a convertorului. Nu se schimbă arbitrar toate taburile principale sau numele lecțiilor. Secțiunile cu demonstrații multiple primesc acces direct la demonstrația dorită, folosind navigarea existentă unde aceasta este suficientă.

Antetul evită rândurile redundante pentru titlu, traseu, navigare și setări. Opțiunile rare (paletă, preferințe de afișare) sunt grupate într-o zonă extensibilă accesibilă. Navigarea la bibliotecă și comanda Mod tablă rămân ușor de găsit. Mod tablă existent trebuie să funcționeze cu aceeași structură și să nu devină o a doua implementare a experimentului.

Explicațiile ample, derivările, conversiile, problemele și jurnalele urmează după zona experimentală sau sunt accesibile prin secțiuni etichetate. Conținutul secundar nu este șters. Secțiunile care se restrâng folosesc controale accesibile și păstrează valorile introduse. Instrucțiunile indispensabile operării și avertismentele științifice rămân lângă experiment. Nu se restrâng graficele principale pentru a declara artificial că experimentul încape.

## Constrângeri

- Nu se schimbă modelele fizice, ecuațiile, datele, presetările ori mecanismele animației.
- Nu se micșorează global fonturile și nu se folosește zoom/transform de scalare pentru a înghesui pagina. Se păstrează reglajele 100–200% și țintele tactile de minimum 44 CSS px.
- Nu se introduc panouri text cu derulare internă ori blocarea derulării paginii. Explicațiile păstrează comportamentul stabil la schimbarea variantelor, cerut anterior.
- Graficele păstrează etichete și axe lizibile; redimensionarea Canvas respectă dimensiunile CSS și DPR. Reorganizarea nu resetează timpul, parametrii, jurnalul sau starea animației.
- Pe ecrane înguste, elementele se așază succesiv: comenzi, scenă, grafice, explicații. Derularea este permisă când este necesară pentru lizibilitate. O comandă persistentă locală se adaugă doar dacă auditul arată că este necesară și nu acoperă conținutul sau focusul.
- Nu se modifică instalări, servicii, monetizare sau distribuția Android. Nu se publică și nu se face deploy în această sarcină fără solicitare.

## Integrare în proiect

Se folosesc componentele și stilurile comune existente, cu selectori limitați la paginile de laborator. Regulile comune nu trebuie să schimbe Home sau capitolele. Adaptările specifice lecțiilor sunt explicite și păstrează identitatea elementelor și legăturile evenimentelor. Pentru lecții React se modifică sursa/integrările potrivite, fără mutarea arbitrară a nodurilor administrate de React.

Modificările se fac în sursele care alimentează importul/build-ul, nu numai în HTML generat. Se verifică importatoarele și copierea resurselor comune în distribuțiile autonome; adaptările trebuie să supraviețuiască regenerării. Resursele noi intră în mecanismele de cache/pachet existente unde este necesar. Nu se regenerează sau publică arhive fără legătură cu schimbarea.

## Verificare și criterii de acceptare

Se inventariază toate cele 19 laboratoare și fiecare familie distinctă de experiment, inclusiv conținutul accesibil prin taburi. Pentru fiecare se consemnează organizarea aleasă și eventualele limite reale de spațiu. MRU se verifică primul: acces direct, schimbarea parametrilor, Start/Pauză/Reset și vizibilitatea simultană a scenei, comenzilor și celor două grafice.

Matrice minimă: 3840 × 2160, 1920 × 1080 și 1366 × 768 CSS px; tabletă 1024 × 768 și mobil 390 × 844; RO/EN, text implicit și mărit. Reperul tablei se verifică atât la viewport mare, cât și la dimensiunea CSS redusă care poate rezulta din scalare. Nu se promite încadrarea integrală la text 200% ori pe telefon; se verifică accesul tuturor comenzilor și absența suprapunerilor/tăierii conținutului.

Pe desktop 1920 × 1080 și 3840 × 2160, la text 100%, MRU trebuie să permită folosirea comenzilor și citirea ambelor grafice fără derulare repetată între ele. Pentru alte experimente obiectivul se aplică grupului funcțional relevant, cu justificarea excepțiilor, fără reducerea arbitrară a lizibilității. Se compară geometria înainte/după pe viewport identic și se păstrează capturi reprezentative.

Se verifică și tastatura, focusul în secțiunile restrânse, Mod tablă, schimbarea limbii/textului, redimensionarea în timpul rulării, lipsa depășirii orizontale și lipsa erorilor noi în consolă. Home și câte o pagină de capitol au verificare de regresie vizuală. Se rulează build-ul și verificările automate relevante proiectului; teste noi se adaugă pentru contractele de navigare, păstrarea stării sau integrare care pot regresa, nu pentru a copia reguli CSS în aserțiuni.

## Alegeri lăsate implementării

Lățimile coloanelor, pragurile responsive, amplasarea graficelor și gruparea preferințelor se stabilesc prin măsurători și probe vizuale. Ordinea începerii: infrastructura comună și MRU, apoi restul laboratoarelor, apoi verificarea întregii matrice. Nu este necesară o aprobare distinctă pentru fiecare ajustare locală care respectă acest document; schimbările de scop se discută separat.
