/** HyperFrames-compatible deterministic technical assembly. No animation clock. */
import * as THREE from '../../vendor/three/three.module.js';
import {CONTACTS,circuitRoutes,loadWindingPoints} from './assembly-geometry.js';
const tr=s=>window.PraxisI18n?.tr(s)||s;
const vec=a=>new THREE.Vector3(...a);
export function mountGeneratorScene(host){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#f7f5ee');
 const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);camera.position.set(10,5.5,14);camera.lookAt(.5,-.5,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.max(2,(window.devicePixelRatio||1)*1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);
 scene.add(new THREE.HemisphereLight('#fffefa','#b8b6a5',2.5));
 const key=new THREE.DirectionalLight('#ffffff',4);key.position.set(0,10,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=7;key.shadow.camera.bottom=-7;key.shadow.normalBias=.04;scene.add(key);
 const rim=new THREE.DirectionalLight('#d4e9ed',2);rim.position.set(-6,4,-7);scene.add(rim);
 const mat=(color,metalness=.2,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const steel=mat('#8e9a99',.75,.38),darkSteel=mat('#526260',.6,.45),copper=mat('#bf783e',.75,.33),brass=mat('#d8aa48',.7,.3),graphite=mat('#344542',.15,.8),ivory=mat('#eeeade',.1,.55),red=mat('#b54d45',.25,.45),blue=mat('#487ca2',.25,.45),green=mat('#43876f',.1,.45);
 const mesh=(geometry,material,parent=scene)=>{const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box=(size,pos,material,parent)=>{const m=mesh(new THREE.BoxGeometry(...size),material,parent);m.position.copy(vec(pos));return m;};
 const cylinder=(radius,length,pos,material,parent)=>{const m=mesh(new THREE.CylinderGeometry(radius,radius,length,32),material,parent);m.rotation.z=Math.PI/2;m.position.copy(vec(pos));return m;};
 function wire(points,material,radius=.045,parent=scene){const curve=new THREE.CatmullRomCurve3(points.map(vec),false,'centripetal');const m=mesh(new THREE.TubeGeometry(curve,Math.max(20,points.length*6),radius,8,false),material,parent);return m;}
 function line(points,color,parent=scene){const g=new THREE.BufferGeometry().setFromPoints(points.map(vec));const obj=new THREE.Line(g,new THREE.LineBasicMaterial({color}));parent.add(obj);return obj;}
 const base=box([13,.2,7.4],[.8,-3.0,0],ivory);base.receiveShadow=true;
 // Fixed magnetic circuit, cutaway upper pole. B points from N (+y) to S (-y).
 box([4.7,5.25,.45],[-.7,-.05,-1.85],darkSteel);
 const north=box([4.7,.62,3.3],[-.7,2.25,0],red);
 box([4.7,.62,3.3],[-.7,-2.25,0],blue);
 for(const x of [-3.25,2.05]){box([.5,1.6,.8],[x,-2.15,.15],darkSteel);const bearing=cylinder(.38,.55,[x,-1.3,.15],steel);bearing.position.y=0;box([.65,2.65,.8],[x,-1.55,.15],darkSteel);cylinder(.18,.65,[x,0,0],graphite);}
 const rotor=new THREE.Group();scene.add(rotor);cylinder(.13,9,[.8,0,0],steel,rotor);
 // The winding lies in xz when θ=0. Its positive normal is initially -y,
 // parallel to B; positive rotation is about +x. Dot(n,B)=cos θ.
 const winding=[];const turns=9;
 for(let j=0;j<turns;j++){const y=-.13+j*.032;for(const pt of [[-2,y,-1.06],[-1.88,y,-1.18],[1.1,y,-1.18],[1.23,y,-1.06],[1.23,y,1.06],[1.1,y,1.18],[-1.88,y,1.18],[-2,y,1.06],[-2,y,-1.06]])winding.push(pt);}
 wire(winding,copper,.0125,rotor);
 // A rigid insulating former keeps the individual demonstration turns separated.
 for(const z of [-1.05,1.05])box([3.2,.18,.10],[-.38,-.22,z],ivory,rotor);
 for(const x of [-1.9,1.14])box([.10,.18,2.1],[x,-.22,0],ivory,rotor);
 const ringX=[3.08,3.85];
 for(const x of ringX){cylinder(.22,.6,[x,0,0],graphite,rotor);const ring=mesh(new THREE.TorusGeometry(.43,.115,14,64),brass,rotor);ring.rotation.y=Math.PI/2;ring.position.x=x;box([.08,.06,.08],[x,.44,.05],darkSteel,rotor);}
 wire([[-2,-.13,-1.06],[-2,-.38,-.7],[.6,-.25,-.24],[3.5,-.25,-.24],[3.85,-.43,0]],copper,.035,rotor);
 wire([[-2,.126,-1.06],[-2,.38,-.7],[1.8,.25,-.24],[3.08,.25,-.24],[3.08,.43,0]],copper,.035,rotor);
 const windingArrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-1,.4,-1.18),.65,'#b54d45',.18,.1);rotor.add(windingArrow);
 // Two fixed brushes touch two separate continuous rings, never the shaft.
 const brushes=[];for(const x of ringX){brushes.push(box([.24,.28,.48],[x,0,.69],graphite));box([.48,.45,.25],[x,0,.98],ivory);box([.11,.16,.6],[x,-.05,1.30],steel);for(let j=0;j<5;j++)cylinder(.09,.035,[x,-.05,1.03+j*.08],darkSteel).rotation.set(Math.PI/2,0,0);}
 for(const x of ringX)wire([[x,0,.82],[x,0,1.6]],copper,.045);
 // Complete external loop: brush 1 → ideal ammeter → R → switch → brush 2.
 const liveWire=mat('#b54d45',.1,.7),returnWire=mat('#487ca2',.1,.7),meterWire=mat('#83689e',.1,.7);
 const routes=circuitRoutes(),routeMaterials={live:liveWire,return:returnWire,meter:meterWire};for(const route of routes)wire(route.points,routeMaterials[route.color],route.color==='meter'?.035:.065);
 const currentArrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(-.25,-1.4,2.55),.55,'#b54d45',.17,.10);scene.add(currentArrow);
 // Ceramic load with a visible resistive winding; no extra electrical branch.
 cylinder(.23,1.15,[-1.85,-1.25,2.55],ivory);for(const x of [-2.42,-1.28])cylinder(.25,.22,[x,-1.25,2.55],brass);
 const loadPoints=loadWindingPoints();mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loadPoints.map(vec),false,'centripetal'),loadPoints.length,.025,8,false),copper);
 for(const x of [-2.42,-1.28]){box([.16,1.6,.50],[x,-2.1,2.55],ivory);cylinder(.06,.10,[x,-1.25,2.83],steel).rotation.set(Math.PI/2,0,0);}
 // Physical ideal meters. Their terminals share the conductor endpoint coordinates.
 const meters=[];
 function instrument(symbol,a,b){const center=vec(a).add(vec(b)).multiplyScalar(.5);box([1,.8,.46],center.toArray(),ivory);box([.78,.58,.025],[center.x,center.y,center.z+.245],graphite);const postHeight=center.y-.4+2.9;box([.60,postHeight,.32],[center.x,-2.9+postHeight/2,center.z],darkSteel);for(const p of [a,b])cylinder(.075,.16,p,brass);const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;const texture=new THREE.CanvasTexture(canvas),face=mesh(new THREE.PlaneGeometry(.74,.54),new THREE.MeshBasicMaterial({map:texture}));face.position.set(center.x,center.y,center.z+.265);meters.push({symbol,canvas,texture});}
 instrument('A',CONTACTS.ammeterA,CONTACTS.ammeterB);instrument('V',CONTACTS.voltmeterA,CONTACTS.voltmeterB);
 // Switch on the return lead: two terminals remain fixed, blade can open.
 box([.9,.15,.7],[4.8,-2.04,1.2],ivory);const switchBlade=wire([[0,0,0],[.55,0,0]],brass,.05);switchBlade.position.set(4.45,-1.91,1.2);
 // Field lines cross the gap. Arrows follow N → S.
 const field=new THREE.Group();scene.add(field);for(const x of [-1.8,-.6,.6])for(const z of [-.9,.4]){const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(x,1.75,z),3.5,'#43876f',.17,.08);field.add(arrow);}
 const normal=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(-.4,0,0),1.45,'#83689e',.22,.1);scene.add(normal);
 // Mechanical drive, hub and mounting bolts establish the stationary reference.
 cylinder(.56,.65,[-4.2,0,0],steel);const drive=new THREE.Group();drive.position.set(-4.6,0,0);scene.add(drive);const wheel=mesh(new THREE.TorusGeometry(.72,.07,10,48),darkSteel,drive);wheel.rotation.y=Math.PI/2;for(let j=0;j<4;j++){const spoke=box([.07,1.4,.07],[0,0,0],steel,drive);spoke.rotation.x=j*Math.PI/4;}
 for(const x of [-4.7,5.7])for(const z of [-2.7,2.7]){const bolt=mesh(new THREE.CylinderGeometry(.13,.13,.06,6),steel);bolt.position.set(x,-2.85,z);}
 const overlays=document.createElement('div');overlays.className='generator-number-layer';overlays.setAttribute('aria-hidden','true');host.append(overlays);
 const labels=[['north','Pol N',[-1.6,2.5,1.0]],['south','Pol S',[-2,-2.0,1.5]],['coil','Bobină',[.3,.126,1.18]],['shaft','Arbore',[-4.5,.15,0]],['rings','Inele colectoare',[3.85,.43,0]],['brushes','Perii',[3.08,.1,.8]],['load','Rezistor R',[-1.85,-1.25,2.55]],['switch','Întrerupător',[4.7,-1.91,1.2]],['ammeter','Ampermetru',[.7,-1.55,2.8]],['voltmeter','Voltmetru',[3.5,-2.1,3.1]]];
 const legend=document.createElement('ol');legend.className='generator-component-key';legend.setAttribute('aria-label',tr('Componentele dispozitivului'));legend.setAttribute('data-no-i18n','');host.after(legend);
 const nodes=labels.map(([id,text,point],index)=>{const node=document.createElement('span');node.className='component-marker marker-'+id;node.textContent=String(index+1);overlays.append(node);const item=document.createElement('li'),number=document.createElement('span'),name=document.createElement('span');number.className='component-key-number';number.textContent=String(index+1);name.textContent=tr(text);item.append(number,name);legend.append(item);const value=id==='ammeter'||id==='voltmeter'?document.createElement('strong'):null;if(value)item.append(value);return {id,node,text,point:vec(point),name,value};});
 const detail=document.createElement('div');detail.className='technical-detail';detail.innerHTML='<strong></strong><span></span>';const toolbar=host.previousElementSibling;if(toolbar?.matches('.generator-scene-toolbar')&&toolbar.querySelector('span'))toolbar.querySelector('span').replaceWith(detail);else overlays.append(detail);
 let terminalSigns=['0','0'];
 // A finite, paused HyperFrames timeline: exactly one turn per composition second.
 const phase={theta:0};const timeline=gsap.timeline({paused:true});timeline.fromTo(phase,{theta:0},{theta:Math.PI*2,duration:1,ease:'none',immediateRender:true},0);
 window.__timelines=window.__timelines||{};window.__timelines['generator-assembly']=timeline;
 let lastState,lastP,view='perspective',lastWidth=0,lastHeight=0,lastDpr=0,lastPalette='';
 const projected=(point)=>{const p=point.clone().project(camera);return{x:(p.x+1)*host.clientWidth/2,y:(1-p.y)*host.clientHeight/2};};
 function draw(s,p){
  lastState=s;lastP=p;const width=host.clientWidth,height=host.clientHeight;if(!width||!height)return;
  const aspect=width/height,range=Math.max(4.15,7.1/aspect);camera.left=-range*aspect;camera.right=range*aspect;camera.top=range;camera.bottom=-range;camera.updateProjectionMatrix();
  const dpr=window.PraxisCanvasResolution?.ratio(width,height)||Math.max(2,(window.devicePixelRatio||1)*1.5);if(width!==lastWidth||height!==lastHeight||dpr!==lastDpr){renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);lastWidth=width;lastHeight=height;lastDpr=dpr;}
  const phaseValue=((s.theta%(2*Math.PI))+2*Math.PI)%(2*Math.PI)/(2*Math.PI);timeline.time(phaseValue,false);rotor.rotation.x=phase.theta;drive.rotation.x=phase.theta;
  const scheme=document.documentElement.dataset.courseColors||'praxis';if(scheme!==lastPalette&&window.PraxisScientificColors){const c=PraxisScientificColors.palette(scheme);red.color.set(c.red);north.material.color.set(c.red);blue.color.set(c.blue);liveWire.color.set(c.red);returnWire.color.set(c.blue);meterWire.color.set(c.purple);normal.setColor(c.purple);currentArrow.setColor(c.red);windingArrow.setColor(c.red);for(const arrow of field.children)arrow.setColor(c.green);lastPalette=scheme;}
  normal.setDirection(new THREE.Vector3(0,-Math.cos(s.theta),-Math.sin(s.theta)));field.visible=p.B>0;
  switchBlade.rotation.z=p.open?.9:0;currentArrow.visible=Math.abs(s.current)>1e-10;currentArrow.setDirection(new THREE.Vector3(s.current>=0?-1:1,0,0));windingArrow.visible=currentArrow.visible;windingArrow.setDirection(new THREE.Vector3(s.current>=0?1:-1,0,0));
  terminalSigns=[0,1].map(index=>Math.abs(s.voltage)<1e-9?'0':(s.voltage>0)===(index===0)?'+':'−');
  const nf=new Intl.NumberFormat(window.PraxisI18n?.locale||'ro-RO',{maximumFractionDigits:3});
  for(const meter of meters){const value=nf.format(meter.symbol==='A'?s.current:s.voltage)+' '+meter.symbol;if(meter.lastValue!==value){const ctx=meter.canvas.getContext('2d');ctx.fillStyle='#fffefa';ctx.fillRect(0,0,256,192);ctx.fillStyle='#18332f';ctx.textAlign='center';ctx.font='bold 32px Arial';ctx.fillText(meter.symbol,128,50);ctx.font='bold 38px Arial';ctx.fillText(value,128,119);ctx.strokeStyle='#586d63';ctx.lineWidth=3;ctx.strokeRect(8,8,240,176);meter.texture.needsUpdate=true;meter.lastValue=value;}}
  detail.querySelector('strong').textContent=`${tr('Alternator monofazat')} · N = ${p.N}`;detail.querySelector('span').textContent=`θ = ${nf.format(phaseValue*360)}° · ${tr(p.open?'Circuit deschis':'Circuit închis')}`;
  for(const {id,node,text,point,name,value}of nodes){const at=projected(id==='coil'?point.clone().applyQuaternion(rotor.quaternion):point),offset={rings:[8,-16],brushes:[14,16],ammeter:[-24,-20],voltmeter:[25,-20]}[id]||[0,0];node.style.left=Math.max(13,Math.min(width-13,at.x+offset[0]))+'px';node.style.top=Math.max(13,Math.min(height-13,at.y+offset[1]))+'px';const translated=tr(text);if(name.textContent!==translated)name.textContent=translated;if(value)value.textContent=id==='ammeter'?nf.format(s.current)+' A':nf.format(s.voltage)+' V';}
  legend.setAttribute('aria-label',tr('Componentele dispozitivului'));
  renderer.render(scene,camera);
 }
 host.addEventListener('hf-seek',event=>draw(event.detail.state,event.detail.parameters));
 const resize=new ResizeObserver(()=>{if(lastState)draw(lastState,lastP);});resize.observe(host);
 return {seek(s,p){host.dispatchEvent(new CustomEvent('hf-seek',{detail:{time:s.t,state:s,parameters:p}}));},snapshot(){let transparentParts=0;scene.traverse(o=>{if(o.isMesh&&o.material?.transparent&&o.material.opacity<1)transparentParts++;});return {rotorAngle:rotor.rotation.x,normal:new THREE.Vector3(0,-1,0).applyQuaternion(rotor.quaternion).toArray(),ringCount:ringX.length,brushPositions:brushes.map(b=>b.position.toArray()),timelinePaused:timeline.paused(),polarity:terminalSigns.map((sign,index)=>(index===0?'a ':'b ')+sign),transparentParts,loadWindingSamples:loadPoints.length,conductorRoutes:routes.map(r=>({from:r.from,to:r.to}))};},setView(value){view=value;if(view==='front')camera.position.set(0,3.8,14);else camera.position.set(10,5.5,14);camera.lookAt(.5,-.5,0);if(lastState)draw(lastState,lastP);},dispose(){resize.disconnect();timeline.kill();renderer.dispose();}};
}
