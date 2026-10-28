"""Shared Chrome DevTools helper for the design-review study checks (read-only on the active site).

Usage from a check script placed in checks/:
    import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    from helper import Session, STUDY, ACTIVE, D, M, S
    s = Session(out_dir)            # fresh headless Chrome, isolated profile
    s.open('projects', essais=['voile-pile-basse'], theme='dark', lang='ar', viewport=M, block_globe=True)
    s.shot('name'); s.js('...'); s.close()

Requires Google Chrome and the repository served on http://127.0.0.1:8765/ (python3 -m http.server).
Keep one Session at a time per script: several WebGL pages in parallel make CDP calls time out.
"""
import atexit, base64, fcntl, json, os, select, shutil, subprocess, tempfile, time
from pathlib import Path

# Profiles live on disk and are deleted on close: /tmp is a RAM-backed tmpfs on this
# machine, and undeleted headless profiles once filled it (4 GB) during these checks.
PROFILE_ROOT = Path.home() / '.cache' / 'horizon-design-review-chrome'
# A few headless Chrome at a time on the whole machine (shared slot locks, released on
# close or when the process dies), each one capped so a heavy page cannot starve the
# editor. The slot count is read from SLOTS_FILE at each start (default 3) so it can be
# lowered live; a new Chrome also waits until enough memory is free.
SLOTS_FILE = PROFILE_ROOT / 'slots'
MIN_FREE_MB = int(os.environ.get('HORIZON_CHROME_MIN_FREE_MB', '3000'))
MEMORY_CAP = os.environ.get('HORIZON_CHROME_MEMORY_MAX', '2600M')
CHROME_FLAGS = '--headless=new --remote-debugging-pipe --no-first-run --no-default-browser-check --disable-background-networking --disable-sync --disable-dev-shm-usage --hide-scrollbars --disable-gpu-shader-disk-cache --disk-cache-size=8388608 --media-cache-size=1 --renderer-process-limit=2'

ROOT_URL = 'http://127.0.0.1:8765/'
STUDY = ROOT_URL + 'studies/design-review-studies/baseline/'
ACTIVE = ROOT_URL + 'site/'
D = (1440, 900, False)   # desktop
M = (390, 844, True)     # mobile portrait, DPR 2
S = (320, 640, True)     # small mobile, DPR 2
L = (667, 375, True)     # landscape phone


def _slots():
    try: return max(1, int(SLOTS_FILE.read_text().strip()))
    except (OSError, ValueError): return 3


def _available_mb():
    try:
        with open('/proc/meminfo') as info:
            for line in info:
                if line.startswith('MemAvailable:'): return int(line.split()[1]) // 1024
    except OSError: pass
    return MIN_FREE_MB


def _take_slot():
    # Slot 0 keeps the former single-lock name, so older runs still count as one slot.
    for index in range(_slots()):
        handle = open(PROFILE_ROOT / ('chrome.lock' if index == 0 else f'chrome-slot-{index}.lock'), 'w')
        try: fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB); return handle
        except BlockingIOError: handle.close()
    return None


class Chrome:
    def __init__(self, wait=1800):
        PROFILE_ROOT.mkdir(parents=True, exist_ok=True)
        self.lock = None; start = time.time(); told = False
        while self.lock is None:
            if _available_mb() >= MIN_FREE_MB: self.lock = _take_slot()
            if self.lock is None:
                if not told: print('Waiting for the shared headless Chrome slot…', flush=True); told = True
                if time.time() - start > wait: raise TimeoutError('Chrome slot busy for too long')
                time.sleep(2)
        self.profile = tempfile.mkdtemp(prefix='profile-', dir=PROFILE_ROOT)
        atexit.register(self.close)
        log = open(os.path.join(self.profile, 'chrome.log'), 'w')
        launcher = f'exec 3<&0 4>&1; exec systemd-run --user --scope -q -p MemoryMax={MEMORY_CAP} -p MemorySwapMax=0 /usr/bin/google-chrome {CHROME_FLAGS} --user-data-dir="$1" about:blank'
        self.proc = subprocess.Popen(['bash', '-c', launcher, 'horizon-qa', self.profile], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=log)
        self.seq = 0; self.buf = b''; self.session = None
        target = self.call('Target.createTarget', {'url': 'about:blank'})['targetId']
        self.session = self.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
        self.call('Page.enable'); self.call('Page.bringToFront')
        self.call('Emulation.setFocusEmulationEnabled', {'enabled': True})

    def call(self, method, params=None, timeout=30):
        self.seq += 1; req = {'id': self.seq, 'method': method, 'params': params or {}}
        if self.session: req['sessionId'] = self.session
        self.proc.stdin.write(json.dumps(req).encode() + b'\0'); self.proc.stdin.flush()
        deadline = time.time() + timeout
        while time.time() < deadline:
            if b'\0' not in self.buf:
                if not select.select([self.proc.stdout], [], [], 1)[0]: continue
                data = os.read(self.proc.stdout.fileno(), 1 << 20)
                if not data: raise RuntimeError('Chrome pipe closed')
                self.buf += data
            while b'\0' in self.buf:
                msg, self.buf = self.buf.split(b'\0', 1)
                if not msg: continue
                item = json.loads(msg)
                if item.get('id') == self.seq:
                    if 'error' in item: raise RuntimeError(f"{method}: {item['error']}")
                    return item.get('result', {})
        raise TimeoutError(method)

    def close(self):
        if getattr(self, 'closed', False): return
        self.closed = True
        try: self.call('Browser.close', timeout=10)
        except Exception: pass
        try: self.proc.wait(timeout=10)
        except Exception:
            self.proc.kill()
            try: self.proc.wait(timeout=5)
            except Exception: pass
        shutil.rmtree(self.profile, ignore_errors=True)
        try: fcntl.flock(self.lock, fcntl.LOCK_UN); self.lock.close()
        except Exception: pass


