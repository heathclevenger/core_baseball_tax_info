import {mlb} from '@/lib/mlb';
import {levels} from '@/lib/report';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const season=new URL(request.url).searchParams.get('season')??'2026';
 if(!/^\d{4}$/.test(season)||+season<1900||+season>new Date().getFullYear()+1)return Response.json({error:'Invalid season.'},{status:400});
 try {
  const results=await Promise.all(Object.keys(levels).map(async id=>{const data=await mlb(`/teams?sportId=${id}&season=${season}`);return (data.teams??[]).map((t:{id:number;name:string;parentOrgId?:number;league?:{name:string}})=>({id:t.id,name:t.name,sportId:+id,level:levels[+id],league:t.league?.name??'',parentOrgId:t.parentOrgId??null}));}));
  return Response.json({teams:results.flat().sort((a,b)=>a.name.localeCompare(b.name))});
 }catch{return Response.json({error:'Unable to load the team directory. Please retry.'},{status:502});}
}
