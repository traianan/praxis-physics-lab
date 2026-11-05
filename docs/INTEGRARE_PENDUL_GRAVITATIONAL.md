# Pendulul gravitațional — 5 noiembrie 2026

Laborator adăugat în **Sunete și unde**, cu ID `pendulul-gravitational`. Biblioteca are 24 de laboratoare. Nu a fost publicată nicio modificare externă.

## Surse și regenerare

- Sursa furnizată: `pendulul gravitational/pendulul-gravitational.html`, păstrată ca original.
- Importator: `scripts/import-pendulum.mjs`; adaptoare de structură și diagramă în `scripts/adaptations/pendulum-layout.js` și `pendulum-forces.svg`.
- Stil: `public/shared/pendulum.css`; CSS-ul original este generat în `pendulum-source.css` și izolat la lecție.
- Traduceri: `public/locales/pendulum/{ro,en}.json` și catalogul capitolului.
- Proveniență: `docs/imported-pendulum.json`; hashul sursei folosește LF pentru a evita diferențe exclusiv CRLF.

Regenerare:

```text
npm run import:pendulum
node scripts/build-courses-offline.mjs --course=pendulul-gravitational
npm run build
```

Distribuție: `dist/simulari/pendulul-gravitational/index.html`. Arhivă autonomă: `public/simulari/pendulul-gravitational/pendulul-gravitational.zip`. Se dezarhivează și se deschide `index.html`.

## Integrare și corecții

Antet, traseu Bibliotecă / Sunete și unde / Laborator, RO/EN, Mod tablă, preferințe, sunet global, steppere tactile și registru de workspace comune. Teoria și funcțiile laboratorului sunt păstrate. Mențiunile claselor școlare au fost eliminate din versiunea integrată; scriptul Cloudflare inserat în fișierul original nu este importat.

Simularea se suspendă în Teorie sau într-un document ascuns. Schimbarea limbii și redimensionarea nu resetează experimentul. Canvasurile folosesc politica comună de rezoluție, independent de modelul fizic.

Corecții cerute în verificarea vizuală:

- Text închis pe suprafețe deschise în toată teoria; formulele și descrierile nu mai sunt aplatizate împreună.
- 12 expresii de afișare declarate explicit în TeX, cu mărime uniformă, fracții și radicali structurali.
- Indicatorul măsurării are rând separat de legenda scenei; valorile θ/t/T și starea au lățimi stabile; tastele Space/R au contrast adecvat.
- Butoanele graficelor nu comprimă textul „Energie”.
- Diagrama forțelor: unghiul este între verticală și fir; componenta radială a greutății este orientată spre exterior, tensiunea spre suspensie; componentele însumate reproduc greutatea. Textul precizează `T − G_r = mv²/ℓ`.
- Viteza maximă este calculată din conservarea energiei, iar curba teoretică a perioadei folosește amplitudinea selectată, fără limitarea anterioară la 40°.
- Butonul **Echilibru** oprește pendulul vertical, anulează măsurarea curentă și resetează timpul/urma curentă; păstrează parametrii, punctele și tabelul. Reset reia de la amplitudinea aleasă.
- **Legendă comenzi**, sub grafic în coloana din dreapta, explică inclusiv impulsurile ←/→. Pe telefon coloanele devin verticale.

## Verificări

- `npm run check`: 394 de teste trecute după integrare și corecțiile diagramei/formulelor. Testul serverului a necesitat rularea cu acces la portul loopback temporar; prima încercare izolată returnase EACCES. După adăugarea comenzilor finale: sintaxă și cele cinci teste specifice pendulului reverificate.
- `test/pendulum.test.mjs`: comparație AGM cu integrarea numerică independentă a integralei eliptice, perioadă numerică, independență de masă, energie/amortizare, geometria vectorilor și paritatea traducerilor.
- Browser Chromium: 3840×2160/DPR1, 1920×1080/DPR2, 1366×768, 1024×768 și 390×844/DPR2; RO/EN și text 100%/200%, fără depășire orizontală. Dimensiunile au fost emulate, nu testate pe tablă fizică. Pe ecranele mici și la text mărit este necesară derularea verticală.
- Cele patru grafice, puncte/regresie, măsurare de 10 oscilații, Start/Pauză/Reset, Echilibru, gravitație personalizată, păstrarea stării la schimbarea limbii, suspendarea în Teorie, sunet global și intrare/ieșire din Mod tablă.
- Lățimi numerice stabile verificate inclusiv cu timp peste 1.000 s; indicatorul măsurării nu intersectează legenda. Formulele au 16 px la text 100% și nu au erori de randare.
- Distribuția autonomă deschisă prin `file://`: RO/EN, Echilibru și măsurători păstrate, fără cereri HTTP externe și fără erori în consolă. Descărcarea ZIP din distribuția Web răspunde cu HTTP 200.
- Audit reproductibil al afișării: `scripts/qa/pendulum.browser.js` (funcție de evaluat în pagina laboratorului).

Sursa originală include contexte/afirmații istorice care nu au fost supuse unui audit editorial complet; verificările științifice de mai sus acoperă modelul și corecțiile documentate.
