"""Survey assessment prompts across registered laboratories with agent-browser."""
import base64,json,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXE=pathlib.Path.home()/'AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
OUT=ROOT/'outputs/question-typography';OUT.mkdir(parents=True,exist_ok=True)
def cmd(*args):
 p=subprocess.run([str(EXE),'--session','question-typography','--json',*map(str,args)],cwd=ROOT,capture_output=True,encoding='utf-8')
 d=json.loads(p.stdout)
 if p.returncode or not d.get('success'):raise RuntimeError(d)
 return d.get('data',{})
def js(s):return cmd('eval','-b',base64.b64encode(s.encode()).decode()).get('result')
report=[]
cmd('set','viewport',1366,768)
for lab in json.loads((ROOT/'labs.manifest.json').read_text(encoding='utf-8'))['labs']:
 m=lab['metadata'];cmd('open','http://127.0.0.1:4189/'+m['href'].removeprefix('./'))
 row=js('''(async()=>{
 const frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await frame();
 if(window.PraxisI18n)await PraxisI18n.setLanguage('ro');document.documentElement.style.fontSize='16px';
 const tabs=[...document.querySelectorAll('[role=tab],[data-tab],nav.toc a,.tabs button,.lesson-tabs button')].filter(e=>/test|verific|exers|evalu|quiz|practice|assess/i.test(e.textContent));
 for(const tab of tabs){tab.click();await frame();}
 const regions=[...document.querySelectorAll('[class*=quiz],[id*=quiz],[class*=test],[id*=test],[id*=assessment],[class*=question],[data-exercise]')];
 const nodes=[...new Set(regions.flatMap(r=>[r,...r.querySelectorAll('h2,h3,h4,p,legend,.q,.q-text,.qtext,.question-text,.question-title,.question-prompt,.quiz-question,.quiz-q,form[data-exercise]>label')]))];
 const prompts=nodes.filter(e=>{const s=e.textContent.trim();return s.length>10&&s.length<650&&!e.querySelector('button,input,select,textarea')&&!e.matches('[data-content-type=assessment],.quiz-intro')&&(e.matches('legend,.q-text,.qtext,.question-text,.question-title,.question-prompt,.quiz-question,.quiz-q,.quiz>.q,.q>h3,.q>h4,.q-head h2,.q-head h3,form[data-exercise]>label')||/[?…]/.test(s));});
 const sizes=[];for(const scale of [100,200]){document.documentElement.style.fontSize=(16*scale/100)+'px';await frame();sizes.push({scale,prompts:prompts.map(e=>({tag:e.tagName,id:e.id,cls:e.className,font:parseFloat(getComputedStyle(e).fontSize),weight:getComputedStyle(e).fontWeight,line:getComputedStyle(e).lineHeight,text:e.textContent.trim().slice(0,100)}))});}
 return {tabs:tabs.length,sizes};})()''')
 report.append({'id':m['id'],**row});(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(m['id']+': '+str(len(row['sizes'][0]['prompts']))+' prompts',flush=True)
cmd('close')
