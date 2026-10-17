# Reference: how auksvb.com works

This page covers how things work and doesn't change often. Live state (what's running and what's waiting) is in [SESSION-HANDOFF.md](SESSION-HANDOFF.md).

## The site

- A buildless vanilla-JS single-page app in `dist/`, with hash routes (`#schedule`, `#player?id=…`, `#game?id=…`, `#opponent?name=…`), so every link is shareable without server rewrites.
- `dist/app.js` holds the core:
  - globals `D` (data), `route`, `serial` (date → number), `fmt`, `cats` (Kills, Aces, Blocks, Digs, Assists), `pByName`, `opponentMark`, `crest`, `todayET`, `TEAM_STORE`;
  - the pages: home, schedule, roster, games, player, game, records, seasons and sources.
- `dist/features.js` loads after `app.js` and adds:
  - theme-night tags, calendar menus and `.ics`, live and replay links, milestones (250/500/750/1000 only);
  - head-to-head pages, quick search (`/`), footer "Updated" and "Next check" times;
  - Honors, the share graphics (canvas, 1080×1350) and the championship banners.
- **Styles:** `dist/theme.css` is the current design layer, loaded over the older `dist/style.css`. Put new rules in `theme.css`.

## Data files: who owns what

| File | Owner | Notes |
|---|---|---|
| `dist/data.json` | **The scheduled updater** | Games, stats, roster, current schedule. Never commit local edits to it on a branch; reviewed corrections go through `corrections.json` and `scripts/update-results.mjs`. |
| `players.json`, `corrections.json` | Reviewed by hand | Preserve the reviewed corrections (see CLAUDE.md "Never"). |
| `dist/awards.json` | Curated by hand | Every honor has a source URL; the updater never touches it. Keys are `players` (by exact name), `team` (state titles and finals) and `college`. |
| `dist/themes.json` | Curated by hand | Theme nights: `{date, opponent, theme}`. |
| `dist/videos.json` | Curated by hand | Verified replays only: check the broadcast's start and end time against the varsity start time, and exclude JV streams and spam listings. |
| `dist/opponents.json` + `dist/opponents/*.png` | Curated by hand | One 256px white-square PNG per school. See "Opponent logos". |
| `dist/schedule.ics`, `dist/cal/` | Built at publish time | Built by `scripts/build-ics.mjs` and gitignored. |

## Hosting, DNS, deploy

- **Hosting:** GitHub Pages from public repo `nitrogoal/archmere-volleyball` (owner account `nitrogoal`). Custom domain auksvb.com, HTTPS enforced. Branch protection blocks force-push and deletion, with no required reviews (the updater pushes to main).
- **DNS** (Squarespace): four A records, 185.199.108.153 through .111.153, plus CNAME `www` → `nitrogoal.github.io`. The old OpenAI TXT records were kept as a fallback, and the old site still exists at its chatgpt.site URL.
- **`deploy-pages.yml`** runs on any push to `main` touching `dist/**` or `scripts/**`. It runs the tests, then `update-results.mjs --validate`, then `build-ics.mjs`, then publishes.
- **After pushing:** wait for the run, then compare the live file against `git show HEAD:dist/<file>`. Compare with git, not the working copy: this Windows checkout uses CRLF, so working-copy text files never match byte for byte.

## The updater (`.github/workflows/update-from-source.yml`)

- **When it runs** (UTC): `7,27,47 20-23,0-5 * * *`, which is every 20 minutes from about 4pm to 2am Eastern, and `37 10-19 * * *`, hourly during the day. `CHECK_SLOTS` in `features.js` mirrors this for the footer "Next check" time, so change both together.
- **What it does:** runs `scripts/sync-source.mjs --apply`.
  - Reads the official schedule at https://www.aukssports.com/page9857 by table heading, then follows each View Results link.
  - Reconciles `currentSchedule`: curated notes are kept via `sourceComment`, and `nfhsEventUrl` is kept unless the date changes. It captures `streamUrl` and resolves the exact varsity NFHS event.
  - Rechecks score-only games for `RECHECK_DAYS = 3`.
  - Merges one game at a time through `update-results.mjs`.
