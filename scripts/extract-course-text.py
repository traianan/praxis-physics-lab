import json,re,html
from pathlib import Path
from html.parser import HTMLParser
groups={}
def add(group,value,force=False):
    value=re.sub(r'\s+',' ',html.unescape(value)).strip()
    if not value or not re.search(r'[a-zA-ZăâîșțĂÂÎȘȚ]',value): return
    words={'corect','scor','test','probleme','origine','viteza','timpul','timp','pauza','accelerata','uniforma','rectilinie','circulara','eliptica','parabolica','deplasarea','calculator','sensul','modulul','observatie','rezolvare','cerinte','parcursa','semn','durata','poziția','reset','start','resetare','secunde','minute','resurse','definitie','un','sens','egali','opusul','versori','versorii','versor','versorul','vectorilor','poligonului','echilibru','repaus','pozitiv','negativ','paralele','egale','gata','excelent','nu','da','vezi','fals','nota','data','rezultat','istoric','exersare','reluare','componenta','componente','componentelor','normale','modul','unitar','egal','traiectoria','exemple','cuprins','fundal','drept','coliniari','perpendiculari','volum','aria','lungime','valoare','scalare','vectoriale'}
    if not force and not re.search(r'[ăâîșțĂÂÎȘȚ]|\s',value) and re.sub(r'[^a-zăâîșț]','',value.lower()) not in words: return
    if len(value)>2500 or re.match(r'^(?:rgba?\(|var\(|translate\(|(?:italic |bold |[0-9]+px)|[a-z-]+:[^ ]+;)',value): return
    groups.setdefault(group,dict.fromkeys([]))[value]=None
class Parser(HTMLParser):
    def __init__(self,group,force=False):super().__init__(convert_charrefs=True);self.group=group;self.skip=0;self.force=force
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'):self.skip+=1
        if not self.skip:
            for k,v in attrs:
                if k in ('title','aria-label','placeholder','alt') and v:add(self.group,v,self.force)
    def handle_endtag(self,tag):
        if tag in ('script','style') and self.skip:self.skip-=1
    def handle_data(self,data):
        if not self.skip:add(self.group,data,self.force)
def parse(group,value,force=False):
    p=Parser(group,force)
    try:p.feed(value)
    except Exception: pass
for item in json.loads(Path('outputs/course-literals.json').read_text(encoding='utf-8')):
    value=item['text']
    parse(item['group'],value)
    if item['kind']=='template':
        # Template insertions may be numbers or HTML; preserve independently rendered text fragments too.
        for part in re.split(r'\{p\d+\}',value):parse(item['group'],part)
motion=Path('sources/miscarea-rectilinie/site/index.html').read_text(encoding='utf-8')
parse('miscarea-rectilinie/ui',motion,True)
vector=Path('sources/vectori/site/index.html').read_text(encoding='utf-8')
sections=list(re.finditer(r'<section class="sec" id="s(\d+)"[\s\S]*?</section>',vector))
for match in sections:parse('calcul-vectorial/section-'+match.group(1).zfill(2),match.group(),True)
for match in reversed(sections):vector=vector[:match.start()]+vector[match.end():]
parse('calcul-vectorial/ui',vector,True)
result={group:list(values) for group,values in groups.items()}
existing=Path('outputs/course-text-source.json')
if existing.exists():
    old=json.loads(existing.read_text(encoding='utf-8'))
    result={group:old.get(group,[])+[value for value in values if value not in old.get(group,[])] for group,values in result.items()}
Path('outputs/course-text-source.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for group,values in result.items():print(group,len(values))
