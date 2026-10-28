"""Static checks of the integration package against the nine trials (read-only everywhere).

1. Stylesheet: rebuilding it from essais/ gives the written file (build_package.py --check), and once the
   documented renames are undone and ':root:root' is put back to ':root[data-essais~=lisibilite-textes]',
   its rules (comments removed) equal the nine essai.css concatenated in the canonical order of essais/boot.js.
2. Specificity of every selector touched by the condition, before and after (computed here).
3. Module: every code line of pseudo-manquant/essai.mjs and awards-a-venir/essai.mjs (comments and the
   study's install() wrappers removed, renames applied) is present, in order, in design-review-selection.mjs;
   the localised copy is byte-identical; the seven other essai.mjs export an empty install(); early.js is a comment.
4. Hooks: no trial name left, new names absent from the original and from the study copy.
python3 -I check_package_source.py   ->  results-source.json"""
import hashlib, json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STUDY = HERE.parents[2]
ESSAIS = STUDY / 'essais'
PKG = STUDY / 'integration-20261015'
ORIGINAL = STUDY.parents[1] / 'site'
BASELINE = STUDY / 'baseline'
ORDER = ['globe-espace-libre', 'police-etiquettes-globe', 'une-colonne-320', 'roles-couleur', 'visiter-contour-sombre',
         'lisibilite-textes', 'echelle-unifiee', 'pseudo-manquant', 'awards-a-venir']
CSS_RENAMES = [('--essai-globe-', '--globe-fit-'), ('--essai-lt-accent', '--readable-text-accent'),
               ('data-pseudo-manquant=replie', 'data-pending-login=collapsed'), ('essai-awards-a-venir', 'awards-coming-soon')]
JS_RENAMES = [('pseudoManquant', 'pendingLogin'), ("'replie'", "'collapsed'"), ('essai-awards-a-venir', 'awards-coming-soon')]
CONDITION = ':root[data-essais~=lisibilite-textes]'


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def strip_comments(css): return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def rules(css):
    """Normalised rule text: comments removed, whitespace collapsed."""
    return ' '.join(strip_comments(css).split())


def specificity(selector):
    """(ids, classes/attributes/pseudo-classes, types) of one complex selector; :is()/:not() take their
    most specific argument, as in Selectors 4. Enough for the selectors of these stylesheets."""
    def top_level_split(text):
        out, depth, cur = [], 0, ''
        for ch in text:
            if ch in '([': depth += 1
            if ch in ')]': depth -= 1
            if ch == ',' and depth == 0: out.append(cur); cur = ''
            else: cur += ch
        out.append(cur); return out

    def spec(sel):
        a = b = c = 0; i = 0; s = sel.strip()
        while i < len(s):
            ch = s[i]
            if ch == '#':
                m = re.match(r'#[\w-]+', s[i:]); a += 1; i += len(m.group(0))
            elif ch == '.':
                m = re.match(r'\.[\w-]+', s[i:]); b += 1; i += len(m.group(0))
            elif ch == '[':
                j = s.index(']', i); b += 1; i = j + 1
            elif ch == ':':
                if s.startswith('::', i):
                    m = re.match(r'::[\w-]+', s[i:]); c += 1; i += len(m.group(0)); continue
                m = re.match(r':([\w-]+)', s[i:]); name = m.group(1); i += len(m.group(0))
                if i < len(s) and s[i] == '(':
                    depth, j = 1, i + 1
                    while depth:
                        depth += {'(': 1, ')': -1}.get(s[j], 0); j += 1
                    inner = s[i + 1:j - 1]; i = j
                    if name in ('is', 'not', 'has'):
                        best = max((spec(x) for x in top_level_split(inner)), default=(0, 0, 0))
                        a, b, c = a + best[0], b + best[1], c + best[2]
                    elif name == 'where': pass
                    else: b += 1
                else: b += 1
            elif re.match(r'[a-zA-Z*]', ch):
                m = re.match(r'[\w*-]+', s[i:])
                if m.group(0) != '*': c += 1
                i += len(m.group(0))
            else: i += 1
        return (a, b, c)
    return spec(selector)


def condition_selectors(css):
    """Every selector of a rule whose prelude contains the condition (or its replacement)."""
    out = []
    for m in re.finditer(r'([^{}]+)\{', strip_comments(css)):
        prelude = ' '.join(m.group(1).split())
        if prelude.startswith('@'): continue
        if CONDITION in prelude or ':root:root' in prelude:
            out += [p.strip() for p in prelude.split(',')]
    return out


