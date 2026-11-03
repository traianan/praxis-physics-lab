# Stand tsunami — implementare și verificare

## Rezultatul urmărit

Activitate distinctă: **Fenomene ondulatorii → Unde seismice → Tsunami: propagare și măsurare**. O singură scenă vizibilă, desenată și înainte de pornire. Comenzile, timpul, viteza la sursă și nivelurile curente la trei stații rămân lângă hartă. Tabelul complet și explicațiile sunt într-o secțiune pliabilă. Parametrii și starea se păstrează la schimbarea limbii, culorilor, dimensiunii textului și ferestrei. Schimbarea sursei sau amplitudinii reinițializează explicit experimentul.

## Cauze eliminate

- Canvasul auxiliar cu batimetrie devenea vizibil prin adaptorul generic de figuri. Noul stand deține explicit o singură scenă; stratul bitmap auxiliar nu este montat în DOM.
- Mai multe grupuri de butoane erau suprapuse în aceeași celulă prin clasificarea automată a copiilor. Standul are acum structură proprie, fără relocări ale nodurilor React.
- Harta sintetică era prezentată drept Pacific real; sursele istorice puteau fi pe uscat, iar limita numerică de 10 m ascundea eroarea. Noul bazin este declarat schematic; toate sursele predefinite sunt în apă, iar sursele manuale sub 500 m sau pe uscat sunt respinse fără schimbarea experimentului.
- Relația Mw–amplitudine era arbitrară. Amplitudinea inițială este acum un parametru fizic explicit, activ, între 0,1 și 2 m.
- Vechiul avans temporal și curbarea razelor erau euristice. Noul model folosește secunde SI și ecuații conservative; timpul de calcul este separat de randare. Nici cadrele lente nu pierd arbitrar timpul scurs.
- Butoanele sursei pe hartă răspund la click/tap complet, nu la prima apăsare care poate iniția derularea pe telefon.
- Nu se mai afișează estimări istorice de sosire, înălțimi la plajă, sunete de cutremur sau multiplicatori artificiali de amplitudine.
- Verificarea vizuală în EN a prins și traducerea accidentală a identificatorului A prin adaptorul global de Canvas. Identificatorii A/B/C/S sunt acum etichete DOM protejate de traducere, aliniate cu scena; regresia RO/EN este inclusă în scriptul de browser.

## Model și limite

`public/shared/waves-tsunami-model.js` nu depinde de DOM/React. Integrează ecuațiile liniare pentru unde lungi, cu fund fix:

\[
\frac{\partial\eta}{\partial t}=-\nabla\cdot Q,\qquad
\frac{\partial Q}{\partial t}=-gh\nabla\eta.
\]

Grilă 120×72, pas egal de 10 km în ambele direcții, bazin de 1200×720 km, adâncimi umede 100–4000 m. Debitele sunt definite pe fețele celulelor, nivelurile în centre. Fețele spre uscat au debit nul. Inițializarea la jumătate de pas corespunde vitezei inițiale nule. Pasul fix respectă CFL cu factor 0,45; timpul solicitat se acumulează independent de numărul cadrelor.

Sursa este o ridicare gaussiană netedă a apei, cu lățime caracteristică 40 km; nu reproduce generarea unui eveniment istoric. Coastele reflectă, iar benzile de la marginile oceanice nord/sud amortizează treptat undele. Aceste benzi sunt un tratament numeric absorbant, nu o coastă reală. Nu se calculează inundarea, spargerea, retragerea liniei țărmului sau run-up. Valabilitatea este cea a modelului liniar de unde lungi, cu deplasări mici în raport cu adâncimea.

Stațiile înregistrează prima depășire a pragului de 1% din amplitudinea inițială și maximul modulului nivelului observat până la momentul curent. Detecția nu este prezentată drept ETA geografică. Dacă o stație se află chiar în perturbația inițială, măsurarea și eventuala detecție sunt înregistrate la t=0. Culorile deplasării sunt raportate la amplitudinea inițială și rămân fixe în timpul unei rulări; legenda urmează paleta.

