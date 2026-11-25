---
name: midnight-studio-skill-repo
description: Midnight-Studio is a private git repo (github.com/Douthzdev/midnight-studio) + skill "midnight-studio"; sync it after every new format/feedback/tool change
metadata:
  type: project
---

On 2026-11-25 the user asked: put all our work on git, make a skill with the whole creative process, and **keep that skill repo updated whenever needed**.

- **Repo:** `M:\Google\hyperframes\Midnight-Studio`, private, pushed to `github.com/Douthzdev/midnight-studio` (branch main).
  - Code, configs, transcripts and notes only. Media is gitignored.
  - Local git identity: Vinicius / the email already set in M:\CLAUDE's git config.
- **Skill:** `skill/midnight-studio/SKILL.md`.
  - `~/.claude/skills/midnight-studio` is a junction to it.
  - `references/` holds copies of these memory notes.
- **Sync:** `bash skill/sync.sh "msg"` copies the memory notes into the skill, commits (with the Claude co-author line) and pushes.

**Why:** the user wants the process saved and versioned outside this machine's memory.

**How to apply:** after delivering a batch with a new format or tool change, or after the user gives feedback/approves a style:
1. Update the memory note.
2. Edit SKILL.md if the workflow itself changed.
3. Run sync.sh without asking.

Related: [[overlay-popups-format]].
