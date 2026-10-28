"""Test frame in Archives from a fresh conversion (18 Oct. 2026; calls 986 to 989): python3 essai_scene.py <area> <state> <fmt> <lang> <theme> <full 0|1> <name> <x> <y>
Writes the scene in ../scenes/essais/, then the calls into ../calls (next index), like the tests 976 to 985."""
import json, pathlib, sys
sys.path.insert(0, '/home/le-rif/Bureau/Transcendence/figma/refonte-20261015/scripts')
import dom2fig, make_call
area, state, fmt, lang, theme, full, name, x, y = sys.argv[1:10]
scene, _ = dom2fig.convert(area, state, fmt, lang, full == '1', theme=theme)
out = pathlib.Path(__file__).resolve().parent.parent / 'scenes' / 'essais'
out.mkdir(exist_ok=True)
out = out / ('%s--%s--%s--%s--%s.json' % (area, state, fmt, lang, theme))
out.write_text(json.dumps(scene, ensure_ascii=False))
for f in make_call.scene_calls(str(out), 'Archives', name, float(x), float(y)):
    print(f)
