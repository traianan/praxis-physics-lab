# Pregătirea publicității — decizie 27 octombrie 2026

Pentru această aplicație, utilizatorul a cerut monetizare numai prin reclame. Nu sunt implementate abonamente, funcții blocate sau pachete cu plată. Această decizie este specifică proiectului Praxis-Fizica.

Am pregătit acum punctele de integrare `catalog-after-results` și `chapter-footer`, în afara scenei și a comenzilor experimentului. Configurația este `public/config/advertising.json`; adaptorul este `public/advertising.js`. Sunt inactive, invizibile și nu ocupă spațiu. Nu există SDK publicitar, identificator de editor, cereri de reclame sau urmărire.

Publicitatea va rămâne exclusă din versiunea locală/offline, Mod tablă și paginile simulărilor. Alegerea furnizorului și activarea se fac într-o sarcină ulterioară. Modificarea simplă a indicatorului `enabled` nu încarcă reclame: este necesar un adaptor real, integrarea consimțământului și o verificare a politicilor la acel moment.

Reper verificat la pregătire: [politica AdSense privind amplasarea](https://support.google.com/adsense/answer/1346295?hl=en) cere evitarea amplasării care induce clicuri accidentale. De aceea nu rezervăm bannere peste butoane, slidere sau scena tactilă. Pentru eventuala utilizare AdSense cu reclame personalizate în SEE/Regatul Unit/Elveția, consultă [cerințele CMP](https://support.google.com/adsense/answer/13554116?hl=en) la activare. Nu se afișează acum un consimțământ fictiv pentru un serviciu neimplementat.

Nu a fost publicat nimic pe GitHub, Vercel sau pe site-ul existent. Ghidul comercial comun din `_shared` rămâne în afara distribuției.
