"""Essai police-etiquettes-globe: globe labels use the site stack (Jost; Arabic as elsewhere), family only.
Run: python3 -I checks/police-etiquettes-globe/check.py [part ...]
Parts: levels (real globe: World, France, 42 Paris, edge arrow; FR light and AR dark, before/after), mobile (390x844 World and France),
live (World, trial on: FR light, then AR dark and EN light set without reload; labels are rebuilt), verdict.
Rendered fonts come from CDP CSS.getPlatformFontsForNode, computed styles from getComputedStyle."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D

ID = 'police-etiquettes-globe'
RESULTS = HERE / 'results.json'
LABELS = '''(()=>{const all=[...document.querySelectorAll('#globe .hg-marker')].filter(b=>!b.hidden&&b.getClientRects().length);
 const pills=all.filter(b=>!b.classList.contains('hg-compact')),boxes=[];
 // Visible pill boxes: the button itself, or its absolutely placed label for the selected campus reticle.
 for(const b of pills){const l=b.querySelector('.hg-marker-label');const t=b.classList.contains('hg-target')?l:b;const r=t.getBoundingClientRect();
  if(r.width&&r.height&&getComputedStyle(l).display!=='none')boxes.push({text:l.textContent,l:r.left,t:r.top,r:r.right,b:r.bottom});}
 let pairs=0,area=0;for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],c=boxes[j];
  const w=Math.min(a.r,c.r)-Math.max(a.l,c.l),h=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(w>0&&h>0){pairs++;area+=w*h;}}
 const styles=[...new Set(pills.map(b=>{const s=getComputedStyle(b.querySelector('.hg-marker-label'));return JSON.stringify([s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.color,s.fontStyle])}))].map(x=>JSON.parse(x));
 const credit=getComputedStyle(document.querySelector('.map-credit'));
 return {level:document.getElementById('globe').dataset.level,lang:document.documentElement.lang,pills:boxes.length,compact:all.length-pills.length,
  overlapPairs:pairs,overlapArea:Math.round(area),labels:boxes.map(b=>b.text),styles,
  offscreen:Boolean(document.querySelector('#globe .hg-offscreen')),creditFont:[credit.fontFamily,credit.fontSize],
  overflow:document.documentElement.scrollWidth>innerWidth+1}})()'''


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


def platform(s, selector):
    """Fonts actually used to draw the text of every node matching selector, with glyph counts."""
    doc = s.c.call('DOM.getDocument', {'depth': 0})
    nodes = s.c.call('DOM.querySelectorAll', {'nodeId': doc['root']['nodeId'], 'selector': selector}).get('nodeIds', [])
    used = {}
    for node in nodes:
        try:
            for font in s.c.call('CSS.getPlatformFontsForNode', {'nodeId': node})['fonts']:
                used[font['familyName']] = used.get(font['familyName'], 0) + font['glyphCount']
        except RuntimeError: pass
    return used


def state(s, shot):
    data = s.js(LABELS)
    data['platform'] = platform(s, '#globe .hg-marker:not([hidden]) .hg-marker-label')
    data['errors'] = s.errors(); s.shot(shot)
    return data


def run(s, side, essais, theme, lang, tag):
    s.c.call('DOM.enable'); s.c.call('CSS.enable')
    s.open('explore', essais=essais, theme=theme, lang=lang, viewport=D, block_globe=False)
    s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
    out = {'monde': state(s, f'{side}-monde-{tag}')}
    s.js('window.horizonStudy.globe.selectCountry("FRA"),true')
    s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(3)
    out['pays'] = state(s, f'{side}-pays-{tag}')
    s.js('window.horizonStudy.globe.selectCampus("paris"),true')
    s.wait('document.getElementById("globe").dataset.level==="campus"', 20)
    s.wait('Boolean(document.querySelector("#globe .hg-target"))', 45); time.sleep(4)
    out['campus'] = state(s, f'{side}-campus-{tag}')
    # Pan with the globe's own arrow keys until the selected campus leaves the view: edge arrow and label.
    s.js('document.getElementById("globe").focus(),true')
    for _ in range(30):
        s.key('ArrowDown')
        if s.js('Boolean(document.querySelector("#globe .hg-offscreen"))'): break
    time.sleep(1.5); s.blur()
    out['bord'] = state(s, f'{side}-bord-{tag}')
    out['bord']['edgeLabel'] = s.js('(()=>{const l=document.querySelector("#globe .hg-offscreen .hg-marker-label");if(!l)return null;const c=getComputedStyle(l);return {text:l.textContent,display:c.display,font:[c.fontFamily,c.fontSize,c.fontWeight,c.color]}})()')
    out['bord']['edgePlatform'] = platform(s, '#globe .hg-offscreen .hg-marker-label')
    for level, data in out.items():
        print(side, tag, level, json.dumps({k: data[k] for k in ('level', 'pills', 'overlapPairs', 'overlapArea', 'platform', 'offscreen')}, ensure_ascii=False), flush=True)
    return out


def part_levels():
    out = load().get('levels', {})
    for tag, theme, lang in (('fr-clair', 'light', 'fr'), ('ar-sombre', 'dark', 'ar')):
        for side, essais in (('avant', []), ('apres', [ID])):
            out[f'{side}-{tag}'] = session(lambda s: run(s, side, essais, theme, lang, tag))
            save('levels', out)


def part_verdict():
    data = load(); lv = data.get('levels', {})
    def first(styles): return [st[0].split(',')[0].strip().strip('"') for st in styles]
    checks = {}
    for tag, lang in (('fr-clair', 'fr'), ('ar-sombre', 'ar')):
        before, after = lv.get('avant-' + tag, {}), lv.get('apres-' + tag, {})
        levels = [k for k in ('monde', 'pays', 'campus', 'bord') if k in after]
        checks[f'{tag}:computedStartsWithJost'] = all(f == 'Jost' for k in levels for f in first(after[k]['styles']))
        checks[f'{tag}:noHelveticaStackLeft'] = all('Helvetica' not in st[0] for k in levels for st in after[k]['styles'])
        checks[f'{tag}:sizeWeightColourUnchanged'] = all(sorted(map(tuple, (st[1:] for st in before[k]['styles']))) == sorted(map(tuple, (st[1:] for st in after[k]['styles']))) for k in levels if k in before)
        latin = all(set(after[k]['platform']) <= {'Jost', 'Jost Medium', 'Noto Sans Arabic'} for k in levels)
        checks[f'{tag}:renderedJostOrNotoArabic'] = latin
        checks[f'{tag}:overlapNotWorse'] = all(after[k]['overlapArea'] <= before[k]['overlapArea'] + 1 for k in levels if k in before)
        checks[f'{tag}:edgeLabelJost'] = bool(after.get('bord', {}).get('edgeLabel')) and after['bord']['edgeLabel']['font'][0].startswith('Jost')
        checks[f'{tag}:noOverflowNoErrors'] = not any(after[k]['overflow'] or after[k]['errors'] for k in levels)
    if 'apres-ar-sombre' in lv:
        # Arabic country names appear at World level; France shows Latin campus names in every language.
        checks['ar:arabicGlyphsInNotoSansArabic'] = lv['apres-ar-sombre']['monde']['platform'].get('Noto Sans Arabic', 0) > 0
        checks['sameVisibleLabels'] = all(lv['avant-' + tag][k]['labels'] == lv['apres-' + tag][k]['labels'] for tag in ('fr-clair', 'ar-sombre') for k in ('monde', 'pays', 'campus', 'bord'))
    mob = data.get('mobile', {})
    if mob:
        checks['mobile:jostNoOverlapNoOverflow'] = all(mob['apres'][k]['styles'][0][0].startswith('Jost') and mob['apres'][k]['overlapArea'] <= mob['avant'][k]['overlapArea'] + 1 and not mob['apres'][k]['overflow'] and not mob['apres'][k]['errors'] for k in ('monde', 'pays'))
        checks['mobile:everyLabelIncludingCompact'] = mob['apres']['monde'].get('allLabelFamilies') == ['Jost, sans-serif']
    live = data.get('live')
    if live:
        checks['live:frArEnWithoutReloadKeepSiteStack'] = all(v['allLabelFamilies'] == ['Jost, sans-serif'] and v['lang'] == k.split('-')[0] and v['theme'] == k.split('-')[1]
                                                            and set(v['platform']) <= {'Jost', 'Jost Medium', 'Noto Sans Arabic'} and not v['errors'] and not v['overflow'] for k, v in live.items())
    data['checks'] = checks; data['passed'] = bool(checks) and all(checks.values())
    RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(checks, indent=1), 'passed', data['passed'], flush=True)


def part_mobile():
    """390x844 FR light, World and France: same family switch at the mobile 12 px size."""
    from helper import M
    out = load().get('mobile', {})
    def run_mobile(s, side, essais):
        s.c.call('DOM.enable'); s.c.call('CSS.enable')
        s.open('explore', essais=essais, viewport=M, block_globe=False)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
        res = {'monde': state(s, f'{side}-monde-mobile')}
        res['monde']['allLabelFamilies'] = s.js('[...new Set([...document.querySelectorAll("#globe .hg-marker-label")].map(l=>getComputedStyle(l).fontFamily))]')
        s.js('window.horizonStudy.globe.selectCountry("FRA"),true')
        s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(3)
        res['pays'] = state(s, f'{side}-pays-mobile')
        return res
    for side, essais in (('avant', []), ('apres', [ID])):
        out[side] = session(lambda s: run_mobile(s, side, essais))
        for lvl, data in out[side].items():
            print('mobile', side, lvl, json.dumps({k: data.get(k) for k in ('pills', 'overlapPairs', 'overlapArea', 'platform', 'overflow', 'allLabelFamilies', 'styles')}, ensure_ascii=False), flush=True)
    save('mobile', out)


def part_live():
    """Markers are rebuilt on a language change (refreshLabels): they must keep the site stack, FR -> AR dark -> EN."""
    out = {}
    def block(s):
        s.c.call('DOM.enable'); s.c.call('CSS.enable')
        s.open('explore', essais=[ID], viewport=D, block_globe=False)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1)
        for index, (lang, theme) in enumerate((('fr', 'light'), ('ar', 'dark'), ('en', 'light'))):
            if index:
                s.settings(lang, theme)
                s.wait(f'document.documentElement.lang==={json.dumps(lang)}&&document.documentElement.dataset.theme==={json.dumps(theme)}', 10); time.sleep(1.5)
            data = s.js(LABELS)
            data['allLabelFamilies'] = s.js('[...new Set([...document.querySelectorAll("#globe .hg-marker-label")].map(l=>getComputedStyle(l).fontFamily))]')
            data['platform'] = platform(s, '#globe .hg-marker:not([hidden]) .hg-marker-label')
            data['theme'] = s.js('document.documentElement.dataset.theme'); data['errors'] = s.errors()
            if index == 1: s.shot('apres-monde-ar-sombre-sans-rechargement')
            out[f'{lang}-{theme}'] = data
            print('live', lang, theme, json.dumps({k: data.get(k) for k in ('lang', 'theme', 'allLabelFamilies', 'platform', 'pills', 'overlapPairs')}, ensure_ascii=False), flush=True)
    session(block)
    save('live', out)


PARTS = {'levels': part_levels, 'mobile': part_mobile, 'live': part_live, 'verdict': part_verdict}
if __name__ == '__main__':
    for name in sys.argv[1:] or list(PARTS):
        print('==', name, flush=True); PARTS[name]()
