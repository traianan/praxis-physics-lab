// Reversible prose-only changes: scientific models and worked problems remain intact.
export const editorialPairs=[
 ['⚠️ Corecție manual:','⚠️ Precizare:'],['⚠️ Textbook correction:','⚠️ Clarification:'],
 ['Cuprins manual','Cuprinsul lecției'],['Textbook contents','Lesson contents'],
 ['teorie manual XI','teorie despre unde'],
 ['Manualul uneori inversează etichetele. ',''],['The textbook sometimes reverses the labels. ',''],
 [' Manualul nu precizează această condiție.',''],[' The textbook does not specify this condition.',''],
 ['Manualul prezintă undele de suprafață pe apă ca „transversale pure”.','Undele de suprafață pe apă nu sunt unde transversale pure.'],
 ['The textbook describes water surface waves as purely transverse.','Water surface waves are not purely transverse waves.'],
 [' Manualul folosește uneori n=0,1,2 → confuzie.',''],[' The textbook sometimes uses n=0,1,2, causing confusion.',''],
 ['Manualul indexează tubul închis uneori cu n=0,1,... ceea ce dă L=n·λ/4?','Numerotarea modurilor într-un tub închis:'],
 ['The textbook sometimes indexes a closed pipe with n=0,1,..., which would give L=n·λ/4?','Numbering the modes of a closed pipe:'],
 [' Dacă vedeți n=0 în manual, corespunde n=1 la noi.',''],[' A textbook n=0 corresponds to n=1 here.','']
];
export function adaptLessonEditorial(text){
 for(const [before,after]of editorialPairs)text=text.replaceAll(before,after);
 return text;
}
export function adaptWaveEditorial(text,reverse=false){
 // Replace complete string literals, keeping an exact reversible manifest for provenance tests.
 if(reverse)return text.replace(/\/\*praxis-editorial:([A-Za-z0-9+/=]+)\*\/("(?:[^"\\]|\\.)*")/g,(_,encoded)=>Buffer.from(encoded,'base64').toString('utf8'));
 return text.replace(/"(?:[^"\\]|\\.)*"/g,literal=>{
  let value;try{value=JSON.parse(literal);}catch{return literal;}
  const revised=adaptLessonEditorial(value);if(value===revised)return literal;
  return '/*praxis-editorial:'+Buffer.from(literal).toString('base64')+'*/'+JSON.stringify(revised);
 });
}
