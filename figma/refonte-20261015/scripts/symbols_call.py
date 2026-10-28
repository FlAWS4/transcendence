"""Symbol components drawn by Chrome in DejaVu Sans because Jost lacks them (Figma rebuild, 17 October 2026).

  python3 symbols_call.py           → calls/<n>-symboles.js : creates or replaces the components of dom2fig.SYMBOLS on the
                                      page « Icônes et marque », section « Symboles (DejaVu Sans) »
  python3 symbols_call.py record <json> → stores {ref: component id} in figma-ledger.json « assets »
  python3 symbols_call.py update      → 18 Oct.: redraws the existing components in place (same ids and instances) from
                                      the font Chrome really falls back on (dom2fig.SYMBOL_FONTS); then record-update <json>
Figma would otherwise draw « ☺ » and « ↗ » as colour emoji. The outlines come from DejaVuSans.ttf (font_outlines.py),
100 px per em; scenes place instances on the text baseline, recoloured like the text (col, st 0).
"""
import json, sys
from make_call import CALLS, LEDGER, next_index
import dom2fig

CALL = r"""const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' }); await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
const A = %(items)s;
const TITLE = 'Symboles (DejaVu Sans)';
let sec = page.children.find(n => n.type === 'SECTION' && n.name === TITLE);
if (!sec) {
  let bottom = 0; for (const s of page.children) bottom = Math.max(bottom, s.y + s.height);
  sec = figma.createSection(); page.appendChild(sec); sec.name = TITLE; sec.x = 0; sec.y = bottom + 80; sec.resizeWithoutConstraints(1600, 200);
  const t = figma.createText(); sec.appendChild(t); t.fontName = { family: 'Jost', style: 'Medium' }; t.fontSize = 32; t.characters = TITLE; t.x = 40; t.y = 40;
  const n = figma.createText(); sec.appendChild(n); n.fontName = { family: 'Jost', style: 'Regular' }; n.fontSize = 16; n.x = 40; n.y = 90;
  n.characters = 'Jost n’a pas ces caractères : Chrome les dessine en DejaVu Sans, d’un seul ton, de la couleur du texte. Figma les afficherait en émoji couleur. Contours exacts de DejaVu Sans, 100 px par cadratin.';
  n.textAutoResize = 'HEIGHT'; n.resize(1500, n.height);
}
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const text = V['Rôles/text'];
const out = {};
A.forEach((a, i) => {
  for (const old of sec.children.filter(n => n.type === 'COMPONENT' && n.name === a.name)) old.remove();
  const node = figma.createNodeFromSvg(a.svg); sec.appendChild(node);
  const comp = figma.createComponentFromNode(node);
  comp.name = a.name; comp.fills = [];
  comp.description = 'Symbole dessiné par Chrome en DejaVu Sans (absent de Jost), identifiant de relevé ' + a.ref + '.';
  for (const c of comp.children) if ('constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  if (text) for (const v of comp.findAllWithCriteria({ types: ['VECTOR', 'BOOLEAN_OPERATION'] })) if (v.fills && v.fills.length) v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', text)];
  comp.x = 40 + i * 180; comp.y = 150;
  out[a.ref] = comp.id;
});
sec.resizeWithoutConstraints(Math.max(1600, 40 + A.length * 180 + 40), 320);
return { created: out, count: Object.keys(out).length };"""


def call():
    led = json.loads(LEDGER.read_text())
    for ch in dom2fig.SYMBOLS:
        dom2fig.symbol_ref(ch)
    items = [{'ref': ref, 'name': a['name'], 'svg': a['svg']} for ref, a in dom2fig.SYMBOLS_USED.items()]
    code = CALL % {'page': led['pages']['Icônes et marque'], 'items': json.dumps(items, ensure_ascii=False)}
    f = CALLS / ('%03d-symboles.js' % next_index())
    f.write_text(code)
    print(f.name, len(code), [i['name'] for i in items])


