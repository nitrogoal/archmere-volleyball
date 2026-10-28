# Session handoff: read this first (live state)

**Last updated:** 2026-10-28 04:55 ET, by the "Archmere Volleyball pickup" session. **Last verified live:** `main` at `8625026`, deploy succeeded, live `data.json` and `index.html` match.

Keep this file **short and current**: one to two screens. It's a dashboard, not a diary. When something closes, delete it here and add one line to [LOG.md](LOG.md). How-to lives in [REFERENCE.md](REFERENCE.md). Detailed notes for one task go in `docs/handoff/RESUME-<task>.md`, linked from "In flight".

**Every status line carries a date and time.** Treat any line older than about 6 hours as **unverified** until you've re-checked it against git, GitHub and the files.

## How TJ uses this

TJ opens whichever Claude session or account has usage left, in this folder, and pastes [PICKUP-PROMPT.md](PICKUP-PROMPT.md) or says "pick up where we left off". The new session:

1. **Reads this file**, then takes the edit lock if it will edit.
2. **Verifies before trusting.** Sessions die or finish silently, so check:
   - `git fetch`, then `git log --oneline -5 origin/main` and `origin/next`;
   - `git status` and `git worktree list`, for another session's uncommitted or unmerged work;
   - `"$GH" issue list -R nitrogoal/archmere-volleyball` and `"$GH" run list -R nitrogoal/archmere-volleyball -L 3`;
   - "Waiting on TJ" below. TJ may already have answered in a chat this file never heard about, so ask rather than assume.
3. **Carries on** with "In flight", then "Waiting on TJ".

**Record every decision TJ makes, the same turn TJ makes it,** in "Decisions" below, in TJ's own words, with the date and exactly what it covers. Decisions that live only in chat are the main thing handoffs lose. **Update and commit this file after every ship and before you stop**, because usage can run out at any moment.

## Edit lock

One session edits this checkout at a time. Others may read, research, or work in their own git worktree on their own branch. Only the lock holder merges or pushes to `main`.

**Holder:** none. *(Format: `Holder: <session title>, taken <YYYY-MM-DD HH:MM ET>`. Commit it when you take it, and set it back to `none` when you stop.)*

**Stale lock:** if the holder's line is more than 6 hours old, its session shows idle or ended in the app, and `git status` shows no fresh edits from it, take the lock and note "force-took lock from X" in LOG.md.

**Shared things:**
- Never stop processes, servers or browser tabs you didn't start, such as another session's local dev server on port 8765. Use a different port instead.
- Only the lock holder turns the preview site's Pages on or off.

## Live on auksvb.com (verified 2026-10-17 07:55 ET)

- **Player pages:** Honors and star chips from `dist/awards.json` (78 sourced honors, 38 players), plus player share cards.
- **Share graphics:** game-day, final-score and player cards on the code-drawn poster-wall backdrop.
- **Schedule:** theme-night and Senior Night stickers, NFHS live and replay links, YouTube replays (`dist/videos.json`), calendar subscribe.
- **Opponent logos:** 33 Astra redraws plus Smyrna's original mark, on 256px white tiles.
- **Rest of the site:** championship banners, team store link (it hides itself after `TEAM_STORE.closes` = 11/4/26), footer with the exact update and next-check times.

## In flight

