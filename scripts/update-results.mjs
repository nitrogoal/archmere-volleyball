import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const total=rows=>Array.from({length:5},(_,i)=>{const v=rows.map(r=>r.values[i]).filter(x=>x!==null);return v.length?v.reduce((a,b)=>a+b,0):null;});
export function validate(d){
 assert.equal(new Set(d.games.map(g=>g.id)).size,d.games.length,'Duplicate game IDs');
 assert.equal(new Set(d.stats.map(s=>s.id+'|'+s.name)).size,d.stats.length,'Duplicate player/game rows');
 for(const s of d.stats){assert(d.games.some(g=>g.id===s.id&&g.season===s.season));assert(d.players.some(p=>p.name===s.name));assert(s.values.length===5&&s.values.every(v=>v===null||(Number.isInteger(v)&&v>=0)));}
 for(const p of d.players)assert.deepEqual(p.values,total(d.stats.filter(s=>s.name===p.name)),p.name+' career total');
 for(const c of d.resolvedIssues||[]){for(const r of c.rows){const s=d.stats.filter(s=>s.id===c.id&&s.name===r.name);assert.equal(s.length,1);assert.deepEqual(s[0].values,r.values,'Reviewed correction changed');}if(c.decision==='exclude')assert(d.stats.filter(s=>s.id===c.id&&s.name===c.name).every(s=>s.values.every(v=>v===null)),'Excluded entry changed');}
}
export function merge(current,batch){
 validate(current);assert(Array.isArray(batch.games));assert.equal(new Set(batch.games.map(x=>x.game.id)).size,batch.games.length,'Duplicate incoming game');
 const d=structuredClone(current);const season=Math.max(...d.roster.map(r=>r.season));
 for(const item of batch.games){
  const g=item.game;assert.equal(g.season,season,'New season needs reviewed roster setup');assert(/^\d+$/.test(g.id));assert.equal(g.url,'https://www.aukssports.com/game'+g.id);assert(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(g.date));assert(['W','L'].includes(g.result));assert(/^\d-\d$/.test(g.score));assert(['Regular','Postseason'].includes(g.phase));assert(['H','A','N'].includes(g.homeAway));assert(g.opponent&&g.opponent!=='Archmere Academy');assert.equal(item.complete,true,'Incomplete source capture');
  assert.equal(new Set(item.stats.map(r=>r.name)).size,item.stats.length,'Duplicate incoming player');
  const old=d.games.find(x=>x.id===g.id);if(old)assert.equal(old.season,g.season);
  const reviewed=new Set((d.resolvedIssues||[]).filter(c=>c.id===g.id).flatMap(c=>[c.name,...c.rows.map(r=>r.name)]));
  for(const r of item.stats){
   assert(d.players.some(p=>p.name===r.name),'Unknown player: '+r.name);assert(r.values.length===5&&r.values.every(v=>v===null||(Number.isInteger(v)&&v>=0)));
   const existing=d.stats.find(s=>s.id===g.id&&s.name===r.name);
   if(reviewed.has(r.name)){assert(existing&&JSON.stringify(existing.values)===JSON.stringify(r.values),'Conflict with reviewed correction');continue;}
   if(existing){for(let i=0;i<5;i++)if(existing.values[i]!==null&&r.values[i]===null)throw Error('Source lost a known statistic; hold for review');existing.values=r.values;}
   else d.stats.push({season:g.season,id:g.id,date:g.date,opponent:g.opponent,phase:g.phase,name:r.name,values:r.values,method:'Player table',note:'Official result checked by scheduled updater; blank cells remain unreported.',source:g.url});
  }
  if(item.stats.length){for(const s of d.stats.filter(s=>s.id===g.id))assert(item.stats.some(r=>r.name===s.name)||reviewed.has(s.name),'Source omitted an existing player; hold for review');}
  const game=old||{...g};if(old)Object.assign(game,g);else d.games.push(game);
  game.entries=d.stats.filter(s=>s.id===g.id).length;game.type=game.entries?'Player table':'Score only';
  for(const s of d.stats.filter(s=>s.id===g.id)){s.date=game.date;s.opponent=game.opponent;s.phase=game.phase;}
  d.scheduleOnly=d.scheduleOnly.filter(s=>!(s.season===g.season&&s.date===g.date&&s.opponent===g.opponent));
 }
 for(const p of d.players)p.values=total(d.stats.filter(s=>s.name===p.name));
 validate(d);
 return {data:d,changed:JSON.stringify(d)!==JSON.stringify(current)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const d=JSON.parse(fs.readFileSync(path.join(root,'dist/data.json'),'utf8'));
 if(process.argv[2]==='--validate'){validate(d);console.log('Validated all player totals, unique game/player keys, and reviewed corrections.');}
 else{
  assert(process.argv[2],'Provide a candidate JSON file');
  const result=merge(d,JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
  console.log(JSON.stringify({changed:result.changed,games:result.data.games.length,stats:result.data.stats.length}));
  if(result.changed&&process.argv.includes('--apply')){
   result.data.updated=new Date().toLocaleDateString('en-US',{timeZone:'America/New_York',month:'long',day:'numeric',year:'numeric'});
   fs.writeFileSync(path.join(root,'dist/data.json'),JSON.stringify(result.data));
   fs.writeFileSync(path.join(root,'players.json'),JSON.stringify(result.data.players,null,2));
   const html=path.join(root,'dist/index.html');fs.writeFileSync(html,fs.readFileSync(html,'utf8').replace(/Independent record book · Updated [^<]+/,'Independent record book · Updated '+result.data.updated));
  }
 }
}
