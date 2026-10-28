# explorer-b-design — three directions for version B's Explorer (24 October 2026)

Version B of the site ([`site-b/`](../../site-b/README.md)) replaces the globe of the Explorer with a level selector. The user asked for three things:
- no blocks: for example, the simplified shape of France with its flag inside and « France » written over it;
- campus logos shown directly, with their name below;
- a campus sheet that takes the place of the selector without covering the Explorer, with a well-thought-out, warm design.

Three designers each built a playable mock-up on the real data.

| Mock-up | Direction | Evaluation |
| --- | --- | --- |
| [atlas](atlas/index.html) | « Atlas de voyage chaleureux »: a lamp's pool of light, names on a paper halo, logos printed on the page, a sheet laid out like an atlas entry. | Judge 1 (look and warmth): first, 53. Judge 2 (use, accessibility, fidelity): third, 45.5. |
| [arcade](arcade/index.html) | « Autocollants sur podium »: a level-select screen, a pink podium, countries as die-cut stickers, a HUD-like sheet. | Second for both judges (50 and 48.5). |
| [halo](halo/index.html) | « Halo et lumière »: silhouettes on halos of light along a curved horizon, the welcome's colours, a three-column sheet unfolding around the logo. | Judge 1: third, 48. Judge 2: first, 53. |

**Outcome**:
- The assistant first picked an atlas-based synthesis on its own and started building it. The user stopped it: they had not chosen yet.
- The user then chose **Halo**. It was implemented faithfully in `site-b/` on 25 October 2026, with only the fixes of defects found by the judges.
- The user also chose the keyboard focus option: a ring around the « Valider » chip only, instead of halo's large frame.

The three mock-ups' own files are kept unchanged as research evidence. Atlas and arcade import version B's live model, `site-b/explorer-model.mjs`: since « Monde » was removed on 25 October, they no longer show the « Monde » item or the list of the 30 countries they were judged with (the model of that time is kept in [`pre-no-monde-20261025/`](../../archives/site-b-versions/pre-no-monde-20261025/README.md)). The [halo](halo/README.md) folder has its own notes, written before the choice. The implementation is described in [`site-b/notes/SPEC-B-HALO.md`](../../site-b/notes/SPEC-B-HALO.md).
