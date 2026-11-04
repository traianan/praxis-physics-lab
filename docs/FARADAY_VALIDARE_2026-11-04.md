# Faraday — implementare și validare, 4 noiembrie 2026

Laborator integrat în catalogul Praxis-Fizica, capitolul Electricitate, magnetism și circuite, cu navigare comună, RO/EN, formule, cinci probleme, verificare cu feedback și cinci surse păstrate în [specificație](superpowers/specs/2026-11-04-faraday-design.md). Implementarea este locală, pe ramura `codex/faraday-lab`; nu a fost publicată pe serverul de producție.

## Actualizarea vizuală solicitată

Cinci scene 3D originale, construite procedural cu Three.js local: magnet și sondă, magnet mobil și bobină, electromagnet RL, transformator, generator. Materiale metalice, înfășurări din cupru, borne și cabluri, suporturi, banc de laborator, umbre și aparate analogice. Culorile și compoziția respectă interfața Praxis. Nu sunt necesare imagini, fonturi sau modele de pe CDN. Acele aparatelor sunt indicatoare schematice; cardurile SI sunt referința cantitativă.

`public/shared/faraday-model.js` conține calculele fără DOM; `scene3d.js` și `view.js` primesc starea controllerului. Aceeași stare alimentează pozițiile/rotația, orientarea câmpului, indicațiile, graficele și formulele. O singură buclă de animație controlează timpul. Istoricul este limitat la 1600 de eșantioane.

## Metodă și verificări fizice

Soluții analitice pentru dipol, flux prin bobină, inducție, circuit RL, transformator ideal și generator. Soluția exactă RL evită instabilitatea unui pas Euler când constanta de timp este mică. Pentru lucrul mecanic al magnetului, integrare Simpson pe deplasarea efectivă, limitată la domeniul permis; convergența este verificată prin înjumătățirea pasului. Generatorul reutilizează modelul existent al aplicației.

| Caz de referință | Rezultat verificat |
|---|---|
| Rampă: N=200, A=0,01 m², ΔB=0,2 T, Δt=0,5 s, R=10 Ω | e=−0,8 V; i=−0,08 A; P=0,064 W |
| Dipol m=1 A·m², x=0,1 m, y=0 | Bx=0,0002 T |
| Bobină a=0,05 m, N=100, R=10 Ω, x=0,1 m, v=−0,1 m/s | Φ=1,123970357 μWb; e=−269,752886 μV; i=−26,975289 μA |
| RL: U=10 V, R=10 Ω, L=0,1 H, i₀=0, t=0,01 s | i=0,632120559 A; Wmag=0,019978820 J; Wsource=0,036787944 J; Q=0,016809124 J |
| Transformator: N₁=200, N₂=100, Φ₀=0,001 Wb, ω=100 rad/s, R=10 Ω | amplitudini 20 V/10 V; putere medie 5 W |

Cele opt teste noi verifică și repausul, câmpul nul, circuitul deschis, inversarea polarității, domeniul îndepărtat, respingerea datelor nefinite, oprirea la capătul cursei și continuitatea curentului RL la comutare. Verificări energetice: −Fv=Ri² pentru magnet, Wsource=Q+ΔWmag pentru RL, Pin=Pout pentru transformatorul ideal. Derivata numerică a fluxului converge către tensiunea calculată analitic. Modelul generatorului este acoperit și de testele sale existente.

Limite fizice: dipol punctual, circuit receptor fără autoinducție, RL liniar fără saturație sau histerezis, transformator ideal cu flux prescris, generator cu viteză prescrisă. Nu sunt simulări electromagnetice de element finit. Geometria 3D este ilustrativă, nu un desen la scară. Zonele singulare ale dipolului sunt excluse. Condițiile inițiale, unitățile și concepțiile greșite sunt explicate în laborator și în specificație.

## Verificare software și interacțiuni

- `npm run check`: **369 teste trecute, zero eșecuri**; verificări de sintaxă inclusiv noul renderer 3D.
- `npm run offline:faraday` și `npm run build`: reușite. Arhiva include motorul 3D, licența, resursele și traducerile. Deschidere `file://`, logo, schimbare EN și pas de simulare verificate; zero cereri HTTP externe.
- Chrome 156.0.8078.80 pe Windows: mouse și touch emulat prin evenimente CDP de încredere, glisare, captură pointer, eliberare în afara scenei și anulare. Butoane de mișcare, pauză, pas, reset, parametri, circuit deschis, sursa RL și schimbarea activității.
- Navigare din laborator la capitol, înapoi la laborator și acasă. Formule și feedback la întrebări; schimbarea limbii/paletei păstrează starea.
- **100 combinații**: cinci activități × RO/EN × text 100%/200% × cinci viewporturi: 3840×2160 DPR1, 1920×1080 DPR2, 1366×768, 1024×768, 390×844. Verificate lipsa depășirii orizontale, dimensiunile canvasului și accesibilitatea controalelor. Capturi inspectate pentru scenele 3D.
- Intrare/ieșire mod tablă și păstrarea timpului: verificate separat. Evenimentul de vizibilitate a fost simulat: timpul rămâne fix în ascuns și continuă la revenire. Aceasta nu dovedește comportamentul pe un dispozitiv suspendat fizic.

