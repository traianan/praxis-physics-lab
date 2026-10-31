# Motoare termice — integrare Web

Integrată la 31 octombrie 2026 în **Căldură și termodinamică**, la `simulari/motoare-termice/index.html`. Biblioteca cuprinde 19 laboratoare.

Sursa originală rămâne în `motoare-termice/`, nemodificată. `scripts/import-heat-engines.mjs` produce copia de distribuție și înregistrează amprentele surselor în `docs/imported-heat-engines.json`.

Sunt păstrate toate cele nouă figuri interactive, animația introductivă (Otto, Diesel, Carnot), mecanismul piston–bielă–manivelă, supapele, scânteia/injecția, experimentele energetice, compresia, frigiderul/pompa de căldură, cele patru diagrame de cicluri, glosarul, 12 întrebări și 14 probleme. Cele 13 secțiuni și introducerea se navighează prin opt taburi principale, cu subtaburi. Comutarea păstrează parametrii și răspunsurile.

Mențiunea clasei școlare a fost eliminată din titlu, metadate, introducere și dicționarele distribuite. Referirile editoriale, numerotările externe, secțiunea de corecturi și înregistrarea PWA originală au fost eliminate din distribuție. Explicațiile fizice rămân în secțiunile lor. Sursa originală nu este rescrisă.

## Cicluri ideale

- Otto: 1→2 compresie adiabatică reversibilă; 2→3 încălzire izocoră; 3→4 destindere adiabatică reversibilă; 4→1 răcire izocoră.
- Diesel: 1→2 compresie adiabatică reversibilă; 2→3 încălzire izobară; 3→4 destindere adiabatică reversibilă; 4→1 răcire izocoră.
- Carnot: 1→2 destindere izotermă la T₁; 2→3 destindere adiabatică; 3→4 compresie izotermă la T₂; 4→1 compresie adiabatică. T₁ > T₂, Q₁ primit și Q₂ cedat sunt indicate pe diagramă. Rendererul comun `public/shared/carnot-diagram.js` este utilizat atât în introducere, cât și în figura 6; schema implicită urmărește geometria referinței furnizate, cu starea 4 vizibil la stânga și sub starea 2. Sunt desenate numai cele patru ramuri, fără prelungiri ale izotermelor. Schema este marcată explicit ca reprezentare de principiu fără scară numerică; coordonatele sale nu sunt folosite pentru bilanțuri sau randamente. Butonul „Grafic p–V calculat” din figura 6 activează proiecția liniară a stărilor fizice, utilă pentru studierea efectului parametrilor. Pistonul, temperaturile, căldurile și randamentul se calculează în continuare pe același model termodinamic ideal în ambele reprezentări. Presetul inițial este gaz monoatomic, 600/300 K, V₂/V₁ = 3; limitele controalelor se păstrează.

Diagrama sincronizată cu motorul folosește modelul comun `public/shared/ideal-engine-cycles.js` și adaptorul `public/shared/heat-engines-model.js`. Pistonul urmează cinematica originală. Izocorele au o scurtă staționare vizuală a pistonului la punctul mort; punctul de pe diagramă traversează explicit întregul segment vertical. Diesel încălzește la presiune exact constantă până la volumul de întrerupere. Admisia și evacuarea se păstrează în animația mecanismului, însă nu sunt trasate în diagrama termodinamică. Punctul de pe diagramă așteaptă în starea 1 în timpul acestor curse.

Diagramele dedicate Carnot, Otto și Diesel folosesc transformările ideale originale. Suprapunerea comparativă Otto din figura Diesel a fost corectată: destinderea este urmată de răcirea izocoră, fără segment diagonal. Fundalul introductiv păstrează animația, folosind acum presiune pe scară liniară. Modelul didactic cu gaz ideal asociat turbinei cu abur este păstrat și etichetat ca aproximație; nu constituie un model de proprietăți reale ale apei și aburului.

Introducerea folosește coloane distincte pentru text și diagramă, cu legenda sub canvas și navigarea pe un rând separat. Pe mobil coloanele se stivuiesc, fără suprapunerea textului peste desen.

