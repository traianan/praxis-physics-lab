# Praxis Fizică — Laborator de descoperire

Data: 31 octombrie 2026. Direcție aleasă de utilizator: „Laborator de descoperire”. Document de design pentru confirmarea detaliilor înainte de implementare.

## Intenție

Biblioteca trebuie să transmită curiozitate și plăcerea de a explora fizica. Aspectul actual este ordonat, dar contrastul redus și repetiția suprafețelor pale îi slăbesc identitatea. Noua prezentare păstrează verdele petrol Praxis și pune experimentele în centrul paginii.

Public: elevi și profesori; utilizare individuală și la clasă, pe desktop, tabletă și telefon. „Premium” înseamnă compoziție, contrast, tipografie și detalii coerente. Nu promite o rată de revenire demonstrată: aceasta ar necesita evaluare cu utilizatori.

## Direcții evaluate

1. **Laborator de descoperire — aleasă:** fundal ivory, introducere petrol profund, accente mentă și auriu, ilustrație științifică dominantă. Echilibrează expresivitatea cu lectura confortabilă.
2. **Atlas științific:** suprafețe foarte deschise, ierarhie editorială și diagrame colorate. Mai discret, mai apropiat de aspectul actual.
3. **Observator:** interfață predominant întunecată, cyan și violet. Schimbă mult identitatea și cere adaptarea mai amplă a figurilor și a experienței de proiecție.

## Compoziția aleasă

- Antetul comun existent rămâne singurul antet. Sigla, biblioteca, ghidul, starea locală, Mod tablă, sunetul și RO/EN rămân accesibile.
- Desktop: navigare laterală de aproximativ 224–240 px; conținut principal fluid, limitat la o lățime confortabilă. Sidebarul are text mai clar, selecție distinctă și pictograme lizibile.
- Introducere: panou petrol profund, titlu amplu pe stânga, ilustrație vectorială originală inspirată din unde/orbite/traiectorii pe dreapta. Păstrează mesajul „Fizica prinde sens. Când o explorezi.” și descrierea actuală. Ilustrația este decorativă, nu o reprezentare atomică prezentată drept model fizic exact.
- Introducerea oferă o acțiune clară către un laborator publicat existent. Alegerea exactă a laboratorului și geometria ilustrației sunt lăsate implementatorului; nu se inventează conținut, progres sau recomandări personalizate.
- Căutarea urmează imediat introducerii. Rămâne vizibilă și ușor de folosit, cu numărul real de capitole și simulări.
- Capitolele formează o grilă compactă. Suprafața și conturul sunt consecvente; culoarea familiei apare pe pictogramă și într-un accent discret. Nu se colorează diferit cardurile doar după poziție.
- Laboratoarele rămân grupate pe capitole, maximum două exemple pe capitol pe pagina principală. Două coloane pe desktop la minimum 1200 px; Listă rămâne o coloană. Filtrarea folosește catalogul complet.
- Previzualizări mai generoase și contraste mai clare, fără decuparea diagramelor. Titluri ferme, descrieri lizibile, etichete secundare discrete și o acțiune principală evidentă pe card.
- Tabletă și telefon: introducerea se rearanjează, ilustrația se simplifică sau se ascunde la lățimi mici, grila se reduce progresiv. Meniul lateral existent se deschide prin butonul Capitole. Fără derulare orizontală a paginii.

## Paletă și tipografie

| Rol | Valoare de bază |
| --- | --- |
| Petrol profund, introducere | `#103F3B` |
| Fundal ivory | `#F7F5EE` |
| Suprafață card | `#FFFEFA` |
| Accent mentă luminos | `#B9F279` |
| Accent auriu | `#E8B85C` |
| Text principal | `#18332F` |
| Text secundar | `#526963` |

