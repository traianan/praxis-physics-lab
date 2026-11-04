# Unde mecanice: afișare pe tabla digitală

## Diagnostic

Fotografia din clasă arată activitatea „Propagare și clasificare” într-o coloană îngustă, cu spațiu liber în dreapta. Eliminarea regulilor CSS care folosesc `:has()` reproduce problema în Chrome: la 1920 × 1080, secțiunea are 280 px într-un container de 1400 px. Grila originală păstrează coloanele `280px 1fr`, deși bara laterală este ascunsă. Regula care înlocuia această grilă depindea de `:has()`.

Aceasta este o cauză reprodusă, compatibilă cu un browser mai vechi pe tablă. Versiunea și capabilitățile browserului fizic nu sunt cunoscute.

## Remediere

În `public/shared/waves-textbook.css`, structura principală este selectată direct prin clasa existentă a grilei. Regulile esențiale de lățime, spațiere și afișare nu mai depind de `:has()`. Conținutul principal primește și întindere pe toate coloanele ca protecție suplimentară. Modificarea este limitată la laboratorul Unde mecanice; modelele și animațiile nu sunt schimbate.

La 1920 × 1080, atât cu regulile moderne, cât și după eliminarea selectorilor `:has()` și a container queries, secțiunea are 1632 px într-un container de 1680 px. Nu apare overflow orizontal al paginii.

## Verificări

- Regresie în browser: 1920 × 1080 DPR 1, 3840 × 2160 DPR 1, 1920 × 1080 DPR 2, 1366 × 768, 1024 × 768 și 390 × 844.
- Text 100% și 200% prin dimensiunea fontului rădăcină; CSS normal și eliminarea funcțiilor menționate: 24 combinații pentru fiecare distribuție. Această verificare nu simulează zoomul complet al browserului.
- Auditul existent al activităților în RO/EN: 100 stări pentru fiecare variantă CSS la 1920 × 1080. Sunt verificate overflowul paginii, erorile de formule și dimensiunile glisoarelor. Activarea activității „Unde pe apă” și revenirea sunt verificate prin evenimente tactile Playwright.
- `npm run check`: 361 teste trecute; `npm run build`: reușit.
- Arhiva autonomă Unde mecanice regenerată; aceeași regresie verificată pe pagina autonomă prin `file://`.
- Capturi moderne și fără funcțiile CSS avansate inspectate pentru lățimea structurii. Rapoartele și capturile sunt locale în `outputs/waves-*`.

Script reproductibil: `scripts/qa/waves-legacy-layout.mjs`. Folosește Playwright și Chrome instalate; modulul Playwright poate fi indicat prin `PRAXIS_PLAYWRIGHT_MODULE`. Implicit accesează serverul local pe portul 4199; `PRAXIS_WAVES_URL` schimbă adresa de bază. Opțiunea `--offline` testează copia creată de `node scripts/build-courses-offline.mjs --course=unde-mecanice`.

## Limite și livrare

Eliminarea regulilor CSS în Chrome reproduce respingerea lor, dar nu emulează complet un motor de browser vechi. Nu sunt verificate tabla fizică, versiunea sa de browser, performanța hardware, zoomul nativ și toate particularitățile tactile ale dispozitivului. Alte îmbunătățiri vizuale care folosesc CSS modern pot avea o prezentare simplificată pe browsere vechi.

La finalul diagnosticării, remedierea a fost păstrată local. Ulterior, utilizatorul a solicitat explicit publicarea în `main` pe GitHub pentru verificare pe tabla digitală. Publicarea repository-ului și disponibilitatea versiunii noi pe site se verifică separat.
