# Archmere Volleyball (auksvb.com): agent entry instructions

**First read [SESSION-HANDOFF](docs/handoff/SESSION-HANDOFF.md).** It holds the live state: what's live, what's in flight, the edit lock and what's waiting on the user. TJ runs Claude in more than one session and account, so **update that file before you stop**, and whenever something ships or a decision is made. Then read [REFERENCE](docs/handoff/REFERENCE.md) for how the site, updater, deploys and tooling work.

## Never

- Run `prepare.py`, reset or force-push the checkout, or rebuild history from the original archive. It would wipe reviewed corrections.
- Undo reviewed data:
  - Patreece Spence is **class of 2012** (TJ approved 2026-10-17).
  - The two unverified Lillian Guzevich Smyrna assists stay excluded.
  - Blank stats stay `null`, and zero stays `0`.
- Commit locally synced `dist/data.json` changes. The scheduled updater owns game data on `main`.
- Turn back on the old OpenAI Sites updater (`CLOUD_UPDATES.md` is history only), or touch DNS, domain or account security.
- Enter passwords, buy anything, or download without asking. TJ signs in themselves.

## Always

- Bigger changes go to the preview site first, and ship only on TJ's OK. See REFERENCE → Preview and ship.
- Small fixes TJ asks for directly can go straight to `main`. After pushing, watch the deploy and check the live file.
- Commit only your own files. Other sessions may share this checkout, so run `git status` first and never sweep up someone else's uncommitted work.
- Write each decision TJ makes into SESSION-HANDOFF → Decisions in the same turn: TJ's own words, the date, and exactly what it covers. Old approvals don't carry over to new work; ask again.
- Never stop processes, servers or tabs you didn't start.
- QA at 320, 390 and 1280px. Design taste is in REFERENCE → Design.
- Shell setup (Windows Git Bash):
  ```bash
  export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
  GH="$LOCALAPPDATA/Microsoft/WinGet/Packages/GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe/bin/gh.exe"
  ```
