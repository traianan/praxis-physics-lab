// Minimal ZIP writer for local distributions: DEFLATE, UTF-8 names, no dependencies.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {deflateRawSync} from 'node:zlib';
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export async function zipDirectory(directory,destination){
 const local=[],central=[];let offset=0,count=0;
 async function visit(folder,prefix=''){
  for(const item of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
   const file=path.join(folder,item.name),relative=prefix+item.name;
   if(item.isDirectory()){await visit(file,relative+'/');continue;}if(!item.isFile())continue;
   const name=Buffer.from(relative),data=await readFile(file),compressed=deflateRawSync(data),crc=crc32(data);
   const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(name.length,26);
   const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);header.copy(entry,6,4,30);entry.writeUInt32LE(offset,42);
   local.push(header,name,compressed);central.push(entry,name);offset+=header.length+name.length+compressed.length;count++;
  }
 }
 await visit(directory);if(count>65535)throw new Error('ZIP64 is required');
 const index=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(count,8);end.writeUInt16LE(count,10);end.writeUInt32LE(index.length,12);end.writeUInt32LE(offset,16);
 await writeFile(destination,Buffer.concat([...local,index,end]));
}
