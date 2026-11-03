# Audit fizic și de afișare — Unde mecanice

3 noiembrie 2026. Verificare locală în Praxis-Fizica; fără publicare. Acest raport completează verificarea din 27 octombrie și înlocuiește descrierile vechi ale modelelor modificate.

## Conținut și domeniu

Au fost inventariate formulele din cele 19 teme: teoria și demonstrațiile, citirile dinamice, textele desenate în Canvas, instrumentele, protocoalele, glosarul, harta formulelor, problemele și testele. Variantele greșite din grilă sunt distractori intenționați; cheile și explicațiile au fost verificate separat. Catalogul alăturat păstrează expresiile observate în RO/EN și reprezentările TeX; scripturile din `scripts/qa` permit repetarea inventarului.

Manualul local F1 a fost consultat integral (pagini tipărite 29–55), cu atenție la pp. 32–34. În Bazele undelor ordinea este: vector de oscilație, puncte de egală fază, lungime de undă, apoi simularea mărimilor și celelalte modele. Cele trei figuri SVG originale au descrieri accesibile. Vectorul reprezintă deplasarea de la echilibru; aceeași elongație nu înseamnă aceeași fază. Perechile P₁/P₃ și P₂/P₄ au aceeași tendință temporală în pereche. Lungimea de undă unește puncte consecutive de aceeași fază. Ecuația principală rămâne cea din manual, cu t/T și x/λ, fără k.

## Corecții fizice

| Domeniu | Rezultat verificat / corecție |
|---|---|
| Unde plane și sferice | A constant și I constant în modelul plan nedisipativ; A proporțional cu 1/r și I=P/(4πr²) pentru sursă izotropă fără absorbție. Relațiile și referințele r₀ sunt vizibile, nu deduse dintr-o etichetă ambiguă. |
| Bătăi | f_b=abs(f₁−f₂); pentru frecvențe egale nu există o perioadă finită a bătăilor. Anvelopa și semnalul au aceeași scară. |
| Interferență | Intensitate medie relativă 2+2cos(2πΔr/λ), respectiv 2 pentru surse incoerente; sunt precizate amplitudinile locale egale și omiterea atenuării geometrice. |
| Coardă | Temă dedicată cu impuls incident/reflexie și moduri proprii, capăt stâng fix și capăt drept fix sau liber. Fix: deplasare nulă și inversare; liber: derivată spațială nulă și fără inversare. v=√(Tₘ/μ). Fix–fix: λₙ=2L/n, νₙ=nv/(2L). Fix–liber: λₙ=4L/(2n−1), νₙ=(2n−1)v/(4L). A este amplitudinea fiecărei componente, 2A amplitudinea ventrelor. |
| Unde pe apă | Viteza generală este calculată din dispersia liniară; limitele adâncă/mică sunt aproximații, nu limite numerice între care trebuie să stea orice valoare. Orbitele păstrează raportul real al axelor; calcul stabil la adâncimi mari. Pragul H/h este doar indicativ. |
| Tuburi | Frecvențele sunt calculate și pentru tubul inactiv. Presiunea și deplasarea au unități diferite; profilurile normalizate nu sunt oscilații temporale în fază. Corecția de capăt aproximativă se însumează pentru capetele deschise neflanșate. |
| Energie și acustică | Energia instantanee și media temporală sunt distincte. Intensitatea sursei are calibrare relativă explicită; I(R₀) nu este confundat cu pragul auditiv I₀. Nivelurile folosesc logaritm în baza 10. |
| Doppler | Semnele pentru apropiere/depărtare, mișcarea față de mediu și ipotezele acustice sunt păstrate. |
| Instrumente | Chitara afișează contextul fizic; algoritmul Karplus–Strong este explicat opțional, fără formula tehnică ambiguă din antet. „Filtru de corp” este un filtru trece-jos, fără pretenția unui model complet al cutiei. Chitara și sonometrul produc PCM finit și nenul. Sonometrul compensează întârzierea și explică limita de redare la 30 Hz. |
| Măsurare | Sensibilitatea osciloscopului se aplică o singură dată. FFT este necalibrat. Autocorelația distinge decalajul în eșantioane N₀ de perioada T₀=N₀/f_s. Protocolul sonometrului folosește f² în funcție de tensiune. |
| Seismică | Modulele elastice au unități GPa și controale care păstrează K pozitiv; timpul undei de suprafață include întârzierea de generare. Cercurile epicentrale elimină adâncimea din distanța hipocentrală; canalele senzorului sunt proiecții. |
| Love / Rayleigh | Love: ecuația de dispersie a modului fundamental SH într-un strat peste semispațiu, densități egale, tensiune tangențială nulă la suprafața liberă. Rayleigh: soluție omogenă izotropă cu coeficient Poisson 0,25 și vR/vS≈0,9194, două exponențiale și derivate analitice. Fără inversarea arbitrară a orbitelor la o adâncime fixată artificial. |
| Rezonanță structurală | Oscilator liniar cu excitație a bazei, deplasare relativă și scări vizuale explicite. Nu se deduc avarii sau siguranță din indicatori arbitrari. |
| Probleme | Cele șapte rezultate: 0,85 m; 79,0569 Hz; 500 Hz; 510 Hz; 60 dB; 1111,111 Hz; 1,5. Introduse efectiv în interfață: 7/7. S-au corectat și pașii intermediari ai baremului, radicalul 9000, logaritmul și rotunjirea 79,06 Hz. |

