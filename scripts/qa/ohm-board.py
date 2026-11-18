"""Ohm board regressions: real Canvas text bounds and concept-map interactions."""
import base64,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXE=pathlib.Path.home()/'AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
SESSION='ohm-board-3ed80a967f29';BASE=os.environ.get('PRAXIS_QA_BASE','http://127.0.0.1:4193')
OUT=ROOT/'outputs/ohm-board';OUT.mkdir(parents=True,exist_ok=True)
def cmd(*args):
 p=subprocess.run([str(EXE),'--session',SESSION,'--json',*map(str,args)],capture_output=True,encoding='utf-8',cwd=ROOT)
 d=json.loads(p.stdout)
 if p.returncode or not d.get('success'):raise RuntimeError(d)
 return d.get('data',{})
def js(s):return cmd('eval','-b',base64.b64encode(s.encode()).decode()).get('result')
report={'layouts':[]}
def save():(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
cmd('errors','--clear');cmd('open',BASE+'/simulari/legea-lui-ohm/index.html')
cmd('wait','--fn','document.querySelectorAll(".lesson-tab").length===10')
js('''(()=>{
 const p=CanvasRenderingContext2D.prototype,records=window.ohmDrawings=new Map();
 const take=ctx=>{if(!records.has(ctx.canvas))records.set(ctx.canvas,{labels:[],shapes:[]});return records.get(ctx.canvas);};
 const clear=p.clearRect;p.clearRect=function(...a){records.set(this.canvas,{labels:[],shapes:[]});return clear.apply(this,a);};
 const text=p.fillText;p.fillText=function(t,x,y,...args){const m=this.measureText(t);take(this).labels.push({text:String(t),x:x-m.actualBoundingBoxLeft,y:y-m.actualBoundingBoxAscent,w:m.actualBoundingBoxLeft+m.actualBoundingBoxRight,h:m.actualBoundingBoxAscent+m.actualBoundingBoxDescent});return text.call(this,t,x,y,...args);};
 const rect=p.strokeRect;p.strokeRect=function(x,y,w,h){take(this).shapes.push({kind:'resistor',x,y,w,h});return rect.call(this,x,y,w,h);};
 const arc=p.arc;p.arc=function(x,y,r,...a){if(r>=14&&r<=18)take(this).shapes.push({kind:'meter',x:x-r,y:y-r,w:2*r,h:2*r});return arc.call(this,x,y,r,...a);};
})()''')
for width,height,dpr in [(3840,2160,1),(1920,1080,2),(1366,768,1),(1024,768,1),(390,844,3)]:
 cmd('set','viewport',width,height,dpr)
 rows=js(r'''(async()=>{
 const $=s=>document.querySelector(s),frames=async(n=4)=>{for(let i=0;i<n;i++)await new Promise(r=>requestAnimationFrame(r));},rows=[];
 const intersects=(a,b)=>a.x+a.w>b.x+1&&b.x+b.w>a.x+1&&a.y+a.h>b.y+1&&b.y+b.h>a.y+1;
 for(const language of ['ro','en'])for(const size of [100,200]){
 await PraxisI18n.setLanguage(language);const select=$('.praxis-course-settings select');select.value=String(size);select.dispatchEvent(new Event('change'));await frames();
 for(const tab of ['circuit','masurari','harta']){
 $('#lesson-tab-'+tab).click();await frames(15);scrollTo(0,0);
 const canvas=$('.circuit-canvas,.measure-canvas'),drawing=canvas?window.ohmDrawings.get(canvas):null;
 const labels=drawing?.labels.filter(t=>/\d/.test(t.text))||[],shapes=drawing?.shapes||[],h=canvas?.getBoundingClientRect().height,w=canvas?.getBoundingClientRect().width;
 const outside=labels.filter(t=>t.x<0||t.y<0||t.x+t.w>w+.5||t.y+t.h>h+.5);
 const collisions=labels.flatMap(t=>shapes.filter(s=>intersects(t,s)).map(s=>({text:t.text,shape:s.kind,box:t,component:s})));
 const map=$('.concept-map-surface'),nodes=[...document.querySelectorAll('.react-flow__node')];
 const nodeOverlaps=nodes.flatMap((a,i)=>nodes.slice(i+1).filter(b=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom;}).map(b=>[a.dataset.id,b.dataset.id]));
 rows.push({width:innerWidth,height:innerHeight,language,size,tab,overflow:document.documentElement.scrollWidth>innerWidth+1,outside,collisions,nodeOverlaps,mapHeight:map?.getBoundingClientRect().height,mapBottom:map?.getBoundingClientRect().bottom,nodes:nodes.length,labels:labels.length,canvas:w?{w,h}:null});
 }
 }await PraxisI18n.setLanguage('ro');const s=$('.praxis-course-settings select');s.value='100';s.dispatchEvent(new Event('change'));return rows;})()''')
 report['layouts'].extend(rows);save()
 print(width,[(r['tab'],r['size'],len(r['outside']),len(r['collisions']))for r in rows if r['outside']or r['collisions']or r['overflow']],flush=True)
 js("document.querySelector('#lesson-tab-harta').click()")
 cmd('screenshot',OUT/f'map-{width}.png')
report['interactions']=js('''(async()=>{
 const $=s=>document.querySelector(s),assert=(v,m)=>{if(!v)throw Error(m)},frames=async(n=15)=>{for(let i=0;i<n;i++)await new Promise(r=>requestAnimationFrame(r));};
 $('#lesson-tab-harta').click();await frames();assert(document.querySelectorAll('.react-flow__node').length===7,'seven concepts');
 $('.react-flow__node[data-id=source]').click();await frames();assert($('.concept-detail').textContent.includes('Sursă reală'),'node detail');
 const input=$('.concept-search input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'rezisten');input.dispatchEvent(new Event('input',{bubbles:true}));await frames();assert($('.concept-search-status').textContent.includes('Rezistență'),'search');
 $('.concept-reset').click();await frames();assert(!input.value,'reset search');const before=$('.react-flow__viewport').style.transform;$('.react-flow__controls-zoomin').click();await frames();assert($('.react-flow__viewport').style.transform!==before,'zoom');
 $('.react-flow__node[data-id=source]').click();await frames();$('.concept-open').click();await frames();assert($('#lesson-tab-circuit').getAttribute('aria-selected')==='true','related lesson link');
 $('#lesson-tab-masurari').click();await frames();let modes=0,presets=0;for(const mode of document.querySelectorAll('.measure-mode button')){mode.click();await frames();modes++;for(const preset of document.querySelectorAll('.measure-presets button')){preset.click();await frames();presets++;assert($('.measure-canvas').getBoundingClientRect().height>=280,'reserved label height');}}
 await PraxisI18n.setLanguage('en');await frames();assert($('.measure-canvas-foot').textContent.includes('includes'),'translated measurement note');await PraxisI18n.setLanguage('ro');
 return {nodes:7,search:true,reset:true,zoom:true,relatedSection:true,modes,presets};})()''');save()
report['errors']=cmd('errors');save()
print(json.dumps({'interactions':report['interactions'],'errors':report['errors'].get('errors',[])},ensure_ascii=True),flush=True)
assert all(not(r['outside']or r['collisions']or r['overflow']or r['nodeOverlaps'])for r in report['layouts']), 'layout collision or overflow'
assert not report['errors'].get('errors'), 'JavaScript errors'
