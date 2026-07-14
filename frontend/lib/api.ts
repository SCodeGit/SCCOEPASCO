const API = process.env.NEXT_PUBLIC_API_URL;

export async function solveWithAI(data:any){
  const res = await fetch(`${API}/api/solve`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  });

  return res.json();
}
