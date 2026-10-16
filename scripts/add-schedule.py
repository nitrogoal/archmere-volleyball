import json
from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'dist/data.json'
d=json.loads(p.read_text(encoding='utf-8'))
times=['6:00pm','6:00pm','6:00pm','6:00pm','11:45am','6:00pm','6:00pm','5:15pm','6:15pm','6:00pm','6:00pm','6:15pm']
games=sorted([g for g in d['games'] if g['season']==2026],key=lambda g:tuple(map(int,[g['date'].split('/')[0],g['date'].split('/')[1]])))
schedule=[]
for g,t in zip(games,times):
 schedule.append(dict(season=2026,date=g['date'],time=t,opponent=g['opponent'],homeAway=g['homeAway'],location='Archmere Academy' if g['homeAway']=='H' else 'Tower Hill School - Carpenter Field House' if g['id']=='404439' else g['opponent'],kind='Match',gameId=g['id'],notes='Homecoming Game · Triple Header' if g['id']=='404274' else ''))
for dt,t,opp,ha,loc,n in [('10/20/26','6:15pm','MOT Charter HS','A','MOT Charter HS',''),('10/27/26','7:00pm','Newark Charter School','A','Newark Charter HS','Admission: adults $5 · students $1'),('10/29/26','6:00pm','Delmarva Christian HS','H','Archmere Academy','Archmere Senior Night')]:
 schedule.append(dict(season=2026,date=dt,time=t,opponent=opp,homeAway=ha,location=loc,kind='Match',notes=n))
for dt,t,opp,loc,kind,n,gid in [('8/22/26','1:00pm','St. Georges Tech HS','St. Georges Tech HS','Scrimmage','Play Day · 6 teams','422397'),('9/1/26','5:00pm','Caravel Academy','NBN Sports Academy','Scrimmage','Play Day · 10 teams','421708'),('9/3/26','4:30pm',"Saint Mark\'s HS","Saint Mark\'s HS",'Scrimmage','Play Day · Archmere, Charter Wilmington, Saint Mark’s and Ursuline','427851'),('9/10/26','2:45pm','Picture Day','Archmere Academy','Team event','Practice / Picture Day','')]:
 schedule.append(dict(season=2026,date=dt,time=t,opponent=opp,homeAway='H' if kind=='Team event' else 'A',location=loc,kind=kind,notes=n,url='https://www.aukssports.com/Game'+gid if gid else ''))
d['currentSchedule']=sorted(schedule,key=lambda s:tuple(map(int,s['date'].split('/')[:2])))
d['scheduleChecked']='October 16, 2026'
p.write_text(json.dumps(d,separators=(',',':')),encoding='utf-8')
