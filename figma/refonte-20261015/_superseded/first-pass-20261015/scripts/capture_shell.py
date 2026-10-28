#!/usr/bin/env python3
"""Zone « shell » of the Figma rebuild (15 October 2026): shared header, bottom menu (dock), search, die,
back to top, scope pill, 42 Awards page and the account (visitor, settings, theme, language, sign-in and
sign-up dialogs, member, messages, notifications). Read-only on the prototype.

Run one lot at a time, never two capture scripts in parallel (shared Chrome slots, low memory):
    cd /home/le-rif/Bureau/Transcendence
    timeout 580 python3 work/figma/refonte-20261015/scripts/capture_shell.py <lot>
Lots: tokens, mobile, header, search, die, account-desktop, account-mobile, account-ar, dialogs, member,
      brand, globe.  ("list" prints them.)

Each state: viewport screenshot in ../reference/shell/<name>.png, layout dump in ../dom/shell/<name>.json.gz
(capture_lib.snap), plus a record in ../reference/shell/index.json (site-map node, checked facts, version).
The lot "tokens" and "mobile" also write the resolved CSS variables (../dom/shell/_vars-<format>-<theme>.json);
"header" writes the fonts actually used by Chrome (../dom/shell/_fonts.json); "brand" prints the wordmarks
to PDF and converts them to outlined SVG with Inkscape (../assets/brand/).
A state whose theme, language or expected UI cannot be reached is skipped and listed under "failures",
never recorded as good.
"""
import gzip, json, pathlib, signal, subprocess, sys, time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from capture_lib import *  # noqa: E402,F401
from capture_lib import BASE, REF, DOM, snap, write_index, open_app, start  # noqa: E402

AREA = 'shell'
SMALL = (320, 640, True)   # small phone: dock keeps only the active label
TINY = (300, 640, True)    # very small window: icons only
STARTED = time.time()
BUDGET = 540               # seconds of work per run (the shell timeout is 580)
RECORDS, FAILURES = [], []
signal.signal(signal.SIGTERM, lambda *a: sys.exit(143))


class StateError(Exception):
    pass


FACTS_JS = r'''(() => { const q = s => document.querySelector(s);
 const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
 const app = q('#app') || {dataset: {}};
 return {
  theme: document.documentElement.dataset.theme, themePreference: document.documentElement.dataset.themePreference,
  lang: document.documentElement.lang, dir: document.documentElement.dir, viewport: [innerWidth, innerHeight], scrollY,
  route: location.hash, section: app.dataset.section, reading: app.dataset.reading || null, compactScope: app.dataset.compactScope || null,
  scope: {name: q('#scope-name')?.textContent || null, level: q('#scope-bar')?.dataset.level || null, country: vis(q('#scope-country-item')) ? q('#scope-country-name')?.textContent : null},
  die: q('#random-campus') ? {title: q('#random-campus').title, label: q('#random-campus').getAttribute('aria-label'), disabled: q('#random-campus').disabled, visible: vis(q('#random-campus'))} : null,
  search: {open: q('.dock-shell')?.dataset.searchOpen || null, capsule: q('.dock-search-toggle-label')?.textContent || null,
   count: document.querySelectorAll('.dock-search-result').length, status: q('.dock-search-status')?.textContent || '',
   helper: vis(q('.dock-search-helper')) ? q('.dock-search-helper').textContent : null, more: !!q('.dock-search-more') && !q('.dock-search-more').hidden,
   selected: q('.dock-search-result[aria-selected=true] .dock-search-result-title')?.textContent || null},
  account: {open: !!q('#account-menu') && !q('#account-menu').hidden, title: q('#account-menu-title')?.textContent || null,
   avatar: !!q('#profile.account-has-avatar'), trigger: q('#profile')?.getAttribute('aria-label'),
   extras: [...document.querySelectorAll('.account-extra-trigger')].filter(vis).map(e => e.getAttribute('aria-label'))},
  dialog: {open: !!q('#dialog[open]'), kind: q('#dialog')?.dataset.kind || null, title: q('#dialog[open] #dialog-title')?.textContent || null},
  backTop: {visible: vis(q('#back-to-top')), opacity: q('#back-to-top') ? getComputedStyle(q('#back-to-top')).opacity : null, label: q('#back-to-top')?.getAttribute('aria-label') || null},
  dockScrolling: q('.dock-shell')?.dataset.documentScrolling || null,
  wordmark: q('#brand-wordmark')?.dataset.wordmarkText || null, arabicBrand: vis(q('.arabic-brand')),
  dockLabelHeights: [...document.querySelectorAll('#main-nav>button[data-section]>span')].map(e => Math.round(e.getBoundingClientRect().height * 10) / 10),
  dockCurrent: q('#main-nav>button[aria-current]')?.dataset.section || null,
  awardsNote: vis(q('.awards-coming-soon')) ? q('.awards-coming-soon p').textContent : null,
  loading: vis(q('#loading')) ? q('#loading').textContent : null,
  focus: document.activeElement ? (document.activeElement.id || document.activeElement.className || document.activeElement.tagName) : null,
 }; })()'''

