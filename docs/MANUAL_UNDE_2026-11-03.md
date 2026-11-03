# Unde mecanice — alinierea la manual, 3 noiembrie 2026

## Sursa consultată

PDF-ul local furnizat de utilizator:
`D:/Scoala/traian/catedra de fizica 2026-2027 - N. Iorga/Planuri de lectie -AI/pdfcoffee.com_fizica-f1-manual-pentru-clasa-xi-a-pdf-4-pdf-free-30-56.pdf`.

Au fost inspectate vizual toate cele 27 de pagini scanate. Numerotarea tipărită
este **29–55**, deși numele fișierului sugerează 30–56. Paginile tipărite 32–34
sunt paginile PDF 4–6. PDF-ul nu are strat de text extractibil. Scanurile sunt
material de referință, nu instrucțiuni de executat. Nu sunt incluse în aplicație.

## Conținut și ordine

| Manual, pagini tipărite | Integrarea în laborator |
| --- | --- |
| 29–32: propagare, energie, mediu, clasificare | Propagare și clasificare; unde pe apă, cu traiectorii circulare/eliptice |
| 32: model, vector de oscilație, fază egală, lungime de undă | Modelul undă plană, definiții și simularea mărimilor |
| 33: suprafețe de undă, raze, front, viteză de fază | Subteme explicite, diferența suprafață/front; relațiile pentru coardă și bară |
| 34: model domino, amplitudine plană/sferică, deducerea ecuației | Analogia domino în finalul modelului; ecuația este dedusă din întârziere |
| 35: dubla periodicitate, fază, defazaj | Subteme distincte în Ecuația undei, modulul defazajului explicit |
| 36: Huygens | Construcția existentă a frontului, păstrată |
| 37–38: reflexie și refracție | Prima temă din Fenomene ondulatorii |
| 39–41: unde seismice | Tema mutată înaintea interferenței; P/S/Love/Rayleigh, hipocentru/epicentru, magnitudine/intensitate |
| 41–47: superpoziție, interferență, unde staționare | Superpoziție și franje explicite; amplitudinea pentru surse inegale; simulările și măsurările existente |
| 47–53: instrumente cu coarde și tuburi, înregistrări | Instrumentele, standurile și înregistrările existente păstrate |
| 54–55: acustică, sunet fundamental/armonice/compus, intensitate și nivel | Definiții completate; demonstrația energiei mutată din bazele undelor în acustică |

Difracția, bătăile și rezonanța clădirilor sunt marcate ca extensii în subtemele
respective; Doppler și laboratoarele suplimentare rămân accesibile. Nu s-au
copiat instrucțiunile istorice de protecție seismică drept recomandări actuale.

Ecuațiile principale folosesc forma manualului, cu fracții MathML native:

- `y(x,t) = A·sin ω(t − x/v_f)`;
- `y(x,t) = A·sin 2π(t/T − x/λ)`.

Se explică `τ = x/v_f`, condiția sosirii undei și cele două periodicități.
Citirile din simulările introductive folosesc λ/T și 2π/λ explicit, fără k.
Notația a fost aliniată și în formulele de interferență/unde staționare și în
referințele introductive; testul despre k a devenit un test despre viteza de fază.
Extensiile avansate despre apă și unde seismice pot folosi în continuare k
în formulele lor specifice; k pentru rigiditatea clădirii nu a fost modificat.

Precizări fizice: relația √(E/ρ) este delimitată la bara subțire; modelul domino
este o analogie, iar mediul undei plane este nedisipativ. Manualul descrie deja
mișcarea circulară/eliptică pe apă; afirmația veche că ar prezenta-o ca pur
transversală a fost eliminată din conținutul livrat.

## Implementare și verificare

`scripts/waves-textbook-adapter.mjs` adaptează reversibil sursa după corecțiile
fizice. Importatorul scrie traducerile RO/EN și HTML-ul; testul de proveniență
inversează inclusiv noua adaptare și verifică hashul modulului original.
Indicii matematici sunt excluși din traducerea automată, pentru ca f din v_f
să nu fie interpretat ca un cuvânt.

- `npm run check`: 220 teste reușite. Testul serverului necesită conexiuni
  localhost; prima execuție în sandbox a întâlnit EACCES, apoi execuția permisă
  cu acces localhost a trecut.