## Performanță

Chrome headless, 1366×768, DPR1, Intel Core i7-6700T @2,80 GHz, aproximativ 32 GiB RAM. După încălzire, 600 cadre pentru fiecare activitate. Duratele sunt măsurători ale lucrului JavaScript și trimiterii randării; nu reprezintă măsurarea separată a timpului GPU.

| Activitate | Randare totală p50 / p95 (ms) | Interval între cadre p95 (ms) |
|---|---:|---:|
| Magnet | 4,4 / 8,8 | 33,3 |
| Magnet și bobină | 5,1 / 8,1 | 16,8 |
| Electromagnet RL | 4,8 / 9,9 | 17,0 |
| Transformator | 4,9 / 8,0 | 16,8 |
| Generator | 5,0 / 9,7 | 33,3 |

Calculele fizice p95 ≤0,2 ms; scena 3D p95 ≤2,9 ms; graficele p95 ≤4,6 ms. Intervalul median este aproximativ 16,7 ms. Există cadre mai lente; nu se pretinde 60 FPS garantat pe orice dispozitiv.

Script reproductibil: `scripts/qa/faraday-browser.mjs`, cu `PRAXIS_PLAYWRIGHT_MODULE` dacă Playwright nu este instalat în proiect și `PRAXIS_FARADAY_URL` pentru server. Dovezi locale: `outputs/faraday-browser-qa.json` (trecut), `outputs/faraday-performance.json` (măsurătorile complete, din rularea care a descoperit eroarea offline ulterior corectată), `outputs/faraday-lifecycle-qa.json`, `outputs/faraday-check-final.log` și capturile `outputs/faraday-*-3d.png`. Fișierele outputs sunt artefacte locale ignorate de Git.

## Limite și aspecte netestate

Nu au fost testate telefoane/tablete fizice, iOS/Safari, Firefox, o tablă interactivă reală, pierderea contextului WebGL, consumul energetic sau rulări de durată de ordinul orelor. Este necesar WebGL2. La ecrane joase, pe mobil și la text mărit se folosește derulare verticală; toate elementele nu încap simultan pe un singur ecran. Nu s-a făcut o verificare pedagogică de către profesor și nici o publicare/verificare pe domeniul de producție.

## Corecția conexiunilor electromagnetului

Actualizare 4 noiembrie 2026: sursa și ampermetrul au borne distincte +/−; cele trei conductoare ajung la coordonatele contactelor, iar capetele bobinei sunt conectate exact la înfășurare. Returul este vizibil în fața standului. Ampermetrul este marcat A, iar săgeata i indică sensul pozitiv de referință, explicat în RO/EN; nu este o săgeată a sensului instantaneu. Rezistența R reprezintă rezistența totală, inclusiv bobina. Modelul RL rămâne neschimbat. Cele opt teste fizice trec; scena a fost inspectată în Chrome fără erori JavaScript. Arhiva offline a fost regenerată.

## Corecția circuitului transformatorului

Sursă AC explicită în paralel cu primarul, sarcină rezistivă R și întrerupător în serie numai cu sarcina secundară. Voltmetrele V₁/V₂ sunt conectate în paralel la bornele înfășurărilor, independent de întrerupător. Capetele firelor urmăresc rotația reală a bobinelor; convenția bornelor secundare ține cont de sensurile opuse ale fluxului în cele două coloane. Primarul și secundarul rămân izolate galvanic. Sursa AC ilustrează tensiunea impusă de fluxul prescris al modelului ideal.

Corectat și controllerul: deschiderea circuitului transformatorului nu mai resetează timpul/faza sursei. Regresie browser adăugată: tensiune neschimbată la comutare, i₂=P₂=0 în gol, i₂=u₂/R după reînchidere, Pin=Pout. Arhiva autonomă regenerată; opt teste fizice trecute.

## Corecția circuitului generatorului și verificarea fotografiei

Fotografia utilizatorului reprezintă transformatorul: bornele comune sunt necesare conexiunilor în paralel, nu componente electrice suplimentare. Schema sa include sursa AC pe primar și sarcina comutată pe secundar, cu voltmetre independente.

