import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('../public/locales/',import.meta.url);
const data={
 'miscarea-rectilinie':{
  ro:{title:'Mișcarea rectilinie',subtitle:'Cinematică: MRU și MRUV',description:'Tipuri de mișcări, simulări și grafice MRU/MRUV, 20 de probleme rezolvate și Mod Test.',tags:['MRU / MRUV','Probleme','Test','Offline'],keywords:'miscare rectilinie cinematica viteza acceleratie grafice probleme mru mruv',alt:'Mișcare rectilinie și graficele poziției și vitezei'},
  en:{title:'Rectilinear motion',subtitle:'Kinematics: uniform and uniformly accelerated motion',description:'Motion types, MRU/MRUV simulations and graphs, 20 solved problems and test mode.',tags:['Kinematics','Problems','Test','Offline'],keywords:'rectilinear motion kinematics speed velocity acceleration graphs problems mru mruv',alt:'Rectilinear motion and position and velocity graphs'}
 },
 'calcul-vectorial':{
  ro:{title:'Calcul vectorial',subtitle:'Instrumente matematice pentru fizică',description:'14 secțiuni cu vectori, componente, operații, descompunere, produse scalar și vectorial, calculator și autoevaluare.',tags:['Vectori','Figuri interactive','Calculator','Offline'],keywords:'calcul vectorial vectori componente versori adunare produs scalar vectorial mixt descompunere',alt:'Adunarea vectorilor și componentele lor'},
  en:{title:'Vector algebra',subtitle:'Mathematical tools for physics',description:'14 sections covering vectors, components, operations, decomposition, dot and cross products, a calculator and quiz.',tags:['Vectors','Interactive figures','Calculator','Offline'],keywords:'vectors vector algebra components unit vectors addition dot cross triple product decomposition',alt:'Vector addition and components'}
 }
};
const messages={
 'Mișcarea rectilinie':'Rectilinear motion','Calcul vectorial':'Vector algebra','Secțiunea lecției':'Lesson section','Text / afișare':'Text / display','Text și afișare':'Text and display','Mărimea textului':'Text size',
 'Acasă — biblioteca de fizică':'Home — physics library',
 'Acasă — începutul lecției':'Home — lesson start',
 'Confirmare':'Confirmation','Continuă testul':'Continue the test','Renunță la test':'Abandon the test',
 'valoarea':'value','Culori':'Colours','Praxis · tonuri calme':'Praxis · calm colours','Vii · contrast puternic':'Vivid · high contrast','Mod tactil':'Touch mode','Scade {parameter} cu {step}':'Decrease {parameter} by {step}','Crește {parameter} cu {step}':'Increase {parameter} by {step}',
 'Laboratoare interactive':'Interactive laboratories','Optică geometrică':'Geometric optics',
 'Laborator interactiv de cinematică':'Interactive kinematics laboratory','Instrumente matematice pentru fizică':'Mathematical tools for physics','Introducere și prezentarea lecției':'Introduction and lesson overview',
 'Tipuri de mișcări':'Types of motion','Mișcarea uniform variată':'Uniformly accelerated motion','Probleme':'Problems',
 'Mărimi vectoriale':'Vector quantities','Componente și versori':'Components and unit vectors','Adunarea a doi vectori':'Adding two vectors','Regula poligonului':'Polygon rule','Scăderea vectorilor':'Subtracting vectors','Înmulțirea cu un scalar':'Multiplying by a scalar','Descompunerea':'Vector decomposition','Produsul scalar':'Dot product','Produsul vectorial':'Cross product','Produsul mixt':'Scalar triple product','Calculator':'Calculator','Fișă recapitulativă':'Summary sheet','Test':'Quiz','Resurse':'Resources',
 'Cele șapte capitole organizează biblioteca. Mișcarea rectilinie și Calcul vectorial sunt în Mișcare; Oglinzi și lentile este în Lumină și radiații.':'The seven chapters organise the library. Rectilinear motion and Vector algebra are under Motion; Mirrors and lenses is under Light and radiation.',
 'În optică, Mod tablă extinde scena. Lecțiile importate păstrează lectura pe secțiuni, cu reglaje tactile și mărirea textului.':'In optics, Board mode expands the scene. Imported lessons retain section-based reading, with touch controls and text resizing.',
 'Conținutul lecției este în română. Comenzile bibliotecii sunt disponibile în RO și EN.':'Lesson content is in Romanian. Library controls are available in RO and EN.',
 'Conținutul original este păstrat integral: explicații, formule, simulări, exerciții și teste.':'All original content is preserved: explanations, equations, simulations, exercises and tests.',
 '{count} simulări disponibile':'{count} simulations available','{count} laboratoare disponibile':'{count} laboratories available','7 capitole · {count} simulări':'7 chapters · {count} simulations','1 capitol · {count} simulări':'1 chapter · {count} simulations',
 'Deschide Mișcarea rectilinie':'Open Rectilinear motion','Deschide Calcul vectorial':'Open Vector algebra',
 'Mișcare rectilinie și graficele poziției și vitezei':'Rectilinear motion and position and velocity graphs','Adunarea vectorilor și componentele lor':'Vector addition and components'
};
for(const lang of ['ro','en']){
 const file=new URL('chapters/miscare/'+lang+'.json',base),chapter=JSON.parse(await readFile(file,'utf8'));
 chapter.simulations=Object.fromEntries(Object.entries(data).map(([id,d])=>[id,d[lang]]));for(const [id,d]of Object.entries(data))chapter.messages[d.ro.title]=d[lang].title;
 await writeFile(file,JSON.stringify(chapter,null,2)+'\n');
 await writeFile(new URL('courses/shared/'+lang+'.json',base),JSON.stringify({locale:lang,namespace:'courses/shared',messages:Object.fromEntries(Object.entries(messages).map(([k,v])=>[k,lang==='ro'?k:v]))},null,2)+'\n');
 // Metadata counts are also used outside the course header.
 const commonFile=new URL('common/'+lang+'.json',base),common=JSON.parse(await readFile(commonFile,'utf8'));
 for(const [key,value]of Object.entries(messages))if(/count|^Deschide |graficele|componentel|^Acasă|^Cele șapte|^În optică|^Laboratoare interactive/.test(key))common.messages[key]=lang==='ro'?key:value;
 await writeFile(commonFile,JSON.stringify(common,null,2)+'\n');
}
