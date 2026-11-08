# Legile lui Ohm

Aplicație web interactivă despre legea lui Ohm, rezistența electrică și circuitele cu sursă reală. Lecția combină explicații, experimente de laborator, instrumente de calcul și verificarea cunoștințelor.

Construită pe modelul laboratorului *Transformarea politropă*, cu o identitate vizuală proprie și navigare pe taburi pentru acces rapid la fiecare activitate.

## Conținut

- **Teorie** — legea lui Ohm (`I = U/R`, `U = RI`, `R = U/I`), definiția unității `1 Ω = 1 V / 1 A`, triunghiul interactiv U–I–R, caracteristici curent–tensiune și problemă rezolvată.
- **Laborator U–I** — grafic interactiv, trei becuri și un rezistor ohmic, înregistrare de măsurători și conductor animat. Slidere pentru tensiune, rezistență, material, lungime, diametru și temperatură.
- **Circuit complet** — schemă animată cu sursă reală, rezistor, ampermetru și voltmetru; caracteristica sursei `U(I) = E − r·I`, adaptarea de putere, curentul de scurtcircuit și bilanțul puterilor.
- **Reostat și divizor potențiometric** — două montaje interactive, cursor glisant, grafice `I(l)` și `U(l)`, slidere și problemă aplicată.
- **Măsurări** — montaje amonte și aval, citiri live, eroare relativă, regula `√(R_A·R_V)` și tabel comparativ.
- **Probleme și verificare** — probleme rezolvate, calculator cu patru moduri și întrebări cu feedback imediat.
- **Resurse** — scenariu de lecție, linkuri externe și fișă de recapitulare printabilă.
- **Harta conceptelor** — relațiile dintre mărimi, legea lui Ohm, componente și circuitul complet.

## Tehnologii

- Next.js 16 (App Router) + React 19
- TypeScript strict
- KaTeX pentru formule
- Canvas 2D pentru scheme, grafice interactive și animații
- SVG pentru grafice și instrumente vizuale
- CSS propriu, fără framework de UI sau imagini externe

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

- **Tema** se comută din antet și se memorează local.
- **Modul tablă** mărește tipografia pentru proiecție și se memorează local.
- **Glisarea** pe grafice modifică mărimile fizice relevante.
- **Animațiile** pot fi oprite și respectă `prefers-reduced-motion`.
- **Printarea** din Resurse generează o fișă A4 dedicată.

## Modelul fizic

Toate mărimile se calculează în SI, în `lib/physics.ts`:

- legea lui Ohm pe o porțiune: `I = U/R`;
- rezistența firului: `R = ρL/S`, cu `ρ(t) = ρ₀[1 + α(t − 20 °C)]`;
- filamentul becului nu este ohmic, iar rezistența crește cu temperatura;
- circuitul complet: `I = E/(R + r)`, `U = E − r·I`, `P = E·I`, `η = U/E`, `I_sc = E/r`, `P_u,max = E²/(4r)` la `R = r`;
- reostatul: `R_AC = k·l_AC`; în montaj serie rămâne doar porțiunea activă, iar divizorul oferă o tensiune proporțională cu lungimea;
- măsurarea: montajul amonte include rezistența ampermetrului, iar montajul aval măsoară numai rezistorul; pragul practic este `√(R_A·R_V)`.

Rezistivitățile și coeficienții de temperatură sunt valori orientative la 20 °C pentru metale și aliaje uzuale.
