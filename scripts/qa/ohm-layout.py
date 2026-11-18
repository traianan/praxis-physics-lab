"""Full Ohm activity layout audit using the installed agent-browser (no dependencies installed)."""
import base64,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXE=pathlib.Path.home()/'AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
SESSION='ohm-layout-20261118';BASE=os.environ.get('PRAXIS_QA_BASE','http://127.0.0.1:4193')
OUT=ROOT/'outputs/ohm-layout';OUT.mkdir(parents=True,exist_ok=True)
def cmd(*args):
 p=subprocess.run([str(EXE),'--session',SESSION,'--json',*map(str,args)],capture_output=True,encoding='utf-8',cwd=ROOT)
 d=json.loads(p.stdout)
 if p.returncode or not d.get('success'):raise RuntimeError(d)
 return d.get('data',{})
def js(s):return cmd('eval','-b',base64.b64encode(s.encode()).decode()).get('result')
report={'layouts':[]}
cmd('open',BASE+'/simulari/legea-lui-ohm/')
js("[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Doar necesare')?.click()")
cmd('errors','--clear')
for width,height,dpr in [(1920,1080,2),(3840,2160,1),(1366,768,1),(1024,768,1),(390,844,3)]:
 cmd('set','viewport',width,height,dpr)
 rows=js(r'''(async()=>{
 const $=s=>document.querySelector(s),wait=()=>new Promise(r=>setTimeout(r,110)),rows=[];
 const visible=e=>e.checkVisibility()&&e.getBoundingClientRect().width>0;
 const capture=(tab,view,language,size)=>{scrollTo(0,0);const panel=$('.lesson-tab-panel'),r=panel.getBoundingClientRect();
 const cards=[...panel.querySelectorAll('.lab-chart-card,.lab-side,.circuit-controls,.rheostat-controls,.measure-controls,.problem-body,.calculator-card,.method-card,.explain-card,.recap-card,.lesson-plan,.links-panel')].filter(visible);
 const tight=cards.filter(e=>Math.min(...['paddingTop','paddingRight','paddingBottom','paddingLeft'].map(k=>parseFloat(getComputedStyle(e)[k])))<8).map(e=>e.className);
 const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);let previous=0;const headingJumps=[];for(const h of hs){const level=Number(h.tagName[1]);if(previous&&level>previous+1)headingJumps.push(h.textContent);previous=level;}
 const nodes=[...panel.querySelectorAll('.react-flow__node')],overlaps=nodes.flatMap((a,i)=>nodes.slice(i+1).filter(b=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.left<y.right&&y.left<x.right&&x.top<y.bottom&&y.top<x.bottom}).map(b=>[a.dataset.id,b.dataset.id]));
 rows.push({width:innerWidth,height:innerHeight,language,size,tab,view,top:r.top,bottom:r.bottom,overflow:document.documentElement.scrollWidth>innerWidth+1,tight,headingJumps,overlaps});};
 for(const language of ['ro','en'])for(const size of [100,200]){
 await PraxisI18n.setLanguage(language);const s=$('.praxis-course-settings select');s.value=String(size);s.dispatchEvent(new Event('change'));await wait();
 for(const t of document.querySelectorAll('.lesson-tab')){t.click();await wait();
 const pages=[...document.querySelectorAll('.ohm-page-tabs button')];
 const choices=pages.length?pages:[...document.querySelectorAll('.ohm-problem-choices button,.calculator-tabs button')];
 if(!choices.length){await wait();capture(t.id,'default',language,size);}
 else for(let i=0;i<choices.length;i++){choices[i].click();await wait();capture(t.id,String(i),language,size);}
 }
 }return rows;})()''')
 report['layouts'].extend(rows)
 (OUT/'layout-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 bad=[r for r in rows if r['overflow']or r['tight']or r['headingJumps']or r['overlaps']]
 tall=[(r['tab'],r['view'],round(r['bottom']))for r in rows if r['size']==100 and r['bottom']>height]
 print(width,'states',len(rows),'issues',json.dumps(bad,ensure_ascii=True),'tall100',tall,flush=True)
 # Capture every activity at classroom size in Romanian, normal text.
 if width==1920:
  js("(async()=>{await PraxisI18n.setLanguage('ro');const s=document.querySelector('.praxis-course-settings select');s.value='100';s.dispatchEvent(new Event('change'));})()")
  tabs=js("[...document.querySelectorAll('.lesson-tab')].map(e=>e.id)")
  for tab in tabs:
   js("document.getElementById('"+tab+"').click()")
   count=js("document.querySelectorAll('.ohm-page-tabs button').length")
   for i in range(max(1,count)):
    if count:js("document.querySelectorAll('.ohm-page-tabs button')["+str(i)+"].click()")
    cmd('wait',180)
    js('scrollTo(0,0)')
    cmd('screenshot',OUT/f'{tab}-{i}.png')
report['errors']=cmd('errors');(OUT/'layout-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
assert not report['errors'].get('errors'),report['errors']
assert all(not(r['overflow']or r['tight']or r['headingJumps']or r['overlaps'])for r in report['layouts']),'layout findings'
print('PASS',len(report['layouts']),'states',flush=True)

assert all(r['bottom']<=r['height']+1 for r in report['layouts']if r['width']>=1920 and r['size']==100), 'classroom page exceeds viewport'
