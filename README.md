# Archmere Volleyball

Buildless mobile-first static website. Serve `dist/` with a static HTTP server.

Data is a reviewed snapshot, not an automatic Google Sheets feed. `players.json` was read from the native Google Sheet on October 16, 2026 and includes Patreece Spence's graduation year (corrected to 2011 on October 16, then to 2012 on October 17, 2026). `prepare.py` prepares source data and verifies every career subtotal. It needs the sibling `archmere_record_book/normalized.json` archive in the original workspace; the deployed `dist/data.json` is self-contained.

The two unverified Lillian Guzevich Smyrna assists remain excluded. Blank statistics remain null; zero is retained. Player source-row counts are not games played.

All routes use URL fragments so player/game/filter links can be shared without server rewrites. Website data is read-only. Update `dist/data.json`, validate totals and republish to change the public records.

Branding: standalone Auks logo supplied by Archmere's BSN Sports school store: https://cache.bsnsports.com/comp/sls/get/43/3488?f=jpg&sid=3488&ts=1638206562. Displayed in full without cropping.

Player-page update: game logs now show verified opponent logos from the MaxPreps Delaware school directory. Exact name mappings, asset URLs and source pages are retained in dist/opponents.json. Schools without a verified image use initials. Marks are current identity references, not historical-season certifications.

Logo coverage update: all 34 opponents now have school marks. Added official sports-site references and full-mark display windows for Padua, Ursuline, Delmarva Christian and Campus Community; replaced low-resolution thumbnails with original assets. Opponent logos appear in the shared game cards on Games, Home and season pages, as well as player logs. Exact per-school sources and display bounds are in dist/opponents.json.

## Hosting and automatic updates

The site is published from this repository to GitHub Pages at https://auksvb.com.

- `.github/workflows/update-from-source.yml` runs every 3 hours (hourly in the evening after matches). It runs `scripts/sync-source.mjs`, which reads the official schedule (https://www.aukssports.com/page9857) and each result page by column headings, reconciles `currentSchedule`, and imports results through the safe merge in `scripts/update-results.mjs`. Only verified changes are committed; the site is then republished.
- Anything it will not guess (unknown names, changed columns, score mismatches, a new school year) is listed in a **Results need review** issue. A failed run opens an **Updater failing** issue and leaves the last good data live; it closes itself after the next successful run.
- `.github/workflows/deploy-pages.yml` publishes `dist/` after the checks pass, on every push that changes the site or data.
- Tests: `node scripts/test-sync-source.mjs` (saved official pages in `scripts/fixtures/`) and `node scripts/test-update-results.mjs`.
- Run an update by hand: Actions → Update from official source → Run workflow, or locally `node scripts/sync-source.mjs` (dry run) then `--apply`.
- Each new school year needs the reviewed roster added to `dist/data.json` before results import; the updater opens a review issue when the official schedule switches years.
