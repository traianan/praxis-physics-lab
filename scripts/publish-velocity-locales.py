"""Publish deterministic offline translations from the preserved source."""
import json, re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.values = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip -= 1
    def handle_data(self, value):
        value = re.sub(r'\s+', ' ', value).strip()
        if not self.skip and re.search(r'[A-Za-zăâîșț]{3}', value): self.values.append(value)
parser = Text()
parser.feed((ROOT/'sources/viteza-si-acceleratia/index.html').read_text(encoding='utf-8'))
values = list(dict.fromkeys(parser.values))
messages = {}
for line in (ROOT/'scripts/velocity-translations.txt').read_text(encoding='utf-8').splitlines():
    index, translated = line.split('|', 1)
    messages[values[int(index)]] = translated
messages.update({
    '▶ Play': '▶ Play', '⏸ Pause': '⏸ Pause', '↺ Reset': '↺ Reset',
    ' și ': ' and ', '(în 1D:': '(in 1D:', ') în M': ') to M', 'la M': 'to M',
    'Viteza și accelerația': 'Velocity and acceleration',
    'Regim la momentul t: {value}': 'Motion at time t: {value}',
    'Repaus (v = 0, a = 0)': 'Rest (v = 0, a = 0)',
    'Coarda (panta = v_m)': 'Chord (slope = v_m)',
    'Tangenta (panta = v)': 'Tangent (slope = v)',
    'Scade': 'Decrease', 'Crește': 'Increase',
    'Teorie & Formule': 'Theory & formulas',
    'Lab: Mișcare Rectilinie': 'Lab: Rectilinear motion',
    'Lab: Mișcare Curbilinie Plană': 'Lab: Planar curvilinear motion',
    'Situații Particulare: Funcții Polinomiale': 'Special cases: Polynomial functions',
    'Mișcare Rectilinie Uniformă (v = const.)': 'Uniform rectilinear motion (v = const.)',
    'Mișcare Accelerată (v și a au același sens: v·a > 0)': 'Speeding up (v and a have the same direction: v·a > 0)',
    'Mișcare Încetinită / Frânată (v și a au sensuri opuse: v·a < 0)': 'Slowing down / braking (v and a have opposite directions: v·a < 0)',
    'Moment de Oprire Instantanee / Întoarcere (v = 0)': 'Instantaneous rest / reversal (v = 0)',
    'AXA MIȘCĂRII RECTILINII Ox (Poziția M, Vectorii Instantanei v(t), a(t) și Mărimile Medii pe [t₁, t₂])': 'RECTILINEAR MOTION Ox (Position M, instantaneous v(t), a(t) and averages over [t₁, t₂])',
    'Graficul Poziției x(t): Coarda (v_m) vs. Tangenta (v inst.)': 'Position x(t): Chord (v_m) vs. tangent (inst. v)',
    'Graficul Vitezei v(t) și Viteza Medie v_m pe [t₁, t₂]': 'Velocity v(t) and average velocity v_m over [t₁, t₂]',
    'Raza R:': 'Radius R:',
    'Raza cercului R:': 'Circle radius R:',
    'Unghiul de lansare α (grade):': 'Launch angle α (degrees):',
    'Viteza unghiulară ω:': 'Angular velocity ω:',
    'Accelerația unghiulară ε (blocat 0):': 'Angular acceleration ε (fixed at 0):',
    'Viteza unghiulară inițială ω': 'Initial angular velocity ω',
    'Viteza inițială de lansare v': 'Initial launch speed v',
    'Unghiul de lansare θ:': 'Launch angle θ:',
    'Accelerația gravitațională g:': 'Gravitational acceleration g:',
    'Semiaxa orizontală A': 'Horizontal semi-axis A',
    'Semiaxa verticală A': 'Vertical semi-axis A',
    'Pulsația ω:': 'Angular frequency ω:',
    'Triunghiul Vitezelor pe [t₁, t₂]': 'Velocity triangle over [t₁, t₂]',
    'Δv = v(t₂) − v(t₁) și a_m = Δv / Δt': 'Δv = v(t₂) − v(t₁) and a_m = Δv / Δt',
    '🔍 Analiza Momentelor Caracteristice în [0, 8 s]:': '🔍 Characteristic times in [0, 8 s]:',
    'Oprire (v = 0):': 'Rest (v = 0):',
    'Mobilul nu își schimbă sensul de mers în intervalul [0, 8 s].': 'The particle does not reverse direction over [0, 8 s].',
    'Momente de oprire / întoarcere (v = 0):': 'Stopping / reversal times (v = 0):',
    'Accelerație nulă (a = 0, extrem al vitezei):': 'Zero acceleration (a = 0, velocity extremum):',
    'Accelerația a(t)': 'Acceleration a(t)',
    'nu se anulează în intervalul [0, 8 s].': 'does not vanish over [0, 8 s].',
    'Accelerația este constantă:': 'Acceleration is constant:',
    'Accelerată (v·a > 0)': 'Speeding up (v·a > 0)',
    'Uniformă (a = 0)': 'Uniform (a = 0)',
    'MIȘCAREA MOBILULUI PE AXA Ox CONFORM LEGII POLINOMIALE x(t)': 'MOTION ALONG Ox FOR THE POLYNOMIAL POSITION FUNCTION x(t)',
    '1. Poziția x(t) [m]': '1. Position x(t) [m]',
    "2. Viteza v(t) = x'(t) [m/s]": "2. Velocity v(t) = x'(t) [m/s]",
    "3. Accelerația a(t) = v'(t) [m/s²]": "3. Acceleration a(t) = v'(t) [m/s²]",
    'Mișcare rectilinie: vectori și grafice x(t), v(t)': 'Rectilinear motion: vectors and graphs x(t), v(t)',
    'Mișcare în plan: traiectorie și vectori': 'Planar motion: trajectory and vectors',
    'Legi polinomiale: grafice x(t), v(t), a(t)': 'Polynomial laws: graphs x(t), v(t), a(t)',
})
for direction, translated in [('Scade ', 'Decrease '), ('Crește ', 'Increase ')]:
    messages[direction+'{value}'] = translated+'{value}'
folder = ROOT/'public/locales/courses/viteza-si-acceleratia/ui'
folder.mkdir(parents=True, exist_ok=True)
def subscripts(text):
    indices = {'m': 'ₘ', 'n': 'ₙ', 't': 'ₜ'}
    return re.sub(r'\b([va])_([mnt])\b', lambda match: match[1]+indices[match[2]], text)
messages = {subscripts(key): subscripts(value) for key, value in messages.items()}
for lang in ('ro', 'en'):
    data = dict(messages) if lang == 'en' else {key:key for key in messages}
    if lang == 'ro': data.update({'▶ Play':'▶ Pornește', '⏸ Pause':'⏸ Pauză', '↺ Reset':'↺ Resetează'})
    (folder/(lang+'.json')).write_text(json.dumps({'locale':lang,'namespace':'courses/viteza-si-acceleratia/ui','messages':data}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
