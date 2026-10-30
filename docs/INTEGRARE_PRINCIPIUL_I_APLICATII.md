# Aplicații ale principiului I al termodinamicii

Integrare în biblioteca Praxis-Fizica la 29 octombrie 2026, în capitolul **Căldură și termodinamică**. Laboratorul de bază „Principiul I al termodinamicii” rămâne disponibil separat.

## Sursă și regenerare

Sursa externă este păstrată în `principiul-i-aplicatii/`. Importatorul `scripts/import-first-law-applications.mjs` generează copia din `public/simulari/principiul-i-aplicatii/`, dicționarele JSON și manifestul SHA-256 `docs/imported-first-law-applications.json`. Nu edita manual fișierele generate: modifică importatorul sau adaptoarele comune.

```text
npm run import:first-law-applications
npm run check
npm run package:local
```

Arhiva individuală este `public/simulari/principiul-i-aplicatii/principiul-i-aplicatii.zip`; se dezarhivează complet, apoi se deschide `index.html`. Pachetul întregii biblioteci este `outputs/Praxis-Fizica-local.zip`. Interfața și formulele nu necesită resurse externe; legăturile din Resurse necesită internet doar dacă sunt accesate.

## Conținut și adaptări

- 11 subiecte în taburi care se rearanjează pe rânduri: introducere, călduri molare, valori experimentale, izocoră, izobară, izotermă, adiabatică, sinteză, politrope, verificare, resurse.
- Nouă demonstrații Canvas, șase rezolvări pas cu pas și toate cele 13 întrebări. Lecția distribuită este independentă de manual: fără trimiteri bibliografice, pagini, numerotarea sursei sau casete de erată. Formulele și rezultatele corecte sunt păstrate.
- Harta lecției are opt carduri cu numere consecutive 1–8 și descrieri vizibile în RO/EN. Folosește o clasă proprie, evitând regula comună care ascundea descrierile din vechiul cuprins. Pe ecrane mici, cardurile se stivuiesc.
- Un singur antet Praxis, revenire în contextul bibliotecii, RO/EN comun, text/afișare, culori comune Praxis/Vii, mod tactil și reglaje −/+.
- Textele lecției, rezolvările, întrebările și răspunsurile sunt în JSON RO/EN, incluse în pagină pentru funcționarea offline. Scorul, răspunsul curent și pașii deschiși se păstrează la schimbarea limbii; parametrii simulărilor se păstrează între taburi.
- Sunetul importat respectă comutatorul global, implicit oprit. Mutingul taie ieșirea audio, navigarea oprește sunetul continuu, iar ascunderea paginii oprește sunetul și avansarea simulărilor.

## Corecții ale implementării externe

- Dimensiunile logice Canvas sunt păstrate separat de rezoluția fizică, inclusiv la treceri repetate între valori DPR.
- Adiabata cu V_final = V_inițial folosește un număr fix de eșantioane. Sursa avea în acest caz un pas de integrare nul și putea bloca pagina la resetare.
- Calculatorul politropelor folosește consecvent gazul biatomic: C_V = 5R/2, C_p = 7R/2 și γ = 1,4. La n = 0 rezultă C_p; la n = γ rezultă zero; la n = −1 rezultă 3R; limita izocoră este C_V.
- Primul pas al problemei cu pistonul include factorul R în expresia înălțimii, în acord cu ecuația de stare și cu pașii următori.
- Rezolvările se deschid prin butoane accesibile din tastatură, cu aria-expanded. Formulele și graficele sunt adaptate pentru suprafețe deschise.

## Verificare

`test/first-law-applications.test.mjs` verifică proveniența, conținutul bilingv, bilanțurile fizice prin calcule independente, valorile extreme, cazul degenerat al adiabatei, schimbările DPR, izolarea animațiilor și invarianții politropelor.

Verificare efectivă în Chromium: toate cele 11 taburi la 768 px și 390 px, DPR 2, un singur subiect vizibil, fără depășire orizontală; quiz complet 13/13; schimbare RO/EN după răspuns; păstrarea parametrilor și pașilor de rezolvare; paleta comună Vii; modul tactil; sunet activ/inactiv; fără resurse externe și fără erori sau avertismente de consolă.

Distribuția autonomă a fost deschisă efectiv prin `file:///`, cu schimbare în EN și resetarea adiabatei: funcțională, fără cereri HTTP și fără erori de consolă. Arhivele individuală și completă au fost generate cu succes. Suita generală: **104 teste trecute din 105**; cele patru teste noi trec. Sintaxa tuturor scripturilor noi a fost verificată separat.

La auditul inițial, verificarea generală a proiectului a semnalat și lipsa sursei `interactii-atomice/js/app.js`, necesară testului de proveniență al laboratorului anterior. Copia publicată a acelui laborator există. Pachetul local include distribuția acestuia, fără a cere folderul sursă absent.

Actualizare 29 octombrie 2026: sursa atomică a fost restaurată din arhiva furnizată; suita completă trece 109/109. Verificarea actuală a lecției și a lizibilității: [VERIFICARE_PRINCIPIUL_I_APLICATII.md](VERIFICARE_PRINCIPIUL_I_APLICATII.md).
