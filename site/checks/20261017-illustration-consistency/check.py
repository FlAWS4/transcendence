#!/usr/bin/env python3
"""Before/after check of the illustration consistency fixes of 17 October 2026 (read-only on both states).

Opens each case in the preserved state (archive/pre-illustration-consistency-20261017/baseline/) and in the active
prototype, at the same viewport, theme and language, and writes the two screenshots, a board (before | after | changed
pixels in red) and results.json (share of pixels whose RGB channels differ by more than 24 in total).
    cd /home/le-rif/Bureau/Transcendence && python3 site/checks/20261017-illustration-consistency/check.py
"""
import json, pathlib, sys, time

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parents[2]
sys.path.insert(0, str(REPO / 'studies/design-review-studies/checks'))
sys.path.insert(0, str(REPO / 'figma/refonte-20261015/scripts'))
import helper  # noqa: E402
from helper import Session, ACTIVE, ROOT_URL, D, M  # noqa: E402
from variants import tap  # noqa: E402
from PIL import Image, ImageChops  # noqa: E402

BASELINE = ROOT_URL + 'archives/site-versions/pre-illustration-consistency-20261017/baseline/'
FT = 'projects/ft-transcendence-building-together'
MS = 'projects/minishell-under-the-prompt'
ART = 'journal/journal-share-the-unfinished'
VIEWER = ('#project-detail .cp-project-lead-media .cp-project-media-open', 'Boolean(document.querySelector("dialog.media-viewer[open]"))')
CASES = [
    # name, route, theme, lang, viewport, action, expected
    ('fiche-projet-fr-clair-ordinateur', FT, 'light', 'fr', D, None, 'contours retirés de l’illustration de tête'),
    ('fiche-projet-fr-sombre-ordinateur', FT, 'dark', 'fr', D, None, 'contours retirés de l’illustration de tête'),
    ('fiche-projet-ar-clair-ordinateur', FT, 'light', 'ar', D, None, 'contours retirés'),
    ('visionneuse-fr-clair-ordinateur', MS, 'light', 'fr', D, VIEWER, 'contours retirés de l’illustration agrandie'),
    ('fiche-minishell-ar-clair-ordinateur', MS, 'light', 'ar', D, None, 'contours retirés ; bouton « استكشف 42 Paris » dans le bon ordre'),
    ('fiche-minishell-fr-clair-ordinateur', MS, 'light', 'fr', D, None, 'contours retirés ; bouton « Explorer 42 Paris » inchangé'),
    ('chronique-fr-clair-ordinateur', ART, 'light', 'fr', D, None, 'contours retirés ; en-tête inchangé'),
    ('chronique-ar-clair-ordinateur', ART, 'light', 'ar', D, None, 'contours retirés, guillemet et « & » à leur place, « 42 Tokyo »'),
    ('chronique-ar-clair-mobile', ART, 'light', 'ar', M, None, 'idem sur mobile'),
    ('chroniques-ar-clair-ordinateur', 'journal', 'light', 'ar', D, None, 'vignettes : guillemet et « & » à leur place'),
    ('projets-fr-clair-ordinateur', 'projects', 'light', 'fr', D, None, 'témoin : aucun changement attendu'),
]


def capture(s, base, case, label):
    name, route, theme, lang, vp, action, _ = case
    try:
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, base=base)
    except RuntimeError:   # the account menu sometimes opens late: one more try
        time.sleep(1.0)
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, base=base)
    if route.startswith(('projects/', 'journal/')):
        s.wait('Boolean(document.querySelector(".cp-project-lead-media svg, .cp-project-lead-media img"))', 20)
    if action:
        tap(s, action[0]); time.sleep(.6)
        s.wait(action[1], 10); time.sleep(.6)
    s.away(); time.sleep(.3)
    return s.shot(f'{name}--{label}')


def main():
    s = Session(HERE)
    results = []
    try:
        for case in CASES:
            before = capture(s, BASELINE, case, 'avant')
            after = capture(s, ACTIVE, case, 'apres')
            a, b = Image.open(before).convert('RGB'), Image.open(after).convert('RGB')
            diff = ImageChops.difference(a, b)
            mask = diff.convert('L').point(lambda v: 255 if v > 8 else 0)
            changed = mask.histogram()[255] / (a.width * a.height)
            red = Image.new('RGB', a.size, (230, 30, 60))
            board = Image.new('RGB', (a.width * 3 + 40, a.height), (90, 90, 90))
            board.paste(a, (0, 0)); board.paste(b, (a.width + 20, 0))
            board.paste(Image.composite(red, b.point(lambda v: 160 + v // 3), mask), (a.width * 2 + 40, 0))
            board.save(HERE / f'{case[0]}--planche.png')
            box = mask.getbbox()
            results.append({'case': case[0], 'route': case[1], 'theme': case[2], 'lang': case[3], 'viewport': list(case[4][:2]),
                            'expected': case[6], 'changedShare': round(changed, 5), 'changedBox': list(box) if box else None})
            print(json.dumps(results[-1], ensure_ascii=False))
    finally:
        s.close()
    (HERE / 'results.json').write_text(json.dumps({'date': '2026-10-17', 'before': BASELINE, 'after': ACTIVE, 'cases': results}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
