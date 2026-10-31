/* =====================================================================
   Motoare termice — utilitare comune: desen, sunet, schelet de simulare
   ===================================================================== */
const COL={a:'#c8402a',b:'#1f5a8a',c:'#2e7d57',r:'#1a1d26',o:'#b07a12',plum:'#7b3f61',teal:'#2a7f86',muted:'#6f6a5f',paper:'#fbf8f1',rule:'#d9cfba',paper2:'#ebe3d1'};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;
const f=(x,d=2)=>{if(!isFinite(x))return '—';const s=(Math.abs(x)<5e-10?0:x).toFixed(d);return (/^-0\.?0*$/.test(s)?s.slice(1):s).replace('-','−')};
const ALL=[];

function drawArrowPx(ctx,x1,y1,x2,y2,color,o={}){
  const w=o.w||2.6,dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<.5)return;
  const ux=dx/L,uy=dy/L,hl=Math.min((o.head||1)*(9+w*2.3),L*.55),hw=hl*.42;
  ctx.save();ctx.globalAlpha=o.alpha??1;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w;ctx.lineCap='round';
  if(o.dash)ctx.setLineDash(o.dash);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2-ux*hl*.7,y2-uy*hl*.7);ctx.stroke();ctx.setLineDash([]);
  const bx=x2-ux*hl,by=y2-uy*hl;
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(bx-uy*hw,by+ux*hw);ctx.lineTo(x2-ux*hl*.74,y2-uy*hl*.74);ctx.lineTo(bx+uy*hw,by-ux*hw);ctx.closePath();ctx.fill();
  if(o.tail){ctx.beginPath();ctx.arc(x1,y1,Math.max(2,w*.85),0,7);ctx.fill()}
  ctx.restore();
}
function txt(ctx,s,px,py,o={}){if(typeof s==='string'&&/_[A-Za-z0-9]/.test(s))return txs(ctx,s,px,py,o);ctx.save();ctx.font=o.font||'italic 500 16px "Source Serif 4", Georgia, serif';ctx.fillStyle=o.color||COL.r;ctx.textAlign=o.align||'center';ctx.textBaseline=o.base||'middle';if(o.halo??!/^(#f|#e|rgba?\(2[45])/i.test(o.color||'')){ctx.lineWidth=4;ctx.strokeStyle='rgba(251,248,241,.92)';ctx.lineJoin='round';ctx.strokeText(s,px,py)}ctx.fillText(s,px,py);ctx.restore()}
function txs(ctx,s,px,py,o={}){ctx.save();ctx.font=o.font||'italic 500 16px "Source Serif 4", Georgia, serif';const base=ctx.font,m=base.match(/(\d+(?:\.\d+)?)px/),fs=m?+m[1]:16,sub=base.replace(m[0],(fs*.7).toFixed(1)+'px');
  const parts=[];s.split(/_([A-Za-z0-9]+)/).forEach((t,i)=>{if(t)parts.push([t,i%2===1])});
  let W=0;for(const p of parts){ctx.font=p[1]?sub:base;p.push(ctx.measureText(p[0]).width);W+=p[2]}
  const al=o.align||'center';let x=al==='center'?px-W/2:(al==='right'||al==='end')?px-W:px;
  ctx.textAlign='left';ctx.textBaseline=o.base||'middle';ctx.fillStyle=o.color||COL.r;const halo=o.halo??!/^(#f|#e|rgba?\(2[45])/i.test(o.color||'');
  for(const [t,sb,w] of parts){ctx.font=sb?sub:base;const y=py+(sb?fs*.28:0);if(halo){ctx.lineWidth=4;ctx.strokeStyle='rgba(251,248,241,.92)';ctx.lineJoin='round';ctx.strokeText(t,x,y)}ctx.fillText(t,x,y);x+=w}
  ctx.restore()}
const MONO='500 11px "JetBrains Mono", monospace';
// (textul deschis la culoare, pe fond închis, se desenează fără contur)
// text pe mai multe rânduri, încadrat în lățimea maxW; întoarce y-ul de sub ultimul rând
function wrapTxt(ctx,s,x,y,maxW,lh,o={}){ctx.save();ctx.font=o.font||'italic 500 16px "Source Serif 4", Georgia, serif';const L=[];let cur='';s.split(' ').forEach(wd=>{const t=cur?cur+' '+wd:wd;if(cur&&ctx.measureText(t).width>maxW){L.push(cur);cur=wd}else cur=t});L.push(cur);ctx.restore();L.forEach((l,k)=>txt(ctx,l,x,y+k*lh,{align:'left',...o}));return y+L.length*lh}
function dot(ctx,x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
function line(ctx,x1,y1,x2,y2,color,w=1,dash){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),3800)}

/* =====================================================================
   Sunete (Web Audio API — sintetizate, fără fișiere audio)
   ===================================================================== */
const SND=(()=>{
  let ac=null,master=null,noiseBuf=null;
  const S={on:window.PraxisSound.enabled};
  function ctx(){
    if(!S.on||!window.PraxisSound.enabled||document.hidden)return null;
    if(!ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ac=new AC();master=ac.createGain();master.gain.value=.7;master.connect(ac.destination);
      noiseBuf=ac.createBuffer(1,ac.sampleRate*1.5,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    if(ac.state==='suspended')ac.resume();
    return ac;
  }
  // un oscilator cu anvelopă scurtă
  function blip({f=880,f2=null,type='sine',dur=.12,vol=.25,at=0,attack=.004}){const a=ctx();if(!a)return;const t=a.currentTime+at;
    const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(master);o.start(t);o.stop(t+dur+.02)}
  function noise({dur=.3,vol=.3,f=800,q=1,type='lowpass',at=0,f2=null}){const a=ctx();if(!a)return;const t=a.currentTime+at;
    const s=a.createBufferSource();s.buffer=noiseBuf;const fl=a.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;
    const g=a.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl).connect(g).connect(master);s.start(t);s.stop(t+dur+.05)}
  S.unlock=()=>ctx();
  S.tick=(v=.12)=>blip({f:1600,type:'square',dur:.03,vol:v*.5});
  S.knock=()=>{blip({f:180,f2:90,type:'triangle',dur:.12,vol:.35});noise({dur:.06,vol:.15,f:2500,type:'bandpass',q:2})};
  S.plop=(v=1)=>{blip({f:900+Math.random()*300,f2:180,type:'sine',dur:.16,vol:.3*v});noise({dur:.18,vol:.08*v,f:1200,type:'bandpass',q:1.5,at:.02})};
  S.splash=()=>{noise({dur:.6,vol:.25,f:3000,f2:400,type:'lowpass',q:.7})};
  S.ping=()=>blip({f:1320,type:'sine',dur:.5,vol:.25,attack:.01});
  S.ok=()=>{blip({f:660,dur:.12,vol:.2});blip({f:990,dur:.22,vol:.2,at:.1})};
  S.bad=()=>{blip({f:220,f2:180,type:'sawtooth',dur:.22,vol:.1})};
  S.fanfare=()=>{[523,659,784,1047].forEach((f,i)=>blip({f,dur:.3,vol:.16,at:i*.11,type:'triangle'}))};
  S.whoosh=()=>noise({dur:.5,vol:.18,f:300,f2:2000,type:'bandpass',q:1});
  // bulă de fierbere: un „plop” scurt, jos, cu frecvență care urcă
  S.bubble=(v=1)=>blip({f:220+Math.random()*260,f2:700+Math.random()*500,type:'sine',dur:.07,vol:.16*v,attack:.002});
  // turnarea unui lichid: zgomot filtrat, cu „gâlgâit” (bule mici) peste el
  S.pour=(dur=1.4)=>{noise({dur,vol:.2,f:900,f2:500,type:'bandpass',q:.8});for(let i=0;i<dur*9;i++)blip({f:500+Math.random()*700,f2:1200,type:'sine',dur:.05,vol:.05,at:Math.random()*dur})};
  // metal fierbinte în apă: șuierat (zgomot înalt) care se stinge
  S.sizzle=(dur=1.6)=>{noise({dur,vol:.22,f:5200,type:'highpass',q:.5});noise({dur:dur*.6,vol:.1,f:2400,type:'bandpass',q:2})};
  // agitatorul: un „fâș” scurt prin apă
  S.stir=()=>{noise({dur:.28,vol:.14,f:700,f2:1400,type:'bandpass',q:1.6});blip({f:300,f2:420,type:'sine',dur:.12,vol:.04})};
  // echilibru termic atins: două note calme
  S.chime=()=>{blip({f:784,dur:.6,vol:.17,attack:.01});blip({f:1175,dur:.8,vol:.13,at:.16,attack:.01})};
  // sunet continuu (zumzetul încălzitorului) — cu volum reglabil
  S.loop=(kind,freq=100)=>{const a=ctx();if(!a)return null;const g=a.createGain();g.gain.value=0;g.connect(master);const nodes=[];
    const o=a.createOscillator();o.type=kind==='hum'?'sawtooth':'sine';o.frequency.value=freq;const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=420;o.connect(fl).connect(g);o.start();nodes.push(o);
    const h={vol(v){g.gain.setTargetAtTime(v,a.currentTime,.05)},freq(fq){nodes[0].frequency.setTargetAtTime(fq,a.currentTime,.02)},
      stop(){g.gain.setTargetAtTime(0,a.currentTime,.04);setTimeout(()=>{nodes.forEach(n=>{try{n.stop()}catch(e){}});g.disconnect()},250)}};
    return h};
  const ls=new Set();S.onChange=fn=>ls.add(fn);
  S.set=on=>{S.on=on;if(!on&&ac)ac.suspend();if(on)ctx();ls.forEach(fn=>fn(on))};
  window.addEventListener("praxis-sound-change",()=>S.set(window.PraxisSound.enabled));document.addEventListener("visibilitychange",()=>{if(document.hidden&&ac)ac.suspend();});return S;
})();

/* =====================================================================
   Schelet comun pentru figuri: canvas HiDPI, slidere, butoane, ieșiri,
   buclă de animație care rulează doar cât figura este vizibilă.
   ===================================================================== */
class Sim{
  constructor(sel,o={}){
    this.fig=$(sel);this.cv=$$('canvas',this.fig);this.c=this.cv[0];this.ctx=this.c.getContext('2d');
    this.o=o;this.p={};this.t={};this.mode=null;this.w=0;this.h=0;this.vis=false;this.raf=null;this.time=0;
    this.fmt=o.fmt||{};
    $$('input[type=range]',this.fig).forEach(inp=>{const k=inp.dataset.k;const set=()=>{this.p[k]=+inp.value;const out=inp.closest('label').querySelector('output');if(out)out.textContent=(this.fmt[k]||(v=>v))(this.p[k])};
      set();inp.addEventListener('input',()=>{set();this.onParam&&this.onParam(k);this.render()})});
    $$('[data-act]',this.fig).forEach(b=>b.addEventListener('click',()=>{SND.unlock();this.act&&this.act(b.dataset.act,b);this.render()}));
    $$('[data-t]',this.fig).forEach(b=>{this.t[b.dataset.t]=b.classList.contains('on');b.addEventListener('click',()=>{SND.unlock();const v=!this.t[b.dataset.t];this.t[b.dataset.t]=v;b.classList.toggle('on',v);this.onToggle&&this.onToggle(b.dataset.t,v);this.render()})});
    const tabs=$$('[data-mode]',this.fig);if(tabs.length){this.mode=(tabs.find(b=>b.classList.contains('on'))||tabs[0]).dataset.mode;
      tabs.forEach(b=>b.addEventListener('click',()=>{SND.unlock();tabs.forEach(x=>x.classList.toggle('on',x===b));this.mode=b.dataset.mode;this.showIn();this.onMode&&this.onMode(this.mode);this.render()}))}
    this.showIn();
    this.outs={};$$('[data-o]',this.fig).forEach(el=>this.outs[el.dataset.o]=el);
    new ResizeObserver(()=>this.resize()).observe(this.c);
    new IntersectionObserver(es=>{this.vis=es[0].isIntersecting;if(this.vis)this.loop();else this.onHide&&this.onHide()}).observe(this.fig);
    ALL.push(this);
  }
  // elementele cu data-in="modA modB" sunt vizibile numai în modurile (tab-urile) enumerate
  showIn(){$$('[data-in]',this.fig).forEach(el=>el.hidden=!el.dataset.in.split(' ').includes(this.mode))}
  out(k,v){const el=this.outs[k];if(el&&el._v!==v){el._v=v;el.innerHTML=v}}
  btn(act){return $(`[data-act="${act}"]`,this.fig)}
  label(act,html,icon){const b=this.btn(act);if(!b)return;let s=b.querySelector('span');if(!s){[...b.childNodes].forEach(n=>n.nodeType===3&&n.remove());s=document.createElement('span');b.append(s)}s.textContent=html;if(icon){const u=b.querySelector('use');u&&u.setAttribute('href',icon)}}
  resize(){const d=Math.min(2,devicePixelRatio||1);this.cv.forEach(c=>{const r=c.getBoundingClientRect();c.width=Math.round(r.width*d);c.height=Math.round(r.height*d);c.getContext('2d').setTransform(d,0,0,d,0,0);c._w=r.width;c._h=r.height});
    this.w=this.c._w;this.h=this.c._h;this.onResize&&this.onResize();this.render()}
  render(){if(!this.w)return;this.ctx.clearRect(0,0,this.w,this.h);this.draw&&this.draw(this.ctx,this.w,this.h)}
  loop(){if(this.raf||document.hidden)return;let last=performance.now();const step=now=>{this.raf=null;if(!this.vis||document.hidden)return;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
      if(this.step)this.step(dt);this.render();this.raf=requestAnimationFrame(step)};this.raf=requestAnimationFrame(step)}
  // coordonate pointer relative la canvas
  pt(e,c=this.c){const r=c.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
}
// fundal „hârtie milimetrică” discret
function grid(ctx,w,h,s=24,alpha=.5){ctx.save();ctx.strokeStyle=`rgba(217,207,186,${alpha})`;ctx.lineWidth=1;ctx.beginPath();for(let x=.5;x<w;x+=s){ctx.moveTo(x,0);ctx.lineTo(x,h)}for(let y=.5;y<h;y+=s){ctx.moveTo(0,y);ctx.lineTo(w,y)}ctx.stroke();ctx.restore()}

document.addEventListener("visibilitychange",()=>{if(!document.hidden)ALL.filter(s=>s.vis).forEach(s=>s.loop());});
