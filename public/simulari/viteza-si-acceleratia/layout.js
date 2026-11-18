for(const group of document.querySelectorAll('.control-group,.poly-events-box')){
 if(!group.matches('.poly-events-box')&&!group.querySelector('input[type=checkbox]')&&!(group.closest('#tab-polinom')&&group.querySelector('.preset-chips')))continue;
 const details=document.createElement('details'),summary=document.createElement('summary'),heading=group.querySelector('h3,h4');
 details.className='control-group praxis-workspace-disclosure';if(heading)summary.append(heading);else summary.textContent='Explicații';group.before(details);details.append(summary);if(group.matches('.poly-events-box'))details.append(group);else{while(group.firstChild)details.append(group.firstChild);group.remove();}
}