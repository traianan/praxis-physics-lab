# Curățarea proiectului — 6 noiembrie 2026

Au fost eliminate 3.681 de fișiere temporare sau redundante din `outputs/`, însumând 268.067.686 de octeți (aproximativ 256 MiB).

Elementele eliminate:

- profilul temporar de browser `mcu-common-scale-browser`, fără procese active asociate;
- pachetele GSAP și Three extrase și arhivele lor de descărcare, păstrând resursele runtime din `public/vendor`;
- directorul intermediar `offline-lessons`: toate cele 435 de fișiere au fost comparate cu conținutul celor 22 de arhive publice păstrate;
- vechiul pachet local, care nu includea noul manifest;
- 189 de copii Base64 identice cu imaginile păstrate;
- loguri vechi și scripturi auxiliare identice cu variantele din `scripts/`.

Au fost păstrate sursele originale, importatoarele, testele, traducerile și fișierele de intrare folosite de scripturi, inclusiv cele aflate în `outputs/`. Au fost păstrate distribuțiile `public/` și `dist/`, arhivele offline publice și documentele de proveniență. Nu au fost șterse fișiere urmărite de Git. Politica de păstrare a datelor aplicației nu a fost modificată.

Lista exactă a elementelor eliminate este în `outputs/cleanup-result-2026-11-06.json`. Fișierele intermediare ale curățării au fost eliminate după finalizare.

## Regenerare și verificare

- `npm run build`: reușit.
- Suita locală: 424 de teste trecute, zero eșecuri; log în `outputs/cleanup-validation-tests.log`.
- `scripts/package-local.mjs`: verificare de sintaxă și generare reușite. Lista de împachetare include acum manifestul, lockfile-ul și directoarele de sursă lipsă. Arhiva generată a fost verificată (2.196 de intrări), apoi eliminată ca artefact de verificare.
- `git diff --check`: reușit.

Pachetul local se poate recrea la nevoie cu `npm run package:local`. Directorul intermediar pentru lecțiile offline se recreează cu `npm run offline:courses`, înaintea verificărilor care îl folosesc explicit. Nu se recomandă ștergerea integrală a `outputs/`, deoarece conține și intrări utile pentru instrumentele proiectului.

## După auditul de accesibilitate — 7 noiembrie

Exporturile regenerate au fost verificate din nou: 434 de fișiere intermediare,
37.284.810 octeți, identice binar cu intrările din cele 22 de arhive păstrate.
Directorul `outputs/offline-lessons` și trei scripturi auxiliare folosite numai
pentru migrare/diagnostic au fost eliminate. Rapoartele auditului și verificărilor
au fost păstrate. Dovada comparației este în
`outputs/offline-staging-verification.json`.
