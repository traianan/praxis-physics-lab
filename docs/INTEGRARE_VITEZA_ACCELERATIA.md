# Viteza și accelerația — integrare la 28 octombrie 2026

Laboratorul este disponibil în **Mișcare → Viteza și accelerația**, la `simulari/viteza-si-acceleratia/index.html`.

Sunt păstrate cele patru secțiuni ale materialului primit: teoria, laboratorul rectiliniu, laboratorul curbiliniu cu patru traiectorii și laboratorul polinomial. Formulele, presetările, intervalele pentru mărimile medii, vectorii și cele trei canvasuri sunt păstrate. Desenele folosesc fundalul deschis Praxis (#f6f8f6), grilă discretă, panouri albe și culori adaptate pentru contrast; interfața folosește suprafețele, antetul, fonturile, butoanele și sliderele comune Praxis.

Integrarea reutilizează `PraxisLabHeader`, `course.js` și setările comune pentru text, paletă, sunet și atingere. Adaptorul `shared/velocity.js` adaugă nume accesibile, navigare cu săgețile între secțiuni și oprirea animațiilor la ascunderea paginii. Butoanele −/+ folosesc evenimentele originale ale sliderelor. RO/EN funcționează cu dicționare incluse în pagină, fără cereri externe pentru traduceri; etichetele Canvas și textele generate folosesc mecanismul comun.

## Corecții de comportament

În sursa primită, obiectele `const rectLab`, `curvLab` și `polyLab` erau verificate ca proprietăți `window`, astfel încât schimbarea secțiunii nu oprea animațiile ascunse. Adaptorul de import verifică direct obiectele. Cadrele în așteptare sunt anulate la pauză și oprire, prevenind dublarea animației la reluări rapide. Intervalele mari dintre cadre sunt limitate la 0,1 s.

## Surse și reproducere

Cele cinci fișiere primite sunt păstrate nemodificate în `sources/viteza-si-acceleratia/`. Inventarul SHA-256 este în `imported-velocity.json`. Folderul temporar `Viteza_si_acceleratia` este eliminat numai după verificarea copiilor și a distribuției.

1. `npm run import:velocity` — publică dicționarele și reconstruiește laboratorul din sursele păstrate (necesită Python pentru publicarea dicționarelor).
2. `npm run offline:courses` — reconstruiește arhivele autonome, inclusiv `viteza-si-acceleratia-offline.zip`.
3. `npm run build` — actualizează distribuția comună `dist/`.
4. `npm run check` — verifică sintaxa și cele 68 de teste, inclusiv modelele cinematice, descompunerea Frenet și pauză/reluare/schimbare secțiune.

Nu sunt necesare Python, instalări de pachete sau internet pentru utilizarea laboratorului. Arhiva individuală se dezarhivează și se deschide prin `index.html`. Biblioteca completă folosește pornitoarele existente.

## Verificare

Modelele rectiliniu și polinomial au fost verificate numeric; cele patru moduri plane păstrează suma componentelor tangențială și normală, ortogonalitatea și modulul accelerației. În browser au fost verificate cele patru secțiuni, RO/EN, pasul sliderelor, avansul animației, pauza la schimbarea secțiunii și afișarea la 390 px și pe desktop. Pachetul autonom include componentele comune direct în HTML.

## Claritatea desenelor

`shared/velocity-canvas.js` dimensionează bufferul fiecărui canvas la lățimea afișată × devicePixelRatio și adaptează transformarea contextului. Coordonatele fizice originale rămân 920×500, 920×520 și 920×470. ResizeObserver redesenează la schimbarea dimensiunii sau secțiunii; redimensionarea ferestrei actualizează și densitatea pixelilor. Efectul de glow al mobilului este eliminat. Testul verifică atât mărirea desktop la DPR 2, cât și reducerea pe mobil la DPR 3.

## Indici inferiori

Notațiile vₘ, aₘ, aₜ și aₙ folosesc indici inferiori Unicode în toate etichetele Canvas și opțiunile HTML, inclusiv în dicționarele RO/EN. Importul aplică conversia doar notațiilor științifice, păstrând identificatorii JavaScript și sursele originale. Verificarea în browser nu găsește notații cu underscore în textele interfeței sau în etichetele desenate.

## Încadrarea etichetelor

`shared/velocity-labels.js` desenează textele după geometrie, măsoară textul în limba activă și îl poziționează în interiorul propriului panou. Titlurile lungi se împart pe rânduri; reperele axelor au prioritate, iar etichetele mobile evită celelalte texte, punctele și segmentele desenate. Etichetele deplasate ale vectorilor și punctelor folosesc linii discrete de legătură. Fundalul alb păstrează lizibilitatea. Notațiile și coordonatele fizice sunt păstrate. Verificarea în browser acoperă 80 de combinații de limbă, presetare, traiectorie și timp, inclusiv t = 10 s pentru Tangenta și Ox (m).
