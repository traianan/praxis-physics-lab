# Principiul I al Termodinamicii — Aplicații

Aplicație web interactivă pentru **subcapitolul 1.4 „Aplicatii ale principiului I al termodinamicii”** din manualul *Fizica, clasa a X-a* (Mantea & Garabet, Editura ALL), paginile 33–38.

Conținut organizat ca în manual, cu teorie, demonstrații animate, formule, slidere, probleme rezolvate pas cu pas, un quiz de verificare și sunet sintetizat pentru evenimente fizice. **Bilingv română / engleză.**

## Cum se folosește

Deschide pur și simplu `index.html` în browser — funcționează și de pe disc (`file://`), fără server și fără internet.

Navigarea se face prin hash (`#izocor`, `#adiabat` …), deci butoanele back și forward ale browserului funcționează. Pentru un server local:

```powershell
python -m http.server 8777
# apoi http://127.0.0.1:8777/
```

## Structura

| Cale | Rol |
|---|---|
| `index.html` | shell SPA, cele 11 secțiuni, întreg textul |
| `css/styles.css` | tema închisă, randarea formulelor, layout responsiv |
| `js/math.js` | mini-randator de formule (fracții, indici, radicali) scris de la zero |
| `js/i18n.js` | dicționarul RO/EN (202 chei) + rezolvările pas cu pas |
| `js/audio.js` | sunete sintetizate cu Web Audio API (fără fișiere audio) |
| `js/sims.js` | cele 9 demonstrații pe canvas |
| `js/quiz.js` | 13 întrebări de verificare, scor și feedback |
| `js/app.js` | navigare, slidere, tabele, limbă, sunet, bucla de animație |
| `check.mjs` | verificare statică (chei lipsă, randarea formulelor, ID-uri) |
| `check.browser.mjs` | verificare de rulare cu Playwright (opțională, nu intră în aplicație) |

## Secțiuni

1. **Acasă** — principiul I, convenția de semne, harta subcapitolului
2. **Călduri molare** — C_V = (i/2)R, relația lui Mayer C_p = C_V + R, demo cu moleculă mono/biatomică
3. **Tabelul 1.4.1** — valori experimentale γ versus teorie, abateri
4. **Izocor**, **Izobar**, **Izoterm**, **Adiabatic** — fiecare cu demonstrație p–V, formule și problemă rezolvată
5. **Sinteza (Tabelul 1.4.2)** — toate procesele într-un singur grafic
6. **Procese politrope** — familia pVⁿ = ct, n = (C − C_p)/(C − C_V)
7. **Quiz** și **Resurse** — 13 întrebări, apoi legături externe

## Corecții aduse textului manualului

Aplicația semnalează explicit trei probleme găsite în paginile 33–38:

- **Ex. 1.4.2, pag. 35** — se înmulțește cu 2 în loc de (p₂/p₁ − 1) = 1; valoarea corectă este Q ≈ 210,1 J, nu 420,2 J.
- **Ex. 1.4.4, pag. 37** — enunțul spune „1 kmol”, dar datele (V₁ = 10 cm³) corespund la circa 10⁻⁶ mol; rezultatul L = 0,6 J este corect pentru volumele date.
- **pag. 35** — propoziția care deduce ΔU pentru izobar este rămasă neterminată („se găsește că …”); aplicația o completează.

Fiecare corecție apare în pagină cu o etichetă vizibilă, alături de textul original al manualului.

## Offline și dependențe

**Zero dependențe externe**: fără CDN, fără npm, fără fonturi de rețea, fără fișiere audio sau imagini. Sunt doar fișiere statice (≈ 220 KB în total), iar testul de rulare confirmă **nici o cerere către rețea** — pagina se poate deschide direct de pe `file://`, fără internet. Doar secțiunea *Resurse* conține legături către pagini externe — ele necesită internet, dar nu sunt necesare aplicației.

Sunetul se activează după primul gest pe pagină (politica browserelor); poate fi oprit oricând cu butonul 🔊 din antet.

## Publicare pe GitHub Pages

Pentru publicare (de făcut manual, în GitHub):

1. Creează un repository, de exemplu `principiul-i-aplicatii`, și încarcă **tot conținutul acestui folder** în rădăcina lui (`index.html`, `css/`, `js/`).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `/ (root)`**, branch `main`.
3. Pagina va fi la `https://<utilizator>.github.io/<repository>/`.

Dacă vrei un buton **Home** către site-ul portofoliului, verifică linkul din antet (`https://traianan.github.io/`).

## Verificare

```powershell
node --check js/app.js          # sintaxă pentru fiecare fișier
node check.mjs                  # verificări statice
node check.browser.mjs          # verificări de rulare (necesită Playwright + un server local pe 8777)
```

Suitele acoperă: cele 11 secțiuni, randarea a 116 formule fără pierdere de caractere, desenarea canvas-urilor, fizica valorilor actualizate de slidere, quizul complet, comutarea RO/EN, offline-ul și consola fără erori sau avertismente.

## Licență

Conținutul reproduce structura și problemele subcapitolului 1.4 din manualul școlar citat; textele sunt refăcute în scop didactic, pentru utilizare la clasă.
