"use client";

import { useEffect, useState } from "react";
import { getGithubFolder } from "@/lib/github";


type Item = {
  name: string;
  path: string;
  type?: string;
};


interface Props {

  onSelectProgramme: (path:string)=>void;

}



export default function UniversitySelector({
  onSelectProgramme

}:Props){


const [universities,setUniversities]
=
useState<Item[]>([]);


const [levels,setLevels]
=
useState<Item[]>([]);


const [semesters,setSemesters]
=
useState<Item[]>([]);


const [programmes,setProgrammes]
=
useState<Item[]>([]);



async function loadFolder(
path:string,
setter:any
){

const data =
await getGithubFolder(path);


setter(
data.filter(
(item:Item)=>
item.type==="dir"
)
);

}




useEffect(()=>{


loadFolder(
"",
setUniversities
);


},[]);





function universityChange(
path:string
){

setLevels([]);
setSemesters([]);
setProgrammes([]);


if(path)
loadFolder(
path,
setLevels
);


}



function levelChange(
path:string
){

setSemesters([]);
setProgrammes([]);

path,
setSemesters
);


}




function semesterChange(
path:string
){

setProgrammes([]);


if(path)
loadFolder(
path,
setProgrammes
);


}





function programmeChange(
path:string
){

if(path)
onSelectProgramme(path);


}






return(

<section className="repository">


<h2>
Past Questions
</h2>



<div className="filters">


<select
onChange={
e=>universityChange(e.target.value)
}
>

<option>
Select University
</option>


{
universities.map(item=>(

<option
key={item.path}
value={item.path}
>

{item.name}

</option>

))
}


</select>





<select
disabled={!levels.length}
onChange={
e=>levelChange(e.target.value)
}
>

<option>
Select Level
</option>


{
levels.map(item=>(

<option
key={item.path}
value={item.path}
>

{item.name}

</option>

))
}


</select>






<select
disabled={!semesters.length}
onChange={
e=>semesterChange(e.target.value)
}
>

<option>
Select Semester
</option>


{
semesters.map(item=>(

<option
key={item.path}
value={item.path}
>

{item.name}

</option>

))
}


</select>






<select
disabled={!programmes.length}
onChange={
e=>programmeChange(e.target.value)
}
>

<option>
Select Programme
</option>


{
programmes.map(item=>(

<option
key={item.path}
value={item.path}
>

{item.name}

</option>

))
}


</select>



</div>


</section>

);


}
if(path)
loadFolder(

