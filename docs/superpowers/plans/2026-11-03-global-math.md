# Extinderea prezentării matematice în aplicație

**Goal:** regulile aprobate în Unde mecanice se aplică proporțional tuturor celor 19 laboratoare.

**Architecture:** motorul verificat al undelor este reutilizat în antetul comun, cu MathML local. KaTeX, fracțiile CSS și indicii corecți existenți sunt păstrați. Gazdele native sunt marcate/îmbunătățite conservator; React folosește componente proprii. Nu se modifică structura DOM gestionată de React.

**Spec:** solicitarea utilizatorului din 3 noiembrie; `docs/REGULI_LABORATOARE.md`.

- [x] Inventar 19 laboratoare și trei audituri independente: mecanică, termodinamică, oscilații/atomic/optică.
- [x] API comun `PraxisMath`: plain/TeX, fracții, indici, proză, localizare, gazde native și compatibilitate React.
- [x] Corecții fizice confirmate și integrare țintită în surse/importatoare; păstrarea sistemelor sănătoase.
- [x] Verificare browser pe toate laboratoarele: 119 selecții de secțiune, 114 stări RO/EN, 100/200%, desktop, telefon și 4K; opt probe de slidere. Limitele acoperirii sunt în raport.
- [x] Regenerare 18 arhive autonome, sincronizare optică, build, 305 teste aplicație + 59 optică, raport cu limite reale.

Constrângeri: fără publicare; fără micșorarea textului pentru încadrare; păstrarea comenzilor, identificatorilor, parametrilor și timpului. Nu se confundă un underscore din sursă cu o eroare vizuală și nu se modifică semnele modelului optic corect.
