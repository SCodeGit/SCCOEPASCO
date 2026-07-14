"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import AIAssistant from "@/components/AIAssistant";


export default function Home(){

const {theme,toggle}=useTheme();

const [file,setFile]=useState<File|null>(null);
const [answer,setAnswer]=useState("");


async function submit(){

if(!file){

setAnswer("Please upload a file first");
return;

}


const form=new FormData();

form.append("file",file);


try{

const res=await fetch(
`${process.env.NEXT_PUBLIC_API_URL}/api/solve`,
{
method:"POST",
body:form
}
);


const data=await res.json();


setAnswer(
data.answer || JSON.stringify(data)
);


}

catch(error){

setAnswer(
"AI connection failed"
);

}

}



return(

<main>


<header>

<h1>
SCode Academic AI
</h1>


<button onClick={toggle}>

{
theme==="dark"
?
"☀️ Light"
:
"🌙 Dark"
}

</button>


</header>



<section>


<h2>
Upload Academic Material
</h2>


<p>
Upload PDF, slides, notes or academic documents.
</p>



<input

type="file"

accept=".pdf,.ppt,.pptx,.doc,.docx"

onChange={
(e)=>
setFile(
e.target.files?.[0] || null
)
}

/>



<button onClick={submit}>

Solve With AI

</button>



<div className="answer-card">

{answer}

</div>


</section>



<AIAssistant />


</main>
)

}
