# Actualizare: patru laboratoare și prezentare obligatorie comună

Verificare completă în `AUDIT_STILURI_SI_UNDE.md`. Integrare Unde mecanice din ultima versiune, 19 teme / 37 de ecrane, 11 perechi JSON noi; total 88 de fișiere JSON. `npm run check`: **24/24 teste trecute**. Toate paginile celor trei laboratoare anterioare au fost parcurse cu stilul comun; noul laborator a fost parcurs în RO/EN, inclusiv 390×844 emulat cu touch. Arhiva autonomă a undelor a fost lansată prin file:// fără resurse HTTP/HTTPS.

---

# Corecție de uniformitate a titlurilor — 27 octombrie 2026

Titlurile tuturor lecțiilor importate folosesc acum tokenuri comune 30/24/20/18 px la scară 100%, în rem. În Calcul vectorial, antetul secțiunii ocupă întreaga lățime; eliminarea numerelor nu mai lasă titlul în prima coloană de 150 px. S-au eliminat dimensiunile decorative, italicele și colorarea parțială a titlurilor. Spațierile secțiunilor folosesc tokenurile comune.

Verificare funcțională prin MCP Chrome DevTools: toate cele 14 titluri de secțiune au 24 px la 100%, la 1280×800 și 640×360; la 640×360, EN și mărire 200%, au 48 px și se încadrează în lățimea disponibilă, fără overflow orizontal. Captura vizuală la 1280×800 confirmă titlul întreg pe un rând. Preferințele de probă au fost restaurate la RO/100%. Stilurile sunt comune și cu Mișcarea rectilinie. Verificarea din această etapă a fost posibilă prin Chrome DevTools; limitarea Computer Use din etapa precedentă rămâne consemnată mai jos ca istoric.

---

# Actualizare: traduceri complete, palete și atingere

- `npm run check`: **21/21 teste trecute**, inclusiv serverul local, egalitatea cheilor și parametrilor, păstrarea formulelor, paletele Canvas și preferința tactilă.
- 1.710 mesaje sursă revizuite, plus fragmente și tipare dinamice; 22 de namespace-uri noi, 44 JSON noi. Total aplicație: 33 namespace-uri, 66 JSON.
- Audit pe 976 rezultate generate de cele 20 de probleme (date de bază și câte șapte variante): zero fragmente românești rămase după traducere conform verificărilor de diacritice și cuvinte românești uzuale. Auditul verifică traducerea, nu revalidează fizica sursei.
- Toate secvențele LaTeX din mesajele traduse sunt identice cu originalul; fișierele sursă sunt comparate SHA-256 după inversarea adaptărilor permise.
- În browser, înainte de oprirea controlului vizual: MRU în EN, ecuația și parametrul x0 păstrate la comutare RO/EN; cele 20 de probleme, instrucțiunile testului și testul activ traduse. Răspunsul de probă 123.45 a rămas în câmp după schimbarea limbii; nu a fost finalizat/salvat un test.
- Verificarea vizuală finală a vectorilor și a noilor comutatoare nu a putut fi terminată: instrumentul Computer Use s-a oprit deoarece nu a putut identifica sigur URL-ul browserului. Nu s-a încercat ocolirea restricției. Dialogul nativ de abandonare a testului de probă poate necesita închidere manuală înainte de reîncărcare; versiunea nouă folosește un dialog HTML. Nu s-a testat pe echipament touch fizic.
- Ambele arhive autonome: CRC ZIP verificat independent, resurse locale prezente, scripturi valide și ambele limbi înglobate. Acesta este un control structural, fără lansare finală în browser a arhivelor.

Capturile din etapa anterioară, enumerate mai jos, nu reprezintă dovezi vizuale pentru noile traduceri.

---

# Verificare locală — 27 octombrie 2026

Actualizare finală: **18 teste trecute** după integrarea mișcării rectilinii și calculului vectorial. Integritatea conținutului original este verificată prin SHA-256; toate cele 20 de probleme și 14 secțiuni sunt prezente. Toate cele trei laboratoare folosesc `shared/lab-header.js` și `design-system/lab-layout.css`. În browser, optica și mișcarea au același antet de 76 px și același rând de titlu de 97,5 px la lățimea 1280 px. Sigla Home revine la toate capitolele cu căutarea goală. Toate cardurile au același fundal alb și contur. Mod tablă al opticii verificat din nou la 512×384: scenă vizibilă de 271 px înălțime, fără overflow al paginii. Antetul vectorilor și navigarea RO/EN au fost verificate și la 640×360.

Capturile actuale sunt `outputs/antet-comun-optica.png`, `outputs/antet-comun-miscare.png` și `outputs/home-carduri-uniforme.png`. Comportamentul și limitele traducerii cursurilor sunt în `INTEGRARE_LECTII.md`.

Verificările etapei inițiale:

- `npm run check`: 14 teste trecute, inclusiv paritatea cheilor și parametrilor RO/EN, localizarea înglobată fără fetch, sintaxa scripturilor din HTML autonom, componentele comune, publicitatea inactivă, HTTP și sunetul.
- Testele HTTP necesită loopback; în sandbox au fost blocate cu EACCES, apoi au trecut în afara acestei restricții. Nu s-a modificat firewallul și nu s-a deschis acces LAN.
- În browser: selector RO/EN în bibliotecă și optică; etichete, nume accesibile, formule, rezultate numerice, cele două lentile și cele trei oglinzi; explicațiile pentru aberații.
- Mod tablă: catalog și ferestre ale opticii la 512×384 și 640×360 în ambele limbi; verificare de geometrie DOM pentru overflow. La 512×384 fereastra opticii poate avea o diferență de rotunjire de 1 px. Catalogul folosește paginare.
- Biblioteca la 3840×2160, RO și EN, mărime 300%: toate cele șapte capitole încap pe o pagină, fără overflow. Verificare de viewport, nu test pe tabla fizică.
- Preferințele de limbă și mărime sunt persistente. Traducearea păstrează convenția carteziană din România; nu s-a modificat motorul fizic.
- Captură: `outputs/biblioteca-en-design-system.png`.

Fișierul autonom bilingv actual este `dist/simulari/oglinzi-si-lentile/index.html`. Biblioteca întreagă se folosește cu `Porneste-local.cmd`; ambele variante nu necesită internet. Arhiva locală este `outputs/Praxis-Fizica-local.zip`.
