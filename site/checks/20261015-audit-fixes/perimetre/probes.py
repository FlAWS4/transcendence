"""Code-level probes of the residual paths that can still hold the arrival labels (state 145).

Copies the active entrance.mjs and entrance.test.mjs (its fake-DOM harness) into
the scratchpad, appends four probe tests and runs only them. Nothing is written
in the repository except probes.json next to this script. These probes use the
test harness, not a browser: they show what the code does for a given sequence
of events, not how Chrome or a screen reader produces those events.
"""
from pathlib import Path
import json, re, shutil, subprocess

REPO = Path('/home/le-rif/Bureau/Transcendence')
FOLDER = REPO / 'site'
TMP = Path('/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/verif-perimetre/probes')
HERE = Path(__file__).resolve().parent
PROBES = r"""

// ---- Probes (scratchpad only): residual paths that can still hold the labels ----
test('probe P1 mouse opens, Escape closes: labels held until the next pointerdown',async t=>{
 const h=harness({interactions:true,reducedMotion:true});
 h.pointer();h.nodes.get('entry-login').click();h.key('Escape');h.cancelDialog();h.restoreFocus('entry-login');
 await h.advance(20000);const held=h.displayLocale;
 h.pointer();await h.advance(4000);
 t.diagnostic(JSON.stringify({probe:'P1',heldAfter20s:held,afterPointerdownAnd4s:h.displayLocale}));
});
test('probe P2 one key pressed after a pointer cancel, focus still on Sign in',async t=>{
 const rows={};
 for(const key of ['Tab','Escape','Enter',' ','a','F5','F6','F11','PrintScreen','AudioVolumeUp','MediaPlayPause','NumLock','ScrollLock','ContextMenu','Dead','Unidentified','Process','Fn','Hyper','Super','Shift','Alt','AltGraph','CapsLock','Control','Meta','OS']){
  const h=harness({interactions:true,reducedMotion:true});
  h.pointer();h.nodes.get('entry-login').click();h.pointer();h.cancelDialog();h.restoreFocus('entry-login');
  await h.advance(4000);const before=h.displayLocale;h.key(key);await h.advance(20000);
  rows[key]=before===h.displayLocale?'held':'rotating';
 }
 t.diagnostic(JSON.stringify({probe:'P2',rows}));
});
test('probe P3 mouse still over the actions after Back to the message on the error screen',async t=>{
 const h=harness({interactions:true,reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});
 h.guest();await h.flush();const phase=h.phase;h.hover(true);
 h.pointer();h.nodes.get('entrance-access').children[1].click();await h.flush();
 await h.advance(20000);const held=h.displayLocale;h.hover(false);await h.advance(4000);
 t.diagnostic(JSON.stringify({probe:'P3',phaseBefore:phase,phaseAfter:h.phase,heldAfter20s:held,afterPointerleaveAnd4s:h.displayLocale}));
});
test('probe P4 focus moved without any key or pointer event',async t=>{
 const h=harness({interactions:true,reducedMotion:true});const login=h.nodes.get('entry-login');
 h.restoreFocus('entry-login');await h.advance(4000);
 t.diagnostic(JSON.stringify({probe:'P4',afterFocusAnd4s:h.displayLocale,ariaDescription:login.getAttribute('aria-description')}));
});
// ---- Added on resumption (15 Oct, afternoon): account requests from the error screen (D4) and the opt-out path (D5) ----
test('probe P5 account sign-in and sign-up requested on the map error screen',async t=>{
 const rows={};
 for(const kind of ['signIn','signUp']){
  const h=harness({interactions:true,reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});
  h.guest();await h.flush();const before=h.phase;
  h.entrance[kind]();const after=h.phase,title=h.dialogTitle;
  const buttons=h.nodes.get('entrance-access').children.map(b=>b.id||b.textContent);
  h.pointer();h.cancelDialog();await h.advance(4000);
  rows[kind]={phaseBefore:before,phaseAfterRequest:after,dialogTitle:title,accessButtons:buttons,afterCancelAnd4s:h.displayLocale,dialogOpenAfterCancel:Boolean(h.dialogTitle)};
 }
 const h=harness({interactions:true,reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});
 h.guest();await h.flush();h.entrance.signIn();h.nodes.get('dialog').children[1].click();await h.flush();await h.advance(5000);
 const phaseAfterConfirm=h.phase,decoded=h.events.some(e=>e.decoded);
 h.nodes.get('entrance-access').children[2].click();await h.flush();
 rows.confirmFromErrorThenContinue={phaseAfterConfirm,decoded,opened:h.opened.slice(),finalPhase:h.phase};
 const w=harness({interactions:true,reducedMotion:true,prepare:()=>new Promise(()=>{})});
 w.guest();await w.flush();const waitingPhase=w.phase;w.entrance.signIn();
 rows.duringWaiting={phase:waitingPhase,after:w.phase,dialog:w.dialogTitle??null};
 t.diagnostic(JSON.stringify({probe:'P5',rows}));
});
test('probe P6 page without opt-in through the map error screen and back',async t=>{
 const h=harness({reducedMotion:true,prepare:()=>Promise.reject(new Error('offline'))});
 h.guest();await h.flush();const errorPhase=h.phase;
 h.nodes.get('entrance-access').children[1].click();await h.flush();
 const login=h.nodes.get('entry-login'),guest=h.nodes.get('entry-guest');
 const row={errorPhase,phaseAfterBack:h.phase,login:login.textContent,guest:guest.textContent,labelSpans:login.querySelector('.entrance-action-label')!==null,
  ariaDescription:login.getAttribute('aria-description'),timers:h.timers.size};
 h.language('ar');row.arabic=[login.textContent,login.getAttribute('lang')];await h.advance(20000);row.after20s=login.textContent;row.timersAfter=h.timers.size;
 t.diagnostic(JSON.stringify({probe:'P6',row}));
});
"""

if TMP.exists():
    shutil.rmtree(TMP)
(TMP / 'horizon-welcome').mkdir(parents=True)
(TMP / 'decryption-examples').mkdir()
for source, target in [('studies/decryption-examples/shared.mjs', 'decryption-examples/shared.mjs'),
                       ('studies/decryption-examples/scanner-return-together.mjs', 'decryption-examples/scanner-return-together.mjs'),
                       ('archives/early-prototypes/decryption/horizon-decryption-engine.mjs', 'horizon-decryption-engine.mjs'),
                       ('site/entrance.mjs', 'horizon-welcome/entrance.mjs')]:
    shutil.copyfile(REPO / source, TMP / target)
(TMP / 'horizon-welcome/entrance.test.mjs').write_text((FOLDER / 'entrance.test.mjs').read_text() + PROBES)
out = subprocess.run(['node', '--test', '--test-reporter=tap', '--test-name-pattern=^probe', str(TMP / 'horizon-welcome/entrance.test.mjs')],
                     capture_output=True, text=True, cwd=str(TMP), timeout=120)
(TMP / 'probes.tap').write_text(out.stdout + '\n--- stderr ---\n' + out.stderr)
results = [json.loads(line[2:]) for line in out.stdout.splitlines() if line.startswith('# {"probe"')]
summary = {key: int(value) for key, value in re.findall(r'^# (tests|pass|fail|skipped) (\d+)$', out.stdout, re.M)}
report = {'date': '2026-10-15', 'scope': 'Sondes au niveau du code (harnais de test, pas de navigateur) sur les chemins qui peuvent encore retenir les libellés de l’arrivée, état 145.',
          'exitCode': out.returncode, 'summary': summary, 'results': results}
(HERE / 'probes.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=1))
