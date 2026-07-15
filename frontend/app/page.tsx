"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import UniversitySelector from "@/components/UniversitySelector";
import PDFGrid from "@/components/PDFGrid";
import AIAssistant from "@/components/AIAssistant";
import Footer from "@/components/Footer";


type PDFItem = {
  name:string;
  path:string;
  type?:string;
};



export default function Home(){


const [pdfs,setPdfs]=useState<PDFItem[]>([]);

const [answer,setAnswer]=useState("");

const [loadingAI,setLoadingAI]=useState(false);



const [theme,setTheme]=useState<
"system"|"light"|"dark"
>("system");





useEffect(()=>{


const savedTheme =
localStorage.getItem("scode-theme");


if(savedTheme){

setTheme(
savedTheme as "system"|"light"|"dark"
);

}


},[]);







useEffect(()=>{


const root =
document.documentElement;



if(theme==="system"){


root.removeAttribute(
"data-theme"
);


}else{


root.setAttribute(
"data-theme",
theme
);


}



localStorage.setItem(
"scode-theme",
theme
);



},[theme]);








async function solveAI(
url:string,
name:string
){


setLoadingAI(true);

setAnswer("");



try{


const API =
process.env.NEXT_PUBLIC_API_URL ||
"https://scode-academic-ai.onrender.com";




const res =
await fetch(
`${API}/api/solve`,
{


method:"POST",


headers:{

"Content-Type":
"application/json",

},



body:JSON.stringify({

pdf_url:url,

filename:name,

}),



}
);





if(!res.ok){


const errorText =
await res.text();


console.error(
"Backend response:",
errorText
);


throw new Error(
"AI request failed"
);


}





const data =
await res.json();




setAnswer(

data.answer ||

"No answer generated"

);



}catch(error){


console.error(
"SCode AI Error:",
error
);



setAnswer(
"Unable to connect to AI server."
);



}finally{


setLoadingAI(false);


}



}








return(


<main className="app">



<Header

theme={theme}

setTheme={setTheme}

/>





<UniversitySelector

setPdfs={setPdfs}

/>






<PDFGrid

pdfs={pdfs}

solveAI={solveAI}

/>







<AIAssistant

answer={answer}

loadingAI={loadingAI}

/>







<Footer />




</main>



);


}
