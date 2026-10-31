# Audit responsive al laboratoarelor online — 31 octombrie 2026

Au fost verificate paginile publicate pe `https://praxis-physics-lab.vercel.app`, pornind de la commitul `bfc993d`. Auditul include toate cele 19 laboratoare, nu doar prima pagină a bibliotecii.

## Metodă și acoperire

Chrome cu emulare responsive/touch: telefon 390×844 px, tabletă portret 768×1024 px și tabletă peisaj 1024×768 px. Nu este o verificare pe hardware fizic sau în Safari. Au fost parcurse navigarea principală, subtaburile disponibile și selectorul de secțiune folosit pe ecrane înguste. Textul inițial în română și variantele în engleză au fost măsurate; verificarea aprofundată a taburilor folosește engleza pentru etichetele mai lungi.

Au fost evaluate **57 de configurații** laborator/dimensiune, însumând **689 de stări de navigare/afișare**, inclusiv stările inițiale RO/EN și unele selecții repetate. Nu sunt 689 de pagini distincte. Auditul nu acoperă fiecare combinație posibilă de parametri, fiecare stare animată sau fiecare acordeon închis.

Verificări: lățimea documentului, decuparea textelor vizibile, intersecția controalelor, dimensiunile Canvas/SVG și ale etichetelor, resurse HTTP eșuate, urmate de verificări vizuale ale cazurilor suspecte. Desenele Canvas sunt instrumentate doar în contextul izolat de audit; instrumentarea nu face parte din aplicația publicată.

