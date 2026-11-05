import {readFile} from 'node:fs/promises';
export async function scientificMathRuntime(){
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 const [vendor,core,dom,compatibility,css]=await Promise.all([read('public/simulari/calorimetrie/vendor/katex/katex.min.js'),read('public/shared/waves-math.js'),read('public/shared/scientific-math.js'),read('public/shared/math-compatibility.js'),read('public/simulari/calorimetrie/vendor/katex/katex.min.css')]);
 // Embed fonts so standalone lessons and old boards need no network or relative URLs.
 let fallbackCSS=css;
 for(const match of css.matchAll(/src:([^;}]+)/g)){
  const font=match[1].match(/url\((?:["']?)(fonts\/[^)"']+\.woff2)(?:["']?)\)/);
  if(!font)throw new Error('KaTeX fallback font lacks WOFF2');
  const bytes=await readFile(new URL('../public/simulari/calorimetrie/vendor/katex/'+font[1],import.meta.url));
  fallbackCSS=fallbackCSS.replace(match[0],'src:url(data:font/woff2;base64,'+bytes.toString('base64')+') format("woff2")');
 }
 fallbackCSS+='\n.praxis-math-fallback .katex{font-size:1em}';
 if(!core.includes('window.PraxisWaveMath='))throw Error('Scientific math core export changed');
 // Lazy synchronous local engine: existing KaTeX installations remain in use.
 return 'window.PraxisEnsureMathEngine=function(){if(!window.katex){'+vendor+'}return window.katex;};\nwindow.PraxisMathFallbackCSS='+JSON.stringify(fallbackCSS)+';\n'+compatibility+'\n'+core.replace('window.PraxisWaveMath=','window.PraxisMath=')+'\n'+dom;
}
