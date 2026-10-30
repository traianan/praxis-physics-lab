# Integrarea aplicațiilor existente — 27 octombrie 2026

Surse descărcate cu permisiunea utilizatorului, fără modificări remote:

- [traianan/miscarea-rectilinie](https://github.com/traianan/miscarea-rectilinie), ramura master.
- [traianan/vectori](https://github.com/traianan/vectori), ramura master; aplicația indicată este [Calcul vectorial](https://traianan.github.io/vectori/).

`sources/miscarea-rectilinie` și `sources/vectori` sunt clone locale de referință, ignorate de Git-ul viitor al bibliotecii. Nu au fost găsite anterior directoare autonome cu aceste denumiri la rădăcina ProiecteAI; pentru a evita integrarea altei versiuni, s-au folosit sursele indicate. Commiturile și amprentele SHA-256 ale tuturor fișierelor originale sunt în `docs/imported-courses.json`.

## Conținut păstrat

Mișcarea rectilinie: toate cele patru secțiuni, clasificări și exerciții, MRU, MRUV, grafice, convertor, întâlnirea mobilelor, calculatorul Galilei, cele 20 de probleme cu variante și rezolvări, modul Test și istoricul/progresul local.

Calcul vectorial: toate cele 14 secțiuni, explicații și formule, figuri 2D și 3D interactive, operații, descompunere, produse scalar/vectorial/mixt, calculatorul, fișa recapitulativă, testul și resursele. KaTeX, fonturile și pictogramele sunt incluse local. Arhivele autonome sunt regenerate cu noile controale și ambele limbi. Linkurile externe de documentare rămân disponibile și necesită internet pentru destinațiile externe.

## Adaptări

- Ambele lecții sunt în capitolul existent Mișcare; calculul vectorial este un instrument de bază pentru mecanică. Nu a fost adăugat un al optulea capitol.
- Deschidere și revenire în aceeași filă, cu păstrarea contextului catalogului.
- Antet comun, selector al secțiunilor, RO/EN pentru întregul conținut și alegerea mărimii textului 100–200%.
- Același antet este utilizat și de optică; bara originală dublă a mișcării este eliminată din afișare, iar taburile sunt mutate sub titlu. Introducerea amplă a vectorilor se deschide din „Introducere și prezentarea lecției”, păstrând toate paragrafele și figura animată.
- Stiluri comune pentru interfață, butoane și formule; semnificația culorilor fizice este păstrată în ambele palete. Tema întunecată a mișcării rămâne utilizabilă.
- Butoane −/+ de 44 px pentru toate sliderele, inclusiv cele generate dinamic. Acestea emit evenimentele native originale; calculele și sincronizarea câmpurilor rămân ale aplicației-sursă.
- Sunetul global al bibliotecii controlează și evenimentele sonore originale ale mișcării. Nu se pornește sunet implicit. Butonul original este păstrat și sincronizat.
- Cache-ul offline al vectorilor are nume propriu și nu șterge cache-urile altor aplicații; include fișierele comune. Construirea schimbă versiunea cache-ului când pagina sau stilurile comune se modifică.

Conținutul didactic este tradus integral RO/EN în JSON separat pe secțiuni. Nu se afișează vechea notă de conținut exclusiv românesc. Lecțiile ample își păstrează navigarea și derularea de lectură; Mod tablă fără derulare al catalogului și al opticii nu este înlocuit de această integrare.

## Regenerare

`npm run import:courses` copiază `site/` din cele două clone și adaugă adaptoarele; apoi `npm run build` generează distribuția. Pentru publicarea viitoare sunt suficiente fișierele deja incluse în `public/`; build-ul nu descarcă nimic și nu depinde de clone. Nu edita manual copiile generate pentru a modifica motorul: păstrează schimbările de integrare în script/adaptor.

Arhivele „Descarcă lecția” sunt acum distribuții autonome bilingve regenerate cu `npm run offline:courses`, după import. Pot fi dezarhivate și deschise direct, cu toate resursele locale. Amprentele distribuțiilor sunt în `docs/offline-courses.json`. Pentru biblioteca întreagă folosește `outputs/Praxis-Fizica-local.zip` și `Porneste-local.cmd`.

## Verificări

Testele compară fiecare fișier cu inventarul SHA-256, reconstruiesc HTML-ul original prin eliminarea exclusivă a adaptorului și verifică numărul celor 20 de probleme și 14 secțiuni. Modificările JavaScript ale mișcării sunt limitate la sincronizarea sunetului, formatul numeric după limbă și înlocuirea confirmării native de abandonare a testului cu un dialog accesibil; codul matematic este identic. În browser s-au verificat sincronizarea −/+ cu numărul și ecuația MRU, lista de 20 de probleme, formulele KaTeX și recalcularea înmulțirii vectorului cu un scalar, navigarea în aceeași filă și antetul la 640×360. Aceste verificări nu reprezintă un audit fizic nou al tuturor exercițiilor din surse.

## Prezentare și atingere

Ambele lecții au selector Praxis / Vii, aplicat textelor și desenelor, și Mod tactil memorat. Controale de minimum 52 px, cursoare de 32 px; pentru vectorii 2D zona de prindere devine 34 px. Canvasurile păstrează Pointer Events și capturarea degetului; scenele 3D se rotesc prin glisare. Operațiile și toate secțiunile originale rămân disponibile. Numerele decorative 01… sunt ascunse, iar titlurile rămân afișate.

## Calorimetrie — 28 octombrie 2026

Laborator integrat în Căldură și termodinamică, cu șapte simulări, taburi, tabele responsive, 12 întrebări și opt probleme, RO/EN și arhivă autonomă. Sursele sunt păstrate în `sources/calorimetrie/site`. Detalii: [VERIFICARE_CALORIMETRIE.md](VERIFICARE_CALORIMETRIE.md).

## Principiul I al termodinamicii — 28 octombrie 2026

Șase taburi, bilanț energetic, trei grafice, piston, calculatoare și recapitulare; în Căldură și termodinamică, cu RO/EN, prezentarea comună și distribuție autonomă. [Verificare](VERIFICARE_PRINCIPIUL_I.md).
