"""Variant runner of the Figma rebuild (15 October 2026): every state in FR/EN/AR x light/dark x desktop/mobile.

Shared by capture_explorer.py, capture_projects.py, capture_profiles.py and capture_shell.py. Chrome is only ever
reached through capture_lib.py (start, open_app, snap): one Session per run, closed in a finally block.

- A job = one state group, one format, one variant (language-theme). It opens a fresh document (storage of the
  prototype cleared, about:blank, then open_app(theme=, lang=)), checks <html> theme/lang, plays the same actions
  for every variant and calls ctx.capture() once per state it produces.
- Names: <state>--<desktop|mobile>--<fr|en|ar>-<light|dark>. Viewport (+ full-height) screenshots go to
  ../reference/<zone>/, layout dumps to ../dom/<zone>/, records to ../reference/<zone>/index.json (pass PASS).
- Runs are resumable: a job whose states already have a PASS record is skipped (use --force to redo them).
  The run stops cleanly before its time budget (timeout 580 s around the script, Chrome slot wait included).
- A state whose expected interface is not reached, or is lost during the capture, is never recorded as good:
  its files are removed and the reason is listed under "failures" in the index.
"""
import gzip, hashlib, json, os, pathlib, re, signal, sys, time, traceback

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from capture_lib import start, open_app, snap, write_index, contact_sheet, version, DESKTOP, MOBILE, BASE, REF, DOM, REPO  # noqa: E402

PASS = 'variants-20261015'
STAR = ('fr-light', 'fr-dark', 'en-light', 'ar-light', 'ar-dark')
BASIC = ('fr-light', 'fr-dark', 'en-light', 'ar-light')
ORDER = {v: i for i, v in enumerate(STAR)}
FORMATS = {'desktop': DESKTOP, 'mobile': MOBILE}
ORIGIN = 'http://127.0.0.1:8765'
PROTO = REPO / 'site'
BUDGET = float(os.environ.get('CAPTURE_BUDGET', '545'))
# Signature of the capture_lib.py loaded by this run: the extraction may evolve (e.g. svgKids added on 15 Oct, 22:13).
LIB = hashlib.sha256((HERE / 'capture_lib.py').read_bytes()).hexdigest()[:12]
STARTED = time.time()

# A capture killed by `timeout` must still close its Chrome (finally blocks run on SystemExit).
signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))


class StateError(Exception):
    pass


def left():
    return BUDGET - (time.time() - STARTED)


def fingerprint():
    """Short hash of the prototype files that shape the rendering (tests excluded), to detect a change mid-pass."""
    h = hashlib.sha256()
    files = [p for ext in ('*.mjs', '*.css', '*.html', '*.js', '*.json') for p in PROTO.glob(ext) if '.test.' not in p.name]
    files.append(REPO / 'shared' / 'brand' / 'tokens.css')
    for p in sorted(files):
        if p.exists():
            h.update(p.name.encode()); h.update(p.read_bytes())
    return h.hexdigest()[:16]


STATE_JS = ('({theme:document.documentElement.dataset.theme||null,preference:document.documentElement.dataset.themePreference||null,'
            'lang:document.documentElement.lang,dir:document.documentElement.dir||"ltr",entry:document.body.dataset.entry||null,'
            'section:document.getElementById("app")?.dataset.section||null,reading:document.getElementById("app")?.dataset.reading||null,'
            'hash:location.hash,scrollY:Math.round(scrollY),viewport:[innerWidth,innerHeight,devicePixelRatio]})')


# Interface facts compared between the variants of a state (status.py flags any difference).
UI_JS = ('(()=>{const v=e=>Boolean(e)&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=="hidden"&&!e.closest("[hidden]");'
         'const b=document.getElementById("back-to-top");return {backTop:v(b)&&getComputedStyle(b).opacity!=="0",'
         'dialogs:[...document.querySelectorAll("dialog[open]")].map(d=>d.id||d.className.split(" ")[0]),'
         'accountMenu:v(document.getElementById("account-menu")),search:document.querySelector(".dock-shell")?.dataset.searchOpen==="true",'
         'scopePopover:v(document.getElementById("scope-popover")),menus:[...document.querySelectorAll(".cp-control-panel,.cp-comment-owner-menu,[role=menu]")].filter(v).map(m=>m.id||m.className.split(" ")[0]),'
         'dockScrolling:document.querySelector(".dock-shell")?.dataset.documentScrolling||null}})()')


UUID = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')