# Every custom property of every stylesheet, resolved on the elements that define most of them, with the
# colour value computed by Chrome (a probe child reads color: var(--x)) and the declaring rules.
VARS_JS = r'''(() => {
 const pick = {root: document.documentElement, app: document.getElementById('app'), dockShell: document.querySelector('.dock-shell'),
  nav: document.getElementById('main-nav'), scopePath: document.getElementById('scope-path'), globe: document.getElementById('globe'),
  sheet: document.getElementById('content-sheet'), profile: document.getElementById('profile')};
 const defs = {}, conds = [];
 const file = s => (s.href || 'inline').split('/').pop().split('?')[0];
 const walk = (rules, cond, f) => {
  for (const rule of rules) {
   let c = null;
   if (rule.media && rule.cssRules && !rule.style) c = 'media ' + rule.media.mediaText;
   else if (rule.conditionText !== undefined && rule.cssRules) c = rule.constructor.name.replace('CSS', '').replace('Rule', '').toLowerCase() + ' ' + rule.conditionText;
   if (c) { conds.push({file: f, cond: c}); walk(rule.cssRules, cond ? cond + ' & ' + c : c, f); continue; }
   if (rule.style) for (const p of rule.style) if (p.startsWith('--')) (defs[p] ??= []).push({file: f, sel: rule.selectorText, cond: cond || undefined, value: rule.style.getPropertyValue(p).trim()});
  }
 };
 for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch (e) { continue; } walk(rules, '', file(sheet)); }
 const probe = (el, name) => { const p = document.createElement('i'); p.style.cssText = 'position:absolute;width:0;height:0;color:var(' + name + ')'; el.appendChild(p); const c = getComputedStyle(p).color; p.remove(); return c; };
 const vars = {};
 for (const name of Object.keys(defs)) {
  const resolved = {};
  for (const [k, el] of Object.entries(pick)) {
   if (!el) continue; const v = getComputedStyle(el).getPropertyValue(name).trim();
   if (v) { resolved[k] = {raw: v.slice(0, 400)}; if (CSS.supports('color', v)) resolved[k].color = probe(el, name); }
  }
  vars[name] = {resolved, defs: defs[name]};
 }
 return {theme: document.documentElement.dataset.theme, lang: document.documentElement.lang, viewport: [innerWidth, innerHeight], route: location.hash,
  bodyBg: getComputedStyle(document.body).backgroundColor, vars, conditions: conds};
})()'''


def left():
    return BUDGET - (time.time() - STARTED)


def ready(s):
    ok = s.wait('Boolean(document.querySelector(".dock-shell .dock-search-toggle-label")?.textContent && document.getElementById("account-menu") && document.querySelector("#profile svg, #profile img"))', 25)
    if not ok:
        raise StateError('application not ready (dock or account missing)')
    s.wait('document.fonts.status==="loaded"', 10)


def ensure(s, theme, lang):
    """Apply theme and language through the account menu (the theme is remembered in localStorage,
    the language is not), then check them."""
    cur = s.js('[document.documentElement.dataset.theme, document.documentElement.lang]')
    if cur != [theme, lang]:
        s.settings(lang, theme)
        s.wait(f'document.documentElement.dataset.theme==={json.dumps(theme)} && document.documentElement.lang==={json.dumps(lang)}', 8)
        cur = s.js('[document.documentElement.dataset.theme, document.documentElement.lang]')
    if cur != [theme, lang]:
        raise StateError(f'theme/lang {cur} instead of {[theme, lang]}')
    time.sleep(.3)


def goto(s, route, vp=DESKTOP, theme='light', lang='fr', block=True, storage=None):
    """Fresh load of the direct preview (about:blank first, so a hash-only change still reloads)."""
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
    open_app(s, route, vp, theme='light', lang='fr', block_globe=block)
    if storage:
        s.js('(()=>{' + ''.join(f'localStorage.setItem({json.dumps(k)},{json.dumps(v)});' for k, v in storage.items()) + 'return true})()')
        s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
        open_app(s, route, vp, theme='light', lang='fr', block_globe=block)
    ready(s)
    ensure(s, theme, lang)


