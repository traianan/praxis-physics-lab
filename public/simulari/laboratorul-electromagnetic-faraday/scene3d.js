/** Local technical scene. Deterministic pose from the SI state; no independent animation clock. */
import * as T from '../../vendor/three/three.module.js';
import {dipoleField} from '../../shared/faraday-model.js';
const instances=new WeakMap();
const V=(x,y,z)=>new T.Vector3(x,y,z);
export function createStand(canvas){
 const scene=new T.Scene();scene.background=new T.Color('#f7f5ee');
 const camera=new T.PerspectiveCamera(32,1,.1,80),renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 scene.add(new T.HemisphereLight('#fffdf4','#8faaa4',2.8));const key=new T.DirectionalLight('#fff4df',3.4);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-4,near:.1,far:25});key.shadow.normalBias=.03;scene.add(key);const rim=new T.DirectionalLight('#dbeef3',2.2);rim.position.set(4,3,-5);scene.add(rim);
 const material=(color,metalness=.1,roughness=.4)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const materials={copper:material('#bc793e',.8,.25),brass:material('#c9a45e',.75,.3),steel:material('#8caaa5',.75,.3),iron:material('#52605e',.65,.38),dark:material('#253d39',.25,.45),ceramic:material('#fffdf5',.1,.3),base:material('#dbe4db',.3,.45),red:material('#b54d45',.3,.3),blue:material('#487ca2',.3,.3),current:material('#43876f',.15,.3)};
 function mesh(geometry,mat,parent){const m=new T.Mesh(geometry,mat);m.castShadow=m.receiveShadow=true;(parent||scene).add(m);return m;}
 function box(w,h,d,x,y,z,mat,parent){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m;}
 function cylinder(radius,length,x,y,z,mat,parent,axis='y'){const m=mesh(new T.CylinderGeometry(radius,radius,length,32),mat,parent);m.position.set(x,y,z);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 function tube(points,radius,mat,parent){const path=new T.CatmullRomCurve3(points.map(p=>V(...p)));return mesh(new T.TubeGeometry(path,Math.max(24,points.length*5),radius,8,false),mat,parent);}
 function label(text,width=.7,height=.25){const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d');ctx.font='600 92px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#18332f';ctx.fillText(text,64,64);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false}));sprite.scale.set(width,height,1);return sprite;}
 function winding(parent,r=.52,length=.62,turns=12){const g=new T.Group();parent.add(g);const pts=[];for(let j=0;j<=turns*40;j++){const q=j/(turns*40),angle=q*turns*Math.PI*2;pts.push([-length/2+q*length,r*Math.cos(angle),r*Math.sin(angle)]);}tube(pts,.024,materials.copper,g);return g;}
 function support(parent,x){cylinder(.055,.7,x,.38,0,materials.steel,parent);box(.65,.1,.65,x,.08,0,materials.dark,parent);cylinder(.14,.08,x,.75,0,materials.brass,parent);}
 const platform=box(7.6,.12,3.3,0,-.07,.2,materials.base);platform.receiveShadow=true;
 const floor=mesh(new T.PlaneGeometry(200,200),material('#f7f5ee',0,.9));floor.rotation.x=-Math.PI/2;floor.position.y=-.15;
 // Precision rail, feet and fasteners give a stable reference for the moving assembly.
 for(const z of [-.25,.25]){box(6.5,.04,.035,-.2,.03,z,materials.steel);for(const x of [-3,3])cylinder(.04,.018,x,.062,z,materials.dark);}
 const groups={},items={};
 function meter(parent,x,z,symbol){const group=new T.Group();group.position.set(x,.14,z);parent.add(group);box(.94,.56,.55,0,.22,0,materials.dark,group);const textureCanvas=document.createElement('canvas');textureCanvas.width=512;textureCanvas.height=320;const c=textureCanvas.getContext('2d');c.fillStyle='#fffdf2';c.fillRect(0,0,512,320);c.strokeStyle='#a8b4a7';c.lineWidth=4;c.beginPath();c.arc(256,270,200,Math.PI*1.15,Math.PI*1.85);c.stroke();for(let k=0;k<=10;k++){const a=Math.PI*(1.15+.7*k/10);c.beginPath();c.moveTo(256+180*Math.cos(a),270+180*Math.sin(a));c.lineTo(256+201*Math.cos(a),270+201*Math.sin(a));c.stroke();}c.fillStyle='#18332f';c.font='80px Segoe UI';c.textAlign='center';c.fillText(symbol,256,220);c.font='28px Segoe UI';c.fillText('−',73,190);c.fillText('0',256,50);c.fillText('+',439,190);const tex=new T.CanvasTexture(textureCanvas);tex.colorSpace=T.SRGBColorSpace;const panel=mesh(new T.PlaneGeometry(.82,.5),new T.MeshBasicMaterial({map:tex,toneMapped:false}),group);panel.position.set(0,.26,.281);const pivot=new T.Group();pivot.position.set(0,.05,.29);group.add(pivot);const needle=box(.012,.33,.01,0,.165,0,materials.red,pivot);cylinder(.035,.02,0,.05,.3,materials.brass,group,'z');return {pivot,group};}
 function terminals(parent,x,y,z){for(const d of [-.15,.15]){cylinder(.065,.13,x+d,y,z,materials.brass,parent);cylinder(.09,.04,x+d,y-.05,z,materials.dark,parent);}}
 function fieldArrow(parent,start,end,color){const direction=new T.Vector3().subVectors(end,start),a=new T.ArrowHelper(direction.clone().normalize(),start,direction.length(),color,.13,.07);parent.add(a);return a;}
 for(const name of ['magnet','pickup','rl','transformer','generator']){const group=new T.Group();scene.add(group);groups[name]=group;group.visible=false;items[name]={};}
 // Magnet: model dimensions are schematic; the field topology is the external dipole topology.
 function bar(parent){const g=new T.Group();parent.add(g);box(.42,.3,.32,-.21,0,0,materials.blue,g);box(.42,.3,.32,.21,0,0,materials.red,g);box(.82,.015,.28,0,.16,0,materials.steel,g);const s=label('S',.19,.16),n=label('N',.19,.16);s.position.set(-.22,.02,.18);n.position.set(.22,.02,.18);g.add(s,n);return {group:g,n,s};}
 const dipole=bar(groups.magnet);dipole.group.position.set(0,.3,0);items.magnet.bar=dipole;
 const field=new T.Group();groups.magnet.add(field);items.magnet.field=field;field.position.y=-.7;
 for(const scale of [1.1,1.8,2.7])for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const pts=[];for(let k=0;k<=70;k++){const theta=.32+(Math.PI-.64)*k/70,r=scale*Math.sin(theta)**2;pts.push(V(r*Math.cos(theta),1+r*Math.sin(theta)*Math.cos(angle),r*Math.sin(theta)*Math.sin(angle)));}const geo=new T.BufferGeometry().setFromPoints(pts),line=new T.Line(geo,new T.LineBasicMaterial({color:'#5c9996',transparent:true,opacity:.4}));field.add(line);}
 const probe=new T.Group();groups.magnet.add(probe);items.magnet.probe=probe;probe.rotation.x=-Math.PI/2;cylinder(.23,.07,0,0,0,materials.brass,probe,'z');cylinder(.205,.075,0,0,.01,materials.ceramic,probe,'z');const needle=new T.Group();probe.add(needle);items.magnet.needle=needle;const north=mesh(new T.ConeGeometry(.065,.19,3),materials.red,needle);north.rotation.z=-Math.PI/2;north.position.set(.095,0,.06);const south=mesh(new T.ConeGeometry(.065,.19,3),materials.blue,needle);south.rotation.z=Math.PI/2;south.position.set(-.095,0,.06);const probeLabel=label('B',.35,.2);probeLabel.position.set(0,.35,0);probe.add(probeLabel);
 const pickupGroup=groups.pickup,magnet=bar(pickupGroup);items.pickup.bar=magnet;const carriage=new T.Group();magnet.group.add(carriage);box(.85,.09,.6,0,-.6,0,materials.dark,carriage);cylinder(.05,.45,0,-.35,0,materials.steel,carriage);const receiver=new T.Group();receiver.position.set(1.6,1,0);pickupGroup.add(receiver);items.pickup.receiver=receiver;winding(receiver);for(const x of [-.37,.37]){const ring=mesh(new T.TorusGeometry(.56,.05,12,64),materials.ceramic,receiver);ring.rotation.y=Math.PI/2;ring.position.x=x;}support(pickupGroup,1.6);items.pickup.meter=meter(pickupGroup,-.1,1.1,'i');terminals(pickupGroup,1.6,.25,.8);tube([[1.29,1.52,0],[1.1,1.6,.5],[1.45,.3,.8],[.72,.22,1.2]],.025,materials.red,pickupGroup);tube([[1.91,1.52,0],[2.2,1.5,.5],[1.75,.3,.8],[-.5,.2,1.2]],.025,materials.blue,pickupGroup);items.pickup.normal=fieldArrow(pickupGroup,V(1.4,1.85,0),V(2.25,1.85,0),'#5c9996');const nl=label('n',.2,.18);nl.position.set(2.3,1.9,0);pickupGroup.add(nl);
 // RL: explicit binding posts; each wire terminates at a shared contact coordinate.
 const rl=groups.rl;rl.scale.setScalar(.86);rl.position.y=.05;
 cylinder(.3,2.1,0,1,0,materials.iron,rl,'x');
 winding(rl,.42,1.65,18).position.y=1;support(rl,-.75);support(rl,.75);
 items.rl.meter=meter(rl,1.9,1,'A');
 box(.85,.65,.6,-2,.4,.8,materials.dark,rl);
 const batteryLabel=label('U',.3,.25);batteryLabel.position.set(-2,.56,1.13);rl.add(batteryLabel);
 function bindingPost(point,mat,symbol){
  const [x,y,z]=point;
  cylinder(.09,.05,x,y,z-.10,materials.dark,rl,'z');
  cylinder(.055,.18,x,y,z-.045,mat,rl,'z');
  cylinder(.035,.04,x,y,z+.025,materials.brass,rl,'z');
  const mark=label(symbol,.18,.18);mark.position.set(x,y+.17,z+.04);rl.add(mark);
 }
 const sourcePlus=[-1.77,.28,1.24],sourceMinus=[-2.23,.28,1.24];
 const meterPlus=[1.64,.12,1.43],meterMinus=[2.16,.12,1.43];
 bindingPost(sourcePlus,materials.red,'+');bindingPost(sourceMinus,materials.blue,'−');
 bindingPost(meterPlus,materials.red,'+');bindingPost(meterMinus,materials.blue,'−');
 // Exact endpoints of winding(): x=±length/2, y=1+radius, z=0.
 tube([sourcePlus,[-1.42,.45,1.12],[-1.18,1.2,.55],[-.825,1.42,0]],.03,materials.red,rl);
 tube([[.825,1.42,0],[1.19,1.15,.55],[1.36,.38,1.45],meterPlus],.03,materials.red,rl);
 tube([meterMinus,[2.3,.10,1.72],[0,.10,1.8],[-2.4,.10,1.72],sourceMinus],.03,materials.blue,rl);
 const currentReference=fieldArrow(rl,V(-.45,.24,1.8),V(.45,.24,1.8),'#43876f');
 // Reference current returns right-to-left; a signed readout gives the actual direction.
 currentReference.position.x=.45;currentReference.setDirection(V(-1,0,0));
 const currentLabel=label('i',.2,.2);currentLabel.position.set(0,.42,1.8);rl.add(currentLabel);
 items.rl.arrow=fieldArrow(rl,V(-.7,1.7,0),V(.7,1.7,0),'#5c9996');

 // Transformer: two isolated circuits, voltage probes in parallel, switch only in load branch.
 const transformer=groups.transformer;transformer.scale.setScalar(.83);transformer.position.y=.08;
 for(const x of [-1.1,1.1])box(.36,1.65,.5,x,1,0,materials.iron,transformer);
 for(const y of [.25,1.75])box(2.55,.28,.5,0,y,0,materials.iron,transformer);
 function trPost(point,color){const [x,y,z]=point;cylinder(.075,.06,x,y-.045,z,materials.dark,transformer);cylinder(.045,.12,x,y,z,color,transformer);}
 const p1=[-1.25,.23,.85],p0=[-.95,.23,.85],s1=[.95,.23,.85],s0=[1.25,.23,.85];
 for(const [point,color] of [[p1,materials.red],[p0,materials.blue],[s1,materials.red],[s0,materials.blue]])trPost(point,color);
 for(const x of [-1.1,1.1]){const coil=winding(transformer,.44,.9,14);coil.rotation.z=Math.PI/2;coil.position.set(x,1,0);box(.7,.12,.7,x,.09,0,materials.dark,transformer);}
 // A +pi/2 rotation maps BOTH helix endpoints to x=center-.44.
 // Reverse the secondary terminal convention because core flux runs in opposite directions in the two limbs.
 tube([[-1.54,.55,0],[-1.65,.35,.45],p1],.025,materials.red,transformer);
 tube([[-1.54,1.45,0],[-.65,1.55,-.4],[-.6,.3,.5],p0],.025,materials.blue,transformer);
 tube([[.66,1.45,0],[.45,1.55,.4],[.5,.35,.6],s1],.025,materials.red,transformer);
 tube([[.66,.55,0],[1.6,.35,.4],s0],.025,materials.blue,transformer);
 items.transformer.meter=meter(transformer,-2.5,1.35,'V₁');items.transformer.meter2=meter(transformer,2.5,1.35,'V₂');
 const v1a=[-2.75,.12,1.68],v1b=[-2.25,.12,1.68],v2a=[2.25,.12,1.68],v2b=[2.75,.12,1.68];
 for(const [point,color] of [[v1a,materials.red],[v1b,materials.blue],[v2a,materials.red],[v2b,materials.blue]])trPost(point,color);
 tube([p1,[-1.8,.13,1.2],v1a],.025,materials.red,transformer);tube([p0,[-1.5,.11,1.8],v1b],.025,materials.blue,transformer);
 tube([s1,[1.65,.13,1.25],v2a],.025,materials.red,transformer);tube([s0,[1.7,.11,1.85],v2b],.025,materials.blue,transformer);
 // AC supply across primary; red/blue identify reference terminals, not fixed AC polarity.
 box(.8,.6,.6,-2.65,.4,-.25,materials.dark,transformer);
 const ac=label('∿',.5,.35);ac.position.set(-2.65,.48,.08);transformer.add(ac);
 const ac1=[-2.9,.2,.15],ac0=[-2.4,.2,.15];trPost(ac1,materials.red);trPost(ac0,materials.blue);
 tube([ac1,[-3.2,.15,.65],[-1.65,.18,.65],p1],.025,materials.red,transformer);
 tube([ac0,[-2,.14,.4],[-.8,.14,.5],p0],.025,materials.blue,transformer);
 // Explicit resistive load in series with a two-contact knife switch.
 box(.7,.25,.35,2.65,.65,-.25,materials.ceramic,transformer);box(.55,.45,.3,2.65,.27,-.25,materials.dark,transformer);
 const rLabel=label('R',.3,.25);rLabel.position.set(2.65,.95,-.05);transformer.add(rLabel);
 const r1=[2.25,.65,-.25],r0=[3.05,.65,-.25],k1=[1.65,.23,.45],k0=[2.05,.23,.45];
 for(const point of [r1,r0,k1,k0])trPost(point,materials.brass);
 tube([s1,[1.35,.18,.5],k1],.025,materials.red,transformer);
 tube([k0,[2.2,.23,.2],r1],.025,materials.red,transformer);
 tube([r0,[3.3,.15,.6],[1.5,.15,1.05],s0],.025,materials.blue,transformer);
 const knife=new T.Group();knife.position.set(...k1);transformer.add(knife);box(.4,.035,.055,.2,0,0,materials.brass,knife);items.transformer.switch=knife;
 items.transformer.arrow=fieldArrow(transformer,V(-.5,1.98,0),V(.5,1.98,0),'#5c9996');

 // Alternator: two coil leads -> two insulated slip rings -> two stationary brushes.
 const gen=groups.generator;gen.scale.setScalar(.80);gen.position.y=.12;
 const rotor=new T.Group();rotor.position.set(0,1.15,0);gen.add(rotor);items.generator.rotor=rotor;winding(rotor,.59,.2,7);
 cylinder(.045,2.7,0,1.15,.2,materials.steel,gen,'z');
 for(const z of [-1,1.5]){box(.35,1,.18,0,.55,z,materials.dark,gen);cylinder(.09,.2,0,1.15,z,materials.brass,gen,'z');}
 for(const x of [-1.35,1.35]){box(.5,1.2,1.25,x,1.15,0,x<0?materials.red:materials.blue,gen);box(.65,.1,1.4,x,.5,0,materials.iron,gen);const l=label(x<0?'N':'S',.3,.3);l.position.set(x,1.2,.67);gen.add(l);}
 for(const z of [-.4,.4])fieldArrow(gen,V(-1,1.6,z),V(1,1.6,z),'#5c9996');items.generator.normal=fieldArrow(rotor,V(0,0,0),V(.9,0,0),'#83689e');
 // Rings rotate with rotor. Separate insulating hubs prevent a short through the shaft.
 for(const z of [.8,1.08]){cylinder(.145,.1,0,0,z,materials.ceramic,rotor,'z');const ring=mesh(new T.TorusGeometry(.16,.025,12,48),materials.brass,rotor);ring.position.set(0,0,z);box(.14,.10,.08,.24,1.15,z,materials.dark,gen);}
 // Positive emf follows the winding from its start to its end: red terminal is the end.
 tube([[.1,.59,0],[.28,.5,.35],[.16,0,.8]],.018,materials.red,rotor);
 tube([[-.1,.59,0],[-.28,.5,.4],[-.16,0,1.08]],.018,materials.blue,rotor);
 const brushA=[.31,1.15,.8],brushB=[.31,1.15,1.08];
 function genPost(point,color){const [x,y,z]=point;cylinder(.075,.05,x,y-.045,z,materials.dark,gen);cylinder(.045,.12,x,y,z,color,gen);}
 // Voltage measurement stays across the brushes even with the load open.
 items.generator.meter=meter(gen,2.65,1.4,'U');
 const va=[2.4,.12,1.73],vb=[2.9,.12,1.73];genPost(va,materials.red);genPost(vb,materials.blue);
 tube([brushA,[.7,.6,1.1],[1.75,.15,1.4],va],.025,materials.red,gen);
 tube([brushB,[.65,.4,1.65],[1.7,.11,1.95],vb],.025,materials.blue,gen);
 // Only four external component terminals: two on the meter and two on R.
 box(.7,.25,.35,2.65,.7,-.2,materials.ceramic,gen);box(.55,.5,.3,2.65,.3,-.2,materials.dark,gen);
 const loadLabel=label('R',.3,.25);loadLabel.position.set(2.65,1,-.05);gen.add(loadLabel);
 const ra=[2.25,.7,-.2],rb=[3.05,.7,-.2],ka=[1.75,.25,.5],kb=[2.15,.25,.5];
 for(const point of [ra,rb,ka,kb])genPost(point,materials.brass);
 tube([brushA,[.75,.65,.9],[1.3,.3,.65],ka],.025,materials.red,gen);
 tube([kb,[2.2,.4,.25],ra],.025,materials.red,gen);
 tube([rb,[3.35,.2,.6],[3.3,.14,1.95],vb],.025,materials.blue,gen);
 const loadSwitch=new T.Group();loadSwitch.position.set(...ka);gen.add(loadSwitch);box(.4,.035,.055,.2,0,0,materials.brass,loadSwitch);items.generator.switch=loadSwitch;

 const pickupField=field.clone();pickupField.traverse(o=>{if(o.isLine){o.material=o.material.clone();o.material.opacity=.13;}});pickupGroup.add(pickupField);items.pickup.field=pickupField;
 for(const name of ['pickup']){const g=groups[name],lever=new T.Group();lever.position.set(name==='pickup'?.4:2.2,.22,name==='pickup'?1.2:1.45);g.add(lever);const arm=box(.32,.035,.055,.16,0,0,materials.brass,lever);cylinder(.055,.06,0,0,0,materials.dark,lever);items[name].switch=lever;}

 tube([[.4,.22,1.2],[.3,.2,1.2]],.025,materials.red,pickupGroup);
 const ray=new T.Raycaster(),plane=new T.Plane(V(0,0,1),0);let lastWidth=0,lastHeight=0,lastRatio=0,active='pickup';
 function size(){const b=canvas.getBoundingClientRect(),ratio=window.PraxisCanvasResolution.ratio(b.width,b.height);if(b.width===lastWidth&&b.height===lastHeight&&ratio===lastRatio)return;lastWidth=b.width;lastHeight=b.height;lastRatio=ratio;if(!b.width||!b.height)return;renderer.setPixelRatio(ratio);renderer.setSize(b.width,b.height,false);camera.aspect=b.width/b.height;const distance=Math.max(5.7,3.7/(Math.tan(Math.PI*32/360)*camera.aspect));camera.position.set(distance*.16,distance*.44,distance);camera.lookAt(0,.75,.1);camera.updateProjectionMatrix();}
 function draw(name,s,p,tr){active=name;size();for(const [key,g]of Object.entries(groups))g.visible=key===name;const P=window.PraxisScientificColors.palette(document.documentElement.dataset.courseColors);materials.red.color.set(P.red);materials.blue.color.set(P.blue);materials.current.color.set(P.green);
  const it=items[name];if(it.switch)it.switch.rotation.z=p.open?.6:0;for(const item of [items.magnet.field,items.pickup.field])item.traverse(o=>{if(o.isLine)o.material.color.set(P.teal);});items.pickup.normal.setColor(P.teal);items.generator.normal.setColor(P.purple);if(name==='pickup'||name==='magnet'){const bar=it.bar;bar.group.rotation.y=p.m<0?Math.PI:0;if(name==='pickup'){bar.group.position.set(1.6-s.x*9.6,1,0);it.field.position.x=bar.group.position.x;it.field.visible=p.m!==0;it.receiver.scale.set(1,p.a/.05,p.a/.05);it.meter.pivot.rotation.z=-Math.max(-1,Math.min(1,s.current/0.00003))*.9;}else{it.field.visible=p.m!==0;it.probe.position.set(p.x*9,.3,-p.y*9);const b=dipoleField(p.m,p.x,p.y);it.needle.visible=!!b&&!!Math.hypot(b.bx,b.by);if(it.needle.visible)it.needle.rotation.z=Math.atan2(b.by,b.bx);}}
  if(name==='rl'){it.meter.pivot.rotation.z=-s.current*.9;it.arrow.visible=Math.abs(s.B)>1e-12;it.arrow.position.x=s.B>=0?-.7:.7;it.arrow.setDirection(V(s.B>=0?1:-1,0,0));it.arrow.setColor(P.teal);}
  if(name==='transformer'){it.meter.pivot.rotation.z=-Math.max(-1,Math.min(1,s.u1/(p.N1*p.phi*p.omega||1)))*.9;it.meter2.pivot.rotation.z=-Math.max(-1,Math.min(1,s.u2/(p.N2*p.phi*p.omega||1)))*.9;it.arrow.visible=Math.abs(s.flux)>1e-12;it.arrow.position.x=s.flux>=0?-.5:.5;it.arrow.setDirection(V(s.flux>=0?1:-1,0,0));it.arrow.setColor(P.teal);}
  if(name==='generator'){it.rotor.rotation.z=s.theta;it.meter.pivot.rotation.z=-Math.max(-1,Math.min(1,s.voltage/(s.emfPeak||1)))*.9;}
  renderer.render(scene,camera);
 }
 function pointer(x,y){size();ray.setFromCamera(new T.Vector2(x/lastWidth*2-1,1-y/lastHeight*2),camera);plane.set(active==='magnet'?V(0,1,0):V(0,0,1),active==='magnet'?-.3:0);const point=ray.ray.intersectPlane(plane,new T.Vector3());if(!point)return null;return active==='pickup'?{distance:(1.6-point.x)/9.6}:{x:point.x/9,y:-point.z/9};}
 function dispose(){renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const mat of Array.isArray(o.material)?o.material:[o.material]){mat.map?.dispose();mat.dispose();}}});}
 return {draw,pointer,dispose,info:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures})};
}
export function renderStand(canvas,activity,s,p,tr){let stand=instances.get(canvas);if(!stand){stand=createStand(canvas);instances.set(canvas,stand);}stand.draw(activity,s,p,tr);}
export function pointerToModel(canvas,x,y){return instances.get(canvas)?.pointer(x,y);}
export function standInfo(canvas){return instances.get(canvas)?.info();}

