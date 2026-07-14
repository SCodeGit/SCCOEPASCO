"use client";

import {createContext,useContext,useEffect,useState} from "react";

const ThemeContext=createContext<any>(null);

export function ThemeProvider({children}:{children:React.ReactNode}){

const [theme,setTheme]=useState("light");

useEffect(()=>{

const saved=localStorage.getItem("theme");

if(saved){
setTheme(saved);
document.documentElement.className=saved;
return;
}

const system=window.matchMedia("(prefers-color-scheme: dark)").matches;

const mode=system?"dark":"light";

setTheme(mode);
document.documentElement.className=mode;

},[]);


function toggle(){
const next=theme==="dark"?"light":"dark";
setTheme(next);
localStorage.setItem("theme",next);
document.documentElement.className=next;
}


return(
<ThemeContext.Provider value={{theme,toggle}}>
{children}
</ThemeContext.Provider>
)

}


export function useTheme(){
return useContext(ThemeContext);
}
