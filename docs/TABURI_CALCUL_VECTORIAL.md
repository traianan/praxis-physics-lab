# Calcul vectorial — navigare prin taburi

28 octombrie 2026. Cele 14 secțiuni originale sunt grupate astfel:

| Tab principal | Conținut / subtaburi |
| --- | --- |
| Bazele vectorilor | Mărimi vectoriale; Componente și versori |
| Operații cu vectori | Adunarea a doi vectori; Regula poligonului; Scăderea vectorilor; Înmulțirea cu un scalar; Descompunerea |
| Produse de vectori | Produsul scalar; Produsul vectorial; Produsul mixt |
| Calculator | Calculatorul și vizualizarea 3D |
| Fișă recapitulativă | Toate formulele originale |
| Test | Cele opt întrebări și punctajul original |
| Resurse | Resursele și descărcarea lecției |

Se afișează un singur subiect. Cuprinsul lateral și selectorul redundant sunt înlocuite de taburi, iar spațiul disponibil este folosit pentru text și figuri. Taburile se rearanjează pe rânduri pe tabletă și telefon. Navigarea cu săgețile, Home și End funcționează în ambele niveluri; relațiile tab–panel și selecția sunt expuse prin ARIA.

Nodurile originale sunt păstrate, astfel încât valorile vectorilor, controalele, calculatorul, pozițiile scenelor 3D și răspunsurile testului rămân între taburi. Fiecare grup reține ultimul subiect selectat. Hashurile originale `#s1`–`#s14`, ancorele către figuri și calculator, precum și Înapoi/Înainte activează subiectul potrivit. Demonstrațiile ascunse sunt anulate; rotația 3D nu rulează în panouri ascunse. La revenire se recalculează dimensiunea desenului fără resetarea modelului.

Implementare: `public/shared/vector-tabs.js` și `vector-tabs.css`. Adaptarea reversibilă a ciclului de animație este în `scripts/vector-navigation-adapter.mjs`; importatorul comun o aplică după adaptările fizice. Verificarea provenienței elimină ambele adaptoare și compară integral sursa, deci conținutul lecției și ecuațiile rămân verificate.

Regenerare: `npm run import:courses`, `npm run check`, `npm run package:local`. Arhiva autonomă și pachetul local includ noua navigare, RO/EN și paleta universală.
