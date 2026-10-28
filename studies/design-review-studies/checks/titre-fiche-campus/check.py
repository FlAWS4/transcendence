"""Essai titre-fiche-campus: a sheet whose official logo does not spell the campus name also shows it, never twice.
Run: python3 -I checks/titre-fiche-campus/check.py [part ...]
Parts: sheets (real globe; Paris, Mulhouse, Lyon in one page; desktop FR light and mobile AR dark, before/after),
extra (desktop AR light and mobile FR light, Paris only), logo-error (Paris logo request blocked),
live (language and theme changed without reload, then the sheet reopened), verdict.
campus-profiles.json lists logos for paris and mulhouse only; lyon is the campus without a logo.
The Mulhouse logo already reads "42 | MULHOUSE Grand Est": its sheet must stay as in the baseline."""
import json, sys, time
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from helper import Session, D, M, STUDY

ID = 'titre-fiche-campus'
RESULTS = HERE / 'results.json'
BASELINE = HERE.parent.parent / 'baseline'
NAMED = {'mulhouse'}  # logos whose artwork spells the campus name (mirrors NAMED_LOGOS in essai.mjs)
SHEET = '''(()=>{const d=document.getElementById('dialog');if(!d?.open||d.dataset.kind!=='campus')return null;
 const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&!e.closest('[hidden]')};
 const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom].map(v=>Math.round(v*10)/10)};
 const hero=d.querySelector('.campus-details-hero'),slot=hero?.querySelector('.campus-details-logo-slot'),logo=slot?.querySelector('.campus-details-logo-image');
 const country=hero?.querySelector('.campus-details-country'),title=hero?.querySelector('.essai-campus-title');
 const names=[...hero.querySelectorAll('h3')].filter(vis);
 const style=e=>{if(!e)return null;const s=getComputedStyle(e);return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.letterSpacing,s.color,s.textAlign]};
 const focusables=[...d.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e=>vis(e)&&!e.disabled&&e.tabIndex>=0)
  .map(e=>(e.id||e.className||e.tagName)+':'+(e.getAttribute('aria-label')||e.textContent.trim()).slice(0,40));
 const headings=[...d.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]')).map(e=>e.tagName+':'+e.textContent.trim().slice(0,40));
 const label=d.getAttribute('aria-labelledby');
 return {campus:document.getElementById('dialog-title').textContent,lang:document.documentElement.lang,dir:hero.closest('.campus-details').dir,
  logoShown:vis(logo),logoAlt:logo?.alt||null,visibleNames:names.map(e=>e.textContent),titleShown:vis(title),titleText:title?.textContent||null,
  slot:box(slot),title:box(title),country:box(country),countryText:country?.textContent,
  titleStyle:style(title),nameStyle:style(names[0]||null),dialogLabel:label&&document.getElementById(label)?.textContent,
  headings,focusables,sheet:box(d),overflow:d.scrollWidth>d.clientWidth+1||document.documentElement.scrollWidth>innerWidth+1,
  order:[slot,title,country].filter(Boolean).every((e,i,a)=>!i||(a[i-1].compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING))}})()'''


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


def ax_name(s):
    """Accessible name and role of the open dialog, from Chrome's accessibility tree."""
    doc = s.c.call('DOM.getDocument', {'depth': 0})
    node = s.c.call('DOM.querySelector', {'nodeId': doc['root']['nodeId'], 'selector': '#dialog'})['nodeId']
    nodes = s.c.call('Accessibility.getPartialAXTree', {'nodeId': node, 'fetchRelatives': False})['nodes']
    item = next((n for n in nodes if not n.get('ignored')), {})
    return {'role': item.get('role', {}).get('value'), 'name': item.get('name', {}).get('value')}


def open_sheet(s, campus, first):
    if not first:
        s.js('window.horizonStudy.globe.selectCampus(' + json.dumps(campus) + '),true')
    s.wait('document.getElementById("globe").dataset.level==="campus"', 30)
    s.wait('(()=>{const t=document.querySelector("#globe .hg-target");return Boolean(t&&t.getBoundingClientRect().width)})()', 45); time.sleep(1.5)
    s.click('#globe .hg-target')
    if not s.wait('document.getElementById("dialog").open&&document.getElementById("dialog").dataset.kind==="campus"', 10):
        time.sleep(2); s.click('#globe .hg-target'); s.wait('document.getElementById("dialog").open', 10)
    # Logo campuses reveal the logo on load; give the image (and the trial) time to settle.
    s.wait('(()=>{const i=document.querySelector("#dialog .campus-details-logo-image");return !i||(i.complete&&!i.hidden)||i.complete})()', 10); time.sleep(1)


