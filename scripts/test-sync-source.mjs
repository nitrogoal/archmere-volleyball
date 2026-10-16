// Regression tests for the source updater, run against saved official pages.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {parseSchedule, parseGame, run, findNfhsEvent} from './sync-source.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fx = path.join(here, 'fixtures');
const read = f => fs.readFileSync(path.join(fx, f), 'utf8');
const base = JSON.parse(read('data.json')); // frozen October 16, 2026 snapshot
const later = Date.UTC(2026, 11, 31); // past the recheck window: only score-only games are revisited
function variant(edit, extra = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'auksvb-'));
  for (const f of fs.readdirSync(fx)) fs.copyFileSync(path.join(fx, f), path.join(dir, f));
  fs.writeFileSync(path.join(dir, 'schedule.html'), edit(read('schedule.html')));
  for (const [f, body] of Object.entries(extra)) fs.writeFileSync(path.join(dir, f), body);
  return dir;
}
// MOT Charter (10/20) row gains a result link and score.
const motResult = (id, wl = 'W', score = '3-1') => s => s.replace(/(MOT Charter HS<\/a>\s*<\/span>\s*<\/td>\s*<td>)\s*(<\/td>\s*<td class='text-center'>)\s*(<\/td>\s*<td class='text-center'>\s*<span class='text-nowrap'>)\s*(<\/span>)/,
  `$1<span><a title='Click here to view game results' href='/game${id}'>View Results</a></span>$2${wl}$3 ${score}$4`);
const motPage = (edit = h => h) => edit(read('game404441.html').replace(/Appoquinimink HS Jaguars/, 'MOT Charter HS Eagles'));

// 1. Schedule parsing
const sch = parseSchedule(read('schedule.html'));
assert.equal(sch.season, 2026);
assert.equal(sch.rows.length, 19);
assert.equal(sch.rows.filter(r => r.kind === 'Match').length, 15);
assert.equal(sch.rows.filter(r => r.gameId).length, 12, 'only View Results links are results');
assert.equal(sch.rows.filter(r => r.kind === 'Scrimmage').length, 3);
assert.equal(sch.rows.filter(r => r.kind === 'Team event').length, 1);
assert.deepEqual(sch.rows.find(r => r.gameId === '404446'), {...sch.rows.find(r => r.gameId === '404446'), date: '10/15/26', result: 'W', score: '3-1', homeAway: 'A'});
assert.equal(sch.rows.find(r => r.opponent === 'MOT Charter HS').date, '10/20/26', 'update icon text ignored');
assert.equal(sch.rows.find(r => r.opponent === 'Padua Academy').streamUrl, 'https://nfhs-network.pxf.io/padua_academy', 'live stream link captured');
assert.equal(sch.rows.find(r => r.opponent === 'Conrad School').streamUrl, '');
// NFHS: pick the varsity Archmere broadcast on that date, not JV/freshman or the school profile
const nfhs = read('nfhs-padua.html');
assert.equal(findNfhsEvent(nfhs, '9/26/26'), 'https://www.nfhsnetwork.com/events/padua-academy-wilmington-de/gamca588a86a3');
assert.equal(findNfhsEvent(nfhs, '9/27/26'), '', 'no game that day');

// 2. Result pages
const g41 = parseGame(read('game404441.html'));
assert.equal(g41.stats.length, 14);
assert.deepEqual(g41.stats.find(s => s.name === 'Lillian Guzevich').values, [8, 4, 1, 10, 21]);
assert.deepEqual(g41.stats.find(s => s.name === 'Brooke Maddox').values, [null, null, null, null, null], 'blank stays null');
assert.deepEqual(g41.sets, ['25–13', '25–22', '17–25', '25–13', '']);
const g46 = parseGame(read('game404446.html'));
assert.equal(g46.hasPlayerTable, false);
assert.deepEqual([g46.setsFor, g46.setsAgainst, g46.stats.length], [3, 1, 0]);

// 3. Unchanged source: no result changes, and a second pass is a no-op
const r1 = await run({data: base, fixtures: fx, now: later});
assert.deepEqual(r1.report.changedGames, []);
assert.deepEqual(r1.report.review, []);
assert.deepEqual(['games', 'stats', 'players'].map(k => JSON.stringify(r1.data[k])), ['games', 'stats', 'players'].map(k => JSON.stringify(base[k])));
const r2 = await run({data: r1.data, fixtures: fx, now: later});
assert.equal(r2.changed, false, 'repeat run must not change data');

