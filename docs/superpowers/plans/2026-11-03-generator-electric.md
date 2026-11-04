# Generatorul electric — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if selected by the user. Steps use checkbox syntax for tracking.

**Goal:** Livrarea unui alternator interactiv, bilingv, integrat în Praxis-Fizica, cu model fizic independent și validare numerică și în browser.

**Architecture:** Motor ES pur, controller cu un singur ceas, scenă SVG și grafice Canvas. Componentele comune gestionează antetul, preferințele și workspace-ul; toate resursele de rulare sunt locale.

**Tech Stack:** JavaScript ES modules, HTML, CSS, SVG, Canvas, Node.js 24 disponibil (proiectul cere ≥22), node:test, instrumente Chrome DevTools pentru verificări interactive.

**Spec:** ../specs/2026-11-03-generator-electric-design.md — aprobată de utilizator la 3 noiembrie 2026.

## Global Constraints

- Sursa autoritativă este public/; dist/ se generează prin npm run build.
- Se reutilizează PraxisLabHeader, PraxisLabWorkspace, PraxisI18n, PraxisMath, PraxisSound și paleta/rezoluția comune.
- RO/EN complet; ținte de minimum 44 px; text 100%/200%; fără resurse externe la rulare.
- Nu se modifică laboratoare existente pentru a introduce noul model și nu se publică remote fără solicitare.
- Un singur timp pentru scenă, grafice, formule și energie. Viteza implicită de redare este 0,1 s simulat/s real, etichetată.
- Parametrii fizici se schimbă în pauză și resetează măsurarea; limba, paleta, redimensionarea și textul păstrează măsurarea.

## Review Focus

1. Circuit deschis: tensiunea la borne rămâne e, deși i=0; test în Task 1 și verificare vizuală în Task 3.
2. Timp foarte mic sau ω aproape zero: energie nenegativă și stabilă; test în Task 1.
3. Reluări repetate după tab ascuns și schimbarea secțiunii: fără salt de timp și fără bucle duplicate; verificare în Task 2/3.
4. Traducere și Mod tablă în timpul măsurării: aceiași parametri, timp și controale funcționale; verificare în Task 3.
5. Frecvențe mari și ecran îngust: grafice suficient eșantionate și avertizare de alias vizual; verificare în Task 2/3.

## Task 1 — Motor fizic independent

**Files:** Create public/shared/generator-model.js; test/generator-model.test.mjs.

**Interfaces:** export DEFAULTS; validateParameters(p); stateAt(p,t); energyBetween(p,start,end). Parametrii: N,B,A,omega,R,r,theta0,open. Starea: theta,flux,linkage,emf,current,voltage,frequency,period,emfPeak,emfRms,currentRms,voltageRms,torque,pMechanical,pLoad,pCopper. Energia: mechanical,load,copper. Toate mărimile în SI; period=null la repaus.

- [x] Scrie teste de referință: N=100, B=0.5, A=0.01, omega=10π, R=20, r=2, theta0=0; t=0,0.05,0.10,0.15,0.20. La t=0.05: emf=15.707963267948966 și current=0.7139983303613167, toleranță 1e−9.
- [x] Rulează node --test test/generator-model.test.mjs și confirmă absența motorului ca motiv al eșecului inițial.
- [x] Implementează soluția analitică din specificație, cu validare pentru valori nefinite, N fracționar și rezistență totală nulă. Integrarea energiei folosește o formulă stabilă la intervale mici.
- [x] Adaugă/verifică teste pentru B/A/N/ω zero, circuit deschis u=e și i=0, scurtcircuit R=0, inversarea ω la același θ, dublări de amplitudine și frecvență.
- [x] Verifică Faraday prin derivată centrală; energia prin cuadratură independentă; Pmec=Putil+Pcu, τω≤0, sarcina netă pe perioadă zero. Energia pe T=0.2 este 1.1215459546692452 J. Verifică intervale foarte mici și continuitatea pentru |ω| aproape zero.
- [x] Rulează din nou testul modelului: toate cazurile trebuie să treacă. Inspectează diff-ul și păstrează schimbările locale.

## Task 2 — Laboratorul și integrarea

**Files:** Create public/simulari/generator-electric/{index.html,app.js,view.js,style.css}; public/locales/labs/generator-electric/ui/{ro,en}.json; public/assets/generator-electric.svg; test/generator-integration.test.mjs. Modify public/catalog.js; public/locales/chapters/electricitate-magnetism-circuite/{ro,en}.json; public/design-system/lab-workspaces.json; package.json; README.md.

**Interfaces:** view.js export renderScene(svg,state,p), renderGraphs(canvases,p,t), renderReadouts(root,state,energy); app.js importă motorul și rendererul, gestionează controalele și expune numai o citire de diagnostic înghețată pentru QA. Rendererul nu avansează timpul și nu duplică ecuațiile motorului.

