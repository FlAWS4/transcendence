# Site versions — index

Every folder here is one preserved state of the active site, `site/` (named `work/visualizations/horizon-welcome/` until 23 October 2026), captured just before a change. A folder named `pre-<change>-<date>` holds the state **before** that change. 159 states, from 2026-10-05 to 2026-10-18. Cache numbers quoted in the notes (`welcome.mjs?v=…`) identify iterations, not project releases.

Three formats exist, depending on the date of the archive:

- **self-contained snapshot** (12): a complete copy in `baseline/`, with isolated browser storage. `python3 archives/site-versions/<folder>/snapshot.py --verify` checks its hashes.
- **viewer** (25): `preview.html` replays the archived files; it still loads the unchanged files from the current `site/` and `shared/` folders.
- **source copy** (122): the replaced source files only. They are not standalone pages; to replay one, copy them over a copy of `site/` (the "original directory" mentioned in their notes).

Open pages through the local server started at the repository root (`python3 -m http.server 8765 --bind 127.0.0.1`), for example `http://127.0.0.1:8765/archives/site-versions/<folder>/preview.html`. Titles come from each folder's README; *italic* titles are derived from the folder name because the folder has no README.

| Date | State | Format | Open |
| --- | --- | --- | --- |
| 2026-10-05 | **pre-capsule-panel-20261005** — Search capsule before panel expansion | source copy | [README.md](pre-capsule-panel-20261005/README.md) |
| 2026-10-05 | **pre-dock-motion-20261005** — Before compact dock motion — 5 October 2026 | source copy | [README.md](pre-dock-motion-20261005/README.md) |
| 2026-10-05 | **pre-floating-search-20261005** — Before floating search — 5 October 2026 | source copy | [README.md](pre-floating-search-20261005/README.md) |
| 2026-10-05 | **pre-frosted-glass-20261005** — Before frosted glass — 5 October 2026 | source copy | [README.md](pre-frosted-glass-20261005/README.md) |
| 2026-10-05 | **pre-glass-search-20261005** — Before glass search surfaces — 5 October 2026 | source copy | [README.md](pre-glass-search-20261005/README.md) |
| 2026-10-05 | **pre-header-filter-fade-20261005** — *Before: header filter fade* | source copy | [folder](pre-header-filter-fade-20261005/) |
| 2026-10-05 | **pre-progressive-campus-20261005** — Avant la fiche campus progressive — 5 octobre 2026 | source copy | [README.md](pre-progressive-campus-20261005/README.md) |
| 2026-10-05 | **pre-raised-filter-20261005** — *Before: raised filter* | source copy | [folder](pre-raised-filter-20261005/) |
| 2026-10-05 | **pre-reading-filter-20261005** — *Before: reading filter* | source copy | [folder](pre-reading-filter-20261005/) |
| 2026-10-05 | **pre-search-field-focus-20261005** — Search field before removing its inner outline | source copy | [README.md](pre-search-field-focus-20261005/README.md) |
| 2026-10-05 | **pre-sticky-header-20261005** — *Before: sticky header* | source copy | [folder](pre-sticky-header-20261005/) |
| 2026-10-05 | **progressive-campus-related-20261005** — *progressive campus related* | source copy | [folder](progressive-campus-related-20261005/) |
| 2026-10-06 | **contextual-discovery-before-singleton-20261006** — *contextual discovery before singleton* | source copy | [folder](contextual-discovery-before-singleton-20261006/) |
| 2026-10-06 | **pre-account-pill-20261006** — *Before: account pill* | source copy | [folder](pre-account-pill-20261006/) |
| 2026-10-06 | **pre-category-controls-20261006** — Before category controls — 6 October 2026 | source copy | [README.md](pre-category-controls-20261006/README.md) |
| 2026-10-06 | **pre-content-categories-20261006** — Avant les filtres Projet et Statut | source copy | [README.md](pre-content-categories-20261006/README.md) |
| 2026-10-06 | **pre-content-controls-20261006** — Before content controls — 6 October 2026 | source copy | [README.md](pre-content-controls-20261006/README.md) |
| 2026-10-06 | **pre-content-menu-placement-20261006** — Before bounded menu placement — 6 October 2026 | source copy | [README.md](pre-content-menu-placement-20261006/README.md) |
| 2026-10-06 | **pre-content-menu-scroll-20261006** — Before scroll event filtering — 6 October 2026 | source copy | [README.md](pre-content-menu-scroll-20261006/README.md) |
| 2026-10-06 | **pre-contextual-discovery-20261006** — Avant la découverte contextuelle — 6 octobre 2026 | source copy | [README.md](pre-contextual-discovery-20261006/README.md) |
| 2026-10-06 | **pre-fluid-toolbar-type-20261006** — *Before: fluid toolbar type* | source copy | [folder](pre-fluid-toolbar-type-20261006/) |
| 2026-10-06 | **pre-grouped-categories-20261006** — *Before: grouped categories* | source copy | [folder](pre-grouped-categories-20261006/) |
| 2026-10-06 | **pre-grouped-category-controls-20261006** — Before grouped project filters — 6 October 2026 | source copy | [README.md](pre-grouped-category-controls-20261006/README.md) |
| 2026-10-06 | **pre-grouped-content-filters-20261006** — *Before: grouped content filters* | source copy | [folder](pre-grouped-content-filters-20261006/) |
| 2026-10-06 | **pre-mobile-content-controls-20261006** — *Before: mobile content controls* | source copy | [folder](pre-mobile-content-controls-20261006/) |
| 2026-10-06 | **pre-mobile-scope-alignment-20261006** — *Before: mobile scope alignment* | source copy | [folder](pre-mobile-scope-alignment-20261006/) |
| 2026-10-06 | **pre-multi-category-controls-20261006** — Before multiple category selections — 6 October 2026 | source copy | [README.md](pre-multi-category-controls-20261006/README.md) |
| 2026-10-06 | **pre-multiple-categories-20261006** — *Before: multiple categories* | source copy | [folder](pre-multiple-categories-20261006/) |
| 2026-10-06 | **pre-multiple-content-filters-20261006** — *Before: multiple content filters* | source copy | [folder](pre-multiple-content-filters-20261006/) |
| 2026-10-06 | **pre-profiles-20261006** — Avant les profils et les auteurs — 6 octobre 2026 | source copy | [README.md](pre-profiles-20261006/README.md) |
| 2026-10-06 | **pre-profiles-search-20261006** — Before profile discovery search — 6 October 2026 | source copy | [README.md](pre-profiles-search-20261006/README.md) |
| 2026-10-06 | **pre-reading-context-20261006** — Avant le contexte géographique figé — 6 octobre 2026 | source copy | [README.md](pre-reading-context-20261006/README.md) |
| 2026-10-06 | **pre-reading-scope-spacing-20261006** — *Before: reading scope spacing* | source copy | [folder](pre-reading-scope-spacing-20261006/) |
| 2026-10-06 | **pre-red-favorites-20261006** — Avant les cœurs toujours rouges — 6 octobre 2026 | source copy | [README.md](pre-red-favorites-20261006/README.md) |
| 2026-10-06 | **pre-responsive-content-20261006** — *Before: responsive content* | source copy | [folder](pre-responsive-content-20261006/) |
| 2026-10-06 | **pre-sort-downward-20261006** — Avant ouverture descendante du tri — 6 octobre 2026 | source copy | [README.md](pre-sort-downward-20261006/README.md) |
| 2026-10-06 | **pre-uniform-dock-20261006** — Avant le dock uniforme — 6 octobre 2026 | source copy | [README.md](pre-uniform-dock-20261006/README.md) |
| 2026-10-06 | **profiles-before-title-focus-20261006** — *profiles before title focus* | source copy | [folder](profiles-before-title-focus-20261006/) |
| 2026-10-06 | **profiles-before-transcender-20261006** — *profiles before transcender* | source copy | [folder](profiles-before-transcender-20261006/) |
| 2026-10-07 | **pre-awards-entry-20261007** — *Before: awards entry* | source copy | [folder](pre-awards-entry-20261007/) |
| 2026-10-07 | **pre-cadet-status-20261007** — *Before: cadet status* | source copy | [folder](pre-cadet-status-20261007/) |
| 2026-10-07 | **pre-campus-history-20261007** — *Before: campus history* | source copy | [folder](pre-campus-history-20261007/) |
| 2026-10-07 | **pre-centered-detail-menu-20261007** — *Before: centered detail menu* | source copy | [folder](pre-centered-detail-menu-20261007/) |
| 2026-10-07 | **pre-centered-local-menu-raccords-20261007** — *Before: centered local menu raccords* | source copy | [folder](pre-centered-local-menu-raccords-20261007/) |
| 2026-10-07 | **pre-compact-profile-grid-20261007** — *Before: compact profile grid* | source copy | [folder](pre-compact-profile-grid-20261007/) |
| 2026-10-07 | **pre-compact-profile-list-20261007** — *Before: compact profile list* | source copy | [folder](pre-compact-profile-list-20261007/) |
| 2026-10-07 | **pre-essential-profiles-20261007** — *Before: essential profiles* | source copy | [folder](pre-essential-profiles-20261007/) |
| 2026-10-07 | **pre-four-stage-dock-20261007** — Archive du prototype | viewer | [preview.html](pre-four-stage-dock-20261007/preview.html) |
| 2026-10-07 | **pre-independent-detail-scroll-20261007** — *Before: independent detail scroll* | source copy | [folder](pre-independent-detail-scroll-20261007/) |
| 2026-10-07 | **pre-inset-menu-arrows-20261007** — *Before: inset menu arrows* | source copy | [folder](pre-inset-menu-arrows-20261007/) |
| 2026-10-07 | **pre-journal-sections-20261007** — *Before: journal sections* | source copy | [folder](pre-journal-sections-20261007/) |
| 2026-10-07 | **pre-menu-only-scroll-20261007** — *Before: menu only scroll* | source copy | [folder](pre-menu-only-scroll-20261007/) |
| 2026-10-07 | **pre-natural-detail-reading-20261007** — *Before: natural detail reading* | source copy | [folder](pre-natural-detail-reading-20261007/) |
| 2026-10-07 | **pre-profile-campus-overview-20261007** — *Before: profile campus overview* | source copy | [folder](pre-profile-campus-overview-20261007/) |
| 2026-10-07 | **pre-profile-cohorts-20261007** — *Before: profile cohorts* | source copy | [folder](pre-profile-cohorts-20261007/) |
| 2026-10-07 | **pre-profile-identity-spacing-20261007** — *Before: profile identity spacing* | source copy | [folder](pre-profile-identity-spacing-20261007/) |
| 2026-10-07 | **pre-profile-menu-raccords-20261007** — *Before: profile menu raccords* | source copy | [folder](pre-profile-menu-raccords-20261007/) |
| 2026-10-07 | **pre-profile-message-action-20261007** — *Before: profile message action* | source copy | [folder](pre-profile-message-action-20261007/) |
| 2026-10-07 | **pre-profile-sections-20261007** — Avant les fiches à sections — 7 octobre 2026 | source copy | [README.md](pre-profile-sections-20261007/README.md) |
| 2026-10-07 | **pre-profile-social-links-20261007** — *Before: profile social links* | source copy | [folder](pre-profile-social-links-20261007/) |
| 2026-10-07 | **pre-profile-status-text-20261007** — *Before: profile status text* | source copy | [folder](pre-profile-status-text-20261007/) |
| 2026-10-07 | **pre-progressive-globe-center-20261007** — *Before: progressive globe center* | source copy | [folder](pre-progressive-globe-center-20261007/) |
| 2026-10-07 | **pre-project-card-cta-removal-20261007** — *Before: project card cta removal* | source copy | [folder](pre-project-card-cta-removal-20261007/) |
| 2026-10-07 | **pre-project-group-selection-20261007** — *Before: project group selection* | source copy | [folder](pre-project-group-selection-20261007/) |
| 2026-10-07 | **pre-project-sections-20261007** — *Before: project sections* | source copy | [folder](pre-project-sections-20261007/) |
| 2026-10-07 | **pre-publication-compact-density-20261007** — *Before: publication compact density* | source copy | [folder](pre-publication-compact-density-20261007/) |
| 2026-10-07 | **pre-rentree-labels-20261007** — *Before: rentree labels* | source copy | [folder](pre-rentree-labels-20261007/) |
| 2026-10-07 | **pre-retiring-wordmark-letter-20261007** — *Before: retiring wordmark letter* | source copy | [folder](pre-retiring-wordmark-letter-20261007/) |
| 2026-10-07 | **pre-short-favorite-label-20261007** — *Before: short favorite label* | source copy | [folder](pre-short-favorite-label-20261007/) |
| 2026-10-07 | **pre-unnumbered-local-menus-20261007** — *Before: unnumbered local menus* | source copy | [folder](pre-unnumbered-local-menus-20261007/) |
| 2026-10-07 | **pre-wordmark-glyph-fit-20261007** — *Before: wordmark glyph fit* | source copy | [folder](pre-wordmark-glyph-fit-20261007/) |
| 2026-10-08 | **campus-full-width-directions-20261008** — Itinéraire pleine largeur — archive | viewer | [preview.html](campus-full-width-directions-20261008/preview.html) |
| 2026-10-08 | **campus-logo-placeholder-20261008** — Emplacement du logo proposé — archive | viewer | [preview.html](campus-logo-placeholder-20261008/preview.html) |
| 2026-10-08 | **campus-stat-sizing-20261008** — Taille des chiffres campus — 8 octobre 2026 | source copy | [README.md](campus-stat-sizing-20261008/README.md) |
| 2026-10-08 | **pre-arabic-members-20261008** — Avant le libellé arabe « les membres » | source copy | [README.md](pre-arabic-members-20261008/README.md) |
| 2026-10-08 | **pre-author-responsibility-20261008** — *Before: author responsibility* | source copy | [folder](pre-author-responsibility-20261008/) |
| 2026-10-08 | **pre-campus-logo-sheet-20261008** — Archive du prototype | viewer | [preview.html](pre-campus-logo-sheet-20261008/preview.html) |
| 2026-10-08 | **pre-campus-profile-sources-20261008** — *Before: campus profile sources* | source copy | [folder](pre-campus-profile-sources-20261008/) |
| 2026-10-08 | **pre-campus-sheet-inputs-20261008** — État avant correction des entrées de la fiche campus | source copy | [README.md](pre-campus-sheet-inputs-20261008/README.md) |
| 2026-10-08 | **pre-cascade-wordmark-20261008** — Ancien brouillage HORIZON ↔ AWARDS | viewer | [preview.html](pre-cascade-wordmark-20261008/preview.html) |
| 2026-10-08 | **pre-chronicles-label-20261008** — Archive du prototype | viewer | [preview.html](pre-chronicles-label-20261008/preview.html) |
| 2026-10-08 | **pre-clickable-media-20261008** — Avant les médias agrandissables — 8 octobre 2026 | viewer | [preview.html](pre-clickable-media-20261008/preview.html) |
| 2026-10-08 | **pre-collective-authors-20261008** — *Before: collective authors* | source copy | [folder](pre-collective-authors-20261008/) |
| 2026-10-08 | **pre-compact-editorial-grids-20261008** — Archive du prototype | viewer | [preview.html](pre-compact-editorial-grids-20261008/preview.html) |
| 2026-10-08 | **pre-fixed-campus-photo-controls-20261008** — Commandes photo campus avant stabilisation — 8 octobre 2026 | source copy | [README.md](pre-fixed-campus-photo-controls-20261008/README.md) |
| 2026-10-08 | **pre-project-lead-label-20261008** — Libellé projet précédent — 8 octobre 2026 | source copy | [README.md](pre-project-lead-label-20261008/README.md) |
| 2026-10-10 | **pre-comment-editing-20261010** — Réponses et réactions — avant l’édition du 10 octobre 2026 | source copy | [README.md](pre-comment-editing-20261010/README.md) |
| 2026-10-10 | **pre-comment-replies-20261010** — Commentaires simples — avant les réponses du 10 octobre 2026 | source copy | [README.md](pre-comment-replies-20261010/README.md) |
| 2026-10-10 | **pre-comments-20261010** — Before comments and independent display preferences — 10 October 2026 | viewer | [preview.html](pre-comments-20261010/preview.html) |
| 2026-10-10 | **pre-independent-display-20261010** — Affichage commun — état avant le 10 octobre 2026 | source copy | [README.md](pre-independent-display-20261010/README.md) |
| 2026-10-10 | **pre-inline-article-media-20261010** — Before inline article media and simplified headings — 10 October 2026 | viewer | [preview.html](pre-inline-article-media-20261010/preview.html) |
| 2026-10-10 | **pre-profile-directory-favorites-20261010** — Annuaire Profils — avant les cœurs Favoris du 10 octobre 2026 | source copy | [README.md](pre-profile-directory-favorites-20261010/README.md) |
| 2026-10-10 | **pre-project-filter-dialog-20261010** — Avant le dialogue de filtres Projet — 10 octobre 2026 | source copy | [README.md](pre-project-filter-dialog-20261010/README.md) |
| 2026-10-10 | **pre-project-inline-media-20261010** — Avant les médias intégrés aux projets — 10 octobre 2026 | source copy | [README.md](pre-project-inline-media-20261010/README.md) |
| 2026-10-10 | **pre-skills-filter-20261010** — Before project skills filtering — 10 October 2026 | source copy | [README.md](pre-skills-filter-20261010/README.md) |
| 2026-10-10 | **pre-technology-filter-20261010** — Avant le filtre Technologies — 10 octobre 2026 | source copy | [README.md](pre-technology-filter-20261010/README.md) |
| 2026-10-11 | **pre-author-crown-20261011** — Avant la couronne des responsables — 11 octobre 2026 | source copy | [README.md](pre-author-crown-20261011/README.md) |
| 2026-10-11 | **pre-comment-actions-menu-20261011** — Comments before the owner actions menu | source copy | [README.md](pre-comment-actions-menu-20261011/README.md) |
| 2026-10-11 | **pre-comment-author-profiles-20261011** — Avant les profils des auteurs de commentaires — 11 octobre 2026 | source copy | [README.md](pre-comment-author-profiles-20261011/README.md) |
| 2026-10-11 | **pre-comment-author-routing-20261011** — Avant raccord des profils des commentaires — 11 octobre 2026 | source copy | [README.md](pre-comment-author-routing-20261011/README.md) |
| 2026-10-11 | **pre-comment-mentions-20261011** — Avant les mentions dans les commentaires — 11 octobre 2026 | source copy | [README.md](pre-comment-mentions-20261011/README.md) |
| 2026-10-11 | **pre-comment-thumb-reactions-20261011** — Réactions avant les pouces colorés — 11 octobre 2026 | source copy | [README.md](pre-comment-thumb-reactions-20261011/README.md) |
| 2026-10-11 | **pre-content-demo-label-removal-20261011** — En-têtes avant retrait des mentions illustratives | source copy | [README.md](pre-content-demo-label-removal-20261011/README.md) |
| 2026-10-11 | **pre-content-reporting-20261011** — Avant les signalements — 11 octobre 2026 | source copy | [README.md](pre-content-reporting-20261011/README.md) |
| 2026-10-11 | **pre-content-topic-label-removal-20261011** — Accroches des contenus avant leur retrait complet | source copy | [README.md](pre-content-topic-label-removal-20261011/README.md) |
| 2026-10-11 | **pre-crown-beside-name-20261011** — Couronne — état précédent du 11 octobre 2026 | source copy | [README.md](pre-crown-beside-name-20261011/README.md) |
| 2026-10-11 | **pre-detail-sidebar-image-removal-20261011** — Fiches avant le retrait de l’image latérale — 11 octobre 2026 | source copy | [README.md](pre-detail-sidebar-image-removal-20261011/README.md) |
| 2026-10-11 | **pre-icon-only-comment-reactions-20261011** — Pouces avec libellés visibles — 11 octobre 2026 | source copy | [README.md](pre-icon-only-comment-reactions-20261011/README.md) |
| 2026-10-11 | **pre-icon-only-content-controls-20261011** — Content controls before narrow icon-only buttons | source copy | [README.md](pre-icon-only-content-controls-20261011/README.md) |
| 2026-10-11 | **pre-light-report-border-20261011** — Contour Signaler avant correction du mode clair | source copy | [README.md](pre-light-report-border-20261011/README.md) |
| 2026-10-11 | **pre-list-excerpt-clamp-20261011** — Aperçus avant raccourcissement commun Grille/Liste — 11 octobre 2026 | source copy | [README.md](pre-list-excerpt-clamp-20261011/README.md) |
| 2026-10-11 | **pre-longer-second-dock-stage-20261011** — Menu avant extension du deuxième palier — 11 octobre 2026 | viewer | [preview-second-stage-only.html](pre-longer-second-dock-stage-20261011/preview-second-stage-only.html) |
| 2026-10-11 | **pre-measured-author-preview-20261011** — Aperçu des auteurs avant mesure de la place disponible — 11 octobre 2026 | source copy | [README.md](pre-measured-author-preview-20261011/README.md) |
| 2026-10-11 | **pre-mention-routing-20261011** — Raccord avant mentions — 11 octobre 2026 | source copy | [README.md](pre-mention-routing-20261011/README.md) |
| 2026-10-11 | **pre-mention-selection-fix-20261011** — Première passe du sélecteur de mentions — 11 octobre 2026 | source copy | [README.md](pre-mention-selection-fix-20261011/README.md) |
| 2026-10-11 | **pre-narrow-author-preview-20261011** — Couronne avant l’aperçu très étroit — 11 octobre 2026 | source copy | [README.md](pre-narrow-author-preview-20261011/README.md) |
| 2026-10-11 | **pre-profile-campus-actions-20261011** — Profil avant pays et actions sur deux rangées | source copy | [README.md](pre-profile-campus-actions-20261011/README.md) |
| 2026-10-11 | **pre-profile-link-scope-20261011** — Before preserving the geographic scope on profile links — 11 October 2026 | source copy | [README.md](pre-profile-link-scope-20261011/README.md) |
| 2026-10-11 | **pre-project-overview-team-testing-20261011** — Projet avant Équipe dans Vue d’ensemble et rubrique Tester | source copy | [README.md](pre-project-overview-team-testing-20261011/README.md) |
| 2026-10-11 | **pre-project-repository-link-20261011** — Essai des projets — état conservé du 11 octobre 2026 | viewer | [preview.html](pre-project-repository-link-20261011/preview.html) |
| 2026-10-11 | **pre-report-button-sizing-20261011** — Avant les dimensions communes à Signaler et Favoris — 11 octobre 2026 | source copy | [README.md](pre-report-button-sizing-20261011/README.md) |
| 2026-10-11 | **pre-report-explore-order-20261011** — Avant l’inversion Signaler / Explorer — 11 octobre 2026 | source copy | [README.md](pre-report-explore-order-20261011/README.md) |
| 2026-10-11 | **pre-silent-comment-deletion-20261011** — Avant retrait de la confirmation de suppression — 11 octobre 2026 | source copy | [README.md](pre-silent-comment-deletion-20261011/README.md) |
| 2026-10-11 | **pre-silent-comment-reactions-20261011** — Avant suppression des confirmations de réaction — 11 octobre 2026 | source copy | [README.md](pre-silent-comment-reactions-20261011/README.md) |
| 2026-10-11 | **pre-system-theme-20261011** — Before the System theme option — 11 October 2026 | source copy | [README.md](pre-system-theme-20261011/README.md) |
| 2026-10-11 | **pre-youtube-thumb-orientation-20261011** — Orientation précédente des pouces — 11 octobre 2026 | source copy | [README.md](pre-youtube-thumb-orientation-20261011/README.md) |
| 2026-10-12 | **pre-multi-campus-projects-20261012** — Before multi-campus projects and independent local navigation — 12 October 2026 | viewer | [preview.html](pre-multi-campus-projects-20261012/preview.html) |
| 2026-10-13 | **pre-about-corpus-copy-20261013** — About text before corpus correction — 13 October2026 | viewer | [preview.html](pre-about-corpus-copy-20261013/preview.html) |
| 2026-10-13 | **pre-account-identity-actions-20261013** — Account before identity and access updates — 13 October 2026 | viewer | [preview.html](pre-account-identity-actions-20261013/preview.html) |
| 2026-10-13 | **pre-account-menu-20261013** — Before the unified account menu — 13 October 2026 | viewer | [preview.html](pre-account-menu-20261013/preview.html) |
| 2026-10-13 | **pre-account-preference-panels-20261013** — Compte — état avant les sous-panneaux dédiés du 13 octobre 2026 | viewer | [preview.html](pre-account-preference-panels-20261013/preview.html) |
| 2026-10-13 | **pre-action-palette-and-no-zoom-20261013** — Before harmonized action colors and hidden zoom controls — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-action-palette-and-no-zoom-20261013/baseline/content-preview.html) |
| 2026-10-13 | **pre-animated-button-labels-20261013** — Before animated button labels only — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-animated-button-labels-20261013/baseline/content-preview.html) |
| 2026-10-13 | **pre-back-to-top-focus-fix-20261013** — Initial mobile Back to top — 13 October 2026 | viewer | [preview.html](pre-back-to-top-focus-fix-20261013/preview.html) |
| 2026-10-13 | **pre-back-to-top-scroll-hide-20261013** — Before matching the menu's scroll hiding — 13 October 2026 | viewer | [preview.html](pre-back-to-top-scroll-hide-20261013/preview.html) |
| 2026-10-13 | **pre-compact-pagination-20261013** — Pagination avant la correction compacte —13 octobre2026 | viewer | [preview.html](pre-compact-pagination-20261013/preview.html) |
| 2026-10-13 | **pre-content-pagination-20261013** — Before content pagination — 13 October 2026 | viewer | [preview.html](pre-content-pagination-20261013/preview.html) |
| 2026-10-13 | **pre-cycling-entrance-20261013** — Before the cycling entrance interactions — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-cycling-entrance-20261013/baseline/content-preview.html) |
| 2026-10-13 | **pre-demo-pagination-content-20261013** — Corpus avant l’enrichissement du 13 octobre 2026 | source copy | [README.md](pre-demo-pagination-content-20261013/README.md) |
| 2026-10-13 | **pre-discovery-tooltip-label-20261013** — Discovery tooltips before shortening — 13 October 2026 | source copy | [README.md](pre-discovery-tooltip-label-20261013/README.md) |
| 2026-10-13 | **pre-expanded-corpus-test-adjustment-20261013** — Before adapting checks to pagination and the expanded sample corpus | source copy | [README.md](pre-expanded-corpus-test-adjustment-20261013/README.md) |
| 2026-10-13 | **pre-explicit-scope-rollback-20261013** — Rejected broader action/copy pass, before explicit rollback — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-explicit-scope-rollback-20261013/baseline/content-preview.html) |
| 2026-10-13 | **pre-favorites-pagination-return-20261013** — Before resetting a changed favorite list on return — 13 October 2026 | source copy | [README.md](pre-favorites-pagination-return-20261013/README.md) |
| 2026-10-13 | **pre-filter-accordion-20261013** — Rejected filter-panel proposal — 13 October 2026 | source copy | [README.md](pre-filter-accordion-20261013/README.md) |
| 2026-10-13 | **pre-filter-dialog-refresh-20261013** — Before the shared filter-panel refresh — 13 October 2026 | source copy | [README.md](pre-filter-dialog-refresh-20261013/README.md) |
| 2026-10-13 | **pre-fixed-pagination-row-20261013** — Pagination avant la rangée fixe —13 octobre2026 | viewer | [preview.html](pre-fixed-pagination-row-20261013/preview.html) |
| 2026-10-13 | **pre-list-heading-removal-20261013** — Before removing the list headings — 13 October 2026 | viewer | [preview.html](pre-list-heading-removal-20261013/preview.html) |
| 2026-10-13 | **pre-map-independent-filter-20261013** — Before independent geographic filtering — 13 October 2026 | source copy | [README.md](pre-map-independent-filter-20261013/README.md) |
| 2026-10-13 | **pre-pagination-arrows-20261013** — Pagination avant les flèches —13 octobre2026 | viewer | [preview.html](pre-pagination-arrows-20261013/preview.html) |
| 2026-10-13 | **pre-secondary-dark-colors-20261013** — Before the secondary dark-colour correction — 13 October 2026 | source copy | [README.md](pre-secondary-dark-colors-20261013/README.md) |
| 2026-10-13 | **pre-seven-page-demo-content-20261013** — Étape intermédiaire à trois pages —13 octobre2026 | viewer | [preview.html](pre-seven-page-demo-content-20261013/preview.html) |
| 2026-10-13 | **pre-targeted-button-colors-20261013** — Before targeted button colors and visitor access — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-targeted-button-colors-20261013/baseline/content-preview.html) |
| 2026-10-13 | **pre-top-world-control-20261013** — Before the world control moved into the filter — 13 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-top-world-control-20261013/baseline/content-preview.html) |
| 2026-10-15 | **pre-audit-fixes-refinement-20261015** — Before the refinement of the audit fixes — 15 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-audit-fixes-refinement-20261015/baseline/content-preview.html) |
| 2026-10-15 | **pre-codex-audit-fixes-20261015** — Before the 15 October audit fixes — 15 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-codex-audit-fixes-20261015/baseline/content-preview.html) |
| 2026-10-15 | **pre-dark-secondary-text-20261015** — Before the white dark-theme text of Visit and Create an account — 15 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-dark-secondary-text-20261015/baseline/content-preview.html) |
| 2026-10-15 | **pre-design-review-selection-20261015** — Before the integration of the design-review selection — 15 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-design-review-selection-20261015/baseline/content-preview.html) |
| 2026-10-17 | **pre-illustration-consistency-20261017** — Before the illustration consistency fixes — 17 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-illustration-consistency-20261017/baseline/content-preview.html) |
| 2026-10-18 | **pre-profile-campus-isolation-20261018** — Before the campus names of the profile pages were isolated — 18 October 2026 | self-contained snapshot | [baseline/content-preview.html](pre-profile-campus-isolation-20261018/baseline/content-preview.html) |
