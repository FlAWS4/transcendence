#!/usr/bin/env python3
"""Read-only comparison against the preserved 141 runtime; write review evidence."""
from pathlib import Path
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'site'
ARCHIVE = BASE.parent / 'archives/site-versions/pre-targeted-button-colors-20261013'
HERE = Path(__file__).resolve().parent
MANIFEST = ARCHIVE / 'snapshot-manifest.json'
sha = lambda data: hashlib.sha256(data).hexdigest()
normalize = lambda text: re.sub(r'(\.(?:mjs|css)\?v=)[^\s\'"<>);]+', r'\1<CACHE>', text)

ADDITION = '''/* Colour only the requested sign-in actions and the shared World control. */
:root{--h42-access-accent:var(--h42-teal)}
:root[data-theme=dark]{--h42-access-accent:var(--h42-pink)}
:root :is(#entry-login,[data-account-action=signin],#dialog[data-kind=login] #dialog-content>button:first-of-type){background:var(--h42-access-accent);border-color:var(--h42-access-accent);color:var(--h42-ink)}
:root :is(#entry-login,[data-account-action=signin],#dialog[data-kind=login] #dialog-content>button:first-of-type):hover{background:var(--h42-access-accent);border-color:var(--h42-access-accent)}
:root [data-account-action=signin]:focus-visible{outline-color:var(--h42-ink)}

/* Equal sizes for the entrance pair, preserving its desktop/mobile placement. */
.entrance-access:has(#entry-login){display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(max-width:700px){.entrance-access:has(#entry-login){grid-template-columns:1fr}}
@media(max-height:600px){.entrance-access:has(#entry-login){grid-template-columns:repeat(2,minmax(0,1fr))}}

/* The active entrance alone follows the dark theme during both cipher phases. */
:root[data-theme=dark] .entrance-scene{--h42-color-accent:var(--h42-pink)}

'''

def replace_one(text, before, after):
    assert text.count(before) == 1, before
    return text.replace(before, after, 1)

def expected_text(name, original):
    if name == 'entrance.css':
        marker = '/* Failed map loading is a short message followed by three reachable actions. */'
        return replace_one(original, marker, ADDITION + marker), 'targeted sign-in colors, equal entrance pair, local dark scanner/decryption accent'
    if name == 'dock-navigation.css':
        text = replace_one(original,
            'padding:0;border:0;border-radius:50%;background:transparent;\n color:var(--h42-color-action-quiet);box-shadow:none;',
            'padding:0;border:0;border-radius:50%;background:var(--h42-access-accent);\n color:var(--h42-ink);box-shadow:none;')
        text = replace_one(text, '.scope-world-return:hover { background:var(--warm-soft); }',
            '.scope-world-return:hover { background:var(--h42-access-accent); }')
        text = replace_one(text, '.scope-world-return:focus-visible { outline-offset:-2px; }',
            '.scope-world-return:focus-visible { outline-offset:-2px;outline-color:var(--h42-ink); }')
        return text, 'World background/icon and inset focus color only'
    if name == 'entrance.mjs':
        text = original
        for before, after in [("guest:'Explorer en visiteur'", "guest:'Visiter'"),
                              ("guest:'Explore as a visitor'", "guest:'Visit'"),
                              ("guest:'استكشف كزائر'", "guest:'زيارة'")]:
            text = replace_one(text, before, after)
        return text, 'three visitor labels only'
    return original, 'cache versions only'

manifest = json.loads(MANIFEST.read_text())
rows, unexpected = [], []
for row in manifest['files']:
    source = ROOT / row['source']
    preserved = ARCHIVE / row.get('original', row['runtime'])
    original = preserved.read_bytes()
    assert sha(original) == row['sourceSha256'], f'Archive original mismatch: {source}'
    actual = source.read_bytes()
    item = {'source': row['source'], 'preservedOriginal': str(preserved.relative_to(ARCHIVE)),
            'source141Sha256': sha(original), 'activeSha256': sha(actual), 'identical141': actual == original}
    if actual != original:
        expected, scope = expected_text(source.name, original.decode())
        item.update(scope=scope, matches141PlusExplicitScope=normalize(actual.decode()) == normalize(expected))
        if not item['matches141PlusExplicitScope']:
            unexpected.append(row['source'])
    rows.append(item)

css = (BASE / 'dock-navigation.css').read_text()
world = re.search(r':root \.app\[data-navigation=dock\] \.scope-world-return \{([^}]+)\}', css).group(1)
invariants = ['position:absolute', 'inset-inline-start:0', 'top:50%', 'transform:translateY(-50%)',
              'width:44px', 'height:44px', 'min-width:44px', 'border-radius:50%']
assert all(item in world for item in invariants)

def rgb(value):
    return [int(value[i:i+2], 16) / 255 for i in (1,3,5)]
def luminance(value):
    values = [n / 12.92 if n <= .04045 else ((n + .055) / 1.055) ** 2.4 for n in rgb(value)]
    return sum(a * b for a, b in zip(values, [.2126, .7152, .0722]))
def contrast(a, b):
    low, high = sorted([luminance(a), luminance(b)])
    return (high + .05) / (low + .05)

report = {
    'date': '2026-10-13',
    'passed': not unexpected,
    'basis': 'Every preserved original hash verified against the 141 manifest. Only mjs/css query cache values normalized. No active source modified by this review.',
    'manifestSha256': sha(MANIFEST.read_bytes()),
    'files': len(rows),
    'identical141': sum(item['identical141'] for item in rows),
    'changed': sum(not item['identical141'] for item in rows),
    'unexpected': unexpected,
    'review': {
        'worldGeometryUnchanged': True,
        'worldHitTarget': '44x44px; 32px miniature anchor untouched',
        'normalAndHoverTextContrast': {'ink': '#1B1B1B', '42Blue': '#00BABC', 'RoyalPink': '#ED3491',
                                      'inkOn42Blue': contrast('#1B1B1B','#00BABC'),
                                      'inkOnRoyalPink': contrast('#1B1B1B','#ED3491')},
        'focus': 'Only account sign-in and World inset focus outlines change to ink. External focus styles remain as141.',
        'unaffectedActions': ['sign-up', 'cancel', 'retry', 'visitor colors'],
        'visitorDimensions': 'Grid equal tracks limited to entrance-access containing entry-login. Existing 700px width and 600px height breakpoints retained; rendered equality requires the separate browser QA.',
        'scannerAndDecryption': 'Local entrance-scene dark accent override only; both beam and active glyphs read the same accent. Existing theme change calls entrance.refresh(), recreating sprites. Timing, renderer and separate studies unchanged.',
    },
    'limits': 'Independent source/contrast review only. Browser measurements, animation captures, charter PDF inspection and test execution are separate evidence.',
    'results': rows,
}
(HERE / 'source-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key:report[key] for key in ['passed','files','identical141','changed','unexpected']}))
raise SystemExit(0 if report['passed'] else 1)
