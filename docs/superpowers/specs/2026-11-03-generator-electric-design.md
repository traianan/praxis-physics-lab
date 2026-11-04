# Generatorul electric — specificație pentru aprobare

Data: 3 noiembrie 2026. Stare: specificație aprobată de utilizator la 3 noiembrie; implementare locală și verificări actualizate la 4 noiembrie, în docs/INTEGRARE_GENERATOR_ELECTRIC.md.

## Scop și alegerea modelului

Laborator pentru liceele din România, integrat în Praxis-Fizica la „Electricitate, magnetism și circuite”. Elevul investighează inducția, alternanța tensiunii și conversia energiei mecanice în energie electrică. Interfață RO/EN, resurse locale, aceeași implementare servită online și local.

Au fost analizate două variante: bobină rotativă în câmp uniform (soluție analitică, relații verificabile direct) și magnet rotativ lângă bobină fixă (configurația PhET, câmp neuniform care necesită geometrie și calcul de flux suplimentare). Utilizatorul a ales prima variantă. PhET rămâne referință didactică externă; nu se prezintă cele două geometrii ca fiind același model cantitativ.

## Surse autoritare consultate prin Firecrawl

1. University of Colorado Boulder, **PhET — Generator**: https://phet.colorado.edu/sims/html/generator/latest/generator_all.html — pagină citită cu succes; controale pentru magnet, bobină, indicator, pauză și pas. Referință pentru explorare interactivă, nu etalon numeric al modelului ales.
2. OpenStax / Rice University, **University Physics vol. 2, 13.6**: https://openstax.org/books/university-physics-volume-2/pages/13-6-electric-generators-and-back-emf — bobină în câmp uniform, tensiune sinusoidală și dependența de viteza unghiulară.
3. OpenStax / Rice University, **College Physics 2e, 23.2**: https://openstax.org/books/college-physics-2e/pages/23-2-faradays-law-of-induction-lenzs-law — Faraday, Lenz, sensuri și conservarea energiei.
4. OpenStax / Rice University, **University Physics vol. 2, 11.5**: https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop — momentul forțelor asupra unei bobine parcurse de curent.

Sunt patru pagini, de la două instituții. Se păstrează URL-urile în resursele laboratorului. Explicațiile, desenele și codul vor fi originale; nu se împachetează codul, imaginile sau textele PhET/OpenStax.

Observație critică: exemplul 13.6 pentru N=200, B=0,80 T, raza 0,0500 m și un sfert de rotație în 0,0150 s numește valoarea de aproximativ 131 V „medie”. La rotație uniformă, aceasta este valoarea instantanee la finalul sfertului (vârful: 131,595 V); media corectă pe interval este NBA/Δt=83,776 V. Laboratorul va separa explicit valorile instantanee, maxime, medii și efective.

## Model fizic, SI și convenții

Bobină plană cu N spire identice, arie A pe spiră, câmp uniform B, axă de rotație perpendiculară pe B, două inele colectoare (fără redresare). Unghiul orientat θ este între normala pozitivă n a bobinei și B; sensul pozitiv al circuitului este dat de regula mâinii drepte față de n. Curentul convențional pozitiv în sarcină este indicat prin borne și săgeți consistente cu acest sens.

- θ(t)=θ₀+ωt; θ în rad, t în s, ω în rad/s. Se poate afișa suplimentar unghiul în grade.
- Φ(t)=BA cos θ: flux printr-o spiră, în Wb. Legătura de flux este Ψ=NΦ, în Wb (numărul de spire este adimensional).
- e(t)=−dΨ/dt=NBAω sin θ, în V; Emax=NBA|ω|.
- f=|ω|/(2π), în Hz; T=2π/|ω|, în s, numai pentru ω≠0.
- i=e/(R+r), în A; u=Ri, în V. R este sarcina, r rezistența internă, ambele în Ω.
- Eef=Emax/√2; Ief=Eef/(R+r); Uef=RIef. Valabile pentru regim periodic stabil, parametri constanți și circuit rezistiv închis.
- Putil=i²R; Pcu=i²r; Pmec=e i=Putil+Pcu, în W.
- τem=−NBA i sin θ, în N·m; τantrenare=−τem la viteză impusă; τantrenare ω=Pmec≥0 inclusiv când ω<0.
- Energia transferată, în J: Wmec=Wutil+Wcu. Pentru un segment cu parametri constanți, integrala sin²(θa+ωt) este Δt/2−[sin(2θb)−sin(2θa)]/(4ω). Se tratează ω=0 separat, fără împărțire la zero.

