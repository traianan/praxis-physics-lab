import {readFile} from 'node:fs/promises';
export async function scientificMathRuntime(){
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 const [vendor,core,dom]=await Promise.all([read('public/simulari/calorimetrie/vendor/katex/katex.min.js'),read('public/shared/waves-math.js'),read('public/shared/scientific-math.js')]);
 if(!core.includes('window.PraxisWaveMath='))throw Error('Scientific math core export changed');
 // Lazy synchronous local engine: existing KaTeX installations remain in use.
 return 'window.PraxisEnsureMathEngine=function(){if(!window.katex){'+vendor+'}return window.katex;};\n'+core.replace('window.PraxisWaveMath=','window.PraxisMath=')+'\n'+dom;
}