def run(s, side, essais, vp, theme, lang, tag, campuses=('paris', 'mulhouse', 'lyon')):
    s.c.call('DOM.enable'); s.c.call('Accessibility.enable')
    s.open('explore?country=FRA&campus=' + campuses[0], essais=essais, theme=theme, lang=lang, viewport=vp, block_globe=False)
    out = {}
    for index, campus in enumerate(campuses):
        open_sheet(s, campus, index == 0)
        data = s.js(SHEET) or {}
        data['ax'] = ax_name(s); data['errors'] = s.errors()
        s.shot(f'{side}-{campus}-{tag}')
        out[campus] = data
        print(side, tag, campus, json.dumps({k: data.get(k) for k in ('campus', 'logoShown', 'visibleNames', 'titleShown', 'order', 'ax', 'overflow')}, ensure_ascii=False), flush=True)
        s.key('Escape'); s.wait('!document.getElementById("dialog").open', 5); time.sleep(.5)
    return out


def part_sheets():
    out = load().get('sheets', {})
    for tag, vp, theme, lang in (('ordinateur-fr', D, 'light', 'fr'), ('mobile-ar-sombre', M, 'dark', 'ar')):
        for side, essais in (('avant', []), ('apres', [ID])):
            out[f'{side}-{tag}'] = session(lambda s: run(s, side, essais, vp, theme, lang, tag))
            save('sheets', out)


def part_extra():
    out = load().get('extra', {})
    for tag, vp, theme, lang in (('ordinateur-ar', D, 'light', 'ar'), ('mobile-fr', M, 'light', 'fr')):
        for side, essais in (('avant', []), ('apres', [ID])):
            out[f'{side}-{tag}'] = session(lambda s: run(s, side, essais, vp, theme, lang, tag, campuses=('paris',)))
            save('extra', out)


def region_diff(a, b, box, dpr):
    """Share of differing pixels (helper threshold) and count of any difference inside one CSS box of two PNGs."""
    from PIL import Image
    import numpy as np
    crop = tuple(int(round(v * dpr)) for v in box)
    x = np.asarray(Image.open(a).convert('RGB').crop(crop), dtype=int); y = np.asarray(Image.open(b).convert('RGB').crop(crop), dtype=int)
    if x.shape != y.shape: return {'share': 1.0, 'pixels': -1}
    d = np.abs(x - y).sum(axis=2)
    return {'share': round(float((d > 24).mean()), 6), 'pixels': int((d > 0).sum())}


def part_verdict():
    data = load()
    profiles = json.loads((BASELINE / 'campus-profiles.json').read_text())['campuses']
    logos = sorted(k for k, v in profiles.items() if v.get('logo'))
    cases = {**data.get('sheets', {}), **data.get('extra', {})}
    checks = {'logosInProfiles': logos, 'logosSpellingTheName': sorted(NAMED)}
    ok = True
    for key, sheets in cases.items():
        side, tag = key.split('-', 1)
        for campus, v in sheets.items():
            name = v.get('campus')
            if side == 'apres':
                before = cases.get('avant-' + tag, {}).get(campus, {})
                expect_title = campus in logos and campus not in NAMED and bool(v.get('logoShown'))
                # A named logo shows the name as artwork: no text heading is expected beside it.
                expected_names = 0 if (campus in NAMED and v.get('logoShown')) else 1
                good = v.get('visibleNames', []).count(name) == expected_names and v.get('titleShown') == expect_title and v.get('order') and not v.get('overflow') and not v.get('errors')
                if expect_title:
                    good = good and v['title'][1] >= v['slot'][3] - .5 and v['country'][1] >= v['title'][3] - .5 and v.get('titleText') == name
                else:
                    # Without a title the sheet keeps the baseline geometry and the same dialog pixels.
                    good = good and v.get('country') == before.get('country') and v.get('slot') == before.get('slot')
                    dpr = 2 if tag.startswith('mobile') else 1
                    pixels = region_diff(HERE / f'avant-{campus}-{tag}.png', HERE / f'apres-{campus}-{tag}.png', v['sheet'], dpr)
                    checks[f'{key}:{campus}:dialogPixelsVsBaseline'] = pixels
                    good = good and pixels['share'] < .001
                good = good and v.get('focusables') == before.get('focusables') and v.get('ax') == before.get('ax')
                checks[f'{key}:{campus}'] = bool(good); ok = ok and bool(good)
            else:
                checks[f'{key}:{campus}:nameVisibleBefore'] = v.get('visibleNames', []).count(name)
    # Typography: the added title matches the existing no-logo heading (Lyon) of the same view.
    for tag in ('ordinateur-fr', 'mobile-ar-sombre'):
        after = cases.get('apres-' + tag, {})
        if 'paris' in after and 'lyon' in after:
            same = after['paris']['titleStyle'][:5] == after['lyon']['nameStyle'][:5]
            checks[f'{tag}:titleTypographyMatchesNoLogoHeading'] = same; ok = ok and same
    err = data.get('logoError', {}).get('apres')
    if err:
        good = not err['logoShown'] and err['visibleNames'] == ['42 Paris'] and not err['titleShown'] and not err['errors']
        checks['logoBlocked:nameOnceNoExtraTitle'] = good; ok = ok and good
    live = data.get('live')
    if live:
        good = all(step.get('visibleNames') == ['42 Paris'] and step.get('titleShown') and step.get('lang') == step.get('expectLang')
                   and step.get('theme') == step.get('expectTheme') and step.get('heroTitles') == 1 and not step.get('errors') for step in live.values())
        checks['live:titleOnceAfterLanguageAndThemeChanges'] = good; ok = ok and good
    data['checks'] = checks; data['passed'] = ok
    RESULTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(checks, indent=1, ensure_ascii=False), 'passed', ok, flush=True)


