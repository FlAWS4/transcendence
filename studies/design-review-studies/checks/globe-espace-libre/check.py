"""Essai globe-espace-libre: the resting world disc clears the filter, stats line, status text and search.
Run (real globe, one Chrome at a time): python3 -I checks/globe-espace-libre/check.py [part ...]
Parts: geometry, extra, identity, toggle, levels, arrival, spans, live, canada, more, verdict (default: all, in that order).
Each part opens its own short Session and merges its results into results.json.
The campus map dialog round trip is checked separately by check_campus_dialog.py,
and the four trials of the group active together by check_ensemble.py."""
import json, math, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, S, L, image_diff

ID = 'globe-espace-libre'
RESULTS = HERE / 'results.json'
VIEWPORTS = {'1440x900': D, '1366x768': (1366, 768, False), '1280x720': (1280, 720, False), '1920x1080': (1920, 1080, False), '667x375': L}
SHOTS = {'1440x900': 'ordinateur', '1280x720': 'ordinateur-1280x720', '667x375': 'paysage'}
MEASURE = '''(()=>{
 const g=window.horizonStudy?.globe?.getWorldScreenGeometry?.()||null;
 const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);
  return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,shown:s.display!=='none'&&s.visibility!=='hidden'&&b.width>0&&b.height>0};};
 const stage=document.getElementById('globe');
 return {vw:innerWidth,vh:innerHeight,geometry:g,hgRadius:getComputedStyle(stage).getPropertyValue('--hg-radius').trim(),level:stage.dataset.level||null,
  filter:box('#scope-path'),stats:box('#globe-hint'),status:box('#about'),search:box('.dock-search-toggle'),dice:box('#random-campus'),
  hint:document.getElementById('globe-hint').textContent,lang:document.documentElement.lang};
})()'''
KEYS = ('filter', 'stats', 'status', 'search', 'dice')


def load():
    try: return json.loads(RESULTS.read_text())
    except Exception: return {'trial': ID}


def save(part, value):
    data = load(); data[part] = value; RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')


def clearance(geometry, rect):
    """Distance from the disc edge to a rectangle (negative = overlap); None when hidden."""
    if not geometry or not rect or not rect['shown']: return None
    cx, cy, r = geometry['center']['x'], geometry['center']['y'], geometry['radius']
    nx, ny = min(max(cx, rect['left']), rect['right']), min(max(cy, rect['top']), rect['bottom'])
    return round(math.hypot(cx - nx, cy - ny) - r, 2)


def summary(data):
    g = data['geometry']
    return {'hgRadius': data['hgRadius'], 'discRadius': g and round(g['radius'], 2),
            'centerOffset': g and [round(g['center']['x'] - data['vw'] / 2, 2), round(g['center']['y'] - data['vh'] / 2, 2)],
            'clearance': {k: clearance(g, data[k]) for k in KEYS}, 'hint': data['hint'], 'lang': data['lang'],
            'rects': {k: data[k] and {kk: round(v, 1) if isinstance(v, float) else v for kk, v in data[k].items()} for k in KEYS},
            'worldReady': data.get('worldReady'), 'loadSeconds': data.get('loadSeconds'), 'errors': data.get('errors')}


def session(block):
    """One short Chrome per block; a crashed or stuck Chrome is retried once in a fresh session."""
    for attempt in (1, 2):
        s = None
        try:
            s = Session(HERE); return block(s)
        except (RuntimeError, TimeoutError) as error:
            print('session error', attempt, error, flush=True)
            if attempt == 2: raise
        finally:
            if s: s.close()


def explore(s, vp, essais=(), theme='light', lang='fr', route='explore'):
    start = time.time()
    s.open(route, essais=list(essais), theme=theme, lang=lang, viewport=vp, block_globe=False)
    ok = s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
    data = s.js(MEASURE); data['worldReady'] = ok; data['loadSeconds'] = round(time.time() - start, 1); data['errors'] = s.errors()
    return data


def passes(case):
    """No intersection with any shown control, >= 16 px of air to the stats line and the first text below, centre within 1 px."""
    a = case['apres']; clear = {k: v for k, v in a['clearance'].items() if v is not None}
    below = 'status' if a['clearance']['status'] is not None else 'search'
    return bool(a['discRadius']) and all(v > 0 for v in clear.values()) and a['clearance']['stats'] >= 16 and a['clearance'][below] >= 16 \
        and max(abs(v) for v in a['centerOffset']) <= 1 and not a['errors'] and not case['avant']['errors']


