# Laboratorul electromagnetic Faraday — specificație aprobată

Data: 4 noiembrie 2026. Destinație: Praxis-Fizica, licee din România.
Stare: aprobată de utilizator și implementată. Rafinare ulterioară aprobată: scene 3D cu aspect premium. Rezultatele și limitele verificării: [raport](../../FARADAY_VALIDARE_2026-11-04.md).

## Surse autoritare consultate prin Firecrawl

1. University of Colorado Boulder, **PhET — Faraday’s Electromagnetic Lab**:
   https://phet.colorado.edu/sims/html/faradays-electromagnetic-lab/latest/faradays-electromagnetic-lab_all.html
   Acces reușit: cele cinci ecrane sunt magnet, bobină receptoare, electromagnet, transformator, generator. Extragerea textului nu constituie test interactiv al simulării. Linkul utilizatorului afișează adresa Generator, dar ținta sa este acest laborator complet; ținta a fost consultată.
2. OpenStax / Rice University, **College Physics 2e, 23.2 — Faraday’s Law of Induction: Lenz’s Law**:
   https://openstax.org/books/college-physics-2e/pages/23-2-faradays-law-of-induction-lenzs-law
   Fundament: semnul inducției și conservarea energiei. Răspunsul țintit Firecrawl a folosit și conținut indexat la 3 noiembrie 2026.
3. OpenStax / Rice University, **University Physics Volume 2, Chapter 13 — Summary**:
   https://openstax.org/books/university-physics-volume-2/pages/13-summary
   Fundament: unitatea fluxului, inducție, generator cu bobină rotativă.
4. OpenStax / Rice University, **University Physics Volume 2, 15.6 — Transformers**:
   https://openstax.org/books/university-physics-volume-2/pages/15-6-transformers
   Fundament: raportul tensiunilor și curenților, bilanț energetic, ipotezele transformatorului ideal.
5. MIT, **Inductance and Magnetic Energy, Chapter 11**:
   https://web.mit.edu/viz/EM/visualizations/coursenotes/modules/inductance.pdf
   Fundament: inductanță proprie și mutuală, energie magnetică și circuite RL. Extragerea PDF are unele artefacte tipografice; ecuațiile se confruntă cu dimensiunile și bilanțul energetic.

Acestea sunt cinci documente din trei instituții, nu cinci instituții independente. Textele, exercițiile și desenele aplicației vor fi originale; sursele rămân citate. Nu se copiază codul, imaginile sau activele PhET/OpenStax. Formulele pentru dipol de mai jos sunt derivări pentru geometria aleasă, nu o afirmație despre motorul intern PhET.

## Abordări și decizia propusă

- **Recomandare: laborator propriu, analitic, cu cinci activități.** Se integrează în componentele Praxis, include toate resursele local și poate fi verificat numeric. Refolosește motorul generatorului existent. Aproximările sunt explicite.
- Încorporare PhET: acces rapid la simularea originală, dar dependență externă și control limitat asupra limbii, aspectului și concordanței cu modelele Praxis. Nu satisface integrarea completă cerută.
- Solver 3D de câmp și circuite cuplate: fidelitate geometrică mai bună, dar cost de calcul și validare disproporționat pentru obiectivele liceale.

Recomandarea este alegerea tehnică propusă, încă neconfirmată de utilizator. Nu se modifică generatorul existent pentru a-i schimba geometria.

## Obiective și activități

Elevul prezice, măsoară și explică legătura dintre variația fluxului, tensiune, curent și energie. Conținut RO/EN, notație școlară românească și SI; nu se afirmă o certificare de conformitate cu o programă școlară oficială neauditată.

| Activitate | Manipulare și observații |
|---|---|
| Magnet și busolă | Poziționarea sondei, inversarea polarității, vector B și busolă; câmpul static singur nu implică inducție |
| Magnet și bobină | Deplasare axială prin tragere, apropiere/îndepărtare automată, N, raza bobinei, rezistență, circuit deschis; Φ, e, i și puterea |
| Electromagnet | Alimentare, inversarea tensiunii și descărcare prin rezistor; continuitatea curentului, B și energia magnetică |
| Transformator ideal | Numere de spire, frecvență, amplitudinea fluxului și sarcină; tensiuni și curenți primar/secundar, puteri |
| Generator | Același motor analitic ca `public/shared/generator-model.js`, bobină rotativă în câmp uniform; acces și la laboratorul existent |

