# Revizie laboratoare și integrare funcție de gradul al doilea — 2026-11-18

## Revizie toate laboratoarele și lecția de gradul al doilea

1. Auditează toate laboratoarele existente: activități principale/secundare, spațiere, contururi, titluri, overflow și încadrare pe tablă. Separă constatările reale de cadre/scene intenționate fără padding.
2. Aplică remedii în surse/adaptoare, validează laboratoarele afectate în RO/EN și la dimensiunile proiectului; regenerează arhivele, publică și verifică producția.
3. Evaluează sursa `D:/ProiecteAI/functia-gradul-al-doilea/index.html`; integrează lecția în Elemente de matematică, completează funcțiile necesare și verifică formulele cu SymPy.
4. Testează noua lecție, afișarea tactilă, traducerile, offline și CI; publică și verifică producția. Păstrează rezultatele în PROGRESS.md.

## Revizie integrală după captura spațiului liber

1. Măsoară toate cele opt taburi existente; identifică paddingul de 120 px, lățimile imbricate și conținutul excedentar.
2. Separă Probleme / Calculatoare / Verificare; adaugă activități explicite în teorie, experimente și resurse, fără schimbarea ecuațiilor. Normalizează spațierea și ierarhia titlurilor.
3. Verifică toate activitățile RO/EN, text 100/200%, Mod tablă, desktop/tabletă/mobil; testează interacțiunile și accesibilitatea, inclusiv titlurile.
4. Regenerează arhiva, rulează CI, publică pe GitHub și verifică producția.

Revizie implementată și publicată: 740 stări de layout, 58 stări axe fără încălcări, 32 combinații tactile, interacțiuni locale/offline și CI 490 teste trecute (7 omise). Incluse regresiile ancorelor repetate și ale Canvasului demontat. Confirmarea producției se rulează prin `PRAXIS_QA_BASE=https://praxis-physics-lab.vercel.app node scripts/qa/ohm-layout-interactions.mjs`; raportul este în `outputs/ohm-layout/online-final.log`.

1. Reproduce suprapunerile în circuit și măsurări; verifică harta fără suport CSS @scope.
2. Generează CSS compatibil cu Chrome Android mai vechi și rezervă spațiu separat pentru citiri, simboluri și explicații. Păstrează modelele electrice și starea React.
3. Verifică nodurile/căutarea/zoomul/navigarea hărții, ambele montaje, preseturi/extreme, RO/EN, text 100–200%, 1920×1080/3840×2160 și layouturi înguste.
4. Regenerează distribuția și arhiva Ohm, rulează regresiile și verificările proiectului; consemnează ce a fost emulat și limitele testării pe tabla fizică.

Finalizat: implementare, verificări locale/offline, publicare și repetarea celor 60 stări pe producție. Rezultate și limitări în PROGRESS.md.
