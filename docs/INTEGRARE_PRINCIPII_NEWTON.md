# Principiile mecanicii newtoniene

Integrare locală la 30 octombrie 2026, în capitolul Mișcare. Biblioteca are 18 laboratoare. Nu s-a publicat online.

Sursa inițială: `D:/ProiecteAI/principiile-mecanicii-newtoniene`, păstrată nemodificată. Conținut verificat cu paginile tipărite 57–74 din PDF-ul indicat de utilizator (paginile PDF 59–76). Referințele editoriale nu sunt incluse în lecția distribuită, traduceri, metadate sau scene.

Nouă taburi: concepte, inerție, forță și accelerație, acțiune–reacțiune, forțe și repere, frecare, elasticitate, probleme și test. Șase scene SVG originale, calculator de forță medie, patru probleme rezolvate și 14 întrebări. Texte complete RO/EN în JSON, incluse local în pagină. Schimbarea limbii păstrează parametrii și răspunsurile. Grafica vectorială rămâne clară la mărire, fără fonturi sau imagini externe.

Corecții: domeniul de aplicabilitate al mecanicii clasice; reper inerțial explicit; echilibru de translație versus rotație; rezultantă în principiul II; forță instantanee versus medie; forțe pe corpuri diferite în principiul III; frecare statică adaptivă versus cinetică; pragul de pornire tan φ = μs; calcul numeric corect la 30°; k = ES/l0 limitat la fir axial, nu resort elicoidal. Testul nu mai prezintă simultan kg·m/s² și J/m drept răspunsuri exclusive pentru newton.

Animații: desprindere tangentă; forță și accelerație în același sens; impulsuri opuse cu conservarea impulsului total; paralelogram încadrat la extreme; coborâre pe plan cu frecare în sus; resort și grafic semnat Fe,x = −kx cu scară adaptivă. Pornire explicită, pauză, resetare; timpul nu avansează în taburi inactive sau cât pagina este ascunsă. Suprafețele sunt deschise în ambele palete comune Praxis/Vii; textul păstrează contrastul.

Fișiere autoritative: `scripts/newton-content.json`, `public/shared/newton.js`, `public/shared/newton-model.js`, `public/shared/newton.css`. `npm run import:newton` regenerează pagina, traducerile și înscrierea în catalog. `npm run package:local` generează lecția autonomă bilingvă și distribuția întregii biblioteci.

Verificarea fizicii: `test/newton.test.mjs`, inclus în `npm run check`. Verificarea vizuală și a interacțiunilor folosește browserul conectat, în RO/EN, pe desktop și ecran tactil îngust.

Rezultat: toate cele 179 de teste trec. În browser au fost parcurse cele nouă taburi în RO/EN la 390 px, fără depășire orizontală și cu un singur panou activ. Verificate pornirea, pauza, desprinderea tangentă, viteza constantă la anularea forței, resetarea poziției/vitezei, coborârea pe plan și constrângerea μk ≤ μs. Toate cele 14 răspunsuri corecte dau 14/14; scorul se păstrează la schimbarea limbii. Varianta autonomă a fost deschisă prin `file://`, cu schimbare RO/EN și fără cereri HTTP. Consola browserului nu a raportat erori sau avertismente.

## Revizie de prezentare

Eliminat separatorul punct dintre formulele forței și impulsului. Scenele și controalele au înălțimi proprii, fără întinderea panourilor; controalele sunt în două coloane pe desktop și într-o coloană pe mobil. Scena forță–accelerație are vectorii ancorați în corp. Forțele acțiune–reacțiune sunt vizibile la t = 0 și în timpul contactului; timpul fizic este redat de cinci ori mai lent. După contact forțele sunt nule. Adăugată diagrama interactivă S/S′ cu u, v și t reglabile, poziții și viteze relative și accelerații egale. Modificările sunt bilingve.

Diagrama S/S′ include Pornire/Pauză și Reset (Start/Pause și Reset în EN). Animația sincronizează axele reperului mobil, corpul și timpul afișat, între 0 și 3 s. Reset păstrează vitezele și revine la t = 0; pornirea după capăt reia experimentul. Reglarea manuală a timpului pune pauză, iar taburile inactive și pagina ascunsă nu avansează simularea.

Redarea diagramei S/S′ are reglaj 0,1×–2× (implicit 1×) și repetare automată opțională, cu aceleași funcții în EN. Factorul multiplică doar avansul ceasului, nu vitezele fizice. Schimbarea factorului în timpul redării nu pune pauză. La repetare se păstrează excesul de timp peste limita de 3 s; fără repetare se oprește la limită. Reset și schimbarea limbii păstrează factorul și opțiunea de repetare.

În scena resortului sunt desenate G din centrul corpului în jos și Fe din punctul de prindere în sus, pe aceeași verticală, cu lungimi egale la echilibru. Eticheta masei este mutată lateral pentru a nu intersecta vectorii. Alungirea desenată este încadrată astfel încât forțele să rămână complet vizibile la extremele sliderelor. Explicația și valorile sunt disponibile în RO/EN.

În experimentul Forță și accelerație, G pornește din centrul corpului și este orientată în jos; N pornește din centrul contactului cu pista și este orientată în sus. Vectorii sunt coliniari, opuși și egali (N = G = mg). Segmentele comune au grosimi diferite pentru a rămâne ambele vizibile. Etichetele G/N sunt în stânga axei verticale, F/a/v în dreapta, iar masa este în afara corpului. Pista coincide cu baza corpului; readoutul include valorile G și N. Explicațiile sunt RO/EN.

