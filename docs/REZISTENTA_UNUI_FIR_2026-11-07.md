# Integrare — Rezistența unui fir

Data: 7 noiembrie 2026.

Laboratorul este în capitolul **Electricitate, magnetism și circuite**, cu intrare în Home, catalog, căutare și lista laboratoarelor recente. ID: `rezistenta-unui-fir`.

## Surse și reproducere

Sursa furnizată: `D:/ProiecteAI/rezistenta-unui-fir`. Snapshotul este în `sources/rezistenta-unui-fir/`; aplicația originală nu este modificată. Proveniența fișierelor: `imported-wire.json`.

- `npm run import:wire`: compilează componentele React/TypeScript în distribuție statică; nu cere server Next.js.
- `npm run registry:generate`: regenerează catalogul și configurațiile comune.
- `node scripts/build-courses-offline.mjs --course=rezistenta-unui-fir`: generează arhiva autonomă.
- `npm run build`: actualizează `dist/` pentru serverul local și distribuția web.

Adaptorul autoritativ este `scripts/import-wire.mjs`, împreună cu `scripts/adaptations/wire/` și `public/shared/wire.css`. Nu edita manual bundle-ul public.

## Integrare

Sunt păstrate cele șapte secțiuni: laborator, teorie, factori, materiale, calculator, verificare și resurse. Toate rămân montate la schimbarea secțiunii, pentru păstrarea parametrilor și răspunsurilor.

Se reutilizează antetul, traseul Bibliotecă / Capitol / Laborator, preferințele, sunetul, culorile științifice, sistemul de formule și politica de rezoluție Canvas. React deține traducerea propriilor noduri; schimbarea RO/EN nu reconstruiește experimentul. Textele sunt incluse în distribuție și în arhiva offline.

Selectorul compact păstrează cele cinci situații originale. Explicațiile și citirile suplimentare sunt pliabile. Controalele au reglaje −/+ și acces prin tastatură; graficul I–U are și comandă de la tastatură. Animația începe oprită, se oprește la schimbarea secțiunii sau ascunderea documentului, iar Pauză oprește efectiv mișcarea electronilor și ionilor. Resetarea reia progresul inclusiv când animația era deja activă.

Modelul original este păstrat, cu o corecție de unități: `ohmPerKm = R / L × 1000`, independent de lungimea probei. Aproximația liniară de temperatură și limitele didactice ale modelului rămân explicate în resursele lecției.

## Verificări

- `npm run check`: 435 teste trecute; 295 fișiere JavaScript verificate sintactic, fără erori.
- Teste independente pentru conversia mm² → m², R = ρL/A, U = RI, P = UI, efectul temperaturii, raporturile geometrice, masa la rezistență egală și Ω/km.
- `scripts/qa/wire.mjs`: 140 combinații (7 secțiuni × RO/EN × 5 dimensiuni × text 100%/200%), fără overflow orizontal, erori JavaScript sau slidere sub limita auditului.
- Dimensiuni CSS: 3840×2160, 1920×1080, 1366×768, 1024×768, 390×844. Verificare suplimentară la 1920×1080 cu DPR 2 și context mobil tactil.
- Teste funcționale: cinci preseturi, slidere și reglaje fine, Start/Pauză/Reset, Canvas nemișcat la pauză, schimbare de secțiune, RO→EN→RO fără pierderea parametrilor, calculator/reset/copiere, zece întrebări cu feedback și reluare, Mod tablă pe desktop, revenire la capitol și refresh, intrare din Home.
- Fișa de printare este verificată prin invocarea controlată a `window.print`, fără imprimare fizică.
- Distribuția autonomă este verificată prin `file://`, inclusiv schimbarea în engleză. Resursele externe opționale necesită internet, conform explicației din lecție.
- Capturi și rapoarte locale: `outputs/wire-*.png`, `outputs/wire-qa.json`, `outputs/wire-functional.json`, `outputs/wire-check.log`.

Verificările pentru tablă și mobil sunt emulări Chrome, nu teste pe dispozitive fizice. Pe ecrane joase/înguste și la text 200%, conținutul poate necesita derulare verticală pentru a păstra lizibilitatea și comenzile accesibile. Nu au fost efectuate publicări, push-uri sau schimbări Android/store.

## Corecție după verificarea utilizatorului

Tabelul Materiale folosește acum suprafețele și culorile textului din sistemul Praxis, inclusiv rândurile selectate și informațiile secundare. Titlul precizează „Aceleași dimensiuni, materiale diferite”, iar legenda explică faptul că barele reprezintă rezistența pe o scară logaritmică, nu lungimea conductorilor. Datele comparației rămân L = 1 m, A = 1 mm² și t = 20 °C.

`scripts/qa/wire-materials.mjs` verifică RO/EN, 1920×1080 și 390×844, text 100%/200%, sortarea și selectarea materialului. Toate cele 8 combinații au trecut fără overflow și fără încălcări de contrast detectate de axe-core. Captura finală a fost inspectată vizual.
