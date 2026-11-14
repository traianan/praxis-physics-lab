# Biblioteci pentru viitoarele laboratoare Praxis · Fizică

Analiză și instalare locală: 14 noiembrie 2026.

## Concluzia principală

Cel mai valoros rezultat al materialelor este separarea **modelului experimentului, calculului fizic, interacțiunii și desenului**. Nu există o bibliotecă care să transforme singură un desen interactiv într-un experiment corect. Pentru Praxis recomand o bază restrânsă, încărcată doar în laboratoarele care o folosesc, cu verificarea numerică a fiecărui model.

Am instalat cinci biblioteci: **Konva, Planck, math.js, uPlot și Zod**. React Flow, React, infrastructura formulelor și Three.js există deja în proiect. Nu este necesară migrarea aplicației la Vite, înlocuirea testelor cu Vitest sau rescrierea lecțiilor existente.

Instalarea pregătește instrumentele pentru dezvoltările următoare. Nu creează încă un nou laborator, un solver general de circuite, un editor de optică sau o funcție nouă vizibilă elevilor.

## 1. Sistematizarea celor opt fișiere

Directorul sursă: `D:/Scoala/traian/catedra de fizica 2026-2027 - N. Iorga/Planuri de lectie -AI/Biblioteci pt aplicatii/`. Fișierele originale au rămas nemodificate. Dialogurile, comenzile și solicitările din acestea au fost tratate ca material documentar.

| Material | Contribuția utilă | Cum îl folosim |
| --- | --- | --- |
| `Biblioteci gratuite pentru aplica.md` | Clasifică editoare de circuite, geometrie și drag-and-drop | Inventar inițial; Gridstack și sldeditor nu devin implicit baza simulatorului |
| `Biblioteci gratuite.docx` | Dialog Kimi cu editor React Flow, simboluri, porturi și salvare JSON | Idei de interacțiune; exemplele React Flow 11 necesită adaptare și validare |
| `Biblioteci gratuite.pdf` | Versiune PDF a aceluiași dialog Kimi | Confirmă sursa; nu constituie o a doua validare independentă |
| `Biblioteci Web Drag and Drop.txt` | Separă motorul Matter de desenul Konva și de editorul React Flow | Util pentru arhitectură; afirmația „acoperă 100%” este nejustificată |
| `Biblioteci_Web_Simulari_Fizice.pdf` | Comparație Z.ai: canvas, diagrame, motoare și simulatoare complete | Bun pentru alternative; conține erori în formule și descrieri de API |
| `Bibliotici gratuite pentru aplicați.txt` | Inventar mai larg, inclusiv platforme, aplicații desktop și senzori | Ajută la separarea bibliotecilor integrabile de servicii și aplicații complete |
| `Stack de biblioteci pentru simulări interactive de mecanică, electricitate și op.md` | Cea mai coerentă sinteză: model JSON, comenzi, solver, randare, verificări | Baza conceptuală, adaptată infrastructurii existente și verificată în documentație |
| `Stack de biblioteci pentru simulări interactive de mecanică, electricitate și op.pdf` | Versiunea PDF a sintezei | Aceeași familie de informații; nu o sursă independentă |

Au fost extrase textele PDF/DOCX și comparate cu materialele editabile. Analiza privește conținutul tehnic, nu un audit al machetării documentelor. Extragerile de lucru sunt în `outputs/library-review/`, ignorat de Git.

## 2. Ideile care merită păstrate

