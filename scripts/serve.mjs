import http from 'node:http';import {readFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.woff2':'font/woff2','.png':'image/png','.zip':'application/zip'};
export function createServer(){return http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname.includes('\0')){res.writeHead(400).end();return;}
 const requested=pathname.endsWith('/')?pathname+'index.html':pathname;const target=path.resolve(root,'.'+requested);
 if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
 const body=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Pagina nu există.');}});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4190),host=process.argv.includes('--lan')?'0.0.0.0':'127.0.0.1';const server=createServer();
 server.on('error',e=>{console.error(`Serverul nu a pornit: ${e.code}. Poți alege alt port prin variabila PORT.`);process.exitCode=1;});
 server.listen(port,host,()=>console.log(`Praxis Fizică — http://127.0.0.1:${port}\n${host==='0.0.0.0'?'Acces în rețeaua locală activat (--lan).':'Acces numai de pe acest calculator.'}\nOprire: Ctrl+C. Nu este necesar internetul.`));
}
