# Verificare RO/EN — cele patru laboratoare

27 octombrie 2026. Verificare locală, fără publicare.

## Corecții

- Calcul vectorial: fragmentele de explicații separate de formulele KaTeX (scalar negativ și forța electrică pentru sarcină negativă); explicațiile răspunsurilor despre rezultanta vectorilor perpendiculari și componenta greutății pe planul înclinat.
- Unde mecanice: explicațiile actualizate la auditul fizic despre particulele din apa de suprafață și identitatea undei staționare. Traducerea se aplică și fragmentelor separate de indici/exponenți. În RO, comenzile Play/Reset și etichetele ON/OFF folosesc acum formulări românești; modificările sunt păstrate în `scripts/waves-locale-overrides.json`.
- Optică: butonul «Despre modelul fizic», inclusiv varianta cu săgeată și fragmentul de text separat de aceasta. Distribuția include versiunea actuală a motorului comun de traducere.
- Mișcarea rectilinie: butonul «Ascunde» din afișarea rezolvării.

## Verificare

Cataloage JSON separate: 44 de namespace-uri, fiecare cu RO/EN. Sunt verificate automat paritatea cheilor, parametrii mesajelor, păstrarea formulelor LaTeX și funcționarea traducerilor integrate fără fetch. Modificările cataloagelor generate sunt salvate în sursele de traducere, astfel încât reimportarea laboratoarelor să nu le piardă.

Auditul problemelor folosește acum banca distribuită completă, cu toate cele 20 de probleme, inclusiv cele adăugate și corecțiile fizice. Au fost verificate 976 de ieșiri generate (titluri, enunțuri, date, cerințe, răspunsuri, pași și figuri, după disponibilitatea fiecărui model), cu câte opt seturi de valori per problemă. Scannerul nu a găsit fragmente românești în textele englezești rezultate.

Verificări în Chromium pe distribuția locală: texte din DOM inclusiv panouri ascunse, enunțuri și rezolvări pentru toate cele 20 de probleme de mișcare; toate cele patru opțiuni la cele opt întrebări de Calcul vectorial; cele patru opțiuni la cele 20 de întrebări din Unde mecanice și mesajele la verificarea fără răspuns; 25 de combinații de tip optic și poziție prestabilită, plus ferestrele de explicații și parametri. Au fost verificate și comutările RO→EN→RO în fișierele autonome.

55 de teste automate trec, inclusiv patru teste noi de acoperire a traducerilor. Aceste verificări reduc riscul de lipsuri; nu reprezintă o evaluare lingvistică independentă a fiecărei formulări.

## Distribuție

Arhivele autonome ale celor trei lecții importate au fost regenerate; laboratorul de optică este un HTML autonom în distribuția bibliotecii. `outputs/Praxis-Fizica-local.zip` include sursele aplicației, distribuția actuală, documentația și scripturile de pornire. Nicio publicare pe GitHub/Vercel.
