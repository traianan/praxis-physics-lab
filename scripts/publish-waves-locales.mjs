import{readFile,writeFile,mkdir}from'node:fs/promises';
const rows=JSON.parse(await readFile('outputs/waves-text.json','utf8')),translations=new Map();for(const line of (await readFile('outputs/waves-translations.txt','utf8')).split(/\r?\n/)){const m=line.match(/^(\d+)\|(.*)$/);if(m)translations.set(+m[1],m[2]);}
const groups={};const math=/_([A-Za-zÀ-ž][A-Za-z0-9]*|[0-9]+)|([₀₁₂₃₄₅₆₇₈₉ₙₒ]+)|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/g;
for(const [index,row]of rows.entries()){
 if(/^:root\{|^bold \d+px|^hsla?\(|^Arrow|^Home$|^End$|^\(prefers-/.test(row.text))continue;
 const group=groups[row.group]??={};group[row.text]=translations.get(index)??row.text;
 const mathText=s=>s.replace(/\bf0\b/g,'f₀').replace(/\bfnm\b/g,'f_nm').replace(/\bfn\b/g,'f_n');
 const sourceParts=mathText(row.text).split(math).filter((_,i)=>i%4===0),targetParts=mathText(group[row.text]).split(math).filter((_,i)=>i%4===0);
 if(sourceParts.length===targetParts.length)for(let i=0;i<sourceParts.length;i++){const a=sourceParts[i].trim(),b=targetParts[i].trim();if(a&&b&&/[A-Za-zăâîșț]/.test(a)&&a!==b&&!Object.hasOwn(group,a))group[a]=b;}
}
Object.assign(groups.ui,{"Pornește instrumentul pentru a afișa semnalul.": "Start the instrument to display the signal."},{"Comută tema luminoasă/întunecată":"Switch light/dark theme","Coarda vibrantă · reprezentare încetinită": "Vibrating string · slowed illustration", "Forma de undă a sunetului generat": "Waveform of the generated sound", "Modurile castronului · reprezentare schematică": "Bowl modes · schematic illustration", "Spectrul sunetului generat": "Spectrum of the generated sound", "Bara vibrantă · reprezentare încetinită": "Vibrating bar · slowed illustration", "ciupire": "pluck", "bară liberă-libera": "free–free bar"},{'Unde mecanice · Lecție interactivă':'Mechanical waves · Interactive lesson','Lecție interactivă':'Interactive lesson','Transversale:':'Transverse:','Longitudinale:':'Longitudinal:','Energie și intensitate':'Energy and intensity','Difracție Fraunhofer':'Fraunhofer diffraction','Volum':'Volume','Laborator de unde și acustică':'Wave and acoustics laboratory','Teme din {p0}':'Topics in {p0}','Reascultă înregistrarea: {p0}':'Replay recording: {p0}','Descarcă înregistrarea (.{p0})':'Download recording (.{p0})','Fișier: {p0} · Se păstrează pe disc după descărcare.':'File: {p0} · Kept on disk after downloading.','sonometrul':'the sonometer','noduri':'nodes','retragere':'recession','elipse':'ellipses','Reflexia:':'Reflection:','Noduri:':'Nodes:','Ventre:':'Antinodes:','Tsunami:':'Tsunami:','◀ Prev':'◀ Previous','Next ▶':'Next ▶','Scade Volum cu 1':'Decrease volume by 1','Crește Volum cu 1':'Increase volume by 1'});
const physicsTranslations=JSON.parse((await readFile('scripts/wave-physics-translations.json','utf8')).replace(/^\uFEFF/,''));
for(const [source,target]of Object.entries(physicsTranslations)){
 groups.ui[source]=target;
 const a=source.split(math).filter((_,i)=>i%4===0),b=target.split(math).filter((_,i)=>i%4===0);
 if(a.length===b.length)for(let i=0;i<a.length;i++)if(a[i].trim()&&b[i].trim())groups.ui[a[i].trim()]=b[i].trim();
}
const overrides=JSON.parse(await readFile('scripts/waves-locale-overrides.json','utf8'));
for(const [group,messages]of Object.entries(groups))for(const locale of ['ro','en']){const folder='public/locales/courses/unde-mecanice/'+group;await mkdir(folder,{recursive:true});await writeFile(folder+'/'+locale+'.json',JSON.stringify({locale,namespace:'courses/unde-mecanice/'+group,messages:locale==='en'?messages:Object.fromEntries(Object.keys(messages).map(k=>[k,overrides.ro?.[k]??k]))},null,2)+'\n');}
const remaining=rows.map((r,i)=>({...r,index:i,english:translations.get(i)??r.text})).filter(r=>/[ăâîșțĂÂÎȘȚ]/.test(r.english));await writeFile('outputs/waves-untranslated.json',JSON.stringify(remaining,null,2));console.log(Object.keys(groups).length+' wave namespaces; '+remaining.length+' source fragments with Romanian diacritics remaining.');for(const r of remaining)console.log(r.index+'|'+r.text);
