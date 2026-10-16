// Deterministic updater: reads the official AuksSports schedule and result pages,
// reconciles currentSchedule, and feeds verified results through the safe merge
// in update-results.mjs. Anything ambiguous becomes a review item, never a guess.
//
//   node scripts/sync-source.mjs                 dry run against the live source
//   node scripts/sync-source.mjs --apply         write dist/data.json, players.json, footer date
//   node scripts/sync-source.mjs --fixtures DIR  read schedule.html / game<ID>.html from DIR
//   node scripts/sync-source.mjs --report FILE   write a JSON run report
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {merge, validate} from './update-results.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = 'https://www.aukssports.com';
export const SCHEDULE_URL = SOURCE + '/page9857';
const UA = 'Mozilla/5.0 (compatible; auksvb-updater/1.0; +https://auksvb.com)';
const STAT_COLUMNS = ['Kills', 'Aces', 'Blocks', 'Digs', 'Assists'];
// Complete box scores are re-read for a few days in case of late corrections; score-only games always
const RECHECK_DAYS = 3;

// ---------- HTML helpers (the source is server-rendered tables) ----------
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&#039;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
export const text = s => decode(s.replace(/<br\s*\/?>/gi, ' | ').replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/^[\s|]+|[\s|]+$/g, '').trim();
export function tables(html) {
  const out = [];
  for (const m of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const rows = [...m[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(r => [...r[1].matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map(c => ({th: c[1].toLowerCase() === 'h', html: c[2], text: text(c[2])})));
    const before = html.slice(Math.max(0, m.index - 600), m.index);
    const heading = [...before.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map(h => text(h[1])).pop() || '';
    out.push({rows, heading});
  }
  return out;
}
const findTable = (html, labels) => tables(html).map(t => {
  const hi = t.rows.findIndex(r => labels.every(l => r.some(c => c.text.toLowerCase() === l.toLowerCase())));
  return hi < 0 ? null : {...t, header: t.rows[hi].map(c => c.text), body: t.rows.slice(hi + 1)};
}).filter(Boolean);

// ---------- Schedule page ----------
export function parseSchedule(html) {
  const selected = /<option[^>]*selected[^>]*>\s*(\d{4})\/(\d{4})/i.exec(html);
  if (!selected) throw Error('Schedule page: selected school year not found');
  const [t] = findTable(html, ['Date', 'Time', 'Opponent', 'H/A', 'Location', 'Comments', 'W/L', 'Score']);
  if (!t) throw Error('Schedule page: schedule table with expected headings not found');
  const col = name => t.header.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const c = Object.fromEntries(['Date', 'Time', 'Opponent', 'H/A', 'Location', 'Comments', 'W/L', 'Score'].map(n => [n, col(n)]));
  const rows = [];
  for (const r of t.body) {
    if (r.length < t.header.length) continue; // legend / footer rows
    const dates = r[c.Date].text.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b/g);
    if (!dates) continue;
    // Only the Comments cell's "View Results" link marks a varsity result page.
    const linkId = ([...r[c.Comments].html.matchAll(/<a[^>]*href=['"]\/game(\d+)['"][^>]*>\s*View Results/gi)][0] || [])[1];
    const oppCell = r[c.Opponent];
    const code = r[c['H/A']].text.trim().toUpperCase();
    const scrimmageLink = (oppCell.html.match(/href=['"](\/Game\d+)['"]/) || [])[1];
    const isScrimmage = /scrimmage/i.test(oppCell.text);
    const isPractice = code === 'P' || /^-?practice-?$/i.test(oppCell.text);
    const comment = r[c.Comments].text.replace(/View Results/gi, '').replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const status = /cancel+ed/i.test(comment) ? 'Cancelled' : /postpone/i.test(comment) ? 'Postponed' : '';
    rows.push({
      date: dates[dates.length - 1],
      time: r[c.Time].text,
      opponentRaw: oppCell.text,
      opponent: isScrimmage ? (oppCell.text.match(/\(([^)]+)\)/) || [, oppCell.text])[1] : oppCell.text,
      code,
      homeAway: ['H', 'A', 'N'].includes(code) ? code : '',
      location: r[c.Location].text,
      comment,
      status,
      kind: isPractice ? 'Team event' : isScrimmage || code === 'S' ? 'Scrimmage' : code === 'T' ? 'Tournament' : 'Match',
      gameId: linkId || '',
      eventUrl: scrimmageLink ? SOURCE + scrimmageLink : '',
      // Live stream link (NFHS Network) shown in the date cell when a broadcast is listed
      streamUrl: (r[c.Date].html.match(/href=['"](https:\/\/[^'"]*nfhs[^'"]*)['"]/i) || [])[1] || '',
      result: r[c['W/L']].text,
      score: r[c.Score].text.replace(/\s/g, ''),
    });
  }
  if (!rows.length) throw Error('Schedule page: no dated rows found');
  const updated = (html.match(/Last Updated:[\s\S]{0,200}?(\d{1,2}\/\d{1,2}\/\d{2}\s+\d{1,2}:\d{2}\s*[AP]M)/i) || [])[1] || '';
  return {season: +selected[1], rows, sourceUpdated: updated};
}

// ---------- Result page ----------
export function parseGame(html) {
  const [sets] = findTable(html, ['Team', 'Final']);
  if (!sets) throw Error('Result page: set score table not found');
  const teamRows = sets.body.filter(r => r.length === sets.header.length);
  const ours = teamRows.filter(r => /archmere/i.test(r[0].text));
  if (ours.length !== 1 || teamRows.length !== 2) throw Error('Result page: could not identify Archmere and one opponent in the score table');
  const us = ours[0], them = teamRows.find(r => r !== us);
  const finalCol = sets.header.findIndex(h => /^final$/i.test(h));
  const setCols = sets.header.map((h, i) => /^set \d$/i.test(h) ? i : -1).filter(i => i >= 0);
  const num = s => /^\d+$/.test(s) ? +s : null;
  const setsFor = num(us[finalCol].text), setsAgainst = num(them[finalCol].text);
  const setScores = setCols.map(i => num(us[i].text) !== null && num(them[i].text) !== null ? `${us[i].text}–${them[i].text}` : '');
  while (setScores.length < 5) setScores.push('');
  const statTables = findTable(html, ['Name', ...STAT_COLUMNS]);
  const archmereTables = statTables.filter(t => /archmere/i.test(t.heading));
  if (statTables.length && !archmereTables.length) throw Error('Result page: player table found but not labelled as Archmere');
  if (archmereTables.length > 1) throw Error('Result page: more than one Archmere player table');
  if (!archmereTables.length && /<h[1-6][^>]*>[^<]*Archmere[^<]*Player Stats/i.test(html)) throw Error('Result page: Archmere player table present but its column headings changed');
  const stats = [], problems = [];
  if (archmereTables.length) {
    const t = archmereTables[0], ni = t.header.findIndex(h => h === 'Name');
    const vi = STAT_COLUMNS.map(n => t.header.findIndex(h => h === n));
    for (const r of t.body) {
      if (r.length !== t.header.length || !r[ni].text) continue;
      const values = vi.map(i => {
        const v = r[i].text;
        if (v === '') return null;
        if (/^\d+$/.test(v)) return +v;
        problems.push(`${r[ni].text}: unreadable value "${v}"`);
        return null;
      });
      stats.push({name: r[ni].text, values});
    }
  }
  return {setsFor, setsAgainst, sets: setScores.slice(0, 5), stats, hasPlayerTable: archmereTables.length === 1, problems};
}

// ---------- Network ----------
async function fetchText(url, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {headers: {'User-Agent': UA}, signal: AbortSignal.timeout(20000)});
      if (res.status === 200) {
        const body = await res.text();
        if (body.length > 2000) return body;
        last = Error(`${url}: suspiciously short response (${body.length} bytes)`);
      } else last = Error(`${url}: HTTP ${res.status}`);
    } catch (e) { last = Error(`${url}: ${e.message}`); }
    await new Promise(r => setTimeout(r, 4000 * (i + 1)));
  }
  throw last;
}
function sourceReader(fixtures) {
  if (!fixtures) return {schedule: () => fetchText(SCHEDULE_URL), game: id => fetchText(`${SOURCE}/game${id}`), nfhs: url => fetchText(url)};
  return {schedule: async () => fs.readFileSync(path.join(fixtures, 'schedule.html'), 'utf8'), game: async id => fs.readFileSync(path.join(fixtures, `game${id}.html`), 'utf8'),
    nfhs: async () => { const p = path.join(fixtures, 'nfhs-padua.html'); if (!fs.existsSync(p)) throw Error('no NFHS fixture'); return fs.readFileSync(p, 'utf8'); }};
}

// ---------- NFHS Network ----------
// The official schedule links a school's NFHS Network page; find the varsity Archmere game on that date
// so live/replay links open the actual broadcast instead of the school's profile.
export function findNfhsEvent(html, date) {
  const [m, d, y] = date.split('/').map(Number), pad = n => String(n).padStart(2, '0');
  const want = `${y < 100 ? 2000 + y : y}-${pad(m)}-${pad(d)}`;
  for (const card of html.matchAll(/<a href="(\/events\/[a-z0-9-]+\/gam[a-z0-9]+)"[^>]*aria-label="([^"]*)"[\s\S]*?<\/a>/gi)) {
    if (!/archmere/i.test(card[2])) continue;
    const body = text(card[0]).toUpperCase();
    if (/JUNIOR VARSITY|FRESHMAN|\bJV\b/.test(body) || !/VARSITY GIRLS VOLLEYBALL/.test(body)) continue;
    const dt = (card[0].match(/datetime="([^"]+)"/) || [])[1];
    if (dt && new Date(dt).toLocaleDateString('en-CA', {timeZone: 'America/New_York'}) === want) return 'https://www.nfhsnetwork.com' + card[1];
  }
  return '';
}

// ---------- Reconciliation ----------
const serial = s => { const [m, d, y] = s.split('/').map(Number); return Date.UTC(y < 100 ? 2000 + y : y, m - 1, d); };
const todayET = () => serial(new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York'}));
const dayStamp = () => new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York', month: 'long', day: 'numeric', year: 'numeric'});

export function reconcileSchedule(current, src, season) {
  const old = (current || []).filter(s => s.season === season), others = (current || []).filter(s => s.season !== season);
  const used = new Set(), out = [], notes = [];
  const take = pred => { const i = old.findIndex((s, i) => !used.has(i) && pred(s)); if (i >= 0) used.add(i); return i >= 0 ? old[i] : null; };
  for (const r of src.rows) {
    const prev = (r.gameId && take(s => s.gameId === r.gameId))
      || take(s => s.kind === r.kind && s.date === r.date && s.opponent === r.opponent)
      || (r.eventUrl && take(s => s.url === r.eventUrl))
      || take(s => s.kind === r.kind && s.date === r.date && r.kind !== 'Match')
      || (r.kind === 'Match' && take(s => s.kind === 'Match' && !s.gameId && s.opponent === r.opponent && old.filter(o => o.kind === 'Match' && o.opponent === r.opponent && !o.gameId).length === 1));
    if (prev && prev.date !== r.date) notes.push(`${r.opponent}: moved from ${prev.date} to ${r.date}`);
    const entry = {season, date: r.date, time: r.time, opponent: prev ? prev.opponent : r.opponent, homeAway: r.homeAway || prev?.homeAway || '', location: r.location, kind: prev?.kind || r.kind};
    // Curated notes survive until the source comment itself changes.
    const sourceComment = r.comment;
    entry.notes = prev && (prev.sourceComment === undefined || prev.sourceComment === sourceComment) ? prev.notes || '' : sourceComment;
    entry.sourceComment = sourceComment;
    if (r.gameId) entry.gameId = r.gameId;
    if (r.eventUrl) entry.url = r.eventUrl; else if (prev && 'url' in prev && !r.gameId) entry.url = prev.url;
    if (r.status) entry.status = r.status;
    if (r.streamUrl) entry.streamUrl = r.streamUrl;
    // Keep a found broadcast link (school pages only list recent games) unless the game moved
    if (r.streamUrl && prev?.nfhsEventUrl && prev.date === r.date) entry.nfhsEventUrl = prev.nfhsEventUrl;
    out.push(entry);
  }
  old.forEach((s, i) => { if (!used.has(i)) notes.push(`${s.opponent} (${s.date}) no longer on the official schedule; removed`); });
  return {schedule: [...others, ...out], notes};
}

export async function run({data, fixtures, now = todayET()}) {
  const read = sourceReader(fixtures);
  const report = {checkedAt: new Date().toISOString(), review: [], notes: [], gamesFetched: [], changedGames: []};
  const season = Math.max(...data.roster.map(r => r.season));
  const src = parseSchedule(await read.schedule());
  report.sourceUpdated = src.sourceUpdated;
  if (src.season !== season) {
    report.review.push({key: `season-${src.season}`, text: `The official schedule now shows the ${src.season}/${src.season + 1} school year, but the site's roster is for ${season}. A reviewed roster rollover is needed before new-season results can be imported.`});
    return {data, changed: false, report};
  }
  let d = structuredClone(data);
  const rec = reconcileSchedule(d.currentSchedule, src, season);
  report.notes.push(...rec.notes);
  // Resolve exact NFHS broadcast pages for games that list a stream (non-fatal: falls back to the school page)
  const nfhsPages = {};
  for (const e of rec.schedule.filter(e => e.season === season && e.kind === 'Match' && e.streamUrl && !e.nfhsEventUrl)) {
    try {
      if (!(e.streamUrl in nfhsPages)) nfhsPages[e.streamUrl] = await read.nfhs(e.streamUrl);
      const url = findNfhsEvent(nfhsPages[e.streamUrl], e.date);
      if (url) { e.nfhsEventUrl = url; report.notes.push(`${e.opponent} (${e.date}): broadcast ${url}`); }
    } catch (err) { report.notes.push(`${e.opponent} (${e.date}): NFHS lookup failed (${err.message}); using the school page`); }
  }
  const scheduleChanged = JSON.stringify(rec.schedule) !== JSON.stringify(d.currentSchedule);
  d.currentSchedule = rec.schedule;
  if (scheduleChanged) d.scheduleChecked = dayStamp();

  const candidates = [];
  for (const r of src.rows.filter(r => r.kind === 'Match' || r.kind === 'Tournament')) {
    if (r.kind === 'Tournament') { report.review.push({key: `tournament-${r.date}-${r.opponentRaw}`, text: `${r.date} ${r.opponentRaw}: tournament rows are not imported automatically.`}); continue; }
    if (!r.gameId) continue;
    if (!['W', 'L'].includes(r.result) || !/^\d-\d$/.test(r.score)) { report.review.push({key: `result-${r.gameId}`, text: `Game ${r.gameId} (${r.opponent}, ${r.date}) has a results link but no readable W/L and score ("${r.result}" "${r.score}").`}); continue; }
    const existing = d.games.find(g => g.id === r.gameId);
    const recent = now - serial(r.date) <= RECHECK_DAYS * 864e5;
    const sameScore = existing && existing.result === r.result && existing.score === r.score && existing.date === r.date;
    if (existing && existing.type === 'Player table' && !recent && sameScore) continue;
    let g;
    try { g = parseGame(await read.game(r.gameId)); report.gamesFetched.push(r.gameId); }
    catch (e) { report.review.push({key: `page-${r.gameId}`, text: `Game ${r.gameId} (${r.opponent}, ${r.date}): ${e.message}`}); continue; }
    if (g.problems.length) { report.review.push({key: `values-${r.gameId}`, text: `Game ${r.gameId}: ${g.problems.join('; ')}`}); continue; }
    const [a, b] = r.score.split('-').map(Number);
    if (g.setsFor !== a || g.setsAgainst !== b || (a > b) !== (r.result === 'W')) { report.review.push({key: `score-${r.gameId}-${r.score}`, text: `Game ${r.gameId}: schedule says ${r.result} ${r.score} but the result page says ${g.setsFor}-${g.setsAgainst}.`}); continue; }
    // Names: exact match to a known player, or to this season's roster (new player record).
    const unknown = g.stats.filter(s => !d.players.some(p => p.name === s.name));
    const rosterNew = unknown.filter(s => d.roster.some(x => x.season === season && x.name === s.name && x.role === 'Player'));
    const stillUnknown = unknown.filter(s => !rosterNew.includes(s));
    if (stillUnknown.length) { report.review.push({key: `names-${r.gameId}-${stillUnknown.map(s => s.name).join(',')}`, text: `Game ${r.gameId} (${r.opponent}): names not on the ${season} roster or player list: ${stillUnknown.map(s => s.name).join(', ')}. Player stats held back; score still recorded.`}); g.stats = []; }
    for (const s of g.stats.filter(s => rosterNew.includes(s))) {
      const ros = d.roster.find(x => x.season === season && x.name === s.name);
      const id = s.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      d.players.push({name: s.name, year: Number.isInteger(ros.grade) ? season + 13 - ros.grade : 'Unknown', note: 'Expected from published grades', values: [null, null, null, null, null], id});
      report.notes.push(`Added player record for ${s.name} from the ${season} roster`);
    }
    const game = {
      season, id: r.gameId, date: r.date, opponent: existing?.opponent || r.opponent, homeAway: r.homeAway || existing?.homeAway,
      phase: existing?.phase || 'Regular', result: r.result, score: r.score, url: `${SOURCE}/game${r.gameId}`,
      notes: existing?.notes ?? '', sets: g.sets.some(Boolean) ? g.sets : existing?.sets || g.sets, setsFor: g.setsFor, setsAgainst: g.setsAgainst,
    };
    candidates.push({complete: true, game, stats: g.stats.map(s => ({name: s.name, values: s.values}))});
  }
  // Merge one game at a time so one problem game cannot block the others.
  for (const c of candidates) {
    try {
      const res = merge(d, {games: [c]});
      if (res.changed) report.changedGames.push(c.game.id);
      d = res.data;
    } catch (e) {
      report.review.push({key: `merge-${c.game.id}-${e.message}`, text: `Game ${c.game.id} (${c.game.opponent}, ${c.game.date}) held for review: ${e.message}`});
    }
  }
  validate(d);
  const changed = JSON.stringify(d) !== JSON.stringify(data);
  if (changed && report.changedGames.length) d.updated = dayStamp();
  report.scheduleChanged = scheduleChanged;
  return {data: d, changed, report};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
  const dataPath = path.join(root, 'dist/data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const out = await run({data, fixtures: arg('--fixtures')});
  out.report.changed = out.changed;
  if (arg('--report')) fs.writeFileSync(arg('--report'), JSON.stringify(out.report, null, 2));
  console.log(JSON.stringify({changed: out.changed, changedGames: out.report.changedGames, scheduleChanged: out.report.scheduleChanged, fetched: out.report.gamesFetched, review: out.report.review.map(r => r.text), notes: out.report.notes}, null, 2));
  if (out.changed && process.argv.includes('--apply')) {
    fs.writeFileSync(dataPath, JSON.stringify(out.data));
    fs.writeFileSync(path.join(root, 'players.json'), JSON.stringify(out.data.players, null, 2));
    if (out.data.updated !== data.updated) {
      const html = path.join(root, 'dist/index.html');
      fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace(/(Updated )[A-Z][a-z]+ \d{1,2}, \d{4}/, '$1' + out.data.updated));
    }
  }
}
