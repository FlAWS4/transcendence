# Before matching the menu's scroll hiding — 13 October 2026

[Open the standalone viewer](preview.html). It uses physical copies of module2 and stylesheet1 with a small reading/dock fixture. Serve the directory over HTTP and use a viewport no wider than840px. No active dependencies or storage are used.

The preceding implementation keeps the mobile shortcut visible while scrolling. It already includes the correct title focus, responsive focus preservation and clearance above the complete dock/search/discovery group. The user subsequently requested that it disappear during scrolling like the main menu.

`manifest.json` records the exact source hashes. `browser-proof.json` retains the preceding26 successful Chrome states, without attributing the later hiding behavior to that earlier verification. The active change reuses the dock's existing CSS state and has no independent scroll timer.

The first invalid nested-selector attempt and the intermediate stylesheet before matching the menu's immediate keyboard reveal are retained separately as `scroll-hide-first-attempt.css` and `scroll-hide-before-keyboard-sync.css`, with their browser reports. The viewer continues to load the actual pre-change sources.
