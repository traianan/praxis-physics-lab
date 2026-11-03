import {readFile} from 'node:fs/promises';
const helper=await readFile(new URL('./adaptations/waves-retained-context.js',import.meta.url),'utf8');
const originalCanvas=await readFile(new URL('./adaptations/waves-canvas-original.js',import.meta.url),'utf8');
// This tracked baseline restores the exact original facade for provenance checks.
// It deliberately does not depend on an ignored sources/ checkout being present.
export function restoreWaveResolution(source){
 source=source.replaceAll('\r\n','\n');const retained=helper.replaceAll('\r\n','\n')+'\n';
 if(source.split(retained).length!==2)throw Error('Waves retained context reversal target changed');
 source=source.replace(retained,'');
 const start=source.indexOf('function LessonCanvas({'),end=source.indexOf('\n\n// Vector membrane:',start);
 if(start<0||end<0||!source.slice(start,end).includes('retainedContext?.replay(snapshot)'))throw Error('Waves canvas reversal target changed');
 return source.slice(0,start)+originalCanvas.replaceAll('\r\n','\n')+source.slice(end);
}
export function adaptWaveResolution(source){
 function replace(from,to){if(source.split(from).length!==2)throw Error('Waves resolution target changed: '+from.slice(0,80));source=source.replace(from,()=>to);}
 replace('function LessonCanvas({',helper+'\nfunction LessonCanvas({');
 replace('let drawingContext=null,contextFacade=null;','let drawingContext=null,contextFacade=null,retainedContext=null;');
 const start=source.indexOf("    drawingContext=target.getContext('2d',...args);"),end=source.indexOf('    return contextFacade;',start);
 if(start<0||end<0)throw Error('Waves logical context facade changed');
 source=source.slice(0,start)+`    retainedContext=lessonRetainedContext(target,proxy,logicalWidth,logicalHeight,...args);
    drawingContext=retainedContext.context;contextFacade=retainedContext.facade;
`+source.slice(end);
 replace('const dpr=Math.min(3,window.devicePixelRatio||1);const w=release?logicalWidth:Math.min(4096,Math.round(box.width*dpr)),h=release?logicalHeight:Math.round(w*logicalHeight/logicalWidth);',`const displayedHeight=box.width*logicalHeight/logicalWidth;
   const dpr=window.PraxisCanvasResolution?.ratio(box.width,displayedHeight)??Math.min(3,window.devicePixelRatio||1);
   const w=release?logicalWidth:Math.max(1,Math.round(box.width*dpr)),h=release?logicalHeight:Math.max(1,Math.round(displayedHeight*dpr));`);
 const preserveStart=source.indexOf('   // Preserve a one-shot plot until its next redraw,'),preserveEnd=source.indexOf('\n  };',preserveStart);
 if(preserveStart<0||preserveEnd<0)throw Error('Waves retained resize target changed');
 source=source.slice(0,preserveStart)+`   const snapshot=retainedContext?.snapshot();
   canvas.width=w;canvas.height=h;canvas.dataset.renderScale=(w/logicalWidth).toFixed(3);
   retainedContext?.replay(snapshot);`+source.slice(preserveEnd);
 return source;
}
