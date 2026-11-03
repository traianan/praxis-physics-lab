# Corecțiile matematice ale opticii

Proiectul local `D:/ProiecteAI/Optica-Lab` nu are un remote Git configurat. Distribuția sa integrată este publicată în repository-ul Praxis, în `public/simulari/oglinzi-si-lentile/index.html`.

Pentru a păstra pe GitHub și modificările autoritative, `scripts/adaptations/optics-math-presentation.patch` include modificările din `dist/app.js`, `dist/presentation.css` și testul nou `test/math-presentation.test.js` al proiectului Optica-Lab. Patch-ul este raportat la commitul-sursă `cbcc45d`.

Pe o copie nemodificată a acelui proiect se aplică, din rădăcina Optica-Lab:

```powershell
git apply --check D:/ProiecteAI/Praxis-Fizica/scripts/adaptations/optics-math-presentation.patch
git apply D:/ProiecteAI/Praxis-Fizica/scripts/adaptations/optics-math-presentation.patch
npm run check
```

Pe copia locală curentă corecțiile sunt deja aplicate. Verificarea inversă `git apply --reverse --check` confirmă corespondența patch-ului cu cele trei fișiere. Sursa a trecut toate cele 59 de teste. Sincronizarea în Praxis se face în continuare cu `npm run sync:optics`.
