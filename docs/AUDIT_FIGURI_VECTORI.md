# Auditul figurilor din Calcul vectorial și convenția de oprire

Data: 27 octombrie 2026. Modificări locale în Praxis-Fizica, fără publicare online.

## Acoperire

Au fost verificate toate cele 11 figuri: relația dintre parametri, rezultate numerice și geometria efectiv trimisă la desenare. Testele execută codul generat al figurilor și clasele reale de proiecție/încadrare; înregistrează vectorii desenați și îi compară cu rezultate independente. Valorile intermediare ale animațiilor reprezintă etape de construcție; comparațiile numerice finale se fac la construcția completă.

| Figură | Verificări și corecții |
|---|---|
| 1. Elementele vectorului | A și B, diferențele de coordonate, modul, unghi, translație și opus. Pentru A=B, modulul este 0, iar unghiul este nedefinit. Încadrare pentru vector și copia translatată/rotită. |
| 2. Componente și versori | Componente cu semn, norma, unghi în toate cadranele, versor. Pentru vectorul nul nu se raportează un unghi definit. |
| 3. Adunare | Ambele construcții, rezultanta din componente, cazul antiparalel și rezultanta nulă. Unghiul cu un factor nul este nedefinit. Protecție la eroarea de rotunjire în radicalul legii cosinusului. |
| 4. Poligon | Fiecare săgeată este translatată cap–coadă fără schimbarea vectorului; rezultanta este suma. Adăugare, eliminare și închidere; verificare de echilibru. |
| 5. Scădere | Ambele metode dau a−b; se verifică și sensul vectorului de la vârful lui b la vârful lui a. Unghiul cu vectorul nul este nedefinit. |
| 6. Scalar | k negativ, nul și pozitiv; modulul se multiplică prin |k|, iar sensul se inversează numai pentru k negativ și a nenul. Pentru a=0, rezultatul este nul pentru orice k. |
| 7. Plan înclinat | Masa și unghiul, G=mg, Gt=mg sinα, Gn=mg cosα, N=|Gn|. Aceeași scară, independentă de masă; suma componentelor reproduce G. Corecția din etapa precedentă este păstrată. |
| 8. Produs scalar | Semnul produsului, proiecție pozitivă/negativă/nulă, unghi drept. Proiecția pe vectorul nul și unghiul cu un vector nul sunt nedefinite. Construcția falsă a proiecției pe vectorul nul este omisă. Mini-graficul arată limite numerice ±|a||b|, iar pentru un factor nul este plat și nu marchează un unghi fictiv. |
| 9. Produs vectorial | a, b și θ, inclusiv 0° și 180°; normă/arie și orientare. Schimbările rapide de ordine puteau încheia animația cu sensul/lungimea greșite: ținta este acum ordinea efectiv selectată. Vectorul produsului rămâne la scara 1:2 declarată în antet. |
| 10. Produs mixt | Unghiuri pozitive și negative, variația azimutului, coplanaritate; determinantul are semn, iar volumul este valoarea absolută. Verificare V=S·h și încadrare în timpul rotației. |
| 11. Calculator | Toate componentele a, b, c și scalarul k; sumă, diferență, scalar, versor, unghi, proiecție, produs scalar/vectorial/mixt și identitatea dublului produs vectorial. A fost adăugat vectorul k·a cu buton de afișare, pentru ca modificarea lui k să fie vizibilă și în scenă. c se vede când este activat butonul său. |

## Încadrarea desenelor

În figurile 2D, rezultantele și vectorii derivați puteau ieși din canvas, deși vectorii de intrare erau în interior. Încadrarea păstrează scara inițială cât timp este suficientă; dacă este necesar, o micșorează folosind toate punctele relevante. Grila și etichetele sale se redau la aceeași scară actualizată. Figura 7 păstrează mecanismul separat, cu scară independentă de masa curentă.

În 3D, încadrarea ține cont de proiecția perspectivei și de dimensiunea efectivă a canvasului. Pentru figurile 9 și 10, anvelopa acoperă întregul interval al parametrilor, pentru ca mărirea unui parametru să nu fie mascată de o renormalizare a vectorilor. Figura 11 păstrează scara automată declarată; vectorul k·a participă la calculul ei. Paralelogramul nu depășește încadrarea când este ascunsă săgeata sumei.

## Formula de oprire

Cardul MRUV afișează acum:

`t_opr = −v₀/a`, `d_opr = −v₀²/(2a)`.

A fost eliminat modulul accelerației din fracția afișată. Nota RO/EN precizează convenția: formula distanței în această formă se aplică pentru v₀>0 și a<0. În cazul general cu v₀·a<0, expresia −v₀²/(2a) reprezintă deplasarea cu semn până la oprire; distanța efectiv parcursă este pozitivă. Calculele distanței din simulator păstrează acest comportament corect și pentru mișcarea inițială în sens negativ.

Exemple: v₀=12 m/s, a=−2 m/s² → t=6 s, d=36 m; v₀=20 m/s, a=−4 m/s² → t=5 s, d=50 m. La inversarea axei, v₀=−12 m/s și a=+2 m/s² → t=6 s, deplasare −36 m, distanță 36 m.

## Validare

- `npm run check`: **42/42 teste trecute**.
- Figurile 1–11: teste ale codului efectiv, inclusiv tragerea punctelor, extremele cursorilor, valori nule, orientări și animația de schimbare a ordinii întreruptă.
- În browser: 24 de combinații min/mediu/max pentru toate sliderele figurilor 6, 7, 9 și 10; coordonate finite și valori fără NaN/Infinity. Figurile 1–6 și 8 au fost verificate prin schimbarea coordonatelor punctelor; calculatorul a fost verificat prin câmpurile numerice.
- Încadrare numerică la lățimi de canvas 306 și 800 px; verificare vizuală desktop și emulare touch 390×844, DPR 2, fără depășire orizontală.
- RO/EN: noile explicații sunt în fișierele JSON ale cursurilor și sunt incluse în versiunile autonome.
- Sursele originale rămân nemodificate în `sources/`. Patch-urile reversibile sunt în `scripts/vector-physics-patches.json` și `scripts/motion-behavior-patches.json`; testele restaurează și verifică hash-urile originale.

## Distribuție

Au fost actualizate arhiva bibliotecii `outputs/Praxis-Fizica-local.zip` și arhivele autonome `dist/simulari/calcul-vectorial/calcul-vectorial.zip`, respectiv `dist/simulari/miscarea-rectilinie/miscarea-rectilinie-offline.zip`.
