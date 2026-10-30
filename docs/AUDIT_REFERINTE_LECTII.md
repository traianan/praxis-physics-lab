# Independența lecțiilor față de sursele școlare

Verificare la 29 octombrie 2026, pentru toate cele 11 laboratoare distribuite în catalog, în RO și EN.

`node scripts/audit-lesson-references.mjs` verifică textele HTML și șirurile din scripturile distribuite, inclusiv dicționarele încorporate. Raportul este `docs/lesson-references-audit.json`: 11 lecții, zero trimiteri bibliografice identificate. Au fost verificate separat în browser toate cele 11 lecții, în ambele limbi, inclusiv conținutul ascuns din DOM: zero trimiteri la manual, pagini sau subcapitole.

Referințele rămase erau în Unde mecanice. `scripts/lesson-editorial-adapter.mjs`, aplicat de importator, reformulează notele despre undele pe apă, nodurile de presiune/deplasare, intensitatea undei progresive și modurile tuburilor închise. Păstrează formulele, explicațiile fizice, cele șapte probleme și toate întrebările. Notele se numesc acum „Precizare”, iar cuprinsul este al lecției. Dicționarele RO/EN sunt actualizate împreună cu textele aplicației.

Adaptarea este reversibilă pentru verificarea provenienței. Testul recuperează modulul original și verifică hash-ul original; fișierul din `sources/` rămâne neschimbat. Comportamentele și calculele fizice au trecut cele 20 de teste relevante de unde și localizare.

Termenul „manual” cu sensul de activare de către utilizator (optică), `history.scrollRestoration = 'manual'` și identificatorul intern al unui set de date calorimetrice nu sunt trimiteri bibliografice. Nu sunt eliminate. Paginarea interfeței și trimiterile interne utile către formule, figuri și probleme sunt păstrate.

În Aplicații ale principiului I, introducerea este reorganizată: prezentarea și formula alături, apoi cele patru transformări pe un singur rând pe desktop. Pe tabletă și mobil, grila se rearanjează. Zona goală de sub coloana de introducere este eliminată fără a ascunde conținutul.
