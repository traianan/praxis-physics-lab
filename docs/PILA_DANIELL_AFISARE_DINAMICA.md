# Citiri stabile și notații ionice — 2026-11-04

Numărul de zecimale era deja fix pentru fiecare mărime. Problema era înlocuirea întregului DOM al citirilor la fiecare cadru, inclusiv gazda matematică ΔᵣG, care aștepta apoi formatarea asincronă. Bilanțul flex putea redistribui elementele când valorile își schimbau lățimea.

Rendererul păstrează acum nodurile și actualizează numai textul valorilor schimbate. Reface etichetele doar la schimbarea limbii/paletei; formatarea matematică este imediată când runtime-ul este disponibil, cu indici HTML ca rezervă. Bilanțul are celule stabile, etichete deasupra valorilor și cifre tabulare. Valorile care se rotunjesc la zero nu mai afișează minusul erorii numerice. Preciziile și calculele fizice sunt neschimbate.

SVG-ul folosește tspan cu poziționare sub/super explicită pentru K⁺, NO₃⁻, Zn²⁺, Cu²⁺, electroni și formulele sărurilor. Legenda și concentrațiile din bilanț folosesc sub/sup HTML. Culorile, formele și sensurile de migrare sunt păstrate.

Verificări locale:
- `npm run check`: 383/383 teste; `npm run build`.
- `scripts/qa/daniell-live-readouts.mjs`: 60 cadre cu stări controlate în fiecare combinație RO/EN, 1366/390 px, text 100/200%; identitatea nodurilor și pozițiile câmpurilor stabile, precizie fixă, ΔᵣG prezent, indici/sarcini corecte, fără overflow. Start/Pauză prin mouse și atingere emulată.
- `scripts/qa/daniell-browser.mjs`: cinci dimensiuni până la 3840×2160, DPR 1/2, RO/EN, text 100/200%, comenzi, export CSV, navigare bibliotecă/capitol, mod tablă și sunet. Fără erori JS sau resurse eșuate. Mediană cadre 16,7 ms; randare P95 5–5,5 ms în mediul testat.
- Inspecție vizuală a capturii desktop; rapoarte și capturi în `outputs/daniell-live-*` și `outputs/daniell-bridge-*`.

Aceleași scripturi acceptă `PRAXIS_DANIELL_BASE` pentru verificarea publicării. Limite: touch/DPR emulate; dispozitive fizice, Safari și Firefox netestate. Laboratorul nu are o arhivă autonomă în registrul existent; această corecție vizează distribuția web.

Verificarea online a necesitat așteptarea explicită a traducerii asincrone în scriptul QA. A expus și suspendarea după o rearanjare: callbackul de vizibilitate lua prima intrare din lot, putând ignora revenirea în viewport. Acum folosește ultima intrare. Verificarea locală repetată a trecut pentru toate cele opt combinații, inclusiv pornire/pauză la text 200%.
