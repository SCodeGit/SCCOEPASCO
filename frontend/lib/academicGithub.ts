import {getGithubFolder} from "./github";


export async function scanAcademicRepository(
path=""
):Promise<any[]>{


const items=await getGithubFolder(path);

let results:any[]=[];


for(const item of items){


if(item.type==="dir"){

const children=await scanAcademicRepository(item.path);

results=[
...results,
...children
];

}


if(
item.type==="file" &&
item.name.toLowerCase().endsWith(".pdf")
){

results.push({

name:item.name,

path:item.path,

download:item.download_url

});

}


}


return results;

}