def normalize_keys(path):
    """Comments get random ids (crypto.randomUUID) that end up in element ids, hence in the stable keys "k" of the
    dump: each UUID is replaced in the keys by uuid-1, uuid-2… in order of first appearance, so the same element
    has the same key in every variant. Original ids stay in "id"; the mapping is kept in meta.keyNormalization."""
    data = json.loads(gzip.decompress(path.read_bytes()))
    mapping = {}
    for node in data['nodes']:
        for found in UUID.findall(node['k']):
            mapping.setdefault(found, f'uuid-{len(mapping) + 1}')
    if not mapping:
        return 0
    for node in data['nodes']:
        node['k'] = UUID.sub(lambda m: mapping[m.group(0)], node['k'])
    data.setdefault('meta', {})['keyNormalization'] = {v: k for k, v in mapping.items()}
    path.write_bytes(gzip.compress(json.dumps(data, ensure_ascii=False).encode()))
    return len(mapping)


def page_state(s):
    return s.js(STATE_JS)


def fresh(s):
    """Clear the prototype's storage (theme, favorites, view, comments, reports) and leave the document, so the
    next open is a real load even when only the hash differs."""
    try:
        s.js('(()=>{if(location.origin===' + json.dumps(ORIGIN) + '){try{localStorage.clear();sessionStorage.clear()}catch(e){}}return true})()', 5)
    except Exception:
        pass
    s.c.call('Page.navigate', {'url': 'about:blank'})
    time.sleep(.35)


def harden(s):
    """content-preview.html carries data-entry="welcome" in its markup, so Session.open() may reach the account
    menu before welcome.mjs has mounted it (cold Chrome): Session.settings() then waits for the mounted menu and
    is tried again if a click found nothing. Same procedure (Compte > Paramètres > langue, thème), only safer."""
    original = s.settings

    def settings(locale, theme):
        s.wait('Boolean(document.getElementById("account-menu"))&&Boolean(document.querySelector("#profile svg, #profile img"))', 25)
        time.sleep(.3)
        for attempt in range(3):
            try:
                return original(locale, theme)
            except RuntimeError as error:
                if 'missing/hidden' not in str(error) or attempt == 2:
                    raise
                print(f'  settings retry ({error})', flush=True)
                s.key('Escape'); time.sleep(1.0)
    s.settings = settings
    return s


def tap(s, selector, settle=.35, at=.5):
    """Click the centre of an element after scrolling it to the middle of the window: Session.click() only scrolls
    it into view ("nearest"), where the fixed bottom menu or search row can receive the click instead. The scroll
    is left to settle first: menus of the prototype close on any document scroll event."""
    sel = json.dumps(selector)
    # at: where the element's centre lands, as a share of the window height (0.5 = middle)
    moved = s.js('(()=>{const e=document.querySelector(' + sel + ');if(!e)return null;const y=scrollY;const r=e.getBoundingClientRect();'
                 'const max=document.documentElement.scrollHeight-innerHeight;'
                 'const target=Math.max(0,Math.min(max,Math.round(scrollY+r.top+r.height/2-' + str(at) + '*innerHeight)));'
                 'window.scrollTo({top:target,left:scrollX,behavior:"instant"});return scrollY!==y})()')
    if moved is None:
        raise StateError('missing ' + selector)
    if moved:
        time.sleep(.6)
    pos = s.js('(()=>{const e=document.querySelector(' + sel + ');if(!e)return null;const r=e.getBoundingClientRect();'
               'if(!r.width||!r.height)return null;const x=r.x+r.width/2,y=r.y+r.height/2;const h=document.elementFromPoint(x,y);'
               'return {x,y,ok:Boolean(h)&&(h===e||e.contains(h)),hit:h?String(h.id||h.className||h.tagName):null}})()')
    if not pos:
        raise StateError('missing/hidden ' + selector)
    if not pos['ok']:
        raise StateError(f'{selector} covered by {pos["hit"]}')
    for kind in ['mousePressed', 'mouseReleased']:
        s.c.call('Input.dispatchMouseEvent', {'type': kind, 'x': pos['x'], 'y': pos['y'], 'button': 'left', 'clickCount': 1})
    time.sleep(settle)


class Job:
    def __init__(self, state, fmt, variant, fn, produces, cost, vp=None):
        self.state, self.fmt, self.variant, self.fn = state, fmt, variant, fn
        self.lang, self.theme = variant.split('-')
        self.vp = vp or FORMATS[fmt]
        self.produces = [f'{name}--{fmt}--{variant}' for name in produces]
        self.cost = cost

    def __repr__(self):
        return f'{self.state}--{self.fmt}--{self.variant}'


