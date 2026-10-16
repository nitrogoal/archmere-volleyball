> **Superseded October 16, 2026.** Updates now run in GitHub Actions (`update-from-source.yml`) and the site is hosted on GitHub Pages; see README.md. The OpenAI Sites automation is disabled and must stay off so two updaters never compete. This file is kept for history.

# Archmere varsity results updates

This site is a static archive. Update the snapshot in the existing source repository and publish only when verified results change. Never create another site or change sharing/DNS. Read the Sites skill and use its source helper to open the latest linked repository. Everything needed is in this repository; do not depend on the original Windows checkout, Downloads, or sibling archive files. Do not run prepare.py: it is a historical rebuild tool, not the live updater.

## Source and scope

Official varsity schedule: https://www.aukssports.com/page9857. Read the selected season and follow its actual **View Results** links, including playoffs. Exclude JV, freshman, scrimmages and practice. The current roster snapshot is 2026. If the schedule advances to a new season, report that a verified roster rollover is needed rather than guessing identities.

Cloud web access was exercised on October 16, 2026: schedule then click View Results for game404441 and game404446. Direct requests may fail; the web tool's schedule-to-result link navigation worked and returned both the named player table and score-only result. Use the cloud web tool, not a browser session on the user's computer. If a page fails, retry its actual schedule link once, then leave existing data intact and report the source failure. Never use stale search snippets as a completed result.

Each run checks all result links in the current season, prioritizing new IDs and games in the last 30 days or without player stats. Revisit score-only games because player tables may arrive later. Read complete Archmere player tables, including column headings, using Kills, Aces, Blocks, Digs, Assists. Blank is null; explicit zero is 0. Do not include opponent rows. Names must match existing players exactly; resolve a source spelling only when current roster evidence confirms it. No speculative merges or graduation changes.

Ambiguous written summaries, missing columns, unknown names, changed reviewed entries or lost previously known values require review. Preserve existing numeric data; add an actionable issue with source text to dist/data.json issues if new and not already resolved. Do not invent a correction. Preserve corrections.json and resolvedIssues, the user's Patreece Spence class of 2011, and the excluded Smyrna assists. Historical totals must not be rebuilt from original uncorrected data.

## Safe importer

Prepare an untracked temporary candidate JSON with `games` array. Each entry has `complete: true`, `game` (matching the existing game schema), and `stats: [{name,values:[kills,aces,blocks,digs,assists]}]`. The game URL must be `https://www.aukssports.com/game<ID>`. Include season, id, date M/D/YY, opponent, homeAway H/A/N, phase Regular/Postseason, result W/L, score, url, notes, sets, setsFor and setsAgainst as supported by the source. For existing games preserve metadata not updated by verified evidence; do not fabricate set scores. A score-only result has an empty stats array. `complete` means the entire result was read, not that every statistic was published.

Run `node scripts/update-results.mjs <candidate.json>` to dry-run, then `node scripts/test-update-results.mjs`. Apply with `node scripts/update-results.mjs <candidate.json> --apply` only after inspecting changes. The importer updates an existing game/player key rather than appending duplicates, preserves historical data, checks all reviewed rows, and recalculates every career total. The UI computes season totals and all leaderboards from the same data. Run `node scripts/update-results.mjs --validate` and `node --check dist/app.js` after application. Confirm the delta equals exactly the new/changed player rows. Re-run the same candidate: changed must be false. Preserve unrelated local/source changes and investigate conflicts rather than overwriting.

## Publication and readback

Use the native Sites source credential, source helper, save and deploy tools for this linked public Site. Obtain fresh short-lived credentials through the supported tool; never persist them. Package dist as configured in .openai/hosting.json, save its exact pushed commit and archive, and deploy that saved version. No deployment for unchanged data. Confirm successful deployment and inspect one changed game/player route using the cloud web tool when available; report any readback limitation separately. Store a concise machine-readable import audit with game IDs and numeric deltas in source. The source repository retains rollback history. Keep a failed validation or incomplete publication out of production.

The custom address is https://auksvb.com; the existing chatgpt.site address remains valid. Runs should stay quiet on no change and notify only for published results, new review items, or an access/validation/publication failure. A saved schedule alone does not prove its first unattended run succeeded.
