# Pila Daniell — sensurile ionilor în puntea salină

4 noiembrie 2026. Modificare și publicare cerute explicit de utilizator.

- K⁺: cerc verde cu semnul +; deplasare spre Cu/catod, spre dreapta pe segmentul orizontal.
- NO₃⁻: pătrat violet cu semnul −; deplasare spre Zn/anod, spre stânga pe segmentul orizontal.
- Ambele specii sunt animate pe traseul complet în U, cu săgeți orizontale și legendă RO/EN. Decalarea traseelor este numai grafică, nu două canale fizice. Marcatorii sunt simbolici; nu pretindem urmărirea unor ioni individuali dintr-un vas până în celălalt.
- Poziția fiecărui marcator depinde de aceeași sarcină transferată din model. Pauza păstrează pozițiile; circuitul deschis, scoaterea punții și atingerea limitei reactantului opresc transportul afișat. Culorile provin din paleta științifică comună, inclusiv modul Vii; forma și semnul evită dependența exclusivă de culoare.
- Motorul electrochimic, valorile numerice și bilanțurile rămân neschimbate.

## Verificări locale înainte de publicare

`npm run check`: **381/381** teste trecute. `node scripts/build.mjs`: trecut.

Teste noi de geometrie pentru desktop și telefon: K⁺ merge spre dreapta, NO₃⁻ spre stânga; intrare ascendentă, ieșire descendentă, segment central orizontal și trasee distincte. Testele browser verifică deplasarea efectivă a markerelor SVG după un pas, culori distincte, cerc/pătrat și ascunderea săgeților când puntea este scoasă.

Suita Chrome include mouse/touch emulat, slidere, circuit/punte, Pas/Reset/Start/Pauză, CSV, RO/EN, toate secțiunile, text 100%/200%, cinci viewporturi, Mod tablă și navigare. Fără erori JavaScript, resurse lipsă sau overflow orizontal. Capturile desktop și telefon au fost inspectate vizual. Artefacte: `outputs/daniell-bridge-local.json` și capturile cu același prefix.

## Reproducere pe site-ul public

Același script acceptă `PRAXIS_DANIELL_BASE=https://praxis-physics-lab.vercel.app` și rulează pe site, fără server local. Playwright este indicat prin `PRAXIS_PLAYWRIGHT_MODULE`. Comandă: `node scripts/qa/daniell-browser.mjs`. Dovezile online sunt salvate în `outputs/daniell-bridge-online.json` și capturile cu același prefix. Integritatea fișierelor publicate se verifică separat față de sursele locale.

Limitări: touch și DPR emulate în Chrome/Windows; telefon fizic, tablă fizică, Safari și Firefox netestate.
