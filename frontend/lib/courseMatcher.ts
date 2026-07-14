import {scanAcademicRepository} from "./academicGithub";


export async function findRelevantMaterials(
university:string,
level:string,
semester:string,
category?:string
){


const files=await scanAcademicRepository();


return files.filter(file=>{


const path=file.path.toLowerCase();


return (

path.includes(university.toLowerCase())

&&

path.includes(level.toLowerCase())

&&

path.includes(semester.toLowerCase())

&&

(!category ||
path.includes(category.toLowerCase()))

);


});


}
