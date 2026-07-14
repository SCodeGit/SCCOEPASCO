"use client";


import {useState} from "react";


export default function AIAssistant(){


const [question,setQuestion]=useState("");

const [answer,setAnswer]=useState("");

const [file,setFile]=useState<File|null>(null);



async function ask(){


const form=new FormData();


form.append(
"question",
question
);


if(file)
form.append(
"file",
file
);



const res=await fetch(

`${process.env.NEXT_PUBLIC_API_URL}/api/solve`,

{

method:"POST",

body:form

}

);



const data=await res.json();


setAnswer(
data.answer || "No answer"
);


}



return(

<section>


<h2>
AI Study Assistant
</h2>


<input

type="file"

accept=".pdf,.ppt,.pptx,.doc,.docx"

onChange={
e=>setFile(
e.target.files?.[0]||null
)
}

/>


<textarea

placeholder="Ask about your materials"

value={question}

onChange={
e=>setQuestion(e.target.value)
}

/>


<button onClick={ask}>
Solve
</button>


<div>

{answer}

</div>


</section>

)


}
