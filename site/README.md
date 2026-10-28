# site/ — current version of the 42 Horizon prototype

This folder holds **only the current version** of the web prototype (called `work/visualizations/horizon-welcome/` until 23 October 2026). It is a static prototype, version 0.0.1 pre-alpha, not the production application. Earlier states are in [`archives/site-versions/`](../archives/site-versions/INDEX.md); design trials are in [`studies/`](../studies/README.md).

| Path | Content |
| --- | --- |
| `index.html` | Main entry: encrypted arrival, simulated sign-in or visit, then Explorer. |
| `content-preview.html` | Same interface without the arrival screen. |
| `*.mjs`, `*.css`, `*.json` | Modules, styles and demonstration data shared by both entries. |
| `decryption/` | Decryption scanner of the arrival (trial no. 22 of [`studies/decryption-examples/`](../studies/decryption-examples/index.html) and its engine), copied here on 23 October so the site no longer depends on a study. |
| `vendor/`, `geography/`, `assets/`, `project-demos/` | MapLibre, local world geography, campus photos and portraits, demo project. |
| `*.test.mjs`, `tests/` | Automated tests. |
| `notes/` | Design and implementation notes, one file per feature (mostly in French). |
| `checks/` | Dated verification evidence and the scripts that produced it. |

Shared dependencies come from [`shared/`](../shared/README.md): Jost fonts, d3/topojson, the 42 logo and the colour tokens.

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1      # then open http://127.0.0.1:8765/site/
node --test site/*.test.mjs site/tests/*.test.mjs
```
