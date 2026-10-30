# Transformări de stare de agregare

Integrată la 29 octombrie 2026, în capitolul **Căldură și termodinamică**, cu ID `transformari-stare-agregare`.

## Conținut și componente comune

Sursa externă din `Transformari de stare de agregare` este păstrată integral. Manifestul SHA-256 este `imported-phase-changes.json`; adaptările reproductibile sunt în `scripts/import-phase-changes.mjs` și `scripts/adaptations/phase-changes-content.mjs`.

Cele 11 secțiuni și zece demonstrații originale sunt completate cu Lichefierea gazelor și izotermele Andrews: în total 12 secțiuni, 11 demonstrații Canvas, două probleme cu rezolvări complete și 15 întrebări. Sunt eliminate din interfață trimiterile bibliografice, paginile și numerotările externe. Harta lecției are nouă carduri numerotate consecutiv. Explicațiile și calculele utile din observațiile editoriale sunt integrate în conținut.

Antetul, navigarea Bibliotecă / Capitol / Lecție, limbile RO/EN, sunetul, dimensiunea textului, modul tactil, paletele Praxis/Vii și pictogramele urmează componentele comune. Titlurile și taburile folosesc explicit catalogul `data-content-type`. Parametrii simulărilor și pașii deschiși se păstrează la schimbarea limbii; testul își păstrează răspunsul și punctajul.

## Lizibilitate și organizare

KaTeX local redă formulele cu indici și fracții corecte. Enunțurile, definițiile, observațiile, valorile tabelelor, cursoarele, întrebările și feedbackul folosesc culori lizibile pe suprafețe deschise. Paletele curbelor nu impun culori palide textului. Panourile au înălțimea propriului conținut, fără întinderea după coloana vecină.

Canvasurile păstrează dimensiuni logice stabile și folosesc rezoluția afișată × DPR. Etichetele au minimum 12 px logici; pe ecrane înguste graficul permite derulare orizontală locală în locul micșorării excesive. Mărirea textului mărește și dimensiunea minimă a desenului. Tabelele și formulele late au derulare locală.

## Corecții științifice

- Problema încălzirii gheții utilizează consecvent λ_t = 334 kJ/kg, deci Q = 77 300 J. Formula etapei de topire redă simbolul λ, nu textul `lambda`.
- Pentru picătura de apă la aproximativ 0 °C se folosește λ_v = 2,50 MJ/kg, rezultând f ≈ 0,882. Sursa confunda această valoare cu aproximativ 2,83 MJ/kg, căldura de sublimare. Sunt precizate ipotezele bilanțului adiabatic și excluderea sublimării ulterioare.
- Evaporarea extrage căldură latentă și reduce temperatura. Bilanțul include aportul mediului, masa rămasă și debitul în g/s. Modelul orientativ pentru apă se oprește la îngheț sau la epuizarea lichidului; aria și vântul rămân parametri relativi. Nu este prezentat drept instrument experimental calibrat.
- Diagrama folosește o ramură distinctă de sublimare sub punctul triplu, ancorarea celor trei curbe și clasificarea solid–vapori, lichid–vapori, solid–lichid și starea triplă. Salturile rapide duc efectiv pe frontiere, cu T_tr = 273,16 K și p_tr ≈ 611 Pa.
- La presiune redusă, demonstrația fierberii nu mai este limitată artificial la temperatura camerei. La limita de 0 °C a încălzirii pe etape se indică gheață, iar la 100 °C apă înainte de aportul căldurii latente de vaporizare.
- Comparația amorf/cristalin are același capăt de temperatură, fără porțiuni ale curbei în afara graficului. Sunt precizate condițiile de presiune constantă pentru platourile de temperatură. Densitatea orientativă a gheții este corectată la aproximativ 917 kg/m³.

