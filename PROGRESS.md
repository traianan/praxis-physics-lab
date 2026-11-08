# PROGRESS

- 2026-11-08: Integrată lecția „Legile lui Ohm” în catalogul de Electricitate. Conținutul este organizat în șapte taburi; se afișează doar panoul activ, iar evaluarea grupează problemele și verificarea.
- Micșorate scenele Canvas pentru laborator, circuit și măsurări. Simbolul rezistorului este acum dreptunghiular și alungit în schemele lecției și în miniatura din bibliotecă.
- Eliminată numerotarea de secțiune și referințele vizibile la clasă/capitole; traducerea engleză a fost verificată pe toate taburile.
- Verificare: `npm run import:ohm` și `npm run build` au reușit; navigarea taburilor și înălțimile Canvas au fost verificate în browser. `npm run typecheck` nu a putut rula deoarece dependența `tsc` lipsește din proiectul lecției.
- Detectorul Impeccable a semnalat patru accente laterale. Au fost înlocuite cu nuanțe și contururi uniforme, păstrând diferențierea semantică U–I; scanarea finală a celor trei foi CSS a fost curată.
- Distribuție: Web; lecția nu are deocamdată arhivă offline.

- 2026-11-08: Ajustată lecția Legile lui Ohm după feedback vizual: reparat selectorul CSS care elimina spațierea conținutului problemelor, indici fizici formatați corect, eliminată nota despre manual, sursa desenată cu borne apropiate și etichete E/r. Diagrama explică electronii și sensul opus curentului convențional; săgeata de lângă sursă a fost eliminată. Verificare: `npm run import:ohm` și `npm run build` au reușit.
- Impeccable: accentul lateral al observațiilor a fost redus la o linie neutră de 1px; semnalările laterale din globals.css și lab.css au fost suprimate per fișier ca false positive, după inspecția regulilor cu contururi uniforme.