def part_geometry():
    out = {}
    def block(s, names):
        for name in names:
            vp = VIEWPORTS[name]
            before = explore(s, vp)
            if name in SHOTS: s.shot('avant-' + SHOTS[name])
            after = explore(s, vp, [ID])
            if name in SHOTS: s.shot('apres-' + SHOTS[name])
            case = {'avant': summary(before), 'apres': summary(after)}
            case["passed"] = passes(case)
            clear = [v for v in case['apres']['clearance'].values() if v is not None]
            case['minClearanceApres'] = min(clear) if clear else None
            out[name] = case
            s.record(name, {'r': [case['avant']['discRadius'], case['apres']['discRadius']], 'clear': case['apres']['clearance'], 'off': case['apres']['centerOffset'], 'passed': case['passed']})
    # Two globe pages per session: a third page in the same tab exceeded the 2.6 GB cap.
    for name in VIEWPORTS:
        session(lambda s: block(s, [name]))
    save('viewports', out)


def part_extra():
    out = {}
    def dark(s):
        explore(s, D, theme='dark'); s.shot('avant-sombre-ordinateur')
        out['dark1440'] = summary(explore(s, D, [ID], theme='dark')); s.shot('apres-sombre-ordinateur')
    def arabic(s):
        ar_before = explore(s, D, lang='ar'); s.shot('avant-ar-ordinateur')
        ar = explore(s, D, [ID], lang='ar'); s.shot('apres-ar-ordinateur')
        out['ar1440'] = {'avant': summary(ar_before), 'apres': summary(ar)}
    def block(s):
        en = explore(s, D, [ID], lang='en')
        out['en1440'] = summary(en)
        # Resize pickup in the same page, without reloading: 1440x900 -> 1280x720 -> 1440x900.
        resize = {}
        for label, vp in (('to1280x720', VIEWPORTS['1280x720']), ('back1440x900', D)):
            s.viewport(*vp); time.sleep(2); s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 20); time.sleep(.6)
            resize[label] = summary(s.js(MEASURE) | {'errors': s.errors()})
        out['resize'] = resize
        s.record('extra', {'en': out['en1440']['clearance'], 'resize': {k: v['discRadius'] for k, v in resize.items()}})
    session(dark); session(arabic); session(block)
    geometry = load().get('viewports', {})
    direct = {k: geometry.get(k, {}).get('apres', {}).get('discRadius') for k in ('1280x720', '1440x900')}
    r = out['resize']
    out['resize']['matchesDirectLoad'] = None if None in direct.values() else (
        abs((r['to1280x720']['discRadius'] or 0) - direct['1280x720']) < .6 and abs((r['back1440x900']['discRadius'] or 0) - direct['1440x900']) < .6)
    for key in ('dark1440', 'en1440'):
        c = out[key]['clearance']; below = 'status' if c['status'] is not None else 'search'
        out[key]['passed'] = all(v > 0 for v in c.values() if v is not None) and c['stats'] >= 16 and c[below] >= 16 and not out[key]['errors']
    c = out['ar1440']['apres']['clearance']
    out['ar1440']['passed'] = all(v > 0 for v in c.values() if v is not None) and c['stats'] >= 16 and c['status'] >= 16 and not out['ar1440']['apres']['errors']
    save('extra', out)


def strict_diff(a, b):
    """Number of pixels that differ at all between two PNGs of the same size."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    return int((np.abs(x - y).sum(axis=2) > 0).sum()) if x.shape == y.shape else -1


def max_level(a, b):
    """Largest difference of one colour channel between two PNGs of the same size (0-255)."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    return int(np.abs(x - y).max()) if x.shape == y.shape else -1


