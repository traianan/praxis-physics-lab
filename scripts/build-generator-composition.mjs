/** Package the application's authoritative scene for the HyperFrames CLI. */
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
const root=new URL('../',import.meta.url),out=new URL('outputs/generator-hyperframes/',root),assets=new URL('assets/',out);
await mkdir(assets,{recursive:true});
let html=await readFile(new URL('public/simulari/generator-electric/hyperframes/index.html',root),'utf8');
html=html.replaceAll('../style.css','assets/style.css').replaceAll('../../../vendor/gsap/gsap.min.js','assets/gsap.min.js').replaceAll('../scene3d.js','./assets/scene3d.js').replaceAll('../../../shared/generator-model.js','./assets/generator-model.js');
await writeFile(new URL('index.html',out),html);
let scene=await readFile(new URL('public/simulari/generator-electric/scene3d.js',root),'utf8');scene=scene.replace('../../vendor/three/three.module.js','./three.module.js');await writeFile(new URL('scene3d.js',assets),scene);
for(const [source,name]of [['public/simulari/generator-electric/assembly-geometry.js','assembly-geometry.js'],['public/shared/generator-model.js','generator-model.js'],['public/simulari/generator-electric/style.css','style.css'],['public/vendor/gsap/gsap.min.js','gsap.min.js'],['public/vendor/three/three.module.js','three.module.js'],['public/vendor/three/three.core.js','three.core.js']])await cp(new URL(source,root),new URL(name,assets));
await cp(new URL('public/simulari/generator-electric/hyperframes/DESIGN.md',root),new URL('DESIGN.md',out));
console.log('HyperFrames composition: outputs/generator-hyperframes');
