# Follows a courier workflow journal: one line per result, ok or not (copies: ids, kept, fixed layers not found)
import json, sys, time, os, re
p = sys.argv[1]
skip = int(sys.argv[2]) if len(sys.argv) > 2 else 0   # results already reported
pos, n = 0, 0
while True:
    if os.path.exists(p):
        with open(p) as f:
            f.seek(pos)
            for line in f:
                if not line.endswith('\n'):
                    break
                pos += len(line.encode())
                try:
                    o = json.loads(line)
                except Exception:
                    continue
                if o.get('type') != 'result':
                    continue
                v = o.get('result') if isinstance(o.get('result'), dict) else None
                if v is None:
                    print('résultat vide', flush=True); continue
                n += 1
                if n <= skip:
                    continue
                ver = [x for x in (v.get('verify') or '').split('\n') if x.strip()[:5] in ('MATCH', 'EQUIV', 'DIFF ', 'ALREA', 'NOT F')]
                last = ver[-1][:5] if ver else '-'
                res = v.get('result') or ''
                if v.get('ok') and last in ('MATCH', 'EQUIV', 'ALREA'):
                    try:
                        r = json.loads(res)
                        if 'zones' in r:
                            info = 'zones %s, fixes %s, dans un conteneur %s, enchaînements %s, manquants %s, arrivées introuvables %s, calques perdus %s%s' % (r.get('zones'), r.get('fixedZones'), r.get('inner'), r.get('auto'), len(r.get('missing') or []), len(r.get('badTarget') or []), len(r.get('lostLayer') or []), (', points de départ %s' % r['flows']) if 'flows' in r else '')
                        else:
                            info = 'copies %d, gardées %s, manquants %s, calques non retrouvés %s' % (len(r.get('ids') or {}), r.get('kept'), len(r.get('missing') or []) if isinstance(r.get('missing'), list) else 0, sum(len(x) for x in (r.get('notFound') or {}).values()))
                    except Exception:
                        info = res[:120].replace('\n', ' ')
                    print('OK', v.get('file'), last, info, flush=True)
                else:
                    print('ÉCHEC', v.get('file'), 'ok=%s' % v.get('ok'), last, res[:160].replace('\n', ' '), flush=True)
    time.sleep(10)