def part_identity():
    out = {}
    for label, vp in (('mobile', M), ('petit', S)):
        pages = {}
        def baseline(s):
            pages['avant'] = explore(s, vp); s.shot('avant-' + label)
            # A second baseline load measures the renderer's own noise between two identical pages.
            pages['bis'] = explore(s, vp); s.shot('avant-bis-' + label)
        def trial(s):
            pages['apres'] = explore(s, vp, [ID]); s.shot('apres-' + label)
        session(baseline); session(trial)
        a, a2, b = (HERE / f'{n}-{label}.png' for n in ('avant', 'avant-bis', 'apres'))
        out[label] = {'diff': round(image_diff(a, b), 6), 'pixelsDiffering': strict_diff(a, b), 'maxLevelDifference': max_level(a, b),
                      'baselineNoise': round(image_diff(a, a2), 6), 'baselinePixelsDiffering': strict_diff(a, a2),
                      'hgRadius': [pages['avant']['hgRadius'], pages['apres']['hgRadius']],
                      'discRadius': [pages[k]['geometry'] and round(pages[k]['geometry']['radius'], 2) for k in ('avant', 'apres')],
                      'errors': pages['avant']['errors'] + pages['bis']['errors'] + pages['apres']['errors']}
        a2.unlink()
        print('identity', label, json.dumps(out[label]), flush=True)
    save('portraitIdentity', out)


STYLES = '''(()=>{const hash=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(36);};
 const out=[];for(const e of document.querySelectorAll("body *")){const s=getComputedStyle(e);let t="";
 const keys=[];for(let i=0;i<s.length;i++){const k=s[i];if(!k.startsWith("--essai"))keys.push(k);}
 /* Chrome lists custom properties in an order that depends on the registered set: sort before hashing. */
 for(const k of keys.sort())t+=k+":"+s.getPropertyValue(k)+";";out.push((e.id||e.tagName)+"#"+hash(t));}
 const st=getComputedStyle(document.getElementById("globe"));return {count:out.length,styles:out,hg:st.getPropertyValue("--hg-radius").trim()};})()'''


def part_toggle():
    """Portrait phones, one page with the trial active: switch its stylesheet off and on again.
    Every computed style (trial custom properties aside) and every pixel must stay the same, which
    separates a real effect from the WebGL noise between two Chrome sessions."""
    out = {}
    def block(s, label, vp):
        explore(s, vp, [ID])
        on = s.js(STYLES, 30); s.shot('toggle-on-' + label)
        s.js('(()=>{for(const l of document.querySelectorAll("link[data-essai]"))l.disabled=true;return true})()'); time.sleep(1.5)
        off = s.js(STYLES, 30); s.shot('toggle-off-' + label)
        s.js('(()=>{for(const l of document.querySelectorAll("link[data-essai]"))l.disabled=false;return true})()'); time.sleep(1.5)
        geometry = s.js('window.horizonStudy.globe.getWorldScreenGeometry()')
        a, b = HERE / f'toggle-on-{label}.png', HERE / f'toggle-off-{label}.png'
        changed = [i for i, (x, y) in enumerate(zip(on['styles'], off['styles'])) if x != y]
        out[label] = {'elements': on['count'], 'elementsWithDifferentStyle': len(changed) if on['count'] == off['count'] else -1,
                      'hgRadius': [on['hg'], off['hg']], 'pixelsDiffering': strict_diff(a, b), 'discRadius': geometry and round(geometry['radius'], 2), 'errors': s.errors()}
        a.unlink(); b.unlink()
        print('toggle', label, json.dumps(out[label]), flush=True)
    for label, vp in (('mobile', M), ('petit', S)):
        session(lambda s: block(s, label, vp))
    save('portraitToggle', out)