def facts(s):
    return s.js(FACTS_JS)


def require(s, expr, what, seconds=8):
    if not s.wait(expr, seconds):
        raise StateError('not reached: ' + what)


def shoot(s, name, screen, description, keep_focus=False, full=False, check=None):
    """One state: checks theme/lang encoded in the name, optional extra check, then capture_lib.snap."""
    _, fmt, lang_theme = name.split('--')
    lang, theme = lang_theme.split('-')[:2]
    f = facts(s)
    if [f['theme'], f['lang']] != [theme, lang]:
        raise StateError(f'{name}: theme/lang {f["theme"]}/{f["lang"]}')
    if check:
        problem = check(f)
        if problem:
            raise StateError(f'{name}: {problem}')
    original = s.blur
    if keep_focus:
        s.blur = lambda: None  # panels that close on focusout, and the search field, keep their focus
    try:
        rec = snap(s, AREA, name, full=full, meta={'screen': screen, 'facts': f})
    finally:
        s.blur = original
    after = facts(s)
    rec.update({'screen': screen, 'description': description, 'format': fmt, 'lang': lang, 'theme': theme,
                'viewportSize': f['viewport'], 'route': f['route'], 'facts': after, 'keptFocus': keep_focus,
                'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')})
    RECORDS.append(rec)
    print(f'ok  {name}  [{rec["version"]}]  errors={len(rec["errors"])} overflow={rec["overflow"]}', flush=True)
    return rec


def attempt(fn, *args, **kwargs):
    """Run one state (or a short sequence); a failure is logged and the lot continues."""
    if left() < 35:
        FAILURES.append({'state': getattr(fn, '__name__', str(fn)), 'reason': 'time budget of the run exhausted'})
        print('skip (time)', getattr(fn, '__name__', fn), flush=True)
        return None
    try:
        return fn(*args, **kwargs)
    except (StateError, RuntimeError, TimeoutError) as error:
        FAILURES.append({'state': getattr(fn, '__name__', str(fn)), 'args': [str(a) for a in args[1:]], 'reason': str(error)[:300]})
        print('FAIL', getattr(fn, '__name__', fn), args[1:], error, flush=True)
        return None


def save_vars(s, label):
    data = s.js(VARS_JS, 60)
    target = DOM / AREA / f'_vars-{label}.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=0))
    print('vars', label, len(data['vars']), 'properties', flush=True)


def platform_fonts(s, selectors):
    s.c.call('DOM.enable'); s.c.call('CSS.enable')
    root = s.c.call('DOM.getDocument', {'depth': 0})['root']['nodeId']
    out = {}
    for sel in selectors:
        try:
            nid = s.c.call('DOM.querySelector', {'nodeId': root, 'selector': sel})['nodeId']
            out[sel] = s.c.call('CSS.getPlatformFontsForNode', {'nodeId': nid})['fonts'] if nid else 'not found'
        except Exception as error:  # noqa: BLE001
            out[sel] = f'error: {error}'
    s.c.call('CSS.disable'); s.c.call('DOM.disable')
    return out


# ---------------------------------------------------------------------------------------------------------
# Shared sequences

def list_state(s, route, vp, theme, lang, name, screen, description, check=None, **kw):
    goto(s, route, vp, theme, lang, **kw)
    return shoot(s, name, screen, description, check=check)


def open_search(s, query):
    s.click('.dock-search-toggle'); s.away()
    require(s, 'document.querySelector(".dock-shell")?.dataset.searchOpen==="true" && document.activeElement?.classList.contains("dock-search-input")', 'search open')
    if query:
        s.c.call('Input.insertText', {'text': query})
        require(s, f'document.querySelector(".dock-search-input").value==={json.dumps(query)} && (document.querySelectorAll(".dock-search-result").length>0 || document.querySelector(".dock-search-helper:not([hidden])"))', 'search answered')
    time.sleep(.8)