Mentă și auriu sunt accente, nu culori pentru text mic pe alb. Culorile pot fi ajustate marginal de implementator pentru contrast. Se folosesc fonturile locale existente Segoe UI / Arial; fără servicii externe sau descărcări de fonturi. Titlul introductiv are aproximativ 44–58 px pe desktop și 32–38 px pe telefon, ajustat fluid. Textul descriptiv uzual are 15–16 px. Raze aproximativ 14–24 px pentru suprafețele bibliotecii, umbre scurte și discrete.

## Interacțiune și accesibilitate

- Hover și focus vizibile; tranziții scurte de aproximativ 150–200 ms. Mișcarea respectă `prefers-reduced-motion`.
- Ținte interactive de minimum 44 px și focus de tastatură clar. Contrast minim 4.5:1 pentru text normal și 3:1 pentru text mare și elemente de control relevante.
- Nicio animație decorativă continuă necesară. Niciun sunet automat.
- Fără valori fictive de progres, serii zilnice, testimoniale sau stimulente inventate.
- Păstrarea căutării, navigării pe capitole, selectorului grilă/listă, RO/EN, accesului offline și revenirii din laborator cu starea bibliotecii.
- Mod tablă continuă să fie gestionat de controllerul existent; nu primește automat panoul decorativ al bibliotecii dacă îi afectează spațiul util.

## Limite și integrare

Schimbarea privește biblioteca Web și finisajele necesare pentru coerența ei. Nu redesenează conținutul tuturor lecțiilor, nu schimbă formulele, simulările, culorile științifice, semantica diagramelor, monetizarea sau distribuția Android. Nu adaugă framework ori dependențe.

Sursele relevante sunt `public/index.html`, `public/styles.css`, `public/app.js`, `public/design-system/tokens.css`, `public/design-system/components.css`, `public/design-system/premium.css`, `public/design-system/links.css`, `public/shared/site-navigation.css` și scripturile de pregătire a prezentării. Se preferă stiluri specifice bibliotecii, pentru a evita efecte neintenționate în laboratoare.

Regula actuală din `links.css` și copiile ei generate forțează toate linkurile la aceeași culoare și butoanele-link la fundal deschis. Implementarea trebuie să rezolve explicit prezentarea acțiunilor principale ale bibliotecii, cu contrast verificat, fără suprascrieri fragile adăugate peste regulile globale și fără a schimba nejustificat linkurile din lecții. Se actualizează contractul din `DESIGN_SYSTEM.md` pentru deciziile noi. Fișierele generate sunt reconstruite din surse.

## Verificare și acceptare

- `npm run build` și verificările de proiect relevante trebuie să treacă; orice eșec preexistent se distinge de regresii.
- Inspecție în browser a paginii principale, a unui capitol, a căutării și a stării fără rezultate; grilă/listă; RO/EN; Mod tablă; revenire dintr-un laborator.
- Verificare vizuală la aproximativ 1440 px, 1024 px și 390 px; fără conținut tăiat, suprapuneri sau derulare orizontală. Capturi desktop și mobil pentru rezultat.
- Contrast măsurat pentru titlu/descriere pe panoul petrol, butoanele principale, descrieri și navigare.
- Biblioteca trebuie să aibă un punct focal distinct, iar experimentele să fie mai ușor de remarcat decât metadatele lor.
- Nu se publică pe Vercel/GitHub și nu se modifică configurări externe în cadrul acestei schimbări.

## Repere consultate

- https://brilliant.org/ — reper pentru contrast, tipografie amplă și energie vizuală în educație; fără copierea identității, fonturilor ori ilustrațiilor.
- https://www.exploratorium.edu/sites/default/files/pdfs/designingwithinteractives.pdf — prioritizarea interacțiunilor relevante pentru fenomen și evitarea supraîncărcării cu elemente de aceeași importanță.

## Decizii lăsate implementatorului

Geometria ilustrației, intervalele exacte între elemente, variantele responsive și alegerea laboratorului de acces direct se decid în browser în limitele de mai sus. Dacă implementarea cere o schimbare de scop, aceasta este prezentată separat înainte de efectuare.
