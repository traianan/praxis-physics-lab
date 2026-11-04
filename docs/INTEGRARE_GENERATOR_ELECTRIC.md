# Generatorul electric — integrare și verificare

Actualizat: 4 noiembrie 2026. Laborator integrat local în capitolul **Electricitate, magnetism și circuite**. Identificator: `generator-electric`. Biblioteca conține 20 de laboratoare. Distribuția statică se construiește din `public/` în `dist/`; nu s-a efectuat o publicare remote.

## Model și surse

Alternator monofazat cu bobină rotativă în câmp uniform, ales explicit de utilizator. Motorul analitic este separat de randare în `public/shared/generator-model.js`; nu depinde de DOM, Three.js sau FPS.

θ=θ₀+ωt; Φ=BA cos θ pe spiră; e=−d(NΦ)/dt=NBAω sin θ. Pentru circuit închis rezistiv: i=e/(R+r), u=Ri; pentru circuit deschis: i=0 și u=e. La viteză impusă, Pmec=ei=i²R+i²r și τem=−NBAi sin θ. Energia este integrată analitic, într-o formă stabilă pentru intervale mici și ω aproape de zero. Metoda evită deriva unui integrator dependent de pașii animației.

SI: B în T, A în m², flux în Wb, ω în rad/s, t în s, e/u în V, i în A, rezistențe în Ω, puteri în W, energii în J, moment în N·m. N este adimensional. Ipoteze: spire rigide identice, câmp uniform impus, viteză impusă, inductanță neglijată și sarcină pur rezistivă. Nu sunt modelate frecarea, saturația, reacția de armătură sau variația termică a rezistenței.

Condiții inițiale: pauză, t=0, θ₀=0, N=100, B=0,5 T, A=0,01 m², ω=10π rad/s, R=20 Ω, r=2 Ω, circuit închis, energii nule. Reset restabilește această stare. Parametrii se schimbă în pauză și încep o măsurare nouă. Limba, paleta și dimensiunile nu modifică starea fizică.

Documentarea prin Firecrawl a utilizat patru pagini de la două instituții:

- [University of Colorado Boulder — PhET Generator](https://phet.colorado.edu/sims/html/generator/latest/generator_all.html): referință didactică. Geometria sa cu magnet rotativ nu este identificată numeric cu modelul bobinei rotative.
- [OpenStax — Electric Generators and Back Emf](https://openstax.org/books/university-physics-volume-2/pages/13-6-electric-generators-and-back-emf): modelul alternatorului și tensiunea sinusoidală.
- [OpenStax — Faraday’s Law and Lenz’s Law](https://openstax.org/books/college-physics-2e/pages/23-2-faradays-law-of-induction-lenzs-law): inducție, sensuri și conservarea energiei.
- [OpenStax — Force and Torque on a Current Loop](https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop): momentul electromagnetic.

Observația critică despre exemplul OpenStax 13.6 este păstrată în lecție: valoarea de circa 131,6 V este vârful instantaneu la sfârșitul sfertului de rotație; media pe acel interval este circa 83,78 V. Nu se preiau imagini, texte de lecție sau cod PhET/OpenStax. Specificația completă, cu limite și concepții greșite, este în `docs/superpowers/specs/2026-11-03-generator-electric-design.md`.

## Scenă, circuit și formule

Scena este o compoziție HyperFrames cu timeline GSAP finit și pus pe pauză, căutat după faza modelului; Three.js randează geometria. Există un singur ceas fizic în controller. Timeline-ul nu rulează independent. Bibliotecile și notificările de licență sunt incluse local; laboratorul nu solicită resurse externe la rulare.

După cererile vizuale ale utilizatorului, aparatul folosește piese opace și zece repere numerotate, cu legendă separată. Nu mai există rețeaua de linii de indicație sau casete A/V peste aparat. Înfășurarea are un cadru izolator deschis. Două inele continue, izolate reciproc, se rotesc cu arborele; periile sunt fixe. Traseele pornesc din aceleași coordonate `CONTACTS` ca bornele instrumentelor și ale rezistorului. Rezistorul are o spirală continuă, capete metalice și conexiuni fără spațiile vizibile din prima versiune.

Ampermetrul ideal este în serie. Voltmetrul ideal este legat la bornele generatorului, astfel încât măsoară e și la circuit deschis. În circuit închis, tensiunea măsurată este și tensiunea sarcinii. Culorile conductoarelor identifică firele, nu un sens permanent al curentului. Numărul de spire desenate este reprezentativ, în timp ce N este parametrul fizic afișat.

Formulele statice, rezolvările și valorile instantanee folosesc **PraxisMath**, cu indici, puteri, fracții și unități structurale MathML. Numerele au virgulă în RO și punct în EN. Relațiile lungi se pot continua la semnele =/≈ pe ecrane înguste, inclusiv la text 200%, fără micșorarea textului. Intrarea în secțiunea Explicații în timpul redării actualizează formulele la starea fizică în care experimentul este suspendat.

Surse principale:

- `public/simulari/generator-electric/app.js`: controller și conținut;
- `scene3d.js`: geometrie, instrumente, repere și căutarea timeline-ului;
- `assembly-geometry.js`: borne comune, trasee și spirala rezistorului;
- `view.js`: grafice și citiri;
- `lesson-math.js`: notație explicită și rezolvări;
- `public/locales/labs/generator-electric/ui/`: RO/EN;
- `scripts/build-generator-composition.mjs`: împachetare autonomă pentru CLI-ul HyperFrames.

## Verificări executate

Motorul și geometria au cinci teste dedicate, pe lângă testele existente ale aplicației. Sunt verificate cazurile de referință, B/A/N/ω nule, circuit deschis, scurtcircuit cu r>0, inversarea rotației la același unghi, scalări de amplitudine/frecvență, derivata independentă a fluxului, conservarea puterii și energiei, sarcina netă pe perioadă și integrarea prin cuadratură. Traseele exterioare ajung la contactele hardware, iar întrerupătorul deschis întrerupe calea serie.

Referință: Emax=15,707963268 V, Eef=11,107207345 V, Imax=0,713998330 A, Uef=10,097461223 V, f=5 Hz, T=0,2 s. Puterile medii utile/interne/mecanice sunt 5,097936158 / 0,509793616 / 5,607729773 W. Energia mecanică pe perioadă este 1,121545955 J.

Verificări în Chrome 156 pe Windows:

- mouse nativ și touch nativ emulat: Pas, Reset, Pornire/Pauză, −/+, gest pe slider și circuit deschis; evenimente pointer de încredere confirmate;
- preseturi de repaus, câmp nul, sens invers, circuit deschis și scurtcircuit;
- grafice și citiri de referință; două inele, perii fixe, zero piese transparente, fază geometrică și normală corecte la sfert de perioadă;
- RO→EN→RO păstrează starea, șase răspunsuri de verificare și feedbackul lor sunt bilingve;
- formatarea matematică a problemelor: patru fracții, 13 structuri cu indici, trei structuri cu puteri, zero erori de randare în ambele limbi; verificare suplimentară la 390×844, text 100%/200%, fără depășirea cardurilor formulelor;
- 96 de combinații: patru secțiuni, două limbi, text 100%/200%, la 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 DPR 2 și 3840×2160 DPR 1; fără overflow orizontal al paginii;
- Home→laborator, revenire canonică la capitol și refresh, intrare directă, intrare/ieșire din Mod tablă, păstrarea timpului/parametrilor, sunet activ/inactiv între laborator și capitol și comenzile după aceste schimbări;
- fără erori JavaScript sau cereri externe la rulare.

Performanța a fost măsurată separat de testele complete: circa 11 s, 1366×768, DPR 1, Chrome headless. 590 cadre; cost median de randare/submisie CPU 7,6 ms, p95 11,6 ms; interval median 16,7 ms, p95 16,8 ms; 19 intervale peste 33,3 ms. Ținta p95 a costului sub 16,7 ms este atinsă pe această configurație; rezultatul nu garantează aceeași performanță pe toate dispozitivele.

Compoziția împachetată trece `hyperframes@0.9.9 check` pentru runtime, layout, mișcare și contrast. Rămâne un avertisment de organizare a timeline-ului: cadrul inline conține scena și legenda, în locul unui fișier separat de subcompoziție. Nu este o eroare de randare sau de suprapunere.

Comenzi și artefacte reproductibile: `npm run check`, `npm run build`, `scripts/qa/generator.playwright.mjs`, `scripts/qa/generator-navigation.mjs`, `scripts/qa/generator.browser.js`. Rezultatele numerice ale browserului și navigării sunt păstrate și în JSON-urile alăturate acestui raport; capturile și logurile locale sunt în `outputs/`.

## Limite de verificare

Nu au fost testate touch-ul pe un telefon sau o tablă fizică, Safari/iOS, cititoare de ecran reale ori publicarea pe site-ul live. Suspendarea la schimbarea secțiunii este verificată; revenirea reală din BFCache și dintr-o filă ascunsă nu are încă o verificare de browser concludentă și nu este raportată drept trecută. Testele de performanță nu izolează timpul GPU. Nu există un MP4 livrat: produsul cerut este laboratorul interactiv și compoziția sa editabilă.