N adimensional; B în T; A în m². Unitățile se afișează separat de valori, în formatare RO/EN. T.e.m. e este tensiune, nu forță mecanică. La circuit deschis i=0, u=e, puteri și moment electromagnetic nule în acest model ideal. La scurtcircuit R=0, r>0: u=0, curent finit e/r, întreaga putere se disipă intern. R+r=0 este invalid și nu poate fi selectat.

## Ipoteze, limite și condiții inițiale

Câmp impus, uniform și constant; spire rigide; viteză impusă de un antrenor extern; sarcină pur rezistivă; inductanță proprie neglijată. Nu se simulează tranzitorii inductive, reacția de armătură asupra câmpului, saturație, încălzire cu schimbarea rezistenței, frecare, pierderi în fier sau alimentarea rețelei. Eficiența R/(R+r) privește numai pierderile Joule incluse; nu este randamentul unei mașini reale.

Propunere de domeniu: N=1…500, B=0…1 T, A=0,001…0,05 m², ω=−100π…100π rad/s, R=0…200 Ω, r=1…20 Ω. Aceste intervale sunt didactice, nu o fișă tehnică. B=0 și ω=0 sunt accesibile. Testele pure vor acoperi suplimentar N=0 și A=0. N nu modifică automat r: sunt parametri independenți ai modelului simplificat, precizați elevului.

Inițial: pauză, t=0 s, θ₀=0, N=100, B=0,5 T, A=0,01 m², ω=10π rad/s, R=20 Ω, r=2 Ω, circuit închis, energii zero, Φ=0,005 Wb, e=i=0. Reset restabilește toate acestea. Pasul avansează 0,005 s de timp simulat. Redarea implicită folosește factor didactic 0,1 s simulat/s real, afișat explicit; viteza unghiulară fizică rămâne cea selectată. Poate fi ales și timpul real, cu avertizare de alias vizual la frecvențe mari.

Modificarea parametrilor se face în pauză și începe o măsurare nouă, cu timp, unghi și energii resetate; interfața anunță regula. Nu se pretinde modelarea impulsurilor electrice ale schimbării bruște a B sau A. Limba, paleta, textul, redimensionarea și navigarea între secțiuni păstrează măsurarea. Documentul ascuns suspendă experimentul fără recuperarea timpului pierdut la revenire.

## Cerințe funcționale și pedagogice

Patru secțiuni: Experiment, Explicații și formule, Activități și probleme, Verificare și surse. Experimentul este accesibil imediat, cu scenă și grafice în stânga, comenzi în dreapta pe desktop; organizare verticală pe mobil. Se folosesc antetul, breadcrumb-ul, preferințele, țintele tactile și workspace-ul comune; text 200% rămâne lizibil și operabil.

Scena arată polii N/S, B, bobina rotativă, normala n, θ, inelele și circuitul rezistiv. Indicatorul luminos reprezintă didactic Putil; nu pretinde caracteristica unui bec incandescent. Săgețile arată curent convențional, cu oprire la i=0; sarcinile nu fac o rotație completă în fiecare alternanță. Sensul și proiecția normalei trebuie verificate independent de coordonatele ecranului.

Grafice separate Φ(t), e(t)/u(t) și i(t), cu axe, unități, legendă și cursor comun de timp. Nu se suprapun mărimi cu unități diferite pe o axă fără scară explicită. Citiri pentru valori instantanee, frecvență, valori efective, puteri și energii. Aceeași funcție fizică produce scena, punctele graficelor, citirile și substituțiile din formule. Curbele complete vor indica explicit că sunt predicții ale modelului; cursorul marchează timpul curent.

