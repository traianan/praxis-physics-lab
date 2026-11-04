# Legea lui Hooke — specificație și cerințe

Documentare înainte de implementare: 4 noiembrie 2026, prin Firecrawl (pagini accesate cu succes).

Actualizare solicitată înainte de publicare: viteza animației 0,1×…2×, implicit 1×. Ceasul folosește Δt_sim = viteză × min(Δt_real, 0,1 s); frecvența fizică, energia și viteza corpului în m/s rămân cele ale modelului. Schimbarea vitezei nu resetează starea, nu eliberează corpul și nu modifică pauza. Reglarea parametrilor păstrează viteza aleasă; Reset o readuce la 1×. Pasul manual rămâne +0,02 s simulate la orice viteză.

## Surse autoritare
1. University of Colorado Boulder, PhET, Hooke's Law: https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law_all.html — ecranele Intro, Systems, Energy; afișarea separată a forței aplicate și elastice, deformării, poziției nedeformate și energiei. Extracția accesibilă confirmă controalele, nu constituie testarea interactivă a PhET.
2. OpenStax / Rice University, College Physics 2e, §16.1: https://openstax.org/books/college-physics-2e/pages/16-1-hookes-law-stress-and-strain-revisited — forță restauratoare, constantă elastică și energia deformării.
3. OpenStax / Rice University, College Physics 2e, §7.4: https://openstax.org/books/college-physics-2e/pages/7-4-conservative-forces-and-potential-energy — lucru variabil, aria triunghiului, forță conservativă și energie mecanică.

Textele, exercițiile și desenele laboratorului sunt originale. Sursele sunt referințe științifice; nu se redistribuie codul, imaginile sau textele PhET/OpenStax.

## Model și unități SI
Resort orizontal fără masă, fixat la stânga, corp punctual cu masa m, plan fără frecare. Ox pozitiv spre dreapta. x = l − l₀, nu lungimea resortului; l₀ = 0,60 m. Resortul ideal respectă Fₑ = −kx, k > 0 în N/m, x în m, F în N. Greutatea și reacțiunea planului se compensează și nu efectuează lucru.

U(x) = kx²/2 [J], cu U(0) = 0. Lₑ(a→b) = k(a²−b²)/2 = −ΔU. În deformarea cvasistatică F_ap = kx și L_ap = ΔU; această egalitate a forțelor nu se generalizează la accelerare. Energia cinetică K = mv²/2, E = K + U. Puterea instantanee a forței elastice Pₑ = Fₑv [W].

După eliberare F_ap = 0, m x″ = −kx. ω = √(k/m) [rad/s], T = 2π/ω [s]. Condiții inițiale x(0)=x₀, v(0)=0; soluția x=x₀ cos(ωt), v=−ωx₀ sin(ωt), a=−ω²x. Același obiect observat furnizează scena, valorile, punctele de pe curbe și energia. Soluția analitică are cost constant și nu acumulează deriva energetică a unui integrator; precizia este limitată de aritmetica floating-point. Ceasul activ este suspendat în secțiuni ascunse și documente inactive; un cadru lung nu produce salt peste 0,1 s.

## Limite și condiții inițiale
Implicit: k=100 N/m, m=1 kg, x₀=0,10 m, t=0, repaus menținut, U=0,50 J. Comenzi: k 10…200 N/m, m 0,2…5 kg, x₀ −0,20…0,20 m; v₀=0 explicit. Intervalul x este domeniul didactic ales, nu limita elastică universală a unui material. Se presupune proporționalitate pe întreg intervalul; nu se simulează plasticitate, rupere, frecare, amortizare, masă de resort sau flambaj. Limita de proporționalitate și limita de elasticitate nu sunt sinonime. m=0, k≤0 și valori nefinite sunt respinse. Schimbarea parametrilor sau tragerea corpului începe o pregătire nouă la t=0; lucrul mâinii nu face parte din bilanțul oscilației libere. Pauza păstrează t; resetarea restabilește valorile implicite.

## Cerințe pentru liceu și integrare
- Capitol: Lucru mecanic, energie și putere; intrare din catalog, capitol și URL direct; navigare comună, RO/EN și preferințe păstrate.
- Experiment imediat vizibil: resort cu reper x=0, corp deplasabil prin Pointer Events, scară metrică, vector elastic și vector aplicat numai în pregătire.
- Comenzi cu slider, câmp numeric și reglaj ±, eliberare/pauză/continuare, pas 0,02 s și resetare. Model separat de renderer SVG; SVG păstrează claritatea la DPR variabil fără buffer Canvas.
- Grafice Fₑ(x) și U(x), puncte instantanee și aria lucrului extern 0→x în pregătire. Bare U/K/E cu scară comună și etichete SI. Curbele sunt proprietăți ale resortului; punctele sunt starea curentă.
- Explicații, două probleme rezolvate, activitate de măsurare k și verificare conceptuală. Formule prin PraxisMath; resurse locale, fără dependențe de rețea pentru rulare.
- Distincții: x≠l; semnul minus indică sensul; energia nu este kx și nu este negativă la compresie; L≠F_final·x pentru forță variabilă; la x=0 viteza poate fi maximă; în oscilația liberă nu există forță externă echilibrantă. Conservarea impulsului corpului nu se aplică din cauza suportului fix.

## Referințe numerice independente
| Situație | Rezultat |
|---|---|
| k=100, x=+0,10 | Fₑ=−10 N, U=0,50 J, L_ap(0→x)=0,50 J |
| k=100, x=−0,10 | Fₑ=+10 N, U=0,50 J |
| k=100, x=0,20 | Fₑ=−20 N, U=2 J (dublarea x: F×2, U×4) |
| k=100, a=0,10, b=0,20 | Lₑ=−1,50 J |
| k=100, m=1, x₀=0,10 | ω=10 rad/s, T=0,6283185307 s, E=0,50 J |
| t=T/4 în cazul precedent | x≈0, v=−1 m/s, K=0,50 J, U≈0, P≈0 |
| t=T/8 în cazul precedent | x≈0,0707107 m, v≈−0,707107 m/s, P=5 W |
| x₀=0, v₀=0 | repaus perpetuu, F=U=K=E=P=0 |

## Validare planificată
Teste model: referințe, compresie, simetrie, limite acceptate/respinse, m pozitiv, periodicitate, E constant și ΔK=Lₑ, P=dK/dt. Browser: mouse și tactil emulat, pause/resume/reset/drag, câmpuri invalide, traduceri, taburi, navigare, mod tablă, sunet comun, text 200%, cele cinci viewporturi din regulile proiectului. Măsurare timp randare și intervale rAF; rezultate și limite în raport separat. Publicarea nu este inclusă implicit: regulile proiectului cer solicitare explicită.
