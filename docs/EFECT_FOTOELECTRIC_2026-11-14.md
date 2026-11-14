# Efectul fotoelectric extern — implementare și verificare

Lecție nativă în capitolul **Fenomene cuantice**, realizată la 2026-11-14.

## Material și alegeri didactice

Sursă: PDF-ul furnizat `manual-12-28-45.pdf`, paginile tipărite 28–34 și întrebările relevante de la pagina 45. Au fost consultate vizual paginile; stratul de text al PDF-ului are caractere corupte. Lecția reformulează conținutul și folosește scheme originale. Compton, de Broglie și microscopia electronică, prezente în restul extrasului, nu sunt incluse ca experimente ale efectului fotoelectric.

Sunt acoperite Hallwachs, fotocelula cu vid, cele patru legi experimentale, pragul, ecuația lui Einstein, tensiunea de oprire, fluxul fotonic și aplicațiile. Se distinge emisia de colectare: un curent nul poate însemna electroni emiși și întorși de câmp. Se disting fotocelula cu vid și celula solară cu semiconductor. Fotonul are masă de repaus zero; energia împărțită la c² nu este prezentată ca masă de repaus.

Constantele exacte h, c și e sunt cele definite de [SI/NIST](https://www.nist.gov/pml/special-publication-330/sp-330-section-2). Pentru convențiile de tensiune și explicația fenomenului a fost consultat și [OpenStax, Photoelectric Effect](https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect). Lucrurile de extracție indicative pentru sodiu (2,28 eV) și zinc (4,30 eV) sunt compatibile cu [tabelul educațional Georgia State University](https://hyperphysics.phy-astr.gsu.edu/hbase/Tables/photoelec.html); dependența de suprafață este precizată în lecție.

## Model și limite

- Energie în eV, lungime de undă în nm, putere în µW și curent în µA; conversii interne SI. Pragul și energia maximă sunt analitice. Domeniul tensiunii −9…+5 V permite oprirea tuturor combinațiilor admise.
- U este potențialul anodului minus cel al catodului. Modulul pozitiv al tensiunii de oprire apare pe caracteristică la U negativ.
- La prag exact, energia cinetică maximă este nulă și modelul nu produce curent de zbor. Sub prag, tensiunea pozitivă nu creează fotoelectroni.
- Forma I(U) este explicit didactică: tranziție cubică netedă între oprire și saturație la +2 V, cu curent nenul la U = 0. Aceste valori nu sunt parametri universali ai fotocelulelor. Nu se modelează contactele, sarcina spațială, curentul de întuneric sau emisia multifotonică.
- Randamentul inițial 2% este configurabil. La putere fixă, creșterea frecvenței reduce numărul fotonilor pe secundă. Animația este schematică, nu o reprezentare la scară a vitezei sau a numărului particulelor.
- Jurnalul conține date generate de model. Estimarea lui h din două frecvențe este un exercițiu de analiză, nu o măsurare independentă.

## Integrare și biblioteci

La cererea ulterioară, montajul urmărește figura din manual: tub T, fereastră Q, catod C, anod A, microampermetru G în serie, voltmetru V în paralel și sursă cu reostat R. Cursorul reostatului și polaritatea sursei urmăresc tensiunea. Caracteristica marchează −U_f, I_0, U_s și I_s; prima lege are trei curbe Φ, 2Φ, 3Φ, cu prag comun și saturații în raport 1:2:3.

Șapte secțiuni: Laborator, Teorie (șase subiecte), Verifică legile, Măsurători, Probleme (șase), Verificare (șapte întrebări cu explicații), Harta conceptelor. RO/EN, antet și navigare comune, Mod tablă, comenzi tactile, mișcare redusă și oprirea animației când nu este vizibilă. Întrebările sunt în două coloane pe ecrane late și o coloană pe telefon.

- **uPlot 1.6.32**: I(U) și energia maximă în funcție de frecvență, cu cursor la valoarea curentă; folosește politica comună de rezoluție Canvas și densitate de etichete adaptată textului mărit.
- **Zod 4.6.7**: validare strictă a experimentelor JSON, domeniilor parametrilor și jurnalului de maximum 12 înregistrări. Importul invalid lasă starea neschimbată. Export JSON și CSV.
- **PraxisMath/KaTeX**: formule și indici, inclusiv în explicații și varianta offline.
- Nu au fost instalate pachete noi: se reutilizează bibliotecile disponibile. Konva, Planck și math.js nu sunt necesare modelului analitic al acestei lecții.

Fișiere sursă: `public/simulari/efectul-fotoelectric-extern/`. Catalog: `labs.manifest.json`. Arhiva ZIP include resurse locale, formule/fonturi și licențele uPlot/Zod; funcționează autonom după extragere.

## Verificare

`npm run check`: 473 teste trecute (opt dedicate modelului fotoelectric); build trecut. Auditul interfeței: 140 stări; auditul formulelor Web/offline: 192 stări; stabilitate 0px în 32 configurații. Standul principal încape la 1366×768; la 1024px și text mărit poate necesita derulare. Rezultatele și limitele sunt consemnate și în PROGRESS.md. Dovezile locale se află în `outputs/photoelectric/`: teste de model, audit vizual/funcțional, audit matematic Web/offline, capturi și logurile build/check. Rezoluțiile de telefon și tablă sunt simulate în Chrome; nu reprezintă un test pe telefon sau tablă fizică. Publicarea pe GitHub a fost solicitată ulterior, la 2026-11-14.
