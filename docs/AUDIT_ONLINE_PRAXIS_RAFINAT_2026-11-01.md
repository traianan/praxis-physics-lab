# Audit online Praxis rafinat — 1 noiembrie 2026

Domeniu verificat: https://praxis-physics-lab.vercel.app/. Auditul inițial privește versiunea publicată din commitul `13354b4`. Au fost verificate toate cele **19 laboratoare**, în **57 de configurații**, cu **689 stări de navigare/afișare**. Numărul include stările inițiale RO/EN și selecții repetate; nu reprezintă 689 pagini distincte.

## Metodă

Chrome într-un context de audit izolat: desktop 1440×1000 px, tabletă portret 768×1024 px cu touch și telefon 390×844 px cu emulare mobilă/touch. Este emulare în browser, nu test pe hardware fizic sau în Safari. Preferințele de audit sunt separate de browserul utilizatorului.

Helperul `scripts/qa/production-responsive-audit.browser.js`, încărcat numai în contextul de audit, parcurge taburile, subtaburile și selectorul de secțiuni. Prima stare este RO; navigarea aprofundată este EN. Varianta locală a helperului din `outputs/` memorează stilurile și dreptunghiurile controalelor doar pe durata unei măsurări, fără să schimbe criteriile sau aplicația.

Sunt măsurate lățimea documentului, tăierea textului prin overflow, coliziunile între controale, limitele textelor Canvas, etichetele SVG mici și resursele HTTP eșuate. Se verifică separat culorile introducerii și accentul mentă. Capturile inițiale ale fiecărei configurații sunt inspectate vizual; candidații necesită confirmare în context.

| Laborator | Desktop | Tabletă | Telefon |
| --- | ---: | ---: | ---: |
| Oglinzi și lentile | 4 | 4 | 4 |
| Mișcarea rectilinie | 6 | 6 | 6 |
| Unde mecanice | 52 | 52 | 52 |
| Calcul vectorial | 19 | 19 | 19 |
| Viteza și accelerația | 6 | 6 | 6 |
| Mișcarea curbilinie plană | 5 | 5 | 5 |
| Noțiuni termodinamice de bază | 21 | 21 | 21 |
| Calorimetrie | 15 | 15 | 15 |
| Principiul I al termodinamicii | 8 | 8 | 8 |
| Interacții atomice | 6 | 6 | 6 |
| Aplicații ale principiului I al termodinamicii | 13 | 13 | 13 |
| Transformări de stare de agregare | 14 | 14 | 14 |
| Oscilatorul mecanic | 7 | 12 | 7 |
| Oscilatori mecanici cuplați | 5 | 5 | 5 |
| Compunerea oscilațiilor | 4 | 4 | 4 |
| Figuri Chladni | 4 | 4 | 4 |
| Mișcarea circulară uniformă | 9 | 9 | 9 |
| Principiile mecanicii newtoniene | 11 | 11 | 11 |
| Motoare termice | 19 | 19 | 19 |

## Constatări

- **0 stări semnalate** pentru overflow de document, text tăiat, controale suprapuse sau text Canvas în afara desenului în parcurgerea de bază.
- **0 resurse HTTP eșuate** raportate în configurațiile parcurse. Niciun traseu nu a atins plafonul de stări al helperului.
- Toate cele 57 de configurații au încărcat introducerea petrol `rgb(16,63,59)` și accentul comun `#c5e8a5`.
- **Diferență vizuală confirmată și corectată:** în Viteza și accelerația (`.nav-btn`) și Mișcarea curbilinie plană (`.tab-btn`), selecția principală rămânea verde pal. Selectorii premium acopereau numai `.tab`. Regulile comune includ acum `[role=tab]` și starea ARIA/`.active`, strict în `.praxis-lab-nav`. Se aplică aceeași selecție petrol, text deschis și reper mentă, fără modificarea motoarelor sau culorilor științifice.
- Înainte de corecție, fundalul tabului activ era `rgb(237,242,233)`; după corecție, verificarea locală arată `rgb(16,63,59)` cu reper `rgb(197,232,165)`. Tranziția de 160 ms este lăsată să se încheie înainte de măsurarea culorii.

## Validare și dovezi

Construirea a reușit; `npm run check`: **201/201 teste trecute** după corecție. Revizuirea independentă nu a semnalat probleme în selectorii noi. Optica, cele 18 arhive autonome și pachetul local sunt regenerate prin scripturile existente.

Dovezile complete sunt locale, în `outputs/praxis-rafinat-online-audit/`: 57 de rapoarte JSON, capturi JPEG și planșe comparative `*-contact.jpg`; `summary.json` conține agregarea. Retestările ulterioare publicării sunt păstrate separat în subdirectorul `post-fix/`, pentru a nu amesteca versiunile din auditul inițial.

## Limitele concluziei

Rezultatul privește stările, limbile și dimensiunile enumerate. Nu este un audit fizic nou, o verificare a fiecărei combinații de parametri, a fiecărui cadru animat sau a fiecărui acordeon/dialog închis. Un grafic mai lat decât telefonul poate avea derulare internă intenționată; aceasta este diferită de tăierea inaccesibilă a conținutului. Antetul sticky care trece peste conținut la derulare nu este tratat ca suprapunere între controale din același flux.
