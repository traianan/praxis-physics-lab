# Compactare și animații — 27 octombrie 2026

## Evaluarea HyperFrames

Au fost citite skillurile HyperFrames disponibile și referințele pentru simulări/3D și runtimes. Contractul este pentru secvențe HTML transformate în video: desenare deterministă la `hf-seek`, fără requestAnimationFrame ca ceas, simulare pregătită înainte de randare. Lecțiile de aici răspund continuu la slidere, deget, sunet generat și, opțional, microfon. Înlocuirea acestor demonstrații cu secvențe video ar pierde interacțiunea sau ar dubla mecanismele și distribuția offline. Pentru animațiile existente nu s-a identificat un beneficiu practic al introducerii HyperFrames; nu s-a creat un proiect video și nu s-au instalat pachete. O animație video explicativă separată ar fi un alt tip de produs, necerut în această etapă.

S-au îmbunătățit în schimb animațiile native: ceas comun bazat pe durata reală între cadre, calibrat la viteza originală de 60 Hz pentru chitară, castron și xilofon. La 30/60/120 Hz progresul este identic. Cadrele de repaus ale castronului și xilofonului sunt oprite; programarea pentru secțiunile ascunse rămâne cea existentă. Sinteza audio, frecvențele și ecuațiile spațiale sunt păstrate. Schimbările sunt enumerate exact în `scripts/wave-animation-patches.json` și se inversează înaintea verificării SHA-256 a modulului original.

## Densitate

- Antete și margini comune mai compacte; textul și țintele de atingere nu sunt micșorate.
- Instrumente: desen limitat la dimensiuni rezonabile, analiză/comenzi alături, ajutor extensibil și indicatoare pentru graficele încă fără semnal.
- Unde: eliminate paddinguri/margini redundante, înălțimea minimă de ecran care lăsa un gol înainte de subsol și scalarea excesivă a desenelor. Desenele păstrează aspectul și sistemul logic de coordonate.
- Vectori: figurile 2D/3D și distanțele dintre secțiuni sunt mai compacte; meniul are înălțime proprie și poate fi derulat dacă este necesar.
- Mișcare: reduse marginile și paddingurile interioare, fără padding suplimentar pe containerele care au deja zone proprii.
- Catalog: carduri și previzualizări mai compacte. Modul tablă păstrează paginarea și regulile adaptive.
- Optică: antet/spațiere compacte; scena pentru construcția razelor rămâne disponibilă.

## Verificare

Comparația înainte/după pentru toate cele 37 de ecrane ale undelor, la același viewport, este în `compactness-audit.json`. Toate textele, temele, ecranele și controalele sunt păstrate. Au fost parcurse și cele 37 de ecrane EN la 390×844, DPR 2 și Mod tactil, fără overflow orizontal. Nu este un test pe echipament fizic.

La repaus au fost observate 0 cadre runnable pentru castron și xilofon. La lovirea xilofonului s-au modificat pixelii desenului și a apărut o buclă activă, care s-a oprit la sfârșitul animației. Sunetul global a rămas dezactivat în acest test. Testele automate verifică progresul la frecvențe diferite, pauzele de ceas, păstrarea codului sursă, mutarea ieșirii audio prin volumul comun și distribuția locală.

Rezultate finale la 1920×1080: chitară 1454→624 px (−57%), castron 1902→764 px (−60%), tobă 1297→677 px (−48%), xilofon 962→546 px (−43%). Catalogul, cele 4 secțiuni de mișcare și cele 14 secțiuni de vectori au fost parcurse fără overflow orizontal. Mod tablă optică la 640×360: scenă 630×295 px, fără derulare a paginii. Verificările automate au trecut: 26/26.