def part_levels():
    out = {}
    def block(s, label, essais):
        explore(s, D, essais)
        s.js('window.horizonStudy.globe.selectCountry("FRA"),true')
        s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(3)
        country = s.js(MEASURE); s.shot(label + '-pays')
        s.js('window.horizonStudy.globe.selectCampus("paris"),true')
        s.wait('document.getElementById("globe").dataset.level==="campus"', 20)
        ready = s.wait('document.getElementById("globe-hint").textContent==="Explore les alentours du campus."', 45); time.sleep(3)
        campus = s.js(MEASURE); s.shot(label + '-campus')
        # Back to the world, then dock the globe into the filter medallion by opening Projects.
        s.js('window.horizonStudy.globe.reset(),true')
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 30); time.sleep(1)
        world = s.js(MEASURE)
        s.click('#main-nav button[data-section=projects]'); time.sleep(2.5)
        dock = s.js('''(()=>{const st=document.getElementById("globe"),m=document.getElementById("scope-medallion").getBoundingClientRect();
          const v=k=>parseFloat(st.style.getPropertyValue(k));
          return {docked:document.getElementById("app").dataset.globeDocked,section:document.getElementById("app").dataset.section,scale:v("--dock-scale"),clip:v("--dock-clip-radius"),
           ox:v("--dock-origin-x"),oy:v("--dock-origin-y"),tx:v("--dock-translate-x"),ty:v("--dock-translate-y"),left:st.offsetLeft,top:st.offsetTop,
           medallion:{x:m.left+m.width/2,y:m.top+m.height/2,r:m.width/2}}})()''')
        dock['dockedRadius'] = round(dock['clip'] * dock['scale'], 2)
        dock['dockedCenter'] = [round(dock['left'] + dock['ox'] + dock['tx'], 2), round(dock['top'] + dock['oy'] + dock['ty'], 2)]
        dock['offsetFromMedallion'] = [round(dock['dockedCenter'][0] - dock['medallion']['x'], 2), round(dock['dockedCenter'][1] - dock['medallion']['y'], 2)]
        s.shot(label + '-medaillon')
        out[label] = {'country': {'level': country['level'], 'hint': country['hint']}, 'campus': {'level': campus['level'], 'hint': campus['hint'], 'ready': ready},
                      'worldAfterReset': summary(world), 'dock': dock, 'errors': s.errors()}
        s.record(label, {'country': out[label]['country'], 'campus': out[label]['campus'], 'dock': [dock['dockedRadius'], dock['offsetFromMedallion']], 'errors': out[label]['errors']})
    session(lambda s: block(s, 'avant', []))
    session(lambda s: block(s, 'apres', [ID]))
    out['diffPays'] = round(image_diff(HERE / 'avant-pays.png', HERE / 'apres-pays.png'), 6)
    out['diffCampus'] = round(image_diff(HERE / 'avant-campus.png', HERE / 'apres-campus.png'), 6)
    save('levels', out)


def part_arrival():
    out = {}
    def block(s, label, essais):
        s.open('', essais=essais, viewport=D, block_globe=False, page='index.html')
        s.click('#entry-guest')
        s.wait('document.body.dataset.entry==="welcome"', 60)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(1.5)
        data = s.js(MEASURE); data['errors'] = s.errors(); s.shot(label + '-arrivee')
        out[label] = summary(data); s.record('arrival-' + label, {'r': out[label]['discRadius'], 'clear': out[label]['clearance'], 'errors': data['errors']})
    session(lambda s: block(s, 'avant', [])); session(lambda s: block(s, 'apres', [ID]))
    save('arrival', out)


# Country fits recomputed with the baseline's own modules and data (read-only), to list the
# country views that depend on the world radius through countryZoom's worldZoom + 1.35 floor.
SPANS = '''(()=>{window.__essaiSpans=null;(async()=>{
 const base=new URL('./',location.href);
 const {createGeographyLoader}=await import(new URL('geography-loader.mjs',base).href);
 const loader=createGeographyLoader({workerFactory:()=>new Worker(new URL('geography-worker.mjs',base),{type:'module'}),
  url:new URL('geography/world-countries.topo.json.gz?v=ne5.1.1-1',base).href,rawUrl:new URL('geography/world-countries.topo.json?v=ne5.1.1-1',base).href});
 const [world,dataset,overrides]=await Promise.all([loader.load(),fetch(new URL('campuses.json',base)).then(r=>r.json()),fetch(new URL('campus-location-overrides.json',base)).then(r=>r.json())]);
 const fix=new Map(overrides.map(o=>[o.campusId,o]));
 const campuses=dataset.campuses.map(c=>fix.has(c.id)?{...c,coordinates:fix.get(c.id).coordinates}:c);
 const {d3,topojson}=window;
 const features=world.type==='Topology'?topojson.feature(world,world.objects.features||Object.values(world.objects)[0]).features:world.features;
 const spans={};
 for(const country of dataset.countries){
  const members=campuses.filter(c=>c.country===country.id);
  const center=d3.geoCentroid({type:'MultiPoint',coordinates:members.map(c=>c.coordinates)});
  const feature=features.find(f=>(f.properties?.id||f.id)===country.id);
  let bounds;
  if(feature){const parts=feature.geometry.type==='MultiPolygon'?feature.geometry.coordinates.map(coordinates=>({type:'Polygon',coordinates})):[feature.geometry];
   const part=parts.find(part=>d3.geoContains(part,center))||parts.sort((a,b)=>d3.geoArea(b)-d3.geoArea(a))[0];bounds=d3.geoBounds(part);}
  else bounds=[[center[0]-.7,center[1]-.7],[center[0]+.7,center[1]+.7]];
  const [[west,south],[east,north]]=bounds;
  spans[country.id]=Math.max(east-west,(north-south)/Math.max(.25,Math.cos(center[1]*Math.PI/180)),1.3);
 }
 window.__essaiSpans=spans;
})().catch(e=>{window.__essaiSpans={error:String(e)}});return true;})()'''


