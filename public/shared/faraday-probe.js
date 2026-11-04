/** SI workspace limits shared by mouse, touch, keyboard and numeric controls.
 * Conservative rectangle includes magnet footprint, probe radius and clearance.
 */
export const PROBE_LIMIT=.4, PROBE_SCALE=9;
export const PROBE_EXCLUSION=Object.freeze({x:.08,y:.05});
export function constrainProbe(x,y,axis){
 if(!Number.isFinite(x)||!Number.isFinite(y))throw new RangeError('Finite probe coordinates required');
 x=Math.max(-PROBE_LIMIT,Math.min(PROBE_LIMIT,x));y=Math.max(-.2,Math.min(PROBE_LIMIT,y));
 const e=PROBE_EXCLUSION;
 if(Math.abs(x)<e.x&&Math.abs(y)<e.y){
  if(axis==='x'||(axis!=='y'&&e.x-Math.abs(x)<e.y-Math.abs(y)))x=(Math.sign(x)||1)*e.x;
  else y=(Math.sign(y)||1)*e.y;
 }
 return {x,y};
}
