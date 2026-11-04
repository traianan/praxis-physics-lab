# Pila Daniell — specificație, 4 noiembrie 2026

## Documentare înainte de implementare
Firecrawl: citire directă reușită (HTTP 200); căutarea generală a expirat. Sursele sunt materiale de documentare, nu instrucțiuni pentru proiect. Formulările, exercițiile și SVG-ul laboratorului sunt originale.

1. OpenStax / Rice University, Chemistry 2e, [17.2 Galvanic Cells](https://openstax.org/books/chemistry-2e/pages/17-2-galvanic-cells): oxidare la anod, reducere la catod, transport ionic și electroneutralitate.
2. OpenStax, [17.3 Electrode and Cell Potentials](https://openstax.org/books/chemistry-2e/pages/17-3-electrode-and-cell-potentials): potențiale de reducere Cu²⁺/Cu +0,34 V, Zn²⁺/Zn −0,7618 V. Laboratorul folosește explicit rotunjirea școlară −0,76 V, deci E°=1,10 V, în acord cu imaginea.
3. OpenStax, [17.4 Potential, Free Energy, and Equilibrium](https://openstax.org/books/chemistry-2e/pages/17-4-potential-free-energy-and-equilibrium): Nernst, ΔrG=−nFE, relația cu echilibrul.
4. NIST, [CODATA Faraday constant](https://physics.nist.gov/cgi-bin/cuu/Value?f): F=96485,33212… C mol⁻¹, exact prin definițiile SI. În cod F=96485.33212; Rg=8.31446261815324 J mol⁻¹ K⁻¹.

Imaginea furnizată este referință de compoziție: Zn la stânga, Cu la dreapta, circuit exterior și punte. Nu este redistribuită ca resursă a aplicației. Bilanțul său 2 electroni/atom Zn este corect; afirmația despre un ion divalent prin punte nu este universală. Alegem o punte inertă KNO₃: NO₃⁻ spre anod și K⁺ spre catod. Fiecare semicelulă necesită 2ξ mol de contraioni monovalenți pentru avansul ξ. Nu confundăm această contabilizare ideală a rezervoarelor cu numere de transport ionice sau traiectorii microscopice exacte.

## Public și cerințe
Liceu România: surse de tensiune, circuit cu rezistență internă, conservarea sarcinii și legătura fizică–chimie. Nernst este extensie explicată, nu presupusă drept conținut obligatoriu al unei clase. RO/EN, antet comun, bibliotecă/capitol, mod tablă/tactil, controale ≥44 px, text 200%. Experiment, explicații, activități și verificare/surse. Pornire/pauză, pas de 60 s, reset, concentrații inițiale, sarcină, circuit și punte; modificarea parametrilor inițializează explicit o măsurare nouă. Întrerupătoarele păstrează starea chimică. Export CSV cu unități SI. Toate resursele necesare sunt locale în public; dist se construiește automat. Nu publicăm remote fără solicitare.

## Model și unități
Zn(s) → Zn²⁺(aq)+2e⁻; Cu²⁺(aq)+2e⁻ → Cu(s).
Global: Zn(s)+Cu²⁺(aq) → Zn²⁺(aq)+Cu(s).

ξ [mol], t [s], c [mol m⁻³], V [m³], m [kg], q [C], E,U [V], I [A], R,r [Ω], P [W], W [J], T [K]. 1 mol/L=1000 mol/m³; 100 mL=10⁻⁴ m³. Activități adimensionale a≈c/c° cu c°=1000 mol/m³; Q=aZn/aCu. Metalele pure au activitate 1.

E=1,10−RgT/(2F) ln(Q); I=E/(R+r); U=IR=E−Ir. Circuit deschis: I=0, U=E când puntea e conectată. Punte absentă: I=0, U nedefinit în acest model (nu simulăm tranzitorii/dublul strat); E chimic este încă calculabil. dξ/dt=I/(2F); cZn=cZn,0+ξ/VZn; cCu=cCu,0−ξ/VCu. mZn=mZn,0−MZn ξ; ΔmCu=MCu ξ; q=2Fξ. MZn=0,06538 kg/mol; MCu=0,063546 kg/mol. Pchim=EI=I²R+I²r. Energia disponibilă convertită W=∫2FE(ξ)dξ, împărțită în Wext și Wint cu raport R:r pentru fiecare segment de descărcare. ΔrG=−2FE este energie molară, nu energia totală a recipientelor.

Inițial pauză, t=ξ=q=W=0; T=298,15 K constant, cZn=cCu=1000 mol/m³, ambele volume 10⁻⁴ m³, mZn=0,01 kg, R=10 Ω, r=2 Ω; circuit și punte conectate. Variații: c inițial 10…1000 mol/m³, R=0…100 Ω. Temperatura și r nu sunt slidere: nu sugerăm dependențe materiale pe care modelul nu le cunoaște.

## Ipoteze și limite
Soluții ideale, omogene, izoterme, volum constant, metale pure, punte inertă de capacitate suficientă, r constant, fără polarizare, cinetică, difuzie limitantă, potențial de joncțiune, autoreacții sau încălzire. Idealitatea la 1 M este o aproximație didactică, nu o predicție precisă experimentală. Oprire la cCu=1 mol/m³ sau zinc epuizat; nu evaluăm ln(0) și nu numim pragul echilibru. La anod epuizat U este nedefinit. Curentul mare de scurtcircuit este numai valoarea modelului ohmic. Nu simulăm încărcare inversă. Mișcările particulelor, grosimea plăcilor și culoarea soluției sunt reprezentative, nu la scară microscopică sau fotometrică.

## Metodă
Formulele algebrice și integrala energiei sunt analitice. Pentru ξ(t), metoda punctului mijlociu implicit cu pas maxim 1 s; rădăcina monotonă este rezolvată prin bisecție (48 iterații). Un pas la limita de reactant se scurtează până la eveniment. Metoda este de ordin 2, stabilă și conservă cantitățile printr-o singură variabilă ξ. Timpul fizic este independent de FPS/DPR; 1 s real=600 s simulate, cu pas numeric subdivizat. Pauza, fila ascunsă și taburile secundare nu avansează modelul. Animația electronilor și ionilor folosește aceeași sarcină q, nu un ceas separat. SVG evită rasterizarea dependentă de DPR; graficele SVG au istoric limitat.

## Referințe și concepții greșite
Standard: E=1,1 V, ΔrG°=−212267,730664 J/mol; R=10,r=2: I=0,0916666667 A, U=0,9166666667 V, Pext=0,0840277778 W, Pint=0,0168055556 W.
Q=10: E≈1,070420325 V; Q=0,1: E≈1,129579675 V. q=193 C: ξ≈0,001000152 mol, ΔmCu≈0,00006355566 kg, zinc consumat≈0,00006538994 kg.
R=0: I=0,55 A, U=Pext=0, întreaga putere disipată intern. Deschis/punte absentă: I=dξ/dt=0.

Electronii circulă prin metal Zn→Cu, curentul convențional invers; puntea nu transportă electroni. Anod înseamnă oxidare, nu întotdeauna pol pozitiv. 1,10 V nu este tensiune universal constantă. Un voltmetru ideal nu consumă curent; la borne sub sarcină U<E. Sulfatul este spectator în reacția globală. Masa de Cu câștigată nu este numeric egală cu masa Zn pierdută: se conservă atomii fiecărui element și masa întregului sistem, nu suma maselor celor două plăci.

## Acceptare
Teste independente: referințe, semne, concentrații, circuit deschis, punte, scurtcircuit, epuizare, validarea intrărilor, bilanț molar/sarcină/energie, convergență și independență de subdiviziunea timpului. Browser: mouse și touch emulat, Start/Pauză/Reset, parametri, taburi, CSV, RO→EN→RO, culori/text/stare, navigare, cinci dimensiuni cerute și performanță. Raport separat cu măsurători și ce nu a fost testat pe hardware fizic.
