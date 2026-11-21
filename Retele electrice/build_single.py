# Construiește o versiune self-contained (CSS + JS inline) din app/
import re, pathlib
root = pathlib.Path('app')
html = (root/'index.html').read_text(encoding='utf-8')

# CSS inline
css = (root/'css/style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css" />', f'<style>\n{css}\n</style>')

# JS inline, în ordinea din HTML
def repl(m):
    src = m.group(1)
    code = (root/src).read_text(encoding='utf-8')
    return f'<script>\n/* ===== {src} ===== */\n{code}\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', repl, html)

out = pathlib.Path('Retele-electrice.html')
out.write_text(html, encoding='utf-8')
print('scris', out, round(out.stat().st_size/1024,1), 'KB')
