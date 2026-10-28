"""Report workflow steps and guard memory while several headless Chrome run, one line per event.

Below 2 GB available: lower helper.py's Chrome slots to 1 (running checks continue).
Below 1.2 GB: stop the largest headless check Chrome (its own systemd scope; never the
user's browser or the editor). Back above 4 GB: restore RESTORE slots (2 while the
user's own browser shares the memory).
"""
import glob, json, os, subprocess, sys, time
from pathlib import Path

JOURNAL = sys.argv[1]
SLOTS = Path.home() / '.cache' / 'horizon-design-review-chrome' / 'slots'
SERVICE = '/sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service'
labels, seen, state, last_stop = {}, 0, 'ok', 0.0
# --discret: switch the slots silently; only report steps, failures and emergency stops.
QUIET = '--discret' in sys.argv[2:]
RESTORE = 2
# --suite: when re-armed, learn the labels of earlier steps without reporting them again.
if '--suite' in sys.argv[2:] and os.path.exists(JOURNAL):
    for line in open(JOURNAL).read().splitlines():
        seen += 1
        try:
            record = json.loads(line)
        except ValueError:
            continue
        if record.get('type') == 'started':
            labels[record.get('agentId')] = record.get('label')


def available():
    for line in open('/proc/meminfo'):
        if line.startswith('MemAvailable:'):
            return int(line.split()[1]) // 1024
    return 0


def tmp_used():
    stat = os.statvfs('/tmp')
    return (stat.f_blocks - stat.f_bfree) * stat.f_frsize // 2**20


def check_scopes():
    # Running scopes started by helper.py: their description holds the study profile path.
    scopes = []
    for path in glob.glob(SERVICE + '/**/run-*.scope', recursive=True):
        unit = os.path.basename(path)
        try:
            shown = subprocess.run(['systemctl', '--user', 'show', '-p', 'Description', unit], capture_output=True, text=True, timeout=5).stdout
            memory = int(open(os.path.join(path, 'memory.current')).read()) // 2**20
        except (OSError, ValueError, subprocess.SubprocessError):
            continue
        if 'horizon-design-review-' 'chrome/profile-' in shown:
            scopes.append((memory, unit))
    return sorted(scopes, reverse=True)


def set_slots(count):
    try:
        SLOTS.write_text(f'{count}\n')
    except OSError:
        pass


while True:
    try:
        lines = open(JOURNAL).read().splitlines() if os.path.exists(JOURNAL) else []
    except OSError:
        lines = []
    for line in lines[seen:]:
        try:
            record = json.loads(line)
        except ValueError:
            continue
        kind, agent = record.get('type'), record.get('agentId')
        if kind == 'started':
            labels[agent] = record.get('label')
            print(f"Démarré : {record.get('label')}", flush=True)
        elif kind == 'result':
            print(f"Terminé : {labels.get(agent, agent)}", flush=True)
        elif kind == 'failed':
            print(f"ÉCHEC : {labels.get(agent, agent)}", flush=True)
    seen = len(lines)
    avail, tmp = available(), tmp_used()
    if avail < 1200 and time.time() - last_stop > 30:
        scopes = check_scopes()
        if scopes:
            memory, unit = scopes[0]
            subprocess.run(['systemctl', '--user', 'stop', unit], capture_output=True, timeout=20)
            last_stop = time.time()
            print(f"URGENCE : mémoire disponible {avail} Mo, Chrome de contrôle {unit} ({memory} Mo) arrêté", flush=True)
    low = avail < 2000 or tmp > 2500
    if low and state == 'ok':
        set_slots(1)
        total = sum(memory for memory, _ in check_scopes())
        QUIET or print(f"ALERTE : mémoire disponible {avail} Mo, /tmp {tmp} Mo, Chrome de contrôle {total} Mo ; un seul Chrome de contrôle à la fois", flush=True)
        state = 'alerte'
    elif state == 'alerte' and avail >= 4000 and tmp <= 2500:
        set_slots(RESTORE)
        QUIET or print(f"Retour à la normale : disponible {avail} Mo, /tmp {tmp} Mo ; {RESTORE} Chrome de contrôle à la fois", flush=True)
        state = 'ok'
    time.sleep(5)
