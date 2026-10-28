#!/usr/bin/env python3
"""Street map of the Explorer campus states, alone (Figma rebuild, 16 October 2026).

The user allowed images in Figma on 16 October. The « Canvas · Map » placeholders (MapLibre streets around 42 Paris
and 42 Mulhouse, and the « Autour du campus » window) then get the map drawn by the prototype, without the interface
laid over it, which Figma already has as layers: the actions of capture_explorer.py reach each state, a style hides
every element except the map canvases and the page's atmosphere (seen through the faded edges of the map), and the
canvas box is captured as JPEG at twice the CSS size. Light and dark; Arabic as well for explore-campus.

Read-only on the prototype; never writes reference/ or dom/. Output: ../assets/maps/<state>--<fmt>--<lang>-<theme>.jpg
and ../assets/maps/index.json (canvas box in page px). Resumable: an image already written is not captured again.
    cd /home/le-rif/Bureau/Transcendence && timeout 580 python3 work/figma/refonte-20261015/scripts/capture_maps.py [only=state,...] [--force]
"""
import base64, json, pathlib, sys, time, traceback

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import capture_explorer as ce  # noqa: E402
from variants import Ctx, Job, StateError, harden, left  # noqa: E402
from capture_lib import start, BASE  # noqa: E402

OUT = BASE / 'assets' / 'maps'
INDEX = OUT / 'index.json'
LIGHT_DARK = ('fr-light', 'fr-dark')
# state group → (job function, formats, variants, states it produces) — the rows of layouts/explorer.json with a map
WANT = [
    ('explore-campus', ce.job_campus, ('desktop', 'mobile'), ('fr-light', 'fr-dark', 'ar-light', 'ar-dark')),
    ('campus-sheet', ce.job_sheet, ('desktop', 'mobile'), LIGHT_DARK),
    ('campus-sheet-mulhouse', ce.job_mulhouse, ('desktop',), LIGHT_DARK),
    ('campus-window', ce.job_window, ('desktop', 'mobile'), LIGHT_DARK),
]
STATES = {'explore-campus', 'campus-sheet', 'campus-sheet-expanded', 'campus-sheet-mulhouse', 'campus-window'}
# the map containers stay visible (their children stay hidden): their ::after is the blurred veil of the map's edges
# (.hg-map::after, backdrop-filter under a radial mask), seen on the site (16 Oct., evening, Explorer check v2)
HIDE = ('<style id="map-only">body *{visibility:hidden!important;transition:none!important;animation:none!important}'
        '.atmosphere,.atmosphere *,.hg-map,#campus-map-viewport,.campus-map-viewport,canvas.maplibregl-canvas{visibility:visible!important}</style>')
BOX_JS = ('(()=>{const c=document.querySelector(%s);if(!c)return null;const r=c.getBoundingClientRect();'
          'return {x:r.left,y:r.top,w:r.width,h:r.height}})()')


class Stub:
    zone = 'explorer'


class MapCtx(Ctx):
    """Same Ctx as the reference captures, but capture() takes the map alone and records nothing in reference/."""

    def capture(self, state, nodes, full=False, keep_focus=False, expect=None, checks=None, note=None, extra_full=None):
        if state not in STATES:
            return {}
        s = self.s
        name = f'{state}--{self.fmt}--{self.lang}-{self.theme}'
        if expect and not s.wait(expect, 8):
            raise StateError(f'{name}: expected state not reached')
        sel = '#campus-map-viewport canvas' if state == 'campus-window' else '#globe canvas.maplibregl-canvas'
        box = s.js(BOX_JS % json.dumps(sel))
        if not box or box['w'] < 10 or box['h'] < 10:
            raise StateError(f'{name}: no map canvas ({sel})')
        s.js('document.head.insertAdjacentHTML("beforeend", %s)' % json.dumps(HIDE))
        time.sleep(.8)
        try:
            scale = 1 if self.vp[2] else 2   # mobile already renders at DPR 2
            data = s.c.call('Page.captureScreenshot', {'format': 'jpeg', 'quality': 92, 'captureBeyondViewport': False,
                                                       'clip': {'x': box['x'], 'y': box['y'], 'width': box['w'], 'height': box['h'], 'scale': scale}}, timeout=90)['data']
        finally:
            s.js('document.getElementById("map-only")?.remove()')
            time.sleep(.3)
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / (name + '.jpg')).write_bytes(base64.b64decode(data))
        idx = json.loads(INDEX.read_text()) if INDEX.exists() else {}
        idx[name] = {'box': box, 'selector': sel, 'actions': list(self.actions), 'capturedAt': time.strftime('%Y-%m-%d %H:%M:%S')}
        INDEX.write_text(json.dumps(idx, ensure_ascii=False, indent=1))
        print(f'  map {name}: {round(box["w"])}x{round(box["h"])} at ({round(box["x"])}, {round(box["y"])})', flush=True)
        return {'name': name}


def produced(group, fmt):
    if group == 'campus-sheet':
        return ['campus-sheet'] if fmt == 'desktop' else ['campus-sheet', 'campus-sheet-expanded']
    return [group]


def main():
    arg = lambda k: {v for a in sys.argv if a.startswith(k + '=') for v in a.split('=', 1)[1].split(',')}
    only, fmts, vars_ = arg('only'), arg('formats'), arg('variants')
    force = '--force' in sys.argv
    jobs = []
    for group, fn, formats, variants in WANT:
        if only and group not in only:
            continue
        for fmt in formats:
            if fmts and fmt not in fmts:
                continue
            for v in variants:
                if vars_ and v not in vars_:
                    continue
                job = Job(group, fmt, v, fn, produced(group, fmt), 110)
                if force or not all((OUT / (p + '.jpg')).exists() for p in job.produces):
                    jobs.append(job)
    print(f'== maps: {len(jobs)} jobs to do', flush=True)
    s, used = None, 0
    try:
        for job in jobs:
            if left() < job.cost:
                print('  stopped for time', flush=True); break
            if s is not None and used >= 3:   # globe pages accumulate GPU memory
                s.close(); s = None
            if s is None:
                s = harden(start()); used = 0
            used += 1
            print(f'- {job!r}', flush=True)
            try:
                job.fn(MapCtx(Stub(), s, job))
            except Exception as error:
                print(f'  FAILED {job!r}: {type(error).__name__}: {error}', flush=True)
                if not isinstance(error, StateError):
                    traceback.print_exc(limit=3)
                try:
                    s.close()
                except Exception:
                    pass
                s = None
    finally:
        if s is not None:
            s.close()
    done = sorted(p.stem for p in OUT.glob('*.jpg')) if OUT.exists() else []
    print(f'== {len(done)} maps in {OUT}', flush=True)


if __name__ == '__main__':
    main()