| What | Owner session | Branch @ head | State (time) | Next |
|---|---|---|---|---|
| Newark Charter 10/27 stats (issue #6) | updater | `main` | Score only, L 2-3 (2026-10-28 04:50) | The result page has only Newark's table. Updater rechecks; close #6 when Archmere stats land or the school clearly won't post them. |

`next` @ `2408891` is fully merged into main (`48ad11a`) and pushed. For the next preview, run `git checkout next && git merge main` first. The awards session left a `next` worktree in its scratchpad (see `git worktree list`). Remove it with `git worktree remove <path>` if it's in the way.

## Waiting on TJ (as of 2026-10-17 10:45 ET)

- **Analytics:** GoatCounter was recommended (free, no cookies). TJ needs to create an account and send the site code. Set nothing up before that.
- **Smyrna logo:** Astra's redraw was rejected, so the original mark is still used. Optional retry.
- **Optional logo touch-ups:** Caravel came out redder than its maroon, and Padua lost its black square.
- **Team store:** auto-hides after 11/4/26. If TJ sends a new link or date, update `TEAM_STORE` in `dist/app.js`.

## Decisions (TJ's words, date, exact scope)

- 2026-10-28 04:46: "Add the 10/27 Newark Charter result as score only (L 2-3, set scores), keep issue #6 open, and let the updater pick up Archmere's stats if the school posts them." Covers game 404222 only: result, score and set scores, no player stats.
- 2026-10-17 20:05: "close the stale Caravel review issue with a note that the game was imported at 12:56pm". Covers issue #1 (game 404446) only.
- 2026-10-17 07:48: "push everything that is ready". Covers the 3 unshipped `next` commits (`592573e`, `a3f39b0`, `2408891`: stickers, inline stickers, worn logos and tags), which were on the preview but missed the 05:33 ship. Not standing approval for later work.
- 2026-10-17: "keep these around for design use", about `design/archmere-player-cutouts-2026-batch01.zip` (player cutouts batch 01). Keep it locally for design work. This is not approval to publish any cutout on the site, and photographer permission is still unrecorded.
- 2026-10-17: Patreece Spence is **class of 2012**. TJ chose "2012 (Recommended)" when asked "Ship Patreece Spence as class of 2012, or keep 2011?" This applies to her graduation year only.
- 2026-10-17: "ship everything we have finished". This covered `next` as of `2408891`. It is not standing approval for future preview work.
- 2026-10-16: "Leave the preview repo there; it might be useful for future previews." Keep `nitrogoal/archmere-volleyball-preview`, with Pages off between uses.
- 2026-10-16: Bigger changes get a preview before going live. TJ asked for "a preview to test before pushing to live".
- 2026-10-16: "for milestones, only do 250,500,750,1000".
- 2026-10-16: "keep the old green button highlight for results, black for player page".
- 2026-10-16: "just make it team store in both places". The nav label is "Team store".
- 2026-10-16: Hosting is GitHub Pages at auksvb.com from the public repo, with branch protection. The old OpenAI Sites copy is kept as a fallback, and its updater stays off.

## Spend

No paid services are used. Astra and other generators run on TJ's own account, and TJ starts them; sessions only write prompts. Don't buy or subscribe to anything without TJ's explicit OK.

## Local-only material (never committed)

- `design/` (except `*.md`): the Astra logo kit (`logo-refs/`, `logo-redraws/` with its zip), `poster-wall-reference.jpg` and `preview.html`.
- `dist/brand/*` except `*.webp`: draft and source art and reference photos.
- `design/player-cutouts-2026/` and its snapshot `design/archmere-player-cutouts-2026-batch01.zip` (identical as of 2026-10-17 06:20 ET): 2026 player cutout drafts, source photos and a gallery (`index.html`). Kept for design use; see Decisions.
- Outputs land inside this project, or in `%TEMP%\auksvb-*` for scratch work. Don't go looking for project files elsewhere.

## Recent (move older lines to LOG.md)

- 2026-10-28 04:50: Added Newark Charter 10/27 as score only (`8625026`, via `update-results.mjs`); issue #6 left open. Updater 403 blips from aukssports.com opened and auto-closed #3, #4 and #5 between 10/19 and 10/27.
- 2026-10-17 20:05: Closed needs-review #1 (Caravel 10/15, imported by the updater in `1ddb67a`). A one-off HTTP 403 from aukssports.com at 19:26 ET opened "Updater failing" #2, which closed itself at 19:47.
- 2026-10-17 07:50: Shipped the 3 `next` commits the earlier ship missed (stickers, inline stickers, worn logos and tags) as `48ad11a`. They had never been pushed, so `ff13982` merged `next` only at `5975066`. Lesson: push `next` and check `git log origin/main..next` is empty before marking a ship done. Note: earlier timestamps in this file (10:45, 10:20, 09:10) were mislabeled; the real ET times were about 5 hours earlier.
- 2026-10-17 10:45: Handoff system added and updated with Afterlight's lessons (`b73e3bc` and later).
- 2026-10-17 10:20: Shipped `next` → main (`ff13982`).
- 2026-10-17 09:10: Astra logo redraws live (`9b29768`). Preview Pages switched off.

## Local player-photo collection — 2026-10-17, Codex

User decisions: "players can have as many as possible" and "group cutouts are good too". Collection is local-only at design/player-cutouts-2026/index.html with roster.csv and collection.json. Official school 2026/2027 varsity roster verified at https://www.aukssports.com/page9861 (14 players). Saved all 14 originals from @shotbyliamo carousel DdVG-0eFGb9 and 14 transparent drafts (13 individual + one huddle). Seven roster members matched using jersey numbers; five individual draft identities pending. Multiple assets per player are supported. Generative extraction changed fine detail, so all cutouts remain drafts requiring fidelity/edge review; no claim of exact original pixels. Alpha verified for every PNG. Photographer website-use permission not recorded; nothing published. Continue searching additional game posts and confirm obscured jersey identities from captions/tags or TJ, never facial matching. Gallery browser opening was blocked for file: URLs; give the local file link rather than circumventing the restriction. No website code changed.
