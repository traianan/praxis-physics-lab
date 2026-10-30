# Verificare fizică — Unde mecanice

Data: 27 octombrie 2026. Versiune locală Praxis-Fizica. Modificările sunt locale; nu s-a publicat pe GitHub/Vercel.

## Rezultat și limite

Au fost revizuite modelele, formulele și baremele celor 19 teme; cele 37 de ecrane au fost parcurse în browser fără erori în consolă. Verificarea privește modelele didactice implementate. Desenele instrumentelor sunt încetinite, sunetele sunt sintetizate, iar harta tsunami și seismogramele sunt sintetice. Acestea nu reprezintă măsurători sau predicții geofizice/structurale.

Microfonul fizic, difuzoarele, înregistrarea MediaRecorder și comportamentul tablei Android reale nu au fost testate pe hardware. Testarea touch a folosit emularea browserului la 390×844, DPR 2. Nivelul sonor efectiv în clasă depinde de aparat și volum; simularea nu calibrează un sonometru.

## Corecții efectuate

- **Huygens (actualizat 27 octombrie):** filtrul original elimina frontul după primul cadru. Componenta actuală construiește continuu fronturi plane/sferice: surse fixe și simultane în fiecare etapă, cercuri elementare de rază vΔt și înfășurătoare tangentă. Etapele se succed automat, cu scară fixă; reluările demonstrative sunt etichetate. Slider Δt (0–1 s), ±0,01 s, Pauză/Pornește, resetare și viteză. Detalii și limite în HUYGENS_CONSTRUCTIE_TEMPORALA.md.
- **Touch pe canvas:** conversia mouse→Pointer Events se execută înainte de ramura specială canvas. Înainte, returnarea timpurie o ocolea. Coordonatele evenimentelor rămân în sistemul logic al desenului, inclusiv pe ecrane cu DPR diferit de 1.
- **Tuburi:** eticheta presiunii la capete era inversată. Capăt deschis: ventru de deplasare/nod de suprapresiune. Capăt închis: nod de deplasare/ventru de suprapresiune. Formele desenate sunt profiluri spațiale normalizate, nu valori simultane ale presiunii și deplasării. Oscilatorul audio urmărește frecvența schimbată din controale și se oprește la părăsirea temei. Al doilea mod al tubului închis este **armonica a treia**.
- **Chitară:** prima iterație Karplus–Strong citea `I[-1]`, producând NaN în semnalul generat. Condiția inițială este acum finită și întârzierea include corecția de jumătate de eșantion. Verificat la 44,1 și 48 kHz: semnal finit, nezero, amortizat, fundamentală apropiată de nota cerută.
- **Bară/xilofon:** forma sinusoidală arbitrară a fost înlocuită cu modurile Euler–Bernoulli pentru o bară uniformă liberă–liberă, cu rădăcini βL≈4,730; 7,853; 10,996; 14,137. Momentul și forța tăietoare se anulează la capete. Suporturile la circa 0,224L și 0,776L sunt noduri ale fundamentalei, nu ale tuturor modurilor. Modelul nu reprezintă bara profilată a oricărui xilofon real.
- **Castron:** rapoartele prestabilite sunt marcate ca rețete de sinteză ilustrative. Testul nu mai sugerează rapoarte universale pentru orice castron.
- **Energie:** pentru y=A sinφ, energia instantanee totală a undei progresive este w=ρA²ω²cos²φ, iar media este ½ρA²ω². Desenul folosea greșit sin² și un factor ½ în valoarea instantanee. Formula intensității medii rămâne I=½ρvA²ω².
- **Intensitate:** cursorul amplitudinii nu influența calculul. Puterea este acum proporțională cu A², cu referința explicită P=1 mW la A₀=0,5 mm și r₀=1 m. La distanță variabilă se aplică I=P/(4πr²), fără absorbție.
- **Sonometrul:** graficul avea titlul axelor inversat; este f² în funcție de tensiunea T, cu pantă 1/(4μL²).
- **Coardă staționară:** frecvența vizuală depinde acum de n, L, T și μ, prin fₙ=n√(T/μ)/(2L), cu încetinire explicită de 50 ori. S-a corectat identitatea trigonometrică pentru diferența sinusurilor.
- **Doppler:** viteza desenată a fronturilor era prea mică față de viteza sursei, producând un aspect aparent supersonic la viteze subsonice. Ambele folosesc acum aceeași scară și timp real. Fronturile sunt rarefiate vizual; nu reprezintă fiecare ciclu de 440 Hz. Observatorul rămâne la dreapta intervalului parcurs de sursă.
- **Apă:** criteriul de spargere folosește H/h, cu H=2A în aproximația sinusoidală, în loc de A/h. Pragul aproximativ 0,78 pentru apă mică nu este prezentat ca un criteriu universal Miche. Modelul liniar nu simulează spuma sau inundarea reală; efectul este un indicator didactic.
- **Tsunami:** harta era descrisă simultan drept reală și sintetică. Acum este identificată explicit ca sintetică; sosirile și înălțimile sunt ilustrative. v=√(gh) se aplică limitei de undă lungă, fără a transforma acest desen într-un sistem de avertizare.
- **Love:** s-a eliminat afirmația că deplasarea trebuie să fie zero la suprafața liberă. Condiția liberă privește tensiunea tangențială. Profilul exponențial ilustrativ are amplitudine maximă la suprafață.
- **Triangulație:** se utilizau numai diferențele de coordonată x și raza hipocentrală pentru cercuri epicentrale. Acum distanța epicentrală include ambele coordonate, iar raza cercului este Δ=√(dₕ²−h²), cu adâncime cunoscută și scară unică. Secțiunea P/S rămâne schematică, cu viteze constante, nu trasare de raze prin Pământul real.
- **Rezonanță:** amplitudinile curbei aveau unități de g tratate drept m/s²; s-a introdus 9,81. Integrarea Euler cu pas fix a fost înlocuită cu RK4 și subpași de maximum 1 ms; s-a eliminat micșorarea artificială `x*=0.55` la fiecare cadru pentru izolator. Calculul reprezintă deplasarea relativă x față de baza excitată. Curba armonică nu este numită spectru de răspuns seismic. Au fost corectate afirmații despre potrivirea exactă a frecvențelor, costuri universale, colaps și presupuse cerințe normative. Indicatorii vizuali nu măsoară avarierea reală.
- **Probleme:** scorul este calculat din problemele corecte distincte, astfel încât apăsările repetate nu îl pot crește artificial. Condiția de fază inițială a surselor este explicită în problema și întrebarea de interferență.

