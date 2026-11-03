# Verificarea site-ului și completarea reflexiei

Site: https://praxis-physics-lab.vercel.app/.

Versiunea inițială verificată: commit `a1f86c7`. GitHub raportează status Vercel `success`. Toate cele 73 de fișiere publice modificate în acel commit coincid cu distribuția locală: comparație SHA-256, cu normalizare exclusivă CRLF→LF pentru fișierele text; arhivele sunt comparate binar.

## Start pe site-ul public

Testate în Chrome headless cu profil izolat, pe URL-ul public al Mișcării rectilinii:

- Uniformă, uniform accelerată, uniform încetinită, variată: buton în ecran, progres real al timpului, înghețare la pauză, reluare, Reset la zero.
- Rectilinie, circulară, parabolică, eliptică, curbilinie oarecare: buton în ecran, modificare reală a desenului, imagine constantă la pauză, reluare.
- RO→EN→RO păstrează comenzile. Toate cele nouă probe au trecut.

## Fază și drum echivalent

`L/2` era coordonata mijlocului corzii, nu un drum suplimentar produs de reflexie. Figura precizează acum `x = L/2`, „mijlocul corzii”.

Cele două cazuri sunt afișate în vederea principală, cu evidențierea capătului drept ales:

| Capăt | Coeficient pentru elongație | Salt de fază | Drum echivalent |
|---|---|---|---|
| Fix | R = −1 | π rad | λ/2 |
| Liber | R = +1 | 0 rad | 0λ |

Valorile sunt reprezentanții principali ai claselor modulo 2π, respectiv modulo λ. Relația pentru drumul echivalent se referă la o componentă armonică a undei; impulsul nu parcurge efectiv o distanță suplimentară λ/2.

Probe locale: ambele capete, selectarea cazului, fracție MathML în λ/2, vizibilitate în afara secțiunii pliabile, RO/EN și păstrarea timpului; toate trecute. Test nou de regresie și verificarea numerică existentă a inversării impulsului. Publicarea și reverificarea online sunt consemnate după livrare.

Comenzi reproductibile:

```powershell
node scripts/qa/verify-online-assets.mjs --ref=a1f86c7
node scripts/qa/scientific-math-browser.mjs --base=https://praxis-physics-lab.vercel.app --course=miscarea-rectilinie --motion-controls
node scripts/qa/scientific-math-browser.mjs --base=https://praxis-physics-lab.vercel.app --course=unde-mecanice --string-phase
```
