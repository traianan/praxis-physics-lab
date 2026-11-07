# Accesibilitate și surse — 7 noiembrie 2026

Obiectiv: audit reproductibil pentru paginile aplicației și centralizarea surselor originale, fără modificarea politicii de date.

- [x] Inventariază sursele din rădăcină și referințele active; înregistrează SHA-256 pentru fiecare fișier.
- [x] Mută sursele în `sources/<id>/`, actualizează importatoarele, testele, împachetarea și documentația activă; păstrează rapoartele istorice.
- [x] Verifică hashurile și execută importatoarele afectate; regenerează exporturile offline și build-ul.
- [x] Adaugă un audit axe reproductibil pentru Home, capitole și toate laboratoarele; verifică RO/EN și activitățile accesibile.
- [x] Remediază constatările în surse/adaptoare comune, apoi repetă verificările afectate și testează tastatura, focusul și afișarea la text mărit.
- [x] Rulează verificările proiectului și documentează rezultatele, acoperirea și limitele fără a echivala automatizarea cu certificarea WCAG.

Puncte de atenție: sursele mutate nu trebuie pierdute din Git din cauza regulii `sources/`; hashurile nu se normalizează la mutare; exporturile autonome trebuie să păstreze corecțiile; controalele ascunse nu trebuie accesibile prin Tab; limba și parametrii experimentelor trebuie păstrați.
