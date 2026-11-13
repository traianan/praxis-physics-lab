import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const js=await readFile(new URL('../public/simulari/interactiunea-gravitationala/app.js',import.meta.url),'utf8');
const draw=js.slice(js.indexOf('function orbitDraw()'),js.indexOf('function render()'));
test('gravity orbit keeps the satellite and vector labels inside the scene throughout a revolution',()=>{
 for(const [w,h]of [[250,230],[326,230],[658,230],[1200,230],[326,300]])for(const oh of [150,400,20200,35786,40000])for(let step=0;step<72;step++){
  const angle=step*Math.PI/36,points=[],labels=[];let tx=0,ty=0,rotation=0;
  const point=(x,y)=>points.push([tx+x*Math.cos(rotation)-y*Math.sin(rotation),ty+x*Math.sin(rotation)+y*Math.cos(rotation)]);
  const ctx={save(){},restore(){tx=ty=rotation=0;},translate(x,y){tx=x;ty=y;},rotate(a){rotation=a;},beginPath(){},closePath(){},stroke(){},fill(){},setLineDash(){},
   moveTo:point,lineTo:point,fillRect(x,y,rw,rh){for(const [xx,yy]of [[x,y],[x+rw,y],[x,y+rh],[x+rw,y+rh]])point(xx,yy);},strokeRect(){},
   arc(x,y,r){for(const [dx,dy]of [[r,0],[-r,0],[0,r],[0,-r]])point(x+dx,y+dy);},fillText(){}};
  const sandbox={Math,state:{oh},angle,n:String,$:()=>({checked:true}),context:()=>({ctx,w,h}),line(c,x1,y1,x2,y2){point(x1,y1);point(x2,y2);},arrow(c,x,y,xx,yy){point(x,y);point(xx,yy);},ball(c,x,y,r){ctx.arc(x,y,r);},vectorLabel(c,text,x,y){labels.push([text,x,y]);}};
  vm.runInNewContext(draw+';orbitDraw();',sandbox);
  assert.ok(points.every(([x,y])=>x>=0&&x<=w&&y>=0&&y<=h),JSON.stringify({w,h,oh,step,points:points.filter(([x,y])=>x<0||x>w||y<0||y>h)}));
  assert.equal(labels.length,2);for(const [text,x,y]of labels){assert.ok(x>=12&&x+14<=w-10&&y-19>=30&&y+4<=h-25,JSON.stringify({w,h,oh,step,text,x,y}));}
 }
});
