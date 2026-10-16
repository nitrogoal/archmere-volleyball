// Builds dist/schedule.ics (a subscribable season calendar) from dist/data.json.
// Run at publish time so the feed always matches the live data:
//   node scripts/build-ics.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://auksvb.com';

const serial = d => { const [m, day, y] = d.split('/').map(Number); return Date.UTC(y < 100 ? 2000 + y : y, m - 1, day); };
const pad = n => String(n).padStart(2, '0');
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// RFC 5545 lines are folded at 75 octets
const fold = line => { const out = []; let s = line; while (Buffer.byteLength(s) > 75) { let n = 75; while (Buffer.byteLength(s.slice(0, n)) > 75) n--; out.push(s.slice(0, n)); s = ' ' + s.slice(n); } out.push(s); return out.join('\r\n'); };

export function parseWhen(date, time) {
  const [m, d, y] = date.split('/').map(Number);
  const year = y < 100 ? 2000 + y : y;
  const t = /^(\d{1,2})(?::(\d{2}))?\s*([ap])m$/i.exec(String(time || '').trim());
  if (!t) return {allDay: true, day: `${year}${pad(m)}${pad(d)}`};
  let h = Number(t[1]) % 12; if (t[3].toLowerCase() === 'p') h += 12;
  return {allDay: false, day: `${year}${pad(m)}${pad(d)}`, start: `${year}${pad(m)}${pad(d)}T${pad(h)}${pad(t[2] || 0)}00`, endHour: h + 2, min: t[2] || '00'};
}

export function buildCalendar(data, themes = {}, single) {
  const season = Math.max(...data.roster.map(r => r.season));
  const rows = (data.currentSchedule || []).filter(s => s.season === season).sort((a, b) => serial(a.date) - serial(b.date));
  const seen = {};
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//auksvb.com//Archmere Volleyball//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Archmere Volleyball', 'X-WR-TIMEZONE:America/New_York', 'X-PUBLISHED-TTL:PT3H', 'REFRESH-INTERVAL;VALUE=DURATION:PT3H',
    'BEGIN:VTIMEZONE', 'TZID:America/New_York',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE'];
  const events = {};
  for (const s of rows) {
    const start = lines.length;
    // Stable ID per meeting: season + opponent + nth meeting, so a reschedule updates the same event
    const key = `${s.kind}-${slug(s.opponent)}`; seen[key] = (seen[key] || 0) + 1;
    const uid = `${season}-${key}-${seen[key]}@auksvb.com`;
    const game = s.gameId && data.games.find(g => g.id === s.gameId);
    const w = parseWhen(s.date, s.time);
    const theme = themes[`${s.date}|${s.opponent}`];
    const isMatch = s.kind === 'Match';
    const title = isMatch ? `Archmere ${s.homeAway === 'H' ? 'vs' : 'at'} ${s.opponent}` : `Archmere: ${s.kind} – ${s.opponent}`;
    const prefix = s.status ? `${s.status.toUpperCase()}: ` : '';
    const result = game ? ` (${game.result} ${game.score})` : '';
    const desc = [game ? `Final: ${game.result === 'W' ? 'Archmere won' : 'Archmere lost'} ${game.score}` : '', theme ? `Theme: ${theme}` : '', s.notes || '', isMatch ? 'Girls varsity volleyball' : 'Not counted in season records',
      game ? `Box score: ${SITE}/#game?id=${game.id}` : `Schedule: ${SITE}/#schedule`].filter(Boolean).join('\n');
    lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`);
    if (w.allDay) {
      const [y, m, d] = [w.day.slice(0, 4), w.day.slice(4, 6), w.day.slice(6, 8)];
      const next = new Date(Date.UTC(+y, +m - 1, +d + 1));
      lines.push(`DTSTART;VALUE=DATE:${w.day}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`);
    } else {
      lines.push(`DTSTART;TZID=America/New_York:${w.start}`, `DTEND;TZID=America/New_York:${w.day}T${pad(Math.min(w.endHour, 23))}${w.min}00`);
    }
    lines.push(`SUMMARY:${esc(prefix + title + result + (theme ? ` · ${theme}` : ''))}`);
    if (s.location) lines.push(`LOCATION:${esc(s.location)}`);
    lines.push(`DESCRIPTION:${esc(desc)}`, `URL:${game ? `${SITE}/#game?id=${game.id}` : `${SITE}/#schedule`}`);
    if (/cancel/i.test(s.status || '')) lines.push('STATUS:CANCELLED'); else if (/postpone/i.test(s.status || '')) lines.push('STATUS:TENTATIVE'); else lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
    events[uid.replace('@auksvb.com', '')] = lines.slice(start);
  }
  if (single) return {head: lines.slice(0, lines.indexOf('END:VTIMEZONE') + 1), events};
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'dist/data.json'), 'utf8'));
  const themesFile = path.join(root, 'dist/themes.json');
  const themes = fs.existsSync(themesFile) ? Object.fromEntries(JSON.parse(fs.readFileSync(themesFile, 'utf8')).map(t => [`${t.date}|${t.opponent}`, t.theme])) : {};
  const ics = buildCalendar(data, themes);
  fs.writeFileSync(path.join(root, 'dist/schedule.ics'), ics);
  // One file per event for the site's "Add to calendar" buttons
  const {head, events} = buildCalendar(data, themes, true), dir = path.join(root, 'dist/cal');
  fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir);
  for (const [key, ev] of Object.entries(events)) fs.writeFileSync(path.join(dir, key + '.ics'), [...head.filter(l => !/^(X-WR-|X-PUBLISHED|REFRESH)/.test(l)), ...ev, 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n');
  console.log(`cal/: ${Object.keys(events).length} single-event files`);
  console.log(`schedule.ics: ${(ics.match(/BEGIN:VEVENT/g) || []).length} events`);
}
