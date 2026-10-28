"""Trial titres-marque: header wordmark (FR/AR, light/dark, desktop/mobile, during HORIZON <-> AWARDS)
and the arrival slogan after a simulated sign-in. Run: python3 -I studies/design-review-studies/checks/titres-marque/check.py [header] [transition] [arrival] [runtime]
(stages left out keep their previous results)."""
import base64, json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, image_diff
from PIL import Image
import numpy as np

ID = 'titres-marque'
# Wordmark geometry: computed font, controller width vs the same word laid out by the DOM, cells and header boxes.
WORDMARK_JS = r'''(()=>{const w=document.getElementById('brand-wordmark'),s=getComputedStyle(w),brand=document.querySelector('.header .brand').getBoundingClientRect(),util=document.querySelector('.header .utilities').getBoundingClientRect(),ar=document.querySelector('.arabic-brand'),as=getComputedStyle(ar);
const probe=document.createElement('span');probe.style.cssText=`position:absolute;visibility:hidden;white-space:pre;font:${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily};letter-spacing:${s.letterSpacing}`;probe.textContent=w.dataset.wordmarkTarget||'HORIZON';document.body.append(probe);const dom=probe.getBoundingClientRect().width;probe.remove();
const cells=[...w.querySelectorAll('.brand-wordmark-cell')].filter(c=>Number(c.style.opacity)>.5).map(c=>{const r=c.getBoundingClientRect();return{t:c.textContent,l:Math.round(r.left*10)/10,r:Math.round(r.right*10)/10,top:Math.round(r.top),b:Math.round(r.bottom)}});
const rect=w.getBoundingClientRect(),inter=(a,b)=>a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom;
return {text:w.dataset.wordmarkText,target:w.dataset.wordmarkTarget,phase:w.dataset.wordmarkPhase,font:`${s.fontStyle} ${s.fontWeight} ${s.fontSize}`,letterSpacing:s.letterSpacing,controllerWidth:Math.round(parseFloat(w.style.width)*100)/100,domWidth:Math.round(dom*100)/100,
 box:{l:Math.round(rect.left),r:Math.round(rect.right),t:Math.round(rect.top),b:Math.round(rect.bottom)},cells,brandHitsUtilities:inter(brand,util),inViewport:rect.left>=0&&rect.right<=innerWidth,
 arabic:{display:as.display,weight:as.fontWeight,synthesis:as.fontSynthesisWeight,family:as.fontFamily,size:as.fontSize},overflow:document.documentElement.scrollWidth>innerWidth+1,headerBottom:Math.round(document.querySelector('.header').getBoundingClientRect().bottom)}})()'''

def platform_fonts(s, selector):
    s.c.call('DOM.enable'); s.c.call('CSS.enable')
    root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    node = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': selector})['nodeId']
    if not node: return None
    return [{k: f.get(k) for k in ('familyName', 'postScriptName', 'isCustomFont', 'glyphCount')} for f in s.c.call('CSS.getPlatformFontsForNode', {'nodeId': node})['fonts']]

def crop(src, box, name, scale):
    Image.open(src).crop(tuple(int(v * scale) for v in box)).save(HERE / name); return HERE / name

def ink(path):
    """Share of pixels far from the median background colour (more ink = heavier letters)."""
    x = np.asarray(Image.open(path).convert('L'), dtype=int)
    return float((np.abs(x - np.median(x)) > 60).mean())

STAGES = sys.argv[1:] or ['header', 'transition', 'arrival', 'runtime']
PREVIOUS = json.loads((HERE / 'results.json').read_text()) if (HERE / 'results.json').exists() else {}
results = {'id': ID, 'header': [], 'transition': {}, 'arrival': [], 'passed': False}
for stage in ('header', 'transition', 'arrival', 'runtime'):
    if stage not in STAGES and stage in PREVIOUS: results[stage] = PREVIOUS[stage]