## Bareme

Cele 7 rezultate, recalculate independent: **0,85 m; 79,0569 Hz; 500 Hz; 510 Hz; 60 dB; 1111,1111 Hz; 1,5**. Aproximările și toleranțele existente sunt compatibile cu acestea.

Cheile de mai jos sunt numerotate de la 1 pentru variantele afișate:

| Test | Variante corecte pentru întrebările 1–10 | Verificare conceptuală |
|---|---|---|
| Fundamente | 1, 2, 1, 1, 2, 1, 1, 1, 2, 1 | front de fază egală; λ=vT; propagare +x; Huygens; a≈λ; Snell; surse în fază; coerență; sunet longitudinal; k=2π/λ |
| Acustică | 1, 1, 2, 1, 2, 2, 2, 2, 2, 2 | noduri pe coardă; capete deschise; armonice impare; 60 dB; Doppler; timbru; parțiale nearmonice; bătăi 3 Hz; 1/r²; flux mediu nul pentru undă staționară ideală |

La interferență și unde staționare se presupune un mediu liniar, surse coerente și amplitudini compatibile cu superpoziția. Minime perfect nule cer amplitudini egale. La conducte, capetele sunt idealizate: corecția de capăt și pierderile nu sunt calculate. Legile 1/r și 1/r² presupun propagare sferică liberă fără absorbție. Dispersia pe apă este gravitațională liniară; capilaritatea nu este inclusă. Audio și animația geometrică nu reprezintă fiecare oscilație sonoră la scară temporală reală.

## Dovezi de verificare

