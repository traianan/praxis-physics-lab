# Extinderea prezentării matematice în Praxis · Fizică

Solicitare: extinderea regulilor validate în Unde mecanice la toate cele 19 laboratoare, cu verificări proporționale și păstrarea sistemelor existente corecte. Modificări locale; fără publicare.

## Implementare

Motorul de notație verificat în Unde mecanice este reutilizat în antetul comun prin `scripts/scientific-math-runtime.mjs`. API-ul `PraxisMath` acceptă notație simplă sau TeX și produce MathML local, cu fracții suprapuse, indici, exponenți și separarea prozei. KaTeX se inițializează local numai când este necesar și se reutilizează când există deja. Nu se introduce un CDN sau o instalare.

Componenta nativă păstrează gazdele și controalele, sursa pentru RO/EN și actualizările numerice. Scanarea inițială este conservatoare; actualizările ulterioare urmăresc gazdele matematice și marcajele explicite, nu rescanează întreaga pagină pentru fiecare cadru de animație. Probele de layout inerte, editorii, jurnalele, exporturile și controalele sunt excluse. MCU folosește o componentă React proprie; Unde mecanice păstrează adaptorul său React.

Sistemele sănătoase rămân: KaTeX din calcul vectorial, oscilator, oscilatoare cuplate și termodinamică; fracțiile CSS din rectilinie, viteză, principiul I și optică; indicii existenți din Canvas/SVG.

## Acoperirea celor 19 laboratoare

| Laborator | Verificare / modificare |
|---|---|
| Calcul vectorial | KaTeX și indicii existenți păstrați; inventar și audit static al expresiilor. |
| Mișcarea rectilinie | Fracțiile CSS și indicii existenți păstrați; formulele cinematice și calculatorul revizuite. |
| Viteză și accelerație | Corectată adunarea componentelor perpendiculare: a²=aₜ²+aₙ². Relația ω²R este limitată cazului circular; eliminată generalizarea la elipsă. Frenet este marcat nedefinit la repaus. |
| Mișcarea curbilinie plană | Sistemele existente de fracții, vectori și etichete păstrate; audit static. |
| Mișcarea circulară uniformă | Fracții în componenta React proprie, cu păstrarea parametrilor și localizării; SVG, opțiunile și comenzile păstrează mecanismul lor. |
| Principiile mecanicii newtoniene | Formatare comună pentru formule și citiri native; vectorii și rapoartele sunt păstrate structural. |
| Noțiuni termodinamice | Formula masei molare a amestecului și substituția numerică mutate din Canvas în DOM scalabil. |
| Calorimetrie | Bara ΔU urmărește energia instantanee și revine la zero după răcire. Formula U=3νRT/2 este în DOM cu fracție. Texte dinamice cu indici și fracții. |
| Principiul I | Fracțiile existente păstrate; completare comună pentru proza și notația simplă. |
| Aplicații ale principiului I | Politropa folosește exponent matematic zecimal, fără punct de înmulțire în exponent; izocora este V=const. |
| Motoare termice | Completare comună în citirile dinamice, inclusiv coeficientul frigiderului; KaTeX existent păstrat. |
| Transformări de stare | KaTeX și formulele existente păstrate; completare conservatoare pentru proză. |
| Oscilator mecanic | Formulele și modelele existente revizuite; KaTeX și graficele sincronizate păstrate. |
| Oscilatoare cuplate | Citiri native structurate pe rânduri, fracții și indici; KaTeX existent păstrat. |
| Compunerea oscilațiilor | Marcaje explicite pentru formulele teoretice și cele două ecuații dinamice; indicele perioadei comune este structural în DOM și desenat separat în Canvas, cu traducere comun/common. Geometria și comenzile păstrate. |
| Figuri Chladni | Formule teoretice și cele două expresii științifice prezentate anterior în code, cu fracții/exponenți structurali. |
| Interacții atomice | Potențialul Lennard–Jones și distanța de echilibru au fracții și exponentul 1/6 suprapus. |
| Oglinzi și lentile | Substituții numerice cu fracțiile native existente; indici SVG cu tspan. Convenția semnelor motorului optic este păstrată. Sursa este Optica-Lab. |
| Unde mecanice | Sistemul validat anterior este păstrat; nucleul primește compatibilitatea pentru gruparea exponenților și trigonometria folosită în celelalte lecții. |

## Dovezi disponibile

- 305/305 teste ale aplicației: trecute, inclusiv testele serverului local și verificările de sintaxă din `npm run check`.
- 59/59 teste de optică: trecute, inclusiv serverul local.
- 91 verificări de sintaxă efectuate, plus parsarea scripturilor din arhive.
- 18 gazde matematice statice nou marcate: fără erori ale rendererului; teste suplimentare pentru formulele familiilor de laboratoare, vectori, exponenți fracționari, trigonometrie și actualizarea valorilor native.
- 18 arhive autonome bilingve regenerate, optica sincronizată și buildul aplicației reușit.
- Sursele originale ignorate de Git au fost restaurate; corecțiile reproductibile sunt în adaptoarele urmărite și în importatoare. Nu sunt păstrate numai în copiile generate.

## Verificare în Chrome local

După autorizarea explicită a utilizatorului, testarea a folosit Chrome headless cu profil separat în `D:/ProiecteAI/tmp/global-math/profile`, server local propriu și client CDP fără pachete suplimentare. Nu au fost folosite conturi personale. Blocajul inițial al conectorului a fost depășit prin acest traseu local.

Script reproductibil: `node scripts/qa/scientific-math-browser.mjs --matrix`.

- Toate cele 19 laboratoare se încarcă; au fost parcurse 119 secțiuni principale, inclusiv cele șase grupuri ale undelor.
- 114 stări de prezentare: RO/EN; 1366×768, 1920×1080 cu DPR 2, 1024×768, 390×844 și 3840×2160; text 100% și 200%.
- Zero excepții JavaScript, erori KaTeX/MathML, etichete Canvas cu NaN/undefined, depășiri orizontale ale paginii sau bucle ale observatorilor în stările verificate. Formulele foarte lungi pot avea derulare locală; lecțiile lungi și textul mărit pot necesita derulare verticală.
- Schimbări de parametri prin evenimentele native în simulările cu slider disponibil; verificare vizuală pe capturi pentru compunerea oscilațiilor, MCU, calorimetrie și optică.
- Probele au identificat un conflict cu TeX încă nerandat, excepția React.Fragment din MCU și apelul unei funcții geometrice în locul traducerii etichetei din Canvas. Au fost corectate și au teste de regresie. Ultima regresie execută funcția reală `plot()` cu i18n și helperii Canvas în ordinea de producție; verifică și absența valorilor NaN.

Rezumatul persistent este `docs/VERIFICARE_MATEMATICA_BROWSER_2026-11-03.json`; rezultatele brute sunt în `D:/ProiecteAI/tmp/global-math/browser-matrix.json`. Au fost efectuate opt probe cu slidere native disponibile în activitățile selectate. Acoperirea secțiunilor și a parametrilor este proporțională; nu reprezintă enumerarea fiecărei combinații posibile de valori și activități imbricate. Nu s-a publicat aplicația.
