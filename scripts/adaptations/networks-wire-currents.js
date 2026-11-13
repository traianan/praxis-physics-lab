// Recover conductor currents from terminal injections without changing the MNA
// solution. Equal ideal parallel paths use the minimum-norm distribution.
function networkWireCurrents(points,segments,parts,elements){
 const n=points.length,adj=Array.from({length:n},()=>[]),injection=new Float64Array(n);
 const currents=new Map(elements.map(e=>[e.piece,e.I]));
 for(const {p,a,b} of parts){let i=currents.get(p.id)||0;if(p.type==='battery'&&p.flip)i=-i;injection[a]-=i;injection[b]+=i;}
 segments.forEach(([a,b],i)=>{if(a!==b){adj[a].push([b,i]);adj[b].push([a,i]);}});
 const seen=new Set(),potential=new Float64Array(n);
 for(let start=0;start<n;start++){
  if(seen.has(start))continue;const nodes=[start];seen.add(start);
  for(let j=0;j<nodes.length;j++)for(const [v] of adj[nodes[j]])if(!seen.has(v)){seen.add(v);nodes.push(v);}
  const free=nodes.slice(1),index=new Map(free.map((v,i)=>[v,i])),m=free.length;
  const matrix=free.map(v=>{const row=new Float64Array(m+1);row[index.get(v)]=adj[v].length;for(const [w] of adj[v])if(index.has(w))row[index.get(w)]--;row[m]=injection[v];return row;});
  for(let c=0;c<m;c++){
   let pivot=c;for(let r=c+1;r<m;r++)if(Math.abs(matrix[r][c])>Math.abs(matrix[pivot][c]))pivot=r;
   [matrix[c],matrix[pivot]]=[matrix[pivot],matrix[c]];const d=matrix[c][c];if(Math.abs(d)<1e-12)continue;
   for(let k=c;k<=m;k++)matrix[c][k]/=d;
   for(let r=0;r<m;r++)if(r!==c){const f=matrix[r][c];for(let k=c;k<=m;k++)matrix[r][k]-=f*matrix[c][k];}
  }
  free.forEach((v,i)=>potential[v]=matrix[i][m]);
 }
 return segments.map(([a,b,wire])=>({wire,x1:points[a].x,y1:points[a].y,x2:points[b].x,y2:points[b].y,I:potential[a]-potential[b]}));
}
