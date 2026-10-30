/** Explicit compatibility adapter for the original laboratory; engine equations remain untouched. */
export function localizeOpticsSource(html){
 html=html.replace(/\r\n/g,'\n');
 const replace=(from,to)=>{if(!html.includes(from))throw new Error('Optics localization hook changed: '+from.slice(0,70));html=html.replace(from,to);};
 replace("new Intl.NumberFormat('ro-RO',",'new Intl.NumberFormat(window.PraxisI18n.locale,');
 replace("function text(x, y, value, attributes = '') {", "function text(x, y, value, attributes = '') { value = window.PraxisI18n.tr(value);");
 replace("$('toast').textContent = message;", "$('toast').textContent = window.PraxisI18n.tr(message);");
 for(const variable of ['scale','applied']){
  const expression='`Mărime aleasă: ${Math.round(boardScale * 100)}%.` + ('+variable+' < boardScale ? ` Aplicată aici: ${Math.round('+variable+' * 100)}% (adaptare la ecran).` : \'\')';
  replace(expression,'window.PraxisI18n.tr('+expression+')');
 }
 replace("$('insight-title').textContent = title;", "$('insight-title').textContent = window.PraxisI18n.tr(title);");
 replace("$('insight-body').textContent = body;", "$('insight-body').textContent = window.PraxisI18n.tr(body);");
 replace('configureControls(); renderResults(); fitBoardUI(); renderScene(); syncRangeSteppers();', 'configureControls(); renderResults(); fitBoardUI(); renderScene(); syncRangeSteppers(); window.PraxisI18n.apply(document); fitBoardUI(); window.PraxisI18n.apply(document);');
 replace('\n}\n\nfunction drawCurvature(', '\n  window.PraxisI18n.apply(svg); window.PraxisI18n.apply($(\'scene-hint\'));\n}\n\nfunction drawCurvature(');
 replace('\n}\n\nfunction renderChromaticAberration(', '\n  window.PraxisI18n.apply($(\'aberrations-section\'));\n}\n\nfunction renderChromaticAberration(');
 replace('`PRAXIS · ${names[state.type]}`','`PRAXIS · ${window.PraxisI18n.tr(names[state.type])}`');
 replace("ctx.fillText('Model ideal · aproximație paraxială · Praxis Science Lab',", "ctx.fillText(window.PraxisI18n.tr('Model ideal · aproximație paraxială · Praxis Science Lab'),");
 replace("installRangeSteppers();\nrender();", "installRangeSteppers();\nwindow.PraxisOptics={ refreshLanguage(){ lastAnnounced=''; render(); renderAberrations(); window.PraxisI18n.apply(document); fitBoardUI(); renderScene(); window.PraxisI18n.apply(document); } };\nrender();");
 return html;
}
