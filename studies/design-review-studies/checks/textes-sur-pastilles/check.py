"""Essai textes-sur-pastilles: texts over the map keep >= 4.5:1 on an opaque pill; nothing moves.
Run: python3 -I checks/textes-sur-pastilles/check.py [part ...]
Parts: contrast (real globe, World then France, light/dark, 1440x900 and 390x844, plus 667x375 light), paysage (that last case only), arabic, layout, focus,
campus (42 Paris campus level, light then dark set without reload, before/after), live (World: FR light, then AR dark and EN light without reload), verdict.
Pixel-sampled contrast: one screenshot with the texts, one with only those texts made transparent;
glyph pixels are where the two differ, and each is compared with the background pixel behind it."""
import base64, io, json, math, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, contrast

ID = 'textes-sur-pastilles'
RESULTS = HERE / 'results.json'
SCRATCH = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/2cf0c114-786b-4a24-866f-57822e04403f/scratchpad/agents/explorer/pastilles')
SCRATCH.mkdir(parents=True, exist_ok=True)
TEXTS = {'stats': '#globe-hint', 'status': '#about', 'filter': '#scope-name', 'ancestor': '#scope-world-name', 'countryAncestor': '#scope-country-name', 'retry': '#campus-retry'}
INFO = '''(sels=>{const out={};const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d',{willReadFrequently:true});
 for(const [k,sel] of Object.entries(sels)){const e=document.querySelector(sel);if(!e){out[k]=null;continue;}
  const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  x.clearRect(0,0,1,1);x.fillStyle=s.color;x.fillRect(0,0,1,1);const d=x.getImageData(0,0,1,1).data;
  const shown=s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0&&!e.closest('[hidden]');
  out[k]={left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown,text:e.textContent.trim(),color:[d[0],d[1],d[2],d[3]],font:s.fontFamily.split(',')[0],size:s.fontSize};}
 return out;})'''


def load():
    try: return json.loads(RESULTS.read_text())
    except Exception: return {'trial': ID}


def save(part, value):
    data = load(); data[part] = value; RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')


def session(block):
    for attempt in (1, 2):
        s = None
        try:
            s = Session(HERE); return block(s)
        except (RuntimeError, TimeoutError) as error:
            print('session error', attempt, error, flush=True)
            if attempt == 2: raise
        finally:
            if s: s.close()


def capture(s):
    from PIL import Image
    data = s.c.call('Page.captureScreenshot', {'format': 'png'}, timeout=60)['data']
    return Image.open(io.BytesIO(base64.b64decode(data))).convert('RGB')


