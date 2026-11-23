#!/bin/bash
# run_remote.sh <run> <game> [driver args...]
# Runs render_scenes.py for one game on a render box (Blender on the PATH or $BLENDER). Layout under $DRESS_JOB (default: the current
# folder): code/ (render_scenes.py + dress/), up/pack_<game>.tgz (tools/render/pack.py output), models.map ("<game> <models.json>"
# lines, optional), out/<run>/<game>/ (stills, id masks, per-scene json), logs/<run>_<game>.log and logs/times.txt.
set -u
JOB=${DRESS_JOB:-$(pwd)}
BL=${BLENDER:-blender}
run=$1
game=$2
shift 2
cd "$JOB" || exit 1
mkdir -p "packs/$game" "out/$run" logs
[ -d "packs/$game/pack" ] || tar -xzf "up/pack_$game.tgz" -C "packs/$game"
models=""
[ -f models.map ] && models=$(awk -v g="$game" '$1==g{print $2}' models.map)
margs=()
[ -n "$models" ] && margs=(--models "$models")
T0=$(date +%s)
"$BL" -b --factory-startup --python code/render_scenes.py -- --pack "packs/$game/pack" --out "out/$run/$game" "${margs[@]}" "$@" > "logs/${run}_${game}.log" 2>&1
echo "$run $game exit $? $(( $(date +%s) - T0 )) s $(date -u +%FT%TZ)" >> logs/times.txt
