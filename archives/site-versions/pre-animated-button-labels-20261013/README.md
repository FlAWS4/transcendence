# Before animated button labels only — 13 October 2026

Open the preserved [main entrance](baseline/index.html), [Explorer](baseline/content-preview.html#explore), or [Projects](baseline/content-preview.html#projects).

This archive preserves the active **`cycling-entrance-143`** state before the user clarified that automatic language changes must affect only the two button labels, with an animated transition and a stable layout in Arabic. The preserved implementation still changes the global language while cycling. It also contains the background theme control, arrival-only account hiding, pink secondary actions in dark mode, recentered geographic filter and icon-only world reset.

The preserved cache references are controller **143**, content preview **110**, entrance module **cycling-12**, entrance CSS **dark-actions-22**, and globe framing **recentered-15**. These numbers identify cache iterations, not project releases.

All **137 runtime sources** were captured from the current active files before the correction. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and eleven adaptations limited to dependency paths or isolated storage. Their exact source bytes remain in `originals/`; [test-source-manifest.json](test-source-manifest.json) preserves the current entrance and account tests separately. No earlier archive bytes were reused, and no test execution is claimed by this preparation.

The physical `baseline/` includes all local runtime dependencies and uses the unique storage prefix `horizon-archive-pre-animated-button-labels-20261013-`. It does not depend on mutable files elsewhere in the repository or affect the active prototype’s settings/favorites. Detailed campus street maps still require the existing remote provider.

[Technical verification](snapshot-verification.json): 137 snapshot hashes and two test originals match; 64 JavaScript syntax checks pass; 197 local references resolve; all eight expected cache references are present. No browser replay is claimed.

Verify the preserved bytes with:

```sh
python3 archives/site-versions/pre-animated-button-labels-20261013/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. With this manifest present, `--output` to a new directory reproduces this archive’s historical bytes. The [previous 142 state](../pre-cycling-entrance-20261013/README.md) and all earlier archives remain available.
