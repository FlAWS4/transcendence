// Consistency check for the Horizon site map.
// Usage from the repository root: node docs/site-map/check-site-map.mjs [--json out.json]
// It reads site-map-data.js and compares it with the active prototype's code (read-only).
import {readFileSync, existsSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..', '..', 'site');
const sandbox = {window: {}};
vm.runInNewContext(readFileSync(join(here, 'site-map-data.js'), 'utf8'), sandbox);
const map = sandbox.window.HORIZON_SITE_MAP;

const problems = [], notes = [];
const fail = message => problems.push(message);
const read = file => readFileSync(join(site, file), 'utf8');

// 1. Structure of the data.
const KINDS = new Set(['page', 'tab', 'overlay', 'step', 'external', 'global']);
const ids = new Set();
const groups = new Set(map.groups.map(group => group.id));
for (const node of map.nodes) {
  if (ids.has(node.id)) fail(`duplicate screen id: ${node.id}`);
  ids.add(node.id);
  if (!/^[a-z0-9-]+$/.test(node.id)) fail(`screen id must use a-z, 0-9 and dashes: ${node.id}`);
  if (!groups.has(node.group)) fail(`${node.id}: unknown group ${node.group}`);
  if (!KINDS.has(node.kind)) fail(`${node.id}: unknown kind ${node.kind}`);
  if (!node.name?.fr || !node.name?.en) fail(`${node.id}: name needs fr and en`);
  if (node.note && (!node.note.fr || !node.note.en)) fail(`${node.id}: note needs fr and en`);
  if (node.when && (!node.when.fr || !node.when.en)) fail(`${node.id}: condition needs fr and en`);
  if (node.group === 'entry' && !Array.isArray(node.at)) fail(`${node.id}: entrance screens need a grid position "at"`);
  for (const file of [].concat(node.src || [])) if (!existsSync(join(site, file.split(':')[0]))) fail(`${node.id}: source file not found: ${file}`);
}
for (const node of map.nodes) if (node.parent && !ids.has(node.parent)) fail(`${node.id}: unknown parent ${node.parent}`);
if (!ids.has(map.start)) fail(`unknown start screen ${map.start}`);
const edgeKeys = new Set();
for (const edge of map.edges) {
  if (!ids.has(edge.from)) fail(`link from unknown screen ${edge.from}`);
  if (!ids.has(edge.to)) fail(`link to unknown screen ${edge.to}`);
  if (edge.kind !== 'auto' && (!edge.via?.fr || !edge.via?.en)) fail(`${edge.from} -> ${edge.to}: action label needs fr and en`);
  const key = `${edge.from}>${edge.to}>${edge.via?.fr}`;
  if (edgeKeys.has(key)) fail(`duplicate link ${key}`);
  edgeKeys.add(key);
}

// 2. Every screen is reachable from arrival, with the same rules as the page: tabs from their page,
//    always-present controls from every page or tab after the entrance (within their notFrom /
//    onlyFrom limits), member-only links once a simulated sign-in has happened.
const byId = new Map(map.nodes.map(node => [node.id, node]));
const edges = [...map.edges];
for (const node of map.nodes) if (node.kind === 'tab' && node.parent) edges.push({from: node.parent, to: node.id});
const globals = map.nodes.filter(node => node.group === 'global');
const hasChrome = node => (node.kind === 'page' || node.kind === 'tab') && node.group !== 'entry' && !node.noChrome;
const inRule = (rule, node) => rule.includes(node.group) || rule.includes(node.id);
const allowed = (item, node) => !(item.notFrom && inRule(item.notFrom, node)) && !(item.onlyFrom && !inRule(item.onlyFrom, node));
for (const item of [...map.nodes, ...map.edges]) for (const rule of [item.notFrom, item.onlyFrom]) {
  for (const value of rule || []) if (!groups.has(value) && !ids.has(value)) fail(`unknown group or screen in a rule: ${value}`);
}
for (const edge of map.edges) for (const who of [edge.requires, edge.sets]) {
  if (who && who !== 'visitor' && who !== 'member') fail(`${edge.from} -> ${edge.to}: identity must be visitor or member`);
}
const steps = (id, who) => {
  const node = byId.get(id), next = [];
  const push = edge => { if (!edge.requires || edge.requires === who) next.push([edge.to, edge.sets || who]); };
  for (const edge of edges) if (edge.from === id) push(edge);
  if (node && hasChrome(node)) for (const g of globals) {
    if (!allowed(g, node)) continue;
    if (g.direct) { for (const edge of edges) if (edge.from === g.id && allowed(edge, node)) push(edge); }
    else next.push([g.id, who]);
  }
  return next;
};
const seen = new Set(), states = new Set([`${map.start}|visitor`]), queue = [[map.start, 'visitor']];
while (queue.length) {
  const [id, who] = queue.shift();
  seen.add(id);
  for (const [to, nextWho] of steps(id, who)) {
    const key = `${to}|${nextWho}`;
    if (!states.has(key)) { states.add(key); queue.push([to, nextWho]); }
  }
}
for (const node of map.nodes) {
  // Direct controls are present on every page, and a separate entry point is a start of its own.
  if ((node.group === 'global' && node.direct) || node.altStart) continue;
  if (!seen.has(node.id)) fail(`not reachable from arrival: ${node.id}`);
}
for (const node of map.nodes.filter(item => item.altStart)) {
  if (!edges.some(edge => edge.from === node.id && seen.has(edge.to))) fail(`separate entry point ${node.id} leads nowhere known`);
}

// 3. Sections and tabs declared in the code must appear in the map.
const welcome = read('welcome.mjs');
const sectionList = welcome.match(/const sections=\[([^\]]+)\]/);
if (!sectionList) fail('welcome.mjs: section list not found');
else for (const section of sectionList[1].match(/'([^']+)'/g).map(value => value.slice(1, -1))) {
  if (!map.nodes.some(node => node.route === `#${section}`)) fail(`section #${section} from welcome.mjs has no page in the map`);
}
const tabLists = [
  ['project-ui.mjs', 'projectSections', map.codeParents.projectSections],
  ['profile-sections.mjs', 'profileSections', map.codeParents.profileSections],
  ['journal-ui.mjs', 'journalSections', map.codeParents.journalSections],
];
for (const [file, name, parent] of tabLists) {
  const found = read(file).match(new RegExp(`${name}=Object\\.freeze\\(\\[([^\\]]+)\\]`));
  if (!found) { fail(`${file}: ${name} not found`); continue; }
  const codeTabs = found[1].match(/'([^']+)'/g).map(value => value.slice(1, -1));
  const mapTabs = map.nodes.filter(node => node.parent === parent && node.kind === 'tab').map(node => node.tabKey);
  for (const tab of codeTabs) if (!mapTabs.includes(tab)) fail(`${name}: tab "${tab}" missing under ${parent}`);
  for (const tab of mapTabs) if (!codeTabs.includes(tab)) fail(`${parent}: tab "${tab}" no longer exists in ${name}`);
  notes.push(`${name}: ${codeTabs.join(', ')}`);
}

// 4. Example addresses point to entries that exist in the demonstration data.
const corpus = ['content-preview-data.mjs', 'profile-data.mjs', 'demo-content-seed.mjs', 'demo-content-expanded.mjs']
  .filter(file => existsSync(join(site, file))).map(read).join('\n');
for (const node of map.nodes) {
  const id = node.example?.match(/^#[a-z]+\/([^?]+)/)?.[1];
  if (id && !corpus.includes(`'${id}'`) && !corpus.includes(`"${id}"`)) fail(`${node.id}: example entry "${id}" not found in the demonstration data`);
}

const result = {screens: map.nodes.length, links: map.edges.length, reachable: seen.size, problems, notes};
const jsonAt = process.argv.indexOf('--json');
if (jsonAt > 0) writeFileSync(process.argv[jsonAt + 1], JSON.stringify(result, null, 2) + '\n');
console.log(`${result.screens} screens, ${result.links} links, ${result.reachable} reachable from arrival`);
for (const note of notes) console.log(`  code ${note}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exit(1);
}
console.log('OK: the map matches the checked parts of the code.');
