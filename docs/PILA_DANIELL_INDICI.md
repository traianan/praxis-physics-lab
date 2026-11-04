# Corectarea indicilor — 2026-11-04

Paragrafele foloseau notații plate precum cZn, Pextern și ΔrG°. Acum declară explicit sursa pentru rendererul comun PraxisMath, cu indici pentru concentrații, puteri, mase și reacție, respectiv exponentul standard 0. Eticheta ΔᵣG din bilanț folosește același renderer. Modelul fizic nu este modificat.

Validare locală: 13 teste Daniell trecute; build reușit. Verificarea Chrome automată acoperă teoria și activitățile în RO/EN, lățimi 1366 și 390 px, text 100% și 200%, poziția indicilor față de bază, traducerile, păstrarea stării, bilanțul și resetarea. Fără erori JavaScript, resurse HTTP eșuate sau depășire orizontală. Inspecție vizuală a capturii desktop. Nu s-au testat dispozitive fizice sau Safari.

Script reproductibil: `scripts/qa/daniell-indices.mjs`. `PRAXIS_PLAYWRIGHT_MODULE` poate indica modulul Playwright instalat; `PRAXIS_DANIELL_BASE=https://praxis-physics-lab.vercel.app` selectează verificarea online. Rapoartele și capturile se scriu în `outputs/daniell-indices-*` (nepublicate).
