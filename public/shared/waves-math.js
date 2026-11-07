/* Plain-notation core: first validated in waves, also reused by common presentation. */
(()=>{
 const lower={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₙ':'n','ₒ':'o','ₐ':'a','ₑ':'e','ₕ':'h','ᵢ':'i','ⱼ':'j','ₖ':'k','ₗ':'l','ₘ':'m','ₚ':'p','ᵣ':'r','ₛ':'s','ₜ':'t','ᵤ':'u','ᵥ':'v','ₓ':'x','ᵧ':'y'};
 const upper={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+'};
 const greek={λ:'lambda',ν:'nu',ω:'omega',φ:'varphi',ρ:'rho',μ:'mu',π:'pi',θ:'theta',β:'beta',γ:'gamma',δ:'delta',ζ:'zeta',η:'eta',τ:'tau',σ:'sigma',α:'alpha',Δ:'Delta',Ω:'Omega',Σ:'Sigma'};
 const symbols={'·':'\\cdot','×':'\\times','−':'-','±':'\\pm','∓':'\\mp','≈':'\\approx','≠':'\\ne','≤':'\\le','≥':'\\ge','→':'\\to','⇒':'\\Rightarrow','∝':'\\propto','∞':'\\infty','∂':'\\partial','⊥':'\\perp','∥':'\\parallel','⟨':'\\langle','⟩':'\\rangle','°':'{}^{\\circ}','%':'\\%','…':'\\ldots'};
 const escape=s=>String(s).replace(/[\\{}%&#$]/g,c=>'\\'+c);
 const connectors=new Set(['la','cu','în','și','de','pe','un','se','vs','or','if','at','in','on','by','of','is','to','an','as']);
 const htmlEscape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 function htmlProse(source){
  const text=String(source),pattern=/(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])(?:_\{([^}]+)\}|_([\p{L}\p{N}]+)|([₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+))([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]*)|(?<![\p{L}\p{N}_])([A-Za-zΑ-ω])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/gu;
  let result='',last=0;
  for(const match of text.matchAll(pattern)){
   result+=htmlEscape(text.slice(last,match.index));
   const base=match[1]||match[6],sub=match[2]||match[3]||(match[4]?[...match[4]].map(c=>lower[c]).join(''):''),sup=[...(match[5]||match[7]||'')].map(c=>upper[c]).join('');
   result+='<span class="wave-script">'+htmlEscape(base)+(sub?'<sub>'+htmlEscape(window.PraxisI18n?.tr(sub)??sub)+'</sub>':'')+(sup?'<sup>'+htmlEscape(sup)+'</sup>':'')+'</span>';
   last=match.index+match[0].length;
  }
  return result+htmlEscape(text.slice(last));
 }
 function normalize(s){return String(s).replaceAll('<<','≪').replaceAll('>>','≫').replace(/\b([A-Za-z])([0-9]+)\b/g,'$1_{$2}').replace(/\bv([RSLP])\b/g,'v_{$1}').replace(/(?<=[±∓+−\-(=])\s*v([os])\b/g,'v_{$1}').replace(/[₀₁₂₃₄₅₆₇₈₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+/g,v=>'_{'+[...v].map(c=>lower[c]).join('')+'}').replace(/_\{([^{}]+)\}_\{([^{}]+)\}/g,'_{$1,$2}').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g,v=> '^{'+[...v].map(c=>upper[c]).join('')+'}');}
 function join(nodes){return nodes.map((n,i)=>(i?(n.unit?' \\,':nodes[i-1].kind==='function'&&n.kind==='group'?'':' '):'')+n.tex).join('');}
 function bare(nodes){return nodes.length===1&&nodes[0].kind==='group'&&!nodes[0].preserve?nodes[0].inside:join(nodes);}
 function reduce(nodes){
  for(let i=0;i<nodes.length;i++)if(nodes[i].kind==='slash'){
   let start=i-1;while(start>0&&!['stop','text'].includes(nodes[start-1].kind)&&!(nodes[start].unit&&/^\d/.test(nodes[start-1].tex)))start--;
   let end=i+1;while(end<nodes.length&&!['stop','text','multiply','slash'].includes(nodes[end].kind)){
    if(end>i+1&&nodes[end].boundaryBefore)break;
    if(end>i+1&&nodes[end].kind==='group'&&nodes[end].spaced)break;
    end++;
   }
   const numerator=nodes.slice(start,i),denominator=nodes.slice(i+1,end);
   if(!numerator.length||!denominator.length)continue;
   nodes.splice(start,end-start,{kind:'math',unit:numerator.some(n=>n.unit),tex:'\\frac{'+bare(numerator)+'}{'+bare(denominator)+'}'});i=start;
  }
  return join(nodes);
 }
 function toTex(source){
  const s=normalize(source);let at=0;
  function sequence(until){
   const nodes=[];
   while(at<s.length){
    const c=s[at];if(until&&c===until){at++;break;}
    if(/\s/.test(c)){at++;continue;}
    if(c==='\u20d7'){at++;const last=nodes.at(-1);if(last)last.tex='\\vec{'+last.tex+'}';continue;}
    if(c==='|'){at++;const inside=sequence('|');nodes.push({kind:'group',inside,preserve:true,tex:'\\left|'+inside+'\\right|'});continue;}
    if('½¼¾'.includes(c)){at++;const [n,d]={'½':[1,2],'¼':[1,4],'¾':[3,4]}[c];nodes.push({kind:'math',tex:'\\frac{'+n+'}{'+d+'}'});continue;}
    if(c==="'"){
     let count=0;while(s[at]==="'"){count++;at++;}const last=nodes.at(-1);if(last)last.tex+='^{'+Array(count).fill('\\prime').join(' ')+'}';continue;
    }
    if(c==='_'||c==='^'){
     at++;let value;
     if(s[at]==='{'||s[at]==='('){const open=s[at],close=open==='{'?'}':')';let depth=1,start=++at;while(at<s.length&&depth){if(s[at]===open)depth++;if(s[at]===close)depth--;if(depth)at++;}value=s.slice(start,at);at++;}
     else{const m=s.slice(at).match(c==='^'?/^[+−-]?\d+(?:\.\d+)?|^[\p{L}\p{N}]+/u:/^[\p{L}\p{N}]+/u);value=m?.[0]||s[at++]||'';if(m)at+=value.length;}
     const last=nodes.at(-1);if(last){const label=window.PraxisI18n?.tr(value)??value;const script=c==='_'&&/^[\p{L}]{2,}$/u.test(value)&&!['nm','mn'].includes(value)?'\\text{'+escape(label)+'}':toTex(value);last.tex+=c+'{'+script+'}';}
     continue;
    }
    if(c==='√'){
     at++;let argument;
     if('({['.includes(s[at])){const open=s[at++],close={'(':')','{':'}','[':']'}[open];argument=sequence(close);}
     else{const number=s.slice(at).match(/^\d+(?:[.,]\d+)?/);if(number){argument=number[0].replace(',','{,}');at+=number[0].length;}else argument=greek[s[at]]?'\\'+greek[s[at++]]:s[at++]||'';}
     nodes.push({kind:'math',tex:'\\sqrt{'+argument+'}'});continue;
    }
    if('([{'.includes(c)){
     const spaced=/\s/.test(s[at-1]||'');at++;const close={'(':')','{':'}','[':']'}[c],inside=sequence(close);
     nodes.push({kind:'group',inside,spaced,tex:c==='{'?'{'+inside+'}':'\\left'+c+inside+'\\right'+close});continue;
    }
    const number=s.slice(at).match(until===']'?/^\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?/:/^\d+(?:[.,]\d+)?(?:[eE][+\-]?\d+)?/);
    if(number){const tex=number[0].replace(',','{,}').replace(/[eE]([+\-]?\d+)$/,' \\times 10^{$1}');nodes.push({kind:'math',tex});at+=number[0].length;continue;}
    const unit=s.slice(at).match(/^(?:µW|μW|mW|kW|kN|Ns|GPa|MPa|kPa|kHz|Hz|kg|km|cm|mm|ms|dB|rad|Pa|N|W|J|m|s|h)(?![\p{L}])/u),prev=nodes.at(-1);
    const numeric=/^\d/.test(prev?.tex||''),unitQuotient=prev?.kind==='slash'&&nodes.at(-2)?.unit;
    if(unit&&(numeric||unitQuotient||(['Hz','dB','GPa','MPa','kPa'].includes(unit[0])&&prev))){nodes.push({kind:'math',unit:true,boundaryBefore:!unitQuotient,tex:'\\mathrm{'+unit[0]+'}'});at+=unit[0].length;continue;}
    const func=s.slice(at).match(/^(?:arcsin|arccos|arctan|arctg|tanh|sinh|cosh|sin|cos|tan|cot|ctg|tg|log|ln|exp|abs)(?![A-Za-z])/);
    if(func){nodes.push({kind:'function',tex:'\\'+({tg:'tan',ctg:'cot',arctg:'arctan'}[func[0]]||func[0])});at+=func[0].length;continue;}
    const word=s.slice(at).match(/^[A-Za-zÀ-žȘșȚț]+/u);
    if(word&&(word[0].length>=3||(connectors.has(word[0])&&(!at||/\s/.test(s[at-1]||''))&&/\s/.test(s[at+word[0].length]||'')))){const translated=window.PraxisI18n?.tr(word[0])??word[0];nodes.push({kind:'text',tex:'\\text{'+escape(translated)+' }'});at+=word[0].length;continue;}
    at++;
    if(c==='/'){nodes.push({kind:'slash',tex:'/'});continue;}
    const kind=/[=+−\-±∓<>≈≠≤≥∝≪≫~.,;:→⇒–—]/.test(c)?'stop':/[·×*]/.test(c)?'multiply':'math';
    let tex=greek[c]?'\\'+greek[c]:symbols[c]??c;
    if(c==='*')tex='\\cdot';
    if(c==='~')tex='\\sim';if(c==='≪')tex='\\ll';if(c==='≫')tex='\\gg';
    if(/[&$#\\]/.test(c))tex='\\text{'+escape(c)+'}';
    nodes.push({kind,tex});
   }
   return reduce(nodes);
  }
  return sequence();
 }
 function statements(source){
  const parts=[];let depth=0,last=0,absolute=false;
  for(let i=0;i<source.length;i++){
   const c=source[i];if('([{'.includes(c))depth++;if(')]}'.includes(c))depth=Math.max(0,depth-1);
   const proseLabel=c===':'&&/[\p{L}]{3}/u.test(source.slice(last,i));
   let separator=false;
   if(c==='|'){
    const spaced=/\s/.test(source[i-1]||'')&&/\s/.test(source[i+1]||''),before=source.slice(last,i).trim(),close=source.indexOf('|',i+1),inside=close<0?'':source.slice(i+1,close),after=close<0?'':source.slice(close+1).trimStart();
    const opens=!before||/[=+−\-*/·∝(]$/.test(before)||!spaced||(close>=0&&!/[=≈<>≤≥]/.test(inside)&&/^[\/^²³]/.test(after));
    separator=!absolute&&spaced&&!opens;
    if(!separator)absolute=!absolute;
   }
   const nextQuantity=!depth&&/\s/.test(c)&&/[=≈∝]/.test(source.slice(last,i))&&/^(?:[A-Za-zΑ-ω]{1,2}(?:[0-9]+|_\{[^}]+\}|_[\p{L}\p{N}]+|[₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+)?(?:\([^()]*\))?)\s*[=≈∝]/u.test(source.slice(i+1).trimStart());
   if(!depth&&!absolute&&(c===';'||c==='⇒'||proseLabel||separator||nextQuantity||(c===','&&!(/\d/.test(source[i-1]||'')&&/\d/.test(source[i+1]||'')))||(c==='.'&&source[i+1]===' '))){const part=source.slice(last,i+(proseLabel?1:0)).trim();if(part)parts.push(part);last=i+1;}
  }
  const final=source.slice(last).trim();if(final)parts.push(final);return parts;
 }
 function assignment(source){return source.match(/(?<![\p{L}\p{N}_])(?:(?:[ΔΣ]\s*)?[A-Za-zΑ-ω](?:\u20d7)?(?:_\{[^}]+\}|_[\p{L}\p{N}]+|[₀-₉ₙₒₐₑₕᵢⱼₖₗₘₚᵣₛₜᵤᵥₓᵧ]+)?(?:\([^)]{0,100}\))?['′]*)(?:\s*[/·*]\s*[A-Za-zΑ-ω])?\s*[=≈∝<>≤≥]/u);}
 // Find prose before the entire left side, not before the last symbol near '='.
 // In particular, sin(i)/sin(r) and m*x''+c*x'+k*x must stay intact.
 function expressionStart(part){
  const relation=part.search(/[=≈∝<>≤≥≠]/u);if(relation<0)return 0;
  const left=part.slice(0,relation),masked=left.replace(/_\{[^}]*\}|_[\p{L}\p{N}]+/gu,m=>' '.repeat(m.length));
  const functions=new Set(['sin','cos','tan','cot','tg','ctg','arctg','sinh','cosh','tanh','arcsin','arccos','arctan','log','ln','exp','abs','midi','const']);let end=0;
  for(const m of masked.matchAll(/[A-Za-zÀ-žȘșȚț]{2,}/gu))if((m[0].length>=3||connectors.has(m[0]))&&!functions.has(m[0]))end=m.index+m[0].length;
  if(!end||!/[A-Za-zΑ-ω]/u.test(left.slice(end)))return 0;
  while(/\s/.test(part[end]||''))end++;
  return end;
 }
 function render(source){
  return statements(source.replace(/\s+(xilofon|xylophone|tobă|drum)$/iu,'; $1')).map(raw=>{
   const part=window.PraxisI18n?.tr(raw)??raw;
   if(!/[=≈∝/√_^₀-₉⁰-⁹]/u.test(part)||/\p{Extended_Pictographic}/u.test(part))return '<span class="wave-math-prose">'+htmlProse(part)+'</span>';
   if(!assignment(part)&&/[A-Za-zÀ-žȘșȚț]{3,}/u.test(part.replace(/tanh|sinh|cosh|sin|cos|tan|exp|log|ln/g,'')))return '<span class="wave-math-prose">'+htmlProse(part)+'</span>';
   const start=expressionStart(part),prefix=start?part.slice(0,start):'';
   let expression=part.slice(start),suffix='';
   // Prose following a short equation must wrap as ordinary text, not become
   // an unbreakable mtext tail inside the mathematical expression.
   let depth=0;
   for(let i=0;i<expression.length;i++){
    if('([{'.includes(expression[i]))depth++;
    if(')]}'.includes(expression[i]))depth=Math.max(0,depth-1);
    if(!depth&&/\s/.test(expression[i])&&/^(?:\s+(?:este|sunt|is|are|where|unde|pentru|for|depinde|depends|dispersivă|dispersive|cu|with|la|at|în|in|și|and|se|if|dacă|fără|without|sau|or)(?=\s|$|[,.;])|\s+[—–]\s+)/u.test(expression.slice(i))){suffix=expression.slice(i);expression=expression.slice(0,i);break;}
   }
   const annotation=expression.match(/\s+(?:(?:castron|bowl|xilofon|xylophone|tobă|drum)\b(?:\s+\([^)]*\))?|\([^()]*[A-Za-zÀ-žȘșȚț]{4,}[^()]*\))\.?$/iu);
   if(annotation&&!/\b(?:sin|cos|tanh|sinh|cosh|exp|log)\b/.test(annotation[0])){suffix=annotation[0]+suffix;expression=expression.slice(0,annotation.index);}
   try{return (prefix?'<span class="wave-math-prose">'+htmlProse(prefix)+'</span>':'')+'<span class="wave-math-item">'+(window.PraxisRenderMath||window.katex.renderToString)('\\displaystyle '+toTex(expression),{throwOnError:true,strict:'ignore',trust:false,output:'mathml'})+'</span>'+(suffix?'<span class="wave-math-prose">'+htmlProse(suffix.trim())+'</span>':'');}
   catch(error){return '<span class="wave-math-error" role="alert" title="'+htmlEscape(error.message).replaceAll('"','&quot;')+'">'+htmlEscape(part)+'</span>';}
  }).join('');
 }
 function flatten(value){
  if(value==null||typeof value==='boolean')return '';
  if(typeof value==='string'||typeof value==='number')return String(value);
  if(Array.isArray(value))return value.map(flatten).join('');
  const p=value.props||{};if(value.type==='sub')return '_{'+flatten(p.children)+'}';if(value.type==='sup')return '^{'+flatten(p.children)+'}';if(value.type==='br')return ' ; ';
  return flatten(p.children);
 }
 function inline(value){
  if(value==null||typeof value==='boolean'||typeof value==='string'||typeof value==='number')return true;
  if(Array.isArray(value))return value.every(inline);
  if(value.props?.contentEditable||value.props?.dangerouslySetInnerHTML)return false;
  return ['span','b','strong','i','em','sub','sup','br'].includes(value.type)&&inline(value.props?.children);
 }
 function formula(source){
  if(source.includes('Celulele sunt editabile'))return false;
  if(!/[=≈∝]/.test(source)||/\p{Extended_Pictographic}/u.test(source))return false;
  if(assignment(source)&&/[\/√^_₀-₉⁰-⁹]/u.test(source))return true;
  const left=source.split(/[=≈∝]/)[0].split(':').at(-1).replace(/_\{[^}]+\}|_[\p{L}\p{N}]+/gu,'').replace(/sin|cos|tan|log|exp/g,'');
  return !/[\p{L}]{3}|\p{Extended_Pictographic}/u.test(left)&&left.trim().length<50;
 }
 function isBare(source){
  const value=String(source).trim();
  if(value.startsWith('/'))return false;
  if(!/[\/√]/u.test(value)||!/[\p{L}\p{N}]/u.test(value))return false;
  if(/^(?:[kmc]?m|rad|kg|W|N)\/(?:s|h|m|kg)(?:[²³⁻¹\d]+)?$/u.test(value))return false;
  const words=value.replace(/_\{[^}]+\}|_[\p{L}\p{N}]+/gu,'').replace(/tanh|sinh|cosh|sin|cos|tan|log|exp|ln/g,'');
  return !/[\p{L}]{3}|[^\p{L}\p{N}\s_.(){}[\]\/+−\-^·*|=≈√%]/u.test(words);
 }
 const listeners=new Set();for(const event of ['praxis-language-change','praxis-math-ready'])window.addEventListener(event,()=>{for(const fn of listeners)fn();});
 window.PraxisWaveMath={toTex,statements,render,flatten,inline,formula,bare:isBare,subscribe:fn=>(listeners.add(fn),()=>listeners.delete(fn)),language:()=>window.PraxisI18n?.language||'ro',revision:()=>(window.PraxisI18n?.language||'ro')+'|'+Boolean(window.katex)};
})();
