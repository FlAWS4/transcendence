#!/bin/bash
# Lance un script de vérification dans Chrome sans tête, par l'enveloppe imposée :
# mémoire disponible >= 2500 Mo (30 s d'attente, 20 essais au plus), verrou machine,
# TMPDIR hors mémoire vive, portée systemd limitée à 2600 Mo.
LOCK=/tmp/claude-1000/-home-le-rif-Bureau-Transcendence/18d0b8f6-9491-4e02-9948-0bc4168cb89e/scratchpad/codex-audit/chrome.lock
avail=0
for i in $(seq 1 20); do
  avail=$(free -m | awk '/^Mem/{print $7}')
  if [ "$avail" -ge 2500 ]; then break; fi
  echo "disponible ${avail} Mo < 2500 Mo, attente 30 s (${i}/20)"
  sleep 30
done
if [ "$avail" -lt 2500 ]; then echo "mémoire encore basse (${avail} Mo) : lancement refusé"; exit 3; fi
echo "disponible ${avail} Mo ; lancement $* ($(date +%T))"
cd /home/le-rif/Bureau/Transcendence && flock -w 2400 "$LOCK" env TMPDIR=/home/le-rif/.cache/horizon-codex-audit-chrome systemd-run --user --scope -q -p MemoryMax=2600M python3 -I "$@"
status=$?
echo "code de sortie ${status} ($(date +%T))"
exit $status
