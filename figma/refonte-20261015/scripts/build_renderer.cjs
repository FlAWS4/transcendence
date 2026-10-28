// Builds render.inline.js, the renderer pasted into every call (16 October 2026: the permission classifier refused to
// store the renderer in the Figma file and evaluate it from there, so each call now carries its own code).
// Usage: node build_renderer.cjs <path to an esbuild package> render.js [--screens] > render.inline.js
// 18 Oct.: --screens leaves out the library builder (between the ⟦bibliothèque⟧ markers), which only the library calls
// of components.py need: render.inline.js (screens) and render.library.inline.js (library) are built from render.js.
// esbuild minifies the function body (free names figma, S, X kept). Without esbuild, use render.min.js (comments and
// indentation stripped), as make_call.py does when render.inline.js is missing or older than render.js.
const fs = require('fs');
const esbuild = require(process.argv[2]);
let body = fs.readFileSync(process.argv[3], 'utf8');
// 18 Oct.: --no-glass leaves out the explicit copy of glass under a weaker blur (between the ⟦verre⟧ markers), which only
// the calls of scenes holding a marked glass need (render.glass.inline.js)
// --no-narrow leaves out the narrow no-break spaces (between the ⟦espaces⟧ markers), needed by the scenes holding a U+202F
for (const [flag, mark] of [['--screens', 'bibliothèque'], ['--no-glass', 'verre'], ['--no-narrow', 'espaces']]) {
  if (!process.argv.includes(flag)) continue;
  const a = body.indexOf('// ⟦' + mark + '⟧'), b = body.indexOf('// ⟦/' + mark + '⟧');
  if (a < 0 || b < a) { console.error(mark + ' markers not found'); process.exit(1); }
  body = body.slice(0, a) + body.slice(b + ('// ⟦/' + mark + '⟧').length);
}
const src = 'async function __render__(){\n' + body + '\n}\n__render__();\n';
// charset utf8: non-ASCII characters stay literal (escapes like \u00E7 were decoded by the courier when copying, 16 Oct.)
const out = esbuild.transformSync(src, { minify: true, target: 'es2020', legalComments: 'none', charset: 'utf8' }).code.trim();
const head = 'async function __render__(){', tail = '}__render__();';
if (!out.startsWith(head) || !out.endsWith(tail)) { console.error('unexpected shape: ' + out.slice(0, 80) + ' … ' + out.slice(-80)); process.exit(1); }
process.stdout.write(out.slice(head.length, out.length - tail.length));
