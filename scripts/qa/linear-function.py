"""Focused browser checks using the installed agent-browser CLI, without extra dependencies."""
import base64,json,os,pathlib,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXE=pathlib.Path.home()/'AppData/Roaming/npm/node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
SESSION=os.environ.get('PRAXIS_QA_SESSION','linear-f756ef96dc99')
BASE=os.environ.get('PRAXIS_QA_BASE','http://127.0.0.1:4189').rstrip('/')
OUT=ROOT/'outputs'/os.environ.get('PRAXIS_QA_REPORTDIR','linear-review');OUT.mkdir(parents=True,exist_ok=True)
report={}
def cmd(*args):
 p=subprocess.run([str(EXE),'--session',SESSION,'--json',*map(str,args)],cwd=ROOT,capture_output=True,encoding='utf-8')
 data=json.loads(p.stdout)
 if p.returncode or not data.get('success'):raise RuntimeError(data)
 return data.get('data',{})
def js(source):return cmd('eval','-b',base64.b64encode(source.encode()).decode()).get('result')
def save(): (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
cmd('errors','--clear')
cmd('open',BASE+'/simulari/functia-gradul-intai/index.html')
cmd('wait','--fn','window.PraxisReady===true')
report['functional']=js('''(async()=>{
 const assert=(v,m)=>{if(!v)throw Error(m)},$=s=>document.querySelector(s),frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const input=(s,v)=>{$(s).value=String(v);$(s).dispatchEvent(new Event('input',{bubbles:true}));};
 assert(!PraxisSound.enabled,'sound starts muted');assert(!$('#btnPrefs'),'one preference menu');assert($('#prefsPopover').closest('.praxis-course-tools'),'graph preferences in shared menu');
 Praxis.activateTab('teorie');input('#slopeRange',0);input('#interceptRange',0);assert($('#noteZero').textContent.includes('Orice'),'zero polynomial roots');
 input('#interceptRange',1);assert($('#noteZero').textContent.includes('nu există'),'nonzero constant has no root');
 input('#slopeRange',-2);input('#interceptRange',4);assert($('#noteZero').textContent.includes('2'),'negative slope root');
 const before=JSON.stringify(Praxis.Theory.getState());await PraxisI18n.setLanguage('en');assert(JSON.stringify(Praxis.Theory.getState())===before,'language retains state');await PraxisI18n.setLanguage('ro');
 $('#btnResetTheory').click();Praxis.activateTab('fizica');input('#slR',20);$('[data-model=ohm]').click();input('#slI',.25);assert($('#physNoteValue').textContent.includes('5'),'Ohm: 20*.25=5');
 input('#slI',0);assert($('#physNoteValue').textContent.includes('0'),'Ohm zero current');input('#slR',100);input('#slI',1);assert($('#physNoteValue').textContent.includes('100'),'Ohm extreme');
 for(const model of ['motion','tank','ohm']){$('[data-model='+model+']').click();$('#btnPhysReset').click();$('#btnPhysPlay').click();await frame();assert(Praxis.Physics.getState().playing,'play '+model);Praxis.activateTab('teorie');assert(!Praxis.Physics.getState().playing,'hidden pauses '+model);Praxis.activateTab('fizica');}
 Praxis.activateTab('exerseaza');$('#btnCheckQuiz').click();assert($('#quizScore').textContent.includes('0'),'empty quiz');
 for(const [q,a]of [[1,'3'],[3,'a'],[5,'b'],[6,'b']])$('input[name=q'+q+'][value="'+a+'"]').checked=true;input('#q2',-2);input('#q4',3);$('#btnCheckQuiz').click();assert($('#quizScore').textContent.includes('6 din 6'),'quiz 6/6');
 await PraxisI18n.setLanguage('en');assert($('#quizScore').textContent.includes('6'),'quiz remains answered');$('#btnResetQuiz').click();assert(!$('input[type=radio]:checked'),'quiz reset');await PraxisI18n.setLanguage('ro');
 return {passed:true,zeroCases:true,ohmExtremes:true,hiddenPause:true,quiz:true,languageRetainsState:true};
})()''');save()
report['stability']=js('''(async()=>{
 const $=s=>document.querySelector(s),rows=[];
 for(const mode of ['point','slope','intercept','motion','ohm','tank']){
  const animation=['point','slope','intercept'].includes(mode);Praxis.activateTab(animation?'animatii':'fizica');$('[data-'+(animation?'anim':'model')+'='+mode+']').click();$(animation?'#btnRestart':'#btnPhysReset').click();$(animation?'#btnPlay':'#btnPhysPlay').click();
  const a=[];await new Promise(resolve=>{let n=0;function sample(){a.push({y:$(animation?'#animHint':'#physNoteLabel').getBoundingClientRect().top,h:$(animation?'#eqAnim':'#physEquation').getBoundingClientRect().height});if(++n<180)requestAnimationFrame(sample);else resolve();}requestAnimationFrame(sample);});
  (animation?Praxis.Animations:Praxis.Physics).pause();const ys=a.map(x=>x.y),hs=a.map(x=>x.h);rows.push({mode,frames:a.length,verticalShift:Math.max(...ys)-Math.min(...ys),heightChange:Math.max(...hs)-Math.min(...hs)});
 }return rows;
})()''');save()
report['layouts']=[]
for w,h,dpr in [(3840,2160,1),(1920,1080,2),(1366,768,1),(1024,768,1),(390,844,3)]:
 cmd('set','viewport',w,h,dpr)
 rows=js('''(async()=>{const rows=[],$=s=>document.querySelector(s),frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 for(const lang of ['ro','en'])for(const size of [100,200]){
 await PraxisI18n.setLanguage(lang);const select=$('.praxis-course-settings select');select.value=String(size);select.dispatchEvent(new Event('change',{bubbles:true}));
 for(const tab of ['teorie','animatii','fizica','exerseaza']){Praxis.activateTab(tab);await frame();scrollTo(0,0);const panel=$('#panel-'+tab),grid=panel.querySelector('.lab-grid'),canvas=panel.querySelector('canvas'),rect=grid?.getBoundingClientRect();
 const bad=[...panel.querySelectorAll('button,input,select,canvas')].filter(e=>e.getClientRects().length).filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5;}).map(e=>e.id||e.className);
 rows.push({lang,size,tab,width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,bad,workspaceBottom:rect?.bottom,canvas:canvas?{css:canvas.getBoundingClientRect().width,buffer:canvas.width}:null,mathErrors:panel.querySelectorAll('.science-math-error').length});
 }}await PraxisI18n.setLanguage('ro');const s=$('.praxis-course-settings select');s.value='100';s.dispatchEvent(new Event('change'));Praxis.activateTab('teorie');return rows;})()''')
 report['layouts'].extend(rows);save()
 cmd('screenshot',OUT/f'layout-{w}.png')
 print(f'Layout {w}: '+str(sum(x['overflow'] or x['bad'] or x['mathErrors'] for x in rows))+' issue states',flush=True)
report['board']=[]
for w,h,dpr in [(1920,1080,2),(3840,2160,1)]:
 cmd('set','viewport',w,h,dpr)
 board=js('''(async()=>{const rows=[],frame=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 for(const lang of ['ro','en'])for(const size of [100,200]){
 await PraxisI18n.setLanguage(lang);const sizeSelect=document.querySelector('.praxis-course-settings select');sizeSelect.value=String(size);sizeSelect.dispatchEvent(new Event('change'));
 for(const tab of ['teorie','animatii','fizica']){Praxis.activateTab(tab);await frame();PraxisCourseLocalization.setTouch(true);await frame();const opened=PraxisWhiteboard.open(document.querySelector('.site-board-button,#board-mode'));await frame();await frame();
 const stage=document.querySelector('[data-wb-stage]');const bad=stage?[...stage.querySelectorAll('button,input,canvas')].filter(e=>e.getClientRects().length&&!e.closest('details:not([open])')).filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5;}).map(e=>e.id||e.className):['no-stage'];
 rows.push({lang,size,tab,width:innerWidth,opened,bad,scale:PraxisWhiteboard.scale});PraxisWhiteboard.close();await frame();
 }}return rows;})()''')
 report['board'].extend(board);save()
 js("document.querySelector('.praxis-course-settings select').value='100';document.querySelector('.praxis-course-settings select').dispatchEvent(new Event('change'));Praxis.activateTab('fizica');document.querySelector('[data-model=ohm]').click();PraxisWhiteboard.open(document.querySelector('.site-board-button,#board-mode'))")
 cmd('screenshot',OUT/f'board-{w}.png');js('PraxisWhiteboard.close()')
report['errors']=cmd('errors');save()
print(json.dumps({'functional':report['functional'],'stability':report['stability']},ensure_ascii=True),flush=True)
