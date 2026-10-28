"""Watch the active prototype for another session's work, one line per event.

Reports changes to the three continuity documents, and once when the active prototype has had no
file change for QUIET seconds (again after any new activity). Read-only.
"""
import os, sys, time
from pathlib import Path

REPO = Path('/home/le-rif/Bureau/Transcendence')
ACTIVE = REPO / 'site'
DOCS = [REPO / name for name in ('PROJECT_CONTEXT.md', 'BOARDING_JOURNAL.md', 'README.md')]
QUIET = int(sys.argv[1]) if len(sys.argv) > 1 else 900


def latest(root):
    newest, where = 0.0, ''
    for folder, _, files in os.walk(root):
        for name in files:
            try:
                stamp = os.stat(os.path.join(folder, name)).st_mtime
            except OSError:
                continue
            if stamp > newest:
                newest, where = stamp, os.path.join(folder, name)
    return newest, where


def clock(stamp):
    return time.strftime('%H:%M', time.localtime(stamp))


docs = {path: path.stat().st_mtime for path in DOCS}
reported_quiet = False
while True:
    for path in DOCS:
        stamp = path.stat().st_mtime
        if stamp != docs[path]:
            docs[path] = stamp
            print(f'Document modifié : {path.name} à {clock(stamp)}', flush=True)
    newest, where = latest(ACTIVE)
    if time.time() - newest >= QUIET and not reported_quiet:
        print(f"Original au repos depuis {QUIET // 60} min (dernier changement à {clock(newest)} : {os.path.relpath(where, ACTIVE)})", flush=True)
        reported_quiet = True
    elif time.time() - newest < QUIET and reported_quiet:
        print(f'Nouvelle activité dans l’original à {clock(newest)} : {os.path.relpath(where, ACTIVE)}', flush=True)
        reported_quiet = False
    time.sleep(30)
