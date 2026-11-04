/** Connection coordinates shared by conductors, terminal hardware and markers. */
export const CONTACTS=Object.freeze({
 brushA:[3.08,0,1.60],brushB:[3.85,0,1.60],
 ammeterA:[1.28,-1.55,2.55],ammeterB:[.12,-1.55,2.55],
 loadRight:[-1.17,-1.25,2.55],loadLeft:[-2.53,-1.25,2.55],
 switchA:[4.45,-1.91,1.2],switchB:[5,-1.91,1.2],
 voltmeterA:[2.92,-2.1,2.85],voltmeterB:[4.08,-2.1,2.85]
});
export function circuitRoutes(){
 const c=CONTACTS;
 return [
  {id:'feed',from:'brushA',to:'ammeterA',color:'live',points:[c.brushA,[3.08,-.6,2.1],[2,-1.4,2.55],c.ammeterA]},
  {id:'load-feed',from:'ammeterB',to:'loadRight',color:'live',points:[c.ammeterB,[-.45,-1.55,2.55],[-.9,-1.25,2.55],c.loadRight]},
  {id:'return',from:'loadLeft',to:'switchA',color:'return',points:[c.loadLeft,[-3.4,-1.25,2.55],[-3.85,-2.55,1.2],[4.1,-2.55,1.2],c.switchA]},
  {id:'brush-return',from:'switchB',to:'brushB',color:'return',points:[c.switchB,[5,-.7,1.8],[4.3,0,1.6],c.brushB]},
  {id:'voltmeter-a',from:'brushA',to:'voltmeterA',color:'meter',points:[c.brushA,[2.75,-.5,2.1],[2.7,-1.8,2.85],c.voltmeterA]},
  {id:'voltmeter-b',from:'brushB',to:'voltmeterB',color:'meter',points:[c.brushB,[4.4,-.5,2.1],[4.4,-1.9,2.85],c.voltmeterB]}
 ];
}
export function loadWindingPoints(turns=14){
 const points=[CONTACTS.loadLeft,[-2.48,-1.25,2.55],[-2.42,-.995,2.55]],samples=turns*48;
 for(let j=0;j<=samples;j++){const phase=j/samples*Math.PI*2*turns;points.push([-2.38+1.06*j/samples,-1.25+.255*Math.cos(phase),2.55+.255*Math.sin(phase)]);}
 points.push([-1.28,-.995,2.55],[-1.22,-1.25,2.55],CONTACTS.loadRight);return points;
}
