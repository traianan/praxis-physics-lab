import {renderStand} from './scene3d.js';
export const palette=()=>window.PraxisScientificColors.palette(document.documentElement.dataset.courseColors);
export function number(v){return new Intl.NumberFormat(window.PraxisI18n.locale||'ro',{maximumSignificantDigits:5}).format(Math.abs(v)<1e-15?0:v);}
export function quantity(v,unit){const a=Math.abs(v);const [scale,prefix]=a&&a<1e-6?[1e9,'n']:a&&a<1e-3?[1e6,'μ']:a&&a<1?[1e3,'m']:[1,''];return `${number(v*scale)} ${prefix}${unit}`;}
function setup(canvas){const b=canvas.getBoundingClientRect();if(b.width<1||b.height<1)return null;const ratio=window.PraxisCanvasResolution.ratio(b.width,b.height),w=Math.round(b.width*ratio),h=Math.round(b.height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}const c=canvas.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,b.width,b.height);c.font='14px Segoe UI, sans-serif';c.fillStyle='#18332f';c.strokeStyle='#18332f';c.lineWidth=2;return {c,w:b.width,h:b.height};}
function line(c,x,y,X,Y,color,width=2){c.beginPath();c.strokeStyle=color;c.lineWidth=width;c.moveTo(x,y);c.lineTo(X,Y);c.stroke();}
export function renderScene(canvas,activity,s,p,tr){renderStand(canvas,activity,s,p,tr);}
function axisNumber(v){return Math.abs(v)<.001?v.toExponential(1).replace('e-','e−'):number(v);}
export function renderGraphs(canvases,history,activity,tr){
 const P=palette(),rows=activity==='magnet'?[['bx','Bₓ / T',P.teal],['by','Bᵧ / T',P.purple],['magnitude','|B| / T',P.blue]]:[['flux','Φ / Wb',P.teal],['emf',activity==='transformer'?'u₂ / V':'e / V',P.purple],['current',activity==='transformer'?'i₂ / A':'i / A',P.green]];
 for(let j=0;j<3;j++){const z=setup(canvases[j]);if(!z)continue;const {c,w,h}=z,[key,label,color]=rows[j],latest=history.at(-1)?.t||0,start=Math.max(0,latest-(activity==='rl'?.1:activity==='pickup'?5:1)),span=Math.max(activity==='rl'?.02:.2,latest-start);const data=history.filter(s=>s.t>=start),maximum=(Math.max(0,...data.map(s=>Math.abs(s[key]||0)))||1),x0=65,y0=28,W=w-75,H=h-52;
  c.fillStyle=color;c.font='13px Segoe UI';c.fillText(label,8,16);c.fillStyle='#586d63';c.font='11px Segoe UI';c.fillText(axisNumber(maximum),2,y0+4);c.fillText(axisNumber(-maximum),2,y0+H);line(c,x0,y0,x0,y0+H,'#aab9b0',1);line(c,x0,y0+H/2,w-10,y0+H/2,'#aab9b0',1);c.beginPath();c.strokeStyle=color;c.lineWidth=2;const stride=Math.max(1,Math.floor(data.length/Math.max(1,W*2)));for(let k=0;k<data.length;k+=stride){const s=data[k],x=x0+(s.t-start)/span*W,y=y0+H/2-(s[key]||0)/maximum*H*.46;k===0?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();const last=data.at(-1);if(last){const X=x0+(last.t-start)/span*W;line(c,X,y0,X,y0+H,'#18332f',1);c.fillStyle=color;c.beginPath();c.arc(X,y0+H/2-(last[key]||0)/maximum*H*.46,3,0,7);c.fill();}c.fillStyle='#586d63';c.fillText(number(start),x0,h-5);c.textAlign='right';c.fillText(`${number(start+span)} s`,w-8,h-5);c.textAlign='left';
 }
}

