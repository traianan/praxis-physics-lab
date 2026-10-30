# Auditul etichetelor și indicilor — 28 octombrie 2026

Au fost verificate toate cele cinci laboratoare ale bibliotecii, în browser, cu interfețe RO/EN și cu verificări la lățime de mobil de 390 px.

| Laborator | Probleme identificate și corecții |
| --- | --- |
| Viteza și accelerația | Indicii din controale erau elemente flex separate. Simbolul, săgeata și indicele sunt acum grupuri inline care nu se rup. Legendele cardurilor au un singur flux de text. Controalele cu formule lungi ocupă lățimea panoului. Simbolurile vectoriale au săgeți și pe traiectorie, și în triunghiul vitezelor. |
| Calcul vectorial | Unele repere numerice de la margine și textul rezultatului adunării ieșeau din canvas. Grupurile complete de simboluri, indici și săgeți sunt încadrate împreună. Poziționarea ține cont de etichetele anterioare; registrul se golește la fiecare redesenare. Cele 11 figuri au fost verificate inclusiv după mutarea unor puncte. |
| Mișcarea rectilinie | Verificarea celor patru secțiuni nu a găsit texte tăiate în stările examinate. Eticheta vectorului de pe pistă și mica săgeată de deasupra ei folosesc acum aceeași poziție limitată la margini. |
| Unde mecanice | Eticheta unghiului de refracție putea ieși în jos din canvas; eticheta stației seismice B putea ieși în dreapta. Pozițiile sunt limitate folosind dimensiunea efectivă a textului. Notațiile de tip `f_exc`, `r_ref`, `V_d` și `N_p` sunt desenate cu indice real, micșorat și coborât, inclusiv în măsurarea lățimii. Au fost parcurse cele 19 teme și 25 de ecrane cu navigare internă. |
| Oglinzi și lentile | Tipul imaginii și coordonata x₂ se suprapuneau sub stilurile comune. Rândurile au fost distanțate. Pe mobil, suprafața SVG putea ajunge la înălțime zero; are acum o înălțime minimă explicită în modul normal. Etichetele SVG se repoziționează la schimbarea scenei, limbii și dimensiunii. Ambele lentile și cele trei oglinzi au fost verificate în RO/EN pe mobil: fără intersecții între casetele textelor și fără texte în afara cadrului în stările testate. |

## Implementare și reproducere

`shared/canvas-typography.js` asigură indici tipografici și limite pentru textele Canvas ale lecțiilor importate. Nu schimbă coordonatele, legile fizice sau frecvențele. KaTeX rămâne rendererul formulelor din Calcul vectorial. Adaptările vectorilor și undelor sunt păstrate în registrele reversibile existente; comparațiile SHA-256 ale surselor originale continuă să treacă.

În optică, distanța dintre cele două rânduri este corectată în sursa `D:/ProiecteAI/Optica-Lab/dist/app.js`; adaptarea SVG specifică bibliotecii este în `scripts/optics-library.js`. Modificarea pentru înălțimea suprafeței pe mobil este în `design-system/lab-layout.css` și exclude modul tablă.

Verificări automate: **70 de teste** în Praxis-Fizica și **57 de teste** în Optica-Lab, toate trecute. Există teste noi pentru atașarea indicelui la simbol și încadrarea textelor Canvas la marginea dreaptă/inferioară. Arhivele autonome și biblioteca locală au fost reconstruite.

Aceste rezultate descriu stările și dimensiunile examinate; nu înlocuiesc un audit exhaustiv al tuturor combinațiilor continue ale sliderelor.

Acest audit precedă integrarea laboratorului „Mișcarea curbilinie plană”; verificarea acestuia este documentată separat în `INTEGRARE_MISCARII_CURBILINII_PLANE.md`.

## Revizuirea spațierii și a modului tactil

Spațierile au fost revizuite în toate laboratoarele. Casetele cu formule din Mișcarea rectilinie, Viteza și accelerația, Calcul vectorial, Unde mecanice și optică au margini interioare de 12/16 px la text 100%. Marginile secțiunilor și golurile dintre panouri au fost reduse; formulele și diagramele păstrează dimensiunile de lectură și sistemele de coordonate. Regula veche care anula paddingul tuturor cardurilor a fost restrânsă la containerele structurale ale simulărilor rectilinii.

În browser s-au verificat țintele de 44/52 px, cursoarele de 26/32 px și memorarea comutatorului optic după reîncărcare. Optica folosește acum aceeași preferință tactilă ca restul aplicației.

## Audit tabletă — 28 octombrie 2026

Au fost corectate suprapunerile găsite în reperele axelor din Calcul vectorial, în diagramele de elipse ale particulelor de apă, în marcajele nodurilor Kundt și în legenda propagării Rayleigh. Literele italice și indicii Canvas păstrează un mic spațiu pentru depășirea glifelor, fără ruperea grupului matematic. Etichetele optice caută o poziție liberă în întreaga suprafață, iar mesajul despre imaginea ieșită din cadru își dimensionează caseta după text.

Reverificare finală în Chrome cu emulare de tabletă, DPR 2, interfață română și Mod tactil activ: 768×1024 portret și 1024×768 landscape. În fiecare orientare s-au parcurs: Viteza și accelerația (15 stări), Mișcarea rectilinie (4 secțiuni), Calcul vectorial (toate figurile inițiale), Unde mecanice (37 ecrane), Oglinzi și lentile (5 tipuri) și Mișcarea curbilinie plană (25 stări). Total: 174 instantanee de verificare; fără depășirea paginii sau a casetelor de formule, fără texte Canvas/SVG tăiate ori casete de text suprapuse în aceste stări. Rezultatele sunt în `tablet-audit-results.json`.

Prima pagină a fost verificată la 1600 px: două carduri din același capitol pe rând, maximum două per capitol, iar capitolele cu un laborator au propriul rând. La 768 și 1024 px, cardurile au o singură coloană și nu produc derulare orizontală. Capitolul Mișcare afișează toate cele patru laboratoare; căutarea găsește și laboratoarele excluse din previzualizare.

Validare: 74 de teste automate trecute. Emularea nu reprezintă testare pe hardware fizic și nu acoperă toate combinațiile continue ale parametrilor.