Comenzi: Pornire/Pauză, Pas, Reset, parametri numerici și slidere cu −/+, sens de rotație și circuit închis/deschis. Preseturi: referință, repaus, câmp nul, sens invers, circuit deschis, scurtcircuit. Nu se permite tragerea arbitrară a bobinei care ar produce o viteză incompatibilă cu modelul.

Activități: prezicerea efectului dublării N/B/A/|ω|; diferența flux maxim–tensiune maximă; circuit deschis; influența R asupra tensiunii la borne și pierderilor. Minimum două probleme numerice explicate și șase întrebări cu feedback RO/EN. Concepții greșite tratate: generatorul creează energie; un câmp constant nu poate induce tensiune într-o bobină rotativă; flux maxim înseamnă t.e.m. maximă; t.e.m. este mereu tensiunea la borne; tensiune implică automat curent; curentul alternativ înseamnă electroni care parcurg întregul circuit la fiecare perioadă; Lenz se opune întotdeauna câmpului, în loc să se opună variației fluxului.

## Arhitectură și metodă

Modul fizic ES separat, fără DOM/Canvas, cu validarea parametrilor, funcție de stare, avans temporal și energie analitică pe segmente. Un controller deține timpul și parametrii; renderer-ul primește numai starea calculată. Se alege metoda analitică deoarece soluția este exactă sub ipotezele de mai sus: elimină deriva de integrare și dependența rezultatelor de FPS. Evaluarea integralei energiei va folosi o formă stabilă sau dezvoltare locală pentru intervale foarte mici și |ω| aproape de zero; testele vor exclude energii negative din anulare numerică. Integrarea numerică este folosită doar ca verificare independentă, nu ca motor implicit.

Sursa noului laborator va fi în public/simulari/generator-electric/, cu motorul în public/shared/generator-model.js; public este sursa autoritativă pentru acest laborator original. Înregistrare în public/catalog.js, localizările catalogului și public/design-system/lab-workspaces.json. Resurse locale: HTML, CSS, JS, ilustrație SVG, traduceri și documentație. Se reutilizează PraxisMath, PraxisSound, paleta științifică și rezoluția Canvas comune; grafica SVG este acceptată pentru scena vectorială. dist se generează exclusiv la build. Nu sunt necesare servicii externe la rulare.

## Cazuri de referință și criterii de acceptare

Pentru condițiile inițiale: f=5 Hz, T=0,2 s, Emax=15,707963268 V, Eef=11,107207345 V, Imax=0,713998330 A, Uef=10,097461223 V. Puteri medii: utilă 5,097936158 W, internă 0,509793616 W, mecanică 5,607729773 W. Energie totală pe perioadă: 1,121545955 J.

| t (s) | θ | Φ (Wb) | e (V) | i (A) |
|---|---|---|---|---|
| 0 | 0 | 0,005 | 0 | 0 |
| 0,05 | π/2 | 0 | 15,707963268 | 0,713998330 |
| 0,10 | π | −0,005 | 0 | 0 |
| 0,15 | 3π/2 | 0 | −15,707963268 | −0,713998330 |
| 0,20 | 2π | 0,005 | 0 | 0 |

Testele vor verifica valori absolute la 1e−9 pentru tabel, cu toleranțe relative pentru mărimi foarte mari; zerourile trigonometrice se compară cu toleranță. Faraday se verifică și prin derivată centrală independentă. Inversarea ω la același θ inversează e și i, păstrează puterea și inversează momentul rezistent; compararea la același t cu θ₀=0 nu trebuie confundată cu acest test.

Limite: B=0, A=0, N=0 sau ω=0 dau e=i=P=0; repausul poate păstra flux nenul. Circuit deschis: i=P=τem=0, u=e. R=0 și r>0: curent finit, putere utilă zero. Se resping NaN, infinit, rezistență totală nulă și N fracționar. Dublarea N/B/A/|ω| dublează amplitudinea; dublarea |ω| dublează și frecvența. La ω=0 se afișează „fără oscilație” pentru perioadă, fără infinit brut.

