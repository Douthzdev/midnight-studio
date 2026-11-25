---
name: instagram-reels-ui-layout
description: "Where Instagram's Reels UI sits (like/comment/share rail, profile pic, caption, nav) — use to aim on-screen clicks/arrows/CTAs in future edits"
metadata:
  node_type: memory
  type: reference
  originSessionId: 3660d89e-f237-40e2-a11f-0ce1abe6076f
  modified: 2026-11-24T02:15:56.895Z
---

The user sent an iPhone screenshot of a Reel (2026-11-23) as the reference for **where to place tap/click animations and arrows** pointing at Instagram's own buttons. This is reference only and was not tied to a job. Use it whenever a CTA says "tap my profile picture", "send it", "comment", "save" and so on.

**Screen positions as % of phone screen height and width** (920×2000 screenshot):
- **Top tabs** "Reels | Amigos": y ≈ 10%, centred.
- **Right rail**, centre x ≈ 92%:
  | Item | y |
  |---|---|
  | Like (heart) | ≈ 46% |
  | Comment | ≈ 54% |
  | Repost | ≈ 62% |
  | Share (paper plane) | ≈ 71% |
  | ⋯ menu | ≈ 79% |
  | Audio thumbnail (square) | ≈ 85% |
- **Profile picture** (round, with story ring): x ≈ 9%, y ≈ 80.5%.
  - Username and Follow button sit to the right of it.
  - The caption line is just below, at y ≈ 85%.
- **Progress bar** at y ≈ 88.5%.
- **Bottom nav pill** covers y ≈ 90–97%, so it is a dead zone.

**Mapped into our 1080×1920 frame** (approximate). This assumes the video fills the tall screen and the sides are cropped by about 100 px each, so check it with a snapshot:

| Target | x | y |
|---|---|---|
| Heart | ~915 | ~890 |
| Comment | ~915 | ~1045 |
| Repost | ~915 | ~1200 |
| Share | ~915 | ~1370 |
| Profile picture | ~180 | ~1550 |
| Bottom nav begins | — | ~1740 |

**How to apply:**
- Arrows and tap ripples for "tap my profile picture" should point to the **bottom-left** (around x 180, y 1550), not to the top or the centre.
- Arrows for "send / share" go to the right rail at y ≈ 71% of screen height. Arrows for "comment" go to y ≈ 54%.
- Keep captions and key text out of the right rail column (x > ~880) and out of the bottom ~20%.
- The reference's own headline sat at y ≈ 18%, clear of the top tabs.
- Related: [[kinetic-iconmap-format]] (MD 20 ended with "TAP MY PROFILE PICTURE ↑"; the arrow should have pointed down-left) and [[minimal-headline-format]].
