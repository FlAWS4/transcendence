# Before targeted button colors and visitor access — 13 October 2026

Open the preserved [Explorer](baseline/content-preview.html#explore), [Projects](baseline/content-preview.html#projects), or [main entrance](baseline/index.html).

This archive preserves the active **`scope-rollback-141`** state before the targeted request to adjust the connection/world-reset colors and replace “Explorer en visiteur” with “Visiter” using the connection button’s dimensions. The controller number identifies a cache iteration, not a published project version. This state follows the explicit rollback; it retains the requested removal of Explorer’s visible zoom buttons and explicit demonstration qualifiers.

All **137 runtime sources** were captured from the current active files before edits began. No 139/140 runtime or earlier archive bytes were reused. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and the eleven dependency-path or isolated-storage adaptations; their exact source bytes remain in `originals/`. The entrance and account tests are preserved separately in [test-source-manifest.json](test-source-manifest.json), without claiming a test execution during archive preparation.

The physical `baseline/` contains the local dependencies: fonts, symbol, media, libraries, worker, geography, entrance/decryption modules and datasets. The reader does not rely on mutable files outside this archive. Detailed campus maps still require the existing remote provider. Browser storage uses the distinct prefix `horizon-archive-pre-targeted-button-colors-20261013-`, keeping the active prototype’s preferences and favorites separate.

[Technical verification](snapshot-verification.json): 137 snapshot hashes and two test originals match; 64 JavaScript syntax checks pass; 197 local references resolve. No browser replay is claimed by this preparation.

Verify the archive with:

```sh
python3 archives/site-versions/pre-targeted-button-colors-20261013/snapshot.py --verify
```

The script refuses to overwrite existing snapshots. With this manifest present, `--output` to a new directory reproduces the preserved historical bytes rather than reading changed active sources. The [rejected 140 pass](../pre-explicit-scope-rollback-20261013/README.md) and all earlier archives remain separate and available.
