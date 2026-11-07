import React, {createContext, useContext, useEffect, useState} from 'react';
import translations from './translations.json';

const Presentation=createContext({language:'ro',theme:'light',board:false});
export const PraxisFragment=React.Fragment;
const patterns=Object.entries(translations).filter(([key])=>/\{\d+\}/.test(key)).map(([key,value])=>({re:new RegExp('^'+key.split(/(\{\d+\})/).map(part=>/^\{\d+\}$/.test(part)?'(.*?)':part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+'$'),value}));
export function tr(value){
 if(typeof value!=='string'||window.PraxisI18n?.language==='ro')return value;
 const key=value.trim().replace(/\s+/g,' ');let result=translations[key];
 if(result===undefined)for(const p of patterns){const match=key.match(p.re);if(match){result=p.value.replace(/\{(\d+)\}/g,(_,i)=>tr(match[Number(i)+1]));break;}}
 if(result===undefined){const shared=window.PraxisI18n?.tr(value);if(shared&&shared!==value)return shared;(window.PraxisPolytropicUntranslated??=new Set()).add(key);return value;}
 return value.slice(0,value.indexOf(value.trim()))+result+value.slice(value.indexOf(value.trim())+value.trim().length);
}
export function PresentationProvider({children}){
 const snapshot=()=>({language:window.PraxisI18n?.language||'ro',theme:document.documentElement.dataset.theme||'light',board:document.documentElement.dataset.board==='true'});
 const [value,setValue]=useState(snapshot);
 useEffect(()=>{const root=document.getElementById('polytropic-root');root.dataset.theme=value.theme;root.dataset.board=String(value.board);},[value]);
 useEffect(()=>{const refresh=()=>setValue(snapshot());const observer=new MutationObserver(refresh);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-board']});window.addEventListener('praxis-language-change',refresh);return()=>{observer.disconnect();window.removeEventListener('praxis-language-change',refresh);};},[]);
 return React.createElement(Presentation.Provider,{value},children);
}
export const useTheme=()=>useContext(Presentation);
function Host({tag,attributes,content}){
 useContext(Presentation);
 const props={...attributes};for(const key of ['title','aria-label','alt','placeholder'])if(typeof props[key]==='string')props[key]=tr(props[key]);
 const children=content.map(child=>typeof child==='string'?tr(child):Array.isArray(child)?child.map(v=>typeof v==='string'?tr(v):v):child);
 if(tag==='input'&&props.type==='range'){
  const step=Number(props.step)||1,min=Number(props.min??0),max=Number(props.max??100),value=Number(props.value??props.defaultValue??min);
  const adjust=direction=>{const next=Math.max(min,Math.min(max,Number((value+direction*step).toFixed(8))));props.onChange?.({target:{value:String(next)}});};
  return React.createElement('span',{className:'praxis-range-stepper'},
   React.createElement('button',{type:'button',disabled:props.disabled||value<=min,'aria-label':tr('Scade')+' '+(props['aria-label']||''),onClick:()=>adjust(-1)},'−'),
   React.createElement(tag,props),
   React.createElement('button',{type:'button',disabled:props.disabled||value>=max,'aria-label':tr('Crește')+' '+(props['aria-label']||''),onClick:()=>adjust(1)},'+'));
 }
 return React.createElement(tag,props,...children);
}
function LocalComponent({component,attributes,content}){const {language}=useContext(Presentation);return React.createElement(component,{...attributes,praxisLocale:language},...content);}
export function PraxisElement(type,props,...children){
 if(typeof type==='function'){const {key,...attributes}=props||{};return React.createElement(LocalComponent,{key,component:type,attributes,content:children});}
 if(typeof type!=='string')return React.createElement(type,props,...children);
 const {key,...attributes}=props||{};
 return React.createElement(Host,{key,tag:type,attributes,content:children});
}