Conservare: Pmec−Putil−Pcu≈0, Wmec−Wutil−Wcu≈0; integrala e dt și sarcina netă pe perioadă sunt zero. Energii monotone pentru sarcină pasivă; τem ω≤0. Verificare independentă a integralei sin² prin cuadratură. Aceeași stare după același timp simulat pentru secvențe de cadre diferite; schimbarea dimensiunii și limbii nu schimbă starea.

Browser: toate comenzile prin mouse, tastatură și touch emulat; Start/Pauză/Pas/Reset după RO→EN→RO și schimbarea modurilor; ascundere/revenire; navigare Bibliotecă/Capitol/Laborator inclusiv acces direct. Dimensiuni minime: 390×844, 1024×768, 1366×768, 1920×1080 la DPR 2 și 3840×2160 CSS px la DPR 1; suplimentar 768×1024 pentru orientare portret. Text 100%/200%, intrare/ieșire din Mod tablă, sunet între pagini și lipsa overflowului orizontal. Verificare vizuală a extremelor, semnelor, inelelor, axelor și citirilor. Resursele laboratorului trebuie să se încarce fără cereri externe. După testele modelului și interacțiunilor, se rulează npm run check și npm run build și se inspectează distribuția generată.

Performanță: măsurare după încălzire, minimum 10 s în redare; se raportează viewport, DPR, browser, număr de cadre, mediană/p95 ale intervalelor și costului de randare, cadre peste 33,3 ms. Țintă: p95 al costului de randare sub 16,7 ms pe desktopul testat; se raportează rezultatul real, fără extrapolare la toate dispozitivele. Bucla se suspendă când documentul/activitatea este ascunsă, iar graficele au eșantionare și memorie limitate.

## Verificat acum și rămas de verificat

Verificat înainte de implementare: patru pagini citite prin Firecrawl; structura statică și regulile proiectului; calcule independente Node.js pentru cazul de referință. Cu 10.000 de subintervale pe perioadă, cuadratura energiei diferă de formula analitică cu aproximativ 4,7e−15 J, sarcina netă este aproximativ 9,0e−18 C, reziduul maxim de putere aproximativ 3,4e−15 W. Acestea verifică specificația, nu o implementare care încă nu există.

Revizuire independentă a specificației: fără întrebări importante rămase și fără contradicții materiale identificate. Au fost confirmate necesitatea ramurii u=e la circuit deschis și evaluarea stabilă a energiei la intervale mici; ambele sunt incluse în cerințe.

Netestat încă: codul motorului, integrarea, build-ul, randarea, performanța și interacțiunile. Touch fizic pe telefon/tablă și Safari/iOS se vor marca netestate dacă nu sunt disponibile; emularea touch nu le înlocuiește. Publicarea pe site-ul live nu a fost efectuată. Raportul final al implementării va separa testele efectiv executate de criteriile planificate și limitările modelului.

## Actualizare vizuală cerută la 4 noiembrie 2026

Utilizatorul a cerut eliminarea rețelei de linii în favoarea numerelor și a unei legende, eliminarea pieselor transparente și clarificarea conexiunii consumatorului. Scena HyperFrames/Three.js folosește zece repere numerotate, piese opace, cadru izolator deschis în locul plăcii transparente, instrumente cu corp și borne și un rezistor cu spirală continuă legată la ambele contacte. Referințele geometrice ale firelor și bornelor provin din assembly-geometry.js; modelul fizic nu este schimbat.

Formatarea formulelor a fost corectată la cererea utilizatorului: PraxisMath în mod TeX/MathML, indici și puteri structurale, fracții suprapuse, separarea relațiilor lungi în fragmente care se pot continua pe rânduri și locale numerice RO/EN. Formulele instantanee se actualizează și când se intră în Theory în timpul redării.
