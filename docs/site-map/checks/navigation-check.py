"""Plays the main links of the site map in the real prototype (read-only) and records what happens.

Each case states what the map claims, then clicks the visible control by its label in headless Chrome.
Usage from the repository root, with the repository served on http://127.0.0.1:8765/:
    python3 docs/site-map/checks/navigation-check.py <output-folder>
"""
import json, pathlib, sys, time

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[2] / 'studies/design-review-studies/checks'))
from helper import Session, ACTIVE, D  # noqa: E402  shared launcher: profiles outside /tmp, memory cap

out = pathlib.Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=True)
s = None
results = []

QA = r'''window.__qa = {
  norm: x => (x || '').replace(/\s+/g, ' ').trim(),
  visible(el) {
    if (!el || el.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    const r = el.getBoundingClientRect(), st = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none' && Number(st.opacity) > 0.05;
  },
  controls(scope) { return [...(scope || document).querySelectorAll('a,button,[role=button],[role=tab],[role=menuitem],[role=option],summary')].filter(el => __qa.visible(el)); },
  names(el) { return [__qa.norm(el.textContent), __qa.norm(el.getAttribute('aria-label')), __qa.norm(el.title)]; },
  find(text, scopeSel, mode) {
    const scope = scopeSel ? document.querySelector(scopeSel) : document;
    if (!scope) return null;
    return __qa.controls(scope).find(el => __qa.names(el).some(n => mode === 'starts' ? n.startsWith(text) : mode === 'has' ? n.includes(text) : n === text)) || null;
  },
  dialogs() { return [...document.querySelectorAll('dialog[open]')].map(d => ({id: d.id, title: __qa.norm((d.querySelector('[id$="title"],h1,h2,h3') || {}).textContent)})); },
};'''


def js(expr, timeout=12):
    return s.js(expr, timeout)


def inject():
    js(QA + ';true')


def load(page, route='', block_globe=True, ready='welcome'):
    s.block_globe(block_globe)
    s.viewport(*D)
    s.c.call('Page.navigate', {'url': 'about:blank'}); time.sleep(.3)
    s.c.call('Page.navigate', {'url': ACTIVE + page + route})
    if ready == 'entrance':
        s.wait('Boolean(document.querySelector("#entry-login"))', 30)
    else:
        s.wait('document.body?.dataset.entry==="welcome"', 40)
    s.wait('document.fonts.status==="loaded"', 10)
    time.sleep(1.2); inject()


