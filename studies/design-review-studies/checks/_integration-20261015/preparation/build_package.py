"""Builds integration-20261015/design-review-selection.css from the nine selected trials (read-only on essais/).

The trials are merged in the canonical order of essais/boot.js (the order of their stylesheets in the study),
each under a one-line header. Only three kinds of edits are made, each with an expected count:
 - the ':root[data-essais~=lisibilite-textes]' conditions become ':root:root' (same specificity, always on);
 - trial-labelled hooks get product-neutral names (custom properties, class, keyframes, attribute);
 - the comments that name a renamed hook or the trial's own essai.mjs follow the new names.
python3 -I build_package.py            # writes the stylesheet (refuses to overwrite a different file)
python3 -I build_package.py --check    # rebuilds in memory and compares with the written file"""
import hashlib, json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
ESSAIS = STUDY / 'essais'
OUT = STUDY / 'integration-20261015' / 'design-review-selection.css'

# Canonical order of essais/boot.js, filtered to the user's selection of 15 Oct 2026.
ORDER = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
         'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
HEADERS = {
    'globe-espace-libre': 'globe-espace-libre: the resting globe shrinks to fit the free band between the filter stats and the status line.',
    'police-etiquettes-globe': 'police-etiquettes-globe: the globe marker labels take the site font stack (Jost) instead of MapLibre\'s.',
    'une-colonne-320': 'une-colonne-320: one Projects or Chronicles card per row at 360 px wide or less.',
    'roles-couleur': 'roles-couleur: one colour rule for actions, the sign-in accent on primary actions, neutral secondaries.',
    'visiter-contour-sombre': 'visiter-contour-sombre: a visible dark-theme outline on "Visiter" and "Créer un compte".',
    'lisibilite-textes': 'lisibilite-textes: 13 px floor for small text, 14 px for small actions, readable small accent text.',
    'echelle-unifiee': 'echelle-unifiee: one short type scale, three radii and two elevations on the main components.',
    'pseudo-manquant': 'pseudo-manquant: profiles without an Intra login no longer show the pending placeholder line.',
    'awards-a-venir': 'awards-a-venir: a discreet, centred "coming soon" note on the otherwise empty 42 Awards page.',
}
CONDITION = ':root[data-essais~=lisibilite-textes]'
CONDITION_NOTE = ('/* :root:root below stands for the former trial condition :root[data-essais~=lisibilite-textes]: same\n'
                  '   specificity, applied unconditionally because lisibilite-textes is part of this selection. */\n')
# (trial, old, new, expected count in that trial's essai.css)
EDITS = [
    ('globe-espace-libre', '--essai-globe-', '--globe-fit-', 23),
    ('globe-espace-libre', CONDITION, ':root:root', 3),
    ('lisibilite-textes', '--essai-lt-accent', '--readable-text-accent', 3),
    ('echelle-unifiee', CONDITION, ':root:root', 2),
    ('pseudo-manquant', 'data-pseudo-manquant=replie', 'data-pending-login=collapsed', 1),
    ('pseudo-manquant', 'essai.mjs marks the lines of the other rows "replie".',
     'design-review-selection.mjs marks the lines of the other rows "collapsed".', 1),
    ('awards-a-venir', 'essai-awards-a-venir', 'awards-coming-soon', 8),
]
# Where the condition note goes: before the first rule that used the condition in each trial.
NOTE_BEFORE = {
    'globe-espace-libre': '/* With lisibilite-textes, its 13 px floors move two bands',
    'echelle-unifiee': '/* With lisibilite-textes, its floors replace the two small steps',
}
TOP = ('/* Design-review selection (15 Oct 2026): the nine trials of the design-review study chosen by the user,\n'
       '   merged in the canonical order of the study loader; the last stylesheet of index.html and content-preview.html. */\n')


def build():
    parts = [TOP]
    for number, trial in enumerate(ORDER, 1):
        css = (ESSAIS / trial / 'essai.css').read_text(encoding='utf-8')
        for owner, old, new, count in EDITS:
            if owner != trial: continue
            found = css.count(old)
            if found != count: raise SystemExit(f'{trial}: expected {count} x {old!r}, found {found}')
            css = css.replace(old, new)
        # Checked before the note, which quotes the former condition on purpose.
        if 'essai-' in css or 'data-essais' in css or 'pseudo-manquant=' in css or 'replie' in css:
            raise SystemExit(f'{trial}: a trial hook is left')
        if trial in NOTE_BEFORE:
            anchor = NOTE_BEFORE[trial]
            if css.count(anchor) != 1: raise SystemExit(f'{trial}: note anchor not unique')
            css = css.replace(anchor, CONDITION_NOTE + anchor)
        parts.append(f'\n/* == {number}/9 {HEADERS[trial]} */\n' + css.rstrip('\n') + '\n')
    return ''.join(parts)


def main():
    text = build()
    if '--check' in sys.argv:
        same = OUT.read_text(encoding='utf-8') == text
        print(json.dumps({'file': str(OUT), 'identicalToBuild': same, 'sha256': hashlib.sha256(OUT.read_bytes()).hexdigest()}))
        raise SystemExit(0 if same else 1)
    if OUT.exists() and OUT.read_text(encoding='utf-8') != text:
        raise SystemExit('Refusing to overwrite a different package stylesheet; inspect it first.')
    OUT.write_text(text, encoding='utf-8')
    print(json.dumps({'file': str(OUT), 'bytes': OUT.stat().st_size, 'sha256': hashlib.sha256(OUT.read_bytes()).hexdigest()}))


if __name__ == '__main__':
    main()
