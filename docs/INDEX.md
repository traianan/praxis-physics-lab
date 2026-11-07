# Documentația Praxis · Fizică

## Ghiduri active

- [Reguli pentru laboratoare](REGULI_LABORATOARE.md) — deciziile comune de integrare și verificare.
- [Registrul laboratoarelor](REGISTRU_LABORATOARE.md) — manifestul și fișierele generate.
- [Surse și proveniență](SURSE.md) — locațiile autoritative și migrarea snapshoturilor.
- [Localizare](LOCALIZARE.md) — mecanismul RO/EN și exporturile autonome.
- [Catalogul de conținut](CATALOG_CONTINUT.md) — marcaje și componente comune.
- [Sistemul vizual](../DESIGN_SYSTEM.md).
- [Pornire și comenzi](../README.md).

## Audit și urmărirea remedierilor

- [Audit general, 6 noiembrie 2026](AUDIT_GENERAL_2026-11-06.md) — constatări istorice, nu instrucțiuni de produs.
- [Remedieri și verificări](IMBUNATATIRI_AUDIT_2026-11-06.md).
- [Accesibilitate, 7 noiembrie 2026](ACCESIBILITATE_2026-11-07.md) — acoperire, remedieri și limitele verificărilor.
- [Curățarea fișierelor temporare și redundante](CURATARE_PROIECT_2026-11-06.md).

## Rapoarte istorice și proveniență

Fișierele `VERIFICARE_*`, `INTEGRARE_*`, `AUDIT_*` și rapoartele cu dată descriu
starea verificată la momentul respectiv. Numerele de teste și dimensiunile din ele
nu reprezintă automat starea actuală. Pentru aceasta, rulează `npm run build` și
`npm run check`.

Fișierele `imported-*.json`, `offline-courses.json` și snapshoturile documentează
proveniența și distribuțiile generate. Actualizează-le prin importatoarele și
scripturile de împachetare, fără a rescrie manual hashurile.