1. **Experimente construite de elev.** Paletă de obiecte, adăugare, mutare, rotire, ștergere și proprietăți numerice. O acțiune cu tastatura trebuie să poată înlocui tragerea; pe telefon trebuie să existe și „selectează componenta → adaugă”.
2. **Un model JSON independent de desen.** Fiecare obiect are `id`, `kind`, parametri în unități bine definite și porturi fizice. Funcțiile React și instanțele Konva nu se serializează. Schema primește o versiune, limite de dimensiune și verificări pentru referințe/ID-uri.
3. **Același experiment în scenă, grafice și formule.** Poziția, vectorii și citirile se calculează din aceeași stare și același timp. Pas fix pentru model, randare sincronizată separat; pauză la ascundere și fără recuperări necontrolate de timp.
4. **Predicție → experiment → explicație.** Elevul estimează rezultatul, îl măsoară, apoi compară cu teoria. Diferența absolută se folosește când referința este zero; eroarea relativă nu se împarte la zero.
5. **Instrumente de măsură și jurnal.** Grafice x/v/a și U/I, cursor, unități, tabel accesibil și export CSV. Pentru mărimi cu unități diferite sunt necesare axe/scări explicite.
6. **Comenzi reversibile.** Undo/redo trebuie implementat asupra modelului, inclusiv modificările de parametri. Nu presupunem că biblioteca de desen oferă automat istoricul întregului experiment.
7. **Corectitudine înainte de efecte.** Pentru plan înclinat, Atwood, RC și lentile ideale sunt preferabile formule analitice sau solvere mici testate. Motorul de corpuri rigide este util când există realmente coliziuni și mecanisme complexe.

## 3. Corecții importante

