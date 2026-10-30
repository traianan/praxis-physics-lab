/* Pure calculations extracted reproducibly from the preserved source. */
(()=>{window.PraxisCompositionModel=params=>{const TWO=2*Math.PI;
function xy(t){const d=params.phase*Math.PI/180;return [params.ax*Math.sin(params.wx*t),params.ay*Math.sin(params.wy*t+d)];}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function ratioIntegers(){const a=Math.round(params.wx*100),b=Math.round(params.wy*100),g=gcd(a,b);return {m:a/g,n:b/g};}
function period(){const {m}=ratioIntegers();return TWO*m/params.wx;}
function contacts(){const T=period(),d=params.phase*Math.PI/180,events=[];if(T>120)return null;
for(const [axis,w,phase] of [['x',params.wx,0],['y',params.wy,d]]){for(let k=Math.ceil((phase-Math.PI/2)/Math.PI);;k++){const t=(Math.PI/2+k*Math.PI-phase)/w;if(t>=T-1e-9)break;if(t>=-1e-9){const [x,y]=xy(Math.max(0,t));events.push({axis,t:Math.max(0,t),x,y});}}}
const unique=axis=>events.filter(e=>e.axis===axis).filter((e,i,a)=>a.findIndex(v=>Math.hypot((v.x-e.x)/params.ax,(v.y-e.y)/params.ay)<1e-7)===i);
const vertical=unique('x'),horizontal=unique('y'),corner=e=>Math.abs(Math.abs(e.x)-params.ax)<1e-7&&Math.abs(Math.abs(e.y)-params.ay)<1e-7;return {events:events.sort((a,b)=>a.t-b.t),vertical,horizontal,tangentVertical:vertical.filter(e=>!corner(e)),tangentHorizontal:horizontal.filter(e=>!corner(e)),corners:vertical.filter(corner)};}
function symmetries(){const {m,n}=ratioIntegers(),d=params.phase*Math.PI/180,zero=a=>Math.abs(Math.sin(a/2))<1e-7;let ox=false,oy=false,center=m%2===1&&n%2===1;
if(m<=600)for(let k=0;k<m;k++){ox ||= zero(n*Math.PI/m+TWO*n*k/m+2*d);oy ||= zero(TWO*n*k/m+2*d-Math.PI);center ||= zero(TWO*n*k/m+2*d);}
return {ox,oy,center};}
return {xy,period,contacts,symmetries};};})();