Generator: două inele colectoare solidare rotorului, două manșoane izolante față de ax și două perii fixe în contact geometric cu inelele. Eliminat întrerupătorul decorativ nelegat la conductoare; adăugate sarcina R și un întrerupător în serie cu aceasta. Voltmetrul U este în paralel la perii și rămâne conectat în gol; indicația sa folosește `state.voltage`, nu `state.emf`. Explicații RO/EN pentru cele două inele/perii și distincția U=e−ri. Verificate cele 10 teste de model Faraday/generator; test browser nou pentru tensiunea la borne, circuit deschis fără resetarea fazei și Pmec=PR+Pcupru. Arhiva offline regenerată. Dispozitivele tactile fizice rămân netestate.

## Audit final — 4 noiembrie 2026

Revizuite cele cinci activități, formulele, unitățile, semnele, cazurile de referință, traseele circuitelor, sincronizarea stării cu animația/graficele și explicațiile RO/EN.

Corecții finale:
- Generator: energia se integrează pe fiecare interval cu starea reală a întrerupătorului. Deschiderea/reînchiderea nu șterge energia acumulată și nu atribuie retroactiv lucru mecanic intervalelor în gol. Regresie browser inclusă; W=Q_R+Q_r.
- Magnet și bobină: firele urmăresc capetele înfășurării la schimbarea razei; ampermetrul are contacte explicite. Câmpul urmărește centrul magnetului, iar curbele dipolului sunt dimensionate pentru scenă.
- Schimbarea parametrilor anulează ținta de deplasare veche și începe o măsurare nouă.
- Electromagnet: sursa indică +/−/0 și butonul selectat are aria-pressed. Explicația RO/EN precizează U=0 la descărcare și bucla închisă prin R; nu reprezintă deconectarea completă a bobinei.

Rezultate: `npm run check` — 369/369 teste trecute; sintaxă, build și arhivă offline reușite. Scriptul browser complet a trecut: mouse, touch CDP emulat, formule, întrebări, RO/EN, navigare, 100 combinații de afișare, comutarea sarcinii la transformator/generator, energia acumulată și arhiva file:// fără cereri HTTP externe. Alte 36 verificări la minim/maxim ale parametrilor: stări numerice finite și fără erori JavaScript. Capturile tuturor celor cinci scene au fost inspectate.

Performanță, câte 600 cadre, Chrome/1366×768/DPR1: p95 total magnet 3,5 ms; bobină 8,8 ms; RL 5,3 ms; transformator 6,3 ms; generator 6,7 ms. Intervalul dintre cadre p95 16,8–16,9 ms. Măsurători locale ale execuției JavaScript și trimiterii randării, nu garanție de performanță pe alte dispozitive. Ajustarea finală a întinderii curbelor dipolului păstrează numărul de primitive din măsurătoare.

Dovezi locale: `outputs/faraday-final-audit-check.log`, `outputs/faraday-browser-qa.json`, `outputs/faraday-extremes.mjs`, capturile scenelor. Limitele fizice ale modelelor ideale și limitele de testare rămân cele de mai sus: fără telefon/tablă fizică, Safari/Firefox, teste de ore sau validare pedagogică externă. Scrolarea verticală la ecrane joase/text mărit rămâne necesară.

## Suportul magnetului și testarea tactilă — 4 noiembrie 2026

Corectată levitația aparentă: magnetul rămâne pe axa bobinei (y=1 în scena schematică), baza căruciorului are fața inferioară la y=0,05, exact la fața superioară a șinelor. Tija unește baza cu corpul magnetului. Verificat vizual în Chrome.

Corecție tactilă: scenele RL/transformator/generator permit acum derulare verticală prin `touch-action: pan-y`; magnetul și bobina receptoare păstrează glisarea obiectelor cu `touch-action: none`. Gesturi CDP de derulare verificate explicit pentru toate cele trei activități pe 390×844 și 820×1180.

Test nou `scripts/qa/faraday-touch.mjs`: 360×800, 390×844, 844×390, 768×1024, 820×1180, 1024×768, 1180×820; DPR2, touch emulat Chrome, portret/peisaj. Toate cele cinci activități: pornire/pauză, pas, reset, ± parametri, sursa RL, circuit deschis/închis. Traseul include glisarea magnetului, anulare tactilă, glisarea sliderului, rotire, RO/EN și text mărit. 41 apăsări pe configurație, 44 evenimente pointer tactile de încredere; 287 apăsări și 308 evenimente în total. Fără erori JavaScript sau depășiri orizontale. Selectarea activității/limbii este programatică; nu este validarea selectorului nativ al unui sistem mobil.

