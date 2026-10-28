import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';

// Refinement §Q (26 Oct 2026): « Je veux que tu modifies le fond du site en mode sombre et que tu gardes uniquement la
// couleur noire, donc il faut retirer le rose et le bleu qu'il y a dans les coins. » Answers: « Version B seulement »,
// « Le noir actuel » (#1B1B1B, the 42 ink, --h42-color-bg in dark). Light mode keeps its glows.
const site=new URL('../',import.meta.url);
const file=name=>readFileSync(new URL(name,site),'utf8');
const squash=value=>value.replace(/\s+/g,' ').replace(/\s*([(),/])\s*/g,'$1').trim();
// Flat list of {sheet, media, selector, declarations}: grouping at-rules at any depth, statements (@import) dropped.
function rulesOf(text,sheet){
 const rules=[];
 const walk=(chunk,media)=>{
  let index=0;
  while(index<chunk.length){
   const open=chunk.indexOf('{',index);
   if(open<0)break;
   const prelude=chunk.slice(index,open).trim();
   let depth=1,cursor=open+1;
   while(depth&&cursor<chunk.length){if(chunk[cursor]==='{')depth++;else if(chunk[cursor]==='}')depth--;cursor++;}
   const body=chunk.slice(open+1,cursor-1);
   if(/^@(media|supports|container)/.test(prelude))walk(body,[media,squash(prelude).replace(/:\s+/g,':')].filter(Boolean).join(' '));
   else if(!prelude.startsWith('@'))rules.push({sheet,media,selector:prelude.replace(/\s+/g,' '),declarations:body.split(';').map(part=>part.trim()).filter(Boolean).map(part=>{const colon=part.indexOf(':');return [part.slice(0,colon).trim(),squash(part.slice(colon+1))];})});
   index=cursor;
  }
 };
 walk(text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@(import|charset)[^;]*;/g,''),null);
 return rules;
}
const SHEETS=readdirSync(site).filter(name=>name.endsWith('.css')).sort();
const RULES=SHEETS.flatMap(sheet=>rulesOf(file(sheet),sheet));
// Top-level parts of a selector list or of a complex selector (outside brackets and parentheses).
function split(text,separator){
 const parts=[];let depth=0,start=0;
 for(let index=0;index<text.length;index++){
  const char=text[index];
  if(char==='('||char==='[')depth++;else if(char===')'||char===']')depth--;
  else if(!depth&&separator.test(char)){parts.push(text.slice(start,index));start=index+1;}
 }
 return [...parts,text.slice(start)].map(part=>part.trim()).filter(Boolean);
}
const subject=selector=>split(selector,/[\s>+~]/).at(-1);
// The layers that make the page background: the canvas (html, body, :root), the app, its .atmosphere and its
// pseudo-elements, and the entrance's backdrop.
const PAGE=/(^|[(,])(?:html|body|:root|\.app|#app|\.atmosphere|\.entrance|\.entrance-part)(?![\w-])/;
const pageLayer=selector=>PAGE.test(subject(selector).replace(/:(?:not|has)\((?:[^()]|\([^()]*\))*\)/g,''));
const GLOW=/radial-gradient|conic-gradient|url\(|--h42-pink|--h42-teal|--hx-pink|--hx-teal|#e[cd]3391|#00babc/i;

test('dark mode paints the page in the plain ink: no pink or teal glow on the .atmosphere layer or any page layer',()=>{
 // Every rule a dark page can use: anything not reserved to the light theme.
 const dark=RULES.filter(rule=>split(rule.selector,/,/).some(selector=>!selector.includes('[data-theme=light]')&&pageLayer(selector)));
 assert.ok(dark.some(rule=>rule.sheet==='welcome.css'&&rule.selector==='.atmosphere'),'the .atmosphere layer is still found');
 for(const rule of dark)for(const [name,value] of rule.declarations){
  if(name.startsWith('background'))assert.doesNotMatch(value,GLOW,`${rule.sheet} ${rule.media||''} ${rule.selector} { ${name}: ${value} }`);
 }
 // The layer keeps its box for the light theme; only the light theme gives it a background, at both widths.
 const atmosphere=RULES.filter(rule=>split(rule.selector,/,/).some(selector=>subject(selector)==='.atmosphere'));
 assert.deepEqual(atmosphere.find(rule=>rule.selector==='.atmosphere'&&!rule.media).declarations,[['position','absolute'],['inset','0'],['z-index','-1'],['pointer-events','none']]);
 assert.deepEqual(atmosphere.filter(rule=>rule.declarations.some(([name])=>name.startsWith('background'))).map(rule=>[rule.sheet,rule.media,rule.selector]),
  [['welcome.css',null,':root[data-theme=light] .atmosphere'],['welcome.css','@media(max-width:700px)',':root[data-theme=light] .atmosphere']]);
 // What shows through is body's --h42-color-bg, the ink in the 42 tokens' dark theme; no page layer of B redefines it
 // outside the light theme.
 assert.deepEqual(RULES.find(rule=>rule.sheet==='welcome.css'&&rule.selector==='body').declarations.find(([name])=>name==='background'),['background','var(--h42-color-bg)']);
 assert.deepEqual(RULES.filter(rule=>rule.declarations.some(([name])=>name==='--h42-color-bg')&&split(rule.selector,/,/).some(pageLayer)).map(rule=>rule.selector),[':root[data-theme=light]']);
 const tokens=squash(readFileSync(new URL('../shared/brand/tokens.css',site),'utf8'));
 assert.match(tokens,/\[data-theme="dark"\] ?\{[^}]*--h42-color-bg: ?var\(--h42-ink\);/);
 assert.match(tokens,/--h42-ink: ?rgba\(27,27,27,1\);/);
});

test('light mode keeps its glows: the light .atmosphere backgrounds and the dimmed layer of the content pages are unchanged',()=>{
 const declarations=(sheet,selector,media=null)=>{const found=RULES.filter(rule=>rule.sheet===sheet&&rule.selector===selector&&rule.media===media);assert.equal(found.length,1,`one rule ${selector} ${media||''}`);return found[0].declarations;};
 assert.deepEqual(declarations('welcome.css',':root[data-theme=light] .atmosphere'),[['background','radial-gradient(ellipse at 77% 42%,#00BABC12,transparent 44%),radial-gradient(ellipse at 8% 97%,#EC33910B,transparent 36%),linear-gradient(145deg,#FFFFFF 8%,#F7FAFA 70%)']]);
 assert.deepEqual(declarations('welcome.css',':root[data-theme=light] .atmosphere','@media(max-width:700px)'),[['background','radial-gradient(ellipse at 83% 39%,#00BABC14,transparent 49%),radial-gradient(ellipse at 3% 86%,#EC33910D,transparent 43%),linear-gradient(160deg,#FFFFFF,#F4F8F8)']]);
 assert.deepEqual(declarations('content-preview.css','.app:not([data-section=explore]) .atmosphere'),[['position','fixed'],['opacity','.42']]);
});
