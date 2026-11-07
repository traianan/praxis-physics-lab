# Condensatorul

> Integrat și corectat în Praxis · Fizică la 6 noiembrie 2026. Documentația actuală a distribuției integrate, modelului, timpului adaptiv, sunetului comun și verificărilor: [raport de integrare](../docs/CONDENSATORUL_2026-11-06.md). Secțiunile de mai jos descriu proiectul inițial; interfața și distribuția curentă sunt generate prin `npm run import:capacitor`.

Site didactic interactiv despre **condensatoare**, la nivel de liceu (fizică).
Totul rulează static în browser: HTML, CSS și JavaScript, fără build step, fără backend,
fără cont și fără colectare de date.

Inspirat vizual și pedagogic de
[PhET — Capacitor Lab: Basics](https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics_all.html),
dar rescris de la zero cu un limbaj vizual propriu (temă întunecată „laborator de fizică premium”).

---

## Structura proiectului

```
index.html          Pagina de start (hero animat + căi de învățare)
teorie.html         6 capitole de teorie + calculator + grafic RC + test
laborator.html      Simularea interactivă pe canvas
resurse.html        Fișă de formule, glosar, linkuri externe
css/style.css       Design system complet (temă, componente, responsive)
js/sound.js         Motor de sunet sintetizat (Web Audio API)
js/main.js          UI comun: nav, comutator sunet, slidere, toast, formatare SI
js/hero.js          Animația din hero (ciclu încărcare/descărcare)
js/teorie.js        Calculatoare, grafic RC animat, quiz, cuprins activ
js/lab.js           Motorul simulării din laborator
```

Fără dependențe npm. Singurele resurse externe sunt fonturile Google
(Sora, Inter), încărcate cu `@import` în CSS.

---

## Pagini și funcționalități

### `index.html` — Acasă
- Hero cu **canvas animat**: ciclu automat încărcare (4,2 s) → menținere (3,4 s) →
  descărcare (3,2 s) → pauză. Sarcinile +/− apar progresiv, liniile de câmp se
  animează, particulele circulă pe fire, bateria e desenată simbolic.
- Citire live sub canvas: `Q = … µC · U = … V`.
- Carduri de navigare, „fapte rapide”, CTA.

### `teorie.html` — Teorie
| # | Capitol | Conținut |
|---|---------|----------|
| 1 | Ce este un condensator | armături, dielectric, simbol |
| 2 | Capacitatea electrică | `C = Q/U`, faradul și submultiplii |
| 3 | Condensatorul plan | `C = ε₀εᵣS/d`, tabel cu dependențele |
| 4 | Dielectricul | tabel εᵣ pentru 7 materiale, rigiditate dielectrică |
| 5 | Energia câmpului | `W = CU²/2`, densitate de energie |
| 6 | Încărcare / descărcare | `τ = RC`, formule, tabel 1τ…5τ |
| 7 | Grupare | serie vs. paralel (reguli inverse față de rezistoare) |
| 8 | Calculator | 3 moduri: condensator plan, RC, energie |
| 9 | Testează-te | 7 întrebări cu feedback + explicație |

- **Cuprins sticky** cu evidențierea secțiunii active la scroll (IntersectionObserver).
- **Calculator** cu 3 tab-uri și actualizare în timp real; rezultate formatate cu
  prefix SI și virgulă zecimală românească.
- **Grafic RC animat** (`rcCanvas`): curbă exponențială desenată progresiv,
  asimptotă, marker τ la 63,2 % / 36,8 %, comutator încărcare/descărcare, replay.
- **Quiz**: 7 întrebări, stare `correct`/`wrong`, explicație afișată, inel de scor
  cu `conic-gradient`, buton de reluare.

### `laborator.html` — Laborator interactiv
Simulare pe un singur canvas (`#labCanvas`, spațiu de desenare 900×600, scalat).

**Model fizic** (`js/lab.js`):
```
C  = ε₀ · εᵣ · S / d          (S în cm², d în mm în UI)
Q  crește:  Q += (C·E − Q)/τ · dt
Q  scade:   Q += (−Q/τ) · dt
U  = Q / C
W  = ½ · C · U²
E_câmp = U / d
τ_real = R · C                 (R = 1 MΩ, afișat în panoul de măsurători)
```
τ din animație este **dilatat** (slow-motion), pentru că τ real pentru aceste
capacități este de ordinul microsecundelor. Valorile fizice afișate sunt exacte.

**Controale:**
- Tensiunea sursei E — 0…24 V
- Conectat / Deconectat (întrerupător real, desenat pe circuit)
- Viteza animației — 0,25× … 4×
- Aria armăturii S — 20…600 cm² (schimbă înălțimea plăcilor)
- Distanța d — 0,5…20 mm (schimbă golul dintre plăci)
- Dielectric — 6 materiale (aer, poliester, hârtie, sticlă, apă distilată, ceramică)
  cu animație de inserare și hașură
