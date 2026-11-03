import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
const base=new URL(process.argv.find(a=>a.startsWith('--base='))?.slice(7)||'https://praxis-physics-lab.vercel.app/');
const ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6)||'HEAD';
const output=path.resolve('D:/ProiecteAI/tmp/global-math');await mkdir(output,{recursive:true});
const files=execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r',ref],{encoding:'utf8'}).trim().split(/\r?\n/).filter(p=>p.startsWith('public/'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const results=[];let next=0;
await Promise.all(Array.from({length:4},async()=>{
 while(next<files.length){const file=files[next++],relative=file.slice(7);try{
  const local=await readFile(path.join('dist',relative));
  const response=await fetch(new URL(relative,base),{cache:'no-store',signal:AbortSignal.timeout(30000)});
  const remote=Buffer.from(await response.arrayBuffer());
  // Git checks text out as CRLF on Windows; Vercel builds the LF repository.
  const canonical=buffer=>/\.(?:html|css|js|json)$/i.test(relative)?Buffer.from(buffer.toString('utf8').replaceAll('\r\n','\n')):buffer;
  const localHash=digest(canonical(local)),onlineHash=digest(canonical(remote));
  results.push({file,status:response.status,local:localHash,online:onlineHash,byteExact:digest(local)===digest(remote),same:response.ok&&localHash===onlineHash});
 }catch(error){results.push({file,same:false,error:error.message});}}
}));
results.sort((a,b)=>a.file.localeCompare(b.file));
const report={base:base.href,ref,checkedAt:new Date().toISOString(),files:results.length,matches:results.filter(r=>r.same).length,results};
await writeFile(path.join(output,'online-assets.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({base:report.base,ref,files:report.files,matches:report.matches,mismatches:results.filter(r=>!r.same)},null,2));
if(results.some(r=>!r.same)||!files.length)process.exitCode=1;
