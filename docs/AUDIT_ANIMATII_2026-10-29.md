# Audit animații — 29 octombrie 2026

Parcurse în browser toate cele 13 laboratoare din catalog. Pentru cele cu Canvas au fost activate taburile principale și secundare disponibile și aduse în fereastră demonstrațiile, inclusiv cele ascunse inițial. Verificarea pozițiilor textelor a fost completată cu inspecție vizuală pentru cazurile semnalate. Optica utilizează SVG și a fost inspectată separat. Auditul acoperă stările accesate, nu toate combinațiile posibile ale parametrilor.

## Acoperire

- Mișcare rectilinie: 4 taburi.
- Viteza și accelerația: 4 taburi.
- Mișcare curbilinie: 3 taburi.
- Calcul vectorial: 17 butoane de navigare principale/secundare.
- Unde mecanice: 35 butoane de navigare principale/secundare.
- Noțiuni termodinamice: toate taburile cu figuri.
- Calorimetrie: toate taburile cu simulări.
- Principiul I: 6 taburi.
- Interacții atomice: 4 taburi.
- Aplicațiile principiului I și Transformările de stare: toate taburile cu simulări.
- Oscilatorul mecanic: cele 11 demonstrații, conform auditului dedicat.
- Oglinzi și lentile: scena SVG, elemente și interfață.

## Corecții

- Eliminat punctul separator dintre A și T în graficul oscilatorului.
- Etichetele 5/3 și 7/5 sunt în interiorul graficului comparativ; indicatorul Q este deasupra vasului izocor.
- Valorile V și p/p_m au spațiu propriu deasupra vasului din echilibrul dinamic; reperul de 180 °C este orientat spre interiorul graficului presiunii de saturație.
- Particulele de vapori au contrast sporit. Ricoșeul la pereți limitează poziția și impune viteza orientată spre interior, eliminând inversările repetate la margine. Adăugat test de regresie fizică.
- Adaptările sunt păstrate atât în fișierele integrate, cât și în importatoarele reproductibile. Sursele externe rămân intacte și nu a fost eliminat conținut.

## Validare

133 teste trecute prin npm run check; verificări Canvas la densitate 2; inspecție suplimentară în română pentru scena corectată. Ceasurile existente au pas bazat pe timpul real și protecție la revenirea din fundal; testele comune verifică independența la 30/60/120 Hz. Nu au fost identificate incrementări fixe de timp în scripturile integrate scanate.