Navigare: Experiment / Explicații și formule / Probleme / Verificare și surse. Selectarea celor cinci activități este explicită. Fiecare are o predicție înaintea măsurării, un caz numeric și feedback explicativ. Nu se confundă generatorul cu bobină rotativă cu geometria PhET cu magnet rotativ.

## Contract fizic comun

Normala pozitivă n și sensul pozitiv al înfășurării se afișează împreună, prin regula mâinii drepte. Curentul desenat este convențional. Φ este fluxul unei spire; λ = NΦ este fluxul înlănțuit.

- Φ = ∫ B·n dA; pentru câmp uniform Φ = BA cos θ. θ este unghiul cu normala, nu cu planul spirei.
- e = −dλ/dt. Pentru un interval: e_med = −Δλ/Δt; nu se etichetează o medie drept valoare instantanee.
- Circuit rezistiv închis: i = e/Rtot. Circuit deschis: i = 0, tensiunea în gol e poate fi nenulă. Rtot > 0.
- P = ei = Rtot i² pentru modelul rezistiv; energia este integrala puterii.
- SI: x și a [m], A [m²], t [s], v [m/s], B [T], Φ și λ [Wb], e/U [V], i [A], R [Ω], L/M [H], energie [J], putere [W], forță [N], moment [N·m], ω [rad/s], f [Hz], moment magnetic m [A·m²]. N este adimensional.
- μ0 ≈ 4π·10⁻⁷ H/m este aproximația școlară utilizată, nu o constantă SI exactă.

### Magnet și bobină

Magnet mic reprezentat prin dipol punctual m, pe axa unei bobine circulare de rază a. Câmp exterior:

B(r) = μ0/(4πr³) [3(m·r̂)r̂ − m].

Nu se desenează câmp în regiunea exclusă a magnetului; busola se aliniază cu B local, iar la B = 0 orientarea este nedefinită. Liniile sunt reprezentări ale câmpului, nu traiectorii materiale.

Pentru distanța axială pozitivă x dintre dipol și planul bobinei:

Φ(x) = μ0 m a² / [2(a²+x²)^(3/2)],

g(x) = dΦ/dx = −3μ0 m a²x / [2(a²+x²)^(5/2)],

e = −Ng(x)v; F_em = Ni g(x); F_em v = −ei.

Acest flux rezultă din integrarea câmpului dipolar pe discul bobinei; nu se înlocuiește cu B din centrul bobinei înmulțit cu aria. Domeniu UI propus: a = 0,02–0,08 m, x = 0,10–0,50 m, N = 1–500, |m| ≤ 10 A·m², Rtot = 1–100 Ω, |v| ≤ 0,2 m/s. Dimensiunea fizică presupusă a magnetului ≤ 0,01 m; dipolul este o aproximație de câmp îndepărtat. Magnetul nu traversează bobina în acest model.

Tragerea este interpolată între eșantioane la timp fizic; viteza este limitată și deplasarea urmează limita efectivă. Nu se derivează poziția în pixeli direct pentru tensiune. La oprire v = 0, deci e = i = 0. Inversarea polarității sau schimbarea parametrilor configurează un experiment nou la t = 0; nu se pretinde modelarea unui impuls instantaneu.

În pauză, tragerea configurează poziția unui nou experiment: t și contoarele revin la zero, v=e=i=0; mesajul de stare explică acest lucru. În rulare, tragerea produce mișcare fizică și inducție; încetarea gestului impune v=0. Pauza fără tragere păstrează instantaneul anterior, etichetat „instantaneu înghețat”, fără acumulare de energie. La capătul cursei, mișcarea se oprește și v=e=i=0; nu se menține o viteză incompatibilă cu poziția limitată. Presetul interactiv folosește x=0,25 m. Cazul numeric la x=0,10 m este limita dinaintea opririi, nu starea de după oprire.

