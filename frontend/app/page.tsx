"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import AIAssistant from "@/components/AIAssistant";
import MaterialCard from "@/components/MaterialCard";

export default function Home() {

  const { theme, toggle } = useTheme();

  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);


  async function solveFile() {

    if (!file) {
      setAnswer("Please upload an academic file first.");
      return;
    }


    setLoading(true);
    setAnswer("AI is analyzing your material...");


    try {

      const formData = new FormData();

      formData.append(
        "file",
        file
      );


      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/solve`,
        {
          method:"POST",
          body:formData
        }
      );


      const data = await response.json();


      setAnswer(
        data.answer ||
        "No solution returned."
      );


    } catch(error){

      console.error(error);

      setAnswer(
        "Unable to connect to AI server."
      );

    }


    setLoading(false);

  }



return (

<main>


<header className="header">


<div>

<h1>
SCode Academic AI
</h1>


<p>
AI powered academic assistant for Colleges of Education
</p>

</div>



<button
onClick={toggle}
>

{
theme==="dark"
?
"☀️ Light"
:
"🌙 Dark"
}

</button>


</header>



<section className="hero">


<h2>
Upload Academic Materials
</h2>


<p>
Upload PDFs, PowerPoint slides, Word notes and academic documents.
</p>


<input

type="file"

accept="
.pdf,
.ppt,
.pptx,
.doc,
.docx
"

onChange={
(e)=>
setFile(
e.target.files?.[0] || null
)
}

/>



{
file && (

<MaterialCard

name={file.name}

/>

)

}



<button

onClick={solveFile}

disabled={loading}

>

{
loading
?
"Solving..."
:
"Solve With AI"
}

</button>



<div className="answer-card">


<h3>
AI Response
</h3>


<p>
{answer}
</p>


</div>



</section>



<section>

<h2>
Academic Knowledge Base
</h2>


<p>
Future integration:
University → Level → Semester → Course → Materials
</p>


<p>
Example:
University of Ghana / Level 200 / Semester 2 / General Course / Teaching Reading and Writing for JHS.pdf
</p>


</section>



<AIAssistant />


</main>


)

}"use client";

import {useTheme} from "@/components/ThemeProvider";
import {useState} from "react";
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



<div>

{answer}

</div>


</section>



<AIAssistant />


</main>

)

}
