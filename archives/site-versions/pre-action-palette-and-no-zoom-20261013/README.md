# Before harmonized action colors and hidden zoom controls — 13 October 2026

Open the preserved [Explorer view](baseline/content-preview.html#explore), [Projects](baseline/content-preview.html#projects), or [main entrance](baseline/index.html) through the local project server.

This archive preserves the active **`top-world-control-139`** state: the world-reset button is already in the geographic medallion, the status text is below the filter, and the visible zoom buttons remain. It precedes the next request to harmonize the connection/reset colors and remove the zoom-in/zoom-out buttons. It is a distinct state from the earlier [pre-top-world-control archive](../pre-top-world-control-20261013/README.md); both remain available.

Seven priority sources were captured before the new changes: `index.html`, `content-preview.html`, `content-preview.mjs`, `welcome.mjs`, `entrance.css`, `dock-navigation.css` and `tests/map-independent-filter.test.mjs`. Their exact bytes are retained under `originals/` and recorded in [primary-source-manifest.json](primary-source-manifest.json). The test is preserved for historical review, outside the runtime; it is not claimed as executed by this preparation.

The [snapshot manifest](snapshot-manifest.json) records **137 runtime source files**, captured from the current 139 state with priority given to those original bytes. No earlier archive manifest or 138 runtime was reused. Eleven files have only dependency-path or isolated-storage adaptations; their exact source bytes also remain in `originals/`.

All local runtime dependencies are physical files under `baseline/`: scripts, styles, datasets, fonts, the 42 symbol, photos, avatars, map libraries, worker, raw/compressed world geography and decryption modules. Existing archives, screenshots and test suites are not duplicated. No gesture-study scripts or bridge are injected, and the reader does not rely on mutable assets outside this archive.

Seven browser-storage keys/prefixes use the unique prefix `horizon-archive-pre-action-palette-and-no-zoom-20261013-`, isolating theme, current/legacy content preferences, old view preference, comments, reports and repository links. The active prototype's preferences and favorites are unaffected by opening the archive.

Campus street maps still depend on the existing remote tiles, glyphs and sprites. The local world globe and datasets are preserved; remote-service availability is not guaranteed offline.

Check the preserved bytes with:

```sh
python3 archives/site-versions/pre-action-palette-and-no-zoom-20261013/snapshot.py --verify
```

The script refuses to overwrite existing snapshots. Since this manifest exists, reproduction uses the historical bytes held here, even if active sources have changed:

```sh
python3 archives/site-versions/pre-action-palette-and-no-zoom-20261013/snapshot.py --output /tmp/horizon-pre-action-palette-and-no-zoom-reproduction
```

The [technical verification](snapshot-verification.json) records **64 JavaScript syntax checks** outside third-party libraries, **197 local references with no missing files**, the seven unchanged priority originals, and a reproduction whose manifest is byte-for-byte identical. The preserved entry imports `top-world-control-139` and includes both visible zoom controls. No browser replay is claimed by this archive preparation.
