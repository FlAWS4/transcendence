# Initial mobile Back to top — 13 October 2026

[Open the standalone study](preview.html). Serve this directory over HTTP and use a viewport no wider than840px. It depends only on the two physical source files beside the viewer; no active modules, assets, routes, preferences or storage are used.

`back-to-top.mjs` and `back-to-top.css` are the exact first implementation. Their SHA-256 values match the sources recorded before the first Chrome run in `browser-proof.json`; `manifest.json` records the preserved files. The compact viewer supplies a static reading area and dock fixture to exercise the original module. It is deliberately a focused study, not a reconstruction of the full application or its corpus.

The original shortcut already respected the mobile breakpoint, scroll threshold, target size, dock clearance and smooth return to the title. The first Chrome run exposed a focus loss when the viewport changed from840px to841px with the button focused: CSS hid it before the media-query handler could identify it as the active element. The active version remembers focus ownership and also follows dock capsule resizing through its closing animation.

No earlier Back to top module existed before this request. The initial failed browser proof is retained; it is not a claim that the current implementation still has that defect.
