# Oscilatori mecanici cuplați

Sursa `gemini-code-1793291347541.html` este păstrată intactă, cu SHA-256 în `imported-coupled.json`. Import reproductibil: `npm run import:coupled`. Lecția aparține capitolului Sunete și unde.

Păstrate: cele patru teme teoretice, patru experimente, 14 suprafețe grafice, zece întrebări, exporturi CSV/PNG și raportul local. Interfața comună include antet, capitol, pictograme, palete, text, română/engleză și distribuție offline. Formulele principale folosesc KaTeX local. Conținutul este centrat, cu lățime maximă 90rem și margini automate; pe mobil graficele păstrează lizibilitatea prin derulare locală.

## Corecții fizice

- Rezonanța de amplitudine are Ωr=√(ω0²−2b²), dacă b<ω0/√2; în afara acestei condiții maximul este la Ω=0. Valoarea F0/(rω0) este amplitudinea la Ω=ω0, nu maximul exact. Puterea medie absorbită este maximă la ω0.
- Modelul cuplajului slab folosește gravitație neliniară și energia potențială a resortului orizontal aproximat. Ecuațiile și energia sunt coerente și pentru lungimi diferite; unitățile cuplajului sunt N/m, ale amortizării s⁻¹. Aproximația și limita unghiurilor mici sunt explicate.
- Modelul strâns este liniar, pentru unghiuri mici, cu moduri proprii simetric și antisimetric. Frecvențele și perioada bătăilor corespund ecuațiilor.
- Integrare RK4 cu subpași de cel mult 1/240 s, coordonată de timpul real. Un singur RAF; taburile ascunse și fundalul nu avansează. Redare accelerată până la 20× pentru transferul lent. Istoricul are timpi reali și exportul păstrează forța efectivă în baleiaj; faza forței este continuă.
- Desenele mecanice sunt separate de grafice. Axe cu unități, scări stabile și protecție împotriva depășirilor. Canvas adaptat la DPR.
- Tacoma Narrows este descris prin flutter aeroelastic, conform [WSDOT](https://www.wsdot.wa.gov/TNBhistory/bridges-failure.htm), nu prin simplă rezonanță forțată. Amortizarea critică este deosebită de raportul subcritic 0,7.

## Verificare

Teste numerice independente: conservarea energiei fără amortizare, frecvențele modurilor, răspunsul forțat, maximul rezonanței, independența de 30/60/120 Hz; proveniență și traduceri. În browser: parametri minimi/maximi în cele patru experimente, test 10/10 și păstrarea răspunsurilor la schimbarea limbii; verificare de centrare la 2560px și încadrare pe mobil.

## Separatoare în întreaga aplicație

`scientific-readouts.js` este inclus în antetul comun la build. Înlocuiește punctul separator dintre câmpuri fizice de tip A=... și T=... cu spațiu tipografic, în Canvas și în citirile DOM. Formulele KaTeX, blocurile de formule și produsele fizice precum N·s/m sunt păstrate. Testul de regresie verifică diferența dintre separator și înmulțire.
