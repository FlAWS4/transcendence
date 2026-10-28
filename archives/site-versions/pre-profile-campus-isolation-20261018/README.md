# Before the campus names of the profile pages were isolated — 18 October 2026

Open the preserved [profiles list](baseline/content-preview.html#people) or [Leïla Mansour's profile](baseline/content-preview.html#people/profile-leila-mansour) and switch the language to Arabic from the account menu to see the issue.

This archive preserves the active state reached on 17 October (controller **147**, `welcome.mjs?v=audit-fixes-147`; content preview **114**; `profile-ui.mjs?v=34`; `project-ui.mjs?v=42`; `journal-ui.mjs?v=41`) before one correction asked by the user on 18 October. In Arabic, three campus names of the profile pages were inserted into a right-to-left line without isolation, so the bidirectional algorithm read « 42 Paris » as « Paris 42 »:

- the campus line of a profile card (`p.cp-meta`);
- the name in « Explore {campus} » (« استكشف {campus} ») of a profile;
- the campuses of a profile's campus history (no demo profile has one yet).

This is the defect fixed on 17 October for the article header and the « Explore {campus} » button of project and article pages ([state before that fix](../pre-illustration-consistency-20261017/README.md)). These numbers identify cache iterations, not project releases.

All **139 runtime sources** were captured from the active files before the change. [snapshot-manifest.json](snapshot-manifest.json) records original/runtime hashes and the eleven adaptations limited to dependency paths or isolated storage; their exact source bytes remain in `originals/`. No test file changes.

The physical `baseline/` includes all local runtime dependencies and uses the storage prefix `horizon-archive-pre-profile-campus-isolation-20261018-`, so it neither reads nor changes the active prototype's settings, favourites or comments. Detailed campus street maps still require the existing remote provider.

Verification: the snapshot hashes match (139 sources, 11 adapted originals). The comparison with the corrected state is in [`checks/20261018-profile-campus-isolation/`](../../../site/checks/20261018-profile-campus-isolation/results.json): the French pages are pixel-identical, the Arabic changes are limited to the campus names.

```sh
python3 archives/site-versions/pre-profile-campus-isolation-20261018/snapshot.py --verify
```

The script refuses to overwrite an existing snapshot. All earlier archives remain available.
