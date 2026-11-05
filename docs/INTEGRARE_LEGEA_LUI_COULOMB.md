# Legea lui Coulomb — integrare în Praxis

Integrat local la 5 noiembrie 2026, în capitolul **Electricitate, magnetism și circuite**, cu ID-ul `legea-lui-coulomb`. Apare și în lista laboratoarelor recente. Publicarea pe GitHub a fost solicitată ulterior, împreună cu corecția butonului „Respingere”.

## Sursă și regenerare

- Sursa păstrată: `Legea lui Coulomb/legea-lui-coulomb.html`.
- Importator: `scripts/import-coulomb.mjs`; logica adaptată: `scripts/adaptations/coulomb-app.js`.
- Model fizic și geometrie: `public/shared/coulomb-model.js`; stiluri: `public/shared/coulomb.css`.
- Dicționare în `public/locales/coulomb/`, catalog și dicționarele capitolului actualizate.
- Rezultat: `public/simulari/legea-lui-coulomb/`.

Regenerare: `npm run import:coulomb`, apoi `node scripts/build-courses-offline.mjs --course=legea-lui-coulomb` și `npm run build`. Arhiva autonomă include toate resursele necesare, RO/EN și formulele. Scriptul Cloudflare injectat în sursă nu este importat.

## Funcții și adaptări

Două sarcini între −10 și +10 μC, pas 0,1 μC; distanță între 10 și 100 cm, pas 1 cm. Preseturi de atracție și respingere, reset complet, grilă și vectori comutabili. Distanța se modifică și prin tragerea sarcinilor, săgeți, Home și End. Sunt folosite comenzile comune ±, culori Praxis/Vivid, sunetul comun, modul tactil și antetul cu navigare la capitol și bibliotecă.

Forța se calculează în SI cu `k = 8.9875517923 × 10⁹ N·m²/C²`. Vectorii au module egale și sensuri opuse; sarcina nulă produce forță nulă. Pentru 5 μC, 5 μC și 50 cm rezultă 0,89875517923 N. La 100 cm rezultatul este de patru ori mai mic.

Desenul distanței și lungimile săgeților sunt schematice, fapt explicat în interfață. Geometria păstrează săgețile separate și lasă loc întregului vârf inclusiv pe telefon. SVG-ul rămâne vectorial, cu sarcini accesibile ca slidere. Simularea este electrostatică; nu există animație temporală sau sunet continuu.

Teoria, exemplul rezolvat și provocările originale sunt păstrate. Formulele principale folosesc explicit motorul matematic comun. Textul are contrast pe fundal deschis; valorile folosesc cifre tabulare și casete stabile. Pe ecrane înguste, comenzile urmează imediat scena și rezultatele, înaintea explicațiilor suplimentare.

## Verificări

- `npm run check`: **398 teste trecute**, inclusiv patru teste Coulomb pentru conversii SI, scalare, sensuri, sarcini nule, geometrie și integrare.
- `npm run build`: finalizat; `git diff --check`: fără erori.
- Chrome: 3840×2160 DPR 1, 1920×1080 DPR 2, 1366×768, 1024×768, 390×844; RO/EN, Laborator/Teorie, mărimea textului 100%/200%. Cele 40 de combinații nu au overflow orizontal sau erori matematice. Rezultatele sunt în `docs/coulomb-browser-checks.json`.
- Verificare vizuală pe desktop, telefon și mod tablă/tactil; ținte tactile de 52 px, culori Vivid, formule lizibile. Pe laptop, scena, rezultatele și comenzile sunt vizibile împreună după aducerea zonei laboratorului sub antet.
- Tragere reală cu mouse-ul: distanța ajunge la 100 cm; tastatura modifică 50 → 51 cm; butonul + modifică 5 → 5,1 μC. Grila/vectorii se ascund și Reset restabilește 5 μC, 5 μC, 50 cm și ambele opțiuni.
- Arhiva deschisă direct prin `file://`: funcțională, RO/EN, fără resurse HTTP, fără erori în consolă; descărcarea redundantă este ascunsă.
- Legătura din catalog și traducerea cardului au fost verificate în browser.

Emularea tactilă și rezoluțiile au fost verificate în Chrome; nu s-a folosit o tablă fizică sau un telefon fizic.

## Corecție înainte de publicare

Butoanele rapide folosesc lățimea necesară etichetei și păstrează textul pe un singur rând. Dacă spațiul este insuficient, se mută întregul buton. Verificat în Chrome la 1366×768, 1024×768 și 390×844, RO/EN și text 100%/200%: toate cele trei etichete au un singur rând, fără tăiere sau overflow. Arhivele offline au fost regenerate pentru a include și adaptările comune ale integrării.
