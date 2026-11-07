# Registrul laboratoarelor

Sursa autoritativă este `labs.manifest.json`. Conține capitolele și, pentru fiecare
laborator, metadatele catalogului, configurația workspace/activități, namespace-urile
în ordinea lor de aplicare și strategia de export autonom.

`npm run registry:generate` validează registrul și generează:

- `public/catalog-data.js` — datele folosite de API-ul existent `public/catalog.js`;
- `public/shared/lab-locales.js` — listele folosite de laboratoarele cu module ES;
- `public/design-system/lab-workspaces.json` — configurația comună de prezentare.

Build-ul generează automat aceste fișiere înainte de copierea distribuției.
`npm run check` și CI verifică dacă rezultatele sunt sincronizate. Importatoarele
citesc listele de traduceri direct prin `labNamespaces(id)`, iar constructorul de
arhive folosește intrările `offline.kind = archive`. Faraday păstrează constructorul
special, iar optica păstrează pagina autonomă. `web-only` descrie situația actuală,
nu creează o promisiune de export care nu există.

`inlineLocales` declară dicționarele gestionate în codul unei lecții; celelalte
namespace-uri trebuie să aibă fișiere RO/EN. Metadatele `namespace` opționale din
dicționarele mai vechi sunt tolerate; dacă sunt prezente, trebuie să corespundă.

Pentru un laborator nou:

1. Creează sursa și adaptorul/importatorul, dicționarele și resursele necesare.
2. Adaugă intrarea în manifest, inclusiv strategia de export existentă.
3. Generează registrul, rulează importatorul și regenerează exportul afectat.
4. Rulează build și verificările documentate în regulile laboratoarelor.

Nu edita manual cele trei rezultate generate. Numele surselor originale și logica
specifică importatoarelor rămân separate; manifestul nu mută snapshoturi și nu
modifică politica de stocare a rezultatelor.
