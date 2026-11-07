# Rezistența unui fir

Aplicație web interactivă pentru predarea **rezistenței electrice a unui conductor**, gândită pentru tablă și pentru proiector: teorie, laborator animat, explorare de factori, tabel de materiale, calculator pas cu pas și test de verificare.

Construită pe modelul laboratorului *Transformarea politropă* (aceeași structură de secțiuni, aceleași convenții de cod și de stil), cu o paletă proprie: cerneală profundă, cupru, alamă și mentă.

## Ce conține

- **Teorie** — definiția rezistenței, legea `R = ρL/A` cu legenda mărimilor, analogia conductei de apă, cele patru dependențe (`L`, `A`, `ρ`, `t`) și diferența dintre rezistență și rezistivitate.
- **Laborator** — fir desenat la scară logaritmică, cu rețea cristalină, electroni în derivă, ciocniri, încălzire și regim termic. Slidere pentru material, lungime, diametru, temperatură și curent. Grafic I–U în care se poate trage direct pentru a varia curentul. Cinci situații reale (cablu de cupru, nicrom, filament de wolfram, linie aeriană, mină de creion), secțiuni uzuale și comparație cu referința de 1 m · 1 mm².
- **Factori** — explorator cu trei file (lungime, secțiune, temperatură), grafic de dependență, valori reper și patru experimente mintale.
- **Materiale** — tabel cu 10 materiale, sortabil, cu bară comparativă a rezistenței, coeficient de temperatură și densitate; detaliu cu raportul față de cupru (rezistență, arie necesară, masă).
- **Calculator** — cinci pași de rezolvare (rezistivitate la temperatura dată, secțiune din diametru, rezistență, curent, putere și masă) și tabel comparativ pentru toate materialele.
- **Verificare** — 10 întrebări cu feedback imediat și explicații.
- **Resurse** — scenariu de lecție de 45 de minute, linkuri externe, fișă de recapitulare printabilă.

## Tehnologii

- Next.js 16 (App Router) + React 19
- TypeScript strict
- KaTeX pentru formule
- Canvas 2D pentru firul animat și graficul I–U, SVG pentru graficele din secțiunea de factori
- CSS propriu, fără framework de UI, fără fonturi sau imagini externe

## Pornire

```bash
npm install
npm run dev
```

Deschide `http://localhost:3000`.

Verificare tipuri și build de producție:

```bash
npm run typecheck
npm run build
npm start
```

## Detalii de utilizare

- **Tema** se comută din antet (luminos/întunecat) și se memorează local.
- **Modul tablă** mărește tipografia pentru proiecție și se memorează local.
- **Glisarea** pe graficul I–U modifică tensiunea, deci curentul prin fir; scara rămâne înghețată în timpul tragerii.
- **Animația** firului poate fi oprită; derularea de sub fir derulează procesul de măsurare.
- **Printarea** din secțiunea Resurse sau Calculator tipărește o fișă dedicată, nu întreaga aplicație.
- Animațiile respectă `prefers-reduced-motion`.

## Modelul fizic

Valorile se calculează în SI, în `lib/resistance.ts`:

- rezistivitatea la temperatura `t`: `ρ = ρ₀[1 + α(t − 20 °C)]`, cu prag inferior pentru a evita valori nefizice;
- rezistența: `R = ρL/A`, cu `A` introdusă în mm² și convertită în m²;
- curent, tensiune, putere: `I = U/R`, `P = UI = RI²`;
- viteza de derivă: `v = I / (n·e·A)`, cu `n` estimată din densitate, masă molară și valență.

Rezistivitățile și coeficienții α sunt valori orientative la 20 °C, pentru metale și aliaje uzuale. Pragurile de încălzire afișate în laborator sunt didactice (densitate de curent) și nu înlocuiesc tabelele de sarcini admisibile sau protecțiile electrice reale.

## Sursă și statut

Structura este inspirată de simularea *Resistance in a Wire* (PhET, University of Colorado Boulder). Aplicația este o resursă didactică originală: textele, desenele, calculele și codul sunt proprii, nu o reproducere a simulării sau a unui manual.