Otto și Diesel sunt desenate cu același renderer, `public/shared/ideal-cycle-diagram.js`, în introducere, în motorul în patru timpi și în figurile numerice 7–8. Sunt trasate exact patru ramuri, fără linie de pompaj, linii ajutătoare sau starea suplimentară 0. Schemele fără gradații folosesc rapoarte ilustrative de compresie 3/4, astfel încât izocorele și izobara să fie distincte. Acestea nu sunt predicții pentru un motor real. În figurile numerice se folosesc stările calculate din controale, cu valori inițiale ε = 3 pentru Otto și ε = 6 pentru Diesel; intervalele sliderelor, bilanțurile și formulele de randament rămân neschimbate. Demonstrația de autoaprindere și compresie reală din figura 4 își păstrează parametrii.

## Integrare și distribuție

Antetul, revenirea la bibliotecă, RO/EN, culorile Praxis/Vii, modul tactil, reglajele −/+ și mărirea textului folosesc componentele comune. Sunetul original este păstrat, sub controlul comutatorului global, inițial oprit. Animațiile se suspendă când pagina sau secțiunea nu este vizibilă.

Dicționarele RO/EN sunt în `public/locales/courses/motoare-termice/ui/`. Formulele TeX și substituenții dinamici se păstrează identic. Traducerile sunt încorporate în HTML, inclusiv în arhiva autonomă.

Regenerare:

```text
npm run import:heat-engines
npm run package:local
```

Arhivă autonomă: `dist/simulari/motoare-termice/motoare-termice.zip`. Pachet complet: `outputs/Praxis-Fizica-local.zip`. Arhiva se dezarhivează integral înainte de deschiderea `index.html`.

## Verificări

`npm run check`: sintaxă și teste, inclusiv invarianta pV^γ pe adiabate, presiunea constantă pe izobare, volumul constant și staționarea pistonului pe izocore, continuitatea presiunii și bilanțul energetic. Sunt verificate în browser cele nouă figuri, navigarea, RO/EN, testul și problemele, culorile, modul tactil și ecranul mobil de 390 px. Sursele și resursele locale sunt păstrate, iar distribuția nu cere resurse externe pentru funcționare.

## Navigare Otto/Diesel și verificarea legăturilor

Secțiunea și tipul motorului sunt sincronizate în ambele sensuri. Ambele secțiuni afișează aceleași două simulări, în aceeași ordine: motorul în patru timpi, apoi experimentul de compresie și autoaprindere. Figurile existente se mută împreună în secțiunea selectată. Selectoarele din oricare dintre simulări și taburile de sus sincronizează ambele tipuri de motor; experimentul suplimentar este etichetat explicit. Revenirea din navigare nu lasă activ un motor diferit de titlul lecției. Nu sunt create copii ale simulării sau ascultători suplimentari la fiecare comutare.

Audit în browser: 90 de trimiteri interne, 12 URL-uri locale (inclusiv ZIP, bibliotecă și pagini informative), navigarea din cuprins/glosar și legăturile către celelalte lecții. Resursele externe sunt verificate separat; HyperPhysics folosește adresa HTTP existentă, care se deschide în browser.

## Auditul comenzilor și al animațiilor

`scripts/audit-heat-engines-browser.js` se execută ca funcție cu Chrome DevTools `evaluate_script`, după încărcarea lecției. Verifică cele nouă figuri și toate cele 14 secțiuni în RO/EN: selectoarele de mod, starea vizuală și `aria-pressed`, conținutul condiționat de mod, comutatoarele, limitele sliderelor, comenzile de rulare/pauză/pas, rândul activ din tabelele transformărilor, păstrarea parametrilor la navigare, oprirea animațiilor ascunse și sincronizarea ambelor simulări Otto/Diesel. Auditul este aplicabil și paginii autonome `file://`.

Verificare la 390 px în aplicație și 1280 px offline: fără erori sau depășire orizontală, în ambele limbi. La revenirea la Introducere, selectorul de secțiuni afișează acum explicit această opțiune; anterior rămânea gol. Testul de regresie verifică și că listele celorlalte lecții nu sunt schimbate. Separat, s-a verificat reluarea efectivă a cadrelor de animație la revenirea în secțiunile 1, 2, 5–9.
