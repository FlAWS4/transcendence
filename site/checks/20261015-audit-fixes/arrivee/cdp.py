"""Aide CDP de la vérification du 15 octobre 2026 — zone « arrivée » (D1, D4, D5).

Classe Chrome reprise de checks/20261012-multi-campus-browser.py (CDP par tube),
avec trois différences limitées à la mesure :
- le journal d'erreurs de Chrome va dans le dossier temporaire verif-arrivee/ ;
- les événements CDP (console, exceptions, journal réseau) sont conservés au lieu d'être ignorés ;
- le délai d'attente d'une réponse est réglable par appel.
Les scripts qui l'utilisent n'écrivent que sous checks/20261015-audit-fixes/arrivee/
et sous le dossier temporaire verif-arrivee/. Aucun fichier source n'est modifié.
"""
import os, subprocess, json, select, time, tempfile, base64, shutil, hashlib
from pathlib import Path

HW = Path('/home/le-rif/Bureau/Transcendence/site')
EVID = HW / 'checks/20261015-audit-fixes/arrivee'
TMP = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-arrivee')
BASE = 'http://127.0.0.1:8765/site/'
A144 = 'archive/pre-codex-audit-fixes-20261015/baseline/'
SOURCES = ['index.html', 'content-preview.html', 'welcome.mjs', 'content-preview.mjs', 'entrance.mjs', 'entrance.css',
           'account-menu.mjs', 'account-menu.css', 'welcome-panels.html', 'welcome-panels.mjs',
           A144 + 'index.html', A144 + 'welcome.mjs', A144 + 'entrance.mjs', A144 + 'entrance.css']


def hashes():
    return {n: hashlib.sha256((HW / n).read_bytes()).hexdigest() for n in SOURCES}