Se neglijează autoinductanța bobinei receptoare: valabil când L/Rtot este mult mai mic decât timpul variației fluxului. Energia vine din lucrul agentului care deplasează magnetul. Se afișează puterea mecanică necesară −F_em v, egală cu disiparea; nu se pretinde simularea completă a câmpului și energiei magnetului permanent.

### Electromagnet

Model concentrat RL liniar: L di/dt + Ri = U, cu R > 0 și L > 0.

Pentru U constant pe interval: i(t0+Δt) = U/R + [i(t0)−U/R] exp(−RΔt/L).

λ = Li; Φ = Li/N; B_med = Li/(NA), pentru miez ideal și flux uniform în secțiunea A. W_B = Li²/2; Ui = Ri² + dW_B/dt. L este parametrul efectiv dat al circuitului magnetic, nu calculul unui solenoid de aer cu geometrie desenată arbitrar. Scena este schematică, iar B_med este media în miez; nu se afișează o hartă exterioră numerică derivată dintr-un alt model.

Alimentare oprită înseamnă comutare pe buclă închisă de descărcare R, cu U = 0, nu întrerupere ideală fără cale pentru curent. i rămâne continuu. Nu se includ saturație, histerezis, pierderi în miez ori arcuri electrice. Domeniul va păstra |B_med| ≤ 0,5 T; avertismentul de model liniar rămâne vizibil. Detaliile de autoinducție sunt extensie pentru profesor.

### Transformator ideal

Flux comun impus Φ(t) = Φ0 cos(ωt), cu ω = 2πf; e1 = N1Φ0ω sin(ωt), e2 = N2Φ0ω sin(ωt).

Convenții de borne concordante: u2/u1 = N2/N1 unde u1 ≠ 0; relația fără împărțire u2 N1 = u1 N2 rămâne valabilă la trecerea prin zero. i2 = u2/Rs; i1 = (N2/N1)i2, cu i1 definit ca intrând din sursă și i2 ca ieșind spre sarcină. p_in = u1i1 = u2i2 = p_out. Valorile efective sinusoidale sunt vârf/√2.

Cuplaj perfect, pierderi și curent de magnetizare neglijate; sarcină rezistivă. Nu se rezolvă un sistem de inductanțe cu matrice singulară pentru k = 1. Nu se oferă alimentare în tensiune continuă în acest model: f = 0 înseamnă flux impus constant, tensiuni și curenți nuli. Nu înseamnă că un transformator conectat la o baterie are un regim sigur sau fără curent. Informația despre inducția mutuală e2 = −M di1/dt se explică separat, fără a o amesteca cu i1 de sarcină al transformatorului ideal.

### Generator

θ = θ0+ωt; Φ = BA cos θ; e = NBAω sin θ; i = e/(R+r).
τ_em = −NBAi sin θ; −τ_emω = ei = i²R+i²r. Se reutilizează calculul analitic de energie existent. Limite: mișcare impusă, câmp uniform, sarcină rezistivă, autoinductanță neglijată.

## Condiții inițiale și cazuri numerice

Toate activitățile pornesc în pauză, t = 0, cu contoarele energiei transferate la zero; aceasta nu afirmă absența energiei câmpului magnetului permanent sau a câmpului impus. Pornirea alimentării RL este un eveniment explicit. Reset restabilește presetul și golește istoricul. Schimbarea aspectului sau limbii nu resetează nimic. Schimbarea activității suspendă timpul și păstrează starea acelei activități.