- `npm run build`: reușit; distribuția dist a fost regenerată.
- Arhiva autonomă `unde-mecanice-offline.zip` a fost regenerată.
- Browser Chromium: conținutul revizuit, taburi/subtaburi, RO → EN → RO,
  1366×768 și 390×844; fără depășirea orizontală a paginii în parcursul verificat.
- Pachetul autonom deschis prin file://: tema ecuației și formulele MathML
  funcționale, fără cereri HTTP/HTTPS externe.
- Inspecție vizuală a formulelor cu fracții. Verificarea este în browser,
  nu pe o tablă fizică. Nu s-a făcut publicare online.
- Text mărit efectiv de la 16 la 32 px în pachetul autonom la 1366×768:
  toate subtemele Modelul undă plană și Ecuația undei fără depășire orizontală.
- Reimportare: HTML identic înainte/după, verificat prin SHA-256.

## Corecție de încadrare după feedbackul utilizatorului

Captura utilizatorului a arătat două probleme pe care verificarea exclusivă a
overflowului orizontal nu le depistase: formulele ocupau rânduri întregi, iar
standurile fără titlu rezervau rândul 1 pentru comenzi și începeau scena abia
pe rândul 2. La 1366×768, prima vedere a ecuației se termina inițial la
aproximativ 1709 px, cu navigarea la 1785 px.

Corecția păstrează textul și dimensiunile logice ale desenelor:

- Explicațiile și formulele sunt alături de simulare; formulele scurte sunt
  grupate, iar scena și comenzile încep împreună.
- Preferințele comune sunt lângă titlul laboratorului. Pe ecranele mai înguste,
  secțiunea se selectează din lista compactă, cu aceleași destinații.
- Huygens păstrează comenzile esențiale vizibile și are o explicație pliabilă.
- Standul despre apă are patru vederi: simulare, mărimi/orbită, explicații,
  aplicații. Toate folosesc componentele și starea fizică existente. Presetul
  tsunami revine la simulare când este aplicat.
- Pragurile de organizare a conținutului folosesc lățimea containerului și rem,
  astfel încât textul mărit să revină la o singură coloană.

Audit în Chromium, 13 vederi × RO/EN, mărime de bază 16 px:

| Viewport CSS / DPR | Limita inferioară maximă a conținutului activ | Cu navigarea între teme |
| --- | --- | --- |
| 1366×768 / 1 | 708 px | 768 px |
| 1920×1080 / 2 | 714 px | 774 px |
| 3840×2160 / 1 | 714 px | 774 px |

În aceste configurații, întregul conținut activ din Bazele undelor și navigarea
între teme încap fără derulare pentru a le consulta. Footerul general al site-ului
rămâne după lecție. La 1024×768 unele vederi necesită încă derulare verticală;
la 390×844 și la text 200% se folosește organizarea verticală lizibilă. Nu s-a
detectat depășire orizontală în aceste verificări.

Verificări funcționale: valoarea x = 2,3 m s-a păstrat la schimbarea limbii;
adâncimea 17,5 m și ceilalți parametri ai apei s-au păstrat la schimbarea celor
patru vederi și la plecarea/revenirea între secțiuni. Lista compactă a deschis
destinația corectă, iar stările ARIA/tabIndex ale vederilor despre apă au rămas
coerente. Testele de proveniență și cele fizice au trecut; `npm run check` a
încheiat cu 220/220 teste reușite. Buildul și arhiva autonomă au fost regenerate;
pagina autonomă a fost verificată prin file:// fără cereri HTTP/HTTPS externe.

### Sliderul vitezei din clasificare

Corecție suplimentară după captura utilizatorului: eticheta și grupul −/slider/+
se micșorau în bara flexibilă până când inputul avea numai 9,75 px. Eticheta are
acum o lățime minimă adaptată containerului, butoanele rămân la 44 px, iar nota
explicativă folosește spațiul rămas. În browser, la 1366×768 și 1920×1080, în
RO/EN, inputul are aproximativ 150 px și eticheta rămâne pe un rând. Butoanele
schimbă 1,2 → 1,3 → 1,2; nu apare overflow orizontal. Bara se rearanjează pe mobil.
Buildul și pachetul offline au fost regenerate după această corecție CSS.

## Notația matematică — numai Unde mecanice