class Chrome:
    def __init__(self, log='chrome-stderr.log'):
        TMP.mkdir(parents=True, exist_ok=True)
        self.profile = tempfile.mkdtemp(prefix='horizon-verif-arrivee-')
        self.proc = subprocess.Popen(['bash', '-c', 'exec 3<&0 4>&1; exec /usr/bin/google-chrome --headless=new --remote-debugging-pipe --no-first-run --no-default-browser-check --disable-background-networking --disable-sync --disable-dev-shm-usage --user-data-dir="$1" about:blank', 'horizon-qa', self.profile],
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=open(TMP / log, 'a'))
        self.seq = 0; self.buf = b''; self.session = None; self.console = []; self.url = 'about:blank'
        target = self.call('Target.createTarget', {'url': 'about:blank'})['targetId']
        self.session = self.call('Target.attachToTarget', {'targetId': target, 'flatten': True})['sessionId']
        self.call('Page.enable'); self.call('Page.bringToFront')
        self.call('Emulation.setFocusEmulationEnabled', {'enabled': True})
        self.call('Runtime.enable'); self.call('Log.enable')

    def _message(self, wait):
        while b'\0' not in self.buf:
            if not select.select([self.proc.stdout], [], [], wait)[0]: return None
            data = os.read(self.proc.stdout.fileno(), 1048576)
            if not data: raise RuntimeError('Chrome pipe closed; see verif-arrivee/chrome-stderr.log')
            self.buf += data
        msg, self.buf = self.buf.split(b'\0', 1)
        return json.loads(msg) if msg else {}

    def _event(self, item):
        m = item.get('method'); p = item.get('params', {})
        if m == 'Runtime.consoleAPICalled' and p.get('type') in ('error', 'warning', 'assert'):
            text = ' '.join(str(a.get('value', a.get('description', ''))) for a in p.get('args', []))
            self.console.append({'kind': 'console.' + p['type'], 'text': text[:400], 'page': self.url})
        elif m == 'Runtime.exceptionThrown':
            d = p.get('exceptionDetails', {})
            self.console.append({'kind': 'exception', 'text': (d.get('exception', {}).get('description') or d.get('text', ''))[:400], 'page': self.url})
        elif m == 'Log.entryAdded':
            e = p.get('entry', {})
            if e.get('level') in ('error', 'warning'):
                self.console.append({'kind': 'log.' + str(e.get('source')) + '.' + str(e.get('level')), 'text': e.get('text', '')[:300], 'resource': e.get('url'), 'page': self.url})

    def call(self, method, params=None, timeout=20):
        self.seq += 1; mid = self.seq; req = {'id': mid, 'method': method, 'params': params or {}}
        if self.session: req['sessionId'] = self.session
        self.proc.stdin.write(json.dumps(req).encode() + b'\0'); self.proc.stdin.flush()
        deadline = time.time() + timeout
        while time.time() < deadline:
            item = self._message(1)
            if item is None: continue
            if item.get('id') == mid:
                if 'error' in item: raise RuntimeError(item['error'])
                return item.get('result', {})
            if 'method' in item: self._event(item)
        raise TimeoutError(method)

    def js(self, expression, timeout=20):
        res = self.call('Runtime.evaluate', {'expression': expression, 'awaitPromise': True, 'returnByValue': True}, timeout=timeout)
        if 'exceptionDetails' in res: raise RuntimeError(json.dumps(res['exceptionDetails'])[:600])
        return res['result'].get('value')

    def size(self, w, h):
        self.call('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 1, 'mobile': False})

    def close(self):
        try: self.call('Browser.close')
        finally: self.proc.wait(timeout=10)


def cleanup(c):
    try: c.close()
    except Exception as error: print('close error', error, flush=True)
    finally: shutil.rmtree(c.profile, ignore_errors=True)


# Page-side recorder: every change of the Sign-in label language (MutationObserver on
# #entrance-access) and the relevant input/focus/dialog events, with performance.now() times.
REC = r'''(()=>{
 const access=document.querySelector('#entrance-access'),dialog=document.querySelector('#dialog');
 const lab=()=>{const L=document.querySelector('#entry-login');if(!L)return null;const l=L.querySelector('.entrance-action-label');return (l||L).getAttribute('lang');};
 const act=()=>{const a=document.activeElement;return a?(a.id||a.tagName):null};
 window.qaRec={t0:performance.now(),log:[{t:performance.now(),lang:lab(),active:act(),why:'start'}],ev:[]};
 new MutationObserver(()=>{const v=lab();if(v!==qaRec.log.at(-1).lang)qaRec.log.push({t:performance.now(),lang:v,active:act()});}).observe(access,{subtree:true,childList:true,attributes:true,attributeFilter:['lang'],characterData:true});
 const name=e=>{const x=e.target;return x&&x.nodeType===1?(x.id||(typeof x.className==='string'&&x.className)||x.tagName):String(x)};
 for(const type of ['pointerdown','click','keydown','focusin','pointerenter','pointerleave'])document.addEventListener(type,e=>{if((type==='pointerenter'||type==='pointerleave')&&e.target!==access)return;qaRec.ev.push({type,t:performance.now(),target:name(e),pointerType:e.pointerType??null,key:e.key??null,mods:[e.ctrlKey,e.altKey,e.shiftKey,e.metaKey].map(Number).join('')});},true);
 dialog?.addEventListener('close',()=>qaRec.ev.push({type:'dialog-close',t:performance.now(),active:act()}));
 return true;
})()'''

# Instant state of the arrival access pair.
STATE = r'''(()=>{const L=document.querySelector('#entry-login'),G=document.querySelector('#entry-guest');
 const a=document.activeElement,acc=document.querySelector('#entrance-access');
 const one=b=>{if(!b)return null;const l=b.querySelector('.entrance-action-label');const r=b.getBoundingClientRect();return{lang:(l||b).getAttribute('lang'),text:(l||b).textContent,buttonLang:b.getAttribute('lang'),ariaDescription:b.getAttribute('aria-description'),slots:b.querySelectorAll('.entrance-action-labels').length,spans:b.querySelectorAll('span').length,rect:[r.x,r.y,r.width,r.height],hover:b.matches(':hover')}};
 return{entry:document.body.dataset.entry,site:document.documentElement.lang,dir:document.documentElement.dir||'ltr',theme:document.documentElement.dataset.theme,
  login:one(L),guest:one(G),active:a?(a.id||a.tagName):null,focusVisible:!!(a&&a.matches(':focus-visible')),dialogOpen:!!document.querySelector('#dialog')?.open,
  accessHover:!!acc?.matches(':hover'),toggleHidden:document.querySelector('#entry-theme-toggle')?.hidden??null,
  account:(e=>e?getComputedStyle(e).display:null)(document.querySelector('.account-switcher')),errors:window.qaErrors||[],now:performance.now()}})()'''

QA_HOOK = 'window.qaErrors=[];addEventListener("error",e=>{if(e.message)qaErrors.push(e.message)});addEventListener("unhandledrejection",e=>qaErrors.push(String(e.reason)));(()=>{const oe=console.error;console.error=(...a)=>{try{qaErrors.push("console.error: "+a.map(String).join(" "))}catch{};return oe.apply(console,a)}})()'

KEYS = {  # key, code, windowsVirtualKeyCode, modifier flag carried by its own keydown (Alt=1, Ctrl=2, Meta=4, Shift=8)
    'Alt': ('Alt', 'AltLeft', 18, 1), 'Shift': ('Shift', 'ShiftLeft', 16, 8), 'Control': ('Control', 'ControlLeft', 17, 2),
    'Meta': ('Meta', 'MetaLeft', 91, 4), 'AltGraph': ('AltGraph', 'AltRight', 225, 0), 'CapsLock': ('CapsLock', 'CapsLock', 20, 0),
    'NumLock': ('NumLock', 'NumLock', 144, 0), 'Escape': ('Escape', 'Escape', 27, 0), 'Tab': ('Tab', 'Tab', 9, 0),
    'Enter': ('Enter', 'Enter', 13, 0), 'PrintScreen': ('PrintScreen', 'PrintScreen', 44, 0), 'a': ('a', 'KeyA', 65, 0),
}


def make(c):
    def wait(expression, seconds=25):
        end = time.time() + seconds
        while time.time() < end:
            value = c.js(expression)
            if value: return value
            time.sleep(.08)
        raise AssertionError('wait timeout: ' + expression)

    def centre(selector):
        return c.js('(()=>{const e=document.querySelector(' + json.dumps(selector) + ');if(!e)throw Error("Missing target ' + selector + '");const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error("Hidden target ' + selector + '");return{x:r.x+r.width/2,y:r.y+r.height/2}})()')

    def move(x, y):
        c.call('Input.dispatchMouseEvent', {'type': 'mouseMoved', 'x': x, 'y': y}); time.sleep(.05)

    def press(x, y):
        for kind in ['mousePressed', 'mouseReleased']:
            c.call('Input.dispatchMouseEvent', {'type': kind, 'x': x, 'y': y, 'button': 'left', 'clickCount': 1})
        time.sleep(.15)

    def click(selector):  # a mouse user moves onto the target, then presses
        p = centre(selector); move(p['x'], p['y']); time.sleep(.1); press(p['x'], p['y']); return p

    def point(x, y):
        move(x, y); press(x, y)

    def tap(x, y, settle=.6):
        c.call('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'radiusX': 4, 'radiusY': 4, 'force': 1}]})
        c.call('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); time.sleep(settle)

    def tap_on(selector, settle=.6):
        p = centre(selector); tap(p['x'], p['y'], settle); return p

    def key(name, extra=0):
        k, code, vk, own = KEYS[name]
        down = {'type': 'keyDown' if name == 'a' else 'rawKeyDown', 'key': k, 'code': code, 'windowsVirtualKeyCode': vk, 'modifiers': own | extra}
        if name == 'a': down['text'] = 'a'
        c.call('Input.dispatchKeyEvent', down)
        c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': k, 'code': code, 'windowsVirtualKeyCode': vk, 'modifiers': extra})
        time.sleep(.12)

    def ctrl_c():  # Control held, C pressed, both released (modifiers 2 during the chord)
        c.call('Input.dispatchKeyEvent', {'type': 'rawKeyDown', 'key': 'Control', 'code': 'ControlLeft', 'windowsVirtualKeyCode': 17, 'modifiers': 2})
        c.call('Input.dispatchKeyEvent', {'type': 'rawKeyDown', 'key': 'c', 'code': 'KeyC', 'windowsVirtualKeyCode': 67, 'modifiers': 2})
        c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': 'c', 'code': 'KeyC', 'windowsVirtualKeyCode': 67, 'modifiers': 2})
        c.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': 'Control', 'code': 'ControlLeft', 'windowsVirtualKeyCode': 17, 'modifiers': 0})
        time.sleep(.12)

    def shot(path, clip=None):
        params = {'format': 'png'}
        if clip: params['clip'] = {'x': max(0, clip[0]), 'y': max(0, clip[1]), 'width': clip[2], 'height': clip[3], 'scale': 1}
        Path(path).write_bytes(base64.b64decode(c.call('Page.captureScreenshot', params)['data']))

    def load(url, w, h, ready='Boolean(document.querySelector("#entry-login"))'):
        c.size(w, h); c.url = url
        started = time.time() * 1000 - 50
        c.call('Page.navigate', {'url': url})
        # A new document only: its navigation started after this call (the app may rewrite the URL).
        wait('performance.timeOrigin>' + str(int(started)) + '&&document.readyState!=="loading"', 20)
        wait(ready, 20); c.js('document.fonts.ready.then(()=>true)'); time.sleep(.5)
        move(4, 4)

    def now():
        return c.js('performance.now()')

    def rec():
        return c.js('JSON.parse(JSON.stringify(window.qaRec||null))')

    def changes_after(r, t):
        return [{'dtMs': round(e['t'] - t), 'lang': e['lang'], 'active': e.get('active')} for e in r['log'][1:] if e['t'] > t]

    return dict(wait=wait, centre=centre, move=move, press=press, click=click, point=point, tap=tap, tap_on=tap_on,
                key=key, ctrl_c=ctrl_c, shot=shot, load=load, now=now, rec=rec, changes_after=changes_after)


def save(path, payload):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=1) + '\n')
    print('saved', path, flush=True)
