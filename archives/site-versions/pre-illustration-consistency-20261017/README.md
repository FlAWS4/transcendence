# Before the illustration consistency fixes — 17 October 2026

Open the preserved [projects list](baseline/content-preview.html#projects), [a project page](baseline/content-preview.html#projects/ft-transcendence-building-together) or [an article](baseline/content-preview.html#journal/journal-share-the-unfinished) (switch the language to Arabic from the account menu to see the two direction issues).

This archive preserves the active state reached on 15 October (controller **146**, `welcome.mjs?v=audit-fixes-146`; content preview **113**; `project-ui.mjs?v=41`; `journal-ui.mjs?v=40`; `content-preview.css?v=dock-5`; `projects.css?v=11`; `media-viewer.css?v=1`) before three corrections asked by the user on 17 October, after the Figma rebuild checks had pointed them out as probably unintended:

- the generated illustrations of a project or article page and of the media viewer inherited the outline of the icon rule (`welcome.css`: `svg { stroke: currentColor; stroke-width: 1.6 }`), whereas the cards remove it (`.cp-art > svg { stroke: none }`);
- in Arabic, the texts drawn inside these illustrations (“, &, `$ ./minishell`) inherited `direction: rtl` and moved out of place;
- in Arabic, the campus of an article header and the name in « Explore {campus} » read « Tokyo 42 » instead of « 42 Tokyo » (no isolation, unlike the other campus names).

These numbers identify cache iterations, not project releases.

All **139 runtime sources** were captured from the active files before the change. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and the eleven adaptations limited to dependency paths or isolated storage; their exact source bytes remain in `originals/`. No test file changes.

The physical `baseline/` includes all local runtime dependencies and uses the storage prefix `horizon-archive-pre-illustration-consistency-20261017-`, so it neither reads nor changes the active prototype's settings, favourites or comments. Detailed campus street maps still require the existing remote provider.

Verification: the snapshot hashes match (139 sources, 11 adapted originals). The comparison with the corrected state is in [`checks/20261017-illustration-consistency/`](../../../site/checks/20261017-illustration-consistency/results.json): the projects list is pixel-identical, the other differences are limited to the illustrations and, in Arabic, to the campus names.

```sh
python3 archives/site-versions/pre-illustration-consistency-20261017/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. All earlier archives remain available, including the [state before the white dark-theme text](../pre-dark-secondary-text-20261015/README.md).
