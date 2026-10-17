# Picking up in a new session or account: paste this

Open Claude Code in `C:\Users\TJ\Documents\ChatGPT\weapon models\sites\archmere-volleyball` and paste the block below as the first message. The same paste works on any account, and for coming back to this one.

---

You're picking up the Archmere Volleyball website (auksvb.com) from another Claude session. It may have run out of usage mid-task without updating anything.

1. **Read first, in order:** `CLAUDE.md`, `docs/handoff/SESSION-HANDOFF.md`, then `docs/handoff/REFERENCE.md`.
2. **Take the edit lock:** set the "Holder" line in SESSION-HANDOFF to your session and time, then commit.
3. **Check reality against the handoff:**
   - `git fetch`, then `git log --oneline -8 origin/main` and `origin/next`;
   - `git status` and `git worktree list`, for uncommitted or unmerged work from the last session;
   - open GitHub issues (`needs-review`, `updater-failing`) and the last few Actions runs;
   - new files in `design/logo-redraws/` or anything else in "Waiting on TJ".
4. **Give me a short status:** what's live, what's half-done, what's waiting on me. Then carry on with "In flight".

**Rules that matter:**
- Never run `prepare.py`, and never undo reviewed data corrections.
- Never commit local `dist/data.json` edits; the updater owns them.
- Bigger changes go to the preview site first, and ship only on my OK.
- Commit only your own files.
- Keep SESSION-HANDOFF current and committed after every ship or decision, and set the lock back to "none" before you stop.

---

## Notes for TJ (not part of the paste)

- **Quick wind-down:** before a session runs out, tell it "wrap up and update the handoff". It should update SESSION-HANDOFF, commit, and release the lock.
- **Old copies:** `ARCHMERE_CLAUDE_CODE_HANDOFF.md` from the original move is superseded by these files.
