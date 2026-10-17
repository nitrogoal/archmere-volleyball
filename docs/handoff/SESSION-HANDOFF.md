# Session handoff: read this first (live state)

**Last updated:** 2026-10-17 10:45 ET, by the "Archmere Volleyball" main session. **Last verified live:** `main` at `b73e3bc` (site code `ff13982`), deploy succeeded, live files match.

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

## Live on auksvb.com (verified 2026-10-17 10:20 ET)

- **Player pages:** Honors and star chips from `dist/awards.json` (78 sourced honors, 38 players), plus player share cards.
- **Share graphics:** game-day, final-score and player cards on the code-drawn poster-wall backdrop.
- **Schedule:** theme-night and Senior Night stickers, NFHS live and replay links, YouTube replays (`dist/videos.json`), calendar subscribe.
- **Opponent logos:** 33 Astra redraws plus Smyrna's original mark, on 256px white tiles.
- **Rest of the site:** championship banners, team store link (it hides itself after `TEAM_STORE.closes` = 11/4/26), footer with the exact update and next-check times.

## In flight

| What | Owner session | Branch @ head | State (time) | Next |
|---|---|---|---|---|
| none | | | | |

`next` @ `2408891` is fully merged into main. For the next preview, run `git checkout next && git merge main` first. The awards session left a `next` worktree in its scratchpad (see `git worktree list`). Remove it with `git worktree remove <path>` if it's in the way.

## Waiting on TJ (as of 2026-10-17 10:45 ET)

- **Analytics:** GoatCounter was recommended (free, no cookies). TJ needs to create an account and send the site code. Set nothing up before that.
- **Smyrna logo:** Astra's redraw was rejected, so the original mark is still used. Optional retry.
- **Optional logo touch-ups:** Caravel came out redder than its maroon, and Padua lost its black square.
- **Team store:** auto-hides after 11/4/26. If TJ sends a new link or date, update `TEAM_STORE` in `dist/app.js`.

## Decisions (TJ's words, date, exact scope)

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
- Outputs land inside this project, or in `%TEMP%\auksvb-*` for scratch work. Don't go looking for project files elsewhere.

## Recent (move older lines to LOG.md)

- 2026-10-17 10:45: Handoff system added and updated with Afterlight's lessons (`b73e3bc` and later).
- 2026-10-17 10:20: Shipped `next` → main (`ff13982`).
- 2026-10-17 09:10: Astra logo redraws live (`9b29768`). Preview Pages switched off.
