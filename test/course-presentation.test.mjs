import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile,readdir} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
async function catalogs(){const embedded={ro:{},en:{}};for(const course of ['miscarea-rectilinie','calcul-vectorial'])for(const section of await readdir(new URL('../public/locales/courses/'+course+'/',import.meta.url))){const ns='courses/'+course+'/'+section;for(const lang of ['ro','en'])embedded[lang][ns]=JSON.parse(await read('public/locales/'+ns+'/'+lang+'.json'));}return embedded;}
test('all course dictionaries preserve formula chunks and support generated English text',async()=>{
 const embedded=await catalogs();assert.equal(Object.keys(embedded.en).length,22);
 for(const data of Object.values(embedded.en))for(const [source,value]of Object.entries(data.messages)){const math=s=>s.match(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g)||[];assert.deepEqual(math(value),math(source),source);}
 const window={},document={documentElement:{},querySelectorAll:()=>[],createTreeWalker:()=>({nextNode:()=>null})};window.dispatchEvent=()=>{};
 vm.runInNewContext(await read('public/shared/i18n.js'),{window,document,NodeFilter:{SHOW_TEXT:4},CustomEvent:class{},localStorage:{getItem:()=> 'en',setItem(){}},location:{href:'file:///index.html'}});
 const api=window.PraxisI18n;api.initEmbedded({namespaceList:Object.keys(embedded.en),embedded});api.enableCourseMode();
 for(const [ro,en]of [['Masa','Mass'],['Temperatura','Temperature'],['nedefinit','undefined'],['paraleli','parallel'],['medie','medium'],['Produsul mixt și dublul produs vectorial','Scalar and vector triple products']])assert.equal(api.tr(ro),en);
 assert.equal(api.tr('−12,5 m/s'),'−12.5 m/s');assert.equal(api.tr('A 7-a secundă este intervalul de la'),'Second number 7 is the interval from');
 await api.setLanguage('ro');assert.equal(api.tr('Masa'),'Masa');assert.equal(api.tr('−12,5 m/s'),'−12,5 m/s');
});
test('scientific palettes and Canvas labels switch without resetting the simulation',async()=>{
 class Context{fillText(text){this.lastText=text;}strokeText(text){this.lastText=text;}measureText(text){return {width:text.length};}set fillStyle(value){this.fill=value;}get fillStyle(){return this.fill;}set strokeStyle(value){this.stroke=value;}get strokeStyle(){return this.stroke;}}
 const storage=new Map(),document={documentElement:{dataset:{},style:{setProperty(){}}}};let redraws=0;
 const window={CanvasRenderingContext2D:Context,PraxisI18n:{enableCourseMode(){},tr:t=>t==='viteza'?'velocity':t},MR:{redrawAll(){redraws++;}}};
 const context=vm.createContext({window,document,CanvasRenderingContext2D:Context,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:false})});
 vm.runInContext(await read('public/shared/scientific-colors.js'),context);
 vm.runInContext(await read('public/shared/course-localization.js'),context);
 const ctx=new Context(),api=window.PraxisCourseLocalization;ctx.fillText('viteza');assert.equal(ctx.lastText,'velocity');
 ctx.fillStyle='#c8402a';assert.equal(ctx.fillStyle,'#ad453d');api.setColors('vivid');ctx.fillStyle='#b54d45';assert.equal(ctx.fillStyle,'#c61919');ctx.strokeStyle='rgba(31,90,138,0.25)';assert.equal(ctx.strokeStyle,'rgba(0,82,204,0.25)');
 api.setColors('praxis');ctx.fillStyle='#ed2929';assert.equal(ctx.fillStyle,'#ad453d');api.setTouch(true);assert.equal(document.documentElement.dataset.courseTouch,'true');assert.equal(storage.get('praxis-course-touch'),'true');assert.equal(redraws,3);
 document.documentElement.dataset.theme='dark';api.refreshPalette();ctx.fillStyle='#c8402a';assert.equal(ctx.fillStyle,'#f18a82');assert.equal(redraws,4);assert.equal(storage.get('praxis-course-colors'),'praxis');
});
test('imported controls retain pointer interaction and expose enlarged touch targets',async()=>{
 const vector=await read('public/simulari/calcul-vectorial/index.html'),motion=await read('public/simulari/miscarea-rectilinie/js/plot.js');
 for(const content of [vector,motion]){assert.match(content,/pointerdown/);assert.match(content,/setPointerCapture/);}
 const css=await read('public/shared/course.css');assert.match(css,/course-touch=true/);assert.match(css,/min-height:52px/);assert.match(css,/canvas\{touch-action:none/);
 const bridge=await read('public/shared/course.js');assert.match(bridge,/course-colors/);assert.match(bridge,/course-touch/);assert.match(css,/\.big-num/);
 assert.match(await read('public/simulari/miscarea-rectilinie/js/sec4-test.js'),/await window\.PraxisCourseLocalization\.confirm/);
});
