# Verificarea lecției „Aplicații ale principiului I al termodinamicii”

Actualizare: 29 octombrie 2026. Originalul este păstrat; corecțiile sunt în adaptor și componentele comune.

## Lizibilitate

Verificate cele 11 secțiuni, șase probleme cu pașii deschiși, formulele, nouă demonstrații și 13 întrebări. Tema originală întunecată păstrase culori foarte deschise pentru enunțuri, valori numerice și întrebări. Acestea folosesc acum text închis pe suprafețe deschise. Valorile cursoarelor, punctajele, rezultatele finale, sursele și feedbackul au culori de text independente de paleta curbelor. Stările selectate și hover păstrează contrastul. Răspunsurile numerice rămân lizibile și după dezactivarea câmpului. Antetele tabelului nu mai transformă γ în Γ.

Audit Chromium în RO și EN, paletele Praxis și Vii: zero abateri detectate pentru textul HTML vizibil, inclusiv pașii rezolvărilor, la pragurile 4,5:1 pentru text obișnuit și 3:1 pentru text mare. Verificate separat toate cele 13 întrebări, feedbackul și rezultatul final în cele patru combinații. Este un audit focalizat pe lizibilitate, nu o certificare completă de accesibilitate. Date: `first-law-applications-readability.json`.

Parcurse pe mobil 390×844 și desktop 1440×1000, DPR 2. Toate secțiunile au fost verificate și cu text 100%/200%, fără depășire orizontală a paginii pe desktop. Tabelele și formulele late au derulare locală. KaTeX local redă indici reali și fracții aliniate, fără erori de parsare.

## Modele și interacțiuni

- Moleculele nu se rotesc automat. Ox, Oy, Oz formează un cadru solidar cu molecula. Legătura biatomică rămâne pe Ox; sunt disponibile numai rotațiile Oy/Oz. Exemplul poliatomic neliniar permite toate cele trei rotații. Tragerea originii O deplasează cadrul întreg; săgețile rotesc, Alt + săgeți deplasează, Home resetează. Tragerea cu pointer real a fost verificată în Chromium.
- Explicațiile disting 3 translații, 3+2 grade pentru molecula biatomică rigidă și 3+3 pentru cea poliatomică neliniară. Modelul exclude vibrațiile; moleculele poliatomice liniare au două rotații relevante. Referință: [OpenStax, Heat Capacity and Equipartition of Energy](https://openstax.org/books/university-physics-volume-2/pages/2-3-heat-capacity-and-equipartition-of-energy).
- Temperatura, presiunea, volumul și căldurile molare au unități; rapoartele și exponenții sunt adimensionali. Pragurile de excitare moleculară sunt specifice gazului.
- Izocora și izobara respectă ecuația de stare și bilanțul energetic; comprimarea izotermă are lucru negativ și inversează corect presiunile inițială/finală. Adiabata degenerată nu blochează animația. Politrope: gaz biatomic consecvent și limită verticală explicită.

Antetul include capitolul între bibliotecă și lecție. Catalogul tipurilor de conținut și pictogramele se propagă prin componentele comune, inclusiv offline.

## Verificări automate

`npm run check`: **109/109 teste trecute**, zero omise. Cele opt teste ale lecției verifică proveniența, bilanțurile fizice, comprimarea, extremele, densitatea Canvas, invarianții și rigiditatea moleculară, plus parsarea formulelor. Testul de proveniență atomică este din nou activ și trece cu sursa furnizată de utilizator.