def search_state(s, vp, fmt, theme, lang, query, kind, selected=False):
    goto(s, 'projects', vp, theme, lang)
    open_search(s, query)
    if selected:
        s.key('ArrowDown'); time.sleep(.4)
    name = f'g-search-{kind}--{fmt}--{lang}-{theme}'
    desc = {'paris': 'Recherche ouverte, requête « Paris » et ses résultats',
            'paris-selected': 'Recherche « Paris », premier résultat sélectionné au clavier (flèche bas)',
            'empty': 'Recherche ouverte sans requête (texte d’aide)',
            'none': 'Recherche sans résultat (requête « zzqx »)'}[kind]
    def check(f):
        if f['search']['open'] != 'true':
            return 'search closed'
        if kind.startswith('paris') and f['search']['count'] == 0:
            return 'no results for Paris'
        if kind in ('empty', 'none') and not f['search']['helper']:
            return 'helper text missing'
        if selected and not f['search']['selected']:
            return 'no selected result'
        return None
    return shoot(s, name, 'g-search', desc, keep_focus=True, check=check)


def account_states(s, vp, fmt, theme, lang):
    goto(s, 'projects', vp, theme, lang)
    s.click('#profile')
    require(s, '!document.getElementById("account-menu").hidden && document.querySelector("[data-account-action=signin]")', 'visitor panel')
    time.sleep(.3)
    shoot(s, f'account-visitor--{fmt}--{lang}-{theme}', 'account-visitor', 'Panneau du compte visiteur : Se connecter, Créer un compte, Paramètres, Thème, Langue', keep_focus=True)
    for key, screen, desc in [('settings', 'settings', 'Paramètres : groupes Thème et Langue'),
                              ('theme', 'theme', 'Sous-panneau Thème : Clair, Sombre, Système'),
                              ('language', 'language', 'Sous-panneau Langue : Français, English, العربية')]:
        if left() < 30:
            FAILURES.append({'state': f'{screen}--{fmt}--{lang}-{theme}', 'reason': 'time budget'}); continue
        s.click(f'[data-account-action={key}]')
        require(s, '!document.getElementById("account-menu").hidden && document.querySelector("[data-account-action=back]")', key + ' panel')
        time.sleep(.3)
        shoot(s, f'{screen}--{fmt}--{lang}-{theme}', screen, desc, keep_focus=True)
        s.click('[data-account-action=back]')
        require(s, 'document.querySelector("[data-account-action=signin]")', 'back to the panel home')
    s.key('Escape')


def dialog_states(s, vp, fmt, theme):
    goto(s, 'projects', vp, theme, 'fr')
    for key, kind, screen, desc in [('signin', 'login', 'signin-dialog', 'Connexion simulée ouverte depuis le compte (après l’entrée)'),
                                    ('signup', 'signup', 'signup-dialog', 'Création de compte simulée ouverte depuis le compte (après l’entrée)')]:
        s.click('#profile')
        require(s, '!document.getElementById("account-menu").hidden', 'visitor panel')
        s.click(f'[data-account-action={key}]')
        require(s, f'document.querySelector("#dialog[open]")?.dataset.kind==="{kind}"', kind + ' dialog')
        time.sleep(.5)
        shoot(s, f'{screen}--{fmt}--fr-{theme}', screen, desc)
        s.key('Escape')
        require(s, '!document.querySelector("#dialog[open]")', 'dialog closed')


def sign_in(s):
    s.click('#profile')
    require(s, '!document.getElementById("account-menu").hidden', 'visitor panel')
    s.click('[data-account-action=signin]')
    require(s, 'document.querySelector("#dialog[open]")?.dataset.kind==="login"', 'login dialog')
    s.click('#dialog-content > button.dialog-option')
    require(s, '!document.querySelector("#dialog[open]") && document.querySelector("#profile.account-has-avatar img")?.complete && document.querySelector("#profile img").naturalWidth>0', 'member avatar', 10)
    time.sleep(.4)


def member_states(s, vp, fmt, theme, empties):
    goto(s, 'projects', vp, theme, 'fr')
    sign_in(s)
    if theme == 'light':
        shoot(s, f'g-account-member--{fmt}--fr-{theme}', 'g-account', 'En-tête en membre simulé : Messagerie, Notifications et avatar (fermé)')
    s.click('#profile')
    require(s, '!document.getElementById("account-menu").hidden && document.querySelector(".account-identity")', 'member panel')
    time.sleep(.3)
    shoot(s, f'account-member--{fmt}--fr-{theme}', 'account-member', 'Panneau du compte membre : identité, Compte, Paramètres, Thème, Langue, Se déconnecter', keep_focus=True)
    s.key('Escape')
    if empties:
        for trigger, screen, desc in [('#account-messages', 'messages', 'Messagerie : état vide et Découvrir les profils'),
                                      ('#account-notifications', 'notifications', 'Notifications : état vide')]:
            s.click(trigger)
            require(s, '!document.getElementById("account-menu").hidden && document.querySelector(".account-empty")', screen + ' panel')
            time.sleep(.3)
            shoot(s, f'{screen}--{fmt}--fr-{theme}', screen, desc, keep_focus=True)
            s.key('Escape')


