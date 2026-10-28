# Rejected filter-panel proposal — 13 October 2026

This preserves the first shared Projects/Profiles filter-panel redesign, explicitly rejected by the user in favour of collapsible categories with independent select-all controls.

Exact `project-filter-dialog.mjs`, `project-filter-dialog.css`, `content-controls.mjs` and `tests/project-filter-dialog.test.mjs` snapshots were saved before the accordion replacement; their sizes and SHA-256 hashes are in [source-manifest.json](source-manifest.json). The first proposal's note is retained as [FILTER_DIALOG_NOTES.first-proposal.md](FILTER_DIALOG_NOTES.first-proposal.md).

The adjacent pre-account archive captured the same version-2 module, CSS and controls dependencies: [open Projects](../pre-account-menu-20261013/preview.html#projects) or [Profiles](../pre-account-menu-20261013/preview.html#people), then select Filter. This reader retains the rejected panel and freezes its dependencies while avoiding redundant copies. Shared media and geography remain in the repository; serve it through the local project server.

Its browser evidence is retained under `../../../site/checks/20261013-filter-dialog-browser.json` and `../../checks/20261013-filter-{projects,profiles}-fr.png`, `../../checks/20261013-filter-{projects,people}-ar.png`. These checks do not imply user acceptance. The current accordion implementation is documented in [FILTER_DIALOG_NOTES.md](../../../site/notes/FILTER_DIALOG_NOTES.md).
