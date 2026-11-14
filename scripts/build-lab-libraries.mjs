// Optional libraries: local classic scripts also usable by standalone file:// lessons.
import {build} from 'esbuild';
import {readFile, writeFile, mkdir, readdir, copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'public/vendor/lab-libraries');
const entries=[
  ['konva','PraxisKonva',"export {default} from 'konva';"],
  ['planck','PraxisPlanck',"export * from 'planck';"],
  ['mathjs','PraxisNumerics',"export {lusolve, unit, complex} from 'mathjs';"],
  ['uplot','PraxisUPlot',"export {default} from 'uplot';"],
  ['zod','PraxisValidation',"export {z} from 'zod';"],
];
await mkdir(path.join(output,'licenses'),{recursive:true});
const manifest={libraries:[],licenses:[]};
const packages=new Set();
for(const [name,globalName,contents] of entries){
  const pkg=JSON.parse(await readFile(path.join(root,'node_modules',name,'package.json'),'utf8'));
  const result=await build({stdin:{contents,resolveDir:root,sourcefile:name+'.js'},bundle:true,
    platform:'browser',format:'iife',globalName,target:['es2020'],minify:true,
    legalComments:'linked',metafile:true,outfile:path.join(output,name+'.min.js')});
  const bundledInputs=Object.values(result.metafile.outputs).flatMap(item=>Object.entries(item.inputs).filter(([,value])=>value.bytesInOutput>0).map(([name])=>name));
  for(const input of bundledInputs){
    const match=input.replaceAll('\\','/').match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    if(match)packages.add(match[1]);
  }
  const bytes=await readFile(path.join(output,name+'.min.js'));
  manifest.libraries.push({name,version:pkg.version,license:pkg.license,globalName,
    file:name+'.min.js',bytes:bytes.length,gzipBytes:gzipSync(bytes).length});
}
await copyFile(path.join(root,'node_modules/uplot/dist/uPlot.min.css'),path.join(output,'uPlot.min.css'));
for(const name of [...packages].sort()){
  const dir=path.join(root,'node_modules',name);
  const pkg=JSON.parse(await readFile(path.join(dir,'package.json'),'utf8'));
  const files=(await readdir(dir)).filter(file=>/^(licen[cs]e|copying|notice)([.-]|$)/i.test(file));
  if(!files.length)throw new Error('Missing license: '+name);
  for(const file of files){
    const target=name.replaceAll('/','__')+'-'+file;
    await copyFile(path.join(dir,file),path.join(output,'licenses',target));
    manifest.licenses.push({package:name,version:pkg.version,file:'licenses/'+target});
  }
}
await writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Optional laboratory libraries prepared: '+entries.map(([name])=>name).join(', '));