def world_zoom(w, h, radius):
    return math.log2(min(w, h) / 600) + 1.88 + math.log2(radius / .425)


def country_zoom(w, h, radius, span):
    """Same clamp(value, low, high) = max(low, min(high, value)) as integrated-globe.mjs."""
    raw = math.log2(min(w, h) * .64 * 360 / (512 * (span + 1)))
    return max(world_zoom(w, h, radius) + 1.35, min(6.7, raw))


def part_spans():
    def block(s):
        s.open('explore', viewport=D, block_globe=False); s.js(SPANS); s.wait('window.__essaiSpans!==null', 60)
        return s.js('window.__essaiSpans')
    spans = session(block)
    geometry = load().get('viewports', {})
    affected = {}
    if spans and 'error' not in spans:
        for name, case in geometry.items():
            w, h = VIEWPORTS[name][:2]
            r0, r1 = float(case['avant']['hgRadius']), float(case['apres']['hgRadius'])
            changed = {cid: [round(country_zoom(w, h, r0, span), 3), round(country_zoom(w, h, r1, span), 3)] for cid, span in spans.items()
                       if abs(country_zoom(w, h, r0, span) - country_zoom(w, h, r1, span)) > 1e-6}
            affected[name] = {'worldZoom': [round(world_zoom(w, h, r0), 3), round(world_zoom(w, h, r1), 3)], 'countriesChanged': changed, 'franceUnchanged': 'FRA' not in changed}
    save('countryZoom', affected if affected else spans)
    print('countryZoom', {k: sorted(v['countriesChanged']) for k, v in affected.items()} if affected else spans, flush=True)


def part_more():
    """Sizes outside the acceptance list, real globe: a wide landscape phone (844x390) and a portrait tablet (768x1024)."""
    out = {}
    def block(s, name, vp):
        before = explore(s, vp); s.shot('avant-' + name)
        after = explore(s, vp, [ID]); s.shot('apres-' + name)
        case = {'avant': summary(before), 'apres': summary(after)}
        case['passed'] = passes(case)
        out[name] = case
        s.record(name, {'r': [case['avant']['discRadius'], case['apres']['discRadius']], 'clear': case['apres']['clearance'], 'off': case['apres']['centerOffset'], 'passed': case['passed']})
    for name, vp in (('paysage-844x390', (844, 390, True)), ('tablette-768x1024', (768, 1024, True))):
        session(lambda s: block(s, name, vp))
    save('moreSizes', out)


