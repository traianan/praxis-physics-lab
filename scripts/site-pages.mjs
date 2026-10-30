import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=new URL('../public/',import.meta.url),origin='https://praxis-physics-lab.vercel.app/';
const pages=[
 {slug:'termeni',title:['Termeni și condiții','Terms and conditions'],sections:[
  ['Ultima actualizare: 30 octombrie 2026.','Last updated: 30 October 2026.'],
  ['Despre serviciu','About the service','h2'],
  ['Praxis · Fizică interactivă este oferită gratuit de Traian Anghel, profesor de fizică la Colegiul Național „Nicolae Iorga” din Brăila, România. Aplicația este destinată învățării și predării fizicii, în română și engleză, fără cont obligatoriu.','Praxis · Interactive Physics is provided free of charge by Traian Anghel, a physics teacher at Colegiul Național “Nicolae Iorga” in Brăila, Romania. The app supports learning and teaching physics in Romanian and English, without a mandatory account.'],
  ['Utilizare educațională','Educational use','h2'],
  ['Poți accesa și folosi gratuit laboratoarele la clasă și pentru studiu individual. Folosește aplicația responsabil, fără să perturbi funcționarea site-ului, să încerci accesarea neautorizată a sistemelor sau să încalci drepturile altor persoane.','You may access and use the laboratories free of charge in class and for individual study. Use the app responsibly, without disrupting the website, attempting unauthorised access to systems or infringing other people’s rights.'],
  ['Modele, rezultate și siguranță','Models, results and safety','h2'],
  ['Simulările folosesc modele didactice și ipoteze simplificatoare. Valorile și graficele sprijină înțelegerea fenomenelor și nu înlocuiesc măsurătorile profesionale, evaluarea profesorului sau regulile de siguranță pentru experimente reale. Verifică ipotezele modelului și unitățile de măsură înainte de a interpreta un rezultat.','The simulations use educational models and simplifying assumptions. Values and graphs support understanding and do not replace professional measurements, a teacher’s assessment or safety rules for real experiments. Check model assumptions and measurement units before interpreting a result.'],
  ['Drepturi asupra materialelor','Rights in the materials','h2'],
  ['Accesul gratuit nu transferă drepturile de autor asupra aplicației sau materialelor. Mențiunile de autor și licențele componentelor terțe trebuie respectate. Pentru redistribuirea ori utilizarea materialelor în afara permisiunilor aplicabile, solicită clarificări la adresa de contact. Aceste condiții nu restrâng utilizările permise de lege.','Free access does not transfer copyright in the app or materials. Author credits and third-party component licences must be respected. For redistribution or use beyond the applicable permissions, request clarification using the contact address. These terms do not restrict uses permitted by law.'],
  ['Date și preferințe','Data and preferences','h2'],
  ['Aplicația nu solicită conturi și nu păstrează între vizite răspunsurile, rezultatele testelor sau însemnările didactice. Preferințele pot fi memorate pe dispozitiv numai cu acordul tău. Alegerea privind cookies poate fi modificată din subsol. Detaliile despre stocarea locală, găzduire și contact sunt în pagina de confidențialitate.','The app does not require accounts and does not retain answers, test results or educational notes between visits. Preferences may be remembered on your device only with your consent. Cookie choices can be changed in the footer. Details about local storage, hosting and contact are provided on the privacy page.'],
  ['Disponibilitate și actualizări','Availability and updates','h2'],
  ['Pot exista întreruperi tehnice, erori sau modificări ale conținutului. Corectăm problemele semnalate și putem actualiza aplicația și aceste condiții. Data ultimei actualizări este afișată pe această pagină. O modificare a termenilor nu înlocuiește acordul separat pentru memorarea preferințelor.','Technical interruptions, errors or content changes may occur. We address reported issues and may update the app and these terms. The last update date is shown on this page. A change to the terms does not replace separate consent to remember preferences.'],
  ['Drepturile tale și contact','Your rights and contact','h2'],
  ['Aceste condiții nu exclud și nu limitează drepturile sau răspunderea care nu pot fi excluse ori limitate potrivit legii aplicabile. Pentru întrebări, erori sau clarificări privind utilizarea, scrie la contact@praxissciencelab.app.','These terms do not exclude or limit rights or liability that cannot be excluded or limited under applicable law. For questions, errors or clarification about use, email contact@praxissciencelab.app.']
 ]},
 {slug:'despre',title:['Despre aplicație','About the app'],sections:[
  [null,null],
  ['Aplicația Praxis · Fizică interactivă este oferită gratuit de Traian Anghel, profesor de fizică la Colegiul Național „Nicolae Iorga” din Brăila, România.','Praxis · Interactive Physics is provided free of charge by Traian Anghel, a physics teacher at Colegiul Național “Nicolae Iorga” in Brăila, Romania.'],
  ['Biblioteca reunește simulări, explicații, experimente și activități de fizică în română și engleză, pentru clasă și explorare individuală.','The library brings together physics simulations, explanations, experiments and activities in Romanian and English, for classroom use and individual exploration.'],
  ['Acces gratuit, fără cont','Free access, no account required','h2'],
  ['Nu este necesară crearea unui cont. Conținutul educațional poate fi folosit gratuit, iar refuzul memorării preferințelor nu limitează accesul la laboratoare.','No account is required. The educational content is free to use, and declining preference storage does not restrict access to the laboratories.'],
  ['Modele pentru învățare','Models for learning','h2'],
  ['Simulările folosesc modele didactice și ipoteze simplificatoare. Ele sprijină înțelegerea fenomenelor și completează explicațiile și experimentele de la clasă.','The simulations use educational models and simplifying assumptions. They support understanding and complement classroom explanations and experiments.']
 ]},
 {slug:'contact',title:['Contact','Contact'],sections:[
  ['Pentru întrebări, sugestii sau semnalarea unei erori, scrie la:','For questions, suggestions or to report an error, email:'],
  ['contact@praxissciencelab.app','contact@praxissciencelab.app','email'],
  ['Traian Anghel — profesor de fizică la Colegiul Național „Nicolae Iorga”, Brăila, România.','Traian Anghel — physics teacher at Colegiul Național “Nicolae Iorga”, Brăila, Romania.'],
  ['Când semnalezi o problemă, menționează laboratorul, limba și pașii de reproducere. Nu trimite numele elevilor, rezultatele lor sau alte date personale care nu sunt necesare.','When reporting a problem, include the laboratory, language and steps to reproduce it. Do not send student names, their results or other unnecessary personal data.'],
  ['Aplicația nu are formular de contact. Trimiterea unui mesaj deschide aplicația ta de e-mail. Dacă ne scrii, adresa ta și conținutul mesajului sunt folosite pentru a răspunde solicitării; acestea nu sunt date colectate prin simulări.','The app has no contact form. The email link opens your email application. If you contact us, your address and message are used to respond to your enquiry; these are not data collected through simulations.']
 ]},
 {slug:'confidentialitate',title:['Confidențialitate și cookies','Privacy and cookies'],sections:[
  ['Ultima actualizare: 30 octombrie 2026.','Last updated: 30 October 2026.'],
  ['Datele din aplicație','Data in the app','h2'],
  ['Aplicația nu are conturi de utilizator și nu trimite numele, răspunsurile la exerciții, rezultatele testelor sau însemnările din laboratoare către un server propriu. Nu există o bază de date cu elevi sau rezultate.','The app has no user accounts and does not send names, exercise answers, test results or laboratory notes to an application database or server. There is no database of students or results.'],
  ['Răspunsurile, rezultatele și însemnările rămân în memoria paginii sau a sesiunii de lucru și nu sunt păstrate de aplicație între vizite. Fișierele exportate sau descărcate la cererea ta rămân pe dispozitiv și sunt gestionate de tine.','Answers, results and notes remain in page memory or the current working session and are not retained by the app between visits. Files you choose to export or download remain on your device and are managed by you.'],
  ['Cookies și stocare locală','Cookies and local storage','h2'],
  ['În versiunea actuală nu folosim cookies de publicitate sau analiză și nu încărcăm servicii de urmărire. Funcțiile de publicitate sunt inactive.','The current version does not use advertising or analytics cookies and does not load tracking services. Advertising features are inactive.'],
  ['Cu acordul tău, salvăm doar pe acest dispozitiv preferințele de limbă, sunet, culori, dimensiune a textului și afișare. Acestea folosesc stocarea locală a browserului, o tehnologie diferită de cookies, și nu sunt trimise către noi.','With your consent, we save language, sound, colours, text size and display preferences on this device only. These use browser local storage, a technology distinct from cookies, and are not sent to us.'],
  ['Poți alege „Doar necesare” și poți continua să folosești toate laboratoarele. Preferințele vor funcționa în pagina curentă fără a fi memorate între vizite. Alegerea privind acordul este păstrată local timp de 180 de zile, pentru a respecta decizia ta. Starea necesară revenirii în bibliotecă poate fi păstrată pe durata sesiunii din filă.','You can choose “Necessary only” and continue using all laboratories. Preferences will work on the current page without being remembered between visits. Your consent choice is stored locally for 180 days to respect your decision. State needed to return to the library may be stored for the current tab session.'],
  ['Poți modifica sau retrage acordul oricând prin „Setări cookies”. Dacă alegi apoi „Doar necesare”, preferințele persistente gestionate de aplicație sunt șterse. Datele locale pot fi șterse și din setările browserului.','You can change or withdraw consent at any time through “Cookie settings”. If you then choose “Necessary only”, persistent preferences managed by the app are deleted. Local data can also be cleared in your browser settings.'],
  ['Găzduirea site-ului','Website hosting','h2'],
  ['Site-ul este găzduit de Vercel. Livrarea și protejarea paginilor pot implica procesarea unor date tehnice, precum adresa IP și informații despre cererea web. Acest trafic tehnic este distinct de răspunsurile și activitatea didactică din simulări.','The website is hosted by Vercel. Delivering and securing pages may involve processing technical data, such as IP addresses and web request information. This technical traffic is separate from answers and educational activity in the simulations.'],
  ['Detalii despre prelucrarea datelor de către Vercel','Details about Vercel’s data processing','vercel'],
  ['Microfon și fișiere','Microphone and files','h2'],
  ['Unele laboratoare oferă instrumente audio. Microfonul este folosit numai la cererea ta și cu permisiunea browserului. Înregistrările și fișierele exportate sunt prelucrate local; aplicația nu le încarcă pe un server propriu.','Some laboratories offer audio tools. The microphone is used only at your request and with browser permission. Recordings and exported files are processed locally; the app does not upload them to an application server.'],
  ['Întrebări despre confidențialitate','Privacy enquiries','h2'],
  ['Pentru întrebări privind această pagină sau datele dintr-un mesaj de contact, scrie la contact@praxissciencelab.app. Nu include date personale ale elevilor.','For questions about this page or data in a contact message, email contact@praxissciencelab.app. Do not include students’ personal data.']
 ]}
];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export async function generateSitePages(){
 const translations={'← Bibliotecă':'← Library'};
 for(const page of pages){
  translations[page.title[0]]=page.title[1];
  let content='';
  for(const [ro,en,type]of page.sections){if(!ro)continue;translations[ro]=en;
   content+=type==='h2'?`<h2>${escape(ro)}</h2>`:type==='email'?`<p class="info-note"><a href="mailto:${ro}">${ro}</a></p>`:type==='vercel'?`<p><a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">${escape(ro)}</a></p>`:`<p>${escape(ro)}</p>`;
  }
  const title=`${page.title[0]} · Praxis Science Lab`;translations[title]=`${page.title[1]} · Praxis Science Lab`;
  const description=`${page.title[0]} — Praxis · Fizică interactivă.`;translations[description]=`${page.title[1]} — Praxis · Interactive Physics.`;
  const html=`<!doctype html><html lang="ro" prefix="og: https://ogp.me/ns#"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${origin}${page.slug}/"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${page.slug}/"><meta property="og:site_name" content="Praxis Science Lab"><meta property="og:title" content="${escape(page.title[0]===page.title[1]?page.title[0]:page.title.join(' / '))} · Praxis"><meta property="og:description" content="Fizică interactivă gratuită, în RO și EN. Free interactive physics in Romanian and English."><meta property="og:image" content="${origin}assets/social-preview.png?v=2"><link rel="stylesheet" href="../design-system/tokens.css"><link rel="stylesheet" href="../styles.css"><link rel="stylesheet" href="../design-system/components.css"><link rel="stylesheet" href="../shared/site-info.css"><script src="../shared/privacy.js"></script><script src="../shared/i18n.js"></script><script src="../shared/sound.js"></script></head><body><a class="skip-link" href="#continut">Sari la conținut</a><header class="topbar info-topbar"><a class="brand" href="../?home=1"><span class="brand-symbol">p<span>·</span></span><span class="brand-name">praxis<small>SCIENCE LAB</small></span></a><span class="product-name">Fizică interactivă</span><a class="button secondary" href="../?home=1">← Bibliotecă</a><span data-info-language></span></header><main class="info-content" id="continut"><span class="eyebrow">PRAXIS SCIENCE LAB</span><h1>${page.title[0]}</h1>${content}</main><footer class="page-footer"></footer><script type="module" src="../shared/info-page.js"></script></body></html>`;
  const dir=new URL(page.slug+'/',root);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),html);
 }
 await mkdir(new URL('locales/info/',root),{recursive:true});
 for(const lang of ['ro','en'])await writeFile(new URL(`locales/info/${lang}.json`,root),JSON.stringify({locale:lang,namespace:'info',messages:Object.fromEntries(Object.entries(translations).map(([ro,en])=>[ro,lang==='ro'?ro:en]))},null,2)+'\n');
}
export async function integratePrivacyPages(directory){
 const base=typeof directory==='string'?directory:fileURLToPath(directory);
 async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(!entry.name.endsWith('.html'))continue;
  let html=await readFile(file,'utf8');if(!/<head\b/i.test(html))continue;
  const relative=path.relative(path.dirname(file),base).replaceAll('\\','/')||'.';
  if(!html.includes('shared/site-info.css'))html=html.replace(/<\/head>/i,`<link rel="stylesheet" href="${relative}/shared/site-info.css"></head>`);
  if(!html.includes('shared/site-navigation.css'))html=html.replace(/<\/head>/i,`<link rel="stylesheet" href="${relative}/shared/site-navigation.css"></head>`);
  if(!html.includes('shared/site-navigation.js'))html=html.replace(/<head\b[^>]*>/i,head=>head+`<script src="${relative}/shared/site-navigation.js"></script>`);
  // Move the guard before even inline legacy scripts that read storage.
  html=html.replace(/<script\b[^>]*src=["'][^"']*shared\/privacy\.js["'][^>]*><\/script>/gi,'');
  html=html.replace(/<head\b[^>]*>/i,head=>head+`<script src="${relative}/shared/privacy.js"></script>`);
  await writeFile(file,html);
 }}await walk(base);
}
