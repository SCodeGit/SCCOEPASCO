"use client";

import { useEffect, useState } from "react";
import { getGithubFolder } from "@/lib/github";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};

interface Props {
  setPdfs: (files: PDFItem[]) => void;
}

export default function UniversitySelector({
  setPdfs,
}: Props) {

  const [universities, setUniversities] = useState<PDFItem[]>([]);
  const [levels, setLevels] = useState<PDFItem[]>([]);
  const [semesters, setSemesters] = useState<PDFItem[]>([]);
  const [programmes, setProgrammes] = useState<PDFItem[]>([]);

  const [loading, setLoading] = useState(false);


  useEffect(() => {

    loadUniversities();

  }, []);



  async function loadUniversities(){

    try{

      const data = await getGithubFolder("");

      setUniversities(
        data.filter(
          (item)=>item.type==="dir"
        )
      );

    }catch(error){

      console.error(error);

    }

  }




  async function loadFolder(
    path:string,
    setter:any
  ){


    try{
      setLoading(true);

      const data = await getGithubFolder(path);


      setter(

        data.filter(
          (item)=>item.type==="dir"
        )
      );


    }catch(error){

      console.error(error);


    }
    finally{

      setLoading(false);

    }

  }





  function universityChange(
    path:string
  ){

    setLevels([]);
    setSemesters([]);
    setProgrammes([]);
    setPdfs([]);


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
    setPdfs([]);


    if(path)
    loadFolder(
      path,
      setSemesters
    );

  }







  function semesterChange(
    path:string
  ){

    setProgrammes([]);
    setPdfs([]);


    if(path)
    loadFolder(
      path,
      setProgrammes
    );

  }







  async function programmeChange(
    path:string
  ){

    setPdfs([]);


    if(!path)
    return;


    try{

      setLoading(true);


      const data =
      await getGithubFolder(path);



      const files =
      data.filter(
        (item)=>
        item.name
        .toLowerCase()
        .endsWith(".pdf")
      );


      setPdfs(files);


    }catch(error){

      console.error(error);

    }
    finally{

      setLoading(false);

    }

  }





  return (

    <section className="repository">

      <h2>
        Past Questions
      </h2>


      <div className="filters">


        <select
        onChange={
          (e)=>
          universityChange(
            e.target.value
          )
        }
        >

          <option>
            Select University
          </option>


          {
            universities.map(
              (item)=>(

                <option
                key={item.path}
                value={item.path}
                >
                  {item.name}
                </option>

              )
            )
          }


        </select>





        <select
        disabled={!levels.length}
        onChange={
          (e)=>
          levelChange(
            e.target.value
          )
        }
        >

          <option>
            Select Level
          </option>


          {
            levels.map(
              (item)=>(

                <option
                key={item.path}
                value={item.path}
                >
                  {item.name}
                </option>

              )
            )
          }


        </select>






        <select
        disabled={!semesters.length}
        onChange={
          (e)=>
          semesterChange(
            e.target.value
          )
        }
        >

          <option>
            Select Semester
          </option>


          {
            semesters.map(
              (item)=>(

                <option
                key={item.path}
                value={item.path}
                >
                  {item.name}
                </option>

              )
            )
          }


        </select>






        <select
        disabled={!programmes.length}
        onChange={
          (e)=>
          programmeChange(
            e.target.value
          )
        }
        >

          <option>
            Select Programme
          </option>


          {
            programmes.map(
              (item)=>(

                <option
                key={item.path}
                value={item.path}
                >
                  {item.name}
                </option>

              )
            )
          }


        </select>


      </div>



      {
        loading &&
        <p>
          Loading repository...
        </p>
      }


    </section>

  );

}
