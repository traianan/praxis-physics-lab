# Sunete comune bibliotecii și laboratoarelor

Implementarea este în `public/shared/sound.js`, fără biblioteci, fișiere audio externe sau cereri de rețea. API-ul browserului Web Audio sintetizează feedbackul; contextul audio este creat numai la o acțiune care cere sunet, cu sunetul activ. Setarea inițială este **inactiv** și se păstrează în `localStorage` sub cheia `praxis-sound-enabled`.

Comutatorul cu difuzor există în interfața normală, în Mod tablă și în copia integrată a laboratorului de optică. Dezactivarea oprește inclusiv tonurile continue și blochează redarea următoare. La părăsirea paginii sau trecerea în fundal se opresc tonurile active. Schimbările setării sunt propagate între file de aceeași origine.

## Utilizare în viitoare simulări

Încarcă `shared/sound.js` înaintea aplicației, apoi folosește:

```js
// Sunete scurte pentru o acțiune sau un eveniment fizic explicit:
PraxisSound.play('switch'); // comutarea unui întrerupător
PraxisSound.play('event');  // un eveniment discret

// Pentru un viitor oscilator/undă sonoră:
const stop = PraxisSound.startTone({ frequency: 440, type: 'sine', gain: 0.05 });
// La oprirea sursei sau închiderea simulării:
stop();
```

Tipurile scurte sunt `click`, `select`, `switch`, `event`, `move`, `reset`. Comutatoarele și alegerile de interfață au feedback discret automat. `data-sound="switch"` pe un buton poate selecta un tip explicit. Pentru acțiuni cu sunet fizic propriu, `data-sound="none"` elimină feedbackul automat al butonului, evitând dublarea; integrarea exactă se stabilește odată cu simularea. În optică sunetele sunt doar feedback de interacțiune, nu sunete atribuite luminii.

`startTone` returnează o funcție de oprire chiar și când sunetul este inactiv sau browserul nu suportă Web Audio. Frecvența este limitată la 20–20000 Hz, câștigul la 0–0,12. Nu există pornire automată a unui ton continuu după reactivarea sunetului: simularea trebuie să solicite din nou pornirea la gestul utilizatorului. O viitoare implementare va sincroniza frecvența și durata cu fenomenul modelat.

Nu sunt cerute acces la microfon, permisiuni de înregistrare sau instalări. Restricțiile de autoplay ale browserului se respectă; prima activare/redare trebuie făcută printr-un gest al utilizatorului.

Decizie: controlul de volum se implementează odată cu primul laborator care utilizează efectiv sunetul ca fenomen fizic. În interfața actuală rămâne doar Sunet activ/inactiv.