## Afișare matematică

Formulele folosesc local MathML, cu fracții suprapuse și indici/exponenți structurali. Formatorul păstrează expresia completă, radicalii, funcțiile trigonometrice, valoarea absolută, proporționalitatea, semnele și unitățile. Nu mai înghite propoziția următoare în numitor și nu interpretează separatorul dintre citiri ca modul matematic. Formulele esențiale din desene au fost mutate în text DOM scalabil. Nu se descarcă fonturi sau biblioteci de pe CDN.

Navigarea separă Secțiune → Temă → Activitate; selecțiile de niveluri diferite au aspect diferit. Noțiunile și experimentele au activități distincte, explicațiile lungi sunt pliabile. La telefon și la text 200% se acceptă derulare verticală și, pentru figurile/formulele lungi, locală; pagina nu trebuie să se lărgească.

## Verificări și limite

Scripturile browser verifică aplicația montată, nu o copie a formulelor.

| Verificare | Rezultat |
|---|---|
| `npm run check` | 293 teste trecute; niciun eșec. Include verificarea sursei originale, modelele fizice, formatul matematic și distribuțiile. |
| Inventar browser RO/EN | 444 expresii DOM, 47 familii Canvas, 106 combinații de vederi/limbi. Include soluțiile efectiv validate și deschise, capete fix/liber și modurile 1/6. Fără erori de randare, marcaje interne vizibile sau relații înglobate greșit în numitor. |
| Traduceri matematice | Nicio expresie RO reziduală cu diacritice în conținutul matematic EN al inventarului final. Protocolul avansat este redat o singură dată, cu panta și distanța hipocentrală în fracții structurale. |
| Funcționare coardă/chitară | 34 probe în browser, repetate cu succes în fișierul offline: condiții la capete, moduri, comenzi, pauză, schimbare limbă și oprire la inactivitate. |
| Probleme | 7/7 răspunsuri validate în interfață; pașii soluțiilor incluși în inventar. |
| Desktop 1366×768, text 100% | 94 vederi RO/EN: fără lărgirea paginii, erori matematice sau slidere comprimate. Bazele undelor încap cu navigarea. Chitara și ambele activități pentru coardă au limita inferioară a navigării la 767 px, în ambele limbi. |
| Desktop 1920×1080, DPR 2 | 94 vederi: fără lărgirea paginii, erori matematice sau slidere comprimate; traseu minim 129 px. |
| Telefon 390×844, DPR 2 | 94 vederi la 100%, apoi la 200%: fără lărgirea paginii sau erori matematice. Derulare verticală și locală pentru formule/figuri lungi. Comenzile tactile ale coardei au înălțimea de 52 px. |
| 4K 3840×2160, text 200% | 94 vederi: fără lărgirea paginii sau erori matematice; comenzile rămân accesibile. Coloana extensiei clădirilor urmărește dimensiunea textului și se reorganizează pe containere înguste, evitând derularea în citirile scurte. |
| Distribuții | Import, build și arhiva autonomă bilingvă regenerate; rulare `file://` verificată fără erori în consolă. |

Listele lungi de referință, problemele/testele și unele extensii pot necesita derulare; nu se declară că întregul laborator, cu toate explicațiile deschise simultan, încape într-un singur ecran. Ecuația undei este explicit asociată regimului armonic stabilit în simulare; cazul pornirii sursei și întârzierea de sosire sunt explicate separat.

Modelele rămân didactice: coardă ideală la oscilații mici, unde pe apă liniare, bazin tsunami sintetic și mediu seismic simplificat. Animațiile încetinite indică separat timpul/frecvența fizică. Microfonul, difuzoarele, MediaRecorder și tabla Android reală nu au fost validate pe hardware; verificarea tactilă este emulată. Nu se afirmă calibrare sonometrică sau predicție geofizică/structurală.

## Surse de control

- Manualul local F1, paginile tipărite 29–55; figuri și definiții pp. 32–34.
- [OpenStax — interferență și reflexie la capete](https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves).
- [OpenStax — unde staționare și moduri proprii](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance).
- [OpenStax — surse de sunet și tuburi](https://openstax.org/books/university-physics-volume-1/pages/17-5-sources-of-musical-sound), [Doppler](https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect).
- [W3C — Web Audio](https://www.w3.org/TR/webaudio-1.0/).
- [Royal Society — existența și dispersia undelor Love](https://doi.org/10.1098/rsta.2019.0111), [Princeton — polarizarea undelor de suprafață](https://globalseismology.princeton.edu/data/surface-waves).

Trasabilitate: adaptoarele păstrează sursa originală și sunt reversibile. Nu se editează manual fișierul generat. Importul, buildul și pachetul offline trebuie regenerate împreună.
