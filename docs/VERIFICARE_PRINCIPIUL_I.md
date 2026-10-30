# Integrare și verificare — Principiul I al termodinamicii

28 octombrie 2026.

## Conținut

Laboratorul este în **Căldură și termodinamică**, alături de Noțiuni termodinamice de bază și Calorimetrie. Regula primei pagini rămâne maximum două laboratoare din fiecare capitol; pagina capitolului și căutarea le includ pe toate trei.

Șase taburi: Principiul I, Transformare generală, Boyle-Mariotte, Gay-Lussac, Charles, Ecuația de stare. Sunt păstrate explicațiile, simularea ΔU = Q − L, cele 12 diagrame interactive, pistonul, calculatoarele pentru transformarea generală și patru exerciții, calculatorul ecuației de stare și tabelul recapitulativ. Schimbarea taburilor păstrează valorile introduse. Sunt disponibile legături directe prin fragmentul URL și navigare prin săgețile tastaturii.

Sursele originale sunt păstrate în `sources/principiul-i-al-termodinamicii/original.html`, cu SHA-256 în `docs/imported-first-law.json`. Fișierul adăugat de utilizator este păstrat. Trimiterile la manual, autorii și numerotarea editorială au fost eliminate din distribuție.

## Adaptări

- Antet, întoarcere în bibliotecă, RO/EN, culori, text, atingere și favicon comune. Nicio dependență de fonturi sau servicii externe.
- Formule cu margini de protecție și indici inferiori; controale tactile cu butoane −/+ și etichete accesibile. Grilele devin o coloană pe tabletă.
- Grafice redimensionate după suprafața vizibilă și DPR, până la 2. Scările includ toate extremele sliderelor, etichetele au zone rezervate, iar axele și curbele sunt independente de numărul pixelilor fizici. Graficele liniare includ originea ca limită matematică.
- Constantele de referință sunt declarate lângă simulări; temperatura de referință a transformărilor izobară și izocoră este 273,15 K. Interpretarea ΔU = 0 nu mai sugerează că procesul trebuie să fie numai ciclic sau izolat.
- Înălțimea coloanei de gaz de sub piston este proporțională cu volumul ales.
- Calculatoarele resping date nefinite, temperaturi absolute nepozitive, volume nule, geometrii imposibile ale tuburilor sau mai multe câmpuri lipsă. În caz de eroare nu afișează rezultate învechite în verificările asociate.

## Verificare

`npm run check`: **91 de teste trecute**, fără eșecuri. Testele noi verifică bilanțul energetic semnat, invarianții celor trei legi ale gazului ideal, transformarea generală, toate cele patru exerciții și rezolvarea ecuației de stare pentru fiecare necunoscută. Au fost actualizate două verificări vechi pentru a accepta faviconul comun și a utiliza sursa curbilinie arhivată atunci când copia inițială din rădăcină nu mai este prezentă; integritatea științifică rămâne verificată prin SHA și comparația conținutului.

Audit în Chrome la 1600×1000, 768×1024 și 1024×768, cu modul tactil activ, RO/EN și ambele palete. 361 stări verificate pentru fiecare configurație, inclusiv extreme de parametri, calcule, date invalide, păstrarea datelor, tastatură, favicon și mărimea textului 125%, 150%, 200%. Fără derulare orizontală, puncte în afara graficului, etichete tăiate sau suprapuneri detectate. Este emulare de tabletă în browser, nu test pe un dispozitiv fizic.

Versiunea autonomă a fost deschisă prin `file://`, cu rețeaua dezactivată: încă 361 stări trecute și nicio resursă HTTP necesară. Nu au fost găsite erori sau avertismente în consola browserului. Script reproductibil: `scripts/qa/first-law.js`; raport: `docs/first-law-browser-qa.json`.

## Regenerare și distribuție

`npm run import:first-law` → `npm run offline:courses` → `npm run build`.

Arhiva individuală: `public/simulari/principiul-i-al-termodinamicii/principiul-i-al-termodinamicii.zip`. Este actualizată și distribuția completă `outputs/Praxis-Fizica-local.zip`.

