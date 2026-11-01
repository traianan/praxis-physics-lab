# Audit online: tablă, tactil și text mărit — 1 noiembrie 2026

Versiune verificată: https://praxis-physics-lab.vercel.app/. Auditul extinde verificarea responsive a aspectului Praxis rafinat prin activarea controalelor reale de afișare. Contextul Chrome este izolat de preferințele utilizatorului.

**Rezultat final: 19 laboratoare, 57 de sesiuni, 228 de configurații și 3.234 de stări**, incluzând dialogurile și revenirea din tablă. După corecții și retestările online, matricea finală nu are depășiri, texte tăiate, suprapuneri de comenzi sau etichete canvas în afara desenului semnalate. Nu există traversări oprite la plafonul helperului ori eșecuri HTTP în rapoarte. Capturile finale ale celor 19 laboratoare pe cele trei dimensiuni au fost inspectate vizual; acestea documentează starea după ieșirea din tablă, iar măsurătorile JSON documentează fiecare mod.

## Matrice și metodă

- Desktop 1440×1000, tabletă 1024×768 cu atingere și telefon 390×844 cu atingere, prin emulare Chrome.
- Pentru 18 laboratoare: tactil la 100%; text 200% cu tactil oprit; tablă+tactil la 100%; tablă+tactil+text 200%.
- Pentru Oglinzi și lentile: tactil normal; modul dedicat de tablă la 100%, 200% și 300% preferat. Procentul efectiv se adaptează spațiului disponibil și este indicat în dialog.
- În fiecare mod: stare inițială RO, apoi parcurgerea taburilor/secțiunilor în EN. Nu se afirmă parcurgerea completă a tuturor stărilor în ambele limbi.
- Sunt măsurate depășirea documentului, textul ascuns de containere, suprapunerea comenzilor, etichetele desenate în canvas, încadrarea dialogurilor și selectorului RO/EN. Se verifică și revenirea din Mod tablă. La Optică se parcurg paginile de reglaje, inclusiv Lentilă/Oglindă, Aspect și Mai multe.

Modul comun de tablă al celor 18 lecții mărește lectura și comenzile; Optica are o scenă dedicată. La 200%, textul poate ocupa mai multe rânduri și necesită derulare verticală, păstrând mărimea aleasă.

## Probleme reproduse și corecții

1. **Selectorul RO/EN:** la text 200% prelua fontul mărit al lecției într-un control cu lățime fixă. Antetul comun păstrează fontul de 14 px; textul lecției continuă să se mărească.
2. **Modul comun de tablă:** rolurile tipografice în rem nu preluau mărirea containerului. Corpul textului este acum 18 px în tablă la 100% și 36 px la preferința 200%; etichetele au 16/32 px.
3. **Mișcarea rectilinie:** titlurile și adnotările graficelor puteau depăși cardurile la 200%. Curg acum pe rânduri, cu adnotări proporționale și padding adaptat pe telefon.
4. **Interacții atomice:** pe tabletă la 200%, coloana reglajelor lăsa doar 271 px pentru grafic și tăia eticheta distanței. Scena și reglajele se rearanjează pe rânduri după lățimile lor în rem.
5. **Transformări de stare:** butonul plutitor „Sus” putea acoperi comenzile „+” după derulare. Același buton și acțiunea sa sunt păstrate în antetul fix, în fluxul comenzilor.

Corecțiile sunt publicate în `e84e7e5`, `e27ba4a` și `2c3fa47`. Ultima publicare are verificarea Vercel reușită: [deployment](https://vercel.com/traians-projects-cnni/physicslab/HN25PEDQjEsjedbdQHQ4wrTHKPsy). Modelele fizice și conținutul explicațiilor nu au fost modificate.

Regresia locală pentru ultimele două laboratoare a parcurs 24 de configurații, 282 de stări, fără probleme semnalate. `npm run check`: **201/201 teste trecute**, fără teste omise. Verificarea independentă a celor trei fișiere ale ultimei corecții nu a identificat probleme. Arhivele autonome și pachetul local au fost regenerate.

Confirmare suplimentară online pentru Interacții atomice: la 1024×768 și text 200%, canvasul are 943 px lățime în loc de 271 px; eticheta completă încape. Pentru butonul „Sus”, testul de clic după derulare a revenit la `scrollY=0`; elementul se află în `.praxis-site-extra`, cu poziționare statică în antet.

## Dovezi și limite

Fiecare rând are trei dimensiuni × patru moduri, cu rezultat final fără probleme de încadrare semnalate:

| Laborator | Configurații | Rezultat |
|---|---:|---|
| Oglinzi și lentile | 12 | Verificat |
| Mișcarea rectilinie | 12 | Verificat după corecție |
| Unde mecanice | 12 | Verificat |
| Calcul vectorial | 12 | Verificat |
| Viteza și accelerația | 12 | Verificat |
| Mișcarea curbilinie plană | 12 | Verificat |
| Noțiuni termodinamice | 12 | Verificat |
| Calorimetrie | 12 | Verificat |
| Principiul I al termodinamicii | 12 | Verificat |
| Interacții atomice | 12 | Verificat după corecție |
| Principiul I — aplicații | 12 | Verificat |
| Transformări de stare de agregare | 12 | Verificat după corecție |
| Oscilator mecanic | 12 | Verificat |
| Oscilatori mecanici cuplați | 12 | Verificat |
| Compunerea oscilațiilor | 12 | Verificat |
| Figuri Chladni | 12 | Verificat |
| Mișcarea circulară uniformă | 12 | Verificat |
| Principiile mecanicii newtoniene | 12 | Verificat |
| Motoare termice | 12 | Verificat |

Helperii reproductibili sunt `scripts/qa/production-responsive-audit.browser.js` și `scripts/qa/display-modes-audit.browser.js`; nu sunt incluși în produs. Rapoartele JSON și capturile sunt în `outputs/praxis-display-modes-audit/`, exclus din Git. Rapoartele inițiale cu probleme sunt păstrate separat de retestări.

Agregatul final este `verified/summary.json`: folosește `native-final` pentru Optică, `post-overflow` pentru Mișcarea rectilinie, `post-final-layout` pentru Interacții atomice și Transformări de stare, respectiv `online` pentru celelalte lecții. Corecțiile finale sunt limitate la aceste două lecții; restul matricei rămâne valabil. Preferința optică 300% se aplică, în măsurătorile efectuate, ca 295% pe desktop, 220% pe tabletă și 145% pe telefon, cu explicația adaptării în interfață.

Este o verificare în Chrome cu emulare de dimensiuni și atingere. Nu echivalează cu testarea pe dispozitive fizice, Safari/iOS sau a fiecărei valori a parametrilor, animațiilor și combinațiilor de răspunsuri la exerciții. Măsurătorile automate și capturile susțin concluziile numai pentru stările parcurse.
