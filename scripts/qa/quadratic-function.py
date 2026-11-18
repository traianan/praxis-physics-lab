"""Focused browser checks using the installed agent-browser CLI, without extra dependencies."""
import base64,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXE=pathlib.Path.home()/'AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
SESSION=os.environ.get('PRAXIS_QA_SESSION','quadratic-final-20261118')
BASE=os.environ.get('PRAXIS_QA_BASE','http://127.0.0.1:4190').rstrip('/')
OUT=ROOT/'outputs'/os.environ.get('PRAXIS_QA_REPORTDIR','quadratic-review');OUT.mkdir(parents=True,exist_ok=True)
report={}
def cmd(*args):
 p=subprocess.run([str(EXE),'--session',SESSION,'--json',*map(str,args)],cwd=ROOT,capture_output=True,encoding='utf-8')
 data=json.loads(p.stdout)
 if p.returncode or not data.get('success'):raise RuntimeError(data)
 return data.get('data',{})
def js(source):return cmd('eval','-b',base64.b64encode(source.encode()).decode()).get('result')
def save(): (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
cmd('open',BASE+'/simulari/functia-gradul-al-doilea/index.html')
js("[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Doar necesare')?.click()")
report['functional']=js((ROOT/'scripts/adaptations/quadratic-function-qa.js').read_text(encoding='utf-8'))
if report['functional']['failures']:raise RuntimeError(report['functional']['failures'])
report['integration']=js("""(async()=>{const a=(v,m)=>{if(!v)throw Error(m)},frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));a(document.querySelectorAll('h1').length===1,'one lesson title');a(document.body.hasAttribute('data-praxis-adaptive-lab'),'native board layout');a([...document.querySelectorAll('a')].some(x=>x.href.includes('capitol/elemente-de-matematica')),'mathematics chapter return');a(document.querySelector('#prefsPanel').closest('.praxis-course-tools'),'shared preferences');const link=document.querySelector('#btnDownload');const response=await fetch(link.href,{method:'HEAD'});a(response.ok,'download ZIP exists');document.querySelector('[data-tab=animatii]').click();document.querySelector('[data-anim=roots]').click();if(/Pauz|Pause/.test(document.querySelector('#btnPlay').textContent))document.querySelector('#btnPlay').click();const snapshot=()=>JSON.stringify(['slA','slB','slC'].map(id=>document.getElementById(id).value).concat(document.querySelector('#animProgress').textContent)),state=snapshot(),before=document.querySelector('#svgAnim svg');document.querySelector('#optGrid').checked=false;document.querySelector('#optGrid').dispatchEvent(new Event('change'));await frame();a(document.querySelector('#svgAnim svg')!==before,'paused graph redraws with preferences');a(state===snapshot(),'redraw preserves animation state');await PraxisI18n.setLanguage('en');await frame();a(state===snapshot(),'language preserves paused state');await PraxisI18n.setLanguage('ro');document.querySelector('[data-tab=teorie]').click();return{download:response.status,checks:7}})()""")
js("""(()=>{document.querySelector('#optGrid').checked=true;document.querySelector('#optGrid').dispatchEvent(new Event('change'));document.querySelector('[data-tab=fizica]').click();document.querySelector('[data-phys=proj]').click();for(const [id,value]of [['slV0',20],['slTh',45],['slG',9.81]]){const input=document.getElementById(id);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('[data-tab=teorie]').click();document.querySelector('[data-preset="1,-2,-3"]').click();})()""")
report['layouts']=[]
for w,h,dpr in [(1920,1080,2),(3840,2160,1),(1366,768,1),(1024,768,1),(390,844,1)]:
 cmd('set','viewport',w,h,dpr)
 rows=js("""(async()=>{const rows=[],frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));PraxisCourseLocalization.setTouch(true);for(const language of ['ro','en'])for(const scale of [100,200]){await PraxisI18n.setLanguage(language);const size=document.querySelector('.praxis-course-settings select');size.value=String(scale);size.dispatchEvent(new Event('change'));for(const tab of ['teorie','animatii','fizica']){document.querySelector('[data-tab='+tab+']').click();await frame();await frame();scrollTo(0,0);const panel=document.querySelector('#tab-'+tab),grid=panel.querySelector('.grid2'),box=grid.getBoundingClientRect(),visible=e=>e.checkVisibility()&&!e.closest('details:not([open]),[hidden],[inert]');rows.push({language,scale,tab,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,touch:document.documentElement.dataset.courseTouch,overflow:document.documentElement.scrollWidth>innerWidth+1,bottom:box.bottom,mathErrors:panel.querySelectorAll('.science-math-error').length,outside:[...panel.querySelectorAll('button,input,select')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5}).map(e=>e.id)});}}return rows})()""")
 report['layouts'].extend(rows);save();
 if any(r['dpr']!=dpr for r in rows):raise RuntimeError('Unexpected display density')
 cmd('screenshot',OUT/f'layout-{w}.png');print('Layout',w,len(rows),sum(bool(r['overflow'] or r['outside'] or r['mathErrors'])for r in rows),flush=True)
report['errors']=cmd('errors');save();cmd('close')
issues=[r for r in report['layouts'] if r['overflow'] or r['outside'] or r['mathErrors'] or (r['width']>=1920 and r['scale']==100 and r['bottom']>r['height']+1)]
if issues:raise RuntimeError(issues)
print('Functional',len(report['functional']['checks']),'checks; integration',report['integration'],flush=True)
