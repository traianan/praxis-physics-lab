# Audit de stil și integrare Unde mecanice — 27 octombrie 2026

## Sursa nouă

S-a folosit `Unde-Mecanice.html` din folderul indicat, datat 26 octombrie 2026, mai nou decât copiile de siguranță. Fișierul compilat este ulterior scripturilor sale componente. Nu s-a executat build.py cu dependența sa de un alt director al școlii și nu s-a modificat folderul original. Proveniență și SHA-256: `unde-mecanice-source.json`.

Tot modulul React original este păstrat identic, cu inserții delimitate de prezentare: în `lessonJsx`, adaptarea Mouse Events la Pointer Events și wrapperul React pentru −/+; în `lessonUseEffect`, redesenarea la schimbarea limbii sau paletei. Un test elimină adaptoarele și compară SHA-256 cu modulul original. Cele 19 teme și 37 de ecrane rămân montate, păstrând starea la navigare; planificatorul original de animații inactive și Canvas DPR sunt intacte.

## Stil comun

Toate cele patru laboratoare folosesc `design-system/laboratory.css`, tokenuri și același antet. Reguli de titlu 30/24/20/18 px, paragrafe 16 px, butoane și câmpuri 14 px; slidere cu aceeași pistă și cursor, control minim 44 px / touch 52 px. Clasele moștenite pentru text lead, butoane mici/mari, pill și culori decorative sunt suprascrise la nivel de rol. Nu au fost schimbate ecuațiile, coordonatele desenelor sau semnificația paletelor științifice.

## Parcurgere în browser

- Mișcare: cele patru taburi, inclusiv probleme; titluri 24/20/18 px, paragrafe 16 px, butoane 14 px, fără overflow orizontal.
- Vectori: toate cele 14 secțiuni, inclusiv calculatorul și autoevaluarea; aceleași dimensiuni, fără overflow orizontal la 640 px.
- Optică: lentile convergentă/divergentă și oglinzi concavă/convexă/plană; controale 14 px, antete comune, paragrafele ferestrelor 16 px. Mod tablă la 640×360: scenă 630×295 px, fără derulare a paginii.
- Unde: toate cele 37 de ecrane în EN, prin butoanele proprii ale lecției. Titluri 24 px, butoane 14 px și zero fragmente cu diacritice românești în conținutul verificat (excluzând datele editabile ale jurnalului). Rutele și panourile sunt accesibile. Verificarea de cuvinte nu este echivalentă cu o recenzie editorială independentă a fiecărei traduceri.

## Sunet și limite

Volum global 0–100%, implicit 35%; mute comun activ implicit. Testul gain master verifică reglajul, mute, redarea HTML audio, păstrarea ieșirii MediaRecorder și trecerea în fundal. Microfonul fizic nu a fost activat; necesită gest, permisiune și un context acceptat de browser. În LAN/HTTP pe Android, accesul poate fi blocat; niciun acces nu este pornit automat. Acest audit păstrează modelele fizice ale lecțiilor și nu este o revalidare științifică nouă a tuturor afirmațiilor sau exemplelor numerice din surse.

## Offline și publicare

Sunt regenerate arhiva completă și cele trei arhive autonome ale lecțiilor importate. Optica rămâne HTML autonom. Nicio publicare pe GitHub, Vercel sau alt serviciu nu a fost efectuată.

Verificări finale suplimentare: toate cele 37 de ecrane RO parcurse și cu viewport emulat 390×844, DPR 2, touch/coarse activ; fără overflow orizontal. La 640×360 controalele tactile au minimum 52 px. Butonul + a schimbat viteza 1.2→1.3, valoare păstrată la schimbarea limbii. Consola a rămas fără erori de aplicație. `npm run check`: 24 de teste trecute.

Distribuția autonomă a undelor a fost deschisă efectiv prin `file:///.../index.html`: antetul, volumul, cele 19 teme și 37 de ecrane sunt prezente, fără cereri HTTP/HTTPS și fără erori în consolă. Schimbarea RO/EN folosește dicționarele înglobate. Feedbackul corect/greșit al autoevaluării vectorilor păstrează culorile semantice prin tokenuri comune.
