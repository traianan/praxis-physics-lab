import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adaptWaveFormulaContent,formulaContentTranslations,formulaContentOriginals,formulaContentCustomEnglish,correctFormulaText} from '../scripts/waves-formula-content-adapter.mjs';

const source=readFileSync(new URL('../sources/unde-mecanice/Unde-Mecanice.html',import.meta.url),'utf8');
test('worked-solution edits match the actual source literals and reverse exactly',()=>{
 const revised=adaptWaveFormulaContent(source);
 assert.equal(adaptWaveFormulaContent(revised,true),source);
 assert.ok(revised.includes('log₁₀(I/I₀) = log₁₀(10⁶) = 6'));
 assert.ok(revised.includes('ν₁ = v/(2L) ≈ 94.87/1.2 ≈ 79.06 Hz'));
 assert.ok(!revised.includes('"log10=6"'));
 assert.ok(!revised.includes('"n=2 => (2*2-1)=3"'));
 assert.ok(revised.includes('m = Δr/λ = 0.75/0.5 = 1.5'));
 const expected=Number(revised.match(/expected:([\d.]+),unit:"Hz"/)[1]);
 assert.ok(Math.abs(expected-Math.sqrt(90/.01)/(2*.6))<1e-12);
 assert.equal(expected.toFixed(2),'79.06');
 assert.ok(formulaContentTranslations['Constructivă: Δr = nλ ; Distructivă: Δr = (2n+1)λ/2 ; n = 0,1,2,…'].startsWith('Constructive:'));
});
test('substring-only formula edits retain the original English prose and lookup key',()=>{
 const ro='I=10⁻⁶ W/m². Calculează nivelul L=10·log(I/I₀) cu I₀=10⁻¹² W/m². (dB)';
 const en='I=10⁻⁶ W/m². Calculate the level L=10·log(I/I₀) with I₀=10⁻¹² W/m². (dB)';
 const revised=JSON.parse(adaptWaveFormulaContent(JSON.stringify(ro)).replace(/\/\*.*?\*\//g,''));
 const originalTranslations={[ro]:en};
 assert.equal(formulaContentOriginals[revised],ro);
 assert.equal(formulaContentCustomEnglish[revised],false);
 const translated=formulaContentCustomEnglish[revised]?formulaContentTranslations[revised]:correctFormulaText(originalTranslations[formulaContentOriginals[revised]],'en');
 assert.equal(translated,'I=10⁻⁶ W/m². Calculate the level L=10·log₁₀(I/I₀) with I₀=10⁻¹² W/m². (dB)');
 assert.ok(!translated.includes('Calculează'));
});
test('whole-literal corrections keep their newly authored English',()=>{
 const original='Δr=nλ → constr, Δr=(2n+1)λ/2 → distr';
 const revised=correctFormulaText(original);
 adaptWaveFormulaContent(JSON.stringify(original));
 assert.equal(formulaContentCustomEnglish[revised],true);
 assert.equal(formulaContentOriginals[revised],original);
 assert.equal(formulaContentTranslations[revised],'Constructive: Δr = nλ ; Destructive: Δr = (2n+1)λ/2 ; n = 0,1,2,…');
});
test('numbered solution strings receive formula corrections without losing their prefix',()=>{
 assert.equal(correctFormulaText('3. log10=6','en'),'3. log₁₀(I/I₀) = log₁₀(10⁶) = 6');
 assert.equal(correctFormulaText('2. ν₁=v/2L=94.87/1.2=79.05 Hz','en'),'2. ν₁ = v/(2L) ≈ 94.87/1.2 ≈ 79.06 Hz');
 assert.equal(correctFormulaText('1. I/I₀=10⁶','en'),'1. I/I₀=10⁶');
 assert.equal(correctFormulaText(null,'en'),null);
});