def back_top_states(s, theme_lang_list):
    goto(s, 'projects', MOBILE, 'light', 'fr')
    for theme, lang in theme_lang_list:
        ensure(s, theme, lang)
        s.scroll(1400)
        require(s, 'getComputedStyle(document.getElementById("back-to-top")).display!=="none" && !document.querySelector(".dock-shell").dataset.documentScrolling && getComputedStyle(document.getElementById("back-to-top")).opacity==="1"', 'back to top visible', 10)
        time.sleep(.5)
        shoot(s, f'g-back-top--mobile--{lang}-{theme}', 'g-back-top', 'Liste Projets défilée de 1400 px : bouton Remonter en haut au-dessus de la rangée recherche/dé et du menu')


# ---------------------------------------------------------------------------------------------------------
# Lots

def lot_tokens(s):
    def projects():
        goto(s, 'projects', DESKTOP, 'light', 'fr')
        shoot(s, 'g-dock-projects--desktop--fr-light', 'g-dock', 'Projets actif ; en-tête 42 HORIZON, filtre Monde, capsule de recherche, dé actif, compte visiteur', check=lambda f: None if f['dockCurrent'] == 'projects' else 'dock current')
        save_vars(s, 'desktop-light')
        ensure(s, 'dark', 'fr')
        shoot(s, 'g-dock-projects--desktop--fr-dark', 'g-dock', 'Projets actif, thème sombre')
        save_vars(s, 'desktop-dark')
    attempt(projects)
    def people():
        goto(s, 'people', DESKTOP, 'light', 'fr')
        shoot(s, 'g-dock-people--desktop--fr-light', 'g-dock', 'Profils actif')
        ensure(s, 'dark', 'fr')
        shoot(s, 'g-dock-people--desktop--fr-dark', 'g-dock', 'Profils actif, thème sombre')
    attempt(people)
    attempt(list_state, s, 'journal', DESKTOP, 'light', 'fr', 'g-dock-journal--desktop--fr-light', 'g-dock', 'Chroniques actif')
    attempt(list_state, s, 'awards', DESKTOP, 'light', 'fr', 'awards--desktop--fr-light', 'awards', 'Page 42 Awards : AWARDS dans l’en-tête, message « à venir », menu 42 Awards actif',
            check=lambda f: None if f['awardsNote'] and f['wordmark'] == 'AWARDS' else 'awards note or wordmark missing')
    attempt(list_state, s, 'projects/minishell-under-the-prompt', DESKTOP, 'light', 'fr', 'g-header-reading-project--desktop--fr-light', 'project-overview',
            'Fiche projet : filtre remonté dans l’en-tête (lecture), dock Projets', check=lambda f: None if f['reading'] == 'true' else 'not in reading mode')
    attempt(list_state, s, 'people/profile-ines-morel', DESKTOP, 'light', 'fr', 'g-header-reading-profile--desktop--fr-light', 'profile-overview', 'Fiche profil : en-tête de lecture')
    attempt(list_state, s, 'journal/journal-share-the-unfinished', DESKTOP, 'light', 'fr', 'g-header-reading-article--desktop--fr-light', 'article-article', 'Chronique : en-tête de lecture')


def lot_mobile(s):
    def m390():
        goto(s, 'projects', MOBILE, 'light', 'fr')
        shoot(s, 'g-dock-390--mobile--fr-light', 'g-dock', 'Mobile 390 px : cinq libellés sous les icônes, Projets actif ; en-tête, filtre, capsule et dé')
        save_vars(s, 'mobile-light')
        ensure(s, 'dark', 'fr')
        shoot(s, 'g-dock-390--mobile--fr-dark', 'g-dock', 'Mobile 390 px, thème sombre')
        save_vars(s, 'mobile-dark')
        ensure(s, 'dark', 'ar')
        shoot(s, 'g-dock-390--mobile--ar-dark', 'g-dock', 'Mobile 390 px, arabe sombre (miroir RTL)')
    attempt(m390)
    attempt(list_state, s, 'projects', SMALL, 'light', 'fr', 'g-dock-320--mobile--fr-light', 'g-dock', 'Petit mobile 320 × 640 : seul le libellé actif, filtre compact',
            check=lambda f: None if f['compactScope'] == 'true' else 'dock not compact')
    attempt(list_state, s, 'projects', TINY, 'light', 'fr', 'g-dock-300--mobile--fr-light', 'g-dock', 'Fenêtre 300 × 640 : icônes seules',
            check=lambda f: None if all(h == 0 for h in f['dockLabelHeights']) else 'labels still visible')
    attempt(back_top_states, s, [('light', 'fr'), ('dark', 'fr'), ('light', 'ar')])
    attempt(list_state, s, 'awards', MOBILE, 'light', 'fr', 'awards--mobile--fr-light', 'awards', 'Page 42 Awards sur mobile',
            check=lambda f: None if f['awardsNote'] else 'awards note missing')


