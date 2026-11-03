()=>{
 const root=document.querySelector('#praxis-original')||document.body,walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),findings=[];
 const pattern=/(?<![\p{L}\p{N}_])[A-Za-zΑ-ω]_(?:\{[^}]+\}|[\p{L}\p{N}]+)/gu;
 let node;while(node=walker.nextNode()){
  const text=node.data;if(!text.includes('_'))continue;
  const parent=node.parentElement;if(!parent||parent.closest('script,style,math,.katex,sub,sup,code,pre,textarea,option,[hidden],[inert]')||!parent.checkVisibility())continue;
  const range=document.createRange();range.selectNodeContents(node);if(!range.getBoundingClientRect().width)continue;
  const matches=[...text.matchAll(pattern)].map(m=>m[0]);if(!matches.length)continue;
  findings.push({text:text.trim().slice(0,400),matches,tag:parent.tagName,id:parent.id,className:typeof parent.className==='string'?parent.className:'SVG',section:parent.closest('section')?.id});
 }
 return findings;
}
