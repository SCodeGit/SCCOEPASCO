"use client";

import { getPDFUrl } from "@/lib/github";

type PDFItem = {
  name: string;
  path: string;
  type?: string;
};


interface Props {

  pdfs: PDFItem[];

  solveAI: (
    url: string,
    name: string
  ) => void;

}



export default function PDFGrid({
  pdfs,
  solveAI,
}: Props) {


function openPDF(pdf: PDFItem){

  const url = getPDFUrl(pdf.path);

  window.open(
    url,
    "_blank"
  );

}



return (

<section className="pdf-section">


<h2>
Available Past Questions



<div className="pdf-grid">


{
pdfs.length === 0 ?


<p>
No PDF selected yet.
</p>

:

pdfs.map((pdf)=>(



<div
className="pdf-card"
key={pdf.path}
>



<h3>
📘 {pdf.name}
</h3>




<div className="actions">


<button
onClick={()=>
openPDF(pdf)
}
>
Open PDF
</button>



<button

className="ai"

onClick={()=>
solveAI(
getPDFUrl(pdf.path),
pdf.name
)
}

>

🤖 Solve AI

</button>


</div>


</div>


))

}



</div>


</section>


);

}
