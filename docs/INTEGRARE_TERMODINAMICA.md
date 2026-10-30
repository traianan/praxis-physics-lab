# Noțiuni termodinamice de bază

Înregistrat în `caldura-termodinamica`, pagina `simulari/notiuni-termodinamice/index.html`. Biblioteca conține acum șapte laboratoare; previzualizarea păstrează maximum două pe capitol și grupează capitolele pe rânduri distincte. Indicatorul pentru rularea pe localhost este „Rulează local” / „Running locally”.

Sursa adăugată de utilizator este păstrată în `sources/notiuni-termodinamice/site`, cu inventar SHA-256 în `imported-thermodynamics.json`. Folderul de intrare nu este șters. Importul reproductibil este `npm run import:thermodynamics`.

Sunt păstrate cele 13 figuri, glosarul, căutarea, testul cu 14 întrebări, cele zece probleme numerice, explicațiile și rezolvările. Sunt eliminate eroul decorativ, atribuirea la manual, numerele editoriale, corecturile tipografice și trimiterile la paginile/figurile cărții. Secțiunea provenită din lista de erori este eliminată complet, inclusiv intrarea din navigare. Definițiile și explicațiile fizice rămân în subiectele lor. Resursele locale și legăturile către laboratoarele înrudite sunt adaptate la bibliotecă; referințele externe și înregistrarea PWA a sursei nu sunt distribuite.

Integrarea folosește componentele comune: antet, întoarcere în bibliotecă, secțiuni, mărirea textului, palete, sunet global inițial inactiv, ținte tactile și steppere. Valorile sliderelor rămân sincronizate după învelirea în controalele comune. Stările apăsate ale butoanelor sunt actualizate pentru întregul grup de moduri. Animațiile se opresc în fundal. Formulele folosesc KaTeX local; Canvas folosește DPR și stratul comun de etichete, cu indici atașați, inclusiv indici grecești. Pe tabletă, textul și figurile formează o singură coloană; glosarul își rearanjează rândurile pe ecranele înguste.

RO și EN funcționează fără internet. `scripts/extract-thermodynamics.mjs` parsează literalurile și șabloanele JavaScript; `scripts/publish-thermodynamics-locales.py` publică mesajele și păstrează TeX. Căutarea cuprinsului acceptă termenii originali și traduși. Arhiva autonomă este `simulari/notiuni-termodinamice/notiuni-termodinamice.zip`.

Verificare în Chrome, emulare tabletă 768×1024 și 1024×768, DPR 2, Mod tactil activ, RO/EN: 82 de stări per combinație, 328 total. S-au parcurs modurile figurilor, opțiunile disponibile și capetele intervalelor sliderelor. Fără depășiri ale paginii/casetelor de formule, etichete tăiate, casete de etichete suprapuse sau erori KaTeX în stările examinate. Raport: `thermodynamics-tablet-audit.json`. Verificarea vizuală a completat măsurătorile. Aceasta este emulare, nu test pe hardware fizic, și nu reprezintă toate combinațiile continue ale parametrilor.

Au trecut 78 de teste automate, inclusiv conservarea sursei, calculul independent al celor zece răspunsuri și indicii grecești. În browser s-au completat toate cele zece probleme și toate cele 14 întrebări corect, s-au verificat filtrarea glosarului și căutarea în engleză.

Arhiva autonomă a fost deschisă din `file://` cu rețeaua dezactivată: 13 figuri, 14 întrebări, 10 probleme, RO/EN, fără erori de consolă, fără depășirea paginii și fără cereri HTTP.


## Navigare prin taburi

Laboratorul afișează o singură secțiune, selectată prin șapte taburi principale: Structura substanței, Sisteme și procese, Căldură și temperatură, Recapitulare, Test, Probleme și Resurse. Grupele cu mai multe subiecte au subtaburi, fără afișarea simultană a întregii lecții. Cele 16 secțiuni și cele 13 figuri sunt păstrate. Cuprinsul și căutarea deschid tabul potrivit, inclusiv pentru definiții, figuri și ancore din glosar. Adresele directe și reîncărcarea selectează secțiunea indicată de fragmentul URL.