## Actualizare: variație fină și formule complete

Toate cele 26 de mărimi se modifică prin slidere și butoane −/+, cu valoare și unitate afișate. Exemple de pași: 1 J pentru Q/L, 0,01 cm pentru lungimile tubului deschis și deplasare, 0,1 K pentru simulările izobară și izocoră, 0,01 K în ecuația de stare, 0,00001 m³ pentru volume. Datele și rezultatele se actualizează imediat.

Domeniile dependente păstrează L₂ > L₁, L > h și 2d < L − h; în exercițiul de încălzire, t₂ ≥ t₁. La ecuația de stare, selectorul alege necunoscuta; sliderul acelei mărimi se ascunde și valoarea calculată apare în locul lui. Opțiunea „Verifică toate valorile” păstrează cele patru slidere independente.

Au fost adăugate cinci relații complete, cu fracții: T₂ pentru transformarea generală, pₐ și p₀ pentru cele două tuburi cu mercur, creșterea relativă de volum și temperatura desprinderii dopului. Rezultatele numerice sunt vizibile de la deschiderea laboratorului, fără apăsarea unui buton de calcul.

Auditul verifică suplimentar toate cele 26 de perechi −/+, pasul fin efectiv, prezența celor cinci relații și a opt fracții, calculul automat, selecția fiecăreia dintre cele patru necunoscute și păstrarea parametrilor la schimbarea taburilor. 361 stări pe fiecare configurație.

## Actualizare: p–V, V–T și p–T pentru fiecare transformare

Fiecare dintre cele trei transformări simple are acum toate cele trei diagrame simultan vizibile și sincronizate cu sliderul propriu. Graficele folosesc aceeași stare (p,V,T); axele volumului au unitatea ×10⁻³ m³. Izoterma are hiperbolă în p–V și verticale în V–T/p–T; izobara are orizontale în p–V/p–T; izocora are verticală în p–V și orizontală în V–T. Dreptele variabile cu temperatura trec prin origine ca limită matematică.

Transformarea generală are trei diagrame cu punctele 1 și 2. Nu se trasează o curbă a procesului deoarece cele două stări nu determină traseul. Scările se adaptează parametrilor, iar etichetele rămân separate inclusiv când stările sunt foarte apropiate sau coincid.

Testul fizic suplimentar verifică toate cele trei proiecții, invarianta pV/T și orientările mărimilor constante. Auditul de browser verifică suplimentar existența a trei grafice per transformare, sincronizarea stărilor, unitățile proiecțiilor și ambele puncte ale transformării generale. Total: 12 canvasuri și 361 de stări verificate per configurație.

## Actualizare: conținut compact și gruparea stărilor

Calculatorul transformării generale separă acum Starea 1 (p₁,V₁,T₁) și Starea 2 (p₂,V₂ și T₂ calculată). Formula și rezultatul T₂ sunt alăturate, în dreptul stării finale. Invarianta pV/T este afișată dedesubt într-un rezumat cu unitatea J/K și numere zecimale lizibile, fără notația e+0.

Parametrii celorlalte calculatoare sunt grupați în grile locale care se adaptează lățimii și mărimii textului. Calculatoarele cu o singură casetă folosesc lățimea disponibilă; panourile alăturate nu mai sunt întinse artificial la înălțimea celui mai înalt. Ultimul parametru dintr-un grup impar ocupă rândul complet. Se păstrează spațiul de protecție al formulelor și toate cele 26 de slidere, cele 12 grafice și calculele automate.

La 1920×1080, cu aceeași mărime de text și același mod tactil, caseta calculatorului general a scăzut de la aproximativ 776 px la 409 px (circa 47%). Panourile celor două stări au acum aproximativ 247 și 241 px, față de cele două panouri anterioare de câte 706 px, dintre care unul era aproape gol.

Auditul existent verifică suplimentar absența unei zone goale mai mari de 48 px sub conținutul fiecărei casete de calculator. Verificările RO/EN, palete, slidere, grafice și text mărit la 125%, 150% și 200% sunt păstrate.
