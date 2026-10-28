# Before removing the list headings — 13 October 2026

Open the preserved [Projects](preview.html#projects), [Profiles](preview.html#people) or [Chronicles](preview.html#journal) through the local project server. This reader retains the three-part list heading: the introductory label, section title and description.

This snapshot captures the active Horizon prototype immediately before the requested heading removal. It includes the multi-campus project model and independent local detail navigation completed on 12 October. It is a historical prototype, not an integrated application or a release.

## Preserved sources and reader

The six original files at this archive's root are exact copies captured before editing: `index.html`, `content-preview.html`, `content-preview.mjs`, `welcome.mjs`, `content-layout.css` and `responsive-content.css`. Their sizes and SHA-256 hashes are recorded in [source-manifest.json](source-manifest.json). Open **preview.html** to browse the archive; the original HTML files remain unadapted source copies.

The separate `preview.html`, `viewer-entry.mjs` and `viewer-welcome.mjs` adapters load 90 frozen application dependencies from `runtime/`: 52 JavaScript files, 33 stylesheets and 5 JSON datasets. These are physical files, with no symbolic links. Dependencies not included among the six initial captures were recovered from the clean repository HEAD recorded before the task, so parallel work cannot enter this snapshot.

[dependency-source-manifest.json](dependency-source-manifest.json) records the exact dependency source bytes. Ten modules need archive-specific storage keys or URL adjustments; their exact originals are retained separately in `dependency-originals/`. The other runtime files retain their original source bytes. [reader-manifest.json](reader-manifest.json) records the final reader files and their checksums.

## Reader adaptations

- The HTML base points to the parent Horizon directory so shared media keep their original resolution. Application stylesheets, modules and JSON datasets are loaded from this archive.
- The reader captures its exact document pathname and outer query string before changing browser history. Generated routes and static or dynamic SVG references stay on that document.
- Theme preference, content preferences and favourites, comments, reports and project repository drafts use keys prefixed with `horizon-archive-pre-list-heading-removal-20261013`. Trying the archive does not overwrite the active prototype's stored choices or drafts.
- The geography worker, shared decryption imports and geography dataset URLs account for the archive directory depth.

Fonts, design tokens, the official 42 symbol, portraits, campus/project media, map libraries, geographic resources and the decryption study remain shared within the repository. They were unchanged by this task. This reader is **not standalone outside the repository**. External map tiles and linked campus websites still depend on their external services.

## Verification

- The six primary snapshots and 90 dependency source snapshots match their recorded sizes and SHA-256 hashes.
- Syntax checks pass for all 54 reader/runtime JavaScript files.
- 104 unique local references from the HTML, JavaScript imports and module-relative URLs, and CSS URLs resolve without a missing file.
- The reader retains the old heading markup and its translation updates, the multi-campus project data and the corrected local navigation from 12 October.

No browser replay is claimed by this archive preparation. Subsequent browser checks should be recorded separately with their actual scope.