def click_el(expr):
    pos = js('(()=>{const el=' + expr + ';if(!el)return null;el.scrollIntoView({block:"center",inline:"nearest"});const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
    if not pos:
        return False
    for kind in ['mousePressed', 'mouseReleased']:
        s.c.call('Input.dispatchMouseEvent', {'type': kind, **pos, 'button': 'left', 'clickCount': 1})
    time.sleep(.8)
    try: inject()
    except Exception: pass
    return True


def click_text(text, scope=None, mode='exact'):
    return click_el(f'__qa.find({json.dumps(text)},{json.dumps(scope)},{json.dumps(mode)})')


def has_text(text, scope=None, mode='exact'):
    return bool(js(f'Boolean(__qa.find({json.dumps(text)},{json.dumps(scope)},{json.dumps(mode)}))'))


def hash_():
    return js('decodeURIComponent(location.hash)')


# Each detail page draws its own Back button; the older generic #content-back is no longer used.
DETAIL = '#content-sheet'
BACK = '__qa.find("Retour", "#content-sheet", "starts")'


def back_label():
    return js(f'__qa.norm(({BACK})?.textContent)')


def dialogs():
    return js('__qa.dialogs()')


def escape():
    s.key('Escape'); time.sleep(.4)


def record(case, claim, observed, ok):
    results.append({'case': case, 'claim': claim, 'observed': observed, 'pass': bool(ok)})
    print(('PASS ' if ok else 'FAIL ') + case, json.dumps(observed, ensure_ascii=False)[:240], flush=True)


def run(case, claim, fn):
    try:
        observed, ok = fn()
    except Exception as error:  # a failed step is recorded, the next cases still run
        observed, ok = {'error': str(error)[:300]}, False
        code = s.c.proc.poll()
        if code is not None:
            log = pathlib.Path(s.c.profile, 'chrome.log')
            observed['chromeExit'] = code
            observed['chromeLog'] = log.read_text(errors='replace')[-1500:] if log.exists() else None
    record(case, claim, observed, ok)


# --- Entrance -------------------------------------------------------------------
def entrance_first_screen():
    load('index.html', '#projects', block_globe=False, ready='entrance'); inject()
    obs = {
        'buttons': js('__qa.controls(document.querySelector("#entrance")).map(el=>el.id||__qa.norm(el.textContent))'),
        'login': js('__qa.norm(document.querySelector("#entry-login")?.textContent)'),
        'visit': js('__qa.norm(document.querySelector("#entry-guest")?.textContent)'),
        'createAccountVisible': has_text('Créer un compte'),
        'accountVisible': js('__qa.visible(document.querySelector("#profile"))'),
        'dockVisible': js('__qa.visible(document.querySelector("#main-nav"))'),
    }
    return obs, obs['login'] and obs['visit'] and not obs['createAccountVisible'] and not obs['accountVisible'] and not obs['dockVisible']


def wait_entry(seconds=90):
    state = None
    for _ in range(seconds // 2):
        try:
            state = s.js('document.body.dataset.entry', 30)
        except Exception:
            state = None
        if state in ('welcome', 'error'): break
        time.sleep(2)
    return state


def entrance_visit_deep_link():
    load('index.html', '#projects', block_globe=False, ready='entrance'); inject()
    click_el('document.querySelector("#entry-guest")')
    state = wait_entry()
    inject()
    obs = {'entry': state, 'hash': hash_(), 'member': js('__qa.visible(document.querySelector("[aria-label=Messagerie]"))')}
    return obs, state == 'welcome' and obs['hash'].startswith('#projects') and not obs['member']


def entrance_error_path():
    load('index.html', '', block_globe=True, ready='entrance'); inject()
    click_el('document.querySelector("#entry-guest")')
    state = wait_entry(70)
    inject()
    obs = {'entry': state,
           'retry': has_text('Réessayer'), 'backToMessage': has_text('Revenir au message'), 'continue': has_text('Continuer sans le globe'),
           'accountVisible': js('__qa.visible(document.querySelector("#profile"))')}
    click_el('document.querySelector("#profile")')
    obs['accountPanelSignUp'] = has_text('Créer un compte'); escape()
    click_text('Continuer sans le globe')
    s.wait('document.body.dataset.entry==="welcome"', 20); time.sleep(1); inject()
    obs['after'] = {'entry': js('document.body.dataset.entry'), 'hash': hash_(), 'noGlobeMessage': js('document.body.innerText.includes("Le globe n’a pas pu se charger")')}
    ok = state == 'error' and obs['retry'] and obs['backToMessage'] and obs['continue'] and obs['accountVisible'] and obs['accountPanelSignUp'] \
        and obs['after']['entry'] == 'welcome' and obs['after']['hash'].startswith('#explore') and obs['after']['noGlobeMessage']
    return obs, ok


def entrance_sign_in():
    load('index.html', '', block_globe=False, ready='entrance'); inject()
    click_el('document.querySelector("#entry-login")')
    obs = {'dialogs': dialogs(), 'simulate': has_text('Simuler une connexion réussie'), 'cancel': has_text('Annuler')}
    click_text('Simuler une connexion réussie')
    state = wait_entry()
    inject()
    obs.update({'entry': state, 'hash': hash_(), 'messagesButton': js('__qa.visible(document.querySelector("[aria-label=Messagerie]"))')})
    ok = any(d['title'] == 'Connexion — prototype' for d in obs['dialogs']) and obs['simulate'] and state == 'welcome' and obs['messagesButton']
    return obs, ok


# --- Bottom menu, lists and detail pages -----------------------------------------------
def dock_everywhere():
    load('content-preview.html', '#projects')
    seen = {}
    for section in ['people', 'journal', 'awards', 'explore', 'projects']:
        click_el(f'document.querySelector("#main-nav button[data-section={section}]")')
        seen[section] = hash_()
    load('content-preview.html', '#awards')
    seen['awards-search-visible'] = js('__qa.visible(document.querySelector(".dock-search-toggle"))')
    seen['awards-die-visible'] = js('__qa.visible(document.querySelector("#random-campus"))')
    seen['awards-dock-visible'] = js('__qa.visible(document.querySelector("#main-nav"))')
    ok = all(seen[k].startswith('#' + k) for k in ['people', 'journal', 'awards', 'explore', 'projects']) and not seen['awards-search-visible'] and not seen['awards-die-visible'] and seen['awards-dock-visible']
    return seen, ok


def card_detail_back_and_dock_noop():
    load('content-preview.html', '#projects')
    click_el('document.querySelector(\'#content-list a[href^="#projects/"]\')')
    obs = {'detail': hash_(), 'back': back_label()}
    click_el('document.querySelector("#main-nav button[data-section=projects]")')
    obs['afterDockProjects'] = hash_()
    click_el(BACK)
    obs['afterBack'] = hash_()
    ok = obs['detail'].startswith('#projects/') and obs['back'] == 'Retour aux projets' and obs['afterDockProjects'] == obs['detail'] and obs['afterBack'].split('?')[0] == '#projects'
    return obs, ok


def project_tabs_team_campus():
    load('content-preview.html', '#projects/minishell-under-the-prompt')
    labels = ['Vue d’ensemble', 'Réalisation', 'Médias', 'Tester le projet', 'Commentaires']
    obs = {'tabs': {l: has_text(l, DETAIL) for l in labels}}
    click_text('Médias', DETAIL); obs['media'] = hash_()
    click_text('Commentaires', DETAIL); obs['comments'] = hash_()
    obs['commentMenus'] = js('__qa.controls(document.querySelector("#content-sheet")).filter(el=>__qa.names(el).some(n=>n.includes("Actions du commentaire"))).length')
    click_text('Vue d’ensemble', DETAIL)
    click_el('document.querySelector(\'#app a[href^="#people/"]:not(#main-nav a)\')')
    obs['teamMember'] = hash_(); obs['teamMemberBack'] = back_label()
    ok = all(obs['tabs'].values()) and 'tab=media' in obs['media'] and 'tab=comments' in obs['comments'] and obs['commentMenus'] == 0 \
        and obs['teamMember'].startswith('#people/') and obs['teamMemberBack'] == 'Retour au projet'
    return obs, ok


def project_campus_windows_and_report():
    load('content-preview.html', '#projects/minishell-under-the-prompt')
    obs = {}
    obs['singleCampusButton'] = has_text('Explorer 42 Paris', DETAIL)
    click_text('Explorer 42 Paris', DETAIL); time.sleep(.8)
    obs['singleCampus'] = dialogs(); obs['campusWindowText'] = js('__qa.norm(document.querySelector("#campus-map-dialog")?.textContent).slice(0,80)'); escape()
    click_text('Signaler', DETAIL, 'starts'); obs['report'] = dialogs(); escape()
    load('content-preview.html', '#projects/ft-transcendence-building-together')
    click_text('Explorer un campus', DETAIL); obs['multiCampus'] = dialogs(); escape()
    ok = any(d['id'] == 'campus-map-dialog' for d in obs['singleCampus']) and 'Autour du campus' in (obs['campusWindowText'] or '') \
        and any(d['title'].startswith('Signaler ce projet') for d in obs['report']) and any(d['title'] == 'Choisir un campus' for d in obs['multiCampus'])
    return obs, ok


def profile_links():
    load('content-preview.html', '#people/profile-ines-morel')
    labels = ['Vue d’ensemble', 'Projets', 'Parcours', 'Contribution']
    obs = {'tabs': {l: has_text(l, DETAIL) for l in labels}}
    click_text('Envoyer un message', DETAIL); obs['message'] = dialogs(); escape()
    click_text('Signaler', DETAIL, 'starts'); obs['report'] = dialogs(); escape()
    click_text('Contribution', DETAIL); obs['contribution'] = hash_()
    click_el('document.querySelector(\'#content-sheet a[href^="#journal/"]\')')
    obs['article'] = hash_(); obs['articleBack'] = back_label()
    ok = all(obs['tabs'].values()) and any('message' in d['title'].lower() for d in obs['message']) and any(d['title'].startswith('Signaler ce profil') for d in obs['report']) \
        and 'tab=contribution' in obs['contribution'] and obs['article'].startswith('#journal/') and obs['articleBack'] == 'Retour au profil'
    return obs, ok


def chronicle_links():
    load('content-preview.html', '#journal/journal-share-the-unfinished')
    labels = ['Article', 'Médias', 'Auteurs', 'Commentaires']
    obs = {'tabs': {l: has_text(l, DETAIL) for l in labels}, 'explore': has_text('Explorer', DETAIL, 'starts')}
    click_text('Auteurs', DETAIL); obs['authors'] = hash_()
    click_el('document.querySelector(\'#app a[href^="#people/"]:not(#main-nav a)\')')
    obs['author'] = hash_(); obs['authorBack'] = back_label()
    ok = all(obs['tabs'].values()) and 'tab=authors' in obs['authors'] and obs['author'].startswith('#people/') and obs['authorBack'] == 'Retour à l’article'
    return obs, ok


def list_filters():
    load('content-preview.html', '#people')
    click_text('Filtrer', '#content-index', 'starts'); obs = {'people': dialogs()}; escape()
    load('content-preview.html', '#journal')
    obs['journalHasFilter'] = has_text('Filtrer', '#content-index', 'starts')
    ok = any(d['title'] == 'Filtrer les profils' for d in obs['people']) and not obs['journalHasFilter']
    return obs, ok


def account_panels():
    load('content-preview.html', '#projects')
    click_el('document.querySelector("#profile")')
    entries = ['Se connecter', 'Créer un compte', 'Paramètres', 'Thème', 'Langue']
    obs = {'visitor': {e: has_text(e, None, 'starts') for e in entries}}
    click_text('Se connecter'); obs['signin'] = dialogs()
    click_text('Continuer avec le profil')
    obs['member'] = js('__qa.visible(document.querySelector("[aria-label=Messagerie]"))')
    click_el('document.querySelector("#profile")'); click_el('document.querySelector("[data-account-action=account]")')
    obs['account'] = hash_()
    click_el('document.querySelector("[aria-label=Messagerie]")')
    obs['discover'] = has_text('Découvrir les profils')
    click_text('Découvrir les profils'); obs['afterDiscover'] = hash_()
    ok = all(obs['visitor'].values()) and any(d['title'] == 'Connexion simulée' for d in obs['signin']) and obs['member'] \
        and obs['account'].startswith('#people/profile-leila-mansour') and obs['discover'] and obs['afterDiscover'].split('?')[0] == '#people'
    return obs, ok


def search_campus():
    load('content-preview.html', '#projects')
    click_el('document.querySelector(".dock-search-toggle")')
    s.c.call('Input.insertText', {'text': 'Paris'}); time.sleep(1.2); inject()
    obs = {'types': js('[...document.querySelectorAll(".dock-search-result-type")].filter(e=>__qa.visible(e)).map(e=>__qa.norm(e.textContent))')}
    click_el('[...document.querySelectorAll(".dock-search-result")].find(r=>__qa.norm(r.querySelector(".dock-search-result-type")?.textContent)==="Campus")')
    obs['after'] = hash_()
    ok = 'Campus' in obs['types'] and obs['after'].startswith('#explore') and 'campus=paris' in obs['after']
    return obs, ok


def explore_about():
    load('content-preview.html', '#explore')
    click_text('Exploration · 42 Horizon', None, 'has'); obs = {'about': dialogs()}; escape()
    return obs, any('Une nouvelle façon d’explorer' == d['title'] for d in obs['about'])


def integrated_selection():
    """Effects of the design-review selection integrated on 15 October that the map records."""
    load('content-preview.html', '#awards')
    obs = {
        'awardsNote': js('__qa.norm(document.querySelector(".awards-coming-soon p")?.textContent)'),
        'awardsNoteVisible': js('__qa.visible(document.querySelector(".awards-coming-soon"))'),
        'controlsInNote': js('document.querySelectorAll(".awards-coming-soon a,.awards-coming-soon button").length'),
        'searchVisible': js('__qa.visible(document.querySelector(".dock-search-toggle"))'),
        'dieVisible': js('__qa.visible(document.querySelector("#random-campus"))'),
        'dockVisible': js('__qa.visible(document.querySelector("#main-nav"))'),
    }
    load('content-preview.html', '#people')
    obs['pendingLoginShown'] = js('[...document.querySelectorAll("#content-list .cp-profile-login")].filter(e=>__qa.visible(e)&&/renseigner/.test(e.textContent)).length')
    obs['realLoginsShown'] = js('[...document.querySelectorAll("#content-list .cp-profile-login[dir]")].filter(e=>__qa.visible(e)).length')
    ok = obs['awardsNote'] == 'Les 42 Awards arrivent bientôt.' and obs['awardsNoteVisible'] and obs['controlsInNote'] == 0 \
        and not obs['searchVisible'] and not obs['dieVisible'] and obs['dockVisible'] and obs['pendingLoginShown'] == 0 and obs['realLoginsShown'] > 0
    return obs, ok


def globe_campus_sheets():
    """Needs the real globe: the campus sheet from Explore, then from the campus window."""
    load('content-preview.html', '#explore?country=FRA&campus=paris', block_globe=False)
    ready = s.globe_ready(60)
    obs = {'globeReady': ready}
    if not ready:
        return obs, False
    time.sleep(7); inject()
    marker = '__qa.controls(document.querySelector("#globe")).find(el=>__qa.names(el).some(n=>n.includes("42 Paris")))'
    obs['markerExplore'] = js(f'Boolean({marker})')
    click_el(marker); time.sleep(.6); obs['exploreSheet'] = dialogs(); escape()
    load('content-preview.html', '#projects/minishell-under-the-prompt', block_globe=False)
    s.globe_ready(60); inject()
    click_text('Explorer 42 Paris', DETAIL); time.sleep(8); inject()
    inner = '__qa.controls(document.querySelector("#campus-map-dialog")).find(el=>__qa.names(el).some(n=>n.includes("42 Paris")) && !__qa.names(el).some(n=>n.includes("Recentrer")))'
    obs['markerWindow'] = js(f'Boolean({inner})')
    click_el(inner); time.sleep(.6); obs['windowSheet'] = dialogs()
    ok = any(d['title'] == '42 Paris' for d in obs['exploreSheet']) and any(d['title'] == '42 Paris' for d in obs['windowSheet']) and any(d['id'] == 'campus-map-dialog' for d in obs['windowSheet'])
    return obs, ok


CASES = [
    # (name, claim, function, needs the real globe)
    ('entrance-first-screen', 'Arrival shows only Sign in and Visit; no Create an account, no account icon, no dock', entrance_first_screen, False),
    ('entrance-error-path', 'Globe failure: Try again / Back to the message / Continue without the globe, account visible with Create an account; Continue opens Explore without the globe', entrance_error_path, False),
    ('dock-everywhere', 'Bottom menu opens each section; on 42 Awards the search and die are hidden, the menu stays', dock_everywhere, False),
    ('card-detail-back-dock-noop', 'Card opens the project page with “Retour aux projets”; the Projects button does nothing there; Back returns to the list', card_detail_back_and_dock_noop, False),
    ('project-tabs-team', 'Project tabs exist; Media and Comments change the address; comments start empty; a team member opens the profile with “Retour au projet”', project_tabs_team_campus, False),
    ('project-campus-report', 'Single campus opens the campus window; Report opens “Signaler ce projet”; a multi-campus project opens “Choisir un campus”', project_campus_windows_and_report, False),
    ('profile-links', 'Profile tabs exist; Send a message and Report open their windows; Contribution leads to a chronicle with “Retour au profil”', profile_links, False),
    ('chronicle-links', 'Chronicle tabs exist; Authors leads to a profile with “Retour à l’article”', chronicle_links, False),
    ('list-filters', 'Profiles has “Filtrer les profils”; Chronicles has no Filter button', list_filters, False),
    ('account-panels', 'Visitor panel entries; simulated sign-in makes a member; Account opens Leïla’s profile; Messages offers Discover profiles', account_panels, False),
    ('search-campus', 'Search for Paris returns a Campus result that opens Explore at 42 Paris', search_campus, False),
    ('explore-about', '“Exploration · 42 Horizon” opens “Une nouvelle façon d’explorer”', explore_about, False),
    ('integrated-selection', '42 Awards shows the coming-soon sentence without any link, search and die hidden; profile cards show no pending-login mention', integrated_selection, False),
    ('entrance-visit-deep-link', 'Visit plays the entrance, then opens the direct link (#projects) as a visitor', entrance_visit_deep_link, True),
    ('entrance-sign-in', 'Sign in opens “Connexion — prototype”; simulating it leads into the site as a member', entrance_sign_in, True),
    ('globe-campus-sheets', 'With the globe: the Paris marker opens the campus sheet in Explore and inside the campus window', globe_campus_sheets, True),
]
only = set(sys.argv[2:])
try:
    for name, claim, fn, globe in CASES:
        if only and name not in only:
            continue
        # Every case gets a fresh Chrome: headless Chrome occasionally aborts while preparing WebGL,
        # so a case interrupted by such a crash is played once more and the retry is recorded.
        for attempt in (1, 2):
            s = Session(out)
            run(name, claim, fn)
            crashed = s.c.proc.poll() is not None
            s.close(); s = None
            if not crashed:
                break
            results[-1]['case'] += f' (Chrome crashed, attempt {attempt})'
finally:
    (out / 'navigation-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n')
    if s is not None: s.close()
    final = {r['case'].split(' (')[0]: r['pass'] for r in results}
    print(f"{sum(final.values())}/{len(final)} cases pass")
