"""Check that a Figma call was sent exactly as written (Figma rebuild of 15 October 2026).

  python3 -I verify_sent.py <description> <source file> <transcripts root>
  python3 -I verify_sent.py --prior-ok <description> <source file> <transcripts root>
Looks, in the agent transcripts under <transcripts root> (a session's « subagents » folder, workflows included),
for every use_figma call whose description is <description>, and compares its `code` with <source file>.
Prints one line per call found: MATCH, or DIFF with the first differing position. Exit 0 if all match, 1 if one
differs, 2 if none is found. Adapted from the couriers' tool of 16 October.
--prior-ok (16 Oct. afternoon, after a session limit cut a courier between its send and its record): before sending,
tells whether an identical copy was already sent AND returned without error. Prints « ALREADY_OK » then the exact
text Figma returned (exit 0), or « NOT_SENT_OK » (exit 3).
17 Oct.: « EQUIV » when the copy differs only in how decimal numbers are written (couriers sometimes add a trailing zero
in long SVG paths: 3.230 for 3.23): same values, same geometry; it counts as an exact copy.
"""
import glob, json, os, re, sys

DECIMAL = re.compile(r'\d*\.\d+')


def canon(s):
    """The code with every decimal number in its shortest form (3.230 → 3.23, .5 → 0.5, 1.0 → 1)."""
    def short(m):
        r = repr(float(m.group()))
        return r.rstrip('0').rstrip('.') if ('.' in r and 'e' not in r) else r
    return DECIMAL.sub(short, s)

prior_ok = sys.argv[1] == '--prior-ok'
if prior_ok:
    sys.argv.pop(1)
name, path, root = sys.argv[1], sys.argv[2], sys.argv[3]
want = open(path, encoding='utf-8').read()
found = []
for f in glob.glob(os.path.join(root, '**', '*.jsonl'), recursive=True):
    try:
        with open(f, encoding='utf-8') as fh:
            for ln, line in enumerate(fh):
                if name not in line:
                    continue
                try:
                    obj = json.loads(line)
                except ValueError:
                    continue
                if obj.get('type') != 'assistant':
                    continue   # only the calls the agent made (request records may hold another form of the input)
                content = (obj.get('message') or {}).get('content')
                if not isinstance(content, list):
                    continue
                for block in content:
                    if isinstance(block, dict) and block.get('type') == 'tool_use' and str(block.get('name', '')).endswith('use_figma'):
                        inp = block.get('input') or {}
                        if inp.get('description') == name:
                            found.append((f, ln, obj.get('timestamp'), inp.get('code') or '', block.get('id')))
    except OSError:
        pass


def returned_ok(f, use_id):
    """Text of the tool_result answering use_id in transcript f, or None if missing or an error."""
    with open(f, encoding='utf-8') as fh:
        for line in fh:
            if use_id not in line or '"tool_result"' not in line:
                continue
            content = (json.loads(line).get('message') or {}).get('content')
            for block in content if isinstance(content, list) else []:
                if isinstance(block, dict) and block.get('type') == 'tool_result' and block.get('tool_use_id') == use_id:
                    if block.get('is_error'):
                        return None
                    c = block.get('content')
                    text = c if isinstance(c, str) else ''.join(x.get('text', '') for x in c or [] if isinstance(x, dict))
                    return None if text.lstrip().startswith('Error') else text
    return None


if prior_ok:
    for f, ln, ts, code, use_id in sorted(found, key=lambda x: x[2] or ''):
        text = returned_ok(f, use_id) if (code == want or canon(code) == canon(want)) and use_id else None
        if text is not None:
            print(f'ALREADY_OK {os.path.basename(f)} line {ln} ts {ts} len {len(code)}')
            print(text)
            sys.exit(0)
    print('NOT_SENT_OK')
    sys.exit(3)
if not found:
    print('NOT FOUND')
    sys.exit(2)
status = 0
for f, ln, ts, code, _ in sorted(found, key=lambda x: x[2] or ''):
    if code == want:
        print(f'MATCH {os.path.basename(f)} line {ln} ts {ts} len {len(code)}')
    elif canon(code) == canon(want):
        print(f'EQUIV {os.path.basename(f)} line {ln} ts {ts} sent_len {len(code)} file_len {len(want)} (decimal numbers written differently, same values)')
    else:
        status = 1
        n = min(len(code), len(want))
        i = next((k for k in range(n) if code[k] != want[k]), n)
        print(f'DIFF {os.path.basename(f)} line {ln} ts {ts} sent_len {len(code)} file_len {len(want)} first_diff_at {i}')
        print('  file:', repr(want[max(0, i - 80):i + 80]))
        print('  sent:', repr(code[max(0, i - 80):i + 80]))
sys.exit(status)
