# Lansarea impulsului din capătul stâng

Regresie semnalată: impulsul exista deja la L/4 la t=0, inclusiv după resetare. Aceasta era condiția inițială a modelului anterior; nu era o lansare din capăt.

## Modelul corectat

Coarda este inițial dreaptă și în repaus. O sursă la x=0 prescrie un singur impuls de deplasare, apoi revine în repaus și menține capătul stâng fix. În activitatea de reflexie, desenul reprezintă această sursă mobilă; în activitatea de unde staționare capătul stâng rămâne fix permanent.

Pentru w=0,12L, funcția cauzală g(s) este A·sin²(πs/w) pentru 0<s<w și zero în rest. Condiția la sursă este y(0,t)=g(vt). După t=w/v aceasta devine y(0,t)=0.

Soluția analitică însumează undele întârziate și reflexiile lor. Pentru R=−1 la capăt fix și R=+1 la capăt liber, σ=−R:

- unda spre dreapta: suma σⁿ g(vt−x−2nL), n≥0;
- unda spre stânga: suma Rσⁿ g(vt+x−2(n+1)L), n≥0.

La stânga, imaginile întârziate se anulează în perechi, lăsând numai deplasarea sursei în timpul emisiei. La dreapta, soluția satisface exact y(L,t)=0, respectiv ∂y/∂x(L,t)=0. Viteza rămâne √(Tₘ/μ); spectrele undelor staționare sunt păstrate.

Primul front ajunge la dreapta la L/v. Vârful impulsului ajunge la 1,06L/v, deoarece sursa atinge amplitudinea maximă după 0,06L/v. De aceea probele de reflexie verifică acum acest moment, nu vechea valoare 0,75L/v.

## Verificare

- Coardă dreaptă la t=0 pe întregul domeniu, inclusiv după resetare și schimbarea parametrilor.
- Creasta este generată la x=0; perturbația este nulă înaintea frontului cauzal.
- Inversare la capăt fix și amplitudine 2A a deplasării capătului liber la prima întâlnire.
- Condițiile de frontieră pentru întregul interval de patru traversări.
- Energie constantă după emisie, confruntată independent cu E=TₘA²π²/(2w); integrarea numerică de verificare are abatere relativă sub 0,3%, inclusiv în timpul reflexiilor. Modelul efectiv este analitic.
- 20 verificări în Chrome pentru cele două capete: Reset, sursă, progres, lipsa perturbației înaintea frontului, reflexie, resetare de la patru traversări, Start/Pauză și RO/EN.
- 310/310 teste complete trecute; build și pachetul autonom Unde mecanice regenerate.

Reproducere: `node scripts/qa/scientific-math-browser.mjs --course=unde-mecanice --string-launch --string-phase`. Pentru verificarea publicată se adaugă `--base=https://praxis-physics-lab.vercel.app`.
