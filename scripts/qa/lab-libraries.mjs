import {chromium} from 'playwright-core';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const out=path.resolve('outputs/library-review');
await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile('public/vendor/lab-libraries/manifest.json','utf8'));
const vendor='../../public/vendor/lab-libraries/';
await writeFile(path.join(out,'smoke.html'),`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${vendor}uPlot.min.css"></head><body><div id="scene"></div><div id="chart"></div>${manifest.libraries.map(lib=>`<script src="${vendor}${lib.file}"></script>`).join('')}</body></html>`);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],network=[];
try{
  const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,route=>{network.push(route.request().url());return route.abort();});
  await page.goto(pathToFileURL(path.join(out,'smoke.html')).href);
  const result=await page.evaluate(()=>{
    const K=PraxisKonva.default, P=PraxisPlanck, M=PraxisNumerics, z=PraxisValidation.z;
    const stage=new K.Stage({container:'scene',width:320,height:200});
    const layer=new K.Layer();stage.add(layer);
    const rect=new K.Rect({x:10,y:10,width:40,height:40,fill:'green',draggable:true});layer.add(rect);layer.draw();
    const world=new P.World(P.Vec2(0,-9.81));
    const a=world.createDynamicBody(P.Vec2(-2,0)),b=world.createDynamicBody(P.Vec2(2,0));
    a.createFixture(P.Box(.5,.5),3);b.createFixture(P.Box(.5,.5),1);
    const pulley=new P.PulleyJoint({},a,b,P.Vec2(-2,5),P.Vec2(2,5),a.getPosition(),b.getPosition(),1);
    world.createJoint(pulley);
    for(let i=0;i<120;i++)world.step(1/120);
    // 9 V source, 1k + 2k voltage divider: node voltage is 6 V.
    const voltage=M.lusolve([[1/1000+1/2000]],[9/1000])[0][0];
    const schema=z.object({mass:z.number().positive(),kind:z.literal('body')});
    const good=schema.safeParse({mass:3,kind:'body'}).success;
    const bad=schema.safeParse({mass:-1,kind:'body'}).success;
    const chart=new PraxisUPlot.default({width:320,height:200,scales:{x:{time:false}},series:[{}, {label:'x',stroke:'green'}]},[[0,1,2],[0,1,4]],document.getElementById('chart'));
    const rendered=!!document.querySelector('#scene canvas')&&!!document.querySelector('#chart canvas');
    chart.setData([[0,1,2],[0,2,8]]);
    const result={voltage,centimeters:M.unit('1 m').toNumber('cm'),good,bad,rendered,
      acceleration:-a.getLinearVelocity().y,ropeLength:pulley.getCurrentLengthA()+pulley.getCurrentLengthB(),chartValue:chart.data[1][2]};
    chart.destroy();stage.destroy();return result;
  });
  assert.ok(Math.abs(result.voltage-6)<1e-10);
  assert.equal(result.centimeters,100);assert.equal(result.good,true);assert.equal(result.bad,false);
  assert.equal(result.rendered,true);assert.equal(result.chartValue,8);
  assert.ok(Math.abs(result.acceleration-4.905)<.01,JSON.stringify(result));
  assert.ok(Math.abs(result.ropeLength-10)<.001);
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  await writeFile(path.join(out,'smoke-result.json'),JSON.stringify({result,errors,network},null,2));
  console.log('PASS: five browser bundles, Konva/uPlot rendering, plot update, Atwood/rope constraint, voltage divider, units, JSON validation; file:// without HTTP.');
}finally{await browser.close();}
