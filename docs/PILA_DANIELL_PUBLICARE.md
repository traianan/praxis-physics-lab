# Pila Daniell — publicare și verificare online

4 noiembrie 2026, Europe/Bucharest. Publicare solicitată explicit după validarea locală.

- Repository: https://github.com/traianan/praxis-physics-lab, ramura `main`.
- Commitul laboratorului: `a9c6a38e0fa55948ffbff9b6d059a367b3040d28`; push fără forțare, după verificarea sincronizării cu origin/main.
- Vercel a raportat `success`: https://vercel.com/traians-projects-cnni/physicslab/3xgcfPDRqeJEKJ8dJngQnvcCBtD3.
- Bibliotecă: https://praxis-physics-lab.vercel.app/.
- Laborator: https://praxis-physics-lab.vercel.app/simulari/pila-daniell/index.html.

## Verificare pe site-ul public

Chrome pe Windows, direct prin HTTPS, nu prin serverul local. Deschidere din Home și din capitol, revenire la capitol, browser Back/Forward, intrare/ieșire Mod tablă, păstrarea sunetului comun și funcționarea Pas/Reset după revenire. Interacțiuni native mouse și touch emulat: Start/Pauză/Reset, pas de 60 s, circuit deschis, punte salină, −/+, glisare slider, câmp numeric, export CSV descărcat și verificat. RO→EN→RO și paleta vivid păstrează starea. Schimbarea secțiunii suspendă evoluția. Formula Nernst randată are numitorul exact `2F`; logaritmul este în afara fracției.

Verificate toate cele patru secțiuni la 3840×2160 DPR1, 1920×1080 DPR2, 1366×768, 1024×768 și 390×844; RO/EN și text 100%/200%. Fără overflow orizontal sau butoane sub 44 px; modul tactil are minimum 52 px. Desktopul la text 100% încadrează simultan experimentul și comenzile. Telefonul și textul mărit folosesc derulare verticală.

Nicio eroare JavaScript în pagini, nicio resursă HTTP eșuată și nicio cerere externă neașteptată. Catalogul, motorul, controllerul, conținutul, rendererul, CSS-ul și imaginea au HTTP 200 și conținut identic cu sursele locale (comparare după normalizarea LF/CRLF). Intervalul median dintre cadre a fost 16,7 ms, aproximativ 60 FPS; P95 al actualizării desenului a fost aproximativ 6 ms pe configurațiile desktop testate.

Prima probă automată a sunetului a citit `PraxisSound` înainte ca pagina bibliotecii să-și termine încărcarea. Nu a fost o eroare emisă de aplicație. Scriptul QA a primit o așteptare explicită a runtime-ului; verificarea separată a navigării și sunetului a trecut apoi integral.

Dovezi locale: `outputs/daniell-online.json`, `outputs/daniell-online-navigation.json`, `outputs/daniell-online-integrity.json`, capturi `outputs/daniell-online-desktop.png` și `outputs/daniell-online-phone.png`.

Limite: touch și DPR emulate, fără telefon sau tablă fizică; Safari/iOS și Firefox netestate. Publicarea nu schimbă ipotezele fizice și limitele din [specificație](PILA_DANIELL_SPEC.md). Testele locale anterioare publicării: 379/379; vezi [validarea](PILA_DANIELL_VALIDARE.md).
