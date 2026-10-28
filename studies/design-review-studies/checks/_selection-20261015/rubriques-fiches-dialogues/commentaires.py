"""Comment thread after a posted comment (local demo storage of the check Chrome only): comment
actions, reply form (Répondre / Annuler / Emoji) and the owner menu, copy vs the nine trials.
python3 -I commentaires.py
Same measures as dialogues.py (painted contrast, size, radius, focus, tracing per trial sheet).
Results: commentaires.json; screenshots in shots/.
"""
import json, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import dialogues as DL
from lib import *  # noqa: F401,F403

SHOTS = HERE / 'shots'
DL.SURFACES.update({
    'commentaire': ('.cp-comment', [('J’aime', '.cp-comment .cp-comment-actions .cp-comment-reaction:nth-of-type(1)'), ('Je n’aime pas', '.cp-comment .cp-comment-actions .cp-comment-reaction:nth-of-type(2)'),
                                    ('Répondre (action)', '.cp-comment .cp-comment-actions .cp-comment-reply'), ('Menu du commentaire', '.cp-comment .cp-comment-menu-toggle')]),
    'reponse': ('.cp-comments-reply-form', [('Répondre', '.cp-comments-reply-form .cp-comments-submit'), ('Annuler (réponse)', '.cp-comments-reply-form .cp-comments-cancel'), ('Emoji (réponse)', '.cp-comments-reply-form .cp-comments-emoji-toggle')]),
    'menu-commentaire': ('.cp-comment-owner-menu', [('Option 1', '.cp-comment-owner-menu button:nth-of-type(1)'), ('Option 2', '.cp-comment-owner-menu button:nth-of-type(2)')]),
})
SCREENS = [('ordinateur', D, 'light', 'fr'), ('mobile-sombre-ar', M, 'dark', 'ar'), ('petit-ar', S, 'light', 'ar')]
TEXT = {'fr': 'Essai de combinaison : un commentaire de contrôle.', 'ar': 'تعليق للتحقق من الجمع بين التجارب.'}
store = Store('commentaires')
MAIN = DL.MAIN


def job(screen, label, essais):
    name, vp, theme, lang = screen
    scale = 2 if vp[2] else 1
    def run(s):
        if label in store.data.get(name, {}): return
        load(s, f'projects/{PID}?tab=comments', essais, theme, lang, vp)
        s.wait('Boolean(document.querySelector(' + json.dumps(MAIN + ' textarea') + '))', 10)
        s.click(MAIN + ' textarea'); s.c.call('Input.insertText', {'text': TEXT[lang]}); time.sleep(.4)
        s.click(MAIN + ' .cp-comments-submit')
        if not s.wait('Boolean(document.querySelector(".cp-comment .cp-comment-actions"))', 8): raise RuntimeError('comment not posted')
        s.js('(()=>{document.querySelector(".cp-comment").scrollIntoView({block:"center"});return true})()'); time.sleep(.8)
        res = {'commentaire': DL.measure_state(s, 'commentaire', label, name, scale)}
        res['texte'] = s.js('(()=>{const e=document.querySelector(".cp-comment .cp-comment-text");const c=getComputedStyle(e);return{fs:c.fontSize,lh:c.lineHeight,color:c.color}})()')
        s.click('.cp-comment .cp-comment-reply')
        if s.wait('Boolean(document.querySelector(".cp-comments-reply-form .cp-comments-submit"))', 8):
            s.js('(()=>{document.querySelector(".cp-comments-reply-form").scrollIntoView({block:"center"});return true})()'); time.sleep(.8)
            res['reponse'] = DL.measure_state(s, 'reponse', label, name, scale)
            s.click('.cp-comments-reply-form .cp-comments-cancel'); time.sleep(.6)
        s.js('(()=>{document.querySelector(".cp-comment").scrollIntoView({block:"center"});return true})()'); time.sleep(.6)
        s.click('.cp-comment .cp-comment-menu-toggle'); time.sleep(.6)
        if s.js('(()=>{const p=document.querySelector(".cp-comment-owner-menu");return Boolean(p&&p.getClientRects().length&&getComputedStyle(p).visibility!=="hidden")})()'):
            res['menu-commentaire'] = DL.measure_state(s, 'menu-commentaire', label, name, scale)
        res['erreurs'] = s.errors(); res['debordement'] = s.overflow()
        store.data.setdefault(name, {})[label] = res; store.save(); print(name, label, list(res), flush=True)
    return run


run_jobs([job(screen, label, essais) for screen in SCREENS for label, essais in (('base', []), ('combo', ALL9))], SHOTS, per=6)