VIEWS = [('ordinateur', 'light', 'fr', D), ('sombre-mobile', 'dark', 'fr', M), ('ar-mobile', 'light', 'ar', M), ('ar-sombre-ordinateur', 'dark', 'ar', D), ('petit', 'light', 'en', S)]
if 'header' in STAGES:
    s = Session(HERE)
    try:
        for vue, theme, lang, vp in VIEWS:
            scale = 2 if vp[2] else 1; case = {'vue': vue, 'theme': theme, 'lang': lang, 'viewport': vp[:2]}
            for label, essais in [('avant', []), ('apres', [ID])]:
                s.open('projects', essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
                full = s.shot(f'{label}-{vue}'); state = s.js(WORDMARK_JS)
                state['wordmarkFonts'] = platform_fonts(s, '#brand-wordmark .brand-wordmark-cell')
                state['arabicFonts'] = platform_fonts(s, '.arabic-brand') if lang == 'ar' else None
                state['errors'] = s.errors(); case[label] = state
                crop(full, (0, 0, vp[0], state['headerBottom']), f'{label}-entete-{vue}.png', scale)
                # Everything below the header must be identical.
                crop(full, (0, state['headerBottom'], vp[0], vp[1]), f'_rest-{label}.png', scale)
            case['restDiff'] = round(image_diff(HERE / '_rest-avant.png', HERE / '_rest-apres.png'), 5)
            results['header'].append(case); s.record(vue, {k: case[k] for k in ('restDiff',)} | {'avant': case['avant']['font'], 'apres': case['apres']['font'], 'widths': [case['apres']['controllerWidth'], case['apres']['domWidth']], 'fonts': case['apres']['wordmarkFonts'], 'arabic': case['apres']['arabicFonts']})
    finally:
        s.close()
        for f in HERE.glob('_rest-*.png'): f.unlink()

# HORIZON -> AWARDS -> HORIZON with real motion, before/after, desktop FR and mobile AR dark.
if 'transition' in STAGES:
    s = Session(HERE)
    try:
        s.reduced(False)
        for vue, theme, lang, vp in [('ordinateur', 'light', 'fr', D), ('ar-sombre-mobile', 'dark', 'ar', M)]:
            scale = 2 if vp[2] else 1
            for label, essais in [('avant', []), ('apres', [ID])]:
                s.open('projects', essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=True)
                frames = []
                for target in ['awards', 'projects']:
                    s.js(f'(()=>{{location.hash="#{target}";return true}})()'); start = time.time()
                    for i in range(9):
                        time.sleep(.14); st = s.js(WORDMARK_JS)
                        frames.append({'to': target, 't': round(time.time() - start, 2), 'text': st['text'], 'phase': st['phase'], 'width': st['controllerWidth'], 'box': st['box'],
                                       'inViewport': st['inViewport'], 'brandHitsUtilities': st['brandHitsUtilities'], 'overflow': st['overflow'],
                                       'cellsTop': min([c['top'] for c in st['cells']] or [0]), 'cellsBottom': max([c['b'] for c in st['cells']] or [0])})
                        if target == 'awards' and i in (2, 4): crop(s.shot(f'_mid'), (0, 0, vp[0], st['headerBottom']), f'{label}-transition-{vue}-{i}.png', scale)
                    time.sleep(1.2); st = s.js(WORDMARK_JS)
                    frames.append({'to': target, 'settled': True, 'text': st['text'], 'phase': st['phase'], 'width': st['controllerWidth'], 'domWidth': st['domWidth'], 'cells': st['cells']})
                    if target == 'awards': crop(s.shot('_mid'), (0, 0, vp[0], st['headerBottom']), f'{label}-awards-{vue}.png', scale)
                results['transition'][f'{vue}-{label}'] = {'frames': frames, 'errors': s.errors()}
                s.record(f'transition-{vue}-{label}', [(f.get('t'), f['text'], f['phase'], f['width']) for f in frames])
    finally:
        s.close()
        (HERE / '_mid.png').unlink(missing_ok=True)

# Arrival: scan before sign-in (must not change), decryption and slogan after a simulated sign-in.
# Draw-level instrumentation of the scene canvas: BOTTOM is installed before early.js and sees the image
# actually drawn; TOP is added once the scan is over and sees the image the baseline asked for.
BOTTOM = r"""(()=>{const proto=CanvasRenderingContext2D.prototype,base=proto.drawImage;window.__qaLog=[];window.__qaShots={};
 const edge=c=>{try{const g=c.getContext('2d'),h=c.height,w=c.width;let m=0;for(const x of [0,1,w-2,w-1]){const d=g.getImageData(x,0,1,h).data;for(let i=3;i<d.length;i+=4)m=Math.max(m,d[i])}return m}catch(e){return -1}};
 proto.drawImage=function(image,...rest){const scene=this.canvas?.parentElement,entry=document.body?.dataset.entry;
  if(scene&&scene.id==='entrance-scene'&&window.__qaTop&&['decrypting','slogan','opening'].includes(entry)){
   const swapped=image!==window.__qaIn;
   window.__qaLog.push([entry,scene.dataset.phase||'',swapped?1:0,swapped?edge(image):0,Math.abs(rest[2]/image.width-window.__qaInScale)<1e-6&&Math.abs(rest[0]+rest[2]/2-window.__qaInCx)<1e-6?1:0]);
   if(!window.__qaShots.first){window.__qaShots.first='pending';const canvas=this.canvas;requestAnimationFrame(()=>{window.__qaShots.first=canvas.toDataURL('image/png')})}}
  return base.call(this,image,...rest)}})()"""
TOP = r"""(()=>{const proto=CanvasRenderingContext2D.prototype,base=proto.drawImage;proto.drawImage=function(image,...rest){window.__qaIn=image;window.__qaInScale=rest[2]/image.width;window.__qaInCx=rest[0]+rest[2]/2;return base.call(this,image,...rest)};window.__qaTop=true;return true})()"""


def draws(log):
    """Per (entry, previous renderer phase): draws and replaced sprites; twin edge ink and glyph scale/centre kept."""
    out = {}
    for entry, phase, swapped, edge, same in log:
        k = out.setdefault(f'{entry}/{phase}', {'draws': 0, 'replaced': 0})
        k['draws'] += 1; k['replaced'] += swapped
    return {'byPhase': out, 'replaced': sum(x[2] for x in log), 'twinEdgeInkMax': max([x[3] for x in log if x[2]] or [0]),
            'scaleOrCentreChanged': sum(1 for x in log if x[2] and not x[4]),
            # The first frame after the sign-in (13 letters, spaces skipped) is the cipher at the scan's end.
            'firstFrameReplaced': sum(x[2] for x in log[:len('BEYONDTHECODE')]),
            # For information: replaced sprites in frames whose previous renderer phase was the scan or the cipher pause.
            'replacedInCipherFrames': sum(x[2] for x in log if x[0] == 'decrypting' and x[1] in ('scan-up', 'cipher'))}


def first_frame(s, name):
    data = s.js('window.__qaShots&&window.__qaShots.first')
    if data and data.startswith('data:image/png;base64,'):
        (HERE / name).write_bytes(base64.b64decode(data.split(',', 1)[1])); return True
    return False


if 'arrival' in STAGES:
    s = Session(HERE)
    try:
        s.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': BOTTOM})
        runs = [('ordinateur', 'light', D, False), ('sombre-mobile', 'dark', M, False), ('reduit-ordinateur', 'light', D, True)]
        for vue, theme, vp, reduced in runs:
            s.reduced(reduced)
            scale = 2 if vp[2] else 1; case = {'vue': vue, 'theme': theme, 'viewport': vp[:2], 'reducedMotion': reduced}
            for label, essais in [('avant', []), ('apres', [ID])]:
                s.open('', essais=essais, theme=theme, lang='fr', viewport=vp, block_globe=True, page='index.html', settle=.3)
                ok = s.wait('document.body.dataset.entry==="encrypted"', 25)
                # The canvas only: the cycling Se connecter / Visiter labels below it are left out of the crop.
                scene = s.js('(()=>{const r=document.getElementById("entrance-scene").getBoundingClientRect(),a=document.getElementById("entrance-access").getBoundingClientRect();return[r.left,r.top,r.right,Math.min(r.bottom,a.top-4)].map(Math.round)})()')
                crop(s.shot('_full'), scene, f'_{label}-chiffre.png', scale)
                s.js(TOP)
                s.click('#entry-login'); s.wait('document.querySelector("#dialog")?.open', 5)
                s.click('#dialog-content button'); s.wait('document.body.dataset.entry!=="encrypted"', 5)
                if not reduced:
                    s.wait('document.body.dataset.entry==="decrypting"', 5); time.sleep(2.2)
                    crop(s.shot('_full'), scene, f'{label}-arrivee-dechiffrement-{vue}.png', scale)
                if reduced:
                    # The baseline skips the slogan hold when motion is reduced (animate() returns at once): only the draws count.
                    s.wait('!["decrypting","slogan","opening"].includes(document.body.dataset.entry)', 6); time.sleep(.3)
                    case[label] = {'scanReady': ok, 'entryAfter': s.js('document.body.dataset.entry'), 'rendered': s.js('document.getElementById("entrance-scene").dataset.renderedText'),
                                   'draws': draws(s.js('window.__qaLog') or []), 'errors': s.errors()}
                    continue
                reached = s.wait('document.body.dataset.entry==="slogan"', 6); time.sleep(.25)
                full = s.shot(f'{label}-arrivee-slogan-{vue}'); crop(full, scene, f'{label}-slogan-{vue}.png', scale)
                first_frame(s, f'_{label}-premiere-image.png')
                case[label] = {'scanReady': ok, 'sloganReached': reached, 'rendered': s.js('document.getElementById("entrance-scene").dataset.renderedText'),
                               'ink': round(ink(HERE / f'{label}-slogan-{vue}.png'), 5), 'draws': draws(s.js('window.__qaLog') or []), 'errors': s.errors()}
            case['scanDiff'] = round(image_diff(HERE / '_avant-chiffre.png', HERE / '_apres-chiffre.png'), 5)
            if not reduced:
                # First frame drawn after the sign-in: the cipher kept for a quarter second before the letters turn.
                case['firstFrameDiff'] = round(image_diff(HERE / '_avant-premiere-image.png', HERE / '_apres-premiere-image.png'), 5) if (HERE / '_apres-premiere-image.png').exists() and (HERE / '_avant-premiere-image.png').exists() else None
                case['sloganDiff'] = round(image_diff(HERE / f'avant-slogan-{vue}.png', HERE / f'apres-slogan-{vue}.png'), 5)
                Image.open(HERE / '_avant-chiffre.png').save(HERE / f'avant-arrivee-chiffree-{vue}.png'); Image.open(HERE / '_apres-chiffre.png').save(HERE / f'apres-arrivee-chiffree-{vue}.png')
            results['arrival'].append(case); s.record('arrivee-' + vue, {k: case.get(k) for k in ('scanDiff', 'firstFrameDiff', 'sloganDiff')} | {x: {'rendered': case[x]['rendered'], 'ink': case[x].get('ink'), 'draws': {k: v for k, v in case[x]['draws'].items() if k != 'byPhase'}} for x in ('avant', 'apres')})
            for f in HERE.glob('_*-premiere-image.png'): f.unlink()
    finally:
        s.close()
        for f in ['_full.png', '_avant-chiffre.png', '_apres-chiffre.png', '_avant-slogan-full.png', '_apres-slogan-full.png']: (HERE / f).unlink(missing_ok=True)

# Cold first load straight into the trial, then language/theme switches and a resize without reload:
# the controller must keep measuring the heavy italic face (fonts.ready, resize, re-render).
if 'runtime' in STAGES:
    s = Session(HERE)
    try:
        steps = []
        s.open('projects', essais=[ID], theme='light', lang='fr', viewport=D, block_globe=True, settle=.6); steps.append(['fr clair 1440 (premier chargement)', s.js(WORDMARK_JS)])
        s.settings('ar', 'dark'); s.wait('document.documentElement.lang==="ar"', 10); time.sleep(.8); steps.append(['ar sombre 1440', s.js(WORDMARK_JS)])
        s.viewport(*M); time.sleep(1); steps.append(['ar sombre 390', s.js(WORDMARK_JS)])
        s.js('(()=>{location.hash="#awards";return true})()'); time.sleep(1.6); steps.append(['ar sombre 390 awards', s.js(WORDMARK_JS)])
        s.settings('fr', 'light'); s.wait('document.documentElement.lang==="fr"', 10); time.sleep(.8); steps.append(['fr clair 390 awards', s.js(WORDMARK_JS)])
        results['runtime'] = {'steps': [[name, {k: st[k] for k in ('text', 'font', 'controllerWidth', 'domWidth', 'arabic', 'overflow', 'brandHitsUtilities', 'inViewport')}] for name, st in steps], 'errors': s.errors()}
        for name, st in results['runtime']['steps']: s.record('runtime ' + name, st)
    finally:
        s.close()

head_ok = all(c['restDiff'] == 0 and c['apres']['font'].startswith('italic 800') and c['avant']['font'].startswith('normal 500') and abs(c['apres']['controllerWidth'] - c['apres']['domWidth']) < 1
              and not c['apres']['overflow'] and not c['apres']['brandHitsUtilities'] and c['apres']['inViewport'] and not c['apres']['errors'] for c in results['header'])
trans_ok = all(not any(f.get('overflow') or f.get('brandHitsUtilities') or f.get('inViewport') is False for f in t['frames']) and not t['errors'] and
               [f['text'] for f in t['frames'] if f.get('settled')] == ['AWARDS', 'HORIZON'] for t in results['transition'].values())
motion_ok = lambda c: c['apres']['sloganReached'] and c['sloganDiff'] > 0 and c['apres']['ink'] > c['avant']['ink'] and c['firstFrameDiff'] == 0
# Reduced motion: one cipher frame then the final frame, whose 13 letters (spaces excluded) are all replaced.
reduced_ok = lambda c: c['apres']['draws']['replaced'] == len('BEYONDTHECODE')
arr_ok = bool(results['arrival']) and all(c['scanDiff'] == 0 and c['apres']['rendered'] == 'BEYOND THE CODE' and (reduced_ok(c) if c.get('reducedMotion') else motion_ok(c))
             and c['apres']['draws']['replaced'] > 0 and c['avant']['draws']['replaced'] == 0 and c['apres']['draws']['twinEdgeInkMax'] == 0 and c['apres']['draws']['scaleOrCentreChanged'] == 0
             and c['apres']['draws']['firstFrameReplaced'] == 0 and not c['apres']['errors'] for c in results['arrival'])
rt = results.get('runtime')
# The baseline shows the Arabic line for HORIZON in Arabic only, never next to AWARDS.
run_ok = bool(rt) and not rt['errors'] and all(st['font'].startswith('italic 800') and abs(st['controllerWidth'] - st['domWidth']) < 1 and not st['overflow'] and not st['brandHitsUtilities'] and st['inViewport']
                                             and st['arabic']['weight'] == '700' and (st['arabic']['display'] == 'block') == (name.startswith('ar') and st['text'] == 'HORIZON') for name, st in rt['steps'])
results['checks'] = {'header': head_ok, 'transition': trans_ok, 'arrival': arr_ok, 'runtime': run_ok}
results['passed'] = bool(head_ok and trans_ok and arr_ok and run_ok)
(HERE / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
print('checks', results['checks'], 'passed', results['passed'])
