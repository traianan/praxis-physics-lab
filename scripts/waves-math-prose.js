function lessonMath(value){
 if(Array.isArray(value))return value.map(lessonMath);
 if(typeof value!=='string')return value;
 if(window.PraxisWaveMath?.bare(value))return Cv(LessonMathText,{children:value});
 value=value.replace(/\b([A-Za-z])([0-9]+)\b/g,'$1_$2').replace(/\bv([RSLP])\b/g,'v_$1').replace(/\bfnm\b/g,'f_nm').replace(/\bfn\b/g,'f_n');
 const low={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','ₙ':'n','ₒ':'o','ₕ':'h','ₚ':'p','ₛ':'s','ₘ':'m','ₜ':'t'},high={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'−','⁺':'+'};
 const re=/([\p{L}\p{N}])(?:_([\p{L}\p{N}]+)|([₀₁₂₃₄₅₆₇₈₉ₙₒₕₚₛₘₜ]+))([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]*)|([\p{L}\p{N}])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/gu;
 const out=[];let last=0;
 for(const m of value.matchAll(re)){
  if(m.index>last)out.push(value.slice(last,m.index));
  const base=m[1]||m[5],sub=m[2]||(m[3]?[...m[3]].map(c=>low[c]).join(''):''),sup=[...(m[4]||m[6]||'')].map(c=>high[c]).join('');
  out.push(Cv('span',{className:'wave-script',children:[base,sub&&Cv('sub',{'data-no-i18n':'',children:sub}),sup&&Cv('sup',{'data-no-i18n':'',children:sup})]},'script-'+m.index));
  last=m.index+m[0].length;
 }
 if(!out.length)return value;if(last<value.length)out.push(value.slice(last));return out;
}
