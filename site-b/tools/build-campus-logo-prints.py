"""Builds the printed variants of the campus logos of version B and the `print` field of each campus.

  python3 -I site-b/tools/build-campus-logo-prints.py [--check]

The Explorer draws every logo in the theme's ink as a CSS mask (Codam, in colour, on a small white plate), so the
prints are computed once here and never at run time (no canvas). Reads site-b/campus-logos.json and the logo files of
site-b/assets/campus-logos/; writes site-b/assets/campus-logos/print/{source stem}.png and, last in each campus entry
of the manifest, its `print` field: {kind, src, width, height, aspectRatio, sha256, bytes}.

Method (SPEC-B-HALO §6.3, normative; any other result is a defect):
- campuses in sorted id order; a source already processed gives its result again (the four 1337 share 1337.png);
- SVG source: kind 'mask', the original file, the manifest's width, height and aspectRatio (viewBox numbers);
- raster source, RGBA as float64: L = RGB . (0.2126, 0.7152, 0.0722) on the 8-bit encoded values. Transparent
  background: covered = alpha > 128, link = 5th percentile of L over covered, m = alpha/255 * clip((255 - L) /
  max(1, 255 - link), 0, 1). Opaque background lbg (luminance of the manifest's background): covered = alpha > 128
  and |lbg - L| > 40, link as above, m = clip((lbg - L - 14) / max(1, lbg - link - 14), 0, 1) * alpha/255.
  Percentiles: numpy's default (linear);
- classification: chroma = max(RGB) - min(RGB); 95th percentile over covered < 46 gives a mask, else a sticker
  (shown in colour), unless OVERRIDES says otherwise; only Codam is expected to be a sticker;
- mask print: the bounding box of m > 8/255, grown by max(2, round(0.02 * its long side)) pixels and clamped to the
  image; L = 0 and alpha = round(m * 255) (both roundings half to even); PNG, optimize, no metadata; no speck removal;
- sticker print (halo's « crop colour logos to their ink box »): the source's own pixels, in its own mode, cropped to
  the bounding box of m > 8/255 grown by round(0.06 * its height) pixels (halo's margin, half to even) and clamped to
  the image; no conversion, recolouring or resampling; PNG, optimize, no metadata; the source file stays as it is.
--check stops first when the JPEG decoder differs from the build's (JPEG_DECODER), then rebuilds in memory and fails
on any difference of decoded pixels (mode, size, every value) or of the manifest's print fields other than sha256
and bytes, which depend on the zlib build (the tests compare those with the files).
"""
import datetime
import hashlib
import io
import json
import sys
from pathlib import Path

import numpy
import PIL
import PIL.features
from PIL import Image

SITE = Path(__file__).resolve().parents[1]                 # site-b/
MANIFEST = SITE / 'campus-logos.json'
PRINT_DIR = 'assets/campus-logos/print'
TOOL = 'site-b/tools/build-campus-logo-prints.py'
JPEG_DECODER = '2.1.5'                                     # libjpeg-turbo of the build: the JPEG sources decode with it
WEIGHTS = numpy.array([0.2126, 0.7152, 0.0722])            # Rec. 709 luma weights, on the encoded values
EXPECTED_STICKERS = ('codam',)
STICKER_MARGIN = 0.06                                      # halo's margin around a colour logo's ink, share of its height
# Classifications set by hand, campus id -> (kind, reason), for a source the measure would class against expectation.
OVERRIDES = {}
PRINT_KEYS = ('kind', 'src', 'width', 'height', 'aspectRatio', 'sha256', 'bytes')


def versions():
    return {
        'Python': sys.version,
        'Pillow': PIL.__version__,
        'numpy': numpy.__version__,
        'zlib': PIL.features.version('zlib'),
        'libjpeg-turbo': PIL.features.version('libjpeg_turbo'),
    }


def ink(path, background):
    """The ink coverage m in [0, 1] of a raster logo, its RGBA image and the 95th percentile of its ink chroma."""
    image = Image.open(path).convert('RGBA')
    a = numpy.asarray(image).astype(numpy.float64)
    rgb, alpha = a[..., :3], a[..., 3]
    L = rgb @ WEIGHTS
    if background == 'transparent':
        covered = alpha > 128
        link = numpy.percentile(L[covered], 5)
        m = alpha / 255 * numpy.clip((255 - L) / max(1, 255 - link), 0, 1)
    else:
        lbg = float(numpy.array([int(background[i:i + 2], 16) for i in (1, 3, 5)], numpy.float64) @ WEIGHTS)
        covered = (alpha > 128) & (numpy.abs(lbg - L) > 40)
        link = numpy.percentile(L[covered], 5)
        m = numpy.clip((lbg - L - 14) / max(1, lbg - link - 14), 0, 1) * (alpha / 255)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    return image, m, float(numpy.percentile(chroma[covered], 95))


