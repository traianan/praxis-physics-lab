# Audit — Mișcarea rectilinie

27 octombrie 2026. Verificare locală a celor patru secțiuni, fără publicare pe GitHub/Vercel.

## Acoperire

Au fost revizuite formulele și implementarea graficelor/animațiilor pentru clasificare, poziție/deplasare/viteză medie, MRU, întâlnirea mobilelor, MRUV, frânare, schimbarea sensului și calculatorul Galilei. Testele execută codul efectiv al laboratorului, cu fixture-uri pentru interfață; verificarea browserului completează testele numerice.

Pentru MRUV au fost verificate combinațiile v₀∈{−12,0,12}, a∈{−2,0,2}, cu/fără menținere în repaus, la t∈{0,3,6,8,10}. Sunt comparate poziția, viteza, accelerația, distanța, datele căruțului și funcțiile celor trei grafice. Viteza și accelerația sunt mărimi cu semn pe axă. Accelerarea/încetinirea este clasificată prin semnul produsului v·a, nu numai prin semnul accelerației. Distanța parcursă rămâne pozitivă și include ambele porțiuni la schimbarea sensului.

## Corecții

1. **Jurnalul duplicat.** Revenirea cursorului înaintea opririi și trecerea din nou peste ea adăugau evenimentul încă o dată. Jurnalul identifică acum evenimentele după moment și identificator. Același eveniment nu apare de două ori în jurnal; Reset și schimbarea parametrilor curăță jurnalul relevant.
2. **Spațiul „m și”.** Textul sursă conținea spațiul, dar traducerea recursivă îl elimina dintr-un fragment capturat. Runtime-ul comun păstrează acum spațiile de la marginile fragmentelor. Verificat în RO și EN, inclusiv după schimbarea limbii și revenirea peste eveniment.
3. **Menținere în repaus.** Din momentul opririi inclusiv, opțiunea de frânare fixează x la poziția de oprire și pune v=0, a=0. Mesajul fazei curente nu mai anunță întoarcerea în cazul menținerii în repaus. Aceasta este o mișcare pe porțiuni, nu MRUV cu aceeași accelerație după oprire.
4. **Originea și rădăcinile.** O rădăcină dublă este un singur eveniment. Sunt detectate toate atingerile originii în intervalul unui pas, inclusiv două rădăcini apropiate și atingerea la întoarcere. Mesajul spune „ajunge în originea O”, fără a afirma trecerea în partea cealaltă la o simplă atingere. Ecuația de gradul doi folosește o evaluare mai stabilă pentru rădăcini de dimensiuni diferite.
5. **Calculatorul Galilei.** Semnul vitezei inițiale nu se mai ghicește după semnul deplasării. Se afișează toate soluțiile compatibile cu durată nenegativă. Soluțiile numai din trecut, datele contradictorii și cele insuficiente sunt respinse/explicate. Repausul și a=0 sunt tratate separat. Câmpurile goale nu sunt interpretate automat drept zero.
6. **Durata dintre două poziții.** La limitele cursoarelor t₁=t₂=20 sau t₂=0, se putea păstra Δt=0. Perechea de momente este acum corectată astfel încât t₂>t₁, evitând împărțirea la zero.
7. **Problema întâlnirii accelerate.** Convenția semnată a accelerației mobilului B este consecventă în date și în formule: aB<0, xB=D+aB·t²/2 și t²=2D/(aA−aB). Rezultatele numerice erau corecte, dar notația amesteca semnul cu modulul accelerației.
8. **Formulele de frânare din rezolvări.** Pentru convenția cu v₀>0, a<0 este folosit −v₀²/(2a), consecvent cu formula corectată anterior. Parametrul pozitiv din enunțurile care spun „accelerație de modul...” rămâne un modul explicit.
9. **Graficul problemei x(t).** Domeniul vertical include capetele ambelor drepte pe întregul interval afișat; dreapta crescătoare nu mai este tăiată când depășește poziția inițială a celui de-al doilea mobil.
10. **Anularea atingerii.** `pointercancel` încheie tragerea pe grafice; anularea gestului nu lasă activă deplasarea cursorului temporal.
11. **Traiectoria eliptică.** Este precizat că animația arată forma traiectoriei și nu calculează o orbită kepleriană. Quizul păstrează distincția explicită că „uniformă” la mișcare curbilinie se referă la modulul vitezei.