| Caz | Date | Rezultat de referință |
|---|---|---|
| Flux uniform, rampă | N=200, A=0,01 m², B: 0,1→0,3 T în 0,5 s, θ=0, R=10 Ω | e=−0,8 V; i=−0,08 A; P=0,064 W |
| Dipol, apropiere | m=1 A·m², a=0,05 m, x=0,10 m, N=100, v=−0,1 m/s, Rtot=10 Ω | Φ=1,123970357 μWb; e=−0,269752886 mV; i=−26,97528857 μA; F_em=+72,76661933 nN; P=7,276661933 nW |
| Dipol staționar | Aceleași date, v=0 | Φ nenul; e=i=P=0 |
| RL la o constantă de timp | U=10 V, R=10 Ω, L=0,1 H, N=200, A=0,001 m², i(0)=0 | τ=0,01 s; i(τ)=0,632120559 A; W_B=0,0199788200 J; W_sursă=0,0367879441 J; Q=0,0168091241 J |
| RL descărcare | i(0)=1 A, U=0, aceleași R,L | i(τ)=0,367879441 A; energia inițială 0,05 J se disipă integral la t→∞ |
| Transformator | N1=200, N2=100, Φ0=0,001 Wb, ω=100 rad/s, Rs=10 Ω | U1ef=14,14213562 V; U2ef=7,071067812 V; I1ef=0,353553391 A; I2ef=0,707106781 A; Pmed=5 W |
| Generator existent | N=100, B=0,5 T, A=0,01 m², ω=10π rad/s, R=20 Ω, r=2 Ω, θ0=0, t=0,05 s | e=15,70796327 V; i=0,713998330 A; Pmec=11,21545955 W |

Presetul transformatorului începe la flux maxim și e1=e2=0. Presetul generatorului este cel existent. Pentru magnet, m este orientat pe +x și normala bobinei tot pe +x. Pentru sondă, poziție inițială pe axă la 0,10 m; B_axial=0,2 mT pentru m=1 A·m². Valorile micro/nano sunt afișate cu prefixe SI, fără amplificare ascunsă.

Concepții greșite tratate explicit: flux mare nu înseamnă tensiune mare; Lenz se opune variației fluxului, nu întotdeauna câmpului; tensiunea poate exista fără curent; transformatorul nu multiplică puterea; magnetul nu este sursă nelimitată de energie; liniile de câmp nu sunt fire și curentul convențional nu reprezintă electroni parcurgând tot circuitul într-o perioadă.

## Metodă, arhitectură și consistență

Modele analitice pentru dipol, RL pe intervale constante, transformator sinusoidal și generator. Avantaje: semne controlabile, lipsa derivei numerice în timp, referințe exacte și independență de rata cadrelor. Nicio integrare Euler dependentă de randare. Pentru energia gesturilor arbitrare se folosește cuadratură pe intervale fizice, cu verificare prin înjumătățirea pasului; pașii nu provin din frame rate.

Module pure în `public/shared/faraday-model.js`, controler și randare separate în `public/simulari/laboratorul-electromagnetic-faraday/`. Aceste fișiere vor fi surse autoritative. Modelul nu citește DOM/Canvas. O stare fizică unică furnizează scena, graficele, citirile, formula substituită și explicația contextuală. Graficul și scena nu au ceasuri independente. În pauză se păstrează instantaneul; în activitatea de tragere oprirea mișcării fizice produce v=0.

Grafice cu axe și unități explicite, panouri separate pentru Φ [Wb], e [V], i [A]; cursor la același timp ca scena. Nu se suprapun mărimi diferite pe o scară fără etichete. Culori prin registrul comun Praxis/Vii. Numărul de spire desenate este reprezentativ; N numeric guvernează modelul. Luminozitatea sarcinii reprezintă puterea, etichetată schematic. Limitarea/redimensionarea scării vizuale nu schimbă măsurătorile.

## Integrare și acceptare

- Intrare în `public/catalog.js`, capitol `electricitate-magnetism-circuite`, dată 2026-11-04, imagine SVG originală și locală; registrul `lab-workspaces.json`, antetul, breadcrumb-ul și montarea comune.
- Traduceri complete JSON RO/EN, inclusiv grafice și accesibilitate; `PraxisMath`, `PraxisSound` și politica `PraxisCanvasResolution`. Nicio dependență CDN și nicio încorporare externă necesară funcționării.
- Scenă și grafice în stânga, comenzi în dreapta; experimentul activ încape pe desktop/tablă fără micșorarea textului. Pe telefon: ordonare verticală, ținte ≥44 px, ≥52 px în modul tactil, explicații pliabile.
- Start/Pauză/Reset, pas temporal și viteză de redare etichetată; Pointer Events cu capturare și tratare pointercancel. Slidere + câmp numeric + reglaj fin; toate funcțiile accesibile și cu tastatura.
- Filele inactive/documentul ascuns suspendă experimentul. Reîntoarcerea nu recuperează timpul petrecut în fundal și nu dublează requestAnimationFrame.
- `npm run check`, `npm run build`, verificare a distribuției `dist` și înregistrare/export autonom cu resurse și traduceri incluse. Publicarea pe serviciul online se raportează separat; conform regulilor proiectului nu se face push/deploy fără solicitare de publicare.

