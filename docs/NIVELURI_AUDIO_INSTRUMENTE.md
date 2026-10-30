# Calibrarea celor patru instrumente

27 octombrie 2026. Chitară, castron tibetan, tobă și xilofon. Distribuție exclusiv locală/offline, fără publicare.

## Rezultat măsurat

Semnalul din presetările inițiale, înaintea volumului general al utilizatorului, în Chromium OfflineAudioContext la 48 kHz:

| Instrument | RMS inițial, prima secundă | RMS calibrat | Vârf calibrat |
|---|---:|---:|---:|
| Chitară | 0,21694 | 0,32241 | 0,83612 |
| Castron tibetan | 0,17741 | 0,39206 | 0,81874 |
| Tobă | 0,16853 | 0,47521 | 0,83438 |
| Xilofon | 0,17595 | 0,31261 | 0,81349 |

Diferența dintre extremele RMS de referință este 3,638 dB. Toba are aproximativ 2,82 ori nivelul RMS din versiunea precedentă (+9,00 dB); nu este doar o creștere a vârfului. Vârful inițial al xilofonului era 1,399, peste full scale = 1; noul traseu reduce vârfurile fără tăiere dură a eșantioanelor.

Nivelul perceput nu este identic cu RMS: instrumentele au spectre și durate diferite. Acestea sunt măsurători digitale comparative, nu LUFS și nici o calibrare a presiunii sonore în clasă. Redarea finală depinde și de difuzoarele tablei/tabletei. În special frecvențele joase ale tobei pot suna diferit pe dispozitive diferite. Reglajul de volum al utilizatorului este păstrat, inclusiv valoarea memorată.

## Traseul audio

`public/shared/waves-audio.js` expune `instrumentOutput(context, id, source)`. Fiecare instrument are un profil fix: guitar 1,6; bowl 1,2; drum 3,2; xylophone 1,35. Urmează controlul dinamic al crestei (threshold −18 dB, knee 12 dB, ratio 4, attack 3 ms, release 180 ms), gain de compensare 1,8, controlul vârfurilor (threshold −3 dB, ratio 20, attack 0, release 60 ms), apoi gain 0,85 pentru marjă.

Sunt utilizate nodurile native DynamicsCompressorNode cu look-ahead. Nu se folosesc hard clipping sau WaveShaper și nu se schimbă frecvențele proprii ori modelul modal al instrumentelor. Compresia reduce diferența dintre atac și corpul sunetului; este o prelucrare a dinamicii, nu o afirmație că forma de undă rămâne identică.

La o nouă lovire/ciupire se estompează scurt vocea precedentă din context, în loc să se adune necontrolat mai multe loviri. Traseul de procesare este reutilizat pe instrument/context. La castron, vechea buclă a analizorului este anulată înainte de o nouă lovire.

Sunetul calibrat se ramifică spre ieșirea live și, când este cerută înregistrarea, spre recorder. Numai ramura live trece prin volumul general și Sunet activ/inactiv. Înregistrarea rămâne posibilă și cu ieșirea live oprită, conform comportamentului anterior, dar preia acum același timbru/nivel calibrat. Încărcarea paginii nu pornește sunetul și nu schimbă preferințele de volum.

## Verificare

- Randări reprezentative deterministe ale celor patru instrumente, cu procesarea efectivă din producție; generatorul de chitară folosește un seed fix, iar castronul are detuning zero pentru reproductibilitate. Parametrii oscilațiilor și anvelopelor corespund surselor păstrate.
- 16 cazuri suplimentare: frecvențe joase/înalte, amortizare și poziție la chitară, materiale/forțe diferite la castron, lovire centrală/periferică și mod nul la tobă, extremele xilofonului și patru loviri apropiate pentru fiecare instrument. Testul cu loviri apropiate însumează deliberat semnale înaintea procesării, mai sever decât estomparea vocilor aplicată în interfață. Vârful maxim măsurat: 0,87468; eșantioane finite, sub limita de test 0,98.
- Testele execută componentele distribuite pentru sinteza de bază și verifică integrarea fiecărui profil, limitatoarele, ramura de înregistrare, mute, master volume și estomparea/reutilizarea la relovire.
- Butoanele reale ale celor patru instrumente au fost acționate în browser, cu Sunet inactiv păstrat; toate au traversat profilul corespunzător, fără erori JavaScript.

Raportul numeric complet: `docs/instrument-audio-levels.json`. Metrul browser: `scripts/audit-instrument-levels.browser.js`, încărcat după runtime-ul audio comun; `PraxisInstrumentAudit.run()` reface randările fără a trimite sunet la difuzoare. Toate resursele necesare aplicației și înregistrărilor sintetice funcționează local/offline.

Referințe tehnice pentru nodurile folosite: [MDN — DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode), [Web Audio — procesarea și look-ahead](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode).

Validare finală: 63/63 teste automate trecute. Verificare în pachetul autonom prin file://: profilul tobei este apelat de butonul real, gain-urile sunt incluse local, fără erori JavaScript.
