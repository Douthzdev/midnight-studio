---
name: video-cleanup-after-render
description: "After finishing a video edit, delete previews/tests/intermediates and keep only the final MP4 (plus a light editable project)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 71e0a4a4-7b6e-4e5f-8e76-56c0ff0d3d16
  modified: 2026-10-27T22:15:25.939Z
---

After a video is concluded, always delete previews, test renders, snapshots, transcripts, work copies and intermediate media; leave the final MP4. User chose to keep the light editable HyperFrames project (index.html, music, scripts — a few MB) but not heavy intermediates like base.mp4.

Do NOT stop for preview/render approval: always finish the whole job in one go — edit, render, loudnorm, export to the folder, clean up — then send the user a direct access to the final video (SendUserFile + clickable path; send a <30 MB light copy for phone if the final is bigger, then delete that copy). Only flag script/copy conflicts in the final message.

Once a video is delivered, treat it as closed: never bring it up again, check its files, or mention previous videos (e.g. finals that were moved) unless the user asks about them (2026-10-27).

**Why:** User wants disks clean (C: is nearly full; work happens on M:).

**How to apply:** Render the final MP4 OUTSIDE the project's `renders/` folder (e.g. `M:\Google\hyperframes\<name>-final.mp4`) — HyperFrames appears to clean `renders/`, and a final MP4 there was lost once during cleanup. Verify the final MP4 exists before and after deleting anything. Keep tools/caches on M:\CLAUDE\tools, never C:. See [[hyperframes-setup-on-m-drive]].
