# Figuri Chladni — integrare la 30 octombrie 2026

Lecția este în **Sunete și unde**, cu ID-ul `figuri-chladni`. Biblioteca cuprinde 16 laboratoare. Proiectul actual este web; integrarea nu introduce un proiect Android nativ.

## Proveniență și regenerare

`chladni.html` este păstrat nemodificat. `imported-chladni.json` înregistrează SHA-256, verificat automat. Integrarea extrage conținutul original și îl adaptează reproductibil; fontul Google extern este înlocuit cu fontul local Praxis.

```text
npm run import:chladni
npm run check
npm run package:local
```

Surse pentru întreținere: `scripts/import-chladni.mjs`, `scripts/adaptations/chladni-content.html`, `public/shared/chladni-model.js`, `public/shared/chladni.js`, `public/shared/chladni.css` și `public/locales/chladni/{ro,en}.json`.

## Conținut și integrare

Păstrate: cele 19 familii (n, s), discul cu nisip, frecvența generatorului, creșterea automată și viteza ei, amplitudinea, 2 000–16 000 de granule, amestecarea, excitația în centru, cele trei materiale, raza de 5–15 cm, grosimea de 0,5–3 mm, lista rezonanțelor și formulele.

Adăugate:

- Antet și revenire în bibliotecă, capitolul corect, RO/EN, paletele comune, mărimea textului, Mod tactil și arhivă autonomă.
- Pauză/Continuă, selector rapid de rezonanțe, volum audio separat, export PNG și poziția excitatorului pe disc.
- Tab teoretic cu opt secțiuni: originea numelui, fenomenul Chladni, diametre și cercuri nodale, modelul discului, legi de scalare, patru activități, patru întrebări cu răspunsuri și limitele modelului.

La intrare, nisipul este amestecat, frecvența este la minimum (1 Hz), iar nicio rezonanță nu este selectată. Animația așteaptă Pornire sau alegerea unei rezonanțe. Scena este limitată la o dimensiune lizibilă și este centrată. Comenzile de frecvență, pauză și sunet sunt lângă scenă; restul parametrilor trec sub aceasta pe ecrane înguste.

## Corecții fizice și numerice

### Condiții de margine și frecvențe

Sursa declara ν = 0,33, dar amesteca valori proprii corespunzătoare altor aproximări. Au fost recalculate valorile λ² pentru aceleași 19 familii, cu ν = 0,33. Pentru fiecare valoare sunt verificate separat momentul radial nul și forța tăietoare efectivă nulă la margine. Numărul rădăcinilor radiale este verificat independent față de indicele s.

Modelul Kirchhoff–Love folosește:

```text
R(r) = J_n(λr/a) + C I_n(λr/a)
D = Eh³ / [12(1 − ν²)]
f = λ² √[D/(ρh)] / (2πa²)
```

De exemplu, primele trei valori λ² sunt aproximativ 5,26203696; 9,06889866; 12,24389426. Formele modale sunt normalizate la aceeași masă modală relativă, prin integrarea radială. Familiile cu n > 0 includ ambele orientări degenerate, cos(nθ) și sin(nθ).

ν = 0,33 este o ipoteză explicită comună celor trei materiale. Excitația centrală este o forță punctuală ideală, fără blocarea rigidă a centrului. Discul cu margine liberă nu reproduce condițiile unui disc fixat într-un șurub sau o menghină. Modurile de corp rigid cu frecvență nulă sunt excluse din demonstrația figurilor de încovoiere.

### Răspuns și nisip

Sursa aduna formele modale cu ponderi egale cu pătratul amplitudinii, fără faze. Integrarea adună răspunsurile armonice complexe, păstrează fazele și cuplează forța cu valoarea formei modale în punctul excitatorului. Calitatea este Q = 45. În centru sunt excitate numai cele patru familii cu n = 0; după deplasarea excitatorului devin accesibile toate cele 19 familii.

Mișcarea nisipului este un model didactic de transport spre amplitudini reduse și difuzie dependentă de vibrație; nu este o simulare calibrată a coliziunilor și frecării. Câmpul este interpolat biliniar, iar actualizările folosesc un pas fix de 1/60 s, separat de randare. Numărul de granule este conservat, iar particulele rămân în disc. O vibrație slabă poate lăsa figura anterioară nemișcată; mesajul și teoria explică acest lucru.

### Domeniul generatorului și audio

Toate frecvențele proprii pot fi selectate: limita superioară se adaptează materialului și geometriei. Nu mai există butoane de rezonanță care solicită frecvențe peste limita efectivă a generatorului. De exemplu, pentru aluminiu, a = 5 cm și h = 3 mm, ultimul mod inclus are aproximativ 46 318,90 Hz și rămâne accesibil.

Audio este un sinus la frecvența generatorului, cu volum separat de amplitudinea mecanică. Este redat numai în banda 20–18 000 Hz; în exterior tonul este oprit și interfața explică motivul. Nu este pretinsă reproducerea timbrului unui disc real. Mute global, pauza, teoria și documentul ascuns opresc redarea; revenirea nu avansează artificial timpul simulat.

## Touch, tastatură și rezoluție

Excitatorul se mută prin atingere și tragere, cu Pointer Events, capturarea pointerului și tratarea anulării gestului. Atingerea focalizează discul; săgețile tastaturii mută excitatorul. Sliderele și butoanele −/+ rămân disponibile, iar Mod tactil oferă ținte de minimum 52 px. Scena folosește `touch-action:none`; pagina poate fi derulată în exteriorul scenei.

