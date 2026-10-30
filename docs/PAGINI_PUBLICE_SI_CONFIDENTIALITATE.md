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
