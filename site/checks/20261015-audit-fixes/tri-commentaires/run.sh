#!/bin/bash
# Lanceur unique (règle 2) : mémoire disponible >= 2500 Mo (20 essais espacés de 30 s),
# verrou machine (un seul Chrome à la fois), TMPDIR hors disque mémoire, scope systemd plafonné à 2600 Mo.
LOCK=/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/codex-audit/chrome.lock
avail=0
for i in $(seq 1 20); do
  avail=$(free -m | awk '/^(Mem|Mém)/{print $7}')
  if [ "${avail:-0}" -ge 2500 ]; then break; fi
  echo "disponible ${avail} Mo < 2500 Mo, attente 30 s (${i}/20)"
  sleep 30
done
if [ "${avail:-0}" -lt 2500 ]; then echo "mémoire insuffisante (${avail} Mo) : lancement refusé"; exit 3; fi
echo "disponible ${avail} Mo ; lancement $(date +%T) : $*"
cd /home/le-rif/Bureau/Transcendence && flock -w 2400 "$LOCK" env TMPDIR=/home/le-rif/.cache/horizon-codex-audit-chrome systemd-run --user --scope -q -p MemoryMax=2600M python3 -I "$@"
status=$?
echo "statut ${status} $(date +%T)"
exit $status
