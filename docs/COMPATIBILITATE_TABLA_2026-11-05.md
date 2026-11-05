# Compatibilitate matematică și graficul politropei

## Dispozitiv raportat de utilizator

Tabla Horizon, model ID65HZA3B1/C, Android 13, firmware V3.2.1build231114, MCU V1.0.0 build230815, RAM 8 GB, stocare 128 GB. Versiunea browserului/WebView nu apare în fotografia dispozitivului; nu o deducem din versiunea Android.

Fotografiile arată sursa TeX (`\\mathrm{const.}`, `\\displaystyle`) în locul formulelor. Acest simptom este compatibil cu afișarea adnotării TeX de către un browser fără suport MathML. Nu reprezintă o confirmare de la distanță a versiunii sau a defectului exact al browserului.

## Implementare

- `public/shared/math-compatibility.js` verifică geometria unui element MathML `mspace`, fără identificarea modelului, sistemului de operare sau user-agentului.
- Dacă MathML funcționează, rendererul și opțiunile anterioare sunt păstrate. Testul compară exact HTML-ul rezultat cu randarea anterioară; nu este injectată foaia CSS alternativă.
- Dacă nu funcționează, formulele comune folosesc KaTeX HTML+MathML. CSS-ul ascunde vizual adnotarea și păstrează suportul pentru tehnologiile asistive. CSS-ul și fonturile WOFF2 sunt încorporate local, inclusiv în arhive, fără CDN sau cereri de rețea.
- Sursa TeX și actualizările dinamice/RO–EN rămân gestionate de mecanismul existent. Rendererul KaTeX al lecțiilor care îl folosesc deja nu este înlocuit.
- Graficul politropei are acum o lățime limitată (maximum 560 px pentru canvas, 640 px pentru stand). Coordonatele logice 440×320 și ecuațiile nu au fost modificate. Politica comună de rezoluție continuă să dimensioneze bufferul după suprafața efectivă și DPR.
- Varianta mobilă păstrează diagrama minimă de 440 px cu derulare locală, pentru etichete lizibile.

## Verificări

- `npm run check`: 400 de teste trecute, inclusiv randare modernă identică și randare alternativă cu fonturi locale.
- `npm run build` și toate arhivele autonome regenerate.
- Chrome, politropă: 3840×2160 DPR 1, 1366×768 și 1024×768: canvas 544×395,625 px, buffer 1088×791; 1920×1080 DPR 2: buffer 1632×1187; mobil 390×844: canvas 440×320, buffer 880×640. Fără overflow orizontal al paginii.
- Rendererul alternativ verificat în browser prin simularea explicită a lipsei geometriei MathML: exponentul din formula dinamică se actualizează corect, HTML-ul matematic este vizibil, stratul MathML ocupă 1×1 px și fonturile sunt încărcate.
- În browserul modern detectarea rămâne pozitivă, fără stylesheet alternativ; RO/EN și text mărit verificate.

Nu s-a testat pe tabla fizică. Verificarea alternativă în Chrome nu emulează toate particularitățile browserului școlii. Publicarea modificărilor a fost solicitată ulterior, la 5 noiembrie 2026.

Surse tehnice: [Chrome 109 — introducerea MathML Core](https://developer.chrome.com/blog/new-in-chrome-109/), [opțiunile de ieșire KaTeX](https://katex.org/docs/options).