- [x] Scrie testele de integrare pentru intrarea de catalog generator-electric, capitol electricitate-magnetism-circuite, fișierele locale existente, configurația workspace și paritatea cheilor RO/EN. Rulează node --test test/generator-integration.test.mjs înainte de implementare și confirmă lipsa noii intrări.
- [x] Construiește pagina originală cu antetul comun montat prin PraxisLabHeader.mount({title,chapter,courseId,...}), breadcrumb permanent și workspace configurat în registrul comun; citește implementările comune înainte de apeluri, fără a copia HTML-ul generat cu traduceri înglobate al altui laborator.
- [x] Adaugă scena SVG cu polii, B, normala, θ, bobina și inelele, circuitul și sensul curentului convențional. Funcția stateAt produce toate valorile; indicatorul luminos reprezintă Putil. Verifică geometria la 0,π/2,π,3π/2, inclusiv inversarea axei ecranului.
- [x] Adaugă trei grafice Canvas cu unități, legendă, cursor comun și predicții etichetate; folosește PraxisCanvasResolution și eșantionare limitată adaptată lățimii. Numărul de puncte și memoria nu cresc cu durata redării.
- [x] Implementează Pornire/Pauză/Pas/Reset, parametri, reglaje −/+, preseturi și circuit deschis. Un singur RAF, suspendare la document/activitate ascunsă, fără recuperarea timpului ascuns. Butoanele rămân în noduri stabile.
- [x] Adaugă patru secțiuni, explicațiile modelului și limitelor, formulele PraxisMath și substituțiile, patru activități, două probleme rezolvate, șase întrebări cu feedback și cele patru URL-uri. Circuitul deschis are explicație dinamică u=e.
- [x] Integrează RO/EN prin runtimeul comun; traduce și atributele accesibile, SVG, Canvas și feedbackul. Schimbarea limbii nu recreează controllerul. Sunetul folosește numai componenta comună.
- [x] Înregistrează catalogul, metadatele bilingve, ilustrația și workspace-ul; adaugă verificarea sintaxei noilor module în npm run check. Actualizează README numai cu numărul verificat efectiv din catalog.
- [x] Rulează node --test test/generator-model.test.mjs test/generator-integration.test.mjs și verificarea sintaxei noilor module; confirmă trecerea testelor. Inspectează diff-ul și păstrează schimbările locale.

## Task 3 — Verificare în browser, performanță și raport

**Files:** Create scripts/qa/generator.browser.js; docs/INTEGRARE_GENERATOR_ELECTRIC.md; docs/generator-browser-qa.json. Update this plan's checkboxes and specification status.

**Interfaces:** Scriptul QA citește starea de diagnostic, DOM și dimensiunile reale; rezultatele consemnează browser, viewport, DPR și pașii executați. Nu modifică modelul și nu substituie interacțiunile native cu setarea directă a stării.

- [ ] Rulează npm run check și npm run build. Dacă apar eșecuri, diferențiază regresiile introduse de problemele preexistente și rezolvă regresiile înainte de a continua.
- [ ] Pornește serverul local din scripts/serve.mjs pe un port liber, servește dist, verifică în browser lipsa erorilor și resurselor 404/externe. Testează accesul din Home, capitol și URL direct și revenirea prin breadcrumb.
- [ ] Verifică toate controalele prin mouse și tastatură; touch prin emulare de dispozitiv și evenimente native de atingere dacă instrumentele permit. Verifică sliderele, −/+, preseturi și Start/Pauză/Pas/Reset după RO→EN→RO și schimbarea modurilor.
- [ ] Compară citirile, cursorul graficelor și geometria în punctele numerice de referință. Verifică repaus, câmp zero, sens invers, scurtcircuit și circuit deschis. Verifică suspendarea și lipsa saltului temporal la revenire.
- [ ] Testează 390×844, 768×1024, 1024×768, 1366×768, 1920×1080 DPR 2 și 3840×2160 CSS px DPR 1, text 100%/200%, Mod tablă și toate secțiunile în RO/EN. Inspectează capturi, lizibilitatea, overflowul și accesul la comenzi.
- [ ] După încălzire, colectează minimum 10 s de redare: cadre, mediană/p95 interval și cost de randare, cadre peste 33.3 ms, viewport/DPR/browser; ținta costului p95 este sub 16.7 ms pe desktopul testat. Raportează valorile măsurate, inclusiv eventualele depășiri.
- [ ] Rulează din nou verificările relevante după orice corecție, apoi npm run check și npm run build finale; inspectează dist. Nu repeta verificări după care nu s-a schimbat nimic fără motiv.
- [ ] Documentează toate rezultatele, limitele fizice și ce rămâne netestat: touch fizic, tabla reală, Safari/iOS sau publicarea live dacă nu sunt accesibile/solicitate. Revizuiește diff-ul integral și livrează raportul cu link spre laboratorul local, fără a pretinde publicare online.

## Auto-revizuire a planului

Specificația este acoperită de motor (Task 1), produs și resurse (Task 2), QA și raportare (Task 3). Interfețele folosesc aceleași nume în toate sarcinile; nu se adaugă backend sau dependențe. Cele cinci riscuri din Review Focus au verificări alocate. Nu se introduce export autonom separat, care nu a fost cerut; aceeași distribuție statică rulează online și prin server local.

Metodă recomandată: execuție nativă în acest chat, întrucât motorul, controllerul și rendererul au interfețe strâns legate; o revizuire independentă finală verifică rezultatul. Alegerea metodei și aprobarea acestui plan rămân de confirmat conform skill-ului writing-plans.

## Stare la 4 noiembrie 2026

Execuție nativă efectuată pe baza aprobării utilizatorului, cu revizuire independentă și corecțiile ulterioare cerute. Livrare locală construită; raport complet: docs/INTEGRARE_GENERATOR_ELECTRIC.md. Motor/geometrie/integrări: 361 de teste în suitele proiectului; QA mouse/touch emulat, 96 combinații responsive, formule RO/EN și navigare trecute. Compoziția HyperFrames trece cu un avertisment de organizare inline, documentat. Verificarea reală a filei ascunse/BFCache, hardware touch și Safari/iOS rămâne netestată; nu se marchează aceste verificări ca trecute. Nu s-a făcut publicare remote.
