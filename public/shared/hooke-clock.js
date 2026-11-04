/** Playback scale only: physical parameters and the analytical state are untouched. */
export function validSpeed(speed) { return Number.isFinite(speed)&&speed>=0.1&&speed<=2; }
export function advanceTime(time,realSeconds,speed) {
  if(!Number.isFinite(time)||time<0||!Number.isFinite(realSeconds)||realSeconds<0||!validSpeed(speed))throw new RangeError('clock');
  return time+Math.min(realSeconds,0.1)*speed;
}