class Session:
    def __init__(self, out_dir):
        self.out = Path(out_dir); self.out.mkdir(parents=True, exist_ok=True)
        self.c = Chrome(); self.log = []
        self.c.call('Page.addScriptToEvaluateOnNewDocument', {'source': 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));const ce=console.error;console.error=(...a)=>{qaErrors.push(a.map(String).join(" "));ce(...a)}'})
        self.c.call('Network.enable')
        self.reduced(True)

    # -- primitives -------------------------------------------------------
    def js(self, expr, timeout=12):
        """Evaluate without awaitPromise (a pending promise must never hang the session)."""
        res = self.c.call('Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'timeout': timeout * 1000}, timeout=timeout + 3)
        if 'exceptionDetails' in res: raise RuntimeError(json.dumps(res['exceptionDetails'])[:400])
        return res['result'].get('value')

    def wait(self, expr, seconds=25):
        end = time.time() + seconds
        while time.time() < end:
            try:
                if self.js(expr, 5): return True
            except Exception: pass
            time.sleep(.2)
        return False

    def viewport(self, w, h, mobile=False):
        self.c.call('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2 if mobile else 1, 'mobile': mobile})
        self.c.call('Emulation.setTouchEmulationEnabled', {'enabled': mobile, 'maxTouchPoints': 5 if mobile else 1})

    def reduced(self, on):
        self.c.call('Emulation.setEmulatedMedia', {'features': [{'name': 'prefers-reduced-motion', 'value': 'reduce' if on else 'no-preference'}]})

    def block_globe(self, on):
        self.c.call('Network.setBlockedURLs', {'urls': ['*integrated-globe.mjs*'] if on else []})

    def url(self, route='projects', essais=(), theme=None, lang=None, page='content-preview.html', base=STUDY):
        query = []
        if essais: query.append('essais=' + ','.join(essais))
        if theme: query.append('theme=' + theme)
        if lang: query.append('lang=' + lang)
        query.append('qa=design-review')
        return base + page + '?' + '&'.join(query) + ('#' + route if route else '')

    def open(self, route='projects', essais=(), theme='light', lang='fr', viewport=D, block_globe=False, page='content-preview.html', base=STUDY, settle=1.2):
        """Open a study (or active, base=ACTIVE) page. Theme/lang come from the URL in the study.
        For the active site (no URL parameters), theme/lang are applied through the account menu."""
        self.block_globe(block_globe)
        self.viewport(*viewport)
        self.c.call('Page.navigate', {'url': self.url(route, essais, theme if base == STUDY else None, lang if base == STUDY else None, page, base)})
        if page == 'index.html':
            self.wait('Boolean(document.querySelector("#entry-login"))', 30)
        else:
            self.wait('document.body?.dataset.entry==="welcome"', 30)
        self.wait('document.fonts.status==="loaded"', 10)
        if base == STUDY:
            self.wait('document.documentElement.dataset.essaisReady==="true"', 15)
            if page != 'index.html' and lang: self.wait(f'document.documentElement.lang==={json.dumps(lang)}', 10)
        elif page != 'index.html' and (theme != 'light' or lang != 'fr'):
            self.settings(lang, theme)
        if not block_globe and page != 'index.html' and route.split('?')[0].split('/')[0] == 'explore':
            if not self.globe_ready() and getattr(self, '_retrying', False) is False:
                # A cold headless GPU occasionally fails the first WebGL preparation; retry once and say so.
                self.record('globe-retry', {'route': route, 'essais': list(essais)})
                self._retrying = True
                try: return self.open(route, essais, theme, lang, viewport, block_globe, page, base, settle)
                finally: self._retrying = False
        time.sleep(settle); self.away(); self.blur()

    def globe_ready(self, seconds=50):
        """True once the real globe canvas is shown; False if the prototype reports a loading error."""
        end = time.time() + seconds
        while time.time() < end:
            try:
                state = self.js('(()=>{const l=document.querySelector("#loading");return{hidden:Boolean(l?.hidden),text:l?.textContent||"",canvas:Boolean(document.querySelector("#globe canvas"))}})()', 5)
                if state['hidden'] and state['canvas']: return True
                if not state['hidden'] and ('pas pu' in state['text'] or 'could not' in state['text'].lower() or 'تعذّر' in state['text'] or 'تعذر' in state['text']): return False
            except Exception: pass
            time.sleep(.3)
        return False

    def settings(self, locale, theme):
        self.click('#profile'); self.click('[data-account-action=settings]')
        self.click(f'[data-account-locale={locale}]'); self.click(f'[data-account-theme={theme}]')
        self.click('[data-account-action=back]'); self.key('Escape'); self.away(); self.blur(); time.sleep(.3)

    def click(self, selector):
        pos = self.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return null;e.scrollIntoView({block:"nearest"});const r=e.getBoundingClientRect();if(!r.width||!r.height)return null;return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
        if not pos: raise RuntimeError('missing/hidden ' + selector)
        for kind in ['mousePressed', 'mouseReleased']:
            self.c.call('Input.dispatchMouseEvent', {'type': kind, **pos, 'button': 'left', 'clickCount': 1})
        time.sleep(.3)

    def key(self, name, shift=False):
        codes = {'Escape': 27, 'Tab': 9, 'Enter': 13, 'ArrowDown': 40, 'ArrowUp': 38}
        for kind in ['keyDown', 'keyUp']:
            self.c.call('Input.dispatchKeyEvent', {'type': kind, 'key': name, 'code': name, 'windowsVirtualKeyCode': codes[name], 'modifiers': 8 if shift else 0})
        time.sleep(.25)

    def away(self):
        self.c.call('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'x': 2, 'y': 2}); time.sleep(.15)

    def blur(self):
        self.js('(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();return true})()')

    def scroll(self, y):
        self.js(f'(()=>{{window.scrollTo(0,{y});return true}})()'); time.sleep(1.5)

    def shot(self, name, timeout=60):
        data = self.c.call('Page.captureScreenshot', {'format': 'png', 'optimizeForSpeed': True}, timeout=timeout)['data']
        path = self.out / (name + '.png'); path.write_bytes(base64.b64decode(data)); return path

    def errors(self):
        try: return self.js('window.qaErrors||[]', 5)
        except Exception as error: return [f'unreadable: {error}']

    def overflow(self):
        return self.js('document.documentElement.scrollWidth>innerWidth+1')

    def rect(self, selector):
        return self.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,w:r.width,h:r.height,display:s.display,visibility:s.visibility,opacity:s.opacity}})()')

    def style(self, selector, props=('color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'borderColor', 'borderRadius')):
        return self.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)return null;const s=getComputedStyle(e);return Object.fromEntries(' + json.dumps(list(props)) + '.map(k=>[k,s[k]]))})()')

    def record(self, name, value):
        self.log.append({'case': name, 'result': value}); print(name, json.dumps(value, ensure_ascii=False)[:300], flush=True)

    def close(self):
        self.c.close()


def contrast(fg, bg):
    """WCAG contrast of two (r,g,b) tuples in 0..255."""
    def lum(c):
        out = []
        for v in c:
            v /= 255; out.append(v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4)
        return .2126 * out[0] + .7152 * out[1] + .0722 * out[2]
    a, b = lum(fg), lum(bg)
    return (max(a, b) + .05) / (min(a, b) + .05)


def image_diff(a, b):
    """Share of differing pixels between two PNGs (requires PIL + numpy)."""
    from PIL import Image
    import numpy as np
    x = np.asarray(Image.open(a).convert('RGB'), dtype=int); y = np.asarray(Image.open(b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return 1.0
    return float((np.abs(x - y).sum(axis=2) > 24).mean())
