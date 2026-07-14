export default function MaterialCard(
{
file
}:{
file:any
}
){

return(

<div className="material-card">


<h3>
{file.name}
</h3>


<a
href={file.download}
target="_blank"
>
Open PDF
</a>


</div>

)

}
