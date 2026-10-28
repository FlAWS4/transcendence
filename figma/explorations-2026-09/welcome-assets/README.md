# Welcome map vectors — 27 September 2026

These editable SVG assets synchronize the map geometry of the local `horizon-welcome` prototype into Figma. They do not change the web prototype or provide interactive WebGL inside Figma.

## Assets to import

- `world-compact.svg`: desktop globe, 538.451 × 538.451 px, about 178 KB.
- `world-mobile-compact.svg`: mobile globe, 341.384 × 341.384 px. The perspective differs slightly from a resized desktop globe.
- `france-desktop-light.svg`: country view, 1051.2 × 668 px, about 103 KB.
- `france-desktop-rtl-light.svg`: same unmirrored geography centred at 45% of the map stage.
- `france-mobile-light.svg`: country view, 390 × 429 px, about 53 KB.
- The full-resolution world SVGs and explicit France dark SVGs remain as reference assets.

The semantic groups are `Ocean`, `Land` (individual country paths), and `Shared-borders`. Bind those three paints to Figma colour variables after import. SVG scale transforms encode relative path coordinates in tenths of a pixel to reduce payload size; they must remain applied. Full-resolution world shapes use a maximum line simplification tolerance of 0.055 px. Compact assets use 0.25 px before 0.1 px coordinate rounding; subpixel degenerate rings are omitted. This is a static world-view export, not a replacement for the source geography used at closer zoom levels.

## Position and markers

`world-vector-state.json` contains the 30 country centroids and their projection in globe-local, map-local and page coordinates. Twenty-five face the initial camera; the browser's font-dependent decluttering decides which labels are expanded.

Desktop map stage: page `(388.8, 208)`, size `1051.2 × 668`; globe centre `(578.16, 334)` within the stage. The globe's page top-left is `(697.734647, 272.774647)`.

Mobile map stage: page `(0, 170)`, size `390 × 429`; globe centre `(195, 214.5)` within the stage. The globe's page top-left is `(24.307987, 213.807987)`.

`france-vector-state.json` preserves all eight French campus positions, both country cameras, stage positions and fade widths. Country zoom is 4.425872 on desktop and 3.649498 on mobile. Both use the actual spherical campus centroid `[3.8111310148, 45.9366646601]`.

The France SVGs deliberately contain **no fade mask**, allowing native Figma masks and editable geometry. Apply two intersecting opacity gradients to the map only: transparent at the edge, fully opaque after 147 px horizontally and 120 px vertically on desktop; 55 px and 77 px on mobile. Keep campus markers outside those masks, matching the website. Do not mirror geographic vectors for RTL.

## Source and checks

The exact local Natural Earth 5.1.1 topology supplies the 258 entities and shared border mesh. Its provenance is recorded at `../../../site/geography/PROVENANCE.md`. The web polar-border seam correction is reused.

The projection follows the pinned MapLibre 5.24 vertical-perspective equations at zero pitch, including latitude-adjusted sphere radius, the default field of view, camera distance, padding and horizon clipping. D3 7.9 is reused locally for spherical clipping and path generation; no dependency download was needed.

`projection-verification.json` records comparisons against the actual local MapLibre CPU transform: all 30 country markers in both world formats and all eight French campuses in desktop, RTL desktop and mobile differ by less than 0.00065 px (metadata rounding). This confirms analytic projection coordinates, not GPU raster antialiasing or Figma import fidelity. MapLibre's tile subdivision, simplification and GPU latitude correction can still cause subpixel differences. World and desktop France SVG renders were visually inspected after export with Inkscape.

Rebuild from the repository root:

```sh
node figma/explorations-2026-09/welcome-assets/build-world-vectors.mjs
node figma/explorations-2026-09/welcome-assets/build-world-vectors.mjs --compact
node figma/explorations-2026-09/welcome-assets/build-france-vectors.mjs --compact
node figma/explorations-2026-09/welcome-assets/verify-projection.mjs
```

The verification script exposes the pinned transform in a copied module in memory. The vendor file on disk remains unchanged.
