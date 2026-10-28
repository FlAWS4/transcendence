// Text triples FR / EN / AR of the prototype's translation tables (18 October 2026), for the texts that the captures
// show in French only (entrance states reached in one language, small screens): dom2fig binds such a text to a string
// variable when its French wording has a single translation here or among the variables already sent.
// The modules are parsed, never run: every object with fr, en and ar keys gives its string leaves, paired by key path
// (strings, nested objects, arrays of the same length). Template literals with expressions and functions are skipped.
// 18 Oct. (review): only the modules the two pages load (index.html, content-preview.html: their scripts, then every
// import, static or dynamic, and new URL('./….mjs', import.meta.url)); welcome-panels.mjs and city-map.mjs are not.
// Also the tables made by a helper returning {fr, en, ar} (copy(), l(): its calls with three arguments) and the tables
// completed by Object.assign(X.fr | X.en | X.ar, {…}), paired by key.
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
// 18 Oct. (review): a module file of the prototype folder itself (query and fragment dropped), else null
function local(spec) {
  const s = typeof spec === 'string' ? spec.split(/[?#]/)[0] : '';
  const f = path.relative(dir, path.resolve(dir, s));
  return /\.(mjs|js)$/.test(s) && !f.includes(path.sep) && !/\.test\./.test(f) && fs.existsSync(path.join(dir, f)) ? f : null;
}
// 18 Oct. (review): (fr, en, ar) => ({fr, en, ar}): for each language, the index of the argument that gives it
function helperOrder(fn) {
  if (!fn || !/^(Arrow)?Function(Expression|Declaration)$/.test(fn.type) || fn.params.length !== 3 || !fn.params.every(p => p.type === 'Identifier')) return null;
  const body = fn.body.type !== 'BlockStatement' ? fn.body : fn.body.body.length === 1 && fn.body.body[0].type === 'ReturnStatement' ? fn.body.body[0].argument : null;
  if (!body || body.type !== 'ObjectExpression' || body.properties.length !== 3) return null;
  const m = props(body), names = fn.params.map(p => p.name);
  const order = ['fr', 'en', 'ar'].map(k => m[k] && m[k].type === 'Identifier' ? names.indexOf(m[k].name) : -1);
  return order.every(i => i >= 0) && new Set(order).size === 3 ? order : null;
}
const parsed = {}, queue = [];
for (const page of ['index.html', 'content-preview.html']) {
  for (const m of fs.readFileSync(path.join(dir, page), 'utf8').matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) queue.push(local(m[1]));
}
while (queue.length) {
  const f = queue.shift();
  if (!f || f in parsed) continue;
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  let ast = null;
  try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' }); }
  catch (e) { try { ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script' }); } catch (e2) { console.error('skip', f, e.message); } }
  parsed[f] = ast && { src, ast };
  if (ast) walk.simple(ast, {
    ImportDeclaration(d) { queue.push(local(d.source.value)); },
    ExportNamedDeclaration(d) { if (d.source) queue.push(local(d.source.value)); },
    ExportAllDeclaration(d) { queue.push(local(d.source.value)); },
    ImportExpression(d) { queue.push(local(str(d.source))); },
    NewExpression(n) { if (n.callee.type === 'Identifier' && (n.callee.name === 'URL' || n.callee.name === 'Worker')) queue.push(local(str(n.arguments[0]))); },
  });
}
for (const f of Object.keys(parsed).sort()) {
  if (!parsed[f]) continue;
  const { src, ast } = parsed[f];
  const line = n => 'l' + src.slice(0, n.start).split('\n').length;
  const helpers = {}, assigned = {};
  walk.simple(ast, {
    VariableDeclarator(d) { const o = d.id.type === 'Identifier' && helperOrder(d.init); if (o) helpers[d.id.name] = o; },
    FunctionDeclaration(d) { const o = d.id && helperOrder(d); if (o) helpers[d.id.name] = o; },
  });
  walk.simple(ast, {
    ObjectExpression(o) { const m = props(o); if (m.fr && m.en && m.ar) pair(m.fr, m.en, m.ar, f, line(o)); },
    CallExpression(c) {
      const cal = c.callee, o = cal.type === 'Identifier' && c.arguments.length === 3 && helpers[cal.name], t = c.arguments[0];
      if (o) pair(c.arguments[o[0]], c.arguments[o[1]], c.arguments[o[2]], f, line(c) + '.' + cal.name);
      if (cal.type === 'MemberExpression' && !cal.computed && cal.object.type === 'Identifier' && cal.object.name === 'Object' && cal.property.name === 'assign'
          && c.arguments.length === 2 && t.type === 'MemberExpression' && !t.computed && ['fr', 'en', 'ar'].includes(t.property.name) && c.arguments[1].type === 'ObjectExpression') {
        const base = src.slice(t.object.start, t.object.end);
        const g = assigned[base] || (assigned[base] = { fr: [], en: [], ar: [], at: line(c) + '.assign' });
        g[t.property.name].push(...c.arguments[1].properties);
      }
    },
  });
  for (const g of Object.values(assigned)) pair(...['fr', 'en', 'ar'].map(k => ({ type: 'ObjectExpression', properties: g[k] })), f, g.at);
}
process.stdout.write(JSON.stringify(out, null, 0));
