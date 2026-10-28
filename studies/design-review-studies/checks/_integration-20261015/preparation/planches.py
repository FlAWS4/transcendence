"""Side-by-side boards of selected captures (reduced size) for visual review; writes planches/*.png only.
python3 -I planches.py"""
import json
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
CAP = HERE / 'captures'
OUT = HERE / 'planches'; OUT.mkdir(exist_ok=True)


def board(items, name, height=None, width=None, gap=12, caption=22):
    """items: (capture file name, crop box in image pixels or None, caption)."""
    tiles = []
    for file, box, text in items:
        path = CAP / file
        if not path.exists(): continue
        img = Image.open(path).convert('RGB')
        if box: img = img.crop(tuple(int(v) for v in box))
        if height: img = img.resize((max(1, round(img.width * height / img.height)), height))
        elif width: img = img.resize((width, max(1, round(img.height * width / img.width))))
        tiles.append((img, text))
    if not tiles: return None
    w = sum(t.width for t, _ in tiles) + gap * (len(tiles) + 1); h = max(t.height for t, _ in tiles) + caption + gap * 2
    sheet = Image.new('RGB', (w, h), (245, 245, 245)); draw = ImageDraw.Draw(sheet); x = gap
    for img, text in tiles:
        draw.text((x, gap // 2), text, fill=(20, 20, 20)); sheet.paste(img, (x, gap + caption - 6)); x += img.width + gap
    path = OUT / name; sheet.save(path); return str(path)


def diff_mask(a, b, name, scale=1):
    """Red where two captures differ (any channel), the rest dimmed; None when identical."""
    import numpy as np
    x = np.asarray(Image.open(CAP / a).convert('RGB'), dtype=int); y = np.asarray(Image.open(CAP / b).convert('RGB'), dtype=int)
    if x.shape != y.shape: return None
    mask = (x != y).any(axis=2)
    if not mask.any(): return None
    out = (y * .35 + 160).clip(0, 255).astype('uint8'); out[mask] = [220, 0, 0]
    img = Image.fromarray(out)
    if scale != 1: img = img.resize((round(img.width * scale), round(img.height * scale)))
    path = OUT / name; img.save(path); return str(path)


if __name__ == '__main__':
    made = {}
    made['p1-explorer'] = board([('explorer-1440x900-clair-fr-essais-initial.png', None, 'essais 1440 FR'), ('explorer-1440x900-clair-fr-paquet-initial.png', None, 'paquet 1440 FR'),
                                 ('explorer-667x375-clair-ar-essais-initial.png', None, 'essais 667x375 AR'), ('explorer-667x375-clair-ar-paquet-initial.png', None, 'paquet 667x375 AR')],
                                'p1-explorer.png', height=420)
    made['p2-listes'] = board([('profils-grille-340x640-clair-fr-essais-initial.png', None, 'essais profils 340'), ('profils-grille-340x640-clair-fr-paquet-initial.png', None, 'paquet profils 340'),
                               ('projets-320x640-clair-ar-essais-initial.png', None, 'essais projets 320 AR'), ('projets-320x640-clair-ar-paquet-initial.png', None, 'paquet projets 320 AR')],
                              'p2-listes.png', height=640)
    made['p3-awards-bascules'] = board([(f'bascules-awards-1440x900-{side}-{step}.png', (360, 300, 1080, 640), f'{side} {step}')
                                        for step in ('initial', 'langue-ar', 'theme-sombre') for side in ('essais', 'paquet')], 'p3-awards-bascules.png', height=200)
    made['p4-compte-sombre'] = board([('menu-compte-1440x900-sombre-fr-essais-initial.png', (900, 40, 1440, 520), 'essais (144)'), ('menu-compte-1440x900-sombre-fr-paquet-initial.png', (900, 40, 1440, 520), 'paquet (144)'),
                                      ('actuel-menu-compte-1440x900-sombre-copie-essais.png', (900, 40, 1440, 520), 'copie + essais'), ('actuel-menu-compte-1440x900-sombre-original.png', (900, 40, 1440, 520), 'original actuel'),
                                      ('actuel-menu-compte-1440x900-sombre-original-paquet.png', (900, 40, 1440, 520), 'original + paquet')], 'p4-compte-sombre.png', height=360)
    made['p5-erreur-tri'] = board([('actuel-ecran-erreur-compte-1440x900-sombre-original.png', None, 'erreur, original'), ('actuel-ecran-erreur-compte-1440x900-sombre-original-paquet.png', None, 'erreur, original + paquet'),
                                   ('actuel-tri-commentaires-bas-390x844-clair-original.png', None, 'tri, original'), ('actuel-tri-commentaires-bas-390x844-clair-original-paquet.png', None, 'tri, original + paquet')],
                                  'p5-erreur-tri.png', height=520)
    made['d1-explorer-1366-ar'] = diff_mask('explorer-1366x768-clair-ar-essais-initial.png', 'explorer-1366x768-clair-ar-paquet-initial.png', 'd1-explorer-1366-ar.png', .5)
    (OUT / 'planches.json').write_text(json.dumps(made, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps(made, ensure_ascii=False, indent=1))
