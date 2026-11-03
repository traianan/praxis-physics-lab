/* JSON namespaces shared by all Praxis pages. */
(() => {
 if(window.PraxisI18n)return;
 const supported=['ro','en'],cache=new Map(),sourceNodes=new WeakMap(),sourceAttrs=new WeakMap();
 let language='ro',messages={},patterns=[],namespaces=[],base='./locales/',revision=0,courseMode=false,fragments=null,contexts=[],memo=new Map();
 try{const saved=localStorage.getItem('praxis-language');if(supported.includes(saved))language=saved;}catch{}
 const escape=s=>s.replace(/[.*+?^{}$()|[\]\\]/g,'\\$&');
 const normal=s=>String(s).replace(/\s+/g,' ').trim();
 const substitute=(text,values)=>text.replace(/\{([a-zA-Z][\w]*)\}/g,(all,key)=>String(values[key]??all));
 function compose(){
  messages={};contexts=[];memo.clear();
  for(const ns of namespaces){const data=cache.get(language+':'+ns);Object.assign(messages,data?.messages||{});contexts.push(...(data?.contexts||[]));}
  patterns=[];
  for(const [key,value]of Object.entries(messages)){
   const matches=[...key.matchAll(/\{([a-zA-Z][\w]*)\}/g)];if(!matches.length)continue;
   let last=0,regex='^';const pieces=[];
   for(const match of matches){const piece=key.slice(last,match.index);pieces.push(piece);regex+=escape(piece)+'(.+?)';last=match.index+match[0].length;}
   pieces.push(key.slice(last));regex+=escape(key.slice(last))+'$';
   patterns.push({regex:new RegExp(regex),names:matches.map(m=>m[1]),value,specificity:pieces.join('').length,anchor:pieces.sort((a,b)=>b.length-a.length)[0]});
  }
  patterns.sort((a,b)=>b.specificity-a.specificity);
  const keys=courseMode?Object.keys(messages).filter(k=>k.length>=10&&!k.includes('{')&&messages[k]!==k).sort((a,b)=>b.length-a.length):[];
  fragments=keys.length?new RegExp(keys.map(key=>(/[\p{L}\p{N}_]/u.test(key[0])?'(?<![\\p{L}\\p{N}_])':'')+escape(key)+(/[\p{L}\p{N}_]/u.test(key.at(-1))?'(?![\\p{L}\\p{N}_])':'')).join('|'),'gu'):null;
  document.documentElement.lang=language;
 }
 function translate(text,depth=0){
  text=String(text??'');if(Object.hasOwn(messages,text))return messages[text];
  const normalized=normal(text);if(Object.hasOwn(messages,normalized))return messages[normalized];
  if(depth>5)return text;if(depth===0&&memo.has(text))return memo.get(text);
  let value=text;
  if(!courseMode||/[ăâîșțĂÂÎȘȚ]|[A-Za-z]{3}/.test(normalized)){
   for(const pattern of patterns){
    if(pattern.anchor&&!normalized.includes(pattern.anchor))continue;
    const match=normalized.match(pattern.regex);if(!match)continue;
    const candidate=substitute(pattern.value,Object.fromEntries(pattern.names.map((key,i)=>{const raw=match[i+1],trimmed=raw.trim();return [key,courseMode?(trimmed?raw.replace(trimmed,translate(trimmed,depth+1)):raw):(messages[raw]??raw)];})));
    if(candidate!==normalized){value=candidate;break;}
   }
   if(value===text&&fragments&&language==='en')value=normalized.replace(fragments,key=>messages[key]);
  }
  if(courseMode&&language==='en'&&/^[−+-]?\d+,\d+(?:\s*(?:%|°|m|s|h|km|m\/s|m\/s²))?$/.test(value))value=value.replace(',','.');
  if(depth===0){if(memo.size>5000)memo.clear();memo.set(text,value);}return value;
 }
 function tr(text,values){return values?substitute(messages[text]??text,values):translate(text);}
 function apply(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){
   if(node.parentElement?.closest('script,style,code,pre,.katex,[contenteditable],[data-no-i18n]'))continue;
   let entry=sourceNodes.get(node);if(!entry||node.data!==entry.last)entry={source:node.data,last:node.data};
   const trimmed=entry.source.trim();let translated=trimmed?tr(trimmed):trimmed;
   if(courseMode){const rule=contexts.find(rule=>rule.source===trimmed&&node.parentElement?.matches(rule.selector));if(rule)translated=rule.translation;}
   const value=trimmed?entry.source.replace(trimmed,translated):entry.source;
   if(node.data!==value)node.data=value;entry.last=value;sourceNodes.set(node,entry);
  }
  for(const element of root.querySelectorAll?.('[title],[aria-label],[aria-valuetext],[placeholder],[alt],meta[name="description"]')||[]){
   if(element.closest('.katex'))continue;const attrs=sourceAttrs.get(element)||{};
   for(const key of ['title','aria-label','aria-valuetext','placeholder','alt',...(element.tagName==='META'?['content']:[])]){
    if(!element.hasAttribute(key))continue;const current=element.getAttribute(key);let entry=attrs[key];if(!entry||current!==entry.last)entry={source:current,last:current};
    const value=tr(entry.source);if(current!==value)element.setAttribute(key,value);entry.last=value;attrs[key]=entry;
   }sourceAttrs.set(element,attrs);
  }
  for(const select of document.querySelectorAll('[data-language-select]'))if(select.value!==language)select.value=language;
 }
 async function load(lang,ns){const key=lang+':'+ns;if(!cache.has(key)){const response=await fetch(new URL(ns+'/'+lang+'.json',new URL(base,location.href)));if(!response.ok)throw new Error('Missing translation: '+ns+'/'+lang);cache.set(key,await response.json());}return cache.get(key);}
 async function init({baseUrl='./locales/',namespaceList=['common'],embedded}={}){base=baseUrl;namespaces=namespaceList;if(embedded)for(const [lang,files]of Object.entries(embedded))for(const [ns,data]of Object.entries(files))cache.set(lang+':'+ns,data);await Promise.all(namespaces.map(ns=>load(language,ns)));compose();apply(document);return language;}
 function initEmbedded({namespaceList,embedded}){namespaces=namespaceList;for(const [lang,files]of Object.entries(embedded))for(const [ns,data]of Object.entries(files))cache.set(lang+':'+ns,data);compose();}
 async function setLanguage(lang){
  if(!supported.includes(lang)||lang===language)return;const seq=++revision;for(const select of document.querySelectorAll('[data-language-select]'))select.disabled=true;
  try{await Promise.all(namespaces.map(ns=>load(lang,ns)));if(seq!==revision)return;language=lang;try{localStorage.setItem('praxis-language',lang);}catch{}compose();apply(document);window.dispatchEvent(new CustomEvent('praxis-language-change',{detail:{language}}));apply(document);}
  finally{for(const select of document.querySelectorAll('[data-language-select]'))select.disabled=false;}
 }
 function createSelector(){const select=document.createElement('select');select.className='praxis-language';select.dataset.languageSelect='';select.setAttribute('aria-label','Limba interfeței');for(const lang of supported)select.add(new Option(lang.toUpperCase(),lang));select.value=language;select.addEventListener('change',()=>{setLanguage(select.value).catch(()=>{select.value=language;window.dispatchEvent(new CustomEvent('praxis-language-error'));});});return select;}
 window.PraxisI18n={init,initEmbedded,tr,translate:tr,apply,setLanguage,createSelector,sourceText(node){const entry=sourceNodes.get(node);return entry&&entry.last===node.data?entry.source:node.data;},enableCourseMode(){courseMode=true;compose();},get language(){return language;},get locale(){return language==='en'?'en-GB':'ro-RO';},getNamespace(ns){return cache.get(language+':'+ns);}};
})();