def part_logo_error():
    """Paris with its logo request blocked: the baseline falls back to the text name; no second title."""
    out = {}
    def block(s, side, essais):
        s.c.call('DOM.enable'); s.c.call('Accessibility.enable')
        s.open('explore?country=FRA&campus=paris', essais=essais, viewport=D, block_globe=False)
        s.c.call('Network.setBlockedURLs', {'urls': ['*paris-logo-official.svg*']})
        open_sheet(s, 'paris', True); time.sleep(1)
        data = s.js(SHEET) or {}; data['errors'] = s.errors(); s.shot(side + '-paris-logo-bloque-ordinateur-fr')
        out[side] = data
        print('logo-error', side, json.dumps({k: data.get(k) for k in ('logoShown', 'visibleNames', 'titleShown')}, ensure_ascii=False), flush=True)
    session(lambda s: block(s, 'avant', [])); session(lambda s: block(s, 'apres', [ID]))
    save('logoError', out)


def part_live():
    """Desktop, trial on: Paris sheet in FR light, then AR dark and EN light set through the account
    settings without reloading; the sheet is reopened each time and keeps exactly one title."""
    out = {}
    def block(s):
        s.c.call('DOM.enable')
        s.open('explore?country=FRA&campus=paris', essais=[ID], viewport=D, block_globe=False)
        for index, (lang, theme) in enumerate((('fr', 'light'), ('ar', 'dark'), ('en', 'light'))):
            if index:
                s.settings(lang, theme)
                s.wait(f'document.documentElement.lang==={json.dumps(lang)}', 10); time.sleep(1)
            open_sheet(s, 'paris', True)
            data = s.js(SHEET) or {}
            data['heroTitles'] = s.js('document.querySelectorAll("#dialog .campus-details-hero > .essai-campus-title").length')
            data['theme'] = s.js('document.documentElement.dataset.theme')
            data['expectLang'], data['expectTheme'] = lang, theme
            data['errors'] = s.errors()
            if index == 1: s.shot('apres-paris-ordinateur-ar-sombre-sans-rechargement')
            out[f'{lang}-{theme}'] = {k: data.get(k) for k in ('campus', 'lang', 'dir', 'expectLang', 'theme', 'expectTheme', 'logoShown', 'visibleNames', 'titleShown', 'titleText', 'heroTitles', 'order', 'overflow', 'errors')}
            print('live', lang, theme, json.dumps(out[f'{lang}-{theme}'], ensure_ascii=False), flush=True)
            s.key('Escape'); s.wait('!document.getElementById("dialog").open', 5); time.sleep(.5)
    session(block)
    save('live', out)


PARTS = {'sheets': part_sheets, 'extra': part_extra, 'logo-error': part_logo_error, 'live': part_live, 'verdict': part_verdict}
if __name__ == '__main__':
    for name in sys.argv[1:] or list(PARTS):
        print('==', name, flush=True); PARTS[name]()
