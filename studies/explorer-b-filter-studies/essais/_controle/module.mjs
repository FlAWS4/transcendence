// Loader fixture: records what the hook gives a trial (its context, then every onChange call) in window.__essaisControle.
export default function start({ id, pill, study, root, page }) {
 const record = window.__essaisControle ??= { fits: 0, calls: [] };
 record.context = { id, page, active: [...study.active], replacements: { ...study.replacements }, root: root === document.documentElement, elements: Object.keys(pill.el) };
 pill.onChange((state, reasons) => {
  record.calls.push({ reasons: [...reasons], level: state.level, name: state.name, crumb: state.crumb, hint: state.hint, section: state.section, lang: state.lang, dir: state.dir, theme: state.theme, width: state.width, viewport: state.viewport, rail: state.rail });
 });
}
