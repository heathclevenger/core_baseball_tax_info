import {mlb} from '@/lib/mlb';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const q=new URL(request.url).searchParams.get('q')?.trim()??'';
 if(q.length<2||q.length>100)return Response.json({error:'Enter at least two letters of a player name.'},{status:400});
 try {const data=await mlb(`/people/search?names=${encodeURIComponent(q)}`);return Response.json({players:(data.people??[]).filter((p:{isPlayer?:boolean})=>p.isPlayer!==false).slice(0,50).map((p:{id:number;fullName:string;birthDate?:string;primaryPosition?:{abbreviation:string}})=>({id:p.id,name:p.fullName,birthDate:p.birthDate,position:p.primaryPosition?.abbreviation??''}))});}
 catch{return Response.json({error:'Unable to search players. Please retry.'},{status:502});}
}
