import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
// These provenance/import-adapter suites require the intentionally untracked sources/.
// npm run check continues to run all suites on the maintainer's workstation.
const localOnly=new Set(['local-source-provenance.test.mjs','curvilinear.test.mjs','first-law.test.mjs','imported-courses.test.mjs','thermodynamics-readability.test.mjs','thermodynamics-resolution.test.mjs','waves-formula-content.test.mjs']);
const tests=(await readdir(new URL('../test/',import.meta.url))).filter(file=>file.endsWith('.test.mjs')&&!localOnly.has(file)).sort().map(file=>'test/'+file);
console.log('CI: source provenance suites retained in local npm run check:',[...localOnly].join(', '));
const result=spawnSync(process.execPath,['--test',...tests],{cwd:new URL('../',import.meta.url),stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
