# Session handoff: read this first (live state)

**Last updated:** 2026-10-17 ~10:30 ET, by the "Archmere Volleyball" main session.

Keep this file **short and current**. It's a dashboard, not a diary. When something is done, delete it from here and add one line to [LOG.md](LOG.md). Stable how-to lives in [REFERENCE.md](REFERENCE.md). Target: under ~150 lines.

## How TJ uses this

TJ opens whichever Claude session or account has usage left, in this folder, and says something like "pick up where we left off". The new session then:

1. **Reads this file.** If it will edit, it takes the edit lock below by writing its name and time, then commits.
2. **Checks reality against this file.** Don't trust what this file says is running. Check:
   - `git fetch && git log --oneline -5 origin/main` and `origin/next`;
   - `git status` and `git worktree list`;
   - open GitHub issues (`"$GH" issue list -R nitrogoal/archmere-volleyball`);
   - the last updater run (`"$GH" run list -R nitrogoal/archmere-volleyball -L 3`).
3. **Carries on** with "In flight" or "Waiting on TJ".

A session can stop at any moment when usage runs out. **Update and commit this file after every ship, every decision TJ makes, and before you stop.** Don't leave state only in your head or in a scratchpad.

## Edit lock

One session edits this checkout at a time. Others may read, research, or work in their own git worktree on their own branch.

**Holder:** none. *(Write `Holder: <session name>, <date time>` and commit when you start editing. Set it back to `none` when you stop.)*

If the holder's session is clearly dead (it ran out of usage and is unchanged for hours), take the lock and note it in LOG.md.

## Live on auksvb.com now

`main` at `ff13982` (2026-10-17). Highlights:
- **Player pages:** Honors sections and star chips from `dist/awards.json` (78 sourced honors, 38 players), plus player share cards.
- **Share graphics:** game-day, final-score and player cards on the code-drawn poster-wall backdrop.
- **Schedule:** theme-night and Senior Night stickers, NFHS live and replay links, YouTube replays from `dist/videos.json`, calendar subscribe.
- **Opponent logos:** 33 clean Astra redraws plus Smyrna's original mark, all on 256px white tiles.
- **Rest of the site:** championship banners, team store link (it hides itself after `TEAM_STORE.closes` = 11/4/26), and a footer with the exact update time and the next check time.

## In flight

| What | Where | State | Next |
|---|---|---|---|
| none | | | |

The `next` branch (2408891) is fully merged into main. Reuse it for the next preview: `git checkout next && git merge main` first. The awards session left a `next` worktree in its scratchpad (`git worktree list`). Remove it with `git worktree remove <path>` if it's in the way.

## Waiting on TJ

- **Analytics:** GoatCounter was recommended (free, no cookies). TJ needs to create an account and send the site code. Don't set anything up before that.
- **Smyrna logo:** Astra's redraw was rejected, so the original mark is still used. Optional retry.
- **Optional logo touch-ups:** Caravel came out redder than its maroon, and Padua lost its black square.
- **Team store:** the link auto-hides after 11/4/26. If TJ sends a new store link or date, update `TEAM_STORE` in `dist/app.js`.

## Uncommitted local material (on purpose)

These are never published:
- `design/`: the Astra logo kit (`logo-refs/`, `logo-redraws/` with the zip, `logo-redraw-prompts.md`), `poster-wall-reference.jpg`, `preview.html`.
- `dist/brand/*` except `*.webp`: draft and source art and reference photos. It's ignored by `.gitignore` and stays local.

## Recent (move older lines to LOG.md)

- 2026-10-17: Shipped `next` → main (`ff13982`): honors, share graphics, poster wall, stickers, faster load, Spence → 2012.
- 2026-10-17: Astra logo redraws for 33 opponents live (`9b29768`). The preview site's Pages was switched off (repo kept).
- 2026-10-17: Handoff system added (this file, REFERENCE.md, LOG.md, CLAUDE.md).