- `npm run check`: **32/32 teste trecute**.
- Teste de regresie din codul generat, nu o copie paralelă a implementării: geometria Huygens și supraviețuirea fronturilor; sunet Karplus–Strong; condiții la capetele barei; răspuns SDOF comparat cu soluția analitică staționară; bareme; anularea RAF la Pauză.
- Toate cele 37 de ecrane: deschise în browser, fără erori în consolă. Nu s-a activat microfonul.
- Huygens: RO/EN, 1920×1080 și emulare touch 390×844 DPR 2; fără depășire orizontală; comenzi de minimum 44 px; fronturi detectabile în pixelii canvasului.
- Mișcarea rectilinie: Start → schimbare tip → Start, timpul 0 și după așteptare; traiectoria nouă este oprită. Preseturile MRU/MRUV nu mai declanșează automat Play.
- Pachetul autonom Unde mecanice: încărcat prin `file://`, Huygens funcționează, fără cereri HTTP/HTTPS; RO/EN incluse.
- Patch-urile sunt documentate în `scripts/wave-physics-patches.json` și `scripts/motion-behavior-patches.json`. Testele inversează patch-urile și verifică SHA-256 al surselor originale, pentru a detecta pierderi de conținut neintenționate.

## Surse de referință

- [OpenStax — principiul Huygens](https://openstax.org/books/university-physics-volume-3/pages/1-6-huygenss-principle): surse secundare și front tangent.
- [OpenStax — moduri ale undelor sonore staționare](https://openstax.org/books/university-physics-volume-1/pages/17-4-normal-modes-of-a-standing-sound-wave): condiții la capete și armonice.
- [OpenStax — energia și puterea undelor](https://openstax.org/books/university-physics-volume-1/pages/16-4-energy-and-power-of-a-wave): energie și intensitate medie.
- [Stanford — Karplus–Strong](https://theory.stanford.edu/~blynn/sound/karplusstrong.html): recurență și întârzierea N+½.
- [NOAA — propagarea tsunami](https://www.noaa.gov/jetstream/tsunamis/tsunami-propagation): limita v=√(gh).
- [FEMA — Coastal Construction Manual](https://www.fema.gov/sites/default/files/2020-08/fema55_voli_combined.pdf): H reprezintă înălțimea valului, iar 0,78 din adâncime este o aproximație dependentă de condiții.
- [BGS — tipuri de unde seismice](https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/how-are-earthquakes-detected/): polarizări P/S/Love/Rayleigh și dependența de structură.
- [USGS — efectele cutremurelor](https://www.usgs.gov/programs/earthquake-hazards/what-are-effects-earthquakes): răspunsul depinde de mai mulți factori, nu doar de rezonanța unui oscilator.

## Distribuții actualizate

- `outputs/Praxis-Fizica-local.zip` — biblioteca completă; se extrage și se pornește cu `Porneste-local.cmd` sau `Porneste-in-retea.cmd`.
- `dist/simulari/unde-mecanice/unde-mecanice-offline.zip` — lecție autonomă RO/EN; se extrage și se deschide `index.html`.
- `dist/simulari/miscarea-rectilinie/miscarea-rectilinie-offline.zip` — include comportamentul Play corectat.

## Extindere: front plan / front sferic

Construcția Huygens include comutatorul RO/EN „Front de undă plan / Front de undă sferic”. În secțiunea plană, sursele rămân pe dreapta x=x₀ în etapa curentă; secțiunile circulare ale undelor elementare au aceeași rază vΔt, iar tangenta comună înainte este x=x₀+vΔt. Dreapta reprezintă secțiunea unui plan infinit; sursele afișate sunt reprezentative. În varianta curentă, schimbarea tipului reinițializează și pornește redarea continuă, fără buton „Frontul următor”. Controlul Δt permite oprire și examinare pas cu pas; vezi HUYGENS_CONSTRUCTIE_TEMPORALA.md.

Verificat: ambele tipuri, RO/EN, desktop și emulare touch 390×844 DPR 2, fără depășire orizontală. Testul geometric pentru frontul plan verifică razele egale, centrele fixe și tangenta comună. Total actual: **33 de teste trecute**. Ambele construcții sunt incluse în distribuția autonomă și în arhiva bibliotecii.
