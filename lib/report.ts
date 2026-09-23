export const levels: Record<number,string> = {1:'MLB',11:'Triple-A',12:'Double-A',13:'High-A',14:'Single-A',16:'Rookie'};
export type Assignment = {teamId:number;teamName:string;sportId:number;start:string;end:string;rosterStatus?:string};
export type Game = {id:number;date:string;team:string;opponent:string;level:string;venue:string;city:string;state:string;country:string;homeAway:string;status:string;type:string;review:string;source:string;rosterStatus?:string};
export type Period = {start:string;end:string;city:string;state:string;country:string;team:string;games:number;days:number;rosterStatus:string};
export type Injury = {teamId:number;team:string;start:string;end:string;status:string;open:boolean};
export type Transaction = {id:number;date:string;effectiveDate?:string;description:string;toTeam?:{id:number;name:string};fromTeam?:{id:number;name:string}};
export type Report = {teamSchedule?:boolean;games:Game[];profileUrl?:string;excluded:number;retrievedAt:string;cutoff:string;basis:string;label:string;season:number;workpaper?:{clientReference:string;preparedBy:string;notes:string};sources:string[];warnings:string[];assignments:Assignment[];injuries:Injury[];transactions:Transaction[]};
export function summarize(games:Game[]) {
 const periods:Period[]=[];
 for(const g of [...games].sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id)) {
  const p=periods.at(-1); const gap=p?(Date.parse(g.date)-Date.parse(p.end))/86400000:99;
  if(p && gap<=1 && p.city===g.city && p.state===g.state && p.country===g.country && p.team===g.team && p.rosterStatus===(g.rosterStatus??'Roster assignment')) {p.games++;if(p.end!==g.date)p.days++;p.end=g.date;}
  else periods.push({start:g.date,end:g.date,city:g.city,state:g.state,country:g.country,team:g.team,games:1,days:1,rosterStatus:g.rosterStatus??'Roster assignment'});
 }
 const regions=new Map<string,{state:string;country:string;games:number;dates:Set<string>}>();
 for(const g of games) {const key=g.country+'|'+g.state;const r=regions.get(key)??{state:g.state,country:g.country,games:0,dates:new Set<string>()};r.games++;r.dates.add(g.date);regions.set(key,r);}
 return {periods,regions:[...regions.values()].map(r=>({state:r.state,country:r.country,games:r.games,days:r.dates.size})).sort((a,b)=>b.days-a.days),days:new Set(games.map(g=>g.date)).size};
}
export function validateAssignments(value:unknown):Assignment[] {
 if(!Array.isArray(value)||!value.length||value.length>12)throw new Error('Add between 1 and 12 assignments.');
 const rows=value as Assignment[];
 for(const row of rows) {
  if(!Number.isInteger(row.teamId)||row.teamId<=0||!levels[row.sportId])throw new Error('Select a team from the results.');
  for(const date of [row.start,row.end])if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw new Error('Enter valid dates.');
  if(row.start>row.end||row.start.slice(0,4)!==row.end.slice(0,4))throw new Error('Each assignment must fall within one calendar year, with the start before the end.');
 }
 const sorted=[...rows].sort((a,b)=>a.start.localeCompare(b.start));
 for(let i=1;i<sorted.length;i++)if(sorted[i].start<=sorted[i-1].end)throw new Error('Assignment dates overlap. Enter non-overlapping ranges.');
 return rows;
}