def lot_header(s):
    def ar_desktop():
        goto(s, 'projects', DESKTOP, 'light', 'ar')
        shoot(s, 'g-logo--desktop--ar-light', 'g-logo', 'En-tête en arabe : ligne أفق au-dessus de HORIZON, miroir RTL', check=lambda f: None if f['arabicBrand'] else 'arabic line hidden')
        fonts = platform_fonts(s, ['.arabic-brand', '#brand-wordmark .brand-wordmark-cell', '#main-nav > button[data-section=projects] > span',
                                   '.dock-search-toggle-label', '#content-count', '#scope-name'])
        ensure(s, 'light', 'fr')
        fonts.update({'fr ' + k: v for k, v in platform_fonts(s, ['#brand-wordmark .brand-wordmark-cell', '#main-nav > button[data-section=projects] > span', '#content-count']).items()})
        (DOM / AREA).mkdir(parents=True, exist_ok=True)
        (DOM / AREA / '_fonts.json').write_text(json.dumps(fonts, ensure_ascii=False, indent=1))
    attempt(ar_desktop)
    attempt(list_state, s, 'awards', DESKTOP, 'light', 'ar', 'awards--desktop--ar-light', 'awards', 'Page 42 Awards en arabe (ligne arabe masquée sur cette page)',
            check=lambda f: None if f['awardsNote'] else 'awards note missing')
    attempt(list_state, s, 'projects', MOBILE, 'light', 'ar', 'g-logo--mobile--ar-light', 'g-logo', 'En-tête mobile en arabe')
    attempt(list_state, s, 'awards', MOBILE, 'light', 'ar', 'awards--mobile--ar-light', 'awards', 'Page 42 Awards mobile en arabe')
    attempt(list_state, s, 'projects?country=FRA', DESKTOP, 'light', 'fr', 'scope-pill-country--desktop--fr-light', 'projects', 'Filtre de périmètre : pays France (liste Projets)',
            check=lambda f: None if f['scope']['level'] == 'country' else 'not country level')
    attempt(list_state, s, 'projects?country=FRA&campus=paris', DESKTOP, 'light', 'fr', 'scope-pill-campus--desktop--fr-light', 'projects', 'Filtre de périmètre : France › 42 Paris',
            check=lambda f: None if f['scope']['level'] == 'campus' else 'not campus level')
    attempt(list_state, s, 'projects?country=FRA', MOBILE, 'light', 'fr', 'scope-pill-country--mobile--fr-light', 'projects', 'Filtre pays sur mobile')
    attempt(list_state, s, 'projects?country=FRA&campus=paris', MOBILE, 'light', 'fr', 'scope-pill-campus--mobile--fr-light', 'projects', 'Filtre France › 42 Paris sur mobile')
    attempt(list_state, s, 'projects?country=FRA&campus=paris', SMALL, 'light', 'fr', 'scope-pill-campus-compact--mobile--fr-light', 'projects', 'Forme compacte du filtre (320 px : ancêtre masqué)',
            check=lambda f: None if f['compactScope'] == 'true' else 'not compact')
    attempt(list_state, s, 'projects?country=FRA&campus=paris', DESKTOP, 'dark', 'ar', 'scope-pill-campus--desktop--ar-dark', 'projects', 'Filtre France › 42 Paris en arabe sombre')


