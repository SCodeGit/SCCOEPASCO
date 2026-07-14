export type AcademicPath = {
  university:string;
  level:string;
  semester:string;
  category:string;
  course:string;
  file:string;
};


export function parseAcademicPath(path:string):AcademicPath|null{

const parts=path.split("/");

if(parts.length < 5) return null;


return {

university:parts[0],

level:parts[1],

semester:parts[2],

category:parts[3],

course:parts[3],

file:parts[parts.length-1]

};

}
