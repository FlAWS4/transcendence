#!/usr/bin/env bash
# Prepare the Figma calls of one area once its sections exist (Figma rebuild of 15 October 2026).
#   prepare_area.sh <area> <sections result json>
# Records the section ids, regenerates the screen calls (several screens per call), then the dark-clone call,
# and dry-runs the screen calls in the offline simulator. Nothing is sent to Figma.
set -euo pipefail
cd "$(dirname "$0")"
area="$1"; result="$2"
python3 layout.py record "$area" "$(cat "$result")"
python3 make_call.py resync-strings
first=$(python3 -c "import make_call; print(make_call.next_index())")
python3 layout.py scenes "$area"
python3 layout.py dark "$area"
files=$(cd ../calls && ls | awk -v f="$first" -F- '$1+0 >= f+0 && /\.js$/' )
echo "new calls:"; echo "$files"
node sim_figma.mjs $files 2>&1 | grep -E "^(OK|ERROR|skip)" | cut -c1-200
