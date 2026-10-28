// 42 Horizon — variables de texte du rendu, créées avant les appels d'écrans (refonte Figma, 18 oct. 2026)
const T = [["Explorer/Téléphone","Téléphone","Phone","الهاتف"],["Explorer/Formulaire de contact","Formulaire de contact","Contact form","نموذج التواصل"],["Explorer/Écrire au campus","Écrire au campus","Write to the campus","مراسلة الفرع"],["Explorer/novembre 2021","novembre 2021","November 2021","نوفمبر 2021"],["Explorer/Dates à consulter sur le site officiel․","Dates à consulter sur le site officiel.","Check the official website for dates.","راجع الموقع الرسمي للاطلاع على المواعيد."],["Explorer/Au 8 octobre 2026, les sessions publiées…","Au 8 octobre 2026, les sessions publiées de juillet et septembre 2026 sont terminées. Aucune session ultérieure n’est annoncée sur la page d’admission consultée.","As of 8 October 2026, the published July and September 2026 sessions have ended. No later session is announced on the admissions page checked.","حتى 8 أكتوبر 2026، انتهت الدورتان المنشورتان لشهري يوليو وسبتمبر 2026. ولا تعلن صفحة القبول التي تمت مراجعتها عن دورة لاحقة."]];
const coll = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:3:97');
const M = {}; for (const m of coll.modes) M[m.name] = m.modeId;
const have = {}; for (const v of await figma.variables.getLocalVariablesAsync('STRING')) if (v.variableCollectionId === coll.id) have[v.name] = v;
const NB = new RegExp('[' + String.fromCharCode(0xa0, 0x202f) + ']', 'g'), plain = s => String(s).replace(NB, ' '), RLM = String.fromCodePoint(0x200f);
const vals = v => [v.valuesByMode[M['Français']], v.valuesByMode[M['English']], v.valuesByMode[M['العربية']]];
const same = (v, fr, en, ar) => { const [vf, ve, va] = vals(v); return vf === fr && ve === en && va === ar; };
const near = (v, fr, en, ar) => { const [vf, ve, va] = vals(v); return (vf === fr && ve === en && RLM + va === ar) || (plain(vf) === plain(fr) && plain(ve) === plain(en) && plain(va) === plain(ar)); };
const clash = T.filter(([n, fr, en, ar]) => have[n] && !same(have[n], fr, en, ar) && !near(have[n], fr, en, ar)).map(r => r[0]);
if (clash.length) throw new Error("Variables de texte déjà dans Figma avec d'autres mots (registre strings-sent.json en retard sur le fichier), rien n'est créé : " + clash.join(' | '));
const out = { created: [], reused: [], updated: [] };
// 18 Oct.: setValueForMode lays out the texts bound to the variable: load a font Figma asks for, then try again (as render.js setStringValues)
const setv = async (v, mode, val) => { for (let i = 0; ; i++) { try { v.setValueForMode(mode, val); return; } catch (e) { const msg = String((e && e.message) || e); const f = i < 3 && (/family:\s*"([^"]+)",\s*style:\s*"([^"]+)"/.exec(msg) || /unloaded font "([^"]*) ([^" ]+)"/.exec(msg)); if (!f) throw e; await figma.loadFontAsync({ family: f[1], style: f[2] }); } } };
for (const [n, fr, en, ar] of T) {
  const v = have[n];
  if (v && same(v, fr, en, ar)) { out.reused.push(n); continue; }
  if (v) { await setv(v, M['Français'], fr); await setv(v, M['English'], en); await setv(v, M['العربية'], ar); out.updated.push(n); continue; }
  const c = figma.variables.createVariable(n, coll, 'STRING');
  c.setValueForMode(M['Français'], fr); c.setValueForMode(M['English'], en); c.setValueForMode(M['العربية'], ar);
  c.scopes = ['TEXT_CONTENT']; have[n] = c; out.created.push(n);
}
return { created: out.created.length, reused: out.reused.length, updated: out.updated.length };