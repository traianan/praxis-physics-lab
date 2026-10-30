import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {withLinkPresentation} from '../scripts/link-presentation.mjs';
test('global link styling skips HTML strings in scripts and remains idempotent',()=>{
 const html='<html><head><script>const report="</head><body>Report</body>";</script></head><body><a href="lesson.html">Lesson</a></body></html>',styled=withLinkPresentation(html);
 assert.equal(withLinkPresentation(styled),styled);assert.equal((styled.match(/id="praxis-link-colors"/g)||[]).length,1);
 const script=styled.match(/<script>([\s\S]*?)<\/script>/)[1];assert.equal(script,'const report="</head><body>Report</body>";');new vm.Script(script);
 assert.ok(styled.indexOf('id="praxis-link-colors"')>styled.indexOf('</script>'));
 assert.match(styled,/a\[href\]:visited/);assert.match(styled,/--praxis-color-link/);
});
