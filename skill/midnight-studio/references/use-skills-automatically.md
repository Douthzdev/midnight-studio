---
name: use-skills-automatically
description: "Invoke installed skills (HyperFrames, Remotion, etc.) on my own whenever a prompt needs them — user shouldn't have to name them"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 71e0a4a4-7b6e-4e5f-8e76-56c0ff0d3d16
  modified: 2026-10-27T22:20:04.544Z
---

The user said on 2026-10-27, after installing the Remotion skills: "Sempre utilize as skills de forma automatica, caso forem necessarias no prompt!" (always use the skills automatically whenever the prompt needs them).

**Why:** the user doesn't want to type `/skill` each time; the installed skills exist so they get used.

**How to apply:** before starting a task, check the available-skills list and call the matching skill without being asked. For video edits that means hyperframes and its sub-skills (see [[auraly-video-edit-playbook]]). Remotion skills (remotion-best-practices router, remotion-captions, remotion-render, …) are installed globally too. For Auraly edits, HyperFrames stays the default pipeline; use Remotion only when the task is Remotion-specific or the user asks for it.
