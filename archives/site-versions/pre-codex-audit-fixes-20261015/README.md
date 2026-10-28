# Before the 15 October audit fixes — 15 October 2026

Open the preserved [main entrance](baseline/index.html), [Explorer](baseline/content-preview.html#explore), or [a project's comments](baseline/content-preview.html#projects/minishell-under-the-prompt?tab=comments).

This archive preserves the active **`animated-entry-144`** state, the last state produced by the 13 October Codex session and completed by the 14 October browser checks, before the corrections requested on 15 October ("Corrige ce qui est faux"). A read-only audit of the 13 October requests found five defects in this state:

- after Sign in → Cancel (mouse or touch), focus returns to Sign in and the two arrival labels stop changing language; a modifier or shortcut key on a focused arrival control has the same effect;
- the comment sort panel always opens downwards, so it is cut when its button is low on the screen, and on mobile the back-to-top button covers a corner of the open panel;
- in dark mode, the Royal Pink "Create an account" text on the account panel's glass reaches only about 3.7–3.9:1;
- on the arrival error screen (Visit, then the globe fails), the account is hidden and the background theme control is inactive, so neither theme nor language can be changed there;
- the older panels composition (`welcome-panels.html`), which imports the active entrance module, also cycles its labels since 144.

The preserved cache references are controller **144** (`welcome.mjs?v=animated-entry-144`), content preview **111**, entrance module **animated-labels-13**, entrance CSS **animated-labels-23**, comments **15** (CSS 9), project UI **39** and journal UI **38**. These numbers identify cache iterations, not project releases.

All **137 runtime sources** were captured from the active files before any correction. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and the eleven adaptations limited to dependency paths or isolated storage; their exact source bytes remain in `originals/`. [test-source-manifest.json](test-source-manifest.json) preserves the two test files changed by the correction (`entrance.test.mjs`, `tests/comments-actions.test.mjs`).

The physical `baseline/` includes all local runtime dependencies and uses the storage prefix `horizon-archive-pre-codex-audit-fixes-20261015-`, so it neither reads nor changes the active prototype's settings, favourites or comments. Detailed campus street maps still require the existing remote provider.

[Technical verification](snapshot-verification.json): 137 snapshot hashes, 11 adapted originals and 2 test originals match; 192 local references resolve inside the archive. The four main entry files answer HTTP 200 from the local server.

Verify the preserved bytes with:

```sh
python3 archives/site-versions/pre-codex-audit-fixes-20261015/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. The [previous 143 state](../pre-animated-button-labels-20261013/README.md) and all earlier archives remain available.
