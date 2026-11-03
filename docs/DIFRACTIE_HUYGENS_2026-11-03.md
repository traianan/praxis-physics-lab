# Difracție printr-o fantă — Huygens

Activitatea existentă **Reflexie și refracție → Extensie: difracția** include acum un front incident, sursele secundare din fantă și fronturile rezultante, pentru a/λ între 0,3 și 6. Presetări: 0,3; 1; 6. Animația are un singur ceas, pauză, resetare, căutare temporală și oprire la ascundere. Schimbarea RO/EN păstrează starea. SVG păstrează claritatea la scalare; pe ecrane mici diagrama permite glisare locală.

## Model

Unități λ = T = v = 1. Frontul incident ajunge la fantă la t = 0; intervalul afișat este −2T…9T. Fanta uniform iluminată este discretizată simetric prin cuadratură la mijlocul subintervalelor, cu minimum 65 de surse și minimum 24 de surse pe λ. În dreapta se însumează contribuțiile scalare cilindrice proporționale cu exp[2πi(r−t)]/√r, activate numai după timpul de zbor r/v. Faza armonică și distanțele sunt precalculate. Nu se calculează reflexia ecranului sau problema exactă de contur la margini.

Semicercurile punctate reprezintă prima emisie, nu toate emisiile periodice. Sursele continuă să oscileze. Fronturile verzi sunt contururi de fază zero ale sumei complexe, extrase prin marching squares, cu partea reală pozitivă. Regiunile aproape anulate sunt omise. Nu se prezintă amplitudini absolute. Două săgeți incidente și două raze locale ale undei rezultante indică propagarea; direcțiile emergente sunt normalele fazei calculate, nu raze rectilinii impuse după fantă.

Explicația diferențiază înfășurătoarea geometrică de suprapunerea coerentă necesară pentru distribuția difracției. Relația sin θ₁ = λ/a este explicit limitată la câmpul îndepărtat. Pentru a < λ nu există primul minim în semiplanul înainte; pentru a = λ acesta este la 90°.

Referință de verificare: [OpenStax — Single-Slit Diffraction](https://openstax.org/books/university-physics-volume-3/pages/4-1-single-slit-diffraction). Nu sunt preluate ilustrații sau texte din această sursă.

## Verificare

- Teste independente: simetrie, cauzalitate, cuadratură, convergența distribuției unghiulare către sinc² în câmpul îndepărtat (eroare sub 0,001), sensul și normalitatea razelor, contururi finite și evoluția lor.
- Browser: cele trei raporturi, debutul surselor, Start/Pauză/Reset, ascunderea semicercurilor, oprire la schimbarea activității, RO → EN → RO cu stare păstrată, fracția și indicele din demonstrație.
- Afișare: 1366×768/DPR1, 1920×1080/DPR2, 3840×2160/DPR1, 1024×768/DPR1,25, 390×844/DPR3, text 200%. Fără overflow orizontal de pagină, controale de minimum 44 px. La 1366×768/text100 scena, comenzile și sumarul explicației încap pe ecran. Pe mobil și la 200% este necesară derularea.
- Verificarea tuturor celor 51 de activități RO/EN; npm run check și npm run build; arhiva autonomă bilingvă regenerată.

Implementarea durabilă se află în adaptorul de import și fișierele waves-diffraction-*; nu se modifică sursa externă importată.
