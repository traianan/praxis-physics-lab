import React,{useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Home from '@/app/page';
import {ThemeProvider,useTheme} from '@/components/ThemeProvider';

function ThemeBridge(){
 const {theme,board}=useTheme();
 useEffect(()=>{
  const root=document.getElementById('ohm-root');
  if(root){root.dataset.theme=theme;root.dataset.board=String(board);}
 },[theme,board]);
 return null;
}

function App(){return <ThemeProvider><ThemeBridge/><Home/></ThemeProvider>;}
createRoot(document.getElementById('ohm-root')).render(<App/>);
