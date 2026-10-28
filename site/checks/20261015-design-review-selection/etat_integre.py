"""Runs the preparation's etat_actuel.py in its INTEGRE=1 mode (integrated original served as is, compared with the
study copy + the nine trials), unchanged except for its output paths, which point to this folder.
INTEGRE=1 python3 -I etat_integre.py [view-name ...]  ->  results-etat-integre.json, captures/etat-integre/"""
import os, sys, time
from pathlib import Path

assert os.environ.get('INTEGRE') == '1', 'run with INTEGRE=1'
HERE = Path(__file__).resolve().parent
PREP = HERE.parents[2] / 'studies/design-review-studies/checks/_integration-20261015/preparation'
sys.path.insert(0, str(PREP))
import equivalence as eq  # noqa: E402
import etat_actuel as ea  # noqa: E402

assert ea.INTEGRE
eq.CAPTURES = HERE / 'captures' / 'etat-integre'; eq.CAPTURES.mkdir(parents=True, exist_ok=True)
ea.RESULTS = HERE / 'results-etat-integre.json'

if __name__ == '__main__':
    names = sys.argv[1:]
    for view in ea.VIEWS:
        if names and view['name'] not in names: continue
        print('==', view['name'], time.strftime('%H:%M:%S'), flush=True)
        ea.run(view)
