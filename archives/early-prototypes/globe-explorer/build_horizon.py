from pathlib import Path
import importlib.util

directory = Path(__file__).resolve().parent
data = directory.parents[2] / 'shared' / 'map-data'
fragment = (directory / 'horizon-globe.template.html').read_text()
fragment = fragment.replace('<!--SCENE_STYLES-->', '<style>' + (directory / 'horizon-scene.css').read_text() + '</style>')
for placeholder, source in [
    ('<!--D3_LIBRARY-->', data / 'd3.min.js'),
    ('<!--TOPO_LIBRARY-->', data / 'topojson.min.js'),
    ('<!--GLOBE_ENGINE-->', directory / 'globe-engine.js'),
]:
    fragment = fragment.replace(placeholder, '<script>' + source.read_text() + '</script>')
fragment = fragment.replace('/*WORLD_DATA*/null', (data / 'world.json').read_text())
fragment = fragment.replace('/*CITY_DATA*/null', (data / 'selected-cities.json').read_text())
output = directory / 'horizon-globe.html'
output.write_text(fragment)
renderer = Path('/home/le-rif/.codex/plugins/cache/openai-bundled/visualize/1.0.32/skills/visualize/scripts/render.py')
spec = importlib.util.spec_from_file_location('visualize_render', renderer)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.export_html(output, directory / 'explorer-campus-preview.html', title='42 Horizon — Explorer', force=True)
print(f'Built {output.name} ({output.stat().st_size} bytes) and explorer-campus-preview.html')
