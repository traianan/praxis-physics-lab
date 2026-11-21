# Instrucțiuni pentru Praxis · Fizică

Înainte de adăugarea unui laborator sau de modificarea structurii, navigării,
randării ori comenzilor unuia existent, citește și respectă
[regulile pentru laboratoare](docs/REGULI_LABORATOARE.md).

Aceste reguli sintetizează deciziile utilizatorului din 2 noiembrie 2026.
Se aplică împreună cu instrucțiunile moștenite din `D:/ProiecteAI/AGENTS.md`.
Instrucțiunile ulterioare explicite ale utilizatorului au prioritate.

Păstrează regulile reutilizabile în acest ghid, iar rezultatele verificărilor și
particularitățile fiecărui laborator în documentația sa. Nu transforma exemplele
de dimensiuni sau numărul actual de teste în cerințe universale.

Pentru alegerea bibliotecilor în laboratoare noi, consultă
[analiza și inventarul bibliotecilor instalate](docs/BIBLIOTECI_SIMULARI_2026-11-14.md).
Reutilizează infrastructura existentă și încarcă bibliotecile opționale numai în
lecțiile care le folosesc; validează separat modelul fizic și exportul offline.

Use agent-browser for browser-based testing.

Before first use, run:
agent-browser skills get core

After implementing UI changes:
1. Start the local development server.
2. Open the application using agent-browser.
3. Test interactive controls and navigation.
4. Check JavaScript console errors.
5. Capture screenshots at desktop, tablet, and
   3840x2160 display resolutions.
6. Verify that the main simulation and controls
   fit inside the viewport without scrolling.
7. Fix detected problems and repeat the tests.

Do not claim visual verification unless browser
tests have actually been executed.

When working on scientific, mathematical, or physics-related tasks:

1. Check whether a relevant installed scientific skill is available.
2. Read its SKILL.md before using the workflow.
3. Prefer SymPy for symbolic verification.
4. Use Astropy for astronomical calculations.
5. Use Matplotlib or scientific-visualization for scientific plots.
6. Use paper-lookup for scholarly literature searches.
7. Check dependencies before running code.
8. Do not install missing dependencies without approval.
9. Report which skills were actually used.

For physics simulations, verify equations, units, limiting cases, and numerical results before accepting an implementation.

For scientific Python workflows on Windows, use:

C:\Users\traian\scientific-env\Scripts\python.exe

This environment contains the scientific Python dependencies.

Do not assume that the default Python interpreter has these packages installed.

Use the scientific environment for SymPy, Astropy, Matplotlib, and related calculations.

Do not install or upgrade Python packages without explicit approval.