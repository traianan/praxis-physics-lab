# Biblioteca Praxis Fizică — Laborator de descoperire

Implementată la 31 octombrie 2026, după aprobarea direcției și a designului.

## Rezultat

Biblioteca are o introducere petrol profund, titlu ivory/mentă și o ilustrație vectorială originală. Acțiunea mentă deschide laboratorul existent Oglinzi și lentile. Fundalul cald, pictogramele colorate ale capitolelor, tipografia și acțiunile petrol diferențiază nivelurile paginii. Introducerea se compactează în capitole și căutare. Sidebarul rămâne accesibil pe desktop și se deschide peste antet pe mobil.

`public/library.css` este încărcat exclusiv în bibliotecă. `compact.css` rămâne în lecții, dar regulile sale istorice de catalog nu mai intervin în bibliotecă. Rolurile opționale de culoare din `links.css` permit acțiuni contrastante; valorile implicite ale linkurilor din lecții rămân identice. Copiile inline din paginile publice sunt regenerate prin build, nu editate individual.

Nu s-au adăugat dependențe, servicii de fonturi, animații continue sau conținut educațional nou. Simulările și culorile științifice nu sunt modificate.

## Verificare

- `npm run build`: reușit.
- `npm run check`: 200 teste trecute, 0 eșecuri; include verificările sintactice din scriptul proiectului.
- Testul serverului a întâmpinat inițial `EACCES` la conexiunea loopback în sandbox, inclusiv în verificarea de bază. Rularea autorizată în afara sandboxului a trecut complet, fără modificarea testului sau a serverului.
- Browser: pagina principală, Mișcare (6 rezultate), capitol fără conținut, căutare cu rezultat și fără rezultat, reset, grilă/listă, RO/EN.
- Revenire prin legătura reală Bibliotecă din optică: capitolul Lumină și radiații, căutarea `lentile` și afișarea Listă au fost restaurate. Accesul direct din introducere folosește același mecanism de memorare a stării.
- Mod tablă: pornire, ascunderea bibliotecii normale, afișarea comenzilor existente și ieșire.
- Panou mobil: poziționare peste antet, activarea/dezactivarea `inert` și revenirea focusului pe butonul Capitole.
- În versiunea finală, la lățimile 1440, 1024, 851, 768, 650, 390 și 320 px, cu interfața în engleză: fără derulare orizontală a paginii, fără titluri tăiate și ținte pentru acțiunile din conținut de minimum 44 px.
- Titlul lung Electricity, magnetism and circuits verificat separat la 320 și 851 px.
- Preferința pentru mișcare redusă: tranziții de 0 secunde. Fără imagini neîncărcate sau mesaje de eroare/avertizare în consola bibliotecii inspectate.
- Review independent al codului: fără probleme importante sau minore raportate. Reviewerul nu a putut deschide o a doua conexiune Chrome; verificarea vizuală și funcțională a fost efectuată de implementator prin conexiunea Chrome activă.

## Contrast

| Pereche | Raport aproximativ |
| --- | --- |
| Titlu ivory pe zona cea mai luminoasă a introducerii | 7,27:1 |
| Descriere pe aceeași zonă | 5,44:1 |
| Titlu mentă pe aceeași zonă | 5,60:1 |
| Textul acțiunii pe mentă | 9,26:1 |
| Text ivory pe acțiunea petrol | 6,54:1 |
| Descrieri pe card | 5,85:1 |
| Text secundar pe ivory | 5,41:1 |
| Numărul capitolului pe card | 4,61:1 |

Eticheta mică aurie a fost luminată de la `#e8b85c` la `#f3cb80`, astfel încât să treacă 4,5:1 chiar și pe cel mai luminos capăt al gradientului. Accentul decorativ auriu păstrează `#e8b85c`.

## Dovezi locale

Capturile și jurnalele sunt păstrate în `outputs/`, ignorat de Git:

- `discovery-desktop.png`: compoziția principală la 1440 px.
- `discovery-experiments.png`: cardurile laboratoarelor.
- `discovery-mobile.png`: pagina principală la 390 px.
- `library-discovery-qa.json`: măsurători responsive ale versiunii finale.
- `library-discovery-build.log`, `library-discovery-check-full.log`: rezultatele comenzilor.

Implementarea a fost pregătită în folderul proiectului, pe ramura `codex/library-discovery`. Ulterior, la 31 octombrie 2026, utilizatorul a cerut explicit urcarea tuturor modificărilor pe GitHub; această cerere autorizează commitul și pushul pe ramura respectivă.

## Ajustări cerute după previzualizare

Ultimul rând din sidebar este „Simulări interactive de fizică” în RO și „Interactive physics simulations” în EN. Indicatorul tehnic „Rulează local” / „Bibliotecă interactivă” a fost eliminat din antetul comun al bibliotecii, lecțiilor și paginilor informative. Originea locală sau online nu mai este prezentată drept informație de navigare.

După ajustări: build reușit, verificări sintactice pentru controllerele modificate și 11 teste de traducere/acoperire trecute. Verificare în browser în RO/EN a textului final și a antetului fără indicator în bibliotecă, optică și pagina Despre, fără erori de consolă în pagina inspectată.
