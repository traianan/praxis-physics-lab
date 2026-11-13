// Clean theoretical diagrams. Wires stop exactly at component terminals;
// branch junctions sit outside symbols, and labels stay inside the viewBox.
function networkSvgText(el,value){
  const text=String(value);el.textContent='';
  // SVG has no HTML <sub>; use explicit baseline shifts, including word indices.
  const pattern=/_([A-Za-z]+)/g;let start=0,match;
  while((match=pattern.exec(text))){el.append(document.createTextNode(text.slice(start,match.index)));const sub=document.createElementNS(NS,'tspan');sub.setAttribute('baseline-shift','sub');sub.setAttribute('font-size','75%');sub.textContent=match[1];el.append(sub);start=pattern.lastIndex;}
  el.append(document.createTextNode(text.slice(start)));
}
function networkSourceGaps(svg,flowLayer){
  const id=svg.id+'-source-gaps';svg.querySelector('#'+id)?.remove();
  const mask=svgEl('mask',{id,maskUnits:'userSpaceOnUse',x:-1000,y:-1000,width:4000,height:4000},svg);
  svgEl('rect',{x:-1000,y:-1000,width:4000,height:4000,fill:'white'},mask);
  svg.querySelectorAll('.batt-plate').forEach(plate=>{
    const group=plate.parentElement,thin=group.querySelector('.batt-thin');if(!thin)return;
    const x=Math.min(+plate.getAttribute('x1'),+thin.getAttribute('x1'));
    const y=Math.min(+plate.getAttribute('y1'),+thin.getAttribute('y1'));
    const right=Math.max(+plate.getAttribute('x2'),+thin.getAttribute('x2'));
    const bottom=Math.max(+plate.getAttribute('y2'),+thin.getAttribute('y2'));
    const horizontal=plate.getAttribute('x1')===plate.getAttribute('x2');
    const box=horizontal?{x:x+1,y:y-2,width:right-x-2,height:bottom-y+4}:{x:x-2,y:y+1,width:right-x+4,height:bottom-y-2};
    // Cover the underlying wire only between plates; keep all source terminals.
    group.querySelectorAll(':scope > .network-source-gap').forEach(e=>e.remove());
    const cover=svgEl('rect',{...box,fill:'#0b192b',class:'network-source-gap'});group.insertBefore(cover,plate);
    let matrix=new DOMMatrix();const chain=[];for(let p=group;p&&p!==svg;p=p.parentElement)chain.unshift(p);
    for(const p of chain){const t=p.transform?.baseVal.consolidate();if(t)matrix=matrix.multiply(t.matrix);}
    svgEl('rect',{...box,fill:'black',transform:`matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`},mask);
  });
  flowLayer.setAttribute('mask',`url(#${id})`);
}
function networkDiagram(svg,w,h){
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML='';
  const g=svgEl('g',{'class':'network-schematic'},svg);
  const wire=d=>svgEl('path',{d,fill:'none',stroke:'#9bb1c9','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},g);
  const label=(x,y,text,color='#bceaff')=>svgEl('text',{x,y,text,fill:color,'font-size':14,'text-anchor':'middle'},g);
  const dot=(x,y)=>svgEl('circle',{cx:x,cy:y,r:3,fill:'#67dbe9'},g);
  const resistor=(x,y,name)=>{svgEl('rect',{x:x-24,y:y-9,width:48,height:18,rx:2,fill:'#182b43',stroke:'#9bb1c9','stroke-width':2},g);label(x,y-17,name);};
  const meter=(x,y,name)=>{svgEl('circle',{cx:x,cy:y,r:13,fill:'#0b192b',stroke:'#67dbe9','stroke-width':2},g);label(x,y+5,name);};
  // Horizontal source: terminal plates at x−6 and x+6, positive on right.
  const battery=(x,y,name='E, r')=>{wire(`M${x-24} ${y} H${x-6} M${x+6} ${y} H${x+24}`);for(const [dx,half] of [[-6,10],[6,17]])svgEl('path',{d:`M${x+dx} ${y-half} V${y+half}`,stroke:'#ffd45b','stroke-width':2},g);label(x,y-24,name,'#ffd45b');};
  return {wire,label,dot,resistor,meter,battery,g};
}
drawSchSeries=function(svg){
  const d=networkDiagram(svg,460,210);
  d.wire('M40 60 H116 M164 60 H266 M314 60 H420 V165 H254 M206 165 H40 V60');
  d.resistor(140,60,'R₁');d.resistor(290,60,'R₂');d.battery(230,165);
  for(const [x,u] of [[140,'U₁'],[290,'U₂']]){
    d.wire(`M${x-38} 60 V105 H${x-13} M${x+13} 105 H${x+38} V60`);
    d.dot(x-38,60);d.dot(x+38,60);d.meter(x,105,'V');d.label(x,133,u);
  }
  d.label(105,190,'I = I₁ = I₂');
};
drawSchParallel=function(svg){
  const d=networkDiagram(svg,460,230);
  d.wire('M45 55 H176 M224 55 H302 M328 55 H410 V185 H334 M286 185 H193 M167 185 H45 V55 M45 115 H176 M224 115 H302 M328 115 H410');
  d.resistor(200,55,'R₁');d.resistor(200,115,'R₂');d.meter(315,55,'A₁');d.meter(315,115,'A₂');d.meter(180,185,'A');d.battery(310,185,'E');
  d.dot(45,115);d.dot(410,115);d.label(28,105,'M');d.label(430,105,'N');d.label(100,215,'I = I₁ + I₂');
};
drawSchGenSer=function(svg){
  const d=networkDiagram(svg,300,150);
  d.wire('M30 55 H76 M124 55 H176 M224 55 H270 V110 H174 M126 110 H30 V55');
  d.battery(100,55);d.battery(200,55);d.resistor(150,110,'R');
};
drawSchGenPar=function(svg){
  const d=networkDiagram(svg,300,200);
  d.wire('M35 50 H126 M174 50 H265 V160 H174 M126 160 H35 V50 M35 105 H126 M174 105 H265');
  d.battery(150,50);d.battery(150,105);d.resistor(150,160,'R');
  d.dot(35,105);d.dot(265,105);d.label(18,96,'A');d.label(282,96,'B');
};
drawHeroG=function(svg){
  const d=networkDiagram(svg,320,330);
  d.label(45,25,'serie');
  d.wire('M30 65 H76 M124 65 H196 M244 65 H290 V120 H184 M136 120 H30 V65');
  d.resistor(100,65,'R₁');d.resistor(220,65,'R₂');d.battery(160,120);
  d.label(50,175,'paralel');
  d.wire('M30 210 H136 M184 210 H290 V295 H184 M136 295 H30 V210 M30 250 H136 M184 250 H290');
  d.resistor(160,210,'R₁');d.resistor(160,250,'R₂');d.battery(160,295);
  d.dot(30,250);d.dot(290,250);
};
drawSchSunt=function(svg){
  const d=networkDiagram(svg,440,180);
  d.wire('M30 60 H207 M233 60 H410 M95 60 V125 H196 M244 125 H345 V60');
  d.meter(220,60,'A');d.resistor(220,125,'Rₛ');d.dot(95,60);d.dot(345,60);
  d.label(95,40,'B');d.label(345,40,'C');d.label(220,32,'I_A');d.label(220,89,'R_A');d.label(65,45,'I');d.label(125,110,'Iₛ');
};
drawSchAdd=function(svg){
  const d=networkDiagram(svg,440,180);
  d.wire('M40 120 V55 H127 M153 55 H256 M304 55 H400 V120 H244 M196 120 H40');
  d.meter(140,55,'V');d.resistor(280,55,'Rₐ');d.resistor(220,120,'R');
  d.dot(40,120);d.dot(400,120);d.label(23,114,'A');d.label(417,114,'B');d.label(140,85,'U_V');d.label(280,85,'U_a');d.label(220,161,'U = U_V + U_a');
};
