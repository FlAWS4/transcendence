import sys, json
sys.path.insert(0, '/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/eb359fdc-c73d-4374-8394-7adda3e187b8/scratchpad/suite/tools')
import plib

INTER = {'a', 'button', 'summary', 'input', 'select', 'textarea', 'label'}
ROLES = {'button', 'tab', 'link', 'menuitem', 'option', 'menuitemradio', 'radio', 'checkbox', 'switch'}

def dump(state, fmt, allnodes=False):
    f = next(x for x in plib.frames() if x['state'] == state and x['fmt'] == fmt)
    F = plib.Frame(f)
    print('#', f['name'], '| page', f['page'], '| frame', f['w'], 'x', f['h'], '| full', F.full, '| sy', F.sy, '| doc', F.d['doc'], '| route', F.meta.get('routeOpened'), F.meta.get('siteMapNodes'))
    for n in F.nodes:
        inter = n['tag'] in INTER or n.get('role') in ROLES or n.get('href')
        if not (inter or allnodes):
            continue
        cb = F.clip_box(n)
        lab = n.get('aria-label') or ''
        print(('  ' if cb else '  [hid] ') + n['tag'], n.get('id', ''), repr((n.get('cls') or '')[:60]), 'aria=' + repr(lab[:60]) if lab else '', 'href=' + n['href'] if n.get('href') else '',
              'role=' + n['role'] if n.get('role') else '', 'pos=' + n['s'].get('position', '') if n['s'].get('position') else '',
              '| t=' + repr(F.deep_text(n, 70)), '| box', F.box(n), 'vis', cb)

if __name__ == '__main__':
    dump(sys.argv[1], sys.argv[2], len(sys.argv) > 3)