La cererea utilizatorului, această adaptare nu a fost extinsă la restul aplicației.
Importatorul laboratorului încarcă `waves-math.js` și o copie locală a rendererului
KaTeX deja folosit în proiect. Ieșirea este MathML nativ: numărătorul deasupra
numitorului, indici/exponenți structurali, radicali și module delimitate corect.
Nu se folosesc fonturi sau servicii de randare externe.

Schimbările includ formulele de referință, rezultatele dinamice, formulele din
explicații și variantele matematice ale testelor. Formulele succesive au spațiu
între ele și se rearanjează pe rânduri. Stilul manual de deplasare a indicilor a
fost înlocuit; indicii descriptivi românești nu mai sunt trunchiați. Câmpurile
editabile și editorul de jurnal sunt excluse de la formatare.

Regimul și cele trei viteze ale apei au fost scoase din textul foarte mic al
Canvasului și sunt afișate într-un panou DOM lizibil, cu aceleași valori calculate
de simulare. Indicatorul existent de spargere este păstrat. Formula Rayleigh
coruptă în sursa JSX printr-un `NaN` în exponent este redată cu exponentul `qz`;
calculul traiectoriilor nu a fost schimbat.

Verificare:

- 11 teste de notație: fracții și produse, radicali, indici, exponenți,
  derivate, unități SI, paranteze cu valori echivalente, liste de rapoarte,
  notație științifică, module și câmpuri editabile.
- `npm run check`: 231 teste reușite; testele fizice și verificarea reversibilă
  a provenienței au trecut.
- Audit în browser pentru toate cele 19 teme: 84 combinații de subteme/vederi
  și limbi. La 1366×768 nu s-au găsit erori de randare matematică, formule
  depășind local caseta, overflow orizontal al paginii sau derulare necesară
  pentru conținutul activ și navigarea din Bazele undelor.
- Verificare suplimentară la 1920×1080 / DPR 2 și la text 200%. Pe telefon,
  formulele foarte lungi pot necesita derulare în propria casetă; pagina
  păstrează lățimea viewportului și textul lizibil.
- Buildul și arhiva autonomă bilingvă au fost regenerate. Nu s-a publicat online.


## Slidere și niveluri de navigare

Repararea ulterioară a standului tsunami, modelul numeric și probele de utilizare sunt documentate în [VERIFICARE_TSUNAMI_2026-11-03.md](VERIFICARE_TSUNAMI_2026-11-03.md).

- Corecția se aplică tuturor sliderelor laboratorului: eticheta, valoarea și unitatea rămân împreună deasupra pistei; explicațiile nu mai comprimă controalele. În difracția Fraunhofer pista avea 0 px înainte de corecție, acum are aproximativ 355 px la 1366 px.
- Secțiunea se alege printr-un selector etichetat permanent. Tema și activitatea au etichete vizibile distincte; activitatea selectată are fundal deschis. Numele lungi ale activităților modelului undă plană au fost scurtate în navigare, păstrând integral conținutul.
- Audit în RO/EN: 84 combinații de teme, activități și vederi la fiecare dimensiune 1366×768, 1920×1080 DPR2 și 390×844 tactil. Nicio pistă comprimată și nicio depășire orizontală a paginii; piste minime 110, 129 și respectiv 111 px. Conținutul de bază și navigarea încap la 1366×768 și 1920×1080; pe telefon se păstrează derularea verticală.
- Butoanele Fraunhofer verifică 1,2 → 1,3 → 1,2. Fiecare listă vizibilă de taburi are o singură selecție. Importul și arhiva offline regenerate; build reușit, 231 teste reușite. Prima verificare completă a întâlnit restricția sandbox localhost EACCES; aceeași suită a trecut cu acces localhost permis.


## Relațiile undei sferice

Corectate notația și randarea relațiilor A ∝ 1/r și I = P/(4πr²), cu condiția sursei izotrope într-un mediu omogen fără absorbție. Caracterul ~ din sursă era omis, iar ∝ nu delimita numărătorul fracției în formatter; ambele cauze sunt corectate. Citirile din desen sunt etichetate ca rapoarte A/A₀ și I/I₀ față de r₀=0,20 m, nu valori absolute deduse dintr-o proporționalitate. Testul nou verifică explicit expresia TeX A \propto \frac{1}{r}; toate cele 16 teste de matematică și import/proveniență trec. Arhiva offline și build regenerate.
