# Praxis rafinat — aplicare și verificare

Data: 1 noiembrie 2026. Utilizatorul a ales macheta A și a cerut aplicarea în bibliotecă și laboratoare. Schimbarea este locală; nu s-a publicat pe GitHub/Vercel.

## Ce s-a schimbat

- Paletă comună petrol/ivory, mentă temperată `#C5E8A5`, text secundar `#586D63`; fonturile existente, locale.
- Biblioteca: titlu echilibrat, metadate și descrieri mai lizibile, carduri compacte pe telefon, ilustrație adaptată aceleiași palete.
- Laboratoare: introducere petrol mai compactă, tab activ petrol cu reper mentă, taburi inactive discrete, bară de preferințe pe suprafață ivory, raze și contururi consecvente.
- Antet: Bibliotecă și Ghid arată ca navigare pe desktop; meniul mobil și controalele native sunt păstrate.
- Optica regenerată prin `sync:optics`; cele 18 arhive autonome de curs și pachetul local reconstruite. Nu s-au modificat motoarele, formulele sau culorile științifice.

## Verificare în browser

- Biblioteca: 1440 px, 1024 px, 390 px și 320 px; cele șapte capitole rămân accesibile. La 320 px am reprodus și corectat depășirea titlului „termodinamică”; după corecție toate cardurile au `scrollWidth === clientWidth`.
- Căutare „motoare”, afișare listă/carduri, stare fără rezultate și revenire la catalog: funcționale. Textele și ordinea catalogului sunt cele existente.
- Toate cele 19 laboratoare: paletă și încadrarea paginii la 1440/390 px. Pentru 18 cursuri s-a verificat încărcarea în iframe; optica a fost verificată direct. Calcul vectorial a primit noua versiune după actualizarea workerului existent.
- Optica: scenă de 420 px pe desktop și 384 px pe telefon; Mod tablă la 1024×768 are scenă de 511 px și nu produce depășire orizontală.
- Biblioteca în Mod tablă la 1024×768: intrare/ieșire și încadrare păstrate.
- Motoare termice în EN la 390 px: taburi fără depășire și ținte de 52 px în Mod tactil.
- Mișcarea rectilinie: comutarea temei și controlul Mod tactil rămân funcționale; fundalurile proprii ale lecției nu au fost redesenate.
- Revizuire independentă a diferențelor: singura regresie semnalată a fost cardul la lățimi mici, corectată și reverificată în browser.

## Contrast calculat

| Pereche | Raport |
| --- | --- |
| Text principal / suprafață | 13,40:1 |
| Text secundar / ivory | 5,09:1 |
| Titlu deschis / petrol | 11,59:1 |
| Mentă / petrol | 8,61:1 |
| Text deschis / buton principal | 6,54:1 |
| Text închis / buton mentă | 8,92:1 |
| Etichetă aurie deschisă / petrol | 7,61:1 |

Valorile sunt pentru rolurile interfeței, nu reprezintă un audit integral al tuturor diagramelor existente.

## Comenzi

`npm run sync:optics`, `npm run package:local`, `npm run build` și `npm run check`. Verificarea inițială în sandbox a avut 200/201 teste trecute: testul serverului era blocat de `EACCES` la loopback. Cu acces la loopback, suita completă a trecut: **201/201**, fără eșecuri. Jurnalele sunt în `outputs/praxis-rafinat-*.log`, excluse din Git.

Aplicația locală: `http://127.0.0.1:4190/`. Varianta aprobată nu necesită dependențe sau servicii noi.