class Ctx:
    """What a job function receives: the Session, the variant, and open/capture helpers."""

    def __init__(self, runner, s, job):
        self.runner, self.s, self.job = runner, s, job
        self.zone, self.fmt, self.lang, self.theme, self.vp = runner.zone, job.fmt, job.lang, job.theme, job.vp
        self.actions, self.route, self.page = [], None, 'content-preview.html'
        self.facts = {}

    def act(self, text):
        self.actions.append(text)

    def open(self, route, globe=None, settle=1.2, page='content-preview.html'):
        # 18 Oct., decision of the user: captured with the real globe (docked in the « Monde » medallion of the content
        # pages, as on the site), unless a job asks for it blocked (explore-noglobe); the entrance has its own globe modes
        if globe is None:
            globe = page != 'index.html'
        s = self.s
        fresh(s)
        self.route, self.page, self.actions = route, page, []
        open_app(s, route, self.vp, theme=self.theme, lang=self.lang, entrance=page == 'index.html', block_globe=not globe, settle=settle)
        if globe and page != 'index.html':
            if not s.globe_ready(60):
                raise StateError('globe not ready: ' + route)
            if route.split('?')[0].split('/')[0] != 'explore':
                self.need('document.getElementById("app")?.dataset.globeDocked==="true"', 'globe docked in the medallion', 20)
            time.sleep(1.5)
        state = page_state(s)
        if state['theme'] != self.theme or state['lang'] != self.lang:
            s.settings(self.lang, self.theme); time.sleep(.6)
            state = page_state(s)
        if state['theme'] != self.theme or state['lang'] != self.lang:
            raise StateError(f'theme/lang not applied: {state["theme"]}/{state["lang"]} instead of {self.theme}/{self.lang}')
        self.act(f'ouvrir {page}#{route} ({self.vp[0]}x{self.vp[1]}{" DPR2" if self.vp[2] else ""}, '
                 f'{"vrai globe" if globe else "module du globe bloqué"}), stockage vidé'
                 + ('' if (self.theme, self.lang) == ('light', 'fr') else f', puis Compte > Paramètres : langue {self.lang}, thème {self.theme}'))
        return state

    def need(self, expr, what, seconds=10):
        if not self.s.wait(expr, seconds):
            raise StateError('not reached: ' + what)

    def capture(self, state, nodes, full=False, keep_focus=False, expect=None, checks=None, note=None, extra_full=None):
        """snap() of capture_lib with checks before and after. keep_focus keeps the focused element (panels that
        close when focus leaves them). expect: JS expression that must hold before and after the capture."""
        s, job = self.s, self.job
        name = f'{state}--{self.fmt}--{self.lang}-{self.theme}'
        before = page_state(s)
        if [before['theme'], before['lang']] != [self.theme, self.lang]:
            raise StateError(f'{name}: theme/lang {before["theme"]}/{before["lang"]}')
        if expect and not s.wait(expect, 8):
            raise StateError(f'{name}: expected state not reached ({expect[:120]})')
        meta = {'state': state, 'siteMapNodes': nodes, 'variant': f'{self.lang}-{self.theme}', 'format': self.fmt,
                'routeOpened': '#' + (self.route or ''), 'page': self.page, 'actions': list(self.actions), 'pass': PASS}
        saved = s.blur
        if keep_focus:
            s.blur = lambda: None
        try:
            rec = snap(s, self.zone, name, full=full, meta=meta)
        finally:
            s.blur = saved
        ui = s.js(UI_JS)
        lost = expect and not s.js(expect)
        after = page_state(s)
        if lost or [after['theme'], after['lang']] != [self.theme, self.lang]:
            self.runner.discard(name)
            raise StateError(f'{name}: state lost during the capture' + (f' ({expect[:120]})' if lost else ' (theme/lang)'))
        if extra_full:
            rec['full'] = extra_full(name)
        if rec.get('dom'):
            normalized = normalize_keys(BASE / rec['dom'])
            if normalized:
                rec['keyNormalization'] = f'{normalized} UUID(s) replaced in the keys'
        rec.update({'state': state, 'siteMapNodes': nodes, 'format': self.fmt, 'lang': self.lang, 'theme': self.theme,
                    'dir': before['dir'], 'viewportSize': list(self.vp), 'page': self.page, 'routeOpened': '#' + (self.route or ''),
                    'route': before['hash'], 'actions': list(self.actions), 'checks': {**self.facts, **(checks or {})},
                    'keptFocus': keep_focus, 'scrollY': before['scrollY'], 'ui': ui, 'pass': PASS, 'sources': self.runner.sources, 'lib': LIB,
                    'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')})
        if note:
            rec['note'] = note
        self.runner.record(rec)
        return rec


