"""Follow-up of the full recapture of 18 October 2026 (passe complète, step 5): what the first pass could not give.

  python3 recapture_followup.py plan     → prints the lots to run and why (no capture)
  python3 recapture_followup.py run      → runs them one after the other (never two capture scripts at once)

`all --relib` on every area, slice after slice until no job remains. --relib counts as not done any capture made
with another capture_lib.py (variants.LIB, its hash), so this one pass also redoes:
- the areas the first pass left unfinished (a run of recapture-all.sh ends after 8 slices);
- everything captured before the two additions to the capture of 18 October: font-variant-numeric, font-feature-settings,
  mask-image and text-decoration-skip-ink (07:33 UTC), the sub-pixel marker dots of the docked globe (08:52 UTC);
- the new variants: en-dark of the states whose dark frames come from their dark capture (layout.DARK_RENDER) and the
  member screens of the clickable prototype (capture_shell.py, lot « member »).
Afterwards, `check` lists the dumps still missing the dots or the font-variant-numeric field (expected: none).
capture_lib.py must not change again until the end: each change makes every capture « not done » again.
"""
import gzip
import json
import pathlib
import re
import subprocess
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
DOM = BASE / 'dom'
SCRIPTS = {'shell': 'capture_shell.py', 'projects': 'capture_projects.py', 'profiles': 'capture_profiles.py',
           'journal': 'capture_journal.py', 'explorer': 'capture_explorer.py'}
DOTS_FIX = time.mktime(time.strptime('2026-10-18 08:52', '%Y-%m-%d %H:%M'))
FVN_FIX = time.mktime(time.strptime('2026-10-18 07:33', '%Y-%m-%d %H:%M'))
TABULAR_CSS = ('campus-details', 'comments', 'media-viewer', 'profiles', 'city-map')   # files of the 9 rules (audit)


def dump(p):
    return json.loads(gzip.decompress(p.read_bytes()))


def stale_dots(area):
    """States whose desktop dumps (any variant) hold a docked globe with markers but no marker dot."""
    out = set()
    for p in sorted((DOM / area).glob('*--desktop--*.json.gz')):
        if p.stat().st_mtime >= DOTS_FIX:
            continue
        d = dump(p)
        app = next((n for n in d['nodes'] if n.get('id') == 'app'), {})
        if app.get('data-globe-docked') != 'true':
            continue
        cls = [(n.get('cls') or '') for n in d['nodes']]
        if any('hg-marker' in c.split() for c in cls) and not any('hg-marker-dot' in c.split() for c in cls):
            out.add(p.name.split('--')[0])
    return out


def stale_tabular(area):
    """States with a dump older than the fvn field whose fresh captures (same state) show tabular figures."""
    fresh, old = set(), set()
    for p in sorted((DOM / area).glob('*.json.gz')):
        state = p.name.split('--')[0]
        if p.stat().st_mtime < FVN_FIX:
            old.add(state)
            continue
        if b'tabular-nums' in gzip.decompress(p.read_bytes()):
            fresh.add(state)
    # a state is suspect when one of its variants is old; it needs the field when a fresh variant (or the same state of
    # another capture) shows it: without any fresh variant, list it to be safe
    return {s for s in old if s in fresh or not any(s == q.name.split('--')[0] and q.stat().st_mtime >= FVN_FIX for q in (DOM / area).glob(s + '--*.json.gz'))}


def plan():
    return [(script, ['all', '--relib'], 'every state with the current capture_lib.py') for script in SCRIPTS.values()]


def check():
    for area in SCRIPTS:
        dots, tab = sorted(stale_dots(area)), sorted(stale_tabular(area))
        print('%-9s dots missing: %s | font-variant-numeric missing: %s' % (area, ', '.join(dots) or '—', ', '.join(tab) or '—'))


def run_lot(script, args, why, log):
    for slice_ in range(1, 9):
        stamp = time.strftime('%H:%M')
        log.write('[%s] %s %s (tranche %d) — %s\n' % (stamp, script, ' '.join(args), slice_, why)); log.flush()
        try:
            out = subprocess.run(['timeout', '590', 'python3', str(HERE / script)] + args, capture_output=True, text=True, cwd=str(HERE)).stdout
        except Exception as e:   # noqa: BLE001 - logged, next slice
            out = repr(e)
        tail = '\n'.join(out.strip().split('\n')[-3:])
        log.write(tail + '\n'); log.flush()
        # 18 Oct.: « 10 jobs remaining » also contains « 0 jobs remaining » (review): only a count of exactly 0 ends the area
        if re.search(r'(?<!\d)0 jobs remaining', tail):
            return True
    return False


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'plan'
    if cmd == 'check':
        check(); sys.exit(0)
    lots = plan()
    for script, args, why in lots:
        print(script, ' '.join(args), '—', why)
    if cmd == 'run':
        with open(sys.argv[2] if len(sys.argv) > 2 else '/dev/stdout', 'a') as log:
            for script, args, why in lots:
                run_lot(script, args, why, log)
            log.write('[%s] relevé complémentaire terminé\n' % time.strftime('%H:%M'))