Referințe pentru verificare: [USACE, proprietăți termice și călduri latente, anexa C](https://www.publications.usace.army.mil/Portals/76/Publications/EngineerManuals/EM_1110-2-1406.pdf), [OpenStax, Phase Changes](https://openstax.org/books/university-physics-volume-2/pages/1-5-phase-changes).

## Reproducere și verificare

`npm run import:phase-changes`, `npm run check`, `npm run package:local`.

Testele lecției verifică proveniența, conținutul bilingv, bilanțurile termice, vaporii saturați, frontierele de fază, extremele, densitatea celor 11 canvasuri, oprirea ceasurilor ascunse, răcirea prin evaporare și parsarea tuturor celor 43 de formule statice și din rezolvări.

Verificare Chromium: cele 11 secțiuni, RO/EN și ambele palete; 17 cursoare la min/max, fără valori nefinite; toate cele 13 răspunsuri corecte, scor 13/13; feedback greșit și schimbarea limbii după răspuns; sunet activ/inactiv; pași deschiși și parametri păstrați; mobil 390×844 și desktop 1440×1000, DPR 2; text 100%/200%; fără depășire orizontală a paginii, erori de formule sau erori de consolă. Auditul contrastului textului HTML folosește pragurile 4,5:1 / 3:1 și nu constituie certificare integrală de accesibilitate.

Arhivă individuală: `dist/simulari/transformari-stare-agregare/transformari-stare-agregare.zip`. Pachet complet: `outputs/Praxis-Fizica-local.zip`. Nu s-a făcut publicare online.

## Audit suplimentar al etichetelor grafice

După semnalarea suprapunerii din graficul comparativ, au fost revizuite toate cele zece desene: rânduri separate pentru unități și gradații, eliminarea titlurilor interne repetate în comenzi, distanță între valorile barelor și numele substanțelor, poziții stabile pentru informațiile auxiliare. Legenda curbelor de fază este în HTML, sub diagramă; valorile curente rămân în câmpurile de lectură. Nicio explicație sau problemă nu este eliminată.

Audit geometric efectiv în Chromium: 134 de combinații de stare și limbă, incluzând începutul, stările intermediare, limitele și modurile alternative ale demonstrațiilor. Se folosesc dimensiunile textelor măsurate de Canvas, cu margine verticală conservatoare și corecția pozițiilor la limitele desenului. Nu au fost detectate suprapuneri între etichete în cazurile finale verificate. Auditul este eșantionat, nu o demonstrație pentru orice valoare continuă a parametrilor.


## Lichefierea gazelor și izotermele Andrews

Secțiune nouă RO/EN, cu răcirea sub temperatura critică, comprimarea izotermă, cele trei cazuri T < Tc, T = Tc, T > Tc și aplicații practice. Sunt explicate capetele G (vapori saturați) și L (lichid saturat), platoul bifazic și regula pârghiei. Testul are două întrebări suplimentare.

Demonstrația folosește ecuația van der Waals redusă, cu platoul Maxwell calculat numeric prin egalitatea ariilor. Curbele sunt un model didactic, nu date experimentale precise ale CO₂. Repere CO₂: Tc = 304,1282 K și pc = 7,37703 MPa; în interfață 30,98 °C și 7,38 MPa. Compresia și destinderea sunt animate la temperatură constantă; pistonul arată și fracțiunea volumică de lichid, distinctă de fracțiunea molară afișată numeric. Punctul critic se selectează exact, iar schimbarea temperaturii păstrează o singură fază peste Tc.

Trei teste suplimentare verifică presiunea comună și egalitatea ariilor Maxwell, inflexiunea critică și monotonia izotermelor supercritice, respectiv conservarea volumului în regula pârghiei.

Referințe: [NIST IR 8608 (2026), constante critice CO₂](https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8608.pdf), [OpenStax, Phase Diagrams](https://openstax.org/books/chemistry-atoms-first-2e/pages/10-4-phase-diagrams).


Verificare finală pentru completarea Andrews: 122/122 teste ale întregii aplicații trecute. În Chromium, 64 de combinații RO/EN ale noii demonstrații fără suprapuneri ale etichetelor, extreme finite, punct critic exact, comprimare și pauză funcționale. Testul complet al lecției: 15/15 în ambele limbi, fără erori KaTeX. Raport: `andrews-graph-labels-audit.json`.


### Axe fizice și curba de saturație

Graficul Andrews utilizează acum p în MPa și V în litri pentru n = 1 mol. Conversia din modelul redus folosește pc = 7,37703 MPa și Vc = 3RTc/(8pc) ≈ 0,12854 L/mol; această ultimă valoare este a modelului van der Waals, nu volumul critic experimental al CO₂. Comenzile și valorile curente arată °C, L și MPa, inclusiv valorile accesibile ale cursoarelor.

Curba punctată este binodala: ambele ramuri sunt calculate din capetele palierelor Maxwell, cu eșantionare densă în vecinătatea punctului critic și închidere exactă în C. Se afișează porțiunea aflată în fereastra graficului. Punctul C are proiecții pe axe; domeniile subcritice lichid, amestec lichid–vapori și vapori sunt colorate și identificate cu 1/2/3 și legendă. Delimitările nu sunt extinse ca frontiere de fază peste presiunea critică.

Verificare: 124/124 teste ale aplicației; cele două teste adăugate verifică unitățile fizice și continuitatea/monotonia celor două ramuri până la maximul critic. Audit Canvas în Chromium: 72 de configurații RO/EN, fără suprapuneri între etichete; mobil 390×844 fără depășire orizontală a paginii; punct critic afișat 30,98 °C / 7,38 MPa / 0,129 L. Fără erori KaTeX sau de consolă.


### Familia de izoterme și cele patru domenii

Sunt afișate șase izoterme subcritice etichetate direct: −10, 0, 10, 20, 25 și 29 °C. Izoterma critică și cea supracritică au de asemenea temperaturi lângă curbe; izoterma curentă își actualizează eticheta. Etichetele decalate și liniile de legătură păstrează palierele vizibile. Mențiunea repetată n = 1 mol a fost eliminată de pe axa V (L), cantitatea rămânând precizată în comenzi și în nota scării.

Cele patru domenii sunt colorate după binodală și izoterma critică: lichid, amestec, vapori (sub Tc) și gaz (peste Tc). Separarea vapori–gaz urmează izoterma critică, inclusiv la presiuni sub pc; linia orizontală p = pc nu este folosită drept separator de temperatură. Gazul la T > Tc și p > pc rămâne descris drept fluid supercritic, fără sugerarea unei tranziții de fază suplimentare. Indicatorul numeric de stare distinge gazul peste Tc de vaporii sub Tc.

125/125 teste trecute. Testul nou verifică scurtarea succesivă a celor șase paliere și relația lor cu izoterma critică. Audit Canvas final: toate cele 241 poziții discrete ale temperaturii, în ambele limbi (482 cazuri), fără suprapuneri între etichete.


### Denumiri în domenii și volum extins

Graficul scrie direct, cu litere mici, „lichid”, „amestec / lichid + vapori”, „vapori” și „gaz”. Pozițiile și orientările urmăresc spațiile libere ale domeniilor; numerele și legenda internă de sub axe au fost înlocuite cu aceste denumiri. Domeniul volumului și cursa pistonului sunt extinse de la 6 la 20 Vc (aproximativ 2,571 L). Axa volumului este logaritmică, cu marcaj explicit și explicație bilingvă; presiunea rămâne liniară. Această alegere păstrează lizibile vârful și ramura dreaptă, fără deformarea relațiilor termodinamice ale modelului.

Audit Canvas: 482 de configurații de temperatură/limbă fără suprapuneri ale casetelor etichetelor, incluzând rotațiile și alinierea textului. Audit suplimentar al denumirilor de domenii: toate cele 241 temperaturi disponibile, 1601 puncte pe fiecare izotermă și ambele limbi; niciun punct eșantionat al izotermelor nu intră în casetele denumirilor, cu margine de 2 px. Aceasta este o verificare eșantionată, nu o garanție pentru orice situație continuă. 125/125 teste trecute, inclusiv conversia unităților la noua limită de volum; mobil 390 px fără depășirea paginii, fără erori de formule sau consolă.


### Tabel istoric al lichefierii gazelor

Adăugat sub regula pârghiei, în spațiul liber al coloanei explicative: gaz, an și cercetători. Șapte repere pentru șase gaze: clor și CO₂ (1823, Faraday), oxigen (1877, Cailletet și Pictet independent; 1883, lichid stabil, Wróblewski și Olszewski), azot (1883, lichid stabil, Wróblewski și Olszewski), hidrogen (1898, Dewar), heliu (1908, Kamerlingh Onnes). Nota explică diferența dintre condensare trecătoare și lichid stabil. Există șase legături către sursele istorice, într-un panou extensibil. Tabelul și explicațiile sunt RO/EN și disponibile offline; legăturile externe necesită internet doar la deschidere.

Surse verificate: [Royal Society, manuscrisul lui Faraday din 1823](https://makingscience.royalsociety.org/items/pt_16_15/paper-on-fluid-chlorine-by-m-michael-faraday), [relatarea din 1845 a experimentelor din 1823](https://pmc.ncbi.nlm.nih.gov/articles/PMC10389859/), [cercetare istorică despre Cailletet și Pictet](https://pmc.ncbi.nlm.nih.gov/articles/PMC3826198/), [comunicarea Wróblewski–Olszewski din 1883](https://www.scientificamerican.com/article/on-the-liquefaction-of-oxygen-and-nitrogen-and-the-solidification-of-sulphide-of-carbon-and-alcohol/), [Royal Institution, Dewar](https://www.rigb.org/explore-science/explore/person/james-dewar-1842-1923), [NobelPrize.org, Kamerlingh Onnes](https://www.nobelprize.org/prizes/physics/1913/onnes/facts/).

Verificare: 125/125 teste trecute; cele șapte rânduri și toate antetele se traduc în ambele limbi, fără chei lipsă sau erori KaTeX.


### Temperaturi normale de fierbere și ordinea navigării

Tabelul istoric are coloane suplimentare pentru °C și K la 1 atm = 101 325 Pa. Valorile aproximative sunt preluate din Royal Society of Chemistry: Cl₂ 239,110 K; O₂ 90,188 K; N₂ 77,355 K; H₂ 20,271 K; He 4,222 K. Celsius se calculează din același număr prin scăderea a 273,15, cu trei zecimale, evitând inconsistențe între scări. Pentru CO₂ celulele de fierbere sunt marcate —*, iar nota explică sublimarea la aproximativ −78,5 °C (194,7 K), la 1 atm; punctul de sublimare nu este prezentat ca temperatură de fierbere. Surse suplimentare sunt incluse în panoul tabelului: paginile RSC ale celor cinci elemente și [ACS, Carbon dioxide](https://www.acs.org/molecule-of-the-week/archive/c/carbon-dioxide.html).

Tabul Lichefierea gazelor urmează imediat după Introducere. Harta lecției a fost reordonată și renumerotată consecvent. Importatorul păstrează această ordine la regenerare.

125/125 teste trecute. Verificare Chromium RO/EN: șapte rânduri, cinci coloane, toate cele șase perechi numerice satisfac T(K) − t(°C) = 273,15; excepția CO₂ este localizată; nicio cheie lipsă sau eroare KaTeX. Mobil 390 px: fără depășirea paginii sau suprapuneri între cele două coloane numerice, derulare locală pentru tabel.


### Comparația temperaturii critice cu fierberea

Tabelul are șapte coloane: gaz, fierbere °C/K, temperatură critică °C/K, an și cercetători. Cele patru coloane numerice sunt alăturate imediat după gaz și cele critice au fundal discret distinct. Tabelul poate fi derulat local; prima coloană rămâne fixă. Astfel se păstrează atât comparația, cât și datele istorice.

Temperaturi critice folosite, în K: Cl₂ 416,956; CO₂ 304,1282; O₂ 154,581; N₂ 126,192; hidrogen normal 33,145; He 5,1953. Valorile afișate au trei zecimale, iar Celsius se calculează din aceeași valoare Kelvin. Este explicat că Tc nu este definită la 1 atm. Pentru consecvență, hidrogenul utilizează acum perechea NIST pentru hidrogen normal: fierbere 20,369 K și Tc 33,145 K, înlocuind valoarea de fierbere 20,271 K din etapa precedentă, specifică parahidrogenului. Nota precizează diferența orto/para. Excepția CO₂ la 1 atm este păstrată.

Surse adăugate: [NIST WebBook, clor](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782505&Mask=4), [NIST CO₂, 2026](https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8608.pdf), [compilație de constante REFPROP pentru N₂ și O₂](https://pubs.acs.org/doi/10.1021/acs.jced.5c00110), [NIST, parametrii hidrogenului normal](https://github.com/usnistgov/REFPROP-tests/blob/master/resources/TRANSPORT/a256fbd9-aed3-4b48-97f1-d8978d9986d0.FLD), [NIST IR 8474, heliu](https://nvlpubs.nist.gov/nistpubs/ir/2023/NIST.IR.8474.pdf).

Verificare: 125/125 teste trecute. Chromium RO/EN: șapte rânduri și șapte coloane, toate cele șapte perechi critice au diferența K−°C = 273,15 și Tc > temperatura normală de fierbere pentru toate cele șase rânduri cu fierbere la 1 atm. Nicio cheie lipsă. Formatul CO₂ păstrează —* numai în coloanele de fierbere.


### Tabel pe toată lățimea lecției

Tabelul este mutat după închiderea grilei explicații–demonstrație, ca secțiune independentă pe toată lățimea lecției. Au fost eliminate lățimea minimă fixă și coloana fixată pentru derulare. La desktop, toate cele șapte coloane sunt vizibile simultan. Pe ecrane de maximum 700 px, fiecare gaz este afișat într-un grup cu valorile și etichetele lor, în două coloane, păstrând structura semantică a tabelului și toate datele. Etichetele mobile se actualizează la schimbarea limbii.

Verificare Chromium: desktop 1440 px, lățime tabel/cadru 1374/1374 px; mobil 390 px, 372/372 px în ambele limbi; nicio depășire orizontală a paginii sau a tabelului. Tabelul urmează efectiv sub ambele coloane ale demonstrației. Șapte rânduri, toate datele și sursele păstrate, fără erori KaTeX.


### Notele tabelului în coloana explicativă

Cele patru paragrafe despre presiunea normală, temperatura critică și hidrogenul normal, excepția CO₂ și reperele istorice sunt mutate în coloana din stânga, imediat după regula pârghiei, în locul ocupat anterior de tabel. Textul și traducerile sunt păstrate. Tabelul rămâne sub întreaga grilă, pe toată lățimea lecției; lista extensibilă de surse rămâne lângă tabel. Nu există copii duplicate ale paragrafelor.


### Separarea vizuală a explicațiilor

Coloana explicativă are două panouri: explicațiile graficului și regula pârghiei pe fundal albastru discret; cele patru note despre tabel pe fundal auriu discret. Culorile se raportează la paleta științifică comună; textul notelor folosește culoarea principală de cerneală pentru contrast. Nu sunt mutate sau eliminate informații. Tabelul rămâne sub întreaga grilă.


Panourile colorate au titlurile explicite „Explicații pentru grafic” și „Note pentru tabel”, cu traduceri EN și asociere accesibilă prin aria-labelledby.


### Asocierea culorilor explicații–conținut

Panoul demonstrației Andrews utilizează exact aceeași regulă de fundal albastru și bordură ca explicațiile graficului. Secțiunea tabelului utilizează exact aceeași regulă aurie ca notele pentru tabel. Fundalurile interioare ale cadrului grafic și ale tabelului sunt transparente, astfel încât asocierea vizuală se păstrează. Antetele și coloanele critice primesc o nuanță aurie puțin mai intensă; culorile fizice ale domeniilor p–V și contrastul textului rămân păstrate.


Terminologia română a lecției utilizează „coexistență” în loc de „coexistare”, inclusiv în introducerea secțiunii Andrews, descrierea palierului critic și explicația problemei despre cele trei faze. Verbele „coexistă” și termenii englezi sunt păstrați.
