# Transformări de stare de agregare — Subcapitolul 1.5

Aplicație web interactivă pentru **subcapitolul 1.5 „Transformări de stare de agregare”** din manualul *Fizica, clasa a X-a* (Mantea & Garabet, Editura ALL), paginile 38–45.

Conținut organizat ca în manual, cu teorie, demonstrații animate, formule, butoane, slidere, grafică în mișcare, probleme rezolvate pas cu pas, un quiz de verificare și sunet sintetizat pentru evenimente fizice. **Bilingv română / engleză.**

## Cum se folosește

Deschide pur și simplu `index.html` în browser — funcționează și de pe disc (`file://`), fără server și fără internet.

Navigarea se face prin hash (`#topire`, `#faze` …), deci butoanele back și forward ale browserului funcționează. Pentru un server local:

```powershell
python -m http.server 8791
# apoi http://127.0.0.1:8791/
```

## Structura

| Cale | Rol |
|---|---|
| `index.html` | shell SPA, cele 11 secțiuni, întreg textul |
| `css/styles.css` | tema închisă, randarea formulelor, layout responsiv |
| `js/math.js` | mini-randator de formule (fracții, indici, radicali, `\circ` → °) scris de la zero |
| `js/i18n.js` | dicționarul RO/EN (≈ 358 chei per limbă) + rezolvările pas cu pas |
| `js/audio.js` | sunete sintetizate cu Web Audio API (fără fișiere audio) |
| `js/sims.js` | cele 10 demonstrații pe canvas |
| `js/quiz.js` | 13 întrebări de verificare, scor și feedback |
| `js/app.js` | navigare, slidere, tabele, pași, limbă, sunet, bucla de animație |
| `check.mjs` | verificare statică (chei lipsă, randarea formulelor, ID-uri) |
| `check.browser.mjs` | verificare de rulare cu Playwright (opțională, nu intră în aplicație) |

## Secțiuni

1. **Acasă** — stările de agregare, transitionele dintre ele, harta subcapitolului și lista corecturilor aduse manualului
2. **Topire și solidificare (1.5.1)** — corp cristalin (platou de temperatură) versus amorf (înmuiere progresivă), căldura latentă specifică λ_t, demo de încălzire a gheții pe etape
3. **Anomalia apei** — dependența temperaturii de topire de presiune (Clausius–Clapeyron, pantă negativă pentru gheață)
4. **Tabelele 1.5.1.1 și 1.5.1.2** — puncte de topire și călduri latentă specifice, grafic cu bare interactiv
5. **Vaporizare (1.5.2)** — presat, presiunea maximă, dinamica moleculelor la suprafață
6. **Presiunea în vid** — tuburi Torricelli cu eter, echilibru lichid–vapori, independența p_m de volum
7. **Evaporare** — răcirea prin evaporare, factorii care o accelerează
8. **Fierbere** — clocotirea când p_sat(T) = p_externă, variația temperaturii de fierbere cu presiunea, Ex. 1.5.2.1
9. **Diagrama de faze și punctul triplu (1.5.3)** — curbele de sublimare, vaporizare și topire, punctul triplu al apei (273,16 K / 611 Pa)
10. **Verificare** — 13 întrebări cu scor și feedback
11. **Resurse** — legături externe (necesită internet, dar nu sunt necesare aplicației)

Demonstrațiile sunt reținute, nu supraîncărcate: fiecare pagină are câteva animații-cheie care ilustrează fenomenul, cu slidere pentru parametri și citiri dinamice.

## Corecții și completări aduse textului manualului

Aplicația semnalează explicit trei probleme găsite în paginile 38–45:

- **Ex. 1.5.1.1, pag. 40 vs. Tabelul 1.5.1.2** — pentru gheață tabelul dă λ_t = 334 kJ/kg, dar exercițiul folosește 3,35·10⁵ J/kg. Cu valoarea din tabel, Q₂ = 33 400 J și căldura totală devine **Q = 77 300 J, nu 77 400 J** (diferență de 0,3 %).
- **Ex. 1.5.2.1, pag. 45 — date de prisos** — la „se cunosc” este înscrisă și căldura specifică *c*, care nu intervine: picătura pornește de la 0 °C, deci nu există etapă de încălzire. Ar fi trebuit trecute doar λ_g și λ_v.
- **Ex. 1.5.2.1, pag. 45 — răspuns numeric lipsă** — exercițiul se oprește la formula f = λ_v/(λ_g + λ_v), iar subcapitolul nu dă nicăieri valoarea lui λ_v. Completând cu λ_v = 2,83·10⁶ J/kg (apă la 0 °C) și λ_g = 3,34·10⁵ J/kg rezultă **f ≈ 0,894**, adică îngheață aproape 9/10 din picătură.

Fiecare corecție apare în pagină cu o etichetă vizibilă, alături de textul original al manualului.

## Offline și dependențe

**Zero dependențe externe**: fără CDN, fără npm, fără fonturi de rețea, fără fișiere audio sau imagini. Sunt doar fișiere statice (≈ 269 KB în total), iar testul de rulare confirmă **nicio cerere către rețea** — pagina se poate deschide direct de pe `file://`, fără internet.

Aplicația este scrisă în JavaScript vanilla și nu are nevoie de nicio bibliotecă instalată. Singura unealtă externă opțională este Playwright, folosită doar de `check.browser.mjs` pentru verificări locale de rulare; aceasta nu face parte din aplicație.

Sunetul se activează după primul gest pe pagină (politica browserelor); poate fi oprit oricând cu butonul 🔊 din antet.

## Publicare pe GitHub Pages

Pentru publicare (de făcut manual, în GitHub):

1. Creează un repository, de exemplu `transformari-stare-agregare`, și încarcă **tot conținutul acestui folder** în rădăcina lui (`index.html`, `css/`, `js/`).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → `/ (root)`**, branch `main`.
3. Pagina va fi la `https://<utilizator>.github.io/<repository>/`.

Dacă vrei un buton **Home** către site-ul portofoliului, verifică linkul din antet (`https://traianan.github.io/`).

## Verificare

```powershell
node --check js/app.js          # sintaxă pentru fiecare fișier
node check.mjs                  # verificări statice (toate au trecut)
node check.browser.mjs http://127.0.0.1:8791/   # rulare (necesită Playwright + un server local)
```

Suitele acoperă: cele 11 secțiuni, randarea formulelor fără pierdere de caractere, desenarea canvas-urilor, fizica valorilor actualizate de slidere (inclusiv saltul la punctul triplu), tabelele din manual, problema rezolvată și eroarea semnalată, quizul complet, comutarea RO/EN, regimul `file://` offline și consola fără erori. La ultima rulare: **74/74 verificări de rulare trecute**.

## Licență

Conținutul reproduce structura și problemele subcapitolului 1.5 din manualul școlar citat; textele sunt refăcute în scop didactic, pentru utilizare la clasă.
