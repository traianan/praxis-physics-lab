"""Publish embedded offline dictionaries; retain TeX and runtime placeholders verbatim."""
import json,re,html
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parent.parent
class Text(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.values=[]
 def add(self,s):
  s=re.sub(r'\s+',' ',s).strip()
  if s and re.search(r'[A-Za-zăâîșțĂÂÎȘȚ]{2}',s) and s not in self.values:self.values.append(s)
 def handle_starttag(self,t,attrs):
  if t in ('script','style'):self.skip+=1
  if not self.skip:
   for k,v in attrs:
    if k in ('title','aria-label','placeholder','alt','data-engine-title'):self.add(v)
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip-=1
 def handle_data(self,s):
  if not self.skip:self.add(s)
p=Text();p.feed((ROOT/'public/simulari/motoare-termice/index.html').read_text(encoding='utf-8'))
for value in json.loads((ROOT/'outputs/heat-engines-literals.json').read_text(encoding='utf-8')):
 if '<' in value:
  q=Text();q.feed(value)
  for text in q.values:p.add(text)
 elif re.search(r'[ăâîșțĂÂÎȘȚ]|[A-Za-z]{3}',value):p.add(value)
existing={}
for file in (ROOT/'public/locales').rglob('en.json'):
 if 'motoare-termice' not in str(file):existing.update(json.loads(file.read_text(encoding='utf-8')).get('messages',{}))
missing=[value for value in p.values if value not in existing]
(ROOT/'outputs/heat-engines-texts.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
translations=json.loads((ROOT/'scripts/heat-engines-translations.json').read_text(encoding='utf-8'))
messages={key:translations.get(key,existing.get(key,key)) for key in p.values}
messages.update(translations)
messages.update({'Cuprins':'Contents','Acasă':'Home','Motoare termice':'Heat engines'})
source_html=(ROOT/'public/simulari/motoare-termice/index.html').read_text(encoding='utf-8')
for heading in re.findall(r'<h[234][^>]*>(.*?)</h[234]>',source_html,re.S):
 chunks=[html.unescape(piece) for piece in re.split(r'<[^>]*>',heading) if piece]
 key=re.sub(r'\s+',' ',''.join(chunks)).strip()
 value=''.join(chunk.replace(chunk.strip(),messages.get(chunk.strip(),chunk.strip())) if chunk.strip() else chunk for chunk in chunks)
 if key and key not in translations:messages[key]=re.sub(r'\s+',' ',value).strip()
tex=re.compile(r'\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]')
for key,value in list(messages.items()):
 if sorted(re.findall(r'\{p\d+\}',key))!=sorted(re.findall(r'\{p\d+\}',value)):
  raise ValueError('Runtime placeholder mismatch: '+key)
 chunks=tex.findall(key)
 if chunks:
  translated=tex.findall(value)
  if len(chunks)!=len(translated):raise ValueError('TeX chunk mismatch: '+key)
  items=iter(chunks);messages[key]=tex.sub(lambda _:next(items),value)
for key,value in list(messages.items()):
 if tex.search(key) and key!=value:
  for source,translated in zip(tex.split(key),tex.split(value)):
   source=source.strip();translated=translated.strip()
   if source and re.search(r'[A-Za-zăâîșț]{2}',source):messages.setdefault(source,translated)
folder=ROOT/'public/locales/courses/motoare-termice/ui';folder.mkdir(parents=True,exist_ok=True)
contexts=[
 {'selector':'#s3 h2','source':'Motorul Otto','translation':'The four-stroke'},
 {'selector':'#s3 h2 em','source':'în patru timpi','translation':'Otto engine'},
 {'selector':'#s5 h2','source':'Mașini','translation':'Refrigerating'},
 {'selector':'#s5 h2 em','source':'frigorifice','translation':'machines'},
 {'selector':'#s6 h2','source':'Ciclul','translation':'The'},
 {'selector':'#s6 h2 em','source':'Carnot','translation':'Carnot cycle'},
 {'selector':'#s9 h2','source':'Ciclul','translation':'The'},
 {'selector':'#s9 h2 em','source':'Rankine','translation':'Rankine cycle'},
]
for lang in ('ro','en'):
 (folder/(lang+'.json')).write_text(json.dumps({'locale':lang,'namespace':'courses/motoare-termice/ui','contexts':[{**rule,'translation':rule['source']} if lang=='ro' else rule for rule in contexts],'messages':{key:key if lang=='ro' else value for key,value in messages.items()}},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Heat engines messages:',len(messages),'new:',len(missing),'translated:',sum(key in translations or key in existing for key in p.values))
