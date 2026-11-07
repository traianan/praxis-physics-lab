# Contrast și lizibilitate — 7 noiembrie 2026

Au fost verificate cele 27 de laboratoare din catalog în afară de „Rezistența unui fir”, verificat separat anterior. Auditul parcurge secțiunile și activitățile interne, nu doar pagina inițială.

## Corecții

- „Transformarea politropă”: text secundar și etichete colorate cu contrast suficient, suprafețe coerente în Test, linkul de întoarcere la experiment, textul comenzilor indisponibile, etichetele din Canvas și evitarea suprapunerii etichetelor curbelor. Textul auxiliar pornește de la 13 px și urmează dimensiunea preferată. Presetările se reorganizează pe mobil fără fragmentarea cuvintelor.
- „Condensatorul”: dimensiuni lizibile pentru etichetele și unitățile mici, inclusiv cardurile de constante din Resurse; corecția se aplică în importator.
- Stilul comun îmbunătățește etichetele auxiliare, unitățile, indicatoarele de progres și cuprinsul lecțiilor. Reguli locale suplimentare acoperă Coulomb, Faraday, mișcarea rectilinie și curbilinie, viteza și accelerația, calculul vectorial, termodinamica, calorimetria, aplicațiile principiului I, schimbările de stare, oscilatorul mecanic, motoarele termice, generatorul și pendulul gravitațional.
- Indicii matematici își păstrează scara proprie. Formulele, modelele fizice și parametrii experimentelor nu se modifică.

Sursa stilurilor comune este `public/design-system/lab-readability.css`, inclusă idempotent în `laboratory.css` de `prepare-presentation.mjs`. Adaptările politropice rămân în importator și `public/shared/polytropic.css`. Optica și arhivele autonome au fost regenerate.

## Verificare

- Audit de contrast cu axe-core în Chrome, cu tranzițiile decorative reduse și timp de stabilizare. Rezultatele intermediare sunt în `outputs/labs-contrast-baseline.json`, `labs-rest-stable.json`, `labs-last-stable.json`, `waves-readability.json` și `polytropic-final.json`.
- Auditul suplimentar de text și încadrare a parcurs 605 stări din cele 27 de laboratoare. Include secțiunile interne la dimensiunea desktop și verificări responsive în RO/EN, la 1366 și 390 px, cu text 100%/200%. Matricea responsive se aplică stării finale a fiecărui parcurs, nu fiecărui tab în fiecare combinație. Două măsurători tranzitorii de overflow la compunerea oscilațiilor au fost reverificate după stabilizarea layoutului.
- Politropa: verificare separată a celor cinci presetări, feedbackului tuturor celor zece întrebări și rezultatului testului; capturi desktop și mobil inspectate vizual.
- Reverificarea finală a celor șase laboratoare ajustate după inspecție: 97 de stări, fără erori JavaScript sau depășiri orizontale (`labs-layout-final.json`). Cele 17 stări interactive politropice au trecut fără probleme de contrast (`polytropic-readability-states.json`).
- 435 de teste trecute. Verificarea sintaxei a trecut pentru cele 299 de fișiere existente la rularea completă; noile scripturi QA sunt executate separat. Testul serverului local necesită acces localhost: rularea inițială în sandbox a fost urmată de rerularea cu acces local permis.

Auditul automat nu certifică fiecare pixel Canvas sau toate combinațiile posibile ale parametrilor. Desenele modificate au fost inspectate separat. Dimensiunile de ecran sunt emulate în Chrome, nu testate pe o tablă sau un telefon fizic.

## Reproducere

`node scripts/qa/labs-readability.mjs` parcurge toate laboratoarele vizate. `LAB_FILTER` acceptă ID-uri separate prin virgulă; `LAB_REPORT` alege numele raportului din `outputs`. `LAB_LAYOUT_ONLY=1` verifică textul și încadrarea fără a rerula axe; `LAB_INITIAL_ONLY=1` verifică pagina inițială și matricea responsive. Textele sub 13 px sunt semnalate pentru revizuire, nu declarate automat erori: indici matematici, litere ale răspunsurilor și etichete aproape de 13 px au roluri diferite.

`node scripts/qa/polytropic-readability-states.mjs` verifică stările interactive și salvează capturile vizuale. `PRAXIS_QA_URL` poate selecta versiunea online pentru auditul general.
