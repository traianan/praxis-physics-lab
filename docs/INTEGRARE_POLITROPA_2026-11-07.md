# Transformarea politropă — integrare locală

Sursa originală din `../transformarea-politropa` este păstrată în snapshotul
`sources/transformarea-politropa`. Importatorul `scripts/import-polytropic.mjs`
aplică adaptările fără a modifica snapshotul; hashurile sunt în
`docs/imported-polytropic.json`.

Laboratorul este în capitolul Căldură și termodinamică, cu șase secțiuni:
laborator p–V, teorie, proces liniar, calculator, test și resurse. Integrarea
folosește React local, navigarea comună, RO/EN și exportul autonom offline.
Preferințele folosesc mecanismul comun; politica de păstrare a datelor nu se schimbă.

Comenzile pentru indice, raportul volumelor și viteza animației sunt vizibile.
Gazul și starea inițială sunt într-un panou extensibil. Conținutul are lățime
maximă 88 rem, centrată, ca laboratorul de mecanică newtoniană; pe telefon
coloanele se rearanjează și sliderul de derulare păstrează spațiu utilizabil.

Corecții fizice: pentru n < 0, C_V < C < C_p; valorile apropiate de exponenții
proceselor limită sunt normalizate înaintea calculelor pentru concordanța dintre
animație și rezultat. Patru teste verifică lucrul prin integrare numerică
independentă, bilanțul energetic, izocora și cazurile limită.

Verificări locale: build reușit; 432 de teste reușite și verificare de sintaxă
pentru 288 de fișiere JavaScript fără erori;
60 de combinații în Chrome (șase secțiuni, RO/EN, lățimi 390, 1024, 1366,
1920 și 3840 px), fără erori JavaScript, depășiri orizontale ori slidere
vizibile sub 80 px. Script: `scripts/qa/polytropic.mjs`.
Aceste verificări nu reprezintă un audit complet de accesibilitate sau testare
pe echipamente fizice. Exportul offline a fost regenerat.
