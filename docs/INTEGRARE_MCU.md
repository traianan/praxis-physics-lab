# Mișcarea circulară uniformă

Lecția este disponibilă în capitolul **Mișcare**, la `simulari/miscarea-circulara-uniforma/index.html`. Biblioteca are 17 laboratoare. Fișierul original `Mcu-Lectie-Interactiva-Premium.html` este păstrat intact; SHA-256 și inventarul sunt în `imported-mcu.json`.

## Conținut și prezentare

Șapte taburi grupează cele zece secțiuni originale: concepte și mărimi; accelerație și forțe, inclusiv sisteme inerțiale și neinerțiale; curbe supraînălțate; laborator MCU; laborator viraj; două probleme rezolvate; testul cu cinci întrebări. Pe telefon navigarea folosește selectorul comun. Pe desktop taburile au navigare prin săgeți, Home și End. Schimbarea tabului sau limbii păstrează parametrii și răspunsurile.

Fundalurile întunecate și metadatele editoriale au fost eliminate. Suprafețele și accentele sunt deschise; legenda vectorilor păstrează rolurile culorilor din desen. Antetul, biblioteca, RO/EN, culorile, mărimea textului și modul tactil sunt cele comune aplicației. Etichetele și formulele folosesc indici HTML/SVG reali; indicii din Canvas sunt desenați separat, la o linie de bază coborâtă. Textele și explicațiile testului au traduceri locale EN, fără servicii externe.

## Corecții fizice

- Problema discului folosește fără ambiguitate raza poziției corpului, `R = 0,60 m`. Din frecarea statică maximă rezultă `ω = √(μg/R)` și `n = 18,916286426... rot/min`, nu formula contradictorie pentru un diametru.
- Diferența finită a vitezelor este legată de raza corespunzătoare mijlocului arcului. Accelerația instantanee se obține la limita intervalului de timp nul.
- Forța centripetă este rezultanta forțelor reale. În laboratorul virajului, forțele reale sunt `N`, `G` și frecarea; necesarul radial este o referință roșie întreruptă pe schema principală și în comparația separată. Când frecarea cerută depășește `μN`, săgeata frecării este limitată la cea disponibilă, iar starea indică alunecarea.
- Pe curbă, `v_min` este zero când expresia sa neîngrădită este negativă. Numitorul superior nepozitiv înseamnă absența unei limite superioare în modelul ideal. Nu este o afirmație despre viteze nelimitate ale unui vehicul real.
- Afirmația că orice supraînălțare lărgește intervalul de viteze a fost înlocuită cu dependența corectă de unghi și frecare. Forțele de inerție sunt explicate în raport cu cadrul de referință.

## Rezoluție și interacțiune

`shared/mcu-model.js` conține relațiile SI. `shared/mcu.js` desenează pe bitmapuri dimensionate din mărimea CSS efectivă × DPR, cu coordonate logice adaptate mărimii textului. Desenele rămân lizibile și la 200%; scena poate fi deplasată orizontal când este necesar pentru textul mărit, fără a lărgi pagina. Bucla se suspendă în afara tabului MCU și când documentul este ascuns. Timpul unei reveniri nu este integrat ca un salt mare.

Mobilul poate fi tras cu mouseul sau prin Pointer Events touch, printr-o zonă de prindere de 68 × 68 px. Captura pointerului păstrează gestul, iar `pointercancel` îl încheie. În afara acestei zone, gesturile native pot deplasa scena sau pagina. Săgețile schimbă faza cu 5°, Home o readuce la zero. Sliderelor li se adaugă butoanele comune ±, cu zone de atingere de minimum 52 px în modul tactil. Starea fazei și raza sunt păstrate la schimbarea opțiunilor de afișare.

Verificare în Chromium: RO/EN, desktop 1366 px și telefon 390 px/DPR 3, text 100%/200%, toate cele șapte taburi. Nu s-au găsit fundaluri de panou întunecate, indici textuali rămași cu underscore, referințe editoriale vizibile, depășiri ale paginii sau derulare verticală în panouri. Bitmapurile corespund mărimii CSS × DPR. Testul dă 5/5 și păstrează răspunsurile la schimbarea limbii. Captura nativă a pointerului a fost verificată prin drag cu mouseul; traseul Pointer Events touch și anularea au fost verificate cu evenimente touch simulate, cu captura substituită doar pentru pointerul sintetic neautorizat de browser. Interfața folosește aceeași cale de calcul pentru mouse și touch.

## Reproducere

`npm run import:mcu` adaptează reproductibil sursa React, elimină elementele editoriale, extrage stilurile locale și include traducerile. Modificările fizice și editoriale sunt în `scripts/mcu-editorial.mjs`, iar adaptarea JSX în `scripts/adaptations/mcu-jsx.js`. Motorul original al testului este păstrat. `npm run check` verifică și modelele MCU; `npm run package:local` regenerează arhiva individuală autonomă și pachetul bibliotecii.

