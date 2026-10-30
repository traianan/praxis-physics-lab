// Keep graph annotations inside their own drawing area; preserve every label.
export function applicationsLayout(js){
 return js.replaceAll("x0 + aw + 2, Y(5 / 3) + 3, { size: 10", "x0 + aw - 6, Y(5 / 3) - 6, { align: 'right', size: 10")
 .replaceAll("x0 + aw + 2, Y(7 / 5) + 3, { size: 10", "x0 + aw - 6, Y(7 / 5) - 6, { align: 'right', size: 10")
 .replace("box.x - 14, box.y + box.h / 2, { color: COL.red, align: 'right'", "box.x + 4, box.y - 12, { color: COL.red, align: 'left'");
}
export function phaseLayout(js){
 return js.replaceAll("'rgba(103,232,249,.9)'","'rgba(23,114,132,.9)'").replace('var bx = 40, by = 36, bw = W - 70, bh = H - 64;', 'var bx = 40, by = 60, bw = W - 70, bh = H - 88;')
 .replace("bx + bw + 6, by + 12, { size: 9 }", "W - 12, 20, { align: 'right', size: 12 }")
 .replace("bx + bw + 6, by + 36, { size: 9, color: COL.bright }", "W - 12, 42, { align: 'right', size: 12, color: COL.bright }")
 .replace("X(m[0]) + 6, Y(m[1]) - 5, { size: 8.5, color: COL.gold }", "X(m[0]) + (m[0]>150?-8:6), Y(m[1]) - 8, { align: m[0]>150?'right':'left', size: 12, color: COL.gold }")
 .replace('if (p.x < bx + 4 || p.x > bx + bw - 4) p.vx *= -1;', 'if(p.x<bx+4){p.x=bx+4;p.vx=Math.abs(p.vx);}else if(p.x>bx+bw-4){p.x=bx+bw-4;p.vx=-Math.abs(p.vx);}')
 .replace('if (p.y < by + 4) p.vy *= -1;', 'if(p.y<by+4){p.y=by+4;p.vy=Math.abs(p.vy);}')
 .replace('if (p.y > liqY - 4) { p.y = liqY - 4; p.vy *= -1; }', 'if(p.y>liqY-4){p.y=liqY-4;p.vy=-Math.abs(p.vy);}');
}