def print_of(m, width, height):
    """The trimmed LA print of an ink coverage: its pixels (L = 0, alpha = ink) and its box in the source."""
    ys, xs = numpy.nonzero(m > 8 / 255)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    pad = max(2, round(0.02 * max(x1 - x0, y1 - y0)))
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(width, x1 + pad), min(height, y1 + pad)
    crop = numpy.round(m[y0:y1, x0:x1] * 255).astype(numpy.uint8)
    return numpy.dstack([numpy.zeros_like(crop), crop]), (x0, y0, x1, y1)


def sticker_of(path, m):
    """The cropped sticker print: the source's own pixels in the ink box plus halo's margin, their mode and the box."""
    ys, xs = numpy.nonzero(m > 8 / 255)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    pad = round(STICKER_MARGIN * (y1 - y0))
    height, width = m.shape
    box = (max(0, x0 - pad), max(0, y0 - pad), min(width, x1 + pad), min(height, y1 + pad))
    with Image.open(path) as source:
        return numpy.asarray(source.crop(box)), source.mode, box


def png_bytes(pixels, mode='LA'):
    buffer = io.BytesIO()
    Image.fromarray(pixels, mode).save(buffer, 'PNG', optimize=True)
    return buffer.getvalue()


def file_fields(data):
    return {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def build(campuses):
    """Every source's print, in sorted campus order: {src: {print, campuses, pixels?, data?, p95?, trim?}}."""
    results = {}
    for cid in sorted(campuses):
        entry = campuses[cid]
        src = entry['src']
        if src in results:
            results[src]['campuses'].append(cid)
            continue
        path = SITE / src
        if entry['format'] == 'svg':
            fields = {'kind': 'mask', 'src': src, 'width': entry['width'], 'height': entry['height'],
                      'aspectRatio': entry['aspectRatio'], **file_fields(path.read_bytes())}
            results[src] = {'print': fields, 'campuses': [cid]}
            continue
        image, m, p95 = ink(path, entry.get('background', '#FFFFFF'))
        kind = 'mask' if p95 < 46 else 'sticker'
        if cid in OVERRIDES:
            kind = OVERRIDES[cid][0]
        if kind == 'sticker':
            pixels, mode, trim = sticker_of(path, m)
            data = png_bytes(pixels, mode)
            height, width = pixels.shape[:2]
            fields = {'kind': 'sticker', 'src': f'{PRINT_DIR}/{Path(src).stem}.png', 'width': width, 'height': height,
                      'aspectRatio': round(width / height, 4), **file_fields(data)}
            results[src] = {'print': fields, 'campuses': [cid], 'pixels': pixels, 'mode': mode, 'data': data,
                            'p95': p95, 'trim': trim, 'source': (image.width, image.height)}
            continue
        pixels, trim = print_of(m, image.width, image.height)
        data = png_bytes(pixels)
        height, width = pixels.shape[:2]
        fields = {'kind': 'mask', 'src': f'{PRINT_DIR}/{Path(src).stem}.png', 'width': width, 'height': height,
                  'aspectRatio': round(width / height, 4), **file_fields(data)}
        results[src] = {'print': fields, 'campuses': [cid], 'pixels': pixels, 'data': data, 'p95': p95,
                        'trim': trim, 'source': (image.width, image.height)}
    stickers = sorted(cid for result in results.values() if result['print']['kind'] == 'sticker'
                      for cid in result['campuses'])
    if tuple(stickers) != EXPECTED_STICKERS:
        sys.exit(f'Classification differs from the expectation: stickers {stickers}, expected {list(EXPECTED_STICKERS)}. '
                 'Record the decision in OVERRIDES with its reason.')
    return results


def check_decoder(data):
    """Before anything is rebuilt or compared: the JPEG sources only decode to the same pixels with the same decoder."""
    found = PIL.features.version('libjpeg_turbo')
    if found != JPEG_DECODER:
        jpegs = len({entry['src'] for entry in data['campuses'].values() if entry['format'] == 'jpg'})
        print(f'JPEG decoder differs (built with libjpeg-turbo {JPEG_DECODER}, running {found}): the {jpegs} JPEG '
              'sources may decode differently; run the check with a matching Pillow build', file=sys.stderr)
        sys.exit(2)


def check(data, results):
    problems = []
    for result in results.values():
        fields = result['print']
        if 'pixels' in result:
            path = SITE / fields['src']
            if not path.is_file():
                problems.append(f'{fields["src"]} is missing')
            else:
                mode = result.get('mode', 'LA')
                with Image.open(path) as image:
                    image.load()
                    if image.mode != mode or image.size != (fields['width'], fields['height']):
                        problems.append(f'{fields["src"]}: {image.mode} {image.size}, expected {mode} '
                                        f'{(fields["width"], fields["height"])}')
                    elif not numpy.array_equal(numpy.asarray(image), result['pixels']):
                        problems.append(f'{fields["src"]}: pixels differ')
        for cid in result['campuses']:
            entry = data['campuses'][cid]
            current = entry.get('print')
            if not isinstance(current, dict):
                problems.append(f'{cid}: no print field')
                continue
            if list(entry)[-1] != 'print' or tuple(current) != PRINT_KEYS:
                problems.append(f'{cid}: print field out of order')
            for key in PRINT_KEYS[:5]:
                if current.get(key) != fields[key]:
                    problems.append(f'{cid}: print.{key} is {current.get(key)!r}, expected {fields[key]!r}')
    stray = stray_files(results)
    problems += [f'{PRINT_DIR}/{name} is not a print of the manifest' for name in stray]
    if problems:
        print('\n'.join(problems), file=sys.stderr)
        sys.exit(1)
    print('Prints and manifest are up to date.', file=sys.stderr)


def stray_files(results):
    expected = {Path(result['print']['src']).name for result in results.values() if 'pixels' in result}
    folder = SITE / PRINT_DIR
    return sorted(path.name for path in folder.iterdir() if path.name not in expected) if folder.is_dir() else []


def write(data, raw, results):
    folder = SITE / PRINT_DIR
    folder.mkdir(parents=True, exist_ok=True)
    for result in results.values():
        if 'data' in result:
            path = SITE / result['print']['src']
            if not path.is_file() or path.read_bytes() != result['data']:
                path.write_bytes(result['data'])
    for result in results.values():
        for cid in result['campuses']:
            entry = data['campuses'][cid]
            entry.pop('print', None)
            entry['print'] = dict(result['print'])
    text = json.dumps(data, indent=2, ensure_ascii=False) + '\n'
    if text != raw:
        MANIFEST.write_text(text, encoding='utf-8')
    for name in stray_files(results):
        print(f'warning: {PRINT_DIR}/{name} is not a print of the manifest', file=sys.stderr)


def report(results):
    """What the provenance record needs: method, tool, versions, date, classification and the files."""
    rows = sorted(results.values(), key=lambda result: result['print']['src'])
    prints = [result for result in rows if 'data' in result]
    lines = ['', f'Record ({datetime.date.today().isoformat()}):',
             f'- Tool: {TOOL}; method of its docstring (SPEC-B-HALO §6.3): ink coverage from the luminance against the',
             '  background, 5th percentile as full ink, trimmed with a 2 % margin, L = 0 and alpha = ink; no speck removal.',
             '  Sticker: its own pixels cropped to the same ink box with halo\'s 6 % margin; no recolouring, no resampling.',
             '- Versions: ' + '; '.join(f'{name} {version}' for name, version in versions().items()),
             '- Classification (95th percentile of the ink chroma, mask under 46): stickers '
             + ', '.join(cid for result in rows if result['print']['kind'] == 'sticker' for cid in result['campuses'])
             + f'; {sum(1 for result in prints if result["print"]["kind"] == "mask")} raster masks; '
             + str(sum(1 for result in rows if 'data' not in result and result['print']['kind'] == 'mask'))
             + ' SVG masks drawn from their original files; overrides: '
             + (', '.join(f'{cid} {kind} ({reason})' for cid, (kind, reason) in OVERRIDES.items()) or 'none') + '.',
             f'- {len(prints)} print files, {sum(len(result["data"]) for result in prints)} bytes.',
             '',
             '| Print | Campuses | Kind | Pixels | Bytes | SHA-256 |',
             '| --- | --- | --- | --- | ---: | --- |']
    for result in rows:
        fields = result['print']
        pixels = (f'{fields["width"]}×{fields["height"]}' if 'data' in result or fields['kind'] == 'sticker'
                  else f'viewBox {fields["width"]}×{fields["height"]}')
        kind = fields['kind'] + (' (original)' if 'data' not in result else
                                 f' (cropped {list(result["trim"])} of {list(result["source"])})'
                                 if fields['kind'] == 'sticker' else '')
        lines.append(f'| `{fields["src"]}` | {", ".join(result["campuses"])} | {kind} | {pixels} | {fields["bytes"]} | '
                     f'`{fields["sha256"]}` |')
    return '\n'.join(lines)


def main():
    options = sys.argv[1:]
    if any(option not in ('--check',) for option in options):
        sys.exit('Usage: python3 -I site-b/tools/build-campus-logo-prints.py [--check]')
    for name, version in versions().items():
        print(f'{name} {version}')
    raw = MANIFEST.read_text(encoding='utf-8')
    data = json.loads(raw)
    if '--check' in options:
        check_decoder(data)
    results = build(data['campuses'])
    for src, result in sorted(results.items()):
        fields = result['print']
        detail = (f'p95 {result["p95"]:.1f}, trim {list(result["trim"])} of {list(result["source"])}' if 'data' in result
                  else f'p95 {result["p95"]:.1f}' if 'p95' in result else 'SVG')
        print(f'{src} -> {fields["kind"]} {fields["src"]} {fields["width"]}x{fields["height"]} '
              f'{fields["aspectRatio"]} ({detail}) for {", ".join(result["campuses"])}')
    if '--check' in options:
        check(data, results)
    else:
        write(data, raw, results)
    print(report(results))


if __name__ == '__main__':
    main()
