#!/usr/bin/env python3
"""Before/after check of the campus names isolated in the profile pages, 18 October 2026 (read-only on both states).

Opens each case in the preserved state (archive/pre-profile-campus-isolation-20261018/baseline/) and in the active
prototype, at the same viewport, theme and language, and writes the two screenshots, a board (before | after | changed
pixels in red) and results.json (share of pixels whose RGB channels differ by more than 24 in total).
    cd /home/le-rif/Bureau/Transcendence && python3 site/checks/20261018-profile-campus-isolation/check.py
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

BASELINE = ROOT_URL + 'archives/site-versions/pre-profile-campus-isolation-20261018/baseline/'
PROFILE = 'people/profile-leila-mansour'
JOURNEY = PROFILE + '?tab=journey'
CASES = [
    # name, route, theme, lang, viewport, action, expected
    ('profils-ar-clair-ordinateur', 'people', 'light', 'ar', D, None, 'campus des cartes dans l’ordre « 42 Rio »'),
    ('profils-ar-sombre-mobile', 'people', 'dark', 'ar', M, None, 'idem, en sombre sur mobile'),
    ('profils-fr-clair-ordinateur', 'people', 'light', 'fr', D, None, 'témoin : aucun changement attendu'),
    ('profil-ar-clair-ordinateur', PROFILE, 'light', 'ar', D, None, 'bouton « استكشف 42 … » dans le bon ordre'),
    ('profil-fr-clair-ordinateur', PROFILE, 'light', 'fr', D, None, 'témoin : bouton « Explorer 42 … » inchangé'),
    ('parcours-ar-clair-ordinateur', JOURNEY, 'light', 'ar', D, None, 'campus du parcours dans l’ordre « 42 … »'),
    ('parcours-ar-clair-mobile', JOURNEY, 'light', 'ar', M, None, 'idem sur mobile'),
    ('parcours-fr-clair-ordinateur', JOURNEY, 'light', 'fr', D, None, 'témoin : aucun changement attendu'),
]


def capture(s, base, case, label):
    name, route, theme, lang, vp, action, _ = case
    try:
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, base=base)
    except RuntimeError:   # the account menu sometimes opens late: one more try
        time.sleep(1.0)
        s.open(route, theme=theme, lang=lang, viewport=vp, block_globe=True, base=base)
    if route.startswith('people/'):
        s.wait('Boolean(document.querySelector("#profile-detail h1"))', 20)
    else:
        s.wait('document.querySelectorAll(".cp-profile-card").length > 0', 20)
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
    (HERE / 'results.json').write_text(json.dumps({'date': '2026-10-18', 'before': BASELINE, 'after': ACTIVE, 'cases': results}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
