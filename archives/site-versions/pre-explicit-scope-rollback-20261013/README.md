# Rejected broader action/copy pass, before explicit rollback — 13 October 2026

Open the preserved [Explorer](baseline/content-preview.html#explore), [Projects](baseline/content-preview.html#projects), or [main entrance](baseline/index.html).

This archive preserves the complete **`action-palette-140`** state immediately before the user requested an explicit rollback of the latest broader pass. The requested active result keeps the removal of Explorer’s visible zoom-in/out buttons and explicit demonstration qualifiers across profiles, actions, captions and other interface wording, including result counts. This archive retains the broader color/copy changes for the design history; it does not mark them as accepted.

All **137 runtime sources** were captured from the then-current active files before the rollback, with no 139 bytes or earlier archive manifest reused. [snapshot-manifest.json](snapshot-manifest.json) records source/runtime hashes and the eleven necessary dependency-path/storage adaptations; their exact originals remain under `originals/`. The four modified test sources are preserved separately in [test-source-manifest.json](test-source-manifest.json): entrance, content report, demo content and map-independent filtering. They were not executed during this archive preparation.

The physical `baseline/` includes its fonts, symbol, media, libraries, worker, geography and other local runtime dependencies. It does not depend on mutable files elsewhere in the repository. Detailed campus street maps still use the existing remote provider. Storage is isolated with `horizon-archive-pre-explicit-scope-rollback-20261013-`, preserving the active prototype’s preferences and favorites.

[Technical verification](snapshot-verification.json): all 137 snapshot hashes and four test originals match; 64 JavaScript syntax checks pass; 197 local references resolve. No browser replay is claimed.

Verify the archive with:

```sh
python3 archives/site-versions/pre-explicit-scope-rollback-20261013/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. Once this archive exists, `--output` with a new directory reproduces its preserved historical bytes rather than reading changed active sources. The earlier [139 archive](../pre-action-palette-and-no-zoom-20261013/README.md) and [138 archive](../pre-top-world-control-20261013/README.md) remain separate and available.