def sample(with_text, without, box, dpr, color):
    """Worst and 5th-percentile contrast between the text colour and the background behind its glyphs."""
    import numpy as np
    x0, y0 = max(0, math.floor(box['left'] * dpr)), max(0, math.floor(box['top'] * dpr))
    x1, y1 = math.ceil(box['right'] * dpr), math.ceil(box['bottom'] * dpr)
    a = np.asarray(with_text.crop((x0, y0, x1, y1)), dtype=float); b = np.asarray(without.crop((x0, y0, x1, y1)), dtype=float)
    mask = np.abs(a - b).sum(axis=2) > 30
    if not mask.any(): return {'glyphPixels': 0}
    alpha = color[3] / 255
    def ratio(bg):
        fg = [alpha * color[i] + (1 - alpha) * bg[i] for i in range(3)]
        return contrast(fg, bg)
    behind = b[mask]
    ratios = sorted(ratio(px) for px in behind[:: max(1, len(behind) // 4000)])
    box_all = b.reshape(-1, 3)
    box_ratios = sorted(ratio(px) for px in box_all[:: max(1, len(box_all) // 4000)])
    return {'glyphPixels': int(mask.sum()), 'min': round(ratios[0], 2), 'p5': round(ratios[len(ratios) // 20], 2), 'median': round(ratios[len(ratios) // 2], 2),
            'boxMin': round(box_ratios[0], 2), 'textColor': color}


def measure(s, label, dpr, keys, shot=None):
    info = s.js(INFO + '(' + json.dumps({k: TEXTS[k] for k in keys}) + ')')
    first = capture(s)
    if shot: first.save(HERE / (shot + '.png'))
    shown = [k for k in keys if info.get(k) and info[k]['shown']]
    s.js('(sels=>{for(const sel of sels){const e=document.querySelector(sel);if(e)e.style.setProperty("color","transparent","important")}return true})(' + json.dumps([TEXTS[k] for k in shown]) + ')')
    time.sleep(.4); second = capture(s)
    s.js('(sels=>{for(const sel of sels){const e=document.querySelector(sel);if(e)e.style.removeProperty("color")}return true})(' + json.dumps([TEXTS[k] for k in shown]) + ')')
    first.save(SCRATCH / (label + '-texte.png')); second.save(SCRATCH / (label + '-fond.png'))
    out = {}
    for k in keys:
        if not info.get(k) or not info[k]['shown']: out[k] = {'shown': False}; continue
        out[k] = {'text': info[k]['text'], 'font': info[k]['font'], 'size': info[k]['size'], 'rect': [round(info[k][v], 1) for v in ('left', 'top', 'right', 'bottom')]}
        out[k].update(sample(first, second, info[k], dpr, info[k]['color']))
    return out


def page(s, vp, essais, theme, lang='fr', tag=''):
    """World then France in one page: the country view puts land behind every text."""
    dpr = 2 if vp[2] else 1
    s.open('explore', essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=False)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
    world = measure(s, f'{tag}-monde', dpr, ['stats', 'status', 'filter'], shot=tag + '-monde' if tag else None)
    s.js('window.horizonStudy.globe.selectCountry("FRA"),true')
    s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(3)
    country = measure(s, f'{tag}-pays', dpr, ['stats', 'status', 'filter', 'ancestor'], shot=tag + '-pays' if tag else None)
    # Failure state of a campus load, simulated in the page only: the retry button sits under the hint.
    s.js('(()=>{const r=document.getElementById("campus-retry");r.hidden=false;r.textContent=r.textContent||"Réessayer";return true})()'); time.sleep(.3)
    retry = measure(s, f'{tag}-reessayer', dpr, ['retry'])
    s.js('(()=>{document.getElementById("campus-retry").hidden=true;return true})()')
    return {'world': world, 'country': country, 'retry': retry['retry'], 'errors': s.errors(), 'overflow': s.overflow()}


CASES = [('ordinateur', D, 'light'), ('sombre-ordinateur', D, 'dark'), ('mobile', M, 'light'), ('sombre-mobile', M, 'dark'), ('paysage', L, 'light')]


def part_contrast(only=None):
    out = load().get('contrast', {})
    for name, vp, theme in CASES:
        if only and name not in only: continue
        def block(s):
            out[name] = {'avant': page(s, vp, [], theme, tag='avant-' + name), 'apres': page(s, vp, [ID], theme, tag='apres-' + name)}
        session(block)
        for side in ('avant', 'apres'):
            r = out[name][side]
            print(name, side, {lvl: {k: (v.get('min'), v.get('p5')) for k, v in r[lvl].items() if v.get('shown', True)} for lvl in ('world', 'country')}, 'retry', (r['retry'].get('min'),), 'errors', r['errors'], flush=True)
        save('contrast', out)


def part_arabic():
    out = {}
    def block(s):
        out['sombre-mobile-ar'] = {'avant': page(s, M, [], 'dark', 'ar', tag='avant-ar-mobile'), 'apres': page(s, M, [ID], 'dark', 'ar', tag='apres-ar-mobile')}
    session(block)
    for side in ('avant', 'apres'):
        r = out['sombre-mobile-ar'][side]
        print('ar', side, {lvl: {k: (v.get('min'), v.get('text')) for k, v in r[lvl].items() if v.get('shown', True)} for lvl in ('world', 'country')}, flush=True)
    save('arabic', out)


RECTS = '''(()=>{const r=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return [b.left,b.top,b.width,b.height].map(v=>Math.round(v*100)/100)};
 return {hint:r('#globe-hint'),status:r('#about'),statusBox:r('#globe-status'),filter:r('#scope-path'),scope:r('#scope-bar'),search:r('.dock-search-toggle'),dice:r('#random-campus'),
  overflow:document.documentElement.scrollWidth>innerWidth+1,dir:document.documentElement.dir,text:document.getElementById('globe-hint').textContent,
  pill:getComputedStyle(document.getElementById('globe-hint'),'::before').content,pillAbout:getComputedStyle(document.getElementById('about'),'::before').content}})()'''


def part_layout():
    """Positions in FR/EN/AR, light, at four sizes, with the globe blocked (layout does not depend on it)."""
    out = {}
    def block(s):
        for lang in ('fr', 'en', 'ar'):
            for name, vp in (('1440x900', D), ('390x844', M), ('320x640', S), ('667x375', L)):
                s.open('explore', lang=lang, viewport=vp, block_globe=True, settle=.4); before = s.js(RECTS)
                s.open('explore', essais=[ID], lang=lang, viewport=vp, block_globe=True, settle=.4); after = s.js(RECTS)
                delta = max(abs(a - b) for key in ('hint', 'status', 'statusBox', 'filter', 'scope', 'search', 'dice') if before[key] and after[key] for a, b in zip(before[key], after[key]))
                out[f'{lang}-{name}'] = {'maxRectDelta': round(delta, 2), 'overflow': [before['overflow'], after['overflow']], 'dir': after['dir'], 'text': after['text'],
                                         'pill': [before['pill'], after['pill']], 'pillAbout': [before['pillAbout'], after['pillAbout']], 'errors': s.errors()}
                print(lang, name, out[f'{lang}-{name}'], flush=True)
    session(block)
    save('layout', out)


def part_verdict():
    data = load()
    c = data.get('contrast', {}); a = data.get('arabic', {}); lay = data.get('layout', {})
    def texts_ok(side):
        """Every shown stats/status/retry text >= 4.5:1 at its worst glyph pixel, World and France."""
        vals = []
        for lvl in ('world', 'country'):
            for k in ('stats', 'status'):
                v = side[lvl].get(k, {})
                if v.get('shown', True) and 'min' in v: vals.append(v['min'])
        vals.append(side['retry'].get('min', 0))
        return min(vals) if vals else 0
    def filter_ok(side):
        vals = [side[lvl][k]['min'] for lvl in ('world', 'country') for k in ('filter', 'ancestor') if side[lvl].get(k, {}).get('min')]
        return min(vals) if vals else 0
    worst = {name: {'avant': texts_ok(v['avant']), 'apres': texts_ok(v['apres']), 'filterAvant': filter_ok(v['avant']), 'filterApres': filter_ok(v['apres'])} for name, v in list(c.items()) + list(a.items())}
    checks = {
        'textsAtLeast4.5': bool(worst) and all(w['apres'] >= 4.5 for w in worst.values()),
        'filterAtLeast4.5': bool(worst) and all(w['filterApres'] >= 4.5 for w in worst.values()),
        'positionsWithin1px': bool(lay) and all(v['maxRectDelta'] <= 1 for v in lay.values()),
        'noOverflow': bool(lay) and not any(v['overflow'][1] for v in lay.values()) and not any(side['overflow'] for v in list(c.values()) + list(a.values()) for side in v.values()),
        'rtlInArabic': bool(lay) and all(v['dir'] == 'rtl' for k, v in lay.items() if k.startswith('ar-')),
        'statusFocusVisible': all(load().get('focus', {}).get(k, {}).get('visible') for k in ('avant', 'apres')),
        'noConsoleErrors': not any(side['errors'] for v in list(c.values()) + list(a.values()) for side in v.values()) and not any(v['errors'] for v in lay.values()),
    }
    camp = data.get('campus', {}).get('apres')
    if camp:
        vals = [camp[t][k]['min'] for t in ('clair', 'sombre') for k in ('stats', 'status') if camp[t].get(k, {}).get('min')]
        checks['campusLevelHintAtLeast4.5'] = bool(vals) and min(vals) >= 4.5 and not camp['errors'] and not camp['overflow']
        trail = [camp[t][k]['min'] for t in ('clair', 'sombre') for k in ('filter', 'countryAncestor') if camp[t].get(k, {}).get('min')]
        checks['campusLevelFilterAtLeast4.5'] = bool(trail) and min(trail) >= 4.5
    live = data.get('live')
    if live:
        checks['liveLanguageAndThemeKeepPills'] = all(min(r[k]['min'] for k in ('stats', 'status')) >= 4.5 and not r['errors'] and r['lang'] == k2.split('-')[0] and r['theme'] == k2.split('-')[1]
                                                     for k2, r in live.items())
    data['worstContrast'] = worst; data['checks'] = checks; data['passed'] = all(checks.values())
    RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(worst, indent=1), json.dumps(checks, indent=1), 'passed', data['passed'], flush=True)


def part_focus():
    """Keyboard focus on the status button stays visible above its pill (globe blocked: layout only)."""
    out = {}
    def block(s):
        for label, essais in (('avant', []), ('apres', [ID])):
            s.open('explore', essais=essais, viewport=D, block_globe=True, settle=.4)
            for _ in range(40):
                s.key('Tab')
                if s.js('document.activeElement?.id') == 'about': break
            state = s.js('(()=>{const e=document.getElementById("about"),c=getComputedStyle(e);return {focused:document.activeElement===e,visible:e.matches(":focus-visible"),outline:c.outlineStyle+" "+c.outlineWidth+" "+c.outlineColor,name:e.textContent.trim()}})()')
            box = s.rect('#about'); s.shot(label + '-focus-statut')
            from PIL import Image
            # Keep only a 3x crop around the focused status: enough to see the ring over the pill.
            im = Image.open(HERE / (label + '-focus-statut.png')).crop((int(box['x']) - 24, int(box['y']) - 12, int(box['x'] + box['w']) + 24, int(box['y'] + box['h']) + 12))
            im.resize((im.width * 3, im.height * 3), Image.NEAREST).save(HERE / (label + '-focus-statut.png'))
            out[label] = state; print('focus', label, state, flush=True)
    session(block)
    save('focus', out)


def part_campus():
    """Campus-level variant of the hint ("Explore les alentours du campus.") over the street map, light then dark set live."""
    out = {}
    def block(s, side, essais):
        s.open('explore?country=FRA&campus=paris', essais=essais, viewport=D, block_globe=False)
        s.wait('document.getElementById("globe").dataset.level==="campus"', 30)
        s.wait('document.getElementById("globe-hint").textContent==="Explore les alentours du campus."', 60); time.sleep(3)
        res = {'clair': measure(s, f'{side}-campus-clair', 1, ['stats', 'status', 'filter', 'countryAncestor'], shot=f'{side}-campus-clair')}
        s.settings('fr', 'dark'); s.wait('document.documentElement.dataset.theme==="dark"', 10); time.sleep(2)
        res['sombre'] = measure(s, f'{side}-campus-sombre', 1, ['stats', 'status', 'filter', 'countryAncestor'], shot=f'{side}-campus-sombre')
        res['errors'] = s.errors(); res['overflow'] = s.overflow()
        out[side] = res
        print('campus', side, {t: {k: (v.get('min'), v.get('text')) for k, v in res[t].items() if v.get('shown', True)} for t in ('clair', 'sombre')}, res['errors'], flush=True)
    session(lambda s: block(s, 'avant', [])); session(lambda s: block(s, 'apres', [ID]))
    save('campus', out)


def part_live():
    """World, trial on: FR light, then AR dark and EN light through the account settings, without reloading.
    The pills follow the new theme and text; positions match a fresh load in the same state (layout part)."""
    out = {}
    def block(s):
        s.open('explore', essais=[ID], viewport=D, block_globe=False)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
        for index, (lang, theme) in enumerate((('fr', 'light'), ('ar', 'dark'), ('en', 'light'))):
            if index:
                s.settings(lang, theme)
                s.wait(f'document.documentElement.lang==={json.dumps(lang)}&&document.documentElement.dataset.theme==={json.dumps(theme)}', 10); time.sleep(1.5)
            res = measure(s, f'live-{lang}-{theme}', 1, ['stats', 'status'], shot='apres-ar-sombre-sans-rechargement' if index == 1 else None)
            res['rects'] = s.js(RECTS); res['theme'] = s.js('document.documentElement.dataset.theme'); res['lang'] = s.js('document.documentElement.lang')
            res['pillBackground'] = s.js('getComputedStyle(document.getElementById("globe-hint"),"::before").backgroundColor')
            res['errors'] = s.errors()
            out[f'{lang}-{theme}'] = res
            print('live', lang, theme, {k: (res[k].get('min'), res[k].get('text')) for k in ('stats', 'status')}, res['pillBackground'], res['rects']['dir'], flush=True)
    session(block)
    save('live', out)


PARTS = {'contrast': part_contrast, 'paysage': lambda: part_contrast(['paysage']), 'arabic': part_arabic, 'layout': part_layout, 'focus': part_focus,
         'campus': part_campus, 'live': part_live, 'verdict': part_verdict}
if __name__ == '__main__':
    for name in sys.argv[1:] or list(PARTS):
        print('==', name, flush=True); PARTS[name]()
