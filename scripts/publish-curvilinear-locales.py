import json, re
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.skip=0; self.values=[]
    def handle_starttag(self,tag,attrs):
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip-=1
    def handle_data(self,value):
        value=re.sub(r'\s+',' ',value).strip()
        if not self.skip and re.search(r'[A-Za-zăâîșț]{3}',value) and value not in self.values: self.values.append(value)
parser=Text();parser.feed((ROOT/'sources/miscarea-curbilinie-plana/index.html').read_text(encoding='utf-8'))
messages={}
for line in (ROOT/'scripts/curvilinear-translations.txt').read_text(encoding='utf-8').splitlines():
    index,value=line.split('|',1);messages[parser.values[int(index)]]=value
messages.update({
    'Mișcarea curbilinie plană':'Planar curvilinear motion',
    'Introducere și autorul lecției':'Introduction and lesson author',
    'Ascunde răspunsul':'Hide answer', 'Da.':'Yes.', 'Da!':'Yes!', 'Da':'Yes', 'Se':'It', 'și':'and',
    'și ca':'and its', 'În':'In',
    'Scade':'Decrease','Crește':'Increase',
    'Coarda și tangenta la traiectorie':'Chord and tangent to the trajectory',
    'Traiectorie plană și vectorul viteză':'Planar trajectory and velocity vector',
    'Mișcare circulară uniformă':'Uniform circular motion',
    'Accelerația și cercul osculator':'Acceleration and osculating circle',
    'Viteză: săgeată de 85 px; accelerații, {value} px/(u/s²)':'Velocity: 85 px arrow; acceleration scale, {value} px/(u/s²)',
    'Raza R (u)':'Radius R (u)',
    'Semiaxa orizontală a (u)':'Horizontal semi-axis a (u)',
    'Extinderea orizontală L/2 (u)':'Horizontal extent L/2 (u)',
    'Semiaxa verticală b (u)':'Vertical semi-axis b (u)',
    'Extinderea verticală h (u)':'Vertical extent h (u)',
    'Durata unui tur T (s)':'Period of one revolution T (s)',
    'Trage punctele albastre pentru a modela curba. Linia punctată este poligonul de control, nu traiectoria.':'Drag the blue points to shape the curve. The dashed line is the control polygon, not the trajectory.',
    'Porțiune de curbă deschisă, fără perioadă. Animația se oprește la capăt.':'An open curve segment without a period. The animation stops at the endpoint.',
    'Traiectorie închisă. Durata unui tur caracterizează mișcarea ilustrată.':'A closed trajectory. The time for one revolution characterises the illustrated motion.',
})
folder=ROOT/'public/locales/courses/miscarea-curbilinie-plana/ui';folder.mkdir(parents=True,exist_ok=True)
for lang in ('ro','en'):
    data=dict(messages) if lang=='en' else {key:key for key in messages}
    if lang=='ro':
        data.update({'Play':'Pornește','Pause':'Pauză','Reset':'Resetează'})
        for key in data:
            data[key]=data[key].replace('(linia aurie)','(linia verde)').replace('(cyan)','(albastru)')
    (folder/(lang+'.json')).write_text(json.dumps({'locale':lang,'namespace':'courses/miscarea-curbilinie-plana/ui','messages':data},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
