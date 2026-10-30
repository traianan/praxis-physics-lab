# Fierberea: două protocoale coerente

29 octombrie 2026. Analiza a identificat o descriere a încălzirii într-un vas, un buton pentru seringă și un impuls artificial de presiune de 3,2 s, fără o descriere a seringii. Mini-graficul nu avea o scară de timp explicită. Aceste elemente au fost înlocuite cu două experimente distincte și un grafic temperatură–timp comun, în cadrul aceleiași demonstrații.

## Încălzire

Vas cu 100 g apă într-o incintă cu presiune impusă. Utilizatorul alege presiunea și puterea (0–800 W), apoi pornește sau pune în pauză încălzirea. Bilanțul include căldura primită și pierderile spre mediu. După atingerea temperaturii de fierbere, energia disponibilă vaporizează apa. Temperatura de saturație este calculată cu o pereche continuă presiune/temperatură, calibrată la 100 °C / 760 torr. Căldura latentă variază aproximativ cu temperatura și este 2,26 MJ/kg la 100 °C, în acord cu celelalte părți ale lecției.

## Seringă

Protocolul vizibil descrie pregătirea, închiderea orificiului, tragerea pistonului, menținerea poziției și împingerea înapoi. Reprezentarea arată o seringă fără arzător. Comenzile pentru încălzire sunt ascunse; presiunea este calculată din starea gazului, nu impusă de un cursor.

Model: 5 mL apă la 25 °C; spațiu gazos inițial 0,2 mL, mărit la 20 mL. Aerul rezidual și vaporii sunt gaze ideale la temperatura apei. Expansiunea scade inițial presiunea, iar vaporii nou formați o cresc ulterior. Vaporizarea consumă căldură latentă și răcește puțin apa. Fierberea temporară se oprește când condițiile nu mai permit creșterea bulelor. Împingerea pistonului comprimă gazul și determină condensarea unei părți din vapori.

Se conservă masa totală de apă (lichid și vapori); schimbul de căldură latentă modifică temperatura lichidului. Sunt neglijate lucrul mecanic al pistonului, energia termică a gazului și schimbul de căldură cu pereții. Acesta este un model orientativ, nu o predicție experimentală calibrată. Răcirea mică este vizibilă printr-o scară verticală detaliată și este declarată ca valoare calculată.

Descrierea procedurii și interpretarea calitativă au fost confruntate cu [Science in School / CERN](https://scienceinschool.web.cern.ch/article/2019/rocket-science-made-easy/) și [IAA-CSIC, Boiling water on Mars](https://marsinabox.iaa.csic.es/experiments/boiling-water-on-mars/). Parametrii și aproximațiile modelului sunt ale aplicației.

## Grafic și stare

Graficul are axe cu unități, timp fizic simulat și istoric al temperaturii. Pentru încălzire, pragul de fierbere este o curbă de referință distinctă, care urmărește istoricul presiunii. Pentru seringă, scara verticală este adaptată variației mici. Acțiunile pistonului sunt marcate prin linii verticale și enumerate cu momentul lor. Încălzirea rulează de patru ori mai repede, seringa la timp simulat 1:1.

Pauza și navigarea către altă temă nu avansează modelul. Resetarea păstrează tipul experimentului și sincronizează parametrii cu cursoarele. Schimbarea RO/EN păstrează starea și istoricul. Instrucțiunile, desenul, butoanele, etichetele și unitățile provin din aceleași protocoale.

## Verificare

Trei teste suplimentare verifică relația presiune–volum la tragere, conservarea masei și schimbul de căldură latentă, creșterea presiunii din vaporizare, oprirea fierberii și împingerea pistonului, platoul la încălzire, efectul presiunii, pauza, resetarea și izolarea ceasului pe temele ascunse.

Verificare efectivă Chromium: comenzile ambelor protocoale, resetarea parametrilor modificați, pauza, presiunea și temperatura afișate, patru pași ai procedurii, evenimentele pe grafic, păstrarea stării la RO/EN, lipsa erorilor de consolă. Geometria textelor din desen și grafic a fost verificată în 16 combinații de protocol, limbă și moment, fără suprapuneri detectate. Verificare pe mobil 390 px, text 100%/200%, fără depășire orizontală a paginii și fără erori de formule.
