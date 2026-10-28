// 42 Horizon — parcours cliquables : zones cliquables et interactions des cadres de « 09 · Parcours · ordinateur » (lot 17) ; chaque zone est un cadre transparent posé sur l'élément du site ; seuls ces zones, les interactions et les points de départ changent (refonte Figma, 19 oct. 2026)
const dest = await figma.getNodeByIdAsync('760:7');
await figma.setCurrentPageAsync(dest);
const colors = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:2');
const MODE = {}; for (const m of colors.modes) MODE[m.name] = m.modeId;
const TOK = new RegExp(String.fromCodePoint(0x27e6) + '(202f|00a0)' + String.fromCodePoint(0x27e7), 'g');
const UN = s => s.replace(TOK, (_, h) => String.fromCodePoint(parseInt(h, 16)));
const J = [{"id": "767:1562441", "zones": [{"box": [0, 0, 1440, 415.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [0, 415.0, 381, 440.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [1059, 415.0, 381, 440.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [0, 922.0, 1440, 38.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [0, 855.0, 1440, 19.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [0, 874.0, 386, 48.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [1054, 874.0, 386, 48.0], "fixed": true, "label": "À côté du menu", "act": {"back": 1}}, {"box": [170, 324.0, 348, 91.0], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [546, 324.0, 348, 91.0], "fixed": false, "label": "Carte d’un projet → Fiche projet · projet à campus unique — Ordinateur · Clair · English", "act": {"nav": "796:264606"}}, {"box": [170, 415.0, 211, 89.0], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [172, 555.2, 209, 72.8], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [170, 284.0, 296, 40.0], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [546, 284.0, 296, 40.0], "fixed": false, "label": "Carte d’un projet → Fiche projet · projet à campus unique — Ordinateur · Clair · English", "act": {"nav": "796:264606"}}, {"box": [1059.1, 204.0, 104.4, 44.0], "fixed": false, "label": "Affichage · Liste → Liste des projets · vue Liste — Ordinateur · Clair · English", "act": {"nav": "797:261190"}}, {"box": [1171.5, 204.0, 98.5, 44.0], "fixed": false, "label": "Trier → Liste des projets · tri ouvert — Ordinateur · Clair · English", "act": {"nav": "797:261301"}}, {"box": [170, 272.0, 348, 12.0], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [546, 272.0, 348, 12.0], "fixed": false, "label": "Carte d’un projet → Fiche projet · projet à campus unique — Ordinateur · Clair · English", "act": {"nav": "796:264606"}}, {"box": [968.9, 204.0, 82.2, 44.0], "fixed": false, "label": "Filtrer → Filtrer les projets — Ordinateur · Clair · English", "act": {"nav": "767:1692502"}}, {"box": [309.2, 659.5, 71.8, 40.0], "fixed": false, "label": "Auteur d’une carte («⟦00a0⟧Créé par⟦00a0⟧») → Fiche profil — Ordinateur · Clair · English", "act": {"nav": "767:1610574"}}, {"box": [506, 284.0, 12, 40.0], "fixed": false, "label": "Carte d’un projet → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [882, 284.0, 12, 40.0], "fixed": false, "label": "Carte d’un projet → Fiche projet · projet à campus unique — Ordinateur · Clair · English", "act": {"nav": "796:264606"}}, {"box": [48, 41.7, 187.1, 40.7], "fixed": true, "label": "Logo → Explorer · Monde — Ordinateur · Clair · English", "act": {"nav": "767:1596548"}}, {"box": [701.0, 87.0, 82.0, 42.0], "fixed": true, "label": "Portée → «⟦00a0⟧Où veux-tu aller⟦00a0⟧?⟦00a0⟧» — Ordinateur · Clair · English", "act": {"nav": "767:1676698"}}, {"box": [1348, 40.0, 44, 44.0], "fixed": true, "label": "Compte → Panneau du compte · visiteur — Ordinateur · Clair · English", "act": {"nav": "767:1438789"}}, {"box": [394, 464.5, 652, 67.1], "fixed": true, "label": "Résultat «⟦00a0⟧Campus⟦00a0⟧» → Explorer · Campus — Ordinateur · Clair · English", "act": {"nav": "767:1596644"}}, {"box": [394, 534.6, 652, 67.1], "fixed": true, "label": "Résultat «⟦00a0⟧Projet⟦00a0⟧» → Fiche projet · projet à campus unique — Ordinateur · Clair · English", "act": {"nav": "796:264606"}}, {"box": [394, 604.7, 652, 67.1], "fixed": true, "label": "Résultat · ft_transcendence · Building as f → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [394, 674.8, 652, 67.1], "fixed": true, "label": "Résultat · Shared chat rooms · The explaine → Fiche projet — Ordinateur · Clair · English", "act": {"nav": "796:264159"}}, {"box": [394, 744.9, 652, 57.9], "fixed": true, "label": "Résultat «⟦00a0⟧Chroniques⟦00a0⟧» → Chronique — Ordinateur · Clair · English", "act": {"nav": "767:344833"}}, {"box": [506, 815.0, 336, 27.8], "fixed": true, "label": "Résultat «⟦00a0⟧Profil⟦00a0⟧» → Fiche profil — Ordinateur · Clair · English", "act": {"nav": "767:1610574"}}, {"box": [394, 842.8, 652, 12.2], "fixed": true, "label": "Résultat «⟦00a0⟧Profil⟦00a0⟧» → Fiche profil — Ordinateur · Clair · English", "act": {"nav": "767:1610574"}}, {"box": [882, 815.0, 164, 27.8], "fixed": true, "label": "Résultat «⟦00a0⟧Profil⟦00a0⟧» → Fiche profil — Ordinateur · Clair · English", "act": {"nav": "767:1610574"}}, {"box": [506, 802.8, 336, 9.2], "fixed": true, "label": "Résultat «⟦00a0⟧Chroniques⟦00a0⟧» → Chronique — Ordinateur · Clair · English", "act": {"nav": "767:344833"}}, {"box": [394, 815.0, 72, 27.8], "fixed": true, "label": "Résultat «⟦00a0⟧Profil⟦00a0⟧» → Fiche profil — Ordinateur · Clair · English", "act": {"nav": "767:1610574"}}, {"box": [1010, 876.0, 44, 44.0], "fixed": true, "label": "Fermer la recherche", "act": {"back": 1}}, {"box": [882, 802.8, 164, 9.2], "fixed": true, "label": "Résultat «⟦00a0⟧Chroniques⟦00a0⟧» → Chronique — Ordinateur · Clair · English", "act": {"nav": "767:344833"}}, {"box": [394, 802.8, 72, 9.2], "fixed": true, "label": "Résultat «⟦00a0⟧Chroniques⟦00a0⟧» → Chronique — Ordinateur · Clair · English", "act": {"nav": "767:344833"}}], "auto": null, "scrolls": false}, {"id": "767:1439130", "zones": [{"box": [0, 0, 1440, 328.4], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [0, 631.6, 1440, 328.4], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [0, 328.4, 510, 303.2], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [930, 328.4, 510, 303.2], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [25, 156.2, 370, 53.0], "fixed": true, "label": "Continuer avec le profil, puis l’avatar → Liste des projets · membre — Ordinateur · Clair · English", "act": {"nav": "800:775857"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}, {"box": [25, 217.2, 370, 53.0], "fixed": true, "label": "Cancel → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}, {"box": [351, 25.0, 44, 44.0], "fixed": true, "label": "Fermer → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}], "auto": null, "scrolls": false}, {"id": "767:1444870", "zones": [{"box": [0, 0, 1440, 328.4], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [0, 631.6, 1440, 328.4], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [0, 328.4, 510, 303.2], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [930, 328.4, 510, 303.2], "fixed": true, "label": "À côté de la fenêtre → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}}, {"box": [25, 156.2, 370, 53.0], "fixed": true, "label": "Simuler la création du compte, puis l’avatar → Liste des projets · membre — Ordinateur · Clair · English", "act": {"nav": "800:775857"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}, {"box": [25, 217.2, 370, 53.0], "fixed": true, "label": "Cancel → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}, {"box": [351, 25.0, 44, 44.0], "fixed": true, "label": "Fermer → Liste des projets — Ordinateur · Clair · English", "act": {"nav": "796:265030"}, "in": {"path": ["#dialog"], "x": 510.0, "y": 328.4, "w": 420, "h": 303.2}}], "auto": null, "scrolls": false}, {"id": "797:263895", "zones": [{"box": [0, 16.0, 80, 928.0], "fixed": true, "label": "À côté de la fenêtre", "act": {"back": 1}}, {"box": [1360, 16.0, 80, 928.0], "fixed": true, "label": "À côté de la fenêtre", "act": {"back": 1}}, {"box": [0, 0, 1440, 16.0], "fixed": true, "label": "À côté de la fenêtre", "act": {"back": 1}}, {"box": [0, 944.0, 1440, 16.0], "fixed": true, "label": "À côté de la fenêtre", "act": {"back": 1}}, {"box": [1299, 29.0, 44, 44.0], "fixed": true, "label": "Fermer le média", "act": {"back": 1}}], "auto": null, "scrolls": false}, {"id": "767:1535209", "zones": [], "auto": {"nav": "767:1399227", "after": 0.6}, "scrolls": false}];
const out = { zones: 0, fixedZones: 0, inner: 0, auto: 0, missing: [], badTarget: [], lostLayer: [] };
// 19 Oct.: the layer of a menu, a panel or a sheet that scrolls inside (path of names from the frame, the last step by its
// position): its zones go in it, and it scrolls
function locate(c, path, x, y) {
  let cur = c;
  const T0 = c.absoluteTransform;
  for (let i = 0; i < path.length; i++) {
    const kids = ('children' in cur ? cur.children : []).filter(n => n.name === path[i]);
    if (!kids.length) return null;
    if (i < path.length - 1) { cur = kids[0]; continue; }
    let best = null, bd = 1e9;
    for (const k of kids) { const t = k.absoluteTransform, d = Math.abs(t[0][2] - T0[0][2] - x) + Math.abs(t[1][2] - T0[1][2] - y); if (d < bd) { bd = d; best = k; } }
    return bd < 2 ? best : null;
  }
  return null;
}
const inKey = h => h.in.path.join('>') + '@' + h.in.x + ',' + h.in.y;
const act = (a, f) => {
  if (a.nav) return { type: 'NODE', destinationId: a.nav, navigation: 'NAVIGATE', transition: null, resetScrollPosition: true };
  if (a.back) return { type: 'BACK' };
  if (a.url) return { type: 'URL', url: a.url, openInNewTab: true };
  if (a.mode) return { type: 'SET_VARIABLE_MODE', variableCollectionId: colors.id, variableModeId: MODE[a.mode] };
  if (a.top) { const app = f.children.find(n => n.name === 'Application'); return app ? { type: 'NODE', destinationId: app.id, navigation: 'SCROLL_TO', transition: null } : null; }
  return null;
};
for (const j of J) {
  const f = await figma.getNodeByIdAsync(j.id);
  if (!f) { out.missing.push(j.id); continue; }
  // again from scratch: zones of an earlier run removed, the fixed layers of the copy kept fixed. 19 Oct.: on a page that
  // scrolls they are every child but « Application » once the zones are gone (the conversion took them out), which stays
  // true after a run cut short before it counted its fixed zones
  for (const old of f.children.filter(n => n.name.startsWith('Zone · '))) old.remove();
  const conts = new Map();
  for (const h of j.zones) {
    if (!h.in || conts.has(inKey(h))) continue;
    const c = locate(f, h.in.path, h.in.x, h.in.y);
    conts.set(inKey(h), c);
    if (c) for (const old of c.children.filter(n => n.name.startsWith('Zone · '))) old.remove();
  }
  let fixedCount = j.scrolls ? f.children.filter(n => n.name !== 'Application').length : f.numberOfFixedChildren;
  f.numberOfFixedChildren = fixedCount;
  let fz = 0;
  for (const h of j.zones) {
    const a = act(h.act, f);
    if (!a || (h.act.nav && !(await figma.getNodeByIdAsync(h.act.nav)))) { out.badTarget.push(j.id + ' ' + h.label); continue; }
    const cont = h.in ? conts.get(inKey(h)) : null;
    if (h.in && !cont) { out.lostLayer.push(j.id + ' ' + h.label); continue; }
    const z = figma.createFrame(); z.name = UN('Zone · ' + h.label); z.fills = []; z.clipsContent = false;
    if (cont) {
      cont.appendChild(z);
      if ('layoutMode' in cont && cont.layoutMode !== 'NONE') z.layoutPositioning = 'ABSOLUTE';
      if (cont.overflowDirection !== 'VERTICAL') cont.overflowDirection = 'VERTICAL';
      out.inner++;
    } else if (h.fixed && fixedCount + fz >= 0 && j.scrolls) { f.appendChild(z); fz++; } else { f.insertChild(f.children.length - fixedCount - fz, z); }
    z.resize(Math.max(1, h.box[2]), Math.max(1, h.box[3])); z.x = h.box[0]; z.y = h.box[1];
    await z.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [a] }]);
    out.zones++;
  }
  f.numberOfFixedChildren = fixedCount + fz; out.fixedZones += fz;
  if (j.auto) { await f.setReactionsAsync([{ trigger: { type: 'AFTER_TIMEOUT', timeout: j.auto.after }, actions: [act(j.auto, f)] }]); out.auto++; }
  else await f.setReactionsAsync([]);
}
dest.flowStartingPoints = [{"nodeId": "766:1058793", "name": "Français · arrivée"}, {"nodeId": "767:980622", "name": "Français · membre"}, {"nodeId": "762:3541", "name": "Français · aperçu direct"}, {"nodeId": "767:1398815", "name": "English · arrival"}, {"nodeId": "800:775630", "name": "English · member"}, {"nodeId": "796:265030", "name": "English · direct preview"}];
out.flows = dest.flowStartingPoints.length;
return out;