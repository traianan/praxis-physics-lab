# Compunerea oscilațiilor — integrare la 30 octombrie 2026

Laboratorul este disponibil în **Sunete și unde**, cu ID-ul `compunerea-oscilatiilor`. Biblioteca are 15 laboratoare. Proiectul actual este web, servit local sau ca site static; nu conține un proiect Android nativ.

## Sursa și reproducerea integrării

Cele cinci fișiere din `compunerea_oscilatiilor/` sunt păstrate nemodificate. Amprentele SHA-256 sunt în `imported-composition.json`; testele verifică proveniența. Importatorul generează copia integrată, fără să rescrie sursa externă.

```text
npm run import:composition
npm run check
npm run package:local
```

Modificările integrării se fac în `scripts/import-composition.mjs`, `public/shared/composition.css` și `public/locales/composition/{ro,en}.json`, apoi se regenerează. `public/shared/composition-model.js` extrage reproductibil funcțiile matematice pure din sursă pentru verificări independente.

## Conținut păstrat

- Cele două moduri: pulsații egale și diferite; 12 situații particulare și nouă rapoarte rapide exacte.
- Amplitudini, pulsații cu pas de 0,01 rad/s, fază, viteza animației și toate opțiunile de afișare.
- Traiectoria Lissajous și cele două grafice temporale, proiecții, urma, curba teoretică, dreptunghiul, contactele, viteza și simetriile.
- Pauză, pas, revenire la t=0, următorul extrem și oprirea automată la extreme.
- Două tonuri sintetizate cu volum și explicația separării frecvențelor audio de pulsațiile fizice; export PNG.
- Cele șapte teme teoretice, formule, tabelul situațiilor particulare și toate activitățile pentru clasă.

Teoria și laboratorul sunt taburi ale aceleiași pagini; schimbarea tabului păstrează parametrii. `teorie.html` redirecționează către tabul teoretic. Interfața utilizează antetul comun, revenirea în bibliotecă, RO/EN, paletele comune, dimensiunea textului și Mod tactil. Culorile științifice și descrierea punctului au fost adaptate paletei comune. Nu au fost necesare schimbări ale ecuațiilor fizice validate.

## Rezoluție și afișare

Bitmapul fiecărui Canvas este calculat din dimensiunea CSS afișată × `devicePixelRatio`, fără limitare artificială la DPR 2. Coordonatele logice sunt separate de pixeli. Scara spațială este egală pe Ox și Oy, astfel încât un cerc nu este deformat în elipsă. Exportul PNG folosește rezoluția efectivă a scenei.

Graficele se adaptează lățimii și mărimii textului. La spațiu insuficient păstrează o lățime lizibilă și pot fi derulate local, fără extinderea întregii pagini. Grila trece într-o coloană în funcție de spațiul disponibil. Animația eșantionează urma la cel puțin 120 de puncte pe secundă simulată, inclusiv la viteză mărită. Parametrii nu se resetează la redimensionare sau schimbarea paletei.

## Touch, mouse și tastatură

Colțurile violet ale dreptunghiului se pot trage pentru ajustarea amplitudinilor. Fiecare are o zonă de atingere de 68×68 CSS px. Se folosesc Pointer Events și capturarea pointerului, cu tratarea `pointercancel` și `lostpointercapture`. Restul scenei permite derularea tactilă; suprafețele de tragere au `touch-action:none`.

Sliderele, selectoarele și butoanele funcționează tactil. Mod tactil oferă ținte de minimum 52 px; pulsațiile păstrează un singur rând de butoane −/+, fără dublarea lor de adaptor. Cu graficul focalizat, ←/→ modifică Aₓ, iar ↓/↑ modifică Aᵧ. Pe telefon panoul parametrilor pornește restrâns; comenzile Pauză/Pas/t=0 rămân lângă animație.

Ceasul și sunetul se opresc când documentul este ascuns sau se deschide teoria. Dezactivarea globală oprește și tonurile locale. Revenirea nu produce salturi în timpul simulat.

## Verificări

- `npm run check`: **147/147 teste**, inclusiv proveniența, ecuația elipsei, sensurile de parcurgere, perioadele comune zecimale, contactele, colțurile și simetriile. Testul HTTP a necesitat acces loopback în afara restricției sandboxului și a trecut.
- Chromium: toate cele 12 preseturi, comenzi, comutatoare, oprirea automată exact la extrem, pasul de 0,08 s și conservarea ceasului în teorie; fără erori sau avertizări în consolă.
- 24 de combinații: 320×740 DPR 2, 390×844 DPR 3, 768×1024 DPR 2, 1024×768 DPR 1, 1920×1080 DPR 2 și 3840×2160 DPR 1, fiecare în RO/EN și cu text 100%/200%. Toate cele 72 de măsurători Canvas corespund dimensiunii afișate × DPR, cu toleranță de un pixel. Fără depășirea orizontală a paginii, atât în laborator, cât și în teorie.
- Evenimente Pointer simulate cu `pointerType:touch`: amplitudini 4,2 și 1,8, anularea gestului, eliberarea capturii și tastatura. În acest test capturarea nativă a fost substituită; nu reprezintă o probă pe un telefon fizic. Emularea tactilă confirmă dimensiunile zonelor de atingere.
- Audio real în browser: context activ și volum local corect; atenuare la trecerea în teorie și la mute global. Exportul PNG are dimensiunile bitmapului, iar schimbarea paletei păstrează parametrii.
- Textele dinamice ale tuturor presetărilor și cele șapte teme au fost verificate în engleză.
- Copia autonomă a fost deschisă separat în Chromium: funcționează în EN, inclusiv schimbarea raportului și următorul extrem. Încarcă doar `app.js` și faviconul local, fără cereri către componentele bibliotecii sau servicii externe; fără erori în consolă.

## Distribuție

`public/` și `dist/` conțin laboratorul integrat. Arhiva autonomă este `dist/simulari/compunerea-oscilatiilor/compunerea-oscilatiilor.zip`; include aplicația, teoria, traducerile și componentele comune locale. Se dezarhivează integral, apoi se deschide `index.html`. Resursele comune sunt incluse în HTML, fără CDN sau cereri de traducere.

Pachetul bibliotecii, `outputs/Praxis-Fizica-local.zip`, include și sursa externă intactă și importatorul. Nu s-a efectuat nicio publicare externă.

## Originea numelui Lissajous

Adăugată o notă istorică în Teorie și explicații, în RO/EN, cu referințe Smithsonian și Universitatea din Glasgow. Textul este în `scripts/adaptations/composition-history.html`, iar traducerile în namespace-ul `composition`. Cele șapte teme fizice originale rămân intacte. Nota este inclusă și în exportul offline.
