# Indicii din texte, formule și etichete

Solicitare: corectarea lui `v_f` din explicația corzii, auditarea indicilor în întreaga aplicație și publicarea pe GitHub.

## Cauză și corecție

Nota din componenta React a corzii trecea direct prin traducere, ocolind componenta de prezentare matematică. Ea folosește acum helperul React pentru proză științifică, păstrând punctuația propoziției. Rendererul comun păstra anterior unii indici ca text brut în fragmentele de proză dinaintea sau după o ecuație; acele fragmente folosesc acum elemente `sub`/`sup`, cu escaping și fără a interpreta propoziții întregi ca formule.

Corecția acoperă indici cu underscore simplu ori acolade și indici Unicode. Exemple confirmate în audit: `v_f`, `T_f`, `v_min`, `v_max`, `F_f`, `F_cp`, `a_t`, `a_n`, `c_p`, `T_i`, `M_1`, `r_1`. Stilul comun păstrează indicele mai mic, sub linia de bază și alăturat literei.

În Mișcarea rectilinie, o ecuație și explicația ei erau reunite de scanarea automată. Sunt păstrate acum ca noduri separate; ecuația lui Galilei își păstrează indicii și exponenții matematici.

## Verificare

- Audit inițial: notații neformatate confirmate în opt laboratoare.
- Audit după corecție: toate cele 19 laboratoare, 316 stări RO/EN, secțiuni și activități; explicațiile pliabile native au fost deschise pentru inspecție.
- Nicio notație cu underscore rămasă neformatată în textele vizibile sau în apelurile native Canvas inspectate. Opțiunile HTML native au fost verificate și static: nu conțin astfel de notații.
- În explicația corzii, verificarea geometrică în browser confirmă că `f` este mai mic, coborât și alăturat lui `v`. Schimbarea limbii păstrează timpul fizic, iar cele două condiții de reflexie rămân corecte.
- 309/309 teste ale aplicației trecute, inclusiv regresia pentru indici în proză și pentru familiile găsite de audit.
- Cele 18 arhive autonome regenerate, optica integrată sincronizată și build reușit.

Rezumat: `docs/VERIFICARE_INDICI_BROWSER_2026-11-03.json`.

Reproducere: `node scripts/qa/scientific-math-browser.mjs --indices`. Pentru site se adaugă `--base=https://praxis-physics-lab.vercel.app`. Auditul verifică stările descrise, nu fiecare combinație numerică posibilă sau fiecare problemă aleatorie.