// 4. New result with a player table: schedule row transitions, stats and totals land once
const dirNew = variant(motResult('409999'), {'game409999.html': motPage()});
const n1 = await run({data: r1.data, fixtures: dirNew, now: later});
assert.deepEqual(n1.report.review, []);
assert.deepEqual(n1.report.changedGames, ['409999']);
assert.equal(n1.data.games.length, base.games.length + 1);
assert.equal(n1.data.stats.length, base.stats.length + 14);
assert.equal(n1.data.currentSchedule.filter(s => s.opponent === 'MOT Charter HS').length, 1, 'no duplicate schedule row');
assert.equal(n1.data.currentSchedule.find(s => s.opponent === 'MOT Charter HS').gameId, '409999');
const lg = p => p.players.find(x => x.name === 'Lillian Guzevich').values[4];
assert.equal(lg(n1.data), lg(base) + 21);
const n2 = await run({data: n1.data, fixtures: dirNew, now: later});
assert.equal(n2.changed, false, 'reapplying the same result is a no-op');

// 5. Score first, player table later: stats fill in without duplicating the game
const dirScore = variant(motResult('409999'), {'game409999.html': read('game404446.html').replace(/Caravel Academy Buccaneers/, 'MOT Charter HS Eagles')});
const s1 = await run({data: r1.data, fixtures: dirScore, now: later});
assert.equal(s1.data.games.find(g => g.id === '409999').type, 'Score only');
const s2 = await run({data: s1.data, fixtures: dirNew, now: later});
assert.equal(s2.data.games.find(g => g.id === '409999').type, 'Player table');
assert.equal(s2.data.games.length, base.games.length + 1);
assert.equal(lg(s2.data), lg(base) + 21);

// 6. Mismatched score between schedule and result page goes to review
const bad = await run({data: r1.data, fixtures: variant(motResult('409999', 'W', '3-2'), {'game409999.html': motPage()}), now: later});
assert.equal(bad.report.changedGames.length, 0);
assert.match(bad.report.review[0].text, /result page says 3-1/);

// 7. Unknown player name: stats held back, score still recorded, review raised
const unk = await run({data: r1.data, fixtures: variant(motResult('409999', 'W', '3-1'), {'game409999.html': motPage(h => h.replace('Grace Mahoney', 'Gracie Mahony'))}), now: later});
assert.match(unk.report.review.map(r => r.text).join(), /Gracie Mahony/);
assert.equal(unk.data.games.find(g => g.id === '409999').type, 'Score only');

// 8. Renamed stat column: review, no guessing
const col = await run({data: r1.data, fixtures: variant(motResult('409999', 'W', '3-1'), {'game409999.html': motPage(h => h.replace(/>Kills</, '>K<'))}), now: later});
assert.match(col.report.review.map(r => r.text).join(), /column headings changed/);
assert.equal(col.data.games.some(g => g.id === '409999'), false, 'unreadable table is not treated as a score-only result');

// 9. Postponement and reschedule keep one row per match
const moved = await run({data: r1.data, fixtures: variant(s => s.replace('10/27/26', '10/28/26').replace('Admission - Adults - $5, Students - $1', 'Postponed from 10/27')), now: later});
const nc = moved.data.currentSchedule.filter(s => s.opponent === 'Newark Charter School');
assert.equal(nc.length, 1);
assert.deepEqual([nc[0].date, nc[0].status], ['10/28/26', 'Postponed']);
assert.match(moved.report.notes.join(), /moved from 10\/27\/26 to 10\/28\/26/);

// 10. New school year selected: nothing imported, rollover review
const roll = await run({data: r1.data, fixtures: variant(s => s.replace(/<option selected="selected" value="2027">2026\/2027/, '<option selected="selected" value="2028">2027/2028')), now: later});
assert.equal(roll.changed, false);
assert.match(roll.report.review[0].text, /roster rollover/);

// 11. Layout change on the schedule page is a hard failure, not an empty schedule
assert.throws(() => parseSchedule(read('schedule.html').replace(/>Opponent</, '>Team<')), /expected headings/);

console.log('PASS: schedule/result parsing, no-op rerun, new result, late stats, score mismatch, unknown name, renamed column, reschedule/postponement, season rollover, layout change.');