Taburile se pot controla prin atingere, click și săgețile tastaturii; se înfășoară pe rânduri pe tabletă. Selectarea nu reconstruiește formularele: valorile sliderelor, răspunsurile testului și rezolvările problemelor se păstrează. Animațiile din secțiunile ascunse sunt oprite; figurile sunt redesenate la afișare. QA reproductibil în browser: `scripts/qa/thermodynamics-tabs.js`.

Reverificare a taburilor: toate cele 16 secțiuni, în RO/EN la 768×1024 și 1024×768 cu modul tactil activ; fără depășiri ale formulelor/paginii, etichete tăiate, suprapuneri ori animații în secțiunile ascunse. S-au verificat păstrarea sliderelor, răspunsurilor și rezolvărilor, cuprinsul, tastele săgeți și deschiderea directă la definiția kelvinului. Raport: `thermodynamics-tabs-audit.json`. Toate cele 78 de teste automate au trecut.

Butoanele Gaz/Lichid/Solid rămân în figura corespunzătoare. Revenirea EN → RO este verificată pentru textele lecției și taburi; prima traducere a conținutului așteaptă randarea KaTeX, pentru a păstra sursele românești ale fragmentelor de text.

Etichetele din exteriorul cilindrului motorului folosesc suprafața figurii; umplerea gazului nu le mai constrânge în dreptunghiul pistonului. Această regulă se activează numai pentru figurile termodinamice.


## Cicluri ideale Otto și Diesel

Figura introductivă are selector Otto/Diesel. Otto folosește 1→2 adiabatică, 2→3 izocoră, 3→4 adiabatică și 4→1 izocoră. Diesel folosește a→b adiabatică, b→c izobară, c→d adiabatică și d→a izocoră. Admisia și evacuarea se suprapun fizic pe aceeași presiune p₀, cu săgeți opuse; nu se creează o buclă artificială de pompaj. Sunt afișate stările, ghidajele volumelor, PMI/PME pentru Otto și V₂/V₃/V₁ pentru Diesel, Q₁/Q₂ și sensurile transformărilor.

Modelul pur este în `public/shared/ideal-engine-cycles.js`; desenul și mecanismul în `scripts/adaptations/thermodynamics-engine.js`, introduse reproductibil în lecție prin import. Pistonul, punctul de pe diagramă și valorile afișate folosesc aceeași stare p,V. Exemplele grafice folosesc r=3 la Otto și r=6, raport de injecție 2,2 la Diesel; raportul r este afișat. Căldura primită și cedată și eficiența sunt calculate independent de redarea grafică. Testele verifică închiderea exactă, pV^γ constant pe adiabate, izocorele/izobara, p=p₀ pentru admisie și evacuare, și egalitatea dintre aria ciclului și căldura netă.

Verificarea convențiilor fizice: [NASA — Ideal Otto Cycle](https://www.grc.nasa.gov/www/k-12/airplane/otto.html) și [MIT — Thermodynamics and Climate Change, Diesel Cycle](https://ocw.mit.edu/courses/res-2-008-thermodynamics-and-climate-change-summer-2020/mitres-2-008su22_book.pdf). Aceste trimiteri sunt documentație de verificare, nu texte adăugate în interfața lecției.

Ciclurile ideale au fost verificate în 144 de stări la 768×1024 și 1024×768, RO/EN, cu modul tactil activ: fără suprapuneri de etichete, texte tăiate sau derulare orizontală. Raport: `ideal-engine-cycles-audit.json`. Au trecut 81 de teste automate.


## Alinierea figurii despre cantitatea de substanță

Figura 4 se numește „Masă molară și cantitate de substanță”. Antetul enumeră `Mᵣ, μ, ν, N, m, amestecuri`, cu virgule. Valorile m → ν → N sunt centrate în casetele lor folosind dimensiunile reale ale glifelor, fără deplasarea automată în exterior. Simbolurile chimice rămân în interiorul atomilor, iar etichetele și valorile graficului de comparație rămân pe rândul corespunzător. Celelalte adnotări evită zonele ocupate de aceste texte fixe.

Verificare a figurii 4: 176 de stări în emulare de tabletă, portret/landscape, RO/EN, cu ținte tactile, toate substanțele și capetele intervalelor. Fără depășiri ale casetelor sau suprapuneri peste textele fixate. S-a verificat și afișarea pe desktop. Raport: `molar-quantities-audit.json`; toate cele 82 de teste automate au trecut.