def lot_search(s):
    for args in [(DESKTOP, 'desktop', 'light', 'fr', 'Paris', 'paris'), (DESKTOP, 'desktop', 'dark', 'fr', 'Paris', 'paris'),
                 (MOBILE, 'mobile', 'light', 'fr', 'Paris', 'paris'), (MOBILE, 'mobile', 'dark', 'fr', 'Paris', 'paris'),
                 (DESKTOP, 'desktop', 'light', 'ar', 'Paris', 'paris'), (MOBILE, 'mobile', 'dark', 'ar', 'Paris', 'paris'),
                 (DESKTOP, 'desktop', 'light', 'fr', '', 'empty'), (DESKTOP, 'desktop', 'light', 'fr', 'zzqx', 'none'),
                 (MOBILE, 'mobile', 'dark', 'fr', 'zzqx', 'none')]:
        attempt(search_state, s, *args)
    attempt(search_state, s, DESKTOP, 'desktop', 'light', 'fr', 'Paris', 'paris-selected', selected=True)


def lot_die(s):
    def noglobe(vp, fmt, theme):
        goto(s, 'explore', vp, theme, 'fr')
        require(s, 'document.getElementById("random-campus").disabled && document.getElementById("loading").textContent.includes("pas pu")', 'explore without globe (error shown)', 25)
        time.sleep(.5)
        shoot(s, f'g-die-disabled-noglobe--{fmt}--fr-{theme}', 'g-die', 'Explorer sans globe (carte bloquée) : dé « Visiter un campus » grisé',
              check=lambda f: None if f['die']['disabled'] else 'die enabled')
    attempt(noglobe, DESKTOP, 'desktop', 'light')
    attempt(noglobe, MOBILE, 'mobile', 'dark')
    def single():
        goto(s, 'projects?country=FRA&campus=mulhouse', DESKTOP, 'light', 'fr')
        s.click('#random-campus')
        require(s, 'location.hash.startsWith("#projects/") && document.getElementById("random-campus").disabled', 'single result drawn', 12)
        time.sleep(.6)
        shoot(s, 'g-die-disabled-single--desktop--fr-light', 'g-die', 'Seul projet de 42 Mulhouse tiré au dé : dé grisé « … · Seul résultat déjà découvert »',
              check=lambda f: None if 'Seul résultat' in f['die']['title'] else 'unexpected die title')
    attempt(single)
    def favorites():
        try:
            goto(s, 'projects', DESKTOP, 'light', 'fr', storage={'horizon-content-preferences-v2': json.dumps({'version': 2, 'favoritesOnly': True, 'favorites': []})})
            shoot(s, 'g-die-disabled-favorites--desktop--fr-light', 'g-die', 'Mes favoris uniquement sans favori : dé grisé « … · Aucun contenu avec ces filtres »',
                  check=lambda f: None if f['die']['disabled'] and 'Aucun contenu' in f['die']['title'] else 'die not disabled for empty favorites')
        finally:
            s.js('(()=>{localStorage.removeItem("horizon-content-preferences-v2");return true})()')
    attempt(favorites)


def lot_account_desktop(s):
    attempt(account_states, s, DESKTOP, 'desktop', 'light', 'fr')
    attempt(account_states, s, DESKTOP, 'desktop', 'dark', 'fr')


def lot_account_mobile(s):
    attempt(account_states, s, MOBILE, 'mobile', 'light', 'fr')
    attempt(account_states, s, MOBILE, 'mobile', 'dark', 'fr')


def lot_account_ar(s):
    attempt(account_states, s, DESKTOP, 'desktop', 'dark', 'ar')


def lot_dialogs(s):
    for vp, fmt, theme in [(DESKTOP, 'desktop', 'light'), (DESKTOP, 'desktop', 'dark'), (MOBILE, 'mobile', 'light'), (MOBILE, 'mobile', 'dark')]:
        attempt(dialog_states, s, vp, fmt, theme)


def lot_member(s):
    for vp, fmt, theme, empties in [(DESKTOP, 'desktop', 'light', True), (DESKTOP, 'desktop', 'dark', False),
                                    (MOBILE, 'mobile', 'light', False), (MOBILE, 'mobile', 'dark', True)]:
        attempt(member_states, s, vp, fmt, theme, empties)


def lot_globe(s):
    """Real MapLibre globe (heavy): Explore with the active die, and the miniature globe in the filter seat."""
    def explore():
        goto(s, 'explore', DESKTOP, 'light', 'fr', block=False)
        if not s.globe_ready(60):
            raise StateError('globe not ready')
        require(s, '!document.getElementById("random-campus").disabled', 'die enabled on Explore', 20)
        time.sleep(1.5)
        shoot(s, 'g-dock-explore--desktop--fr-light', 'g-dock', 'Explorer actif avec le vrai globe : dé actif « Visiter un campus »')
    attempt(explore)
    def miniature():
        goto(s, 'projects', DESKTOP, 'light', 'fr', block=False)
        if not s.globe_ready(60):
            raise StateError('globe not ready')
        require(s, 'document.getElementById("app").dataset.globeDocked==="true"', 'globe docked in the filter seat', 20)
        time.sleep(1.5)
        shoot(s, 'g-dock-projects-globe--desktop--fr-light', 'g-dock', 'Liste Projets avec le vrai globe : miniature du globe dans le siège du filtre')
    attempt(miniature)


