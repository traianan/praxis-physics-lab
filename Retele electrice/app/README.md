# Rețele electrice — aplicație didactică interactivă

Aplicație web (HTML + CSS + JavaScript, fără dependențe externe) pentru nivel de liceu,
inspirată din manualul *Fizică, clasa a X-a*, §2.3 „Legile lui Kirchhoff” și
§2.4 „Gruparea rezistoarelor și a generatoarelor”.

## Pornire

Deschide `index.html` în browser (Chrome / Firefox / Edge).

Varianta recomandată (server local, pentru sunete și pointer events în toate browserele):

```bash
cd app
python3 -m http.server 8000
# apoi http://localhost:8000
```

## Conținut

**I. Legile lui Kirchhoff**
- Teorie: nod, latură, ochi de rețea, ambele legi, convenții de semn, numărul de ecuații independente (n−1 noduri, o = l − n + 1 ochiuri).
- Animație: nod cu 3 laturi, slidere pentru I₁, I₂, I₃, viteza electronilor, buton de echilibrare, întrerupător K cu sunet.
- Laborator: rețeaua cu 2 noduri / 3 laturi / 2 surse reale (E, r) din manual; aplicația rezolvă sistemul Kirchhoff în timp real și verifică rezultatul clasic I₁ = 2 A, I₂ = 1 A, I₃ = 3 A. Include rezolvare pas cu pas și cele 3 trasee pentru V_A − V_B.

**II. Gruparea rezistoarelor și a generatoarelor**
- Teorie: serie / paralel, rezistența echivalentă, generatorul real (U = E − I·r), grupări serie/paralel de generatoare, șunt și rezistență adițională.
- Laborator „tablou de circuite” cu **drag & drop**: sursă (E, r), rezistor, bec, întrerupător, ampermetru, voltmetru; conductori desenați cu mouse-ul, snap pe grilă, ștergere, rotire, inversare de polaritate, inspector de valori. Rețeaua este rezolvată numeric (analiză nodală modificată), deci curenții, tensiunile și becurile aprinse sunt corecte pentru orice montaj construit.
- Animație comparativă serie / paralel pentru n generatoare identice, cu graficul puterii utile P(R) și punctul de maxim R = r_grup.
- Șunt / rezistență adițională: calcul interactiv.

**Exersare**: 6 probleme rezolvate (2.3.1, 2.3.2, 2.4.1.1, 2.4.2.1, 2.4.2.2, 2.4.3) cu pași, răspuns și verificare numerică live + test rapid cu 8 întrebări.

## Sunete
Toate sunetele sunt sintetizate în browser (Web Audio API) — nu există fișiere externe:
închidere/deschidere întrerupător („clack” + bâzâit de 50 Hz), clic pe butoane, plasare piesă,
conectare conductor, răspuns corect / greșit. Se pot opri din butonul 🔊.

## Fișiere
```
index.html
css/style.css
js/core.js        utilitare, sunete, navigare, simboluri SVG
js/circuits.js    desene statice (hero, scheme)
js/kirchhoff.js   animația nodului + laboratorul Kirchhoff
js/grouping.js    generatoare serie/paralel, șunt, rezistență adițională
js/problems.js    probleme rezolvate + quiz
js/board.js       tabloul de circuite (drag & drop) + solver MNA
js/app.js         inițializare
```
