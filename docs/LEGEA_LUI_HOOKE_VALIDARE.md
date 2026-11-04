# Legea lui Hooke — integrare și validare

4 noiembrie 2026. Specificație, cele trei URL-uri documentate prin Firecrawl, ipoteze, unități și referințe numerice: [LEGEA_LUI_HOOKE.md](LEGEA_LUI_HOOKE.md).

## Actualizare pentru publicare
La cererea utilizatorului, pasajele cu indici sunt gazde explicite PraxisMath în modul prose, iar raportul ΔF_ap/Δx este o formulă TeX cu fracție și indice structural. SVG utilizează tspans poziționate explicit pentru indicii e/ap. Astfel, inserarea dinamică și traducerea RO/EN nu mai lasă indicii sub forma textului brut cu underscore.

Sliderul de viteză 0,1×…2× include câmp numeric, reglaj ± și raportul dintre timpul real și cel simulat. Ceasul separat `hooke-clock.js` nu modifică modelul fizic; are teste pentru scalare, limita cadrelor lungi, valori invalide și conservarea energiei. Auditul browserului verifică sliderul cu mouse și touch, păstrarea stării, pasul fix de 0,02 s, resetarea vitezei și indicii structurali în RO→EN→RO. Poate fi rulat pe producție cu `PRAXIS_HOOKE_BASE=https://praxis-physics-lab.vercel.app`.

Verificare locală după aceste modificări: **389/389 teste**, build reușit, auditul complet al browserului `passed: true`. Configurarea explicită a rândurilor grid elimină rândurile goale moștenite din layoutul generic; scena și cele patru slidere încap simultan la 1366×768 și 1024×768. Publicarea pe GitHub și pe site este autorizată explicit în solicitarea ulterioară a utilizatorului; limitarea privind publicarea de la validarea inițială, de mai jos, este istorică.

## Livrare
- Laborator nativ în `public/simulari/legea-lui-hooke/`, model pur în `public/shared/hooke-model.js`; distribuția Web rezultă din `npm run build`.
- Integrat în capitolul **Lucru mecanic, energie și putere**, catalog, cele mai noi laboratoare, căutare, traduceri RO/EN și configurația workspace comună.
- Navigare, antet, preferințe de text, culori, tactil, tablă și sunet prin componentele existente. SVG pentru scenă și grafice: nu există Canvas de display sau dependență de DPR în calculele fizice.
- Formule prin PraxisMath; exerciții, verificare conceptuală și surse în pagină. Cod, stiluri, traduceri și desenul de catalog sunt locale; PhET este o referință externă, nu un iframe necesar funcționării.
- Terminologie la cererea utilizatorului: **constanta elastică** (EN: spring constant).
- `scripts/register-hooke.mjs` regenerează idempotent metadatele și dicționarele din `content.js`. Fișierele native ale laboratorului sunt surse autoritative, nu importuri regenerate.

## Fizică
Cinci teste în `test/hooke.test.mjs`: semn și simetrie la întindere/compresie, valori numerice ale energiei și lucrului, perioadă și condiții inițiale, stări la T/4 și T/8, putere ca derivată a energiei cinetice, forță ca minus derivata energiei potențiale, intrări invalide, x₀=0, periodicitate și limitele parametrilor.

Conservarea E=U+K și teorema ΔK=Lₑ sunt verificate în 12.000 de stări, la colțurile domeniului parametrilor, cu toleranță absolută 10⁻¹² J. Puterea se compară cu o derivată centrală independentă (toleranță 10⁻⁸ W). Soluția analitică elimină deriva cumulativă a integrării; nu reprezintă un resort real dincolo de domeniul liniar presupus.

## Browser și interacțiuni
Runner reproductibil: `scripts/qa/hooke-browser.mjs`. Folosește Chrome headless instalat și o instalare Playwright existentă, selectabilă prin `PRAXIS_PLAYWRIGHT_MODULE`; nu au fost instalate dependențe. Server temporar pe loopback, port 4214. Artefacte locale: `outputs/hooke-browser.json`, `outputs/hooke-browser.log`, `outputs/hooke-desktop.png`, `outputs/hooke-touch.png`.

