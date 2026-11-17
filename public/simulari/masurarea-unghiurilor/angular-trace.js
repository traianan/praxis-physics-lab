const turn=2*Math.PI;
export function angleWithinTurn(phase){
  const value=((phase%turn)+turn)%turn;
  return Math.min(value,turn-value)<1e-10?0:value;
}
// A constant frequency is exactly linear. Keep segment endpoints and every
// frequency-change corner, including the initial origin, rather than frame samples.
export function recordAngularTrace(points,sample){
  const last=points.at(-1),previous=points.at(-2);
  if(last?.time===sample.time)points[points.length-1]={...sample};
  else if(previous&&last.frequency===sample.frequency&&previous.frequency===sample.frequency)points[points.length-1]={...sample};
  else points.push({...sample});
  return points;
}
export function wrappedTrace(points,min,max){
  const result=[],mod=angleWithinTurn;
  if(points.length===1)return [[points[0].time,mod(points[0].phase)]];
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];if(b.time<min||a.time>max||b.time===a.time)continue;
    const start=Math.max(min,a.time),end=Math.min(max,b.time),slope=(b.phase-a.phase)/(b.time-a.time);
    const p0=a.phase+slope*(start-a.time),p1=a.phase+slope*(end-a.time);
    result.push([start,mod(p0)]);
    if(slope>0)for(let k=Math.floor(p0/turn)+1;k<=Math.floor((p1+1e-10)/turn);k++){
      const time=a.time+(k*turn-a.phase)/slope;
      if(time>end+1e-9)break;
      result.push([Math.min(time,end),turn],null,[Math.min(time,end),0]);
    }
    result.push([end,mod(p1)]);
  }
  return result;
}
