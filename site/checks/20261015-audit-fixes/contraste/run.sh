#!/bin/bash
# Lance un script Chrome de la zone « contraste » par l'enveloppe imposée :
# mémoire vérifiée (>= 2500 Mo disponibles, 20 essais espacés de 30 s) avant
# d'attendre le verrou machine, puis de nouveau juste avant le lancement.
# Usage : run.sh <script.py> [arguments]
LOCK=/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/codex-audit/chrome.lock
memwait() {
  avail=0
  for i in $(seq 1 20); do
    avail=$(free -m | awk '/^Mem/{print $7}')
    if [ "$avail" -ge 2500 ]; then echo "disponible ${avail} Mo"; return 0; fi
    echo "disponible ${avail} Mo < 2500 Mo, attente 30 s (${i}/20)"
    sleep 30
  done
  echo "mémoire toujours basse (${avail} Mo) : lancement refusé"; return 3
}
memwait || exit 3
export -f memwait
cd /home/le-rif/Bureau/Transcendence || exit 9
flock -w 2400 "$LOCK" bash -c 'memwait || exit 3; echo "lancement $0 $* à $(date +%T)"; env TMPDIR=/home/le-rif/.cache/horizon-codex-audit-chrome systemd-run --user --scope -q -p MemoryMax=2600M python3 -I "$0" "$@"' "$@"
status=$?
echo "statut ${status} à $(date +%T)"
exit $status