Verificate cu evenimente de intrare native (`isTrusted=true`): mouse și touch emulat prin CDP, pornire/pauză/continuare/resetare, pas temporal, slidere, reglaj ±, câmp numeric valid/invalid, tragerea corpului, anularea unui gest tactil și controlul corpului cu Home/End. Textul corpului intercepta inițial pointerul; remediat prin `pointer-events:none` pe etichetele scenei.

Verificate RO→EN→RO și schimbarea paletei fără modificarea stării, suspendarea timpului în secțiunea teoretică, toate cele patru secțiuni, randarea matematică fără erori, feedbackul chestionarului, intrarea directă, capitol→laborator, Home→laborator, intrare/ieșire din Mod tablă, preferința sunetului între pagini și revenirea prin istoricul browserului. Selectorul mobil este sincronizat cu secțiunea selectată.

Matricea responsive cuprinde 20 de combinații: 3840×2160/DPR1, 1920×1080/DPR2, 1366×768, 1024×768, 390×844, fiecare în RO/EN și la text 100%/200%. Fără overflow orizontal al paginii; comenzi de minimum 44 px, respectiv minimum 52 px în modul tactil. La 100%, scena, graficele și comenzile încap simultan pe desktop; pe telefon și la text 200% conținutul curge vertical. La text mărit, scenele păstrează scara tipografică și pot necesita derulare locală orizontală, fără lărgirea paginii.

În rularea completă, nu s-au înregistrat erori JavaScript, răspunsuri HTTP ≥400 sau solicitări către domenii externe. O rulare prea rapidă a navigării a întrerupt o cerere de încărcare; runnerul a fost corectat să aștepte finalizarea încărcării între pagini, apoi verificarea completă a trecut. Aceasta nu dovedește absența oricărei curse posibile la închiderea imediată a unei pagini.

## Performanță
Chrome 156.0.8078.80 headless, Windows, fără încetinire CPU, măsurare de aproximativ 2,5 s/configurație (153–154 randări în rularea de referință):

| Viewport / DPR | Randare mediană | Randare p95 | Interval rAF median / p95 |
|---|---:|---:|---:|
| 3840×2160 / 1 | 6,7 ms | 8,6 ms | 16,7 / 16,8 ms |
| 1920×1080 / 2 | 6,3 ms | 7,6 ms | 16,7 / 16,8 ms |
| 1366×768 / 1 | 5,8 ms | 7,4 ms | 16,7 / 16,8 ms |

Costul măsurat include construirea SVG, graficele și actualizarea valorilor DOM, dar nu izolează costul GPU/compozitorului. Intervalele sunt compatibile cu aproximativ 60 cadre/s în acest mediu; nu constituie o garanție pentru dispozitive lente. Datele ultimei rulări sunt în raportul JSON.

## Limite de verificare și publicare
- Nu s-au testat un telefon fizic, o tablă fizică, Safari/iOS, Firefox, un cititor de ecran sau un dispozitiv cu CPU slab. Touch și DPR sunt emulate.
- Nu s-a făcut un test îndelungat de autonomie/baterie sau o măsurare GPU; benchmarkul este scurt.
- Suspendarea secțiunilor este verificată; suspendarea reală a aplicației de către sistemul de operare nu a fost testată.
- Laboratorul a fost verificat prin HTTP local din distribuția generată. Nu a fost publicat pe site-ul de producție sau GitHub; regulile proiectului cer solicitare explicită de publicare. Nu există arhivă autonomă nouă promisă și nu s-a testat deschiderea `file://`.

Rezultat final: `npm run check` — 388/388 teste trecute; `npm run build` — trecut; auditul browserului — `passed: true`. Verificările de sintaxă ale celor patru module noi și `git diff --check` au trecut. Rularea inițială în sandbox a blocat testul serverului cu EACCES; reluarea cu acces autorizat la loopback a trecut. Testele catalogului au fost actualizate pentru al 23-lea laborator și primul laborator real din acest capitol.
