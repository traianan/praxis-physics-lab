import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

// These suites need upstream originals absent from a Git checkout. In mixed
// suites only the individual tests that require local originals are skipped.
const localOnly=new Set(['local-source-provenance.test.mjs','waves-formula-content.test.mjs']);
const tests=(await readdir(new URL('../test/',import.meta.url))).filter(file=>file.endsWith('.test.mjs')&&!localOnly.has(file)).sort().map(file=>'test/'+file);
console.log('Local-only suites:',[...localOnly].join(', '));
const result=spawnSync(process.execPath,['--test',...tests],{
 cwd:new URL('../',import.meta.url),stdio:'inherit',env:{...process.env,PRAXIS_CHECKOUT_ONLY:'1'}
});
if(result.error)throw result.error;
process.exitCode=result.status??1;