def code_lines(js):
    lines = []
    for line in js.splitlines():
        t = line.strip()
        if not t or t.startswith('//'): continue
        lines.append(t)
    return lines


def main():
    report = {'files': {}}
    css_path, js_path = PKG / 'design-review-selection.css', PKG / 'design-review-selection.mjs'
    report['files'] = {'css': {'bytes': css_path.stat().st_size, 'sha256': sha(css_path)},
                       'mjs': {'bytes': js_path.stat().st_size, 'sha256': sha(js_path)}}
    report['trialSources'] = {f'{t}/{n}': sha(ESSAIS / t / n) for t in ORDER for n in ('essai.css', 'essai.mjs', 'essai.json') }
    report['trialSources']['echelle-unifiee/early.js'] = sha(ESSAIS / 'echelle-unifiee/early.js')
    boot = (ESSAIS / 'boot.js').read_text(encoding='utf-8')
    order_block = boot[boot.index('const ORDER'):boot.index(']);', boot.index('const ORDER'))]
    boot_order = [x for x in re.findall(r"'([a-z0-9-]+)'", order_block) if x in ORDER]
    report['canonicalOrder'] = {'bootJs': boot_order, 'used': ORDER, 'same': boot_order == ORDER}

    # 1. Stylesheet rebuild and rule equality.
    rebuilt = subprocess.run([sys.executable, '-I', str(HERE / 'build_package.py'), '--check'], capture_output=True, text=True)
    report['rebuild'] = {'identical': rebuilt.returncode == 0, 'output': rebuilt.stdout.strip()}
    css = css_path.read_text(encoding='utf-8')
    undone = css.replace(':root:root', CONDITION)
    for old, new in CSS_RENAMES: undone = undone.replace(new, old)
    trials = ''.join((ESSAIS / t / 'essai.css').read_text(encoding='utf-8') for t in ORDER)
    report['rules'] = {'equalAfterUndo': rules(undone) == rules(trials), 'ruleChars': len(rules(trials)),
                       'conditionCountTrials': trials.count(CONDITION), 'rootRootCountPackage': strip_comments(css).count(':root:root'),
                       'atPropertyCount': css.count('@property'), 'keyframesCount': css.count('@keyframes')}
    # 2. Specificity before/after for every selector touched by the condition.
    before = condition_selectors(trials); after = condition_selectors(css)
    pairs = []
    for b, a in zip(before, after):
        pairs.append({'before': b, 'after': a, 'specBefore': specificity(b), 'specAfter': specificity(a), 'same': specificity(b) == specificity(a)})
    report['specificity'] = {'count': len(pairs), 'allSame': len(before) == len(after) and all(p['same'] for p in pairs), 'pairs': pairs}
    # Renamed selectors keep their specificity (class -> class, attribute -> attribute).
    renamed = []
    for m in re.finditer(r'([^{}]+)\{', strip_comments(css)):
        prelude = ' '.join(m.group(1).split())
        if prelude.startswith('@') or not any(new in prelude for _, new in CSS_RENAMES): continue
        old = prelude
        for o, n in CSS_RENAMES: old = old.replace(n, o)
        for x, y in zip(prelude.split(','), old.split(',')):
            renamed.append({'after': x.strip(), 'specAfter': specificity(x), 'specBefore': specificity(y), 'same': specificity(x) == specificity(y)})
    report['renamedSelectors'] = {'count': len(renamed), 'allSame': all(r['same'] for r in renamed), 'list': renamed}

    # 3. Module logic.
    module = js_path.read_text(encoding='utf-8')
    mod_lines = code_lines(module)
    logic = {}
    for trial in ('pseudo-manquant', 'awards-a-venir'):
        src = (ESSAIS / trial / 'essai.mjs').read_text(encoding='utf-8')
        for old, new in JS_RENAMES: src = src.replace(old, new)
        lines = code_lines(src)
        # The study wrappers: export default install(...) { ... guard ... }, and the installed flag.
        skip = [l for l in lines if l.startswith('export default function install') or l in ('let installed = false;', 'installed = true;')
                or l.startswith('const index = document.getElementById') or l.startswith('if (installed ||')
                or l.startswith('const main = document.getElementById') or l.startswith("if (!main || main.querySelector")]
        body = [l for l in lines if l not in skip]
        # The last closing brace of install() becomes the closing brace of the package function.
        pos, missing = 0, []
        for line in body:
            try: pos = mod_lines.index(line, pos) + 1
            except ValueError: missing.append(line)
        logic[trial] = {'codeLines': len(lines), 'wrapperLinesReplaced': skip, 'checkedInOrder': len(body), 'missingOrOutOfOrder': missing}
    copy_trial = re.search(r'const COPY = Object\.freeze\(\{(.*?)\}\);', (ESSAIS / 'awards-a-venir/essai.mjs').read_text(encoding='utf-8'), re.S).group(1)
    copy_pkg = re.search(r'const COPY = Object\.freeze\(\{(.*?)\}\);', module, re.S).group(1)
    logic['copyByteIdentical'] = copy_trial.encode() == copy_pkg.encode()
    noop = {}
    for trial in ORDER:
        if trial in ('pseudo-manquant', 'awards-a-venir'): continue
        src = (ESSAIS / trial / 'essai.mjs').read_text(encoding='utf-8')
        noop[trial] = code_lines(src) == ['export default function install() {}']
    early = code_lines((ESSAIS / 'echelle-unifiee/early.js').read_text(encoding='utf-8'))
    logic['otherTrialsNoop'] = noop; logic['earlyJsOnlyComments'] = early == []
    uses = {name: [t for t in ORDER if name in (ESSAIS / t / 'essai.mjs').read_text(encoding='utf-8') + (ESSAIS / t / 'essai.css').read_text(encoding='utf-8')]
            for name in ('horizonStudy', 'horizonEssais', '_partage', 'data-essais')}
    logic['studyBridgeOrSharedUse'] = uses
    # The only cross-trial conditions are the lisibilite-textes ones of these two trials.
    expected_conditions = uses.pop('data-essais') == ['globe-espace-libre', 'echelle-unifiee']
    logic['conditionsOnlyInGlobeAndScale'] = expected_conditions
    report['module'] = logic

    # 4. Hooks.
    left = {name: [p for p in ('css', 'mjs') if name in (css if p == 'css' else module)]
            for name in ('essai-', 'data-essais', 'pseudo-manquant=', 'pseudoManquant', 'replie', 'horizonStudy', 'horizonEssais')}
    # The two comments quoting the former condition are expected in the stylesheet.
    left['data-essais'] = 'only-in-condition-notes' if css.count('data-essais') == css.count('stands for the former trial condition') == 2 else left['data-essais']
    texts = {}
    for label, root in (('original', ORIGINAL), ('copy', BASELINE)):
        blob = ''
        for p in root.rglob('*'):
            if any(part in ('archive', 'checks') for part in p.relative_to(root).parts): continue
            if p.suffix in ('.css', '.mjs', '.js', '.html') and p.is_file(): blob += p.read_text(encoding='utf-8', errors='replace')
        texts[label] = blob
    fresh = {}
    for name in ('--globe-fit-', '--readable-text-accent', 'awards-coming-soon', 'data-pending-login', 'pendingLogin', 'design-review-selection', 'horizon.design-review-selection', '--eu-'):
        fresh[name] = {k: v.count(name) for k, v in texts.items()}
    report['hooks'] = {'trialNamesLeft': left, 'newNamesElsewhere': fresh}
    ok = (report['canonicalOrder']['same'] and report['rebuild']['identical'] and report['rules']['equalAfterUndo']
          and report['specificity']['allSame'] and report['renamedSelectors']['allSame'] and logic['copyByteIdentical']
          and all(not v['missingOrOutOfOrder'] for k, v in logic.items() if isinstance(v, dict) and 'missingOrOutOfOrder' in v)
          and all(noop.values()) and logic['earlyJsOnlyComments'] and not any(uses.values()) and expected_conditions
          and all(not v for k, v in left.items() if k != 'data-essais') and left['data-essais'] == 'only-in-condition-notes'
          and all(not any(v.values()) for v in fresh.values()))
    report['passed'] = ok
    (HERE / 'results-source.json').write_text(json.dumps(report, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(json.dumps({'passed': ok, 'rules': report['rules'], 'specificity': [report['specificity']['count'], report['specificity']['allSame']],
                      'renamed': [report['renamedSelectors']['count'], report['renamedSelectors']['allSame']],
                      'module': {k: (v if not isinstance(v, dict) or 'missingOrOutOfOrder' not in v else [v['checkedInOrder'], v['missingOrOutOfOrder']]) for k, v in logic.items()},
                      'hooks': report['hooks']}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
