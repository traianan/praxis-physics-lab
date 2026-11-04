# Legea lui Hooke — publicare și verificare online

4 noiembrie 2026, Europe/Bucharest. Publicare solicitată explicit de utilizator, împreună cu corectarea indicilor și adăugarea vitezei animației.

- GitHub: https://github.com/traianan/praxis-physics-lab, ramura `main`.
- Commitul implementării: `1f44331eba073aef1c07b119716241aefcaaab1d`; push fără forțare, după verificarea origin/main.
- Vercel: **success**, https://vercel.com/traians-projects-cnni/physicslab/FRzKy6RJmcAAVWz7sHD24HKn9AWC.
- Laborator public: https://praxis-physics-lab.vercel.app/simulari/legea-lui-hooke/index.html.
- Capitol: https://praxis-physics-lab.vercel.app/?chapter=1#capitol/lucru-energie-putere.

## Modificări cerute
Indicii din proză sunt redați structural prin PraxisMath, inclusiv F_ap și x₀. Panta k=ΔF_ap/Δx are fracție și indice corecte în ambele limbi; etichetele SVG folosesc tspans poziționate explicit pentru e/ap. Sliderul de viteză are intervalul 0,1×…2×, valoare implicită 1×, câmp numeric și butoane ±. Modificarea sa păstrează starea fizică și pauza; pasul manual rămâne +0,02 s simulate. Reset restabilește viteza 1×.

## Verificare directă prin HTTPS
Audit automat complet: `PRAXIS_HOOKE_BASE=https://praxis-physics-lab.vercel.app node scripts/qa/hooke-browser.mjs`, folosind instalarea Playwright existentă prin `PRAXIS_PLAYWRIGHT_MODULE`. Rezultat: **passed: true**.

Verificate în Chrome: mouse și gesturi tactile emulate cu evenimente native, tragerea corpului, anularea gestului, sliderele parametrilor și vitezei, reglajele ±, câmpuri numerice valide/invalide, pornire/pauză/continuare/reset, pas temporal, control prin tastatură, indicii MathML în RO→EN→RO, indicii SVG, păstrarea stării la traducere și schimbarea culorilor, suspendarea în secțiuni ascunse și feedbackul verificării conceptuale.

20 de combinații responsive: 3840×2160/DPR1, 1920×1080/DPR2, 1366×768, 1024×768, 390×844 × RO/EN × text 100%/200%. Toate cele patru secțiuni au fost parcurse. Fără overflow orizontal al paginii; ținte de minimum 44 px și minimum 52 px în modul tactil; scena și comenzile încap simultan la rezoluțiile desktop, la text 100%.

Navigare verificată: URL direct→capitol→laborator, Home→laborator, Mod tablă pornit/oprit, sunet păstrat între pagini și după browser Back. Nicio eroare JavaScript, niciun răspuns HTTP ≥400 și nicio solicitare externă neașteptată în audit.

Catalogul, modelul, ceasul, HTML-ul, controllerul, rendererul, conținutul, CSS-ul, imaginea și dicționarele RO/EN au fost comparate cu `dist/`: **11/11 HTTP 200, conținut identic** după normalizarea LF/CRLF. Confirmare vizuală suplimentară a paginii Activități și probleme pe domeniul public.

## Dovezi și limite
Dovezi locale ignorate de Git: `outputs/hooke-online.json`, `outputs/hooke-online.log`, `outputs/hooke-online-integrity.json`, `outputs/hooke-online-desktop.png`, `outputs/hooke-online-touch.png`. Verificările locale înainte de publicare: **389/389 teste**, build reușit și audit complet al browserului trecut.

Touch și DPR sunt emulate; nu s-au testat telefon/tablă fizică, Safari/iOS sau Firefox. Măsurătorile de performanță sunt scurte și specifice calculatorului folosit, nu garanții pentru dispozitive lente. Ipotezele modelului rămân cele din [specificație](LEGEA_LUI_HOOKE.md).
