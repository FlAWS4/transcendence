import json,sys,importlib.util,os,collections
spec=importlib.util.spec_from_file_location('m','migrate.py')
sys.argv=['migrate.py','/nonexistent','plan','x']
src=open('migrate.py').read()
plan=json.load(open('plan.json'))
rules=plan['rules']; keys=sorted(rules,key=len,reverse=True)
SPLIT={'work','work/visualizations','work/figma'}
def mp(p):
    if p in SPLIT: return None
    for k in keys:
        if p==k or p.startswith(k+'/'): return rules[k]+p[len(k):]
    return p
b=json.load(open('c2-before.json'))['edges']; a=json.load(open('c2-after.json'))['edges']
B_ok={(mp(f),mp(t)) for f,r,t,ok in b if ok}
A_ok={(f,t) for f,r,t,ok in a if ok}
B_miss={(mp(f),r) for f,r,t,ok in b if not ok}
A_miss=[(f,r,t) for f,r,t,ok in a if not ok]
lost=sorted(B_ok-A_ok)
newmiss=[x for x in A_miss if (x[0],x[1]) not in B_miss]
gained=sorted(A_ok-B_ok)
print('before ok',len(B_ok),'after ok',len(A_ok),'lost',len(lost),'gained',len(gained),'new missing',len(newmiss))
for x in lost[:30]: print(' LOST',x)
for x in newmiss[:30]: print(' NEWMISS',x)
for x in gained[:15]: print(' GAINED',x)