- 6 presetări rapide
- Butoane: **Încarcă**, **Descarcă**, **Pauză**, **Reset**, **Inserează/scoate dielectric**

**Afișaje:** C, Q, U, W sub canvas; τ, câmp E, 5τ și Q_max în panoul lateral;
grafic dual U/E și I/I_max cu fereastră glisantă de 10 s.

**Misiuni (6):** încarcă >95 %, descarcă <5 %, inserează dielectric, aria ≥400 cm²,
deconectează + depărtează plăcile, încarcă la 24 V. Se marchează automat cu sunet.

**Experiment cheie:** încarcă → „Deconectată” → mărește `d`. Q rămâne constant
(sarcina e blocată pe armături), C scade, deci **U crește** — exact opusul
comportamentului cu sursa conectată.

### `resurse.html` — Resurse
Fișă de formule (4 tabele), constante fizice, glosar de 8 termeni, linkuri externe
(PhET, Falstad, Wikipedia, All About Circuits, Khan Academy) cu `rel="noopener noreferrer"`.
Pagină pregătită pentru print (antetul, meniul și controalele dispar la `@media print`).

---

## Sunet

`js/sound.js` sintetizează toate sunetele cu **Web Audio API** — nu există fișiere
audio, deci nu există cereri de rețea.

| Funcție | Folosită pentru |
|---------|-----------------|
| `tap()` | orice buton, link de meniu |
| `click()` | primul gest (deblochează AudioContext) |
| `hover()` | hover pe carduri / presetări (doar desktop) |
| `slide(ratio)` | slider în timpul tragerii, frecvență ∝ poziție |
| `switchOn()` / `switchOff()` | întrerupător, reset |
| `charge()` / `discharge()` | sweep ascendent / descendent |
| `dielectric()` | inserarea izolantului |
| `chime()` | misiune îndeplinită, scor perfect |
| `correct()` / `wrong()` | răspuns la quiz |

**Stare activ / inactiv:** butonul de sunet din antet are `aria-pressed="true|false"`,
iconiță cu unde care se estompează și o bară diagonală când e oprit. Starea se
salvează în `localStorage` sub cheia **`condensatorul.sound`** (`"on"` / `"off"`)
și se aplică la încărcarea oricărei pagini. Se emite evenimentul `cond:soundchange`.

---

## Accesibilitate și performanță

- HTML semantic (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`),
  un singur `h1` pe pagină, ierarhie corectă de titluri.
- `skip-link`, `aria-current="page"`, `aria-pressed` pe toate butoanele de tip toggle,
  `aria-label` pe butoanele cu iconițe, `role="img"` + `aria-label` pe canvasuri.
- Focus vizibil (`:focus-visible`) pe toate elementele interactive.
- `@media (prefers-reduced-motion: reduce)` oprește animațiile decorative.
- Canvasurile se redimensionează cu `devicePixelRatio` (max 2×) la `resize`;
  textul desenat se mărește pe ecrane < 560 px pentru lizibilitate.
- Zero dependențe JS externe; doar 2 fonturi web.

## Responsive

Trei praguri: **1080 px** (laboratorul trece pe o coloană, cuprinsul dispare),
**860 px** (meniu hamburger, griduri 2 coloane, readouts 2×2),
**640 px** (o singură coloană, padding redus). Verificat pe 1280 px și 390 px.

---

## Stocare și date

Singura persistență este preferința de sunet din `localStorage`
(`condensatorul.sound`). Nu există tabele, conturi, upload-uri sau date trimise
către un server. Rezultatele quiz-ului și starea simulării sunt doar în memorie
și se pierd la reîncărcare (intenționat — fiecare exersare pornește curat).

## Stare curentă și pași următori

**Implementat și verificat în browser (desktop + mobil):**
toate cele 4 pagini, animația din hero, simularea completă cu încărcare/descărcare/
geometrie/dielectric, graficul în timp real, calculatoarele, graficul RC animat,
quiz-ul, misiunile, sunetele și comutatorul de sunet, layout-ul responsive.

**Posibile extinderi:**
- Mod „provocare” cu probleme generate aleatoriu și verificare pas cu pas.
- Grupare serie/paralel vizuală (două condensatoare conectabile pe canvas).
- Export al măsurătorilor din laborator în CSV.
- Salvarea configurației preferate a laboratorului în `localStorage`.
- Versiune tipăribilă dedicată a teoriei, ca fișă de studiu.

## Publicare

Site-ul este static. Pentru a-l face public e nevoie de o **Hosted Deploy**
aprobată explicit de proprietar; până atunci linkurile de preview nu sunt „live”.
