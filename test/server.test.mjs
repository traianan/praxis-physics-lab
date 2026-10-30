import test from 'node:test';import assert from 'node:assert/strict';
import {createServer} from '../scripts/serve.mjs';
test('local distribution serves catalogue, assets and optics with correct MIME types',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try { const base=`http://127.0.0.1:${server.address().port}`;
  for(const [file,mime] of [['/','text/html'],['/app.js','text/javascript'],['/board.js','text/javascript'],['/shared/sound.js','text/javascript'],['/shared/i18n.js','text/javascript'],['/locales/common/en.json','application/json'],['/config/advertising.json','application/json'],['/design-system/tokens.css','text/css'],['/design-system/components.css','text/css'],['/design-system/laboratory.css','text/css'],['/shared/waves.js','text/javascript'],['/simulari/unde-mecanice/','text/html'],['/catalog.js','text/javascript'],['/styles.css','text/css'],['/board.css','text/css'],['/assets/optica.svg','image/svg+xml'],['/simulari/oglinzi-si-lentile/','text/html']]){
   const response=await fetch(base+file);assert.equal(response.status,200,file);assert.ok(response.headers.get('content-type').startsWith(mime),file);assert.ok((await response.text()).length>50);
  }
  assert.equal((await fetch(base+'/inexistent.html')).status,404);
  const escape=await fetch(base+'/%2e%2e%5cpackage.json');assert.notEqual(escape.status,200);
 } finally {await new Promise(r=>server.close(r));}
});
