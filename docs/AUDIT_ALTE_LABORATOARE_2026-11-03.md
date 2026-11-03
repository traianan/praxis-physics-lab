# Audit proporțional: oscilații, Chladni, interacții atomice și optică

Data: 3 noiembrie 2026. Inspecție de cod, importatoare, modele comune și teste existente; fără verificare vizuală în browser și fără modificarea implementării. Raportul consemnează starea observată înaintea extinderii formatării comune în această sesiune.

## Rezultat fizic

Nu a fost confirmată o eroare nouă de formulă fizică în domeniul verificat. Aceasta nu este o certificare integrală a fiecărui text și a fiecărei animații.

- Oscilator: `public/shared/oscillator-model.js` folosește x=A sin(ωt+φ), v=Aω cos(ωt+φ), a=−Aω² sin(ωt+φ); soluția amortizată tratează distinct regimurile subcritic, critic și supracritic. Importatorul înlocuiește demonstrațiile vechi cu adaptoarele și modelele corectate.
- Cuplaj: `public/shared/coupled-model.js` include energia resortului de cuplaj și frecvența de rezonanță a amplitudinii √(ω₀²−2b²), numai sub pragul b<ω₀/√2. `scripts/import-coupled.mjs:7–8` corectează explicit confuzia dintre acest maxim și răspunsul la Ω=ω₀. Formula pentru bătăi este limitată în text la pendule identice, unghiuri mici.
- Compunere: ecuația elipsei și semnul vitezei areolare din `compunerea_oscilatiilor/teorie.html` sunt coerente cu x=Aₓ sin(ωt), y=Aᵧ sin(ωt+Δφ): Δφ pozitiv produce sens orar. Cele două notații p/q și m:n sunt reciproc coerente în contextele lor. Modelul și testele separă contactele în colț de tangențele regulate.
- Chladni: `public/shared/chladni-model.js` folosește condiții de margine liberă și ν=0,33. Formula f=λ²K, K=√(D/(ρh))/(2πa²), D=Eh³/[12(1−ν²)] are dimensiuni corecte. Aproximarea stocastică a nisipului și condițiile modelului sunt declarate.
- Atomic: `interactii-atomice/js/app.js:57–60` implementează U=4ε[(σ/r)¹²−(σ/r)⁶], F=−dU/dr; r₀=2^(1/6)σ și U(r₀)=−ε. Importatorul corectează interpretarea lui σ ca „diametru” și limitele modelului pentru oxigen.
- Optică: convenția carteziană documentată în `../Optica-Lab/docs/VERIFICARE_FIZICA_2026-10-27.md` este coerentă: concavă f<0, convexă f>0, x₁<0 pentru obiect real. Aceste semne nu trebuie inversate pentru a imita convenția distanțelor reale pozitive. Motorul paraxial este separat de demonstrația reflexiei exacte.

## Randare și trasee de integrare

