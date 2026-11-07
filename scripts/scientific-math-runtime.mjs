import {readFile} from 'node:fs/promises';
export async function scientificMathRuntime({embedFonts=true}={}){
 const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
 const [vendor,core,dom,compatibility,css]=await Promise.all([read('public/simulari/calorimetrie/vendor/katex/katex.min.js'),read('public/shared/waves-math.js'),read('public/shared/scientific-math.js'),read('public/shared/math-compatibility.js'),read('public/simulari/calorimetrie/vendor/katex/katex.min.css')]);
 // Embed fonts so standalone lessons and old boards need no network or relative URLs.
 let fallbackCSS=css;
 for(const match of css.matchAll(/src:([^;}]+)/g)){
  const font=match[1].match(/url\((?:["']?)(fonts\/[^)"']+\.woff2)(?:["']?)\)/);
  if(!font)throw new Error('KaTeX fallback font lacks WOFF2');
  const source=embedFonts?'data:font/woff2;base64,'+(await readFile(new URL('../public/simulari/calorimetrie/vendor/katex/'+font[1],import.meta.url))).toString('base64'):'__PRAXIS_MATH_FONTS__/'+font[1];
  fallbackCSS=fallbackCSS.replace(match[0],'font-display:swap;src:url('+source+') format("woff2")');
 }
 fallbackCSS+='\n.praxis-math-fallback .katex{font-size:1em}';
 if(!core.includes('window.PraxisWaveMath='))throw Error('Scientific math core export changed');
 // Lazy synchronous local engine: existing KaTeX installations remain in use.
 const cssExpression=JSON.stringify(fallbackCSS)+(embedFonts?'':'.replaceAll("__PRAXIS_MATH_FONTS__",new URL("../simulari/calorimetrie/vendor/katex",document.currentScript.src).href)');
 const engine=embedFonts?'window.PraxisEnsureMathEngine=function(){if(!window.katex){'+vendor+'}return window.katex;};':await read('public/shared/math-engine-loader.js');
 return '/* praxis:math-runtime */\n'+engine+'\nwindow.PraxisMathFallbackCSS='+cssExpression+';\n'+compatibility+'\n'+core.replace('window.PraxisWaveMath=','window.PraxisMath=')+'\n'+dom+'\n/* /praxis:math-runtime */';
}

let standalone;
export async function inlineMathFonts(source){
 if(!source.includes('/* praxis:math-runtime */'))return source;
 standalone??=scientificMathRuntime();
 const runtime=await standalone;
 return source.replace(/\/\* praxis:math-runtime \*\/[\s\S]*?\/\* \/praxis:math-runtime \*\//g,()=>runtime);
}
