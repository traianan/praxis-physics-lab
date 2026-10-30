# Audit de integrare — Oscilatorul mecanic

Sursa externă: `oscillator-mecanic/`, nemodificată. PDF-ul furnizat are 18 pagini scanate, fără strat de text; au fost generate planșe de inspecție în `outputs/oscillator-audit/`.

## Comparația subiectelor

- PDF 1–3: fenomene periodice, procese oscilatorii, echilibru stabil, perioadă, frecvență, elongație, amplitudine — prezente în sursă.
- PDF 3–6: oscilații amortizate, rezistență vâscoasă, coeficient de amortizare, decrement logaritmic, timp de viață, regimuri tranzitorii și lucrare experimentală — prezente în sursă; formulele și convențiile au fost validate numeric.
- PDF 6–13: model armonic, legătura cu mișcarea circulară, legea mișcării, viteză, accelerație, fază, pendul gravitațional, pendul elastic, măsurarea lui g și k, cuplaje serie/paralel, energie și exerciții rezolvate — prezente în sursă; procedurile, unitățile și demonstrațiile au fost adaptate și verificate.
- PDF 14–16: compunerea oscilațiilor paralele, metoda analitică și fazorială, amplitudinea și faza rezultantei, cazurile în fază și în opoziție, bătăi — lipsesc din sursă.
- PDF 16–18: compunerea oscilațiilor perpendiculare, ecuația traiectoriei, segmente, elipse, cerc, sensul parcurgerii, figuri Lissajous la frecvențe diferite — lipsesc din sursă.

## Probleme de integrare identificate

Sursa încarcă MathJax de pe CDN și nu funcționează complet offline. Sunetul pornește implicit și inițializează contextul la primul gest. Cele 11 bucle Canvas continuă să avanseze indiferent de vizibilitate. Interfața are numeroase referințe la manual și o secțiune editorială de corecții; explicațiile utile din acestea trebuie păstrate fără trimiterile editoriale. Sunt necesare antetul, capitolul, catalogul, aspectul și componentele comune, localizare, formule locale și verificare la DPR/zoom.

## Stare

Integrat în catalog, în capitolul Sunete și unde: 4 teme, 11 demonstrații, 6 probleme rezolvate și 18 întrebări. Conform solicitării utilizatorului, compunerea oscilațiilor, bătăile și figurile Lissajous rămân pentru laboratoare separate.

Formulele folosesc KaTeX local; interfața comună include română/engleză, palete, pictograme, control global al sunetului și accesibilitate. Sursa externă este păstrată nemodificată, cu amprente SHA-256 în imported-oscillator.json. Referințele editoriale au fost eliminate, iar corecțiile fizice utile au fost incluse în explicații.

Animațiile resort–corp și fazor Fresnel au fost reconstruite cu mecanismul și graficul în panouri disjuncte, mișcare analitică în funcție de timp, grafic pe două perioade, axe cu unități și viteză de redare reglabilă. Un singur ciclu requestAnimationFrame deservește demonstrațiile vizibile; cele ascunse nu avansează. Canvas se adaptează la densitatea ecranului.

Modelul amortizat rezolvă analitic cele trei regimuri; perioada amortizată și decrementul sunt afișate numai în regimul oscilant. Au fost corectate numărătoarea perioadelor, pendulul neliniar și ambiguitățile identificate în test.

## Audit vizual suplimentar — 29 octombrie 2026

Verificate toate cele 11 demonstrații, cu texte în engleză și română, mai multe faze și densitate de ecran 2. Graficele y/v/a au panouri separate și scări fizice proprii; o verificare automată controlează punctele curbelor la cinci faze. Formulele în text nu mai generează bare de derulare. Graficele mărimilor și recapitulării sunt analitice, fără acumulare de eșantioane dependentă de rata cadrelor. Diagrama energiei este încadrată, iar pendulele au curse limitate geometric. Etichetele exemplelor se împart pe rânduri. Perioada pendulului neliniar folosește trecerile succesive în același sens, fără factorul 2 eronat.
