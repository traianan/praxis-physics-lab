# Surse și proveniență

Snapshoturile de import sunt centralizate în `sources/<id>/`. Importatoarele din
`scripts/import-*.mjs` citesc aceste directoare și scriu distribuția din
`public/simulari/`; rapoartele `docs/imported-*.json` indică sursa curentă.

La 7 noiembrie 2026 au fost mutate 123 de fișiere din 13 locații ale rădăcinii.
Inventarul `source-migration-2026-11-07.json` păstrează calea veche, calea nouă,
dimensiunea și SHA-256 pentru fiecare fișier. Mutarea a păstrat conținutul binar
integral, inclusiv arhiva originală a lecției Interacții atomice, aflată acum în
`sources/interactii-atomice/provenance/`. Referințele vechi din rapoartele istorice
se rezolvă prin acest inventar; rapoartele nu au fost rescrise retroactiv.

Sursele anterior urmărite de Git sunt exceptate explicit de la regula de ignorare
în `.gitignore`. Cele opt directoare de snapshot existente anterior în `sources/`
își păstrează statutul local. Nu s-a introdus publicarea lor sau schimbarea licenței.
Pachetul local include întregul director `sources/`.

`.gitattributes` dezactivează conversia automată LF/CRLF pentru snapshoturile din
`sources/`. Astfel, și bloburile publicate în Git păstrează hashurile originale,
indiferent de platformă. Comparațiile de cod cu distribuția generată permit doar
diferența de terminator de linie; verificările SHA-256 ale originalelor rămân stricte.
Verificările pentru snapshoturile locale ignorate sunt separate în suita locală;
testele funcționale ale acelorași laboratoare rulează și în CI.

Validare la 7 noiembrie: toate cele 123 de hashuri SHA-256 coincid cu inventarul,
vechile căi au fost eliminate prin mutare, iar niciuna dintre noile căi nu este
ignorată de Git. Au fost executate cele 12 importatoare afectate și regenerate
cele 22 de arhive autonome și build-ul aplicației.

Optica are în continuare sursa autoritativă în proiectul separat `Optica-Lab`.
Modulele native și conținutul editorial autoritativ rămân în `public/` și
`scripts/`, conform importatorului fiecărui laborator.

Pentru modificări, folosește sursa autoritativă sau adaptorul, rulează importatorul
corespunzător, apoi exporturile offline, build-ul și testele. Hashurile inventarului
de migrare reprezintă momentul mutării; modificările ulterioare intenționate trebuie
documentate, nu mascate prin actualizarea inventarului istoric.
