# Ultimele laboratoare

Sub navigarea pe capitole și nota introductivă, biblioteca afișează trei linkuri către cele mai recente laboratoare. Titlurile și datele se adaptează la RO/EN. Linkurile se deschid în aceeași filă și păstrează contextul revenirii în bibliotecă, inclusiv capitolul, căutarea și modul de afișare.

## Data adăugării în aplicație

Metadatele sunt în `public/catalog.js`, lângă laborator:

```js
addedOn: '2026-10-30', // data primei integrări în aplicație, YYYY-MM-DD
addedOrder: 3         // ordinea integrării în acea zi; numărul mai mare este mai nou
```

`getLatestSimulations()` selectează în mod implicit trei laboratoare cu dată documentată, în ordine descrescătoare după `addedOn`, apoi după `addedOrder`. Nu modifică ordinea registrului folosită în capitole și în restul catalogului. Data este una calendaristică, fără o oră inventată. Nu se folosește data fișierului sau a ultimului commit și nu se schimbă la corecturi ulterioare ale laboratorului.

Pentru fiecare laborator nou, înregistrează data primei apariții și ordinea din acea zi. Lista se actualizează automat, fără editarea linkurilor din interfață. Pentru laboratoarele istorice fără dată verificată nu au fost inventate date.

## Situația documentată la 30 octombrie 2026

Conform înregistrărilor de integrare din README, în ordinea apariției:

1. Compunerea oscilațiilor — 30 octombrie 2026, `addedOrder: 1`.
2. Figuri Chladni — 30 octombrie 2026, `addedOrder: 2`.
3. Mișcarea circulară uniformă — 30 octombrie 2026, `addedOrder: 3`.

Lista din interfață afișează ordinea inversă, cu cel mai nou primul. Verificări: sortare și păstrarea registrului, RO/EN, destinații HTTP 200, acces din panoul de capitole pe mobil; 175 de teste trecute.