Capturi: `outputs/faraday-touch-*.png`; rezultate: `outputs/faraday-touch-qa.json`; derulare: `scripts/qa/faraday-touch-scroll.mjs`. Scripturile folosesc PRAXIS_PLAYWRIGHT_MODULE dacă Playwright nu este disponibil în proiect și serverul local pe portul 4205.

Limite: ADB nu arată niciun dispozitiv conectat; Maestro expune numai emulatoare oprite. Agent Device are o eroare de daemon. Nu s-au modificat configurările dispozitivelor. Testarea de mai sus reprezintă emulare tactilă în browser, nu verificare pe telefon/tabletă fizică, Android Chrome real sau iOS Safari. Derularea verticală a paginii rămâne necesară pe mobil.

La inspecția capturilor de telefon s-au corectat și acțiunile prea înguste: grilă adaptivă cu minimum 9rem pe buton, două coloane când încap și una la text mărit. Valorile măsurate folosesc aceeași adaptare în loc de patru rânduri obligatorii. Nu s-au micșorat fonturile sau țintele tactile. Testele tactile și verificarea offline au fost reluate după ajustare.

## Comenzi lângă animație și explicația redării

La lățimi ≤850 px, panoul existent de comenzi este mutat imediat după scena 3D, înaintea explicațiilor, valorilor și graficelor. La lățimi mai mari revine în coloana din dreapta. Se mută același nod DOM, păstrând evenimentele, parametrii și timpul; regresia tactilă verifică distanța panou–scenă și păstrarea stării la rotire.

În activitatea statică „Magnet și busolă”, Pornire se numește „Înregistrează”: avansează timpul măsurării, fără a deplasa automat magnetul. Indicație explicită în RO/EN și secțiune „Ce fac comenzile?” pentru Pornire/Pauză/Pas/Reset. Celelalte activități păstrează numele Pornire.

Verificat în cele șapte configurații tactile telefon/tabletă, portret/peisaj, RO/EN și text mărit. Panoul este imediat după scenă pe telefon și tableta în portret; pe tableta lată rămâne alături. Testarea este emulată în Chrome, nu pe dispozitive fizice. Arhiva offline regenerată.

## Animație vizibilă în timpul reglajelor

Scena reală WebGL rămâne sticky sub antet pe telefon (≤850 px), iar pe tabletă lată (851–1180 px) rămâne fixată în coloana vizuală, întinsă pe înălțimea comenzilor. Nu se dublează canvasul sau timpul simulării. Înălțimea previzualizării se adaptează spațiului disponibil; în peisaj devine mai mică. Scroll-padding rezervă loc deasupra câmpurilor, iar poziția folosește înălțimea actualizată a antetului comun.

În teste au fost corectate două suprapuneri: min-height moștenit care împiedica micșorarea canvasului în peisaj și limita coloanei vizuale care ascundea scena sub antet la ultimii parametri pe tabletă.

Script nou `scripts/qa/faraday-sticky.mjs`: atinge succesiv reglajele în pickup/RL/transformator/generator și verifică numeric că întregul canvas rămâne între antet și marginea de jos a viewportului. Trecut la 390×844, 844×390, 820×1180, 1024×768 și 1180×820. Capturi locale `outputs/faraday-sticky-*.png`. Suita tactilă existentă (șapte configurații), rotirea și verificarea web/offline a celor cinci scene au trecut. Teste Chrome cu touch emulat; tastatura mobilă și hardware-ul fizic nu au fost validate.

## Sondă: evitarea magnetului și extinderea deplasării

Adăugat `public/shared/faraday-probe.js`: aceeași limitare pentru glisare mouse/touch, săgeți, slider și câmp numeric. Zona exclusă dreptunghiulară conservatoare include amprenta magnetului, raza sondei și un mic joc; coordonatele nu pot plasa sonda în magnet. Protecția geometrică a scenei nu modifică formula câmpului dipolar.

Domeniul devine x∈[−0,40;0,40] m și y∈[−0,20;0,40] m. Camera activității Magnet și busolă este mai înclinată și încadrează zona superioară; celelalte activități își păstrează perspectiva. Planul de sprijin este extins, iar sonda și magnetul au suporturi. Explicații RO/EN actualizate.

Test de grilă pentru zona exclusă și limite, plus opt teste fizice: 9/9 trecute. `scripts/qa/faraday-probe.mjs`: desktop 1600×1000, telefon 390×844 și tabletă 820×1180; coordonate numerice, tastatură, mouse/touch emulat, fără suprapunere și cu deplasare efectivă peste y=0,20 m. Arhiva offline regenerată. Hardware mobil fizic netestat.
