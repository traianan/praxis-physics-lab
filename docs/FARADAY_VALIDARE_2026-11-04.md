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
