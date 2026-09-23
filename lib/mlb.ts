export const API='https://statsapi.mlb.com/api/v1';
export async function mlb(path:string) {
 const response=await fetch(API+path,{cache:'no-store',signal:AbortSignal.timeout(25000)});
 if(!response.ok)throw new Error('MLB data is temporarily unavailable. Please try again.');
 return response.json();
}
export type RawGame={gamePk:number;officialDate:string;gameType:string;status:{abstractGameState:string;detailedState:string};teams:{home:{team:{id:number;name:string}};away:{team:{id:number;name:string}}};venue?:{name?:string;location?:{city?:string;state?:string;country?:string}};resumeDate?:string;resumedFrom?:string;rescheduledFrom?:string};
