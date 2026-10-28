// Text triples FR / EN / AR of the prototype's translation tables (18 October 2026), for the texts that the captures
// show in French only (entrance states reached in one language, small screens): dom2fig binds such a text to a string
// variable when its French wording has a single translation here or among the variables already sent.
// The modules are parsed, never run: every object with fr, en and ar keys gives its string leaves, paired by key path
// (strings, nested objects, arrays of the same length). Template literals with expressions and functions are skipped.
// Usage: node site_copy.cjs <node_modules holding acorn and acorn-walk> <prototype folder> > ../site-copy.json
const fs = require('fs'), path = require('path');
const acorn = require(path.join(process.argv[2], 'acorn'));
const walk = require(path.join(process.argv[2], 'acorn-walk'));
const dir = process.argv[3];
const out = [];
const str = n => !n ? null : (n.type === 'Literal' && typeof n.value === 'string') ? n.value
  : (n.type === 'TemplateLiteral' && n.expressions.length === 0) ? n.quasis.map(q => q.value.cooked).join('') : null;
const keyOf = p => p.key.type === 'Identifier' ? p.key.name : p.key.type === 'Literal' ? String(p.key.value) : null;
function props(obj) {
  const m = {};
  for (const p of obj.properties) if (p.type === 'Property' && !p.computed) { const k = keyOf(p); if (k !== null) m[k] = p.value; }
  return m;
}
function pair(a, b, c, file, at) {
  if (!a || !b || !c) return;
  const sa = str(a), sb = str(b), sc = str(c);
  if (sa !== null && sb !== null && sc !== null) { out.push({ fr: sa, en: sb, ar: sc, file, at }); return; }
  if (a.type === 'ObjectExpression' && b.type === 'ObjectExpression' && c.type === 'ObjectExpression') {
    const A = props(a), B = props(b), C = props(c);
    for (const k of Object.keys(A)) if (k in B && k in C) pair(A[k], B[k], C[k], file, at + '.' + k);
  } else if (a.type === 'ArrayExpression' && b.type === 'ArrayExpression' && c.type === 'ArrayExpression'
             && a.elements.length === b.elements.length && b.elements.length === c.elements.length) {
    a.elements.forEach((e, i) => pair(e, b.elements[i], c.elements[i], file, at + '[' + i + ']'));
  }
}
for (const f of fs.readdirSync(dir).filter(f => /\.(mjs|js)$/.test(f) && !/\.test\./.test(f)).sort()) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' }); }
  catch (e) { try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' }); } catch (e2) { console.error('skip', f, e.message); continue; } }
  walk.simple(ast, { ObjectExpression(o) { const m = props(o); if (m.fr && m.en && m.ar) pair(m.fr, m.en, m.ar, f, 'l' + src.slice(0, o.start).split('\n').length); } });
}
process.stdout.write(JSON.stringify(out, null, 0));