def part_verdict():
    data = load()
    v = data.get('viewports', {}); e = data.get('extra', {}); i = data.get('portraitIdentity', {}); t = data.get('portraitToggle', {}); lv = data.get('levels', {}); arr = data.get('arrival', {})
    dock = lv.get('apres', {}).get('dock', {})
    checks = {
        'fiveViewportsClearAndCentred': bool(v) and all(c['passed'] for c in v.values()),
        'darkEnArClear': all(e.get(k, {}).get('passed') for k in ('dark1440', 'en1440', 'ar1440')),
        'resizePickedUp': bool(e.get('resize', {}).get('matchesDirectLoad')),
        # Same page, trial stylesheet switched off and on: no computed style and no pixel may change.
        'portraitPixelIdentical': bool(t) and all(c['pixelsDiffering'] == 0 and c['elementsWithDifferentStyle'] == 0 and c['hgRadius'][0] == c['hgRadius'][1] and not c['errors'] for c in t.values()),
        # Two Chrome sessions (baseline, trial): same radius; the canvas may differ by WebGL noise only (a few pixels, <= 2 levels).
        'portraitSameRadiusAcrossSessions': bool(i) and all(c['hgRadius'][0] == c['hgRadius'][1] and c['discRadius'][0] == c['discRadius'][1] and c['diff'] == 0 for c in i.values()),
        'franceThenParis': lv.get('apres', {}).get('country', {}).get('level') == 'country' and lv.get('apres', {}).get('campus', {}).get('level') == 'campus' and bool(lv.get('apres', {}).get('campus', {}).get('ready')),
        'docksIntoMedallion': dock.get('docked') == 'true' and abs(dock.get('dockedRadius', 0) - 16) < .6 and max(map(abs, dock.get('offsetFromMedallion', [9, 9]))) <= 1,
        'arrivalRevealsFittedDisc': bool(arr.get('apres', {}).get('discRadius')) and all(x > 0 for x in arr['apres']['clearance'].values() if x is not None),
        'campusDialogKeepsOwnRadius': data.get('campusDialog', {}).get('passed', 'not run (check_campus_dialog.py)'),
        'languageAndThemeChangedWithoutReload': bool(data.get('live')) and all(c.get('passed') for c in data['live'].values()),
        'moreSizesClearAndCentred': bool(data.get('moreSizes')) and all(c['passed'] for c in data['moreSizes'].values()),
        'groupTrialsTogether': data.get('ensemble', {}).get('passed', 'not run (check_ensemble.py)'),
        'noConsoleErrors': not any(lv.get(k, {}).get('errors') for k in ('avant', 'apres')) and not any(c.get('errors') for c in i.values()) and not arr.get('apres', {}).get('errors'),
    }
    data['checks'] = checks; data['passed'] = all(v is True for v in checks.values())
    RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(checks, indent=1), 'passed', data['passed'], flush=True)


def part_live():
    """1440x900, trial on: FR light, then AR dark and EN light set through the account settings
    without reloading. The fitted disc must keep its radius, centre and clearances each time."""
    out = {}
    def block(s):
        s.open('explore', essais=[ID], viewport=D, block_globe=False)
        s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 40); time.sleep(.8)
        for index, (lang, theme) in enumerate((('fr', 'light'), ('ar', 'dark'), ('en', 'light'))):
            if index:
                s.settings(lang, theme)
                s.wait(f'document.documentElement.lang==={json.dumps(lang)}&&document.documentElement.dataset.theme==={json.dumps(theme)}', 10)
                s.wait('Boolean(window.horizonStudy?.globe?.getWorldScreenGeometry?.())', 20); time.sleep(1.2)
            data = s.js(MEASURE); data['errors'] = s.errors(); data['theme'] = s.js('document.documentElement.dataset.theme')
            if index == 1: s.shot('apres-ar-sombre-sans-rechargement')
            case = summary(data); case['theme'] = data['theme']
            c = case['clearance']
            case['passed'] = bool(case['discRadius']) and abs(case['discRadius'] - 240) < .6 and all(v > 0 for v in c.values() if v is not None) \
                and c['stats'] >= 16 and c['status'] >= 16 and max(map(abs, case['centerOffset'])) <= 1 and not case['errors'] and case['lang'] == lang and case['theme'] == theme
            out[f'{lang}-{theme}'] = case
            s.record('live-' + lang, {'r': case['discRadius'], 'clear': c, 'off': case['centerOffset'], 'passed': case['passed']})
    session(block)
    save('live', out)


def part_canada():
    """Side effect made visible: the Canada country view (floor worldZoom + 1.35) at 1440x900, before/after."""
    out = {}
    def block(s, side, essais):
        explore(s, D, essais)
        s.js('window.horizonStudy.globe.selectCountry("CAN"),true')
        s.wait('document.getElementById("globe").dataset.level==="country"', 20); time.sleep(3)
        out[side] = {'level': s.js('document.getElementById("globe").dataset.level'), 'errors': s.errors()}
        s.shot(side + '-pays-canada')
    session(lambda s: block(s, 'avant', [])); session(lambda s: block(s, 'apres', [ID]))
    out['diff'] = round(image_diff(HERE / 'avant-pays-canada.png', HERE / 'apres-pays-canada.png'), 4)
    print('canada', out, flush=True)
    save('canada', out)


PARTS = {'geometry': part_geometry, 'extra': part_extra, 'identity': part_identity, 'toggle': part_toggle, 'levels': part_levels, 'arrival': part_arrival, 'spans': part_spans, 'live': part_live, 'canada': part_canada, 'more': part_more, 'verdict': part_verdict}
if __name__ == '__main__':
    for name in sys.argv[1:] or list(PARTS):
        print('==', name, flush=True); PARTS[name]()
