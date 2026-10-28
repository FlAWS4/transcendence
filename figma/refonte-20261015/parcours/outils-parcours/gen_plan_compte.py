"""19 Oct.: street map of the member account pages. python3 gen_plan_compte.py lookup | rename <placeholder ids json> [<hashes json>]
lookup: read-only call per flow page, the « · à remplacer » layers of the account frames; rename: names the filled layers
« Plan du campus · carte du site » and returns their image hash (for figma-ledger.json « images »)."""
import json, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
from make_call import CALLS, next_index, guard_spaces
ids = json.load(open('/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/parcours/ids.json'))
FR = {'desktop': ['797:1125772', '809:468509'], 'mobile': ['796:1241722', '797:1241949']}
cmd = sys.argv[1]
for fmt, frames in FR.items():
    page = ids['pages'][fmt]
    if cmd == 'lookup':
        code = """// 42 Horizon — lecture seule (19 oct. 2026) : emplacements « à remplacer » des pages Compte en membre (plan des rues) ; rien n'est modifié
const page = await figma.getNodeByIdAsync('%s');
await figma.setCurrentPageAsync(page);
const out = {};
for (const id of %s) {
  const f = await figma.getNodeByIdAsync(id);
  if (!f) { out[id] = 'absent'; continue; }
  out[id] = { name: f.name, parent: f.parent && f.parent.name, places: f.findAll(n => n.name.endsWith(' · à remplacer')).map(n => [n.id, n.name, n.type, Math.round(n.width), Math.round(n.height), (n.fills || []).map(p => p.type)]) };
}
return out;""" % (page, json.dumps(frames))
        f = CALLS / ('%d-lecture-plan-compte-%s.js' % (next_index(), fmt))
    else:
        nodes = json.loads(sys.argv[2])[fmt]
        hashes = json.loads(sys.argv[3])[fmt] if len(sys.argv) > 3 else [None] * len(nodes)
        # 23 Oct.: upload_assets had answered « success » with the hash, but the four layers had no image a few minutes later
        # (1961, 1962): the image is laid by its hash when the layer has none, as render.js lays the other street maps
        code = """// 42 Horizon — plan des rues des pages Compte en membre (23 oct. 2026) : chaque emplacement reçoit l'image envoyée par upload_assets (par son empreinte, s'il ne l'a pas encore) et prend le nom des autres plans, « Plan du campus · carte du site » ; rien d'autre ne change
const page = await figma.getNodeByIdAsync('%s');
await figma.setCurrentPageAsync(page);
const N = %s;
const out = {};
for (const [id, hash] of N) {
  const n = await figma.getNodeByIdAsync(id);
  if (!n) { out[id] = 'absent'; continue; }
  let img = (n.fills || []).find(p => p.type === 'IMAGE');
  if (!img && hash) {
    if (!figma.getImageByHash(hash)) { out[id] = { name: n.name, image: null, unknownHash: hash }; continue; }
    n.fills = [{ type: 'IMAGE', imageHash: hash, scaleMode: 'FILL' }];
    img = n.fills[0];
  }
  if (!img) { out[id] = { name: n.name, image: null }; continue; }
  n.name = 'Plan du campus · carte du site';
  out[id] = { name: n.name, image: img.imageHash, scaleMode: img.scaleMode };
}
return out;""" % (page, json.dumps(list(zip(nodes, hashes))))
        f = CALLS / ('%d-plan-compte-%s.js' % (next_index(), fmt))
    f.write_text(guard_spaces(code)); print(f.name, len(code))