| Laborator | Stare și dovezi | Integrare indicată |
|---|---|---|
| Oscilator mecanic | Formulele bloc și inline din importator sunt deja `data-fx`/`data-fx-inline`, cu KaTeX local. `oscillator-mecanic/js/demos.js:40–42` desenează etichete prin `fillText`; adaptoarele au etichete ca x/A₀ și m/s. | Păstrat sistemul KaTeX existent. Orice îmbunătățire Canvas se face în helperul `label` sau în adaptoare, fără a rescrie formulele deja corecte. Sursa este `oscillator-mecanic/` plus `scripts/import-oscillator.mjs`, `scripts/adaptations/oscillator-*.js` și modelele comune. |
| Oscilatori cuplați | `scripts/import-coupled.mjs:13–14` produce două formule KaTeX cu fracție, radical, derivată și atan2. Proza/quizul și readouturile rămân text simplu, inclusiv `r_crit`, `E_total`, `ω_s`, `ω_a`, `T_b`. `public/shared/coupled.js:15,26,34–47,57` folosește `fillText`/`textContent`. Canvas afișează `k_c`, `P1`, `θ1`, `θ2`. | Nu înlocuit KaTeX. Formatare explicită pentru readouturi și quiz după actualizare; Canvas prin helperul local `text`. Modificările persistente aparțin importatorului și fișierelor comune; sursa brută `gemini-code-1793291347541.html` este păstrată prin proveniență. |
| Compunerea oscilațiilor | `compunerea_oscilatiilor/teorie.html` păstrează `.formula` ca Unicode cu fracții slash: ecuațiile parametrice, elipsa, viteza areolară, raportul și perioada comună, limitele dreptunghiului. `app.js:49–56` regenerează `#analysis.innerHTML` cu `T=2π/ω` și raporturi. Canvas `app.js:61–74` desenează Aₓ/Aᵧ cu Unicode. | Mapare explicită a blocurilor în `scripts/import-composition.mjs`, încărcarea rendererului local, apoi formatarea fragmentelor dinamice după regenerare. Păstrat modelul `public/shared/composition-model.js` și convenția fazei. |
| Figuri Chladni | `chladni.html:51–52` produce două elemente `code` cu fracții slash; `scripts/adaptations/chladni-content.html:5` are trei relații într-un `.formula` cu `<br>`. Nici acestea, nici importatorul nu solicită KaTeX în starea inspectată. | Convertite explicit cele două relații ale laboratorului și cele trei din teorie în `scripts/import-chladni.mjs`/adaptor, cu fracții și radicali reali. Nu înlocuite etichetele modale `(n,s)` sau unitățile. |
| Interacții atomice | `interactii-atomice/index.html:148,153` are `.f` cu puteri Unicode și `<sup>1/6</sup>`. CSS-ul sursei forțează nowrap/overflow. `js/app.js:49,208` generează `·10⁻²¹ J`; aceasta este înmulțire matematică legitimă. | Formule explicit randate din `scripts/import-atomic.mjs`, păstrând semnele, exponenții și factorul 10⁻²¹. Fracția exponentului 1/6 trebuie să rămână întreagă în exponent. Canvas `text` la linia 121 este un traseu separat de DOM. |
| Oglinzi și lentile | `../Optica-Lab/dist/app.js:270` are deja fracții suprapuse `.fraction`. Linia 271 (`equation-substitution`) afișează substituțiile ca `1 / (...)`. Helperul SVG `text` de la 296 produce text simplu; Unicode x₁/x₂/Fₚ este păstrat. | Păstrate fracțiile existente și convenția de semne. Schimbările motorului/interfeței autoritative în `Optica-Lab`; adaptările exclusiv de prezentare ale distribuției pot fi în `scripts/optics-library.js` sau `scripts/sync-optics.mjs`. Nu editat doar HTML-ul public monolitic. |

Un renderer DOM nu modifică textul deja desenat în Canvas. Îmbunătățirea globală trebuie să trateze separat DOM, SVG și helperii Canvas și să evite reinterpretarea unităților (`N·s/m`, `m/s`) ca fracții didactice obligatorii. Minusul unar și separatorii dintre mărimi trebuie păstrate semantic; `·10⁻²¹` și produsele fizice nu se șterg ca separatori.

## Verificare executată

Comandă: `node --test test/oscillator.test.mjs test/oscillator-display.test.mjs test/coupled.test.mjs test/composition.test.mjs test/chladni.test.mjs test/atomic.test.mjs`.

Rezultat: **44/44 teste reușite**, 0 erori. Sunt acoperite derivările armonice și Lennard–Jones, regimurile amortizării, conservarea energiei pendulelor, maximul rezonanței, modurile normale, identitățile compunerii, cele 19 valori proprii Chladni, scalarea SI și independența de rata cadrelor. Optica a fost inspectată static și confruntată cu auditul său anterior; testele sale nu au fost rerulate în acest subaudit. Verificarea lizibilității efective la telefon și text 200% rămâne distinctă de aceste verificări numerice.
