"""Summary of the preparation checks (reads the results files of this folder, writes results-bilan.json).
python3 -I bilan.py"""
import hashlib, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PKG = HERE.parents[2] / 'integration-20261015'
eq = json.loads((HERE / 'results-equivalence.json').read_text(encoding='utf-8'))
src = json.loads((HERE / 'results-source.json').read_text(encoding='utf-8'))
now = json.loads((HERE / 'results-etat-actuel.json').read_text(encoding='utf-8'))

positive, controls, noise, earlier = [], [], [], []
for name, v in eq.items():
    if 'comparison' not in v: positive.append({'view': name, 'error': v.get('error')}); continue
    steps = [{'step': s['step'], 'pixels': s.get('pixelsDiffer'), 'dom': s['domMismatches'], 'styles': s['styleMismatches'], 'extras': s['extrasEqual'],
              'errors': len(s['errors']['essais']) + len(s['errors']['paquet']), 'elements': s['elements'][0]} for s in v['comparison']['steps']]
    row = {'view': name, 'identical': v['comparison']['identical'], 'steps': steps}
    if name.startswith('controle-'): controls.append(row)
    elif name.startswith(('bruit-', 'reprise-')): noise.append(row)
    elif 'menu-ferme' in name: earlier.append(row)
    else: positive.append(row)
states = sum(len(r['steps']) for r in positive if 'steps' in r)
exact = [r['view'] for r in positive if r.get('identical')]
residual = [{'view': r['view'], 'steps': r['steps']} for r in positive if not r.get('identical')]
summary = {
    'package': {f.name: {'bytes': f.stat().st_size, 'sha256': hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(PKG.glob('design-review-selection.*'))},
    'sourceChecks': {'passed': src['passed'], 'rulesEqualAfterUndo': src['rules']['equalAfterUndo'], 'conditions': src['specificity']['count'],
                     'conditionSpecificitySame': src['specificity']['allSame'], 'renamedSelectors': src['renamedSelectors']['count'],
                     'renamedSpecificitySame': src['renamedSelectors']['allSame'], 'moduleCopyIdentical': src['module']['copyByteIdentical'],
                     'canonicalOrder': src['canonicalOrder']['bootJs']},
    'equivalence': {'views': len(positive), 'states': states, 'identicalViews': len(exact), 'residual': residual,
                    'allDomStylesExtrasEqual': all(s['dom'] == 0 and s['styles'] == 0 and s['extras'] and s['errors'] == 0 for r in positive if 'steps' in r for s in r['steps']),
                    'negativeControls': controls, 'noiseControls': noise, 'firstPassClosedMenu': earlier},
    'currentOriginal': {name: {'state': v['originalState']['controller'], 'preview': v['originalState']['preview'], 'unchanged': v['originalUnchangedDuringView'],
                               'paquetVsEssais': {k: v['paquetVsEssais'][k] for k in ('pixelsDiffer', 'domMismatches', 'styleMismatches', 'firstStyle')},
                               'paquetVsOriginal': {k: v['paquetVsOriginal'][k] for k in ('pixelsDiffer', 'styleMismatches')},
                               'contrasts': v['contrasts'], 'errors': [len(s['errors']) for s in v['sides'].values()]} for name, v in now.items()},
}
(HERE / 'results-bilan.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(json.dumps({'views': len(positive), 'states': states, 'identicalViews': len(exact), 'residual': [(r['view'], [(s['step'], s['pixels']) for s in r['steps']]) for r in residual],
                  'allDomStylesExtrasEqual': summary['equivalence']['allDomStylesExtrasEqual'],
                  'controls': [(c['view'], c['identical']) for c in controls], 'noise': [(n['view'], [s['pixels'] for s in n['steps']]) for n in noise]}, ensure_ascii=False, indent=1))
