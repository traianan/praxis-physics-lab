# Catalogul tipurilor de conținut Praxis

Use one small decorative icon per meaningful heading or navigation item. Keep its text label. Never decorate individual equations, scientific symbols, controls or every paragraph.

| Tip | RO / EN | Pictogramă | Utilizare |
| --- | --- | --- | --- |
| `introduction` | Introducere / Introduction | Fără pictogramă | Lesson overview and objectives; the title already supplies hierarchy. |
| `theory` | Explicații / Explanations | book | Definitions, physical interpretation and theoretical derivations. |
| `simulation` | Simulare / Simulation | flask | Interactive scenes and animated demonstrations. |
| `experiment` | Experiment / Experiment | flask | Measurements, instrument controls and experimental protocols. |
| `diagram` | Grafice și rezultate / Graphs and results | chart | Plots, diagrams, measured values and result summaries; not individual axes. |
| `formula` | Formule / Formulas | formula | Named formula collections and formula maps; never inside mathematical expressions. |
| `problem` | Probleme rezolvate / Worked problems | pencil | Problem statements and worked solutions; not each algebraic step. |
| `assessment` | Verificare / Self-check | check | Quizzes, numerical questions and self-assessment sections. |
| `summary` | Sinteză / Summary | book | Recap tables and concept summaries. |
| `glossary` | Glosar / Glossary | book | A collection of definitions; not each individual term. |
| `journal` | Jurnal de laborator / Lab journal | book | Editable observations and experiment records; preserve users' text. |
| `resources` | Resurse / Resources | link | Further lessons, references and offline downloads. |
| `note` | Precizare științifică / Scientific note | Fără pictogramă | Model limits, assumptions and scientific cautions; use quiet borders rather than repeated icons. |
| `controls` | Controale / Controls | Fără pictogramă | Sliders, numerical inputs and playback. Retain their existing functional icons. |

Sursa unică este `public/design-system/content-types.json`. Sunt șapte pictograme SVG locale, fără fonturi sau servicii externe.

Pentru conținut nou, marchează titlul cu `data-content-type="simulation"` (sau tipul potrivit). Componenta comună îl recunoaște automat. `data-no-content-icon` exclude un titlu. Nu adăuga iconuri în formule, Canvas, jurnale editabile sau în fiecare paragraf.

Build-ul include registrul și rendererul în antetul comun, inclusiv în distribuțiile autonome. Auditul euristic este doar o completare pentru lecțiile importate; atributul explicit este contractul pentru conținutul nou.
