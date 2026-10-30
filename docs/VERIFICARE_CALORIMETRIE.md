# Integrare și verificare — Calorimetrie

Data: 28 octombrie 2026.

## Conținut și navigare

Laboratorul este în capitolul **Căldură și termodinamică**, lângă Noțiuni termodinamice de bază. Pe prima pagină apar împreună cele două laboratoare, pe același rând pe ecrane mari.

- Șapte figuri interactive; 11 teme și șase taburi principale: Noțiuni și principii, Experimente, Glosar și formule, Test, Probleme, Resurse.
- Sunt păstrate toate explicațiile științifice, experimentele, cele 12 întrebări și opt probleme. Au fost eliminate introducerea decorativă, autorii, trimiterile editoriale și secțiunea despre greșeli de manual.
- Exemplul cu ulei folosește masa de ulei cald 0,8 kg, compatibilă cu temperatura finală dată și rezultatul 1900 J/(kg·K). Tabelul de identificare conține numai valorile fizice utilizabile.
- O singură temă este vizibilă. Taburile păstrează parametrii, determinările și răspunsurile. Simulările ascunse sunt oprite. Cuprinsul și căutarea deschid tema corespunzătoare.
- Sunt folosite antetul, culorile, limba, mărimea textului, sunetul și modul tactil comune. Formulele au spațiu de protecție; indicii rămân atașați simbolurilor.

## Corecții ale figurilor

Etichetele axelor și gradațiilor au poziții stabile, textele din afișajele termometrelor sunt centrate în casete, iar adnotările mobile evită celelalte etichete. Când se deplasează, o linie discretă indică punctul asociat. Canvasurile se redimensionează la dimensiunea afișată și DPR, până la 2.

Tabelele de măsurători se prezintă ca fișe cu etichete și indici reali sub 1200 px, fără derulare laterală. Zonele de atingere ale pieselor calorimetrului au minimum 44×44 px; butoanele folosesc controalele tactile comune.

Turnarea apei integrează fracțiunea exactă transferată, inclusiv cadrele care traversează începutul sau sfârșitul intervalului de turnare. Masa introdusă corespunde acum masei alese, indiferent de frecvența cadrelor.

## Validare

- `npm run check`: **86 teste trecute**, fără eșecuri; include verificarea tuturor răspunsurilor numerice, bilanțului de căldură pentru ulei, păstrării surselor și turnării la 30/60/120 Hz și intervale neregulate.
- Audit în Chrome: desktop 1600×1000, tabletă portret 768×1024 și peisaj 1024×768, DPR 2 pentru tabletă, modul tactil activ.
- 144 stări pentru fiecare configurație: toate temele, ambele limbi, toate modurile figurilor, extremele sliderelor și experimente complete. Fără depășiri orizontale, etichete în afara canvasului sau suprapuneri între etichetele verificate. Au fost incluse și textele fixe din casete și de pe axe.
- La mărimi de text 125%, 150% și 200%, toate cele 11 teme au rămas fără depășiri orizontale pe tableta portret.
- Schimbarea RO→EN→RO, păstrarea răspunsurilor și măsurătorilor la schimbarea taburilor, căutarea și oprirea animațiilor ascunse au trecut.
- Verificare autonomă prin `file://`, cu rețeaua browserului oprită: încă 144 stări fără probleme și fără erori în consolă.
- Rapoarte reproductibile: `scripts/qa/calorimetry.js` și `docs/calorimetry-browser-qa.json`. Verificarea pe tabletă este emulare în browser, nu test pe un dispozitiv fizic.

## Surse și distribuție

Sursele originale sunt păstrate neschimbate în `sources/calorimetrie/site`, cu inventar SHA-256 în `docs/imported-calorimetry.json`. Folderul original `calorimetrie` a fost păstrat.

Regenerare: `npm run import:calorimetry`, apoi `npm run offline:courses` și `npm run build`. Dicționarele RO/EN sunt încorporate pentru funcționare fără internet. Arhiva individuală: `public/simulari/calorimetrie/calorimetrie.zip`; distribuția completă: `outputs/Praxis-Fizica-local.zip`.
