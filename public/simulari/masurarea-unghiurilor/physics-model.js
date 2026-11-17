import {solid} from './model.js';
export function frameDelta(previous,now,rate,active){
  if(!active||previous===null||!Number.isFinite(now)||!Number.isFinite(previous))return 0;
  return Math.max(0,Math.min(.1,(now-previous)/1000))*rate;
}
export function advanceMotion(state,frequency,dt){
  return {time:state.time+dt,phase:state.phase+2*Math.PI*frequency*dt};
}
export function circularState(state,frequency,radius){
  const omega=2*Math.PI*frequency;
  return {...state,omega,speed:radius*omega,arc:radius*state.phase,turns:state.phase/(2*Math.PI),period:frequency>0?1/frequency:null};
}
export function oscillatorState(state,frequency,amplitude,initialPhase){
  const omega=2*Math.PI*frequency,phase=state.phase+initialPhase;
  return {...state,phase,omega,position:amplitude*Math.sin(phase),velocity:amplitude*omega*Math.cos(phase)};
}
export function lightState(alpha,radius,source,mode){
  const {omega,area}=solid(alpha,radius);
  const intensity=mode==='flux'?(omega>0?source/omega:0):source;
  const flux=mode==='flux'?source:intensity*omega;
  return {omega,area,intensity,flux,illuminance:intensity/radius**2};
}
export function radiationState(alpha,radius,power){
  const {omega,area,fraction}=solid(alpha,radius),selected=power*fraction;
  return {omega,area,fraction,selected,remaining:power-selected,irradiance:power/(4*Math.PI*radius**2)};
}
