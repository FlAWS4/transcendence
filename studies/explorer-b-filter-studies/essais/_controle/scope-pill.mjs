// Loader fixture: stands in for the copy's scope-pill.mjs through the import map written by essais/styles.js. It reuses
// the original, imported under a URL that the map does not redirect (?original), and counts the controller's fit()
// calls, so a check can tell that welcome.mjs received this copy.
import * as original from '../../baseline/scope-pill.mjs?original';

export const scopeIndications = original.scopeIndications;

export function mountScopePill(options) {
 const controller = original.mountScopePill(options);
 const record = window.__essaisControle ??= { fits: 0, calls: [] };
 record.replaced = true;
 document.documentElement.dataset.essaisControle = 'scope-pill.mjs';
 return { fit() { record.fits++; return controller.fit(); }, get width() { return controller.width; } };
}
