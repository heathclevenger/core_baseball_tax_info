import type {Assignment,Injury,Transaction} from './report.ts';
export type Entry={team:{id:number;name:string};startDate?:string;endDate?:string;statusDate?:string;status?:{code:string;description:string}};
export const previousDay=(date:string)=>new Date(Date.parse(date)-86400000).toISOString().slice(0,10);
export function injuryPeriods(transactions:Transaction[],season:number,through:string):Injury[]{
 const open=new Map<number,Injury>();const result:Injury[]=[];
 for(const t of [...transactions].sort((a,b)=>(a.effectiveDate??a.date).localeCompare(b.effectiveDate??b.date)||a.id-b.id)){
  const date=(t.effectiveDate??t.date).slice(0,10);if(date>through)continue;const team=t.toTeam??t.fromTeam;if(!team)continue;
  if(/(?:placed|transferred).* (?:injured|disabled) list/i.test(t.description)){
   const existing=open.get(team.id);if(existing){existing.status=t.description;continue;}
   open.set(team.id,{teamId:team.id,team:team.name,start:date,end:through,status:t.description,open:true});
  }else if(/activated.*from.*(?:injured|disabled) list/i.test(t.description)){
   const existing=open.get(team.id);if(existing){existing.end=previousDay(date);existing.open=false;result.push(existing);open.delete(team.id);}
  }
 }
 result.push(...open.values());return result.filter(r=>r.end>=`${season}-01-01`&&r.start<=through).map(r=>({...r,start:r.start<`${season}-01-01`?`${season}-01-01`:r.start}));
}
export function rosterAssignments(entries:Entry[],transactions:Transaction[],teams:Map<number,{sportId:number;name:string}>,season:number,through:string):Assignment[]{
 const first=`${season}-01-01`;const rows:Assignment[]=[];
 for(const e of entries){if(!e.startDate||!teams.has(e.team.id)||e.startDate>through||(e.endDate&&e.endDate<first))continue;const start=e.startDate<first?first:e.startDate.slice(0,10);const end=e.endDate&&e.endDate<through?e.endDate.slice(0,10):through;rows.push({teamId:e.team.id,teamName:e.team.name,sportId:teams.get(e.team.id)!.sportId,start,end,rosterStatus:'Roster entry'});}
 const moves=transactions.filter(t=>/(?:optioned|recalled|assigned|selected the contract|traded|claimed|released|designated .*assignment)/i.test(t.description)&&!/rehab|rehabilitation/i.test(t.description)).sort((a,b)=>(a.effectiveDate??a.date).localeCompare(b.effectiveDate??b.date)||a.id-b.id);
 for(const t of moves){const date=(t.effectiveDate??t.date).slice(0,10);if(date<first||date>through)continue;const dest=t.toTeam,source=t.fromTeam;const leaving=/released|designated .*assignment/i.test(t.description);if(!leaving&&(!dest||!teams.has(dest.id)))continue;
  if(source&&teams.has(source.id)&&!rows.some(r=>r.teamId===source.id&&r.start<=previousDay(date)&&r.end>=previousDay(date))){const team=teams.get(source.id)!;rows.push({teamId:source.id,teamName:team.name,sportId:team.sportId,start:first,end:previousDay(date),rosterStatus:'Transaction'});}
  for(const row of rows)if(row.start<date&&row.end>=date&&(leaving||row.teamId!==dest?.id))row.end=previousDay(date);
  if(!leaving&&dest&&!rows.some(r=>r.teamId===dest.id&&r.start<=date&&r.end>=date))rows.push({teamId:dest.id,teamName:dest.name,sportId:teams.get(dest.id)!.sportId,start:date,end:through,rosterStatus:'Transaction'});
 }
 return rows.filter(r=>r.start<=r.end).sort((a,b)=>a.start.localeCompare(b.start));
}
export function gameLogAssignments(responses:any[],teams:Map<number,{sportId:number;name:string}>):Assignment[]{
 const seen=new Map<string,{date:string;teamId:number}>();
 for(const data of responses)for(const block of data.stats??[])for(const split of block.splits??[]){const date=String(split.date??'').slice(0,10),teamId=split.team?.id;if(date&&teams.has(teamId))seen.set(`${date}|${teamId}`,{date,teamId});}
 const rows:Assignment[]=[];for(const item of [...seen.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.teamId-b.teamId)){const team=teams.get(item.teamId)!;const last=rows.at(-1);if(last?.teamId===item.teamId)last.end=item.date;else rows.push({teamId:item.teamId,teamName:team.name,sportId:team.sportId,start:item.date,end:item.date,rosterStatus:'Game log'});}
 return rows;
}
export function mergeAssignmentSources(roster:Assignment[],logs:Assignment[],season:number,through:string):Assignment[]{
 const days=new Map<string,Assignment>();const add=(rows:Assignment[],gameLogs=false)=>{for(const row of rows){for(let time=Math.max(Date.parse(`${season}-01-01`),Date.parse(row.start));time<=Math.min(Date.parse(through),Date.parse(row.end));time+=86400000){const date=new Date(time).toISOString().slice(0,10),existing=days.get(date);days.set(date,gameLogs&&existing&&existing.teamId!==row.teamId?{...row,rosterStatus:'Manual review'}:row);}}};add(roster);add(logs,true);
 const merged:Assignment[]=[];for(const [date,row] of [...days].sort(([a],[b])=>a.localeCompare(b))){const last=merged.at(-1);if(last&&last.teamId===row.teamId&&last.rosterStatus===row.rosterStatus&&previousDay(date)===last.end)last.end=date;else merged.push({...row,start:date,end:date});}return merged;
}
