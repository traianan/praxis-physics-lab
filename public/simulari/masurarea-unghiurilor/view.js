import {toRadians, drawingRadius} from './model.js';

// Orthographic views of z >= r cos(alpha). Side: look along y; top: along +z.
export function capProjection(degrees, radius) {
  const alpha = toRadians(degrees), R = drawingRadius(radius);
  const edgeRadius = R * Math.sin(alpha), edgeY = 150 - R * Math.cos(alpha);
  return {
    R, alpha, edgeRadius, edgeY,
    topRadius: degrees <= 90 ? edgeRadius : R,
    hiddenBoundary: degrees > 90 && degrees < 180,
    sidePath: degrees === 0 || degrees === 180 ? '' :
      `M${150-edgeRadius} ${edgeY} A${R} ${R} 0 ${degrees>90?1:0} 1 ${150+edgeRadius} ${edgeY} Z`
  };
}
const line=(x1,y1,x2,y2,color='#17685f',dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="5 4"':''}/>`;
export function capViews(degrees, radius, axisLabel) {
  const {R,alpha,edgeRadius,edgeY,topRadius,hiddenBoundary,sidePath}=capProjection(degrees,radius);
  const base=`<circle cx="150" cy="150" r="${R}" fill="#eef3ed" stroke="#b9cbc3" stroke-width="2"/>`;
  const cap=degrees===180?`<circle data-cap-fill cx="150" cy="150" r="${R}" fill="#70aaa0"/>`:
    `<path data-cap-fill d="${sidePath}" fill="#70aaa0"/>`;
  const angleRadius=Math.min(25,R*.55),angleX=150+angleRadius*Math.sin(alpha),angleY=150-angleRadius*Math.cos(alpha);
  const angle=degrees>0?`<path d="M150 ${150-angleRadius} A${angleRadius} ${angleRadius} 0 0 1 ${angleX} ${angleY}" stroke="#b17b26" fill="none" stroke-width="2"/>`:'';
  const side=base+cap+
    line(150-edgeRadius,edgeY,150+edgeRadius,edgeY,'#17685f','dash')+
    line(150,150,150,150-R,'#b17b26')+
    line(150,150,150+edgeRadius,edgeY)+line(150,150,150-edgeRadius,edgeY)+angle+
    `<circle cx="150" cy="150" r="3" fill="#183e37"/><text x="131" y="172">O</text><text x="158" y="${150-R/2}">r</text><text x="${150+(angleRadius+12)*Math.sin(alpha/2)}" y="${150-(angleRadius+12)*Math.cos(alpha/2)}">α</text>`;
  const top=base+`<circle data-cap-fill cx="150" cy="150" r="${topRadius}" fill="#70aaa0"/>`+
    `<circle data-cap-boundary cx="150" cy="150" r="${edgeRadius}" fill="none" stroke="#17685f" stroke-width="2" ${hiddenBoundary?'stroke-dasharray="5 4"':''}/>`+
    line(150,150,150+R,150,'#b17b26')+
    `<circle cx="150" cy="150" r="3" fill="#183e37"/><text x="${150+R/2}" y="173">r</text><text x="129" y="135">${axisLabel}</text>`;
  return {side,top,hiddenBoundary};
}
