const names = new TextDecoder('utf-8',{fatal:true});

// Praxis archives use local headers with lengths and raw DEFLATE entries.
export async function* readPraxisZip(buffer){
 const view=new DataView(buffer);
 const files=new Set();
 let offset=0;
 while(offset+4<=view.byteLength&&view.getUint32(offset,true)===0x04034b50){
  if(offset+30>view.byteLength)throw Error('Antet ZIP incomplet.');
  const flags=view.getUint16(offset+6,true);
  const method=view.getUint16(offset+8,true);
  const packed=view.getUint32(offset+18,true);
  const size=view.getUint32(offset+22,true);
  const nameLength=view.getUint16(offset+26,true);
  const extraLength=view.getUint16(offset+28,true);
  const start=offset+30+nameLength+extraLength;
  if(flags!==0x800||method!==8||start+packed>view.byteLength)throw Error('Format ZIP incompatibil.');
  const path=names.decode(new Uint8Array(buffer,offset+30,nameLength)).split('/');
  if(path.some(part=>!part||part==='.'||part==='..'||part.includes('\\')))throw Error('Cale ZIP nevalidă.');
  const file=path.map(encodeURIComponent).join('/');
  if(files.has(file))throw Error('Fișier ZIP duplicat.');
  files.add(file);
  const compressed=new Blob([new Uint8Array(buffer,start,packed)]);
  const decoded=await new Response(compressed.stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
  if(decoded.byteLength!==size)throw Error('Fișier ZIP incomplet.');
  yield {file,decoded};
  offset=start+packed;
 }
 if(!files.has('index.html')||offset+4>view.byteLength||view.getUint32(offset,true)!==0x02014b50)throw Error('Arhivă Praxis incompletă.');
}
