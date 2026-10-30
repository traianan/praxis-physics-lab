# Pagini publice și confidențialitate

Implementat la 30 octombrie 2026, pentru versiunea web publicată pe Vercel.

- `/despre/`: acces gratuit, Traian Anghel, profesor de fizică la Colegiul Național „Nicolae Iorga”, Brăila, România.
- `/contact/`: `contact@praxissciencelab.app`, fără formular sau serviciu de trimitere din aplicație.
- `/confidentialitate/`: datele didactice, preferințele locale, acordul, găzduirea și instrumentele audio.

Toate paginile au traduceri RO/EN, inclusiv title și descrierea meta. Titlurile și descrierile Open Graph rămân bilingve. Textele se întrețin în `scripts/site-pages.mjs`; `npm run build` regenerează paginile și namespace-ul `info`.

## Audit și comportament

Codul existent salva preferințe prin localStorage și istoricul testelor/progresul în Mișcarea rectilinie (`mr-teste`, `mr-test-lim`, `mr-probleme`). A fost introdus un control comun înaintea scripturilor aplicației. Răspunsurile și rezultatele nu mai sunt citite/scrise persistent; rămân doar în memoria paginii. Datele vechi din cele trei chei sunt eliminate la exprimarea alegerii. Preferințele din lista explicită pot fi memorate numai după acceptare; refuzul/retragerea elimină preferințele salvate. Starea de revenire în bibliotecă rămâne în sessionStorage.

Controlul este injectat în toate paginile HTML ale distribuției la build, înaintea scripturilor legacy; nu modifică sursele de proveniență ale lecțiilor. Fișierele individuale deschise prin file:// nu afișează bannerul și nu memorează preferințe noi fără acord. Arhivele autonome existente ale lecțiilor nu au fost regenerate prin această modificare; politica descrie aplicația web online.

Bannerul are opțiuni de acceptare/refuz cu aceeași evidență vizuală. Alegerea se memorează local 180 de zile, fără identificator de utilizator. Refuzul nu blochează laboratoarele. „Setări cookies” redeschide opțiunile din subsolul bibliotecii, al laboratoarelor și al paginilor informative. Dacă browserul interzice stocarea, alegerea funcționează pentru pagina curentă și este cerută din nou la o altă încărcare.

Nu au fost adăugate servicii de analiză, SDK-uri, publicitate, cookie-uri de urmărire sau un backend. Configurarea publicității rămâne inactivă. Textul distinge datele didactice de traficul tehnic procesat pentru livrarea și securitatea găzduirii și de mesajele trimise voluntar prin e-mail. Nu se afirmă că furnizorul de găzduire nu prelucrează IP-uri sau că mesajele de contact nu conțin date personale.

## Surse consultate

- [Your Europe — cookies și acord](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm): acord anterior pentru tehnologii neesențiale și retragere accesibilă.
- [Vercel — Privacy Notice](https://vercel.com/legal/privacy-notice): date tehnice și de utilizare a infrastructurii.

## Verificări

Teste de regresie pentru blocarea stocării înaintea acordului, acceptare, răspunsuri nepersistente, retragere, expirare și stocare indisponibilă. Verificare în Chrome pe mobil: banner și traducere, RO → EN, acceptare/refuz/retragere, navigare și pagini informative. Construirea distribuției și suita proiectului au fost rulate înainte de publicare.

## Termeni și meniu comun — 30 octombrie 2026

Pagina `/termeni/` este disponibilă în RO/EN și este legată din subsol. Acoperă accesul educațional gratuit, utilizarea responsabilă, ipotezele simulărilor, materialele și licențele, datele, disponibilitatea și contactul. Nu introduce taxe, cedări de drepturi sau renunțări la drepturi legale. Referință pentru redactare: https://europa.eu/youreurope/business/selling-in-eu/consumer-contracts-guarantees/consumer-contracts/index_en.htm.

Meniul superior este construit de `public/shared/site-navigation.js` și stilizat exclusiv prin `site-navigation.css`. Biblioteca, paginile informative și laboratoarele păstrează aceeași ordine, tipografie, culori, dimensiuni și poziție pentru Bibliotecă, ghid, starea aplicației, Mod tablă, sunet și limbă. Comenzile native își păstrează nodurile și evenimentele; comenzile specifice lecțiilor sunt sub rândul comun. Interfețele native dedicate Mod tablă păstrează comenzile proprii de ieșire. În paginile fără un mod de prezentare propriu, Mod tablă mărește textul pentru prezentare.

Pe ecrane de cel mult 1140 px, meniul se deschide din butonul hamburger de lângă siglă. Butonul de sunet, afișat ca pictogramă, și selectorul RO/EN rămân lângă hamburger, în afara panoului pliabil; celelalte comenzi sunt afișate vertical, fără derulare orizontală. Butonul expune aria-expanded și aria-controls; comenzile ascunse sunt inerte. Escape închide meniul și readuce focusul pe buton; apăsarea în afara antetului îl închide. Schimbarea limbii păstrează meniul deschis. La revenirea pe desktop comenzile sunt vizibile și active. Antetul rămâne sus la derulare. Subsolul cu pagini și setări cookies rămâne vizibil și în ferestrele cu înălțime mică. Dependențele comune sunt incluse și în cache-ul lecției de Calcul vectorial.

Verificări: 174/174 teste trecute; măsurarea în browser a pozițiilor, dimensiunilor și stilurilor în bibliotecă, toate cele patru pagini informative și cele 17 laboratoare; verificări RO/EN, mobil, ghid, Mod tablă și revenire în bibliotecă.


Actualizare meniu mobil: verificare la 320 px în toate cele 22 de pagini principale, deschidere/închidere, RO/EN, Escape, focus, click exterior și schimbarea dimensiunii ferestrei. Textul redundant „Informații despre aplicație” a fost eliminat din subsolul celor patru pagini informative și din dicționarele lor.

Selectorul de limbă este același element DOM la schimbarea dimensiunii ferestrei: pe desktop revine în bara de comenzi, iar pe mobil apare lângă hamburger. Nu este duplicat și își păstrează evenimentele și valoarea selectată. Verificat la 320 px în toate cele 22 de pagini: RO → EN fără deschiderea meniului, poziționare, lipsa depășirii și revenirea mobil → desktop → mobil.

Butonul de sunet folosește același nod și aceleași evenimente pe mobil și desktop. Pictograma are țintă tactilă de 44 × 44 px, stare aria-pressed și etichetă accesibilă RO/EN care explică activarea/oprirerea. La lățimi de cel mult 360 px, sigla este afișată prin simbolul său, pentru a păstra toate cele trei comenzi rapide pe același rând. Verificări: 22 de pagini la 320 px, activare/oprire fără deschiderea meniului și revenire mobil–desktop–mobil fără duplicare.