Revizie: săgeata N este decalată grafic cu 12 unități spre stânga în zona contactului, cu grosimea de 3 în loc de 6. În Forță și accelerație există redare 0,1×–2× și repetare automată, RO/EN. Reset păstrează factorul și opțiunea de repetare. La capăt se reia din repaus; timpul rămas din cadrul curent este păstrat, folosind momentul exact al sosirii. Forțele și accelerația rămân independente de viteza redării.

Acțiune–reacțiune: adăugate reglajul 0,1×–2× și repetarea automată, RO/EN. Implicit 0,2× păstrează ritmul anterior (încetinire de cinci ori). Factorul scalează numai timpul redării, iar contactul rămâne 0,5 s fizice. Intervalul de 3,5 s se reia cu păstrarea restului de timp din cadru. Pauza și Reset păstrează masele, factorul și repetarea. Schimbarea factorului în timpul animației nu o oprește; schimbarea maselor reinițializează experimentul, ca înainte.

Notație vectorială: simbolurile vectorilor din scenele SVG au săgeți suprascrise, măsurate după litera de bază; indicii rămân separați. Sunt incluse v1/v2, forțele reciproce și suma impulsurilor. Componentele scalare, axele și valorile numerice nu primesc marcaj vectorial. Marcajele sunt redesenate la redimensionare și schimbarea limbii/prezentării.

Frecare: reglaj de redare 0,1×–2× (implicit 1×) și repetare automată, în RO/EN. Coborârea se reia din repaus la capăt, păstrând restul timpului din cadru. Dacă frecarea statică menține echilibrul, animația rămâne în repaus. Reset păstrează viteza redării și repetarea; schimbarea acestui factor nu oprește animația.

Vectorii viteză au linii de 1,5 unități și vârfuri independente de grosimea liniei. În Acțiune–reacțiune, vitezele folosesc o scară comună (săgeata maximă 144, minimă 24 pentru raportul maselor disponibil). Deplasarea desenată a corpurilor este compactată pentru a păstra săgețile întregi în scenă.

Inerție: redare 0,1×–2× și repetare automată, RO/EN. După desprinderea manuală, repetarea reface mișcarea circulară și desprinderea din același punct. Reset reface marginea și șterge punctul memorat, păstrând rata și repetarea. Limita zborului rezervă loc pentru vectorul viteză și eticheta lui.

Inerție: v este mărit de la 54 la 68 și grosimea de la 1,5 la 2; F radial este mărit de la 0,55R la 0,70R și grosimea la 3,6. Vârfurile au lungimea 12. Scena primește 40 de unități verticale suplimentare, păstrând scara vizuală; limita zborului rezervă spațiu pentru vectorul mărit.

Elasticitate: model armonic vertical ideal în jurul xeq = mg/k, cu amplitudinea 25% din xeq și perioada 2π√(m/k). Pornire/Pauză, Reset, redare 0,1×–2× și repetare automată în RO/EN. Corpul, spirele, punctul graficului și forța elastică sunt sincronizate. Greutatea rămâne constantă; Fe = kx variază, iar rezultanta respectă ma. Fără repetare se pune pauză după o perioadă; Reset reface echilibrul static. Schimbarea masei sau constantei resetează la echilibru.

Elasticitate, completare RO/EN: x = Δl = l − l0, Δl = Fd/k la echilibru în domeniul liniar, Δlech = mg/k pentru corpul suspendat și Δl = Fd l0/(ES) pentru fir. Este explicitată diferența dintre alungirea instantanee și deplasarea față de echilibru. Curbe SVG originale, schematice, fără scară numerică, pentru metal ductil, material fragil și elastomer. Diagrama metalului distinge proporționalitatea P, limita elastică L, maximul nominal M și ruperea R; se explică plasticitatea și gâtuirea. Diagramele folosesc tensiune nominală raportată la secțiunea inițială și deformație relativă. Variantele se deschid prin controale native details/summary accesibile, fără dependențe externe.

Verificare conceptuală: OpenStax University Physics, [12.3 Stress, Strain, and Elastic Modulus](https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus) și [12.4 Elasticity and Plasticity](https://openstax.org/books/university-physics-volume-1/pages/12-4-elasticity-and-plasticity). Sursele nu sunt afișate în lecție.

Curbele materialelor: desen compact în stânga și explicații/comenzi în dreapta, cu stivuire pe telefon. Fiecare material are un ciclu de încărcare–descărcare de 8 s la 1×, Pornire/Pauză, Reset, factor 0,1×–2×, repetare și nivel maxim 10–90% din abscisa curbei schematice (nu deformație fizică procentuală). Marcatorul și proba întinsă se sincronizează prin același model normalizat; geometria probei este amplificată. Descărcarea elastică reface curba fără histerezis. În plastic, metalul descarcă pe o dreaptă cu panta inițială și păstrează alungire reziduală. Curbele și descărcarea sunt idealizate, nu date experimentale. Ciclurile se opresc înainte de rupere, inclusiv pentru materialul fragil; ruperea rămâne reper pe curba completă. Controalele și starea sunt RO/EN, păstrate la schimbarea limbii; taburile inactive, detaliile închise și pagina ascunsă nu avansează animația. Reset păstrează reglajele. Teste independente pentru revenire elastică și descărcare plastică.
