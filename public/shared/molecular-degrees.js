/* Rigid molecular geometry. Orientation changes only through a pointer or keyboard action. */
(() => {
 function create({prepare,colors,arrow,txt}){
  return {
   cv:null,type:'mono',yaw:.25,pitch:-.1,roll:0,axis:'y',pan:{x:0,y:0},drag:null,
   data:{mono:{i:3,color:colors.cyan},di:{i:5,color:colors.gold},poly:{i:6,color:colors.violet}},
   set(type){if(this.data[type])this.type=type;if(this.type!=='poly'){this.roll=0;if(this.axis==='x')this.axis='y';}this.explain();this.controls();},
   controls(){const group=document.getElementById('moleculeAxes');if(group)group.hidden=this.type==='mono';for(const button of document.querySelectorAll('#moleculeAxes [data-axis]')){button.hidden=button.dataset.axis==='x'&&this.type!=='poly';button.setAttribute('aria-pressed',String(button.dataset.axis===this.axis));}},
   explain(){const el=document.getElementById('degreesExplanation');if(el)el.innerHTML=window.I18N.t('cal.degrees.'+this.type);},
   rotate(dx,dy=0){if(this.type==='mono')return;const angle=dx||dy;if(this.axis==='x'&&this.type==='poly')this.roll+=angle;else if(this.axis==='z')this.pitch+=angle;else this.yaw+=angle;},
   translate(dx,dy){const w=+(this.cv?.dataset.logicalWidth||400),h=+(this.cv?.dataset.logicalHeight||250);this.pan.x=Math.max(24-w/2,Math.min(w/2-24,this.pan.x+dx));this.pan.y=Math.max(24-h/2,Math.min(h/2-24,this.pan.y+dy));},
   transform([x,y,z]){const a=this.type==='poly'?this.roll:0,b=this.yaw,c=this.pitch;const Y=y*Math.cos(a)-z*Math.sin(a),Z=y*Math.sin(a)+z*Math.cos(a),X=x*Math.cos(b)+Z*Math.sin(b),z2=-x*Math.sin(b)+Z*Math.cos(b);return [X*Math.cos(c)-Y*Math.sin(c),X*Math.sin(c)+Y*Math.cos(c),z2];},
   reset(){this.yaw=.25;this.pitch=-.1;this.roll=0;this.pan={x:0,y:0};this.draw(0);},
   init(){
    this.cv=document.getElementById('molCanvas');if(!this.cv)return;const canvas=this.cv;canvas.tabIndex=0;
    canvas.addEventListener?.('pointerdown',event=>{if(event.button!==0)return;const rect=canvas.getBoundingClientRect(),scale=+(canvas.dataset.logicalWidth||400)/rect.width,w=+(canvas.dataset.logicalWidth||400),h=+(canvas.dataset.logicalHeight||250),x=(event.clientX-rect.left)*scale,y=(event.clientY-rect.top)*scale;this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,scale,mode:Math.hypot(x-w/2-this.pan.x,y-h/2-this.pan.y)<(event.pointerType==='touch'?24:16)*scale?'translate':'rotate'};canvas.setPointerCapture(event.pointerId);canvas.focus({preventScroll:true});event.preventDefault();});
    canvas.addEventListener?.('pointermove',event=>{if(this.drag?.id!==event.pointerId)return;const dx=event.clientX-this.drag.x,dy=event.clientY-this.drag.y;if(this.drag.mode==='translate')this.translate(dx*this.drag.scale,dy*this.drag.scale);else this.rotate((dx-dy)*.012);this.drag.x=event.clientX;this.drag.y=event.clientY;this.draw(0);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener?.(name,()=>{this.drag=null;});
    canvas.addEventListener?.('keydown',event=>{const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(directions[event.key]){event.preventDefault();const [x,y]=directions[event.key];if(event.altKey)this.translate(x*8,y*8);else this.rotate((x+y)*.12);this.draw(0);}else if(event.key==='Home'){event.preventDefault();this.reset();}});
    for(const button of document.querySelectorAll('#moleculeAxes [data-axis]'))button.addEventListener('click',()=>{this.axis=button.dataset.axis;this.controls();});this.controls();
    document.getElementById('moleculeReset')?.addEventListener('click',()=>this.reset());
   },
   draw(){
    if(!this.cv)return;const {g,w,h}=prepare(this.cv),cx=w/2+this.pan.x,cy=h*.5+this.pan.y;
    const project=point=>{const [x,y,z]=this.transform(point);return {x:cx+.86*x-.5*y,y:cy+.28*x+.48*y-.84*z,z};};
    for(const [point,color,label]of [[[110,0,0],colors.blue||colors.accent2,'Ox'],[[0,110,0],colors.green,'Oy'],[[0,0,110],colors.red,'Oz']]){const end=project(point);arrow(g,cx,cy,end.x,end.y,color,label);}
    const coordinates=this.type==='mono'?[[0,0,0]]:this.type==='di'?[[-40,0,0],[40,0,0]]:[[0,0,0],[66,0,0],[-24,58,0]];
    const points=coordinates.map(project);g.strokeStyle=colors.text;g.lineWidth=7;g.lineCap='round';
    if(points.length>1)for(let i=1;i<points.length;i++){g.beginPath();g.moveTo(points[0].x,points[0].y);g.lineTo(points[i].x,points[i].y);g.stroke();}
    for(const point of points.sort((a,b)=>a.z-b.z)){const radius=19+point.z*.025;g.beginPath();g.arc(point.x,point.y,radius,0,Math.PI*2);const gradient=g.createRadialGradient?.(point.x-6,point.y-7,1,point.x,point.y,radius);if(gradient?.addColorStop){gradient.addColorStop(0,'#fffefa');gradient.addColorStop(.38,this.data[this.type].color);gradient.addColorStop(1,this.data[this.type].color);g.fillStyle=gradient;}else g.fillStyle=this.data[this.type].color;g.fill();g.strokeStyle=colors.bright;g.lineWidth=1.25;g.stroke();}
    g.beginPath();g.arc(cx,cy,5,0,Math.PI*2);g.fillStyle=colors.text;g.fill();g.strokeStyle='#fffefa';g.lineWidth=1.5;g.stroke();txt(g,'O',cx-13,cy+16,{color:colors.text,size:12});
   }
  };
 }
 window.PraxisMolecularDegrees={create};
})();
