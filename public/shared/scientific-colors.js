/* The shared scientific palette for every Praxis laboratory, Canvas, SVG and legends. */
(() => {
 if(window.PraxisScientificColors)return;
 const palettes={
  praxis:{red:'#b54d45',blue:'#487ca2',green:'#43876f',orange:'#b28b3b',purple:'#83689e',teal:'#5c9996',yellow:'#b6a455'},
  vivid:{red:'#ed2929',blue:'#0066ff',green:'#00a350',orange:'#ff8a00',purple:'#922de0',teal:'#00a2be',yellow:'#f4c400'}
 };
 const aliases={a:'red',b:'blue',c:'green',o:'orange',plum:'purple',x:'blue',v:'orange',acc:'green',other:'purple'};
 const groups={
  red:['#c8402a','#ef4444','#dc2626','#f87171','#ff6b6b','#c23b4e','#b77783','#ee2450','#f0184e','#f02020','#ad655d'],
  blue:['#1f5a8a','#2a78d6','#3987e5','#3b82f6','#2563eb','#60a5fa','#93c5fd','#1d4ed8','#3879ac','#005be8','#4f6fb8','#778eb8','#2855f4','#2155ff'],
  green:['#2e7d57','#1baf7a','#199e70','#22c55e','#16a34a','#10b981','#34d399','#287c61','#009b50','#2e9d4f','#587c69','#009d45','#578a73','#00a949'],
  orange:['#b07a12','#eb6834','#d95926','#f59e0b','#98751d','#b67829','#f06b00','#e68a00','#e0703a','#c4896d','#ff7417','#bd8667','#ff7a00','#e08a1e','#ad8748','#f18a00','#ff9d00','#b78d51'],
  purple:['#7b3f61','#4a3aa7','#9085e9','#8b5cf6','#a855f7','#a3497e','#ec4899','#f472b6','#7762af','#7b2cff','#8a4fa3','#a084b8','#a32de4','#88769c','#9b20ef','#a527f5','#a67895','#c0397e','#9c718e','#ec008c','#e600a9'],
  teal:['#2a7f86','#06b6d4','#0ea5e9'],yellow:['#eab308','#fbbf24']
 };
 const sources={};for(const [role,values]of Object.entries(groups))for(const value of values)sources[value]=role;
 for(const palette of Object.values(palettes))for(const [role,value]of Object.entries(palette))sources[value]=role;
 const mode=value=>value==='vivid'?'vivid':'praxis';
 function palette(value){const p=palettes[mode(value)];return {...p,...Object.fromEntries(Object.entries(aliases).map(([key,role])=>[key,p[role]]))};}
 function color(value,scheme){
  if(typeof value!=='string')return value;const p=palettes[mode(scheme)],key=value.toLowerCase();
  if(sources[key])return p[sources[key]];
  const hexAlpha=key.match(/^(#[0-9a-f]{6})([0-9a-f]{2})$/);if(hexAlpha&&sources[hexAlpha[1]])return p[sources[hexAlpha[1]]]+hexAlpha[2];
  const rgb=key.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\s*\)$/);
  if(rgb){const hex='#'+rgb.slice(1,4).map(n=>(+n).toString(16).padStart(2,'0')).join('');if(sources[hex]){const target=p[sources[hex]];return 'rgba('+[1,3,5].map(i=>parseInt(target.slice(i,i+2),16)).join(',')+','+(rgb[4]??'1')+')';}}
  return value;
 }
 function apply(value){const scheme=mode(value);document.documentElement.dataset.courseColors=scheme;for(const [role,hex]of Object.entries(palettes[scheme]))document.documentElement.style.setProperty('--praxis-science-'+role,hex);return palette(scheme);}
 // Optics uses roles for object/image, surfaces and three construction rays.
 const opticsRoles={'#ce963f':'orange','#c38e39':'orange','#4f9698':'blue','#558f90':'blue','#c28b3b':'orange','#4b9a8a':'green','#778caf':'blue','#ba9a61':'orange','#a5b4a7':'red','#65a69d':'teal','#6e9e95':'teal','#71968b':'yellow','#a2b6ac':'yellow','#79599b':'purple','#436eac':'blue','#dd9992':'red','#d3a34f':'orange'};
 function optics(markup,scheme){if(mode(scheme)!=='vivid')return markup;const p=palettes.vivid;return markup.replace(/#[0-9a-f]{6}/gi,hex=>opticsRoles[hex.toLowerCase()]?p[opticsRoles[hex.toLowerCase()]]:hex);}
 window.PraxisScientificColors={palette,color,apply,optics};
})();
