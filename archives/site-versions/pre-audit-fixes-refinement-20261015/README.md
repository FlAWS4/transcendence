# Before the refinement of the audit fixes — 15 October 2026

Open the preserved [main entrance](baseline/index.html), [Explorer](baseline/content-preview.html#explore), or [a project's comments](baseline/content-preview.html#projects/minishell-under-the-prompt?tab=comments).

This archive preserves the intermediate **`audit-fixes-145`** state: the first version of the five corrections requested on 15 October ("Corrige ce qui est faux"), after the read-only audit of the 13 October Codex requests. The previous state 144 is preserved in [pre-codex-audit-fixes-20261015](../pre-codex-audit-fixes-20261015/README.md).

An adversarial browser verification of this state confirmed the five corrections and found residual cases of two of them, refined in the active state 146:

- the arrival labels still stopped rotating after Escape, NumLock, ScrollLock, PrintScreen or F11 pressed while a pointer had focused an arrival control (145 ignored modifier keys only), and a focus moved without any key or pointer, as by assistive technology, no longer paused them;
- when the comment sort button itself sat under the back-to-top button or the search capsule, the panel opened upward but its bottom still passed under those controls.

The preserved cache references are controller **145** (`welcome.mjs?v=audit-fixes-145`), content preview **112**, entrance module **audit-fixes-14**, entrance CSS **audit-fixes-24**, comments **16** (CSS 9), project UI **40** and journal UI **39**. These numbers identify cache iterations, not project releases.

All **137 runtime sources** were captured from the active files before the refinement. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and the eleven adaptations limited to dependency paths or isolated storage; their exact source bytes remain in `originals/`. [test-source-manifest.json](test-source-manifest.json) preserves the two test files changed by the refinement (`entrance.test.mjs`, `tests/comments-actions.test.mjs`). The physical `baseline/` uses the storage prefix `horizon-archive-pre-audit-fixes-refinement-20261015-`. Detailed campus street maps still require the existing remote provider.

Verify the preserved bytes with:

```sh
python3 archives/site-versions/pre-audit-fixes-refinement-20261015/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. Evidence of the verification of this state: `checks/20261015-audit-fixes/` (arrivee, tri-commentaires, contraste, perimetre); comparisons with the active state 146: `checks/20261015-audit-fixes/146/`.