## Uniformizare text și compactare — 30 octombrie 2026

Etichetele, formulele și notele care erau încă la 13 px folosesc acum text de bază de 16 px și fontul comun al aplicației. Mărirea 100–200% se păstrează. Indicii HTML au o coborâre explicită de 0,3 em; Canvas folosește rendererul comun `PraxisCanvasTypography`, cu baza la 16 px, în locul desenării separate la 13/9 px.

Panoul grafic se termină la propriul conținut, fără a se întinde după coloana de comenzi. Lățimea canvasului exclude paddingul părintelui, ceea ce elimină bara orizontală accidentală observată la text 100%. Introducerile folosesc lățimea disponibilă; distanțele dintre grupuri sunt reduse. La lățimi suficiente, cele trei comenzi sunt alăturate, iar cele șase valori ocupă două rânduri. Scena are o lățime maximă de 42 rem și o înălțime limitată pentru a evita suprafețe foarte mari în modul cu o singură coloană. Taburile se pot împărți pe rânduri și la text mărit pe tabletă.

Vectorii au lungimi grafice mai mari, cu accelerația și forța pe linii apropiate, dar separate. Lungimea tangentei este limitată geometric pentru a rămâne în scenă în toate fazele. Etichetele sunt așezate în spații libere și rămân în interiorul desenului. Valorile SI și modelele fizice nu au fost schimbate; scările grafice sunt adaptate pentru lizibilitate.

## Scara vectorilor și schemele de forțe — revizie

Ambele laboratoare au reglaj separat pentru scara grafică a vectorilor, între 25% și 150%, cu valoare implicită și resetare la 75%. Cele două comenzi sunt sincronizate, funcționează prin touch și nu modifică mărimile fizice.

Virajul folosește un model punctual: N, G și frecarea au aceeași origine și aceeași scară. Necesarul F_cp apare explicit pe desenul principal, orientat spre centrul curbei, cu linie roșie întreruptă. Comparația inferioară separă frecarea, rezultanta disponibilă și necesarul radial în trei rânduri, păstrând exact scara și direcțiile din desenul principal. Nu există măriri individuale sau factori ×. Toate săgețile folosesc un singur factor pixeli/forță, ales după cea mai mare dintre cele cinci forțe și reglajul comun 25–150%. Forțele foarte mici au săgeți proporțional scurte; forțele nule sunt indicate ca zero. Referința F_cp nu se adaugă forțelor reale. Textul explică explicit F_cp = mv²/r ca rezultanta spre centru necesară la viteza aleasă.

ΣF este desenată și pe schema principală, cu o linie albastră mai groasă. Când coincide cu F_cp, roșul întrerupt rămâne vizibil peste albastru; cele două săgeți au același punct de aplicare și aceeași lungime. Explicația și legenda definesc ΣF ca suma vectorială N + G + F_f. Figura are minimum 620 px logici în înălțime, iar pe desktop primește 60% din lățimea celor două coloane. Factorul comun este limitat geometric pentru a păstra toți vectorii în scenă.

Schema accelerației are două viteze tangente egale și un triunghi separat, cu Δv de la vârful lui v₁ spre vârful lui v₂. Formulele sunt aliniate lângă etichete. Săgețile deasupra simbolurilor vectoriale sunt redate prin CSS, fără caractere combinatorii nesuportate. Definiția, comenzile și calculele virajului au fost compactate; separatorul dintre valorile R și μ este o virgulă.

Verificare după revizie: 169 de teste trecute, inclusiv verificarea geometrică a tangentelor și a diferenței vectoriale. Testul desenului execută rendererul virajului pentru 729 de combinații de lățime, scară, unghi, frecare și viteză; verifică proporționalitatea fiecărei săgeți cu forța sa și încadrarea ambelor capete în scenă. În verificarea anterioară Chromium, toate cele șapte taburi în EN la 390 px/DPR 3 și text 200% rămâneau în lățimea paginii, fără derulare verticală în panouri.

Capturile finale ale schemei mărite au fost verificate în Chromium separat: desktop 1600 px și telefon 390 px/DPR 3. Pagina telefonului are lățimea 390 px, canvasul 320 × 620 px CSS și 960 × 1860 px bitmap; toate etichetele rămân în scenă.

Verificare: patru lățimi (1600, 1200, 1024 și 390 px), RO/EN, text 100%/200%, toate cele șapte taburi. Problema de depășire a taburilor la 1024 px și 200% a fost corectată și reverificată. Pe telefon au fost verificate 73 de faze la parametri extremi: toate cele 219 săgeți și etichetele rămân în scenă. Vectorii măsurați în această probă au 78–102 px. Bitmapurile corespund CSS × DPR, fără derulare verticală în panouri. Suita completă: 166 de teste trecute.