Rularea se oprește în jurul a trei ore simulate, la ultimul pas complet al grilei (sub un pas diferență față de 10800 s). Ieșirea din activitate sau ascunderea documentului oprește ceasul; revenirea cere o pornire explicită.

Referințe fizice: [NOAA — Tsunami Propagation](https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation), [NOAA NCEI — Tsunami Travel Time Maps](https://www.ncei.noaa.gov/products/natural-hazards/tsunamis/tsunamis/travel-time-maps). Acestea susțin relația de undă lungă v=√(gh); discretizarea și verificările sunt documentate aici, nu atribuite NOAA.

## Probe numerice automate

`test/waves-tsunami.test.mjs` verifică opt proprietăți:

1. Repausul exact al apei neperturbate.
2. Viteza măsurată în apă uniformă de 1000 m și 4000 m: abatere sub 4% față de √(gh), raport apropiat de 2.
3. Conservarea volumului într-un bazin închis și imposibilitatea traversării unei bariere uscate.
4. Același rezultat pentru aceeași durată împărțită diferit între cadre; dublarea amplitudinii dublează soluția.
5. Surse/stații predefinite valide și respingerea surselor invalide fără modificarea stării.
6. Stabilitate și valori finite pe trei ore simulate, inclusiv amplitudine inițială de 2 m; resetarea măsurătorilor.
7. Stația aflată în sursă măsoară corect nivelul la t=0.
8. La o treaptă de adâncime 4000→1000 m, unda reflectată și cea transmisă reproduc coeficienții analitici R=1/3 și T=4/3, cu toleranță absolută 0,02 pentru crestele măsurate.

Proveniența reversibilă a importului rămâne verificată. Înlocuirea tsunamiului are marcaj separat, restaurat înaintea adaptărilor de manual; astfel nu sunt suprapuse marcajele funcțiilor vecine.

## Verificări în aplicație

Script reproductibil: `scripts/qa/waves-tsunami.browser.js`, executat în pagina montată prin Chrome DevTools. Include hartă inițială nevidă, un singur Canvas, slidere ±, pornire/pauză/resetare, RO→EN→RO, paletă, ieșire/revenire în activitate, surse predefinite și manuale, respingerea uscatului, apăsare tactilă fără selectare accidentală, tastatură, eveniment visibilitychange, tabelul stațiilor și geometria comenzilor. Testul de vizibilitate simulează evenimentul browserului; nu este prezentat drept test de sistem al comutării native între ferestre.

- 1366×768: conținutul activ și navigarea până la aproximativ y=752 px, atât RO, cât și EN; fără depășire orizontală.
- 1920×1080 DPR2: aceeași scenă și toate comenzile în ecran; text 100/200% fără depășire orizontală.
- 1024×768 și 3840×2160 DPR1: RO/EN, 100/200%, fără depășire orizontală sau erori MathML.
- Telefon 390×844 DPR2 tactil: piste utilizabile, ținte minimum 52 px la text 100%; la 200% tabelul lung are derulare locală. Derularea verticală este păstrată pentru lizibilitate.
- Mod tablă: starea numerică păstrată, o singură scenă, fără depășire orizontală.
- Ceas cu un cadru întârziat intenționat 1,2 s la 1 min/s: avans aproximativ 80,3 s simulate, corespunzător timpului real scurs și pasului discret, fără plafonul arbitrar anterior de 0,25 s/cadru.
- Rulare la accelerarea maximă: oprire automată la aproximativ 10794,5 s, butonul de pornire dezactivat până la resetare, măsurători finite.
- Audit general al laboratorului: 86 combinații RO/EN de teme/activități, fără erori MathML, piste comprimate sau depășiri orizontale pe desktop.
- Arhivă offline regenerată și deschisă prin file://: model disponibil și funcțional, fără cereri HTTP/HTTPS la încărcare.
- `npm run build` reușit; `npm run check`: **239 teste trecute**, inclusiv cele opt probe numerice noi. Verificările de sintaxă ale celor trei fișiere JS noi sunt incluse în comandă.

Nu s-a publicat și nu s-a făcut push. Schimbările sunt locale în aplicație și în arhiva autonomă.