class Runner:
    def __init__(self, zone, zone_label, states, lots, restart_every=None, relib=None):
        self.zone, self.zone_label, self.states, self.lots = zone, zone_label, states, lots
        # Globe pages accumulate GPU/WebGL memory in one Chrome: a new Session every N jobs keeps it under the cap.
        self.restart_every = restart_every
        self.index_path = REF / zone / 'index.json'
        self.index = json.loads(self.index_path.read_text()) if self.index_path.exists() else {'area': zone, 'states': []}
        relib = '--relib' in sys.argv if relib is None else relib
        # --relib: a capture made with another capture_lib.py counts as not done; accept=<lib,...> keeps some older ones
        accepted = {LIB} | {v for a in sys.argv if a.startswith('accept=') for v in a.split('=', 1)[1].split(',') if v}
        self.done = {r['name'] for r in self.index['states'] if r.get('pass') == PASS and (not relib or r.get('lib') in accepted)}
        self.records, self.failures, self.touched = [], [], set()
        self.sources = fingerprint()

    # -- bookkeeping ---------------------------------------------------------------------------------------
    def record(self, rec):
        self.records.append(rec); self.done.add(rec['name']); self.touched.add((rec['state'], rec['format']))
        write_index(self.zone, [rec], extra={'zone': self.zone_label, 'pass': PASS, 'naming': '<state>--<desktop|mobile>--<fr|en|ar>-<light|dark>',
                                             'script': f'scripts/capture_{self.zone}.py (runner scripts/variants.py)'})
        self._fix_failures(ok=rec['name'])
        print(f'  ok {rec["name"]} nodes={rec.get("nodes")} doc={rec.get("doc")} overflow={rec.get("overflow")} '
              f'errors={len(rec.get("errors") or [])} [{rec.get("version")}]', flush=True)

    def discard(self, name):
        for p in [REF / self.zone / f'{name}.png', REF / self.zone / f'{name}--full.png', DOM / self.zone / f'{name}.json.gz']:
            try:
                p.unlink()
            except FileNotFoundError:
                pass

    def _fix_failures(self, ok=None, new=None):
        data = json.loads(self.index_path.read_text()) if self.index_path.exists() else {'area': self.zone, 'states': []}
        failures = [f for f in data.get('failures', []) if f.get('pass') == PASS and not all(n in self.done for n in f.get('names', []))]
        if new:
            failures = [f for f in failures if f.get('job') != new['job']] + [new]
        data['failures'] = failures
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self.index_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))

    def fail(self, job, error):
        item = {'job': repr(job), 'names': job.produces, 'reason': str(error)[:400], 'pass': PASS, 'at': time.strftime('%Y-%m-%d %H:%M:%S')}
        self.failures.append(item); self._fix_failures(new=item)
        print(f'  FAILED {job!r}: {str(error)[:300]}', flush=True)

    # -- jobs ----------------------------------------------------------------------------------------------
    def jobs(self, names, formats=None, variants=None):
        out = []
        for spec in self.states:
            if spec['name'] not in names:
                continue
            for fmt in spec['formats']:
                if formats and fmt not in formats:
                    continue
                for variant in spec['variants'](fmt) if callable(spec['variants']) else spec['variants']:
                    if variants and variant not in variants:
                        continue
                    out.append(Job(spec['name'], fmt, variant, spec['fn'], spec['produces'](fmt) if callable(spec['produces']) else spec['produces'],
                                   spec.get('cost', 25), (spec.get('vp') or {}).get(fmt)))
        return out

    def run(self, lot, force=False, formats=None, variants=None, only=None):
        names = self.lots[lot] if lot in self.lots else [lot]
        if only:
            names = [n for n in names if n in only]
        jobs = self.jobs(names, formats, variants)
        todo = [j for j in jobs if force or not all(n in self.done for n in j.produces)]
        print(f'== {self.zone} lot {lot}: {len(jobs)} jobs, {len(todo)} to do, sources {self.sources}', flush=True)
        self.s, used = None, 0
        stopped = []
        try:
            for job in todo:
                for attempt in range(2):
                    if left() < job.cost:
                        stopped.append(job); break
                    if self.s is not None and self.restart_every and used >= self.restart_every:
                        self.close_session(); used = 0
                    if self.s is None:
                        t0 = time.time()
                        self.s = harden(start()); used = 0
                        print(f'  chrome ready in {time.time() - t0:.0f}s', flush=True)
                        if left() < job.cost:
                            stopped.append(job); break
                    t0 = time.time()
                    print(f'- {job!r}' + (' (retry with a new Chrome)' if attempt else ''), flush=True)
                    ctx = Ctx(self, self.s, job)
                    used += 1
                    try:
                        job.fn(ctx)
                        dead = False
                    except Exception as error:  # a failed state is reported, never recorded as good
                        dead = isinstance(error, (BrokenPipeError, ConnectionError)) or 'pipe closed' in str(error) or (
                            isinstance(error, TimeoutError) and not isinstance(error, StateError))
                        self.fail(job, f'{type(error).__name__}: {error}' + (' (Chrome lost)' if dead else ''))
                        if not isinstance(error, StateError):
                            traceback.print_exc(limit=3)
                    print(f'  ({time.time() - t0:.0f}s, {left():.0f}s left)', flush=True)
                    if not dead:
                        break
                    self.close_session(); used = 0
        finally:
            self.close_session()
            after = fingerprint()
            if after != self.sources:
                print(f'WARNING: prototype sources changed during the run ({self.sources} -> {after})', flush=True)
                data = json.loads(self.index_path.read_text())
                data.setdefault('anomalies', []).append({'at': time.strftime('%Y-%m-%d %H:%M:%S'), 'lot': lot,
                                                         'text': f'sources changed during the run {self.sources} -> {after}'})
                self.index_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))
            self.sheets()
            remaining = [j for j in todo if not all(n in self.done for n in j.produces)]
            print(f'== done: {len(self.records)} captures, {len(self.failures)} failures, {len(remaining)} jobs remaining '
                  f'({len(stopped)} not started for time), {time.time() - STARTED:.0f}s', flush=True)
            if remaining:
                print('remaining:', ' '.join(repr(j) for j in remaining), flush=True)

    def close_session(self):
        if getattr(self, 's', None) is not None:
            try:
                self.s.close()
            except Exception:
                pass
        self.s = None

    # -- contact sheets ------------------------------------------------------------------------------------
    def sheets(self, everything=False):
        data = json.loads(self.index_path.read_text()) if self.index_path.exists() else {'states': []}
        groups = {}
        for r in data['states']:
            if r.get('pass') != PASS:
                continue
            if not everything and (r['state'], r['format']) not in self.touched:
                continue
            groups.setdefault((r['state'], r['format']), []).append(r)
        for (state, fmt), recs in sorted(groups.items()):
            recs.sort(key=lambda r: ORDER.get(f'{r["lang"]}-{r["theme"]}', 9))
            paths = [BASE / r['viewport'] for r in recs if (BASE / r['viewport']).exists()]
            if not paths:
                continue
            desktop = fmt == 'desktop' and recs[0]['viewportSize'][0] > 1000
            out = contact_sheet(paths, DOM / self.zone / '_sheets' / f'{state}--{fmt}.png', cols=3 if desktop else 5, thumb_w=480 if desktop else 280)
            print('sheet', out.relative_to(BASE), flush=True)
            fulls = [BASE / r['full'] for r in recs if r.get('full') and (BASE / r['full']).exists()]
            if fulls:
                out = contact_sheet(fulls, DOM / self.zone / '_sheets' / f'{state}--{fmt}--full.png', cols=5, thumb_w=240 if desktop else 160)
                print('sheet', out.relative_to(BASE), flush=True)


def main(runner, doc):
    args = sys.argv[1:]
    if not args or args[0] in ('-h', '--help', 'list'):
        print(doc)
        for lot, names in runner.lots.items():
            jobs = runner.jobs(names)
            print(f'  {lot}: {", ".join(names)}  ({len(jobs)} jobs, {sum(1 for j in jobs if all(n in runner.done for n in j.produces))} done)')
        return
    if args[0] == 'sheets':
        runner.touched = set(); runner.sheets(everything=True); return
    lot = args[0]
    opts = dict(a.split('=', 1) for a in args[1:] if '=' in a)
    runner.run(lot, force='--force' in args,
               formats=set(opts['formats'].split(',')) if 'formats' in opts else None,
               variants=set(opts['variants'].split(',')) if 'variants' in opts else None,
               only=set(opts['only'].split(',')) if 'only' in opts else None)