def lot_brand(s):
    """Outlined SVG of the wordmarks: Chrome prints a specimen page (same CSS values as the header) to PDF,
    Inkscape converts the embedded glyphs to paths."""
    out = BASE / 'assets' / 'brand'; out.mkdir(parents=True, exist_ok=True)
    tmp = DOM / AREA / '_brand'; tmp.mkdir(parents=True, exist_ok=True)
    page = 'http://127.0.0.1:8765/work/figma/refonte-20261015/scripts/brand-specimen.html'
    measures = {}
    for mark in ['horizon-25', 'awards-25', 'arabic-14']:
        s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.2)
        s.c.call('Page.navigate', {'url': page + '#' + mark})
        require(s, 'document.fonts.status==="loaded" && document.body.dataset.ready==="true"', 'specimen ' + mark, 15)
        box = s.js('(()=>{const e=document.querySelector(".mark:not([hidden]) .glyphs");const r=e.getBoundingClientRect();const st=getComputedStyle(e);return {w:r.width,h:r.height,font:st.fontWeight+" "+st.fontSize+"/"+st.lineHeight+" "+st.fontFamily,ls:st.letterSpacing,text:e.textContent}})()')
        measures[mark] = box
        w_in, h_in = (box['w'] + 2) / 96, (box['h'] + 2) / 96
        pdf = s.c.call('Page.printToPDF', {'paperWidth': w_in, 'paperHeight': h_in, 'marginTop': 0, 'marginBottom': 0, 'marginLeft': 0, 'marginRight': 0,
                                            'printBackground': False, 'preferCSSPageSize': False, 'pageRanges': '1'}, timeout=60)['data']
        import base64
        pdf_path = tmp / f'{mark}.pdf'; pdf_path.write_bytes(base64.b64decode(pdf))
        svg_path = out / f'wordmark-{mark}.svg'
        result = subprocess.run(['inkscape', str(pdf_path), '--pdf-font-strategy=draw-all', '--export-area-page', '--export-plain-svg', '--export-filename=' + str(svg_path)],
                                capture_output=True, text=True, timeout=120)
        print('brand', mark, box, 'inkscape', result.returncode, result.stderr[-200:] if result.returncode else '', flush=True)
    (out / 'wordmark-measures.json').write_text(json.dumps(measures, ensure_ascii=False, indent=1))


LOTS = {'tokens': lot_tokens, 'mobile': lot_mobile, 'header': lot_header, 'search': lot_search, 'die': lot_die,
        'account-desktop': lot_account_desktop, 'account-mobile': lot_account_mobile, 'account-ar': lot_account_ar,
        'dialogs': lot_dialogs, 'member': lot_member, 'globe': lot_globe, 'brand': lot_brand}


def main():
    lots = sys.argv[1:] or ['list']
    if lots == ['list'] or any(lot not in LOTS for lot in lots):
        print('lots:', ', '.join(LOTS)); return
    s = start()
    try:
        for lot in lots:
            print('== lot', lot, flush=True)
            LOTS[lot](s)
    finally:
        try:
            s.close()
        finally:
            if RECORDS or FAILURES:
                path = REF / AREA / 'index.json'
                old = json.loads(path.read_text()) if path.exists() else {}
                failures = [f for f in old.get('failures', []) if f.get('lot') not in lots] + [{**f, 'lot': ','.join(lots), 'at': time.strftime('%Y-%m-%d %H:%M:%S')} for f in FAILURES]
                write_index(AREA, RECORDS, extra={'zone': 'Éléments communs, jetons, compte', 'script': 'scripts/capture_shell.py',
                                                  'prototype': 'http://127.0.0.1:8765/work/visualizations/horizon-welcome/content-preview.html (accès direct, même contrôleur que index.html)',
                                                  'failures': failures})
            print(f'done: {len(RECORDS)} states, {len(FAILURES)} failures, {time.time() - STARTED:.0f}s', flush=True)


if __name__ == '__main__':
    main()
