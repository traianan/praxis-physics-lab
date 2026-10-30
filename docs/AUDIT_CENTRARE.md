# Audit de centrare — 29 octombrie 2026

Au fost verificate toate cele 14 lecții la 2560 × 1200 și 390 × 844. Măsurătorile folosesc lățimea utilă a paginii, astfel încât bara de derulare verticală să nu fie confundată cu o margine asimetrică. Nu au fost găsite deplasări ale containerelor sau depășiri orizontale ale paginii în stările verificate. Nu a fost necesară schimbarea centrării celorlalte lecții; spațiile de lucru intenționat fluide sunt păstrate.

| Lecție | Margini container principal, ecran lat | Mobil: lățime / pagină |
| --- | --- | --- |
| oglinzi-si-lentile | 0 / 0 px | 390 / 390 px |
| miscarea-rectilinie | 433 / 433 px | 390 / 390 px |
| unde-mecanice | 436 / 436 px | 390 / 390 px |
| calcul-vectorial | 433 / 433 px | 390 / 390 px |
| viteza-si-acceleratia | 433 / 433 px | 390 / 390 px |
| miscarea-curbilinie-plana | 569 / 569 px | 390 / 390 px |
| notiuni-termodinamice | 433 / 433 px | 390 / 390 px |
| calorimetrie | 433 / 433 px | 390 / 390 px |
| principiul-i-al-termodinamicii | 433 / 433 px | 390 / 390 px |
| interactii-atomice | 569 / 569 px | 390 / 390 px |
| principiul-i-aplicatii | 576 / 576 px | 390 / 390 px |
| transformari-stare-agregare | 569 / 569 px | 390 / 390 px |
| oscilator-mecanic | 569 / 569 px | 390 / 390 px |
| oscilatori-mecanici-cuplati | 553 / 553 px | 390 / 390 px |

Datele complete sunt în `audit-centering-2026-10-29.json`. Pentru Unde mecanice a fost măsurat suplimentar containerul interior de 1680 px (margini 436/436 px); coloanele individuale nu trebuie centrate separat față de pagină.

## Oscilatorul mecanic

Cele patru exemple sunt dispuse în patru rânduri cu axă centrală comună, la x=430 în coordonatele logice. Etichetele sunt în partea stângă, separat de mișcări. Înălțimea logică a fost redusă de la 320 la 280 px, fără a elimina exemple sau explicații. Mișcările sunt funcții analitice ale timpului; contururile, bilele și clădirea au fost redesenate. Canvas păstrează densitatea ecranului. Selectarea sunetului folosește rândul atins, nu vechile coloane.

Testul de regresie verifică rândurile disjuncte, alinierea pivoților și lungimea constantă a pendulelor la mai multe faze. Sursa externă este păstrată; adaptările sunt în importator și în `scripts/adaptations/oscillator-audit.js`.

Pe mobil, desenul exemplelor folosește o lățime logică adaptată containerului și pune etichetele deasupra mișcărilor din fiecare rând. Cele patru animații sunt vizibile fără derulare orizontală; randarea se păstrează la DPR 2. La revenirea din alt tab, dimensiunile sunt recalculate.
