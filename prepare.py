import json, pathlib, collections
root=pathlib.Path(__file__).parent
d=json.loads((root/'../../archmere_record_book/normalized.json').resolve().read_text(encoding='utf-8'))
players=json.loads((root/'players.json').read_text(encoding='utf-8'))
def uid(n):
    import re
    return re.sub('[^a-z0-9]+','-',n.lower()).strip('-')
for p in players:p['id']=uid(p['name'])
assert len({p['id'] for p in players})==len(players)
stats=[{k:s.get(k) for k in ['season','id','date','opponent','phase','name','values','method','note','source']} for s in d['stats']]
games=d['games']
resolved=json.loads((root/'corrections.json').read_text(encoding='utf-8')) if (root/'corrections.json').exists() else []
for correction in resolved:
    game=next(g for g in games if g['id']==correction['id'])
    stats=[s for s in stats if s['id']!=game['id']]
    for row in correction['rows']:
        stats.append({**{k:game[k] for k in ['season','id','date','opponent','phase']},**row,'method':'Written summary','note':'Resolved team-label reversal on October 16, 2026; stat order verified against same-season official summaries.','source':game['url']})
    game['type']='Written summary'
    d['issues']=[i for i in d['issues'] if not (i['id']==correction['id'] and i['raw']==correction['raw'])]
for g in games:g['entries']=sum(s['id']==g['id'] for s in stats)
out={'updated':'October 16, 2026','players':players,'games':games,'stats':stats,'roster':d['roster'],'issues':d['issues'],'scheduleOnly':d['scheduleOnly']}
out['resolvedIssues']=resolved
for p in players:
    ss=[s for s in stats if s['name']==p['name']]
    totals=[sum(s['values'][i] for s in ss if s['values'][i] is not None) if any(s['values'][i] is not None for s in ss) else None for i in range(5)]
    assert totals==p['values'],(p['name'],totals,p['values'])
(root/'dist/data.json').write_text(json.dumps(out,separators=(',',':'),ensure_ascii=False),encoding='utf-8')
print(f'Validated {len(players)} players, {len(games)} games, {len(stats)} player entries.')