- **Commits and issues:** it commits as `auksvb-updater`. Anything it won't guess goes to a **"Results need review"** issue (label `needs-review`). A failed run opens **"Updater failing"** (label `updater-failing`), which closes itself after the next good run.
- **Off-season:** a heartbeat commit after 45 quiet days keeps GitHub from pausing the schedule.
- **New school year:** the reviewed roster must be added to `data.json` before results import. The updater opens a review issue when the season switches.
- **Tests:** `node scripts/test-sync-source.mjs` (uses fixtures in `scripts/fixtures/`) and `node scripts/test-update-results.mjs`.
- **Run by hand:** `"$GH" workflow run update-from-source.yml -R nitrogoal/archmere-volleyball`, or locally `node scripts/sync-source.mjs` for a dry run.

## Preview and ship (TJ's process for bigger changes)

1. Work on branch `next`, after `git merge main`.
2. Build the preview: run `node scripts/build-ics.mjs`, copy `dist/` into the repo `nitrogoal/archmere-volleyball-preview`, add `<meta name="robots" content="noindex">`, a `robots.txt` that disallows everything, and `.nojekyll`, then push.
3. Turn the preview's Pages on:
   ```bash
   "$GH" api -X POST repos/nitrogoal/archmere-volleyball-preview/pages -f "source[branch]=main" -f "source[path]=/"
   ```
   The preview appears at https://nitrogoal.github.io/archmere-volleyball-preview/.
4. Ship only on TJ's OK:
   - Before merging, diff `next` against main for `dist/data.json` and `players.json`. Any data change there needs TJ's explicit approval.
   - Merge `next` into main, push, watch the deploy and verify live.
5. Afterwards, turn Pages off again with `"$GH" api -X DELETE repos/nitrogoal/archmere-volleyball-preview/pages`. Keep the repo.

## Opponent logos

- **Where they come from:** each school's own sports site, linked from the AuksSports schedule (opponent name → its ViewSchedule page → "Visit … sports website" → `img.sitelogo`). Those are wide banners; the crops of the school's emblem live in `design/logo-refs/`.
- **Redraws:** made in Astra with the prompt pack in `design/logo-redraw-prompts.md`. Astra saves into `design/logo-redraws/<slug>.png`.
- **Ingest:** run `tools/ingest-logo-redraws.cjs` (usage is in its header). It trims, fits each logo into 224px on a 256px white tile, and marks it `redrawn` in `opponents.json`.
- **Check before committing:** compare every redraw against its reference: colors, facing direction and spelling.
- Every tile is white with the logo at the same scale. Don't reintroduce sprites or mixed sizes.

## Design (TJ's taste)

- **Look:** match @archmerevolleyball's Instagram. Black and kelly green `#0f6b3a`, mint accents `#8fd4a4`, heavy Anton display type, Inter body text, Yellowtail script, halftone, giant ghosted words, and the poster-wall collage for share graphics.
- **Feel:** modern and clean, never tacky. TJ rejected cream or muted looks and outlined numbers. Numbers are Anton with a subtle mint fade; check gradient numerals for clipping.
- **Reuse:** use existing components first (for example the old W/L badges, which TJ liked).
- **Mobile-first:**
  - No wasted vertical space and no hidden sideways scrolling.
  - Phones get 4 tabs plus "More"; desktop keeps the full nav row.
  - The box-score stat highlight is green on Results and black on player pages.
- **QA:** check at 320, 390 and 1280px.

## Local dev and gotchas

- **Local server:** from the repo root, run `npx --yes http-server@14.1.1 . -p 8765 -a 127.0.0.1 -c-1 --silent`, then open `http://127.0.0.1:8765/dist/index.html#…`. `.claude/launch.json` has this config for the app's preview pane.
- **Browser cache:** this has made fixes look missing. Hard-reload, or add `?v=N`.
- **GitHub API:** "Updated" and "Source checked" in the footer come from the unauthenticated GitHub API (60 requests/hour), cached for 10 minutes in `sessionStorage`.
- **Image tools:** `sharp@0.33.5` installs only with `--ignore-scripts`. Keep image work in short paths like `%TEMP%\auksvb-…`, because Windows MAX_PATH breaks inside the long Claude scratchpad paths.
- **Line endings:** CRLF can break text anchors. Normalize with `sed -i 's/\r$//'` before scripted edits.
- **Instagram:** the in-app browser can't open it. Use `https://www.instagram.com/p/<id>/embed/captioned/` with curl to get the image and caption.
- **Sideline team store:** behind Cloudflare and needs a real browser. The BSN team store is private with an access code; TJ supplies its link.