| Laborator | Telefon 390 | Tabletă 768 | Tabletă 1024 |
| --- | ---: | ---: | ---: |
| [Oglinzi și lentile](https://praxis-physics-lab.vercel.app/simulari/oglinzi-si-lentile/index.html) | 4 | 4 | 4 |
| [Mișcarea rectilinie](https://praxis-physics-lab.vercel.app/simulari/miscarea-rectilinie/index.html) | 6 | 6 | 6 |
| [Unde mecanice](https://praxis-physics-lab.vercel.app/simulari/unde-mecanice/index.html) | 52 | 52 | 52 |
| [Calcul vectorial](https://praxis-physics-lab.vercel.app/simulari/calcul-vectorial/index.html) | 19 | 19 | 19 |
| [Viteza și accelerația](https://praxis-physics-lab.vercel.app/simulari/viteza-si-acceleratia/index.html) | 6 | 6 | 6 |
| [Mișcarea curbilinie plană](https://praxis-physics-lab.vercel.app/simulari/miscarea-curbilinie-plana/index.html) | 5 | 5 | 5 |
| [Noțiuni termodinamice](https://praxis-physics-lab.vercel.app/simulari/notiuni-termodinamice/index.html) | 21 | 21 | 21 |
| [Calorimetrie](https://praxis-physics-lab.vercel.app/simulari/calorimetrie/index.html) | 15 | 15 | 15 |
| [Principiul I al termodinamicii](https://praxis-physics-lab.vercel.app/simulari/principiul-i-al-termodinamicii/index.html) | 8 | 8 | 8 |
| [Interacții atomice](https://praxis-physics-lab.vercel.app/simulari/interactii-atomice/index.html) | 6 | 6 | 6 |
| [Aplicații ale principiului I](https://praxis-physics-lab.vercel.app/simulari/principiul-i-aplicatii/index.html) | 13 | 13 | 13 |
| [Transformări de stare de agregare](https://praxis-physics-lab.vercel.app/simulari/transformari-stare-agregare/index.html) | 14 | 14 | 14 |
| [Oscilatorul mecanic](https://praxis-physics-lab.vercel.app/simulari/oscilator-mecanic/index.html) | 7 | 12 | 7 |
| [Oscilatori mecanici cuplați](https://praxis-physics-lab.vercel.app/simulari/oscilatori-mecanici-cuplati/index.html) | 5 | 5 | 5 |
| [Compunerea oscilațiilor](https://praxis-physics-lab.vercel.app/simulari/compunerea-oscilatiilor/index.html) | 4 | 4 | 4 |
| [Figuri Chladni](https://praxis-physics-lab.vercel.app/simulari/figuri-chladni/index.html) | 4 | 4 | 4 |
| [Mișcarea circulară uniformă](https://praxis-physics-lab.vercel.app/simulari/miscarea-circulara-uniforma/index.html) | 9 | 9 | 9 |
| [Principiile mecanicii newtoniene](https://praxis-physics-lab.vercel.app/simulari/principiile-mecanicii-newtoniene/index.html) | 11 | 11 | 11 |
| [Motoare termice](https://praxis-physics-lab.vercel.app/simulari/motoare-termice/index.html) | 19 | 19 | 19 |

## Probleme confirmate și remediate

1. **Viteza și accelerația — cele trei laboratoare grafice.** Desenele logice de aproximativ 920 px erau micșorate la aproximativ 314 px, iar unele etichete ajungeau la 4 px. Desenele păstrează acum lățimea logică și dimensiunile de text prevăzute. Când nu încap, derularea este în interiorul figurii, cu indicație RO/EN și acces de tastatură. Pagina nu capătă derulare orizontală. Coordonatele și modelele sunt aceleași.
2. **Aplicații ale principiului I — graficele înguste.** În comparația valorilor experimentale, etichetele de gaze/clase ajungeau la aproximativ 6–7 px. Cele opt desene neinteractive păstrează acum scara proprie, cu aceeași derulare internă și explicație bilingvă. Molecula rotită prin atingere este exclusă din această schimbare, iar celelalte lecții care reutilizează helperul Canvas își păstrează comportamentul.
3. **Motoare termice — pragul din experimentul de compresie Diesel.** Explicația lungă în engleză depășea marginea graficului. Textul complet este tradus înainte de măsurare și împărțit pe rânduri, fără reducerea fontului de 11 px sau modificarea pragului/culorilor. Corecția există și în importer, pentru a supraviețui regenerării. Testul de regresie execută desenul real în RO/EN, Otto/Diesel și la lățimi de 320/340/720 px.
4. **Unde mecanice — rezonanța seismică pe tabletă portret.** Coloana fixă de 420 px a figurii lăsa aproximativ 209 px pentru două coloane de cursoare; butoanele −/+ se suprapuneau. Până la 1279 px, numai acest stand este așezat într-o singură coloană, cu figura deasupra comenzilor. Țintele tactile își păstrează dimensiunile.

## Rezultate de verificare

Cele patru laboratoare afectate au fost retestate local în toate cele trei dimensiuni: **12 configurații și 270 de stări**, fără overflow de document, decupări vizibile raportate, controale suprapuse sau texte Canvas în afara desenului în cazurile inspectate. Pentru diagramele derulabile, tăierea la marginea ferestrei de vizualizare este intenționată: întregul desen rămâne accesibil prin derulare.

În Viteza și accelerația, regiunea focalizabilă a derulat efectiv cu 40 px la ArrowRight; panningul tactil și zoomul nativ sunt permise, iar textul explicativ este tradus. Dimensiunea Canvas a rămas 920 px în regiunea de 330 px, fără lățirea documentului. În Aplicații, graficul experimental a rămas de 520 px, iar `molCanvas` nu a fost învelit în regiune de derulare.

`npm run build` a reușit. `npm run check`: **201 teste trecute, 0 eșecuri**, incluzând testele fizice, conservarea importurilor și noua regresie pentru caption. Reviewul independent al corecțiilor nu a identificat probleme care să blocheze publicarea.

## Semnale automate care nu sunt defecte vizibile

- Antetul sticky acoperă conținutul în timpul derulării; nu este o suprapunere între controale din același flux.
- KaTeX păstrează MathML ascuns pentru cititoare de ecran; textul vizibil al explicației fazorului încape în card.
- Copiii unui `details` închis pot avea dreptunghiuri de layout, deși nu sunt pictați. Verificarea folosește și `checkVisibility()`; controalele Newton vizibile nu se suprapun.
- Jurnalul undelor păstrează un desen static prin redimensionarea unei copii bitmap. Înregistrările textului trebuie raportate la bufferul existent în momentul desenării, nu la cel ulterior redimensionat.
- Indicii matematici și etichetele auxiliare mici au fost evaluate în context; nu au fost egalizate arbitrar cu textul principal. Culorile științifice, formulele și modelele nu sunt schimbate.

## Dovezi și repetare

`scripts/qa/production-responsive-audit.browser.js` se poate injecta ca initScript într-un context de browser izolat și expune `window.PraxisResponsiveAudit.run()`. Nu este copiat în `public/` și nu se încarcă pentru utilizatori.

Dovezile locale din `outputs/` (ignorat de Git): `production-responsive-baseline.json`, `production-responsive-local-fixes.json`, `production-responsive-after.json`, jurnalele `production-audit-*.log` și capturile `production-audit-*.png`. Raportul de după publicare consemnează rezultatul verificării în producție.
