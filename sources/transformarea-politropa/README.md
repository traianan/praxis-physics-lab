# Transformarea politropă

Aplicație web interactivă pentru predarea subcapitolului **1.4.1 „Procese politrope”** din manualul *Fizică, clasa a X-a* (Mantea & Garabet, Editura ALL). Este gândită atât pentru predare la tablă, cât și pentru prezentarea unor aplicații de calcul.

## Ce conține

- **Teorie** — definiția, legea `pVⁿ = constant`, formele echivalente, relațiile pentru `ΔU`, `L`, `Q` și `C`, tabelul proceselor simple și spectrul indicelui `n`.
- **Laborator p-V** — grafic interactiv cu cinci preseturi (liniară, izobară, izotermă, adiabatică, izocoră), piston animat, molecule, flux de energie, slider pentru `n`, stare inițială și raport final. Punctul 2 poate fi tras direct pe grafic.
- **Procesul liniar** — cazul `n = −1`, cu `p = k·V`, aria trapezului și rezolvarea exercițiului 1.4.1.1.
- **Calculator** — introduce `ν`, gazul, `p₁`, `V₁`, `n` și `V₂`; afișează `p₂`, `T₂`, `L`, `Q`, `ΔU`, `C`, bilanțul energetic și rezolvarea în șase pași.
- **Comparație** — tabel cu procesele `n = −1, 0, 1, γ` pornind din aceeași stare și ajungând la același volum final.
- **Verificare** — 10 întrebări cu feedback imediat, explicații și rezultat final.
- **Resurse** — scenariu de lecție, linkuri și fișă de recapitulare printabilă.

## Tehnologii

- Next.js 16 (App Router) + React 19
- TypeScript
- KaTeX pentru formule
- Canvas 2D pentru graficul p-V, piston și molecule
- CSS propriu, fără framework de UI; fonturi locale

## Pornire

```bash
npm install
npm run dev
```

Deschide `http://localhost:3000`.

Pentru verificarea tipurilor și build de producție:

```bash
npm run typecheck
npm run build
npm start
```

## Detalii de utilizare

- **Tema** se comută din antet (luminos/întunecat) și este memorată local.
- **Modul tablă** mărește tipografia pentru proiecție și este memorat local.
- **Tabloul p-V** acceptă tragere cu mouse-ul sau degetul; cursorul se schimbă în funcție de proces.
- **Printarea** din secțiunea Resurse sau Calculator folosește o fișă dedicată, nu întreaga aplicație.
- Animațiile respectă `prefers-reduced-motion`.

## Sursă și statut

Textul de referință este subcapitolul 1.4.1, pagina 38. Aplicația este o resursă didactică originală, inspirată de structura manualului, nu o reproducere a acestuia. Formulele și valorile sunt calculate în SI, iar interfața afișează kPa, L, K și J/kJ.