Bitmapul Canvas este calculat din dimensiunea CSS afișată × `devicePixelRatio`, fără limitare artificială la DPR 2. Coordonatele logice rămân 640×640; discul este circular la toate dimensiunile. Exportul PNG folosește exact bitmapul efectiv. Redimensionarea și schimbarea paletei nu resetează parametrii sau distribuția nisipului.

## Verificări

- Suita completă: **154/154 teste**, inclusiv proveniență, condițiile libere de margine pentru toate cele 19 moduri, cercurile nodale, legile de scalare, cuplarea centrală, rotația câmpului complex și faza răspunsului.
- Poziții identice ale granulelor la 30/60/120 Hz de afișare, păstrarea numărului de particule și a limitelor discului; acumulare în zone de amplitudine mică și imobilitate la excitație nulă.
- Chromium: toate cele 19 moduri disponibile în afara centrului, patru în centru, geometria și materialele, 16 000 de granule și rezonanța peste 46 kHz, fără depășirea domeniului selectorului.
- 24 de combinații de afișare: 320×740 DPR 2, 390×844 DPR 3, 768×1024 DPR 2, 1024×768 DPR 1, 1920×1080 DPR 2 și 3840×2160 DPR 1, fiecare în RO/EN și cu text 100%/200%. Bitmapul corespunde dimensiunii CSS × DPR în toate cazurile; fără depășire orizontală a paginii, inclusiv cu lista completă de rezonanțe deschisă.
- Gesturi Pointer simulate cu `pointerType:touch`: deplasare la (0,6; 0,25), anulare, eliberarea capturii, focalizare și tastatură. În acest test capturarea nativă a fost substituită; nu reprezintă o probă pe telefon fizic. Emularea tactilă confirmă butoane de minimum 52 px.
- Ceas stabil în pauză și teorie; audio activ în browser și oprit în teorie, la mute global și în afara benzii. PNG verificat la 1014×1014 pixeli pentru o scenă de 338×338 CSS px la DPR 3.
- Traducerea explicațiilor și controalelor verificată în EN; fără erori în consola versiunii integrate.
- Copia autonomă deschisă separat în Chromium: excitatorul, rezonanțele și teoria funcționează în EN; singura resursă încărcată separat este faviconul local, fără cereri externe sau erori în consolă.

## Distribuție și repere

Arhiva autonomă: `dist/simulari/figuri-chladni/figuri-chladni.zip`. Se dezarhivează integral și se deschide `index.html`. Componentele comune, modelul și traducerile sunt incluse direct în HTML; nu sunt necesare fonturi externe sau cereri de traducere. Pachetul întregii biblioteci este `outputs/Praxis-Fizica-local.zip` și include sursa originală și importatorul. Nu s-a făcut o publicare externă.

Repere bibliografice pentru teoria plăcilor și condițiile de margine: [A. W. Leissa, Vibration of Plates, NASA SP-160](https://ntrs.nasa.gov/citations/19700009156); [K. Itao și S. H. Crandall, Natural Modes and Natural Frequencies of Uniform, Circular, Free-Edge Plates](https://doi.org/10.1115/1.3424569); [T. M. Juliano, analiza frecvențelor plăcilor circulare](https://digitalcommons.njit.edu/theses/1498/). Valorile folosite în cod au fost recalculate și validate prin ecuațiile de margine; nu sunt prezentate drept o transcriere a tabelelor bibliografice.

## Corecție: selectarea unei rezonanțe nu schimba figura

Reprodus după integrare: selectarea modifica numai frecvența, păstrând configurația veche a nisipului și starea de pauză. Acum o selecție explicită reamestecă nisipul, pornește animația, resetează referința ceasului și aduce discul în zona vizibilă. Pauza poate fi folosită în continuare după selecție.

Un ghid punctat, activ implicit și dezactivabil, arată imediat diametrele și cercurile nodale ale modului ales. Cercurile sunt calculate din zerourile funcției radiale; diametrele urmăresc orientarea excitatorului. Ghidul descrie modul propriu, iar nisipul continuă să urmărească răspunsul forțat suprapus. Indexul selectat nu mai este înlocuit de modul cu răspunsul cel mai puternic atunci când excitația modului ales este slabă. Un mesaj explică excitația slabă și cum poate fi schimbată.

Verificări suplimentare: toate cele 19 selecții efectuate din pauză repornesc și desenează imediat numărul corect de linii și cercuri; verificare în EN și în emulare tactilă 390×844 DPR 3, fără erori în consolă. Suita extinsă: **157/157 teste**. Distribuțiile integrată și offline au fost regenerate.

## Stare inițială, Reset și linkuri comune

La cererea utilizatorului, intrarea și Reset frecvență lasă nisipul amestecat, frecvența la limita minimă a sliderului (1 Hz) și selectorul fără rezonanță. Reset oprește și creșterea automată și animația, păstrând materialul, geometria, amplitudinea, numărul de granule și poziția excitatorului. Selectarea unei rezonanțe pornește în continuare o demonstrație nouă.

Explicația originii numelui este disponibilă în RO/EN, cu sursă bibliografică în lecție. Linkurile au culoarea comună verde petrol Praxis, inclusiv cele vizitate. Verificarea în browser a acoperit biblioteca și toate cele 16 laboratoare: 501 linkuri folosesc aceeași culoare în tema implicită.

Verificate în browser: intrare la 1 Hz, selector manual, nisip nemișcat până la pornire; Reset după rezonanță și creștere automată; traducerea istoricului și noul buton în EN. Distribuțiile offline includ aceeași regulă de culoare.