UPDATE_CALL = r"""// 42 Horizon — symboles redessinés sur place (18 oct. 2026) : même composant, mêmes instances, contour de la police
// que Chrome utilise vraiment pour chaque caractère
const page = await figma.getNodeByIdAsync('%(page)s');
await figma.setCurrentPageAsync(page);
await figma.loadFontAsync({ family: 'Jost', style: 'Medium' }); await figma.loadFontAsync({ family: 'Jost', style: 'Regular' });
const A = %(items)s;
const V = {}; for (const v of await figma.variables.getLocalVariablesAsync()) V[v.name] = v;
const text = V['Rôles/text'];
const out = {}, missing = [];
let sec = null;
for (const a of A) {
  const comp = await figma.getNodeByIdAsync(a.id);
  if (!comp || comp.type !== 'COMPONENT') { missing.push(a.id); continue; }
  sec = sec || comp.parent;
  const node = figma.createNodeFromSvg(a.svg); comp.parent.appendChild(node);
  for (const c of [...comp.children]) c.remove();
  comp.resizeWithoutConstraints(node.width, node.height);
  for (const c of [...node.children]) comp.appendChild(c);
  node.remove();
  for (const c of comp.children) if ('constraints' in c) c.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  if (text) for (const v of comp.findAllWithCriteria({ types: ['VECTOR', 'BOOLEAN_OPERATION'] })) if (v.fills && v.fills.length) v.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', text)];
  comp.name = a.name; comp.fills = [];
  comp.description = 'Symbole absent de Jost, dessiné par Chrome en ' + a.family + ' (police de secours relevée), identifiant de relevé ' + a.ref + '.';
  out[a.ref] = { id: comp.id, w: comp.width, h: comp.height, name: comp.name, instances: (await comp.getInstancesAsync()).length };
}
if (sec && sec.type === 'SECTION') {
  sec.name = 'Symboles (polices de secours de Chrome)';
  const texts = sec.children.filter(n => n.type === 'TEXT');
  const title = texts.find(n => n.fontSize === 32), note = texts.find(n => n.fontSize === 16);
  if (title) title.characters = 'Symboles (polices de secours de Chrome)';
  if (note) note.characters = 'Jost n’a pas ces caractères. Chrome les prend dans sa police de secours : le sourire (U+263A) en Liberation Sans, par Arial, la flèche nord-est (U+2197) en DejaVu Sans, d’un seul ton, de la couleur du texte. Figma les afficherait en émoji couleur. Contours exacts de ces polices, 100 px par cadratin.';
}
return { updated: out, missing, section: sec ? sec.id : null };"""


def update_call():
    """18 Oct.: a symbol drawn from another font keeps its component (ledger id of its old reference): the same
    instances follow. The ledger maps the new reference to the same id once the result is recorded (record-update)."""
    led = json.loads(LEDGER.read_text())
    assets = led.get('assets', {})
    items = []
    for ch in dom2fig.SYMBOLS:
        ref = dom2fig.symbol_ref(ch)[0]
        a = dom2fig.SYMBOLS_USED[ref]
        old = [k for k in assets if k.startswith('glyph:') and k.endswith('-%04x' % ord(ch))]
        cid = assets.get(ref) or (assets[old[0]] if old else None)
        if cid:
            items.append({'id': cid, 'ref': ref, 'name': a['name'], 'svg': a['svg'], 'family': a['family']})
    code = UPDATE_CALL % {'page': led['pages']['Icônes et marque'], 'items': json.dumps(items, ensure_ascii=False)}
    f = CALLS / ('%03d-symboles-polices-de-secours.js' % next_index())
    f.write_text(code)
    print(f.name, len(code), [(i['id'], i['name']) for i in items])


def record_update(result_json):
    res = json.loads(result_json)
    led = json.loads(LEDGER.read_text())
    assets = led.setdefault('assets', {})
    for ref, info in res['updated'].items():
        for k in [k for k, v in assets.items() if v == info['id'] and k != ref]:
            assets.pop(k)
        assets[ref] = info['id']
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('symbols updated:', {r: i['id'] for r, i in res['updated'].items()})


def record(result_json):
    res = json.loads(result_json)
    led = json.loads(LEDGER.read_text())
    led.setdefault('assets', {}).update(res['created'])
    LEDGER.write_text(json.dumps(led, ensure_ascii=False, indent=1))
    print('symbols recorded:', res['created'])


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'record':
        record(sys.argv[2] if len(sys.argv) > 2 else sys.stdin.read())
    elif len(sys.argv) > 1 and sys.argv[1] == 'update':
        update_call()
    elif len(sys.argv) > 1 and sys.argv[1] == 'record-update':
        record_update(sys.argv[2] if len(sys.argv) > 2 else sys.stdin.read())
    else:
        call()