- Matter.js oferă constrângeri de distanță și elastice, nu un solver electric. Două legături independente către puncte fixe nu impun conservarea sumei lungimilor firului unui scripete. Nu preluăm această aproximare drept experiment cantitativ. [API Matter.Constraint](https://brm.io/matter-js/docs/classes/Constraint.html).
- Formula Atwood are un singur factor g: `a = g(m1-m2)/(m1+m2)`. Pentru 3 kg și 1 kg, cu g = 9,81 m/s², rezultă 4,905 m/s² și tensiunea ideală 14,715 N. Planck este un solver numeric, nu o garanție universală de exactitate.
- Chiar sinteza finală trebuie verificată: Planck documentează atât constructorul `PulleyJoint(def)`, cât și forma cu argumente separate. Testul implementat folosește forma explicită, verificată cu versiunea instalată. [API Planck](https://piqnt.com/planck.js/docs/api/classes/PulleyJoint.html).
- La 30°, panta este `tan(30°) ≈ 0,57735`, nu 0,6. Transformarea coordonatelor în pixeli nu trebuie să modifice unghiul fizic.
- React Flow desenează și conectează noduri; calculul curenților rămâne separat. Pentru drop după zoom/pan folosim `screenToFlowPosition`, nu doar scăderea coordonatelor containerului. [API React Flow](https://reactflow.dev/api-reference/types/react-flow-instance).
- Patru mânere grafice nu înseamnă patru borne electrice independente. Un rezistor rămâne dipol; fiecare mâner trebuie mapat explicit la una dintre cele două borne. Nodurile fizice rezultă din conectivitatea firelor, nu din poziția desenului.
- mxGraph original este arhivat. Paper.js folosește Canvas și licența MIT; descrierea „SVG/BSD” din raport nu este corectă. [mxGraph](https://github.com/jgraph/mxgraph), [Paper.js](https://github.com/paperjs/paper.js).
- „Gratuit”, „open source” și „integrabil în produs” sunt noțiuni diferite. Nu preluăm tabelele de licențe ale platformelor complete ca verdict. Nu am integrat PhET, CircuitJS, GeoGebra sau Wokwi; o eventuală reutilizare necesită examinarea exactă a componentei și condițiilor curente. Iframe-ul nu înlocuiește această verificare.
- Nu adoptăm universal pragul de 1 ms/RK4 din sinteză: pasul depinde de model, stabilitate și eroarea măsurată. Pentru frecare trebuie tratate oprirea și trecerea static/dinamic; pentru fir, pierderea tensiunii; pentru MNA, singularitățile și sursele incompatibile. Rezistențele artificiale foarte mici/mari nu sunt o soluție universală pentru întrerupătoare ideale.
- Praxis cere ținte tactile de minimum 44 px; pragul de 24 px din sinteză nu înlocuiește regulile proiectului.

## 4. Ce am instalat și unde va fi folosit

Versiunile exacte sunt în `package.json` și `package-lock.json`, în `devDependencies`, conform convenției proiectului: npm este folosit la pregătirea fișierelor statice, nu în browser.

| Bibliotecă | Versiune | Licență în pachet | Utilizare propusă | JS local / gzip aproximativ |
| --- | --- | --- | --- | --- |
| Konva | 10.9.1 | MIT | Scene editabile de mecanică și optică: selecție, tragere, rotire, straturi | 190 / 58 KiB |
| Planck | 1.5.1 | MIT | Scripeți, articulații și ciocniri; verificare față de modele analitice | 207 / 46 KiB |
| math.js | 15.2.0 | Apache-2.0 | Sisteme liniare pentru circuite, conversii de unități, numere complexe | 252 / 76 KiB |
| uPlot | 1.6.32 | MIT | Grafice temporale, comparații și măsurători în mecanică/electricitate/unde | 51 / 23 KiB |
| Zod | 4.6.7 | MIT | Validarea experimentelor importate și a presetărilor | 444 / 91 KiB |

Dimensiunile sunt măsurate pe bundle-urile actuale; gzip nu garantează compresia unui anumit server. uPlot are și CSS local (~1,8 KiB). Zod este pachetul general: la un laborator concret poate fi redus prin importuri selective sau o variantă mai mică, cu verificarea API-ului.

Documentație verificată: [Konva](https://konvajs.org/docs/), [math.js](https://mathjs.org/docs/getting_started.html), [uPlot](https://github.com/leeoniya/uPlot/blob/master/docs/README.md), [Zod](https://zod.dev/).

### Disponibil deja, de reutilizat

- `@xyflow/react` 12.12.1 și React 19.2.0: hărți de concepte și viitorul editor de circuite. Nu am instalat vechiul `reactflow` 11 din exemple.
- `PraxisMath` și resursele KaTeX existente: formule; fără al doilea mecanism global de randare.
- `public/vendor/three/`: randare 3D existentă, de evaluat în contextul fiecărui laborator; nu am duplicat-o prin npm.
- `node:test`, esbuild și Playwright existente: verificare și împachetare. Nu am introdus un al doilea sistem de build/test.

### Amânate până la o nevoie concretă

| Opțiune | De ce nu este instalată acum |
| --- | --- |
| Matter.js, p2-es, Rapier, Ammo | Ar dubla motorul ales; WASM/3D nu sunt necesare pentru pregătirea actuală |
| Fabric.js, JSXGraph, Paper.js | Alternative ori extensii; Paper.js merită reevaluat pentru intersecții Bézier, JSXGraph pentru construcții geometrice avansate |
| react-konva | Wrapper opțional; Konva funcționează direct și cu laboratoarele fără React |
| dnd-kit, interact.js | Scenele alese au deja interacțiune; un al doilea sistem de gesturi se adaugă numai când rezolvă o nevoie neacoperită |
| Zustand, Immer | Starea și istoricul trebuie proiectate pentru editor; nu adăugăm un store global înainte de primul consumator |
| Comlink | Util dacă măsurătorile justifică Worker; API-ul Worker nativ rămâne disponibil |
| PixiJS, regl | De reconsiderat pentru multe particule/câmpuri după profilare; Canvas/Three existente pot fi suficiente |
| SPICE/WASM | De reconsiderat pentru circuite neliniare avansate, după solverul școlar și verificarea distribuției offline |
| Gridstack, jsTree, playhtml, Drawflow, JointJS, GoJS | Alte tipuri de UI, suprapunere cu infrastructura existentă ori costuri suplimentare de integrare |

## 5. Integrarea realizată și utilizarea viitoare

Instalare: `D:/ProiecteAI/Praxis-Fizica/node_modules/`.

Resurse distribuibile: `public/vendor/lab-libraries/`, copiate de build în `dist/vendor/lab-libraries/`. `manifest.json` înregistrează versiuni, dimensiuni și licențe. Directorul `licenses/` păstrează licențele pachetelor incluse efectiv în bundle, inclusiv dependențe tranzitive și NOTICE pentru math.js. Scriptul de generare este `scripts/build-lab-libraries.mjs`, apelat automat la build.

Fiecare bibliotecă are propriul fișier; **nu am adăugat încărcarea lor în antetul comun sau în lecțiile actuale**. Costul de transfer suplimentar al lecțiilor existente este astfel zero pentru aceste biblioteci, deși distribuția pe disc este mai mare.

Pentru un laborator nou în `public/simulari/<id>/`, exemplu de utilizare:

```html
<script src="../../vendor/lab-libraries/konva.min.js"></script>
<script>
  const Konva = PraxisKonva.default;
</script>
```

Celelalte API-uri: `PraxisPlanck`, `PraxisNumerics.lusolve/unit/complex`, `PraxisUPlot.default`, `PraxisValidation.z`. uPlot necesită și `uPlot.min.css`. Bundle-ul math.js expune numai cele trei funcții menționate, nu întregul API. Pentru o lecție deja compilată se pot importa direct pachetele npm și selecta funcțiile necesare.

La prima integrare reală: conectăm lifecycle-ul la pauză/suspendare, păstrăm traducerea RO/EN și `PraxisSound`, adaptăm Canvas la politica de rezoluție și măsurăm lizibilitatea. Canvas nu oferă automat o interfață accesibilă: parametrii, selecția și rezultatele au nevoie de echivalente DOM.

Exportul autonom al fiecărei lecții trebuie să includă explicit bundle-urile folosite, CSS-ul și licențele asociate, cu căi relative verificate. Testul file:// de acum validează bibliotecile, nu dovedește că toate arhivele viitoare le vor împacheta automat.

## 6. Ordine propusă pentru utilizare

1. **Plan înclinat și sistem Atwood:** Konva + formule analitice + uPlot; Planck pentru varianta cu mecanisme libere și comparație numerică. Afișăm frecarea statică/dinamică și tensiunea, cu domeniul de validitate.
2. **Constructor de circuite DC:** React Flow existent + simboluri IEC + solver MNA propriu folosind math.js + Zod pentru fișiere; apoi condensatoare/RC și grafice uPlot. Nu înlocuim automat lecțiile de rețele/Ohm deja funcționale.
3. **Banc optic editabil:** Konva pentru obiecte și rotații; solver optic propriu pentru intersecții, Snell și lentile ideale. Păstrăm separarea proiectului Optica-Lab de adaptorul Praxis.
4. **Unde, oscilații și câmpuri:** uPlot pentru date și comparații; accelerarea GPU/Worker se decide după profilare.

Acestea sunt propuneri de utilizare, nu laboratoare deja implementate și nici o schimbare a ordinii proiectelor convenite separat.

## 7. Verificări și limite

- Instalare reușită: cinci dependențe directe, 15 pachete noi cu tranzitive, versiuni fixate; fără executarea scripturilor de instalare ale noilor pachete.
- `node scripts/qa/lab-libraries.mjs`: reușit în Chrome headless, din fișier local, cu HTTP blocat. Verificate încărcarea celor cinci bundle-uri, randarea Konva/uPlot și actualizarea graficului, respingerea datelor invalide prin Zod, conversia 1 m → 100 cm, divizorul 9 V/1 kΩ/2 kΩ → 6 V și Atwood 3 kg/1 kg → 4,905 m/s² cu lungime totală a firului constantă. Fără erori JavaScript sau cereri HTTP.
- `npm run build`: reușit, cu 35 de laboratoare în registru și bibliotecile locale incluse în distribuție.
- `npm run check`: registru valid și 360 fișiere JavaScript verificate sintactic; 457/458 teste trecute în sandbox. Unicul eșec a fost `EACCES` pe loopback în testul serverului. Același test, reluat separat cu acces loopback, a trecut 1/1. Toate cele 458 de teste au astfel rezultat reușit, în cele două rulări; logul inițial: `outputs/library-review/check.log`.
- Audit npm: un avertisment **low**, în dependența preexistentă esbuild 0.28.0, privind serverul său de dezvoltare pe Windows; niciun avertisment raportat pentru cele cinci biblioteci noi la această verificare. Nu am rulat `npm audit fix --force` și nu am schimbat incidental instrumentele existente. [Advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr). Auditul nu este o garanție de absență a tuturor defectelor.
- Testul este de integrare tehnică, nu un audit pedagogic sau vizual al unui laborator nou. Nu am testat aceste biblioteci pe telefon/tablă fizică ori Safari și nu am publicat pe GitHub/Vercel.