## Verificarea problemelor și testelor

Toate cele **20 de probleme** au fost verificate pe datele inițiale și pe **32 de variante regenerate pentru fiecare**: 660 de seturi în total. Răspunsurile sunt comparate cu calcule independente; enunțurile, rezolvările și SVG-urile sunt generate fără NaN/Infinity/undefined. În plus, au fost verificate cele 10 bareme de clasificare și derivatele x′=v, v′=a pentru cele patru exemple de mișcare.

| Problemă | Răspunsuri pentru datele inițiale |
|---|---|
| Viteza medie | 72 km/h; 20 m/s |
| Legea MRU | x(8)=20 m; tO=4 s |
| Întâlnire din sensuri opuse | 3 h; 180 km de A |
| Urmărire | 10 s de la plecarea motociclistului; 150 m |
| Jumătăți de drum | 48 km/h |
| Tren și pod | 30 s |
| Grafic x(t) | 3 m/s; −2 m/s; 6 s; 18 m |
| Pornire din repaus | 20 m/s; 100 m |
| Frânare | 4 s; 40 m |
| Grafic v(t) | 3 m/s²; −2 m/s²; 180 m; 9 m/s |
| Ecuația Galilei | 2 m/s²; 5 s |
| Urme de frânare | 15 m/s; 54 km/h; 3 s |
| Decolare | 1,4 m/s²; 49,4975 m/s; 35,3553 s |
| A n-a secundă | 50 m în primele 5 s; 18 m în secunda a cincea |
| Aruncare verticală | 20 m; 4 s |
| Două treceri la aceeași înălțime | 1 s; 3 s; modulul vitezei 10 m/s |
| Balcon | 2 s; maxim 20 m față de sol; 3 s până la sol; 20 m/s la impact |
| Camion și automobil | 20 s; 400 m; 40 m/s |
| Două mobile accelerate | 10 s; 100 m de A; 20 m/s; −10 m/s |
| Întoarcere | 4 s; deplasare 18 m; distanță 30 m |

Problemele de aruncare declară g=10 m/s²; presetul simulatorului folosește g≈9,8 m/s², declarat în interfață. Modelele neglijează rezistența aerului unde aceasta este exclusă în enunț.

Modul Test folosește aceleași bareme numerice. Au fost verificate nota 10 pentru toate răspunsurile corecte, nota 1 pentru toate greșite, creditul parțial împărțit pe cerințele fiecărei probleme, răspunsurile cu minus și virgulă zecimală și respingerea semnului opus când răspunsul nu este nul.

## Dovezi de validare

- `npm run check`: **51/51 teste trecute**.
- Browser RO/EN: repetarea trecerii peste t=6 s produce o singură înregistrare; „m și” / „m and” păstrează spațiul.
- Menținere în repaus la t≥6: mesaj de repaus și accelerație 0.
- Calculator Galilei: v₀=−10, a=−2, Δx=−36 → v≈−15,62 m/s; v=10, a=2, Δx=20 → două viteze inițiale valide, aproximativ ±4,47 m/s, cu durate diferite; v₀=−10, v=−20, Δx=−75 → a=−2 m/s²; duratele negative sunt respinse.
- Emulare touch 390×844 DPR 2: fără depășire orizontală sau erori în consolă. Nu este o verificare pe tabla Android fizică.
- Sursele originale sunt păstrate. `scripts/motion-physics-patches.json` documentează modificările reversibile, iar testul SHA-256 verifică restabilirea exactă a surselor.

Distribuțiile actualizate: `outputs/Praxis-Fizica-local.zip` și arhiva autonomă `dist/simulari/miscarea-rectilinie/miscarea-rectilinie-offline.zip`.