## Plan de validare și raportare

1. Teste model: toate referințele de mai sus; toleranță relativă 10⁻⁹ pentru expresii analitice, prag absolut specific unității lângă zero. Comparare independentă a e cu derivata numerică a λ, cu studiu de convergență; nu doar compararea funcției cu ea însăși.
2. Limite: m/B/N/v/ω=0 unde modelul le admite; polaritate și viteză inverse; circuit deschis; rezistență mare; x mare; continuitate RL la comutare; f=0 cu flux constant; raport 1:1 și ridicător/coborâtor. Parametri nefinți sau nevalizi respinși; zero Ω nu intră în modelul rezistiv fără rezistență internă.
3. Conservare: −Fv=Ri² la dipol; W_sursă=Q+ΔW_B în RL; p_in=p_out la transformator; −τω=i²(R+r) la generator. Pentru cuadratură, eroare relativă <10⁻⁴ și scădere verificată la înjumătățirea pasului.
4. Browser: intrare Home/capitol/URL direct și revenire; fiecare activitate, RO→EN→RO, text 100/200%, tablă, culori, Start/Pauză/Reset, valori și timp păstrate la schimbări de prezentare. Mouse și touch emulat; pointercancel și tragere în afara scenei.
5. Viewport-uri obligatorii: 3840×2160 DPR1, 1920×1080 DPR2, 1366×768, 1024×768, 390×844. Verificare vizuală și DOM: fără overflow orizontal, axe și comenzi lizibile, toate resursele locale încărcate.
6. Performanță: eșantion de minimum 600 cadre după încălzire, toate activitățile, raport p50/p95 pentru randare și intervale de cadre, rezoluție/DPR/browser/hardware consemnate. Țintă p95 randare <16,7 ms pe PC-ul de test, fără promisiune universală de 60 fps. Separat calcul model, randare și costul graficelor; istoric limitat și eșantionare adaptată. Verificare în fundal și timp de minimum 60 s pentru bucle/scurgeri evidente.

### Ce este verificat acum

Firecrawl a returnat sursele de mai sus; au fost citite regulile locale și modelul generatorului existent. Calcule independente în Python au verificat referințele dipol/RL/transformator: reziduul energetic dipol a fost 0, iar RL 3,47·10⁻¹⁸ J, în precizie double. Acestea verifică proiectarea, nu o implementare nouă.

Diferențele centrate aplicate independent fluxului dipolar confirmă tensiunea analitică: la pași spațiali 0,001 / 0,0005 / 0,00025 m, erorile relative sunt 1,73345·10⁻⁴ / 4,33341·10⁻⁵ / 1,08334·10⁻⁵ (convergență de ordinul doi); la 10⁻⁶ m eroarea este sub 10⁻⁸. Referințele pentru rampa uniformă și generator au fost recalculate separat și concordă cu tabelul.

Revizuirea independentă a proiectării nu a identificat erori în ecuații sau valori. Observațiile privind tragerea în pauză, oprirea la capătul cursei și sensul contoarelor energetice inițiale au fost integrate mai sus.

### Ce nu este încă verificat

Codul nou nu este implementat. Nu sunt efectuate teste de integrare, randare, performanță, mouse, touch, traduceri, distribuție sau publicare pentru acest laborator. Dispozitivele fizice Android/iOS și tabla fizică vor fi menționate separat de emulare. Auditarea programei școlare oficiale și fidelitatea geometrică față de un magnet real nu sunt demonstrate de această documentare.
