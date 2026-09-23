import type {Report} from './report';
import {summarize} from './report';

const simpleStatus=(status?:string)=>{
 if(status==='Manual review')return 'Manual review';
 if(status==='Injured list')return 'Injured list';
 if(status?.toLowerCase().includes('transaction'))return 'Transaction';
 return 'Roster entry';
};

export async function exportWorkbook(report:Report){
 const ExcelJS=await import('exceljs');
 const workbook=new ExcelJS.Workbook();
 workbook.creator='CORE Wealth Baseball';
 workbook.created=new Date(report.retrievedAt);
 const summary=summarize(report.games);
 const addSheet=(name:string,headers:string[],rows:(string|number)[][])=>{
  const ws=workbook.addWorksheet(name);
  ws.addRow(headers);ws.addRows(rows);ws.views=[{state:'frozen',ySplit:1}];
  ws.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,ws.rowCount),column:headers.length}};
  ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF3E5365'}};
  ws.getRow(1).height=25;
  ws.columns.forEach((col,i)=>{col.width=Math.min(45,Math.max(headers[i].length+3,...rows.map(row=>String(row[i]??'').length+2)));});
  return ws;
 };

 if(report.teamSchedule){
  addSheet('Summary',['Start date','End date','City','State / province','Country','Number of games'],summary.periods.map(period=>[
   period.start,period.end,period.city,period.state,period.country,period.games
  ]));
 }else{
  const ws=workbook.addWorksheet('Summary');
  ws.addRows([
   ['Player',report.label],
   ['Tax year',report.season],
   ['Completed games',report.games.length],
   [],
   ['State / province','Country','Completed games','Game dates'],
   ...summary.regions.map(region=>[region.state,region.country,region.games,region.days]),
  ]);
  for(let row=1;row<=3;row++)ws.getCell(`A${row}`).font={bold:true,color:{argb:'FF3E5365'}};
  ws.getRow(5).font={bold:true,color:{argb:'FFFFFFFF'}};
  ws.getRow(5).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF3E5365'}};
  ws.views=[{state:'frozen',ySplit:5}];
  ws.autoFilter={from:{row:5,column:1},to:{row:Math.max(5,ws.rowCount),column:4}};
  ws.columns=[{width:24},{width:18},{width:18},{width:14}];

  const locationSheet=addSheet('Location periods',['Start date','End date','City','State / province','Country','Team','Number of games','Roster status'],summary.periods.map(period=>[
   period.start,period.end,period.city,period.state,period.country,period.team,period.games,simpleStatus(period.rosterStatus)
  ]));
  summary.periods.forEach((period,index)=>{if(simpleStatus(period.rosterStatus)==='Manual review')locationSheet.getCell(index+2,8).font={color:{argb:'FFB42318'},bold:true};});
  addSheet('Transactions',['Effective date','Posted date','Description','Transaction ID'],report.transactions.map(transaction=>[
   transaction.effectiveDate??transaction.date,transaction.date,transaction.description,transaction.id
  ]));
 }
 addSheet('Spring training',['Date','Team','Opponent','Ballpark','City','State / province','Country','Home / away'],(report.springGames??[]).map(game=>[
  game.date,game.team,game.opponent,game.venue,game.city,game.state,game.country,game.homeAway
 ]));

 const buffer=await workbook.xlsx.writeBuffer();
 const url=URL.createObjectURL(new Blob([buffer as ArrayBuffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const anchor=document.createElement('a');anchor.href=url;
 anchor.download=`CORE-${report.teamSchedule?'Team-Schedule':'Player-Locations'}-${report.label.replace(/[^a-z0-9-]/gi,'_')}-${report.season}.xlsx`;
 anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
