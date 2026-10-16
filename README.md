# Archmere Volleyball Record Book

Buildless mobile-first static website. Serve `dist/` with a static HTTP server.

Data is a reviewed snapshot, not an automatic Google Sheets feed. `players.json` was read from the native Google Sheet on October 16, 2026 and includes Patreece Spence's corrected 2011 graduation year. `prepare.py` prepares source data and verifies every career subtotal. It needs the sibling `archmere_record_book/normalized.json` archive in the original workspace; the deployed `dist/data.json` is self-contained.

The two unverified Lillian Guzevich Smyrna assists remain excluded. Blank statistics remain null; zero is retained. Player source-row counts are not games played.

All routes use URL fragments so player/game/filter links can be shared without server rewrites. Website data is read-only. Update `dist/data.json`, validate totals and republish to change the public records.

Branding: standalone Auks logo supplied by Archmere's BSN Sports school store: https://cache.bsnsports.com/comp/sls/get/43/3488?f=jpg&sid=3488&ts=1638206562. Displayed in full without cropping.

Player-page update: game logs now show verified opponent logos from the MaxPreps Delaware school directory. Exact name mappings, asset URLs and source pages are retained in dist/opponents.json. Schools without a verified image use initials. Marks are current identity references, not historical-season certifications.

Logo coverage update: all 34 opponents now have school marks. Added official sports-site references and full-mark display windows for Padua, Ursuline, Delmarva Christian and Campus Community; replaced low-resolution thumbnails with original assets. Opponent logos appear in the shared game cards on Games, Home and season pages, as well as player logs. Exact per-school sources and display bounds are in dist/opponents.json.
