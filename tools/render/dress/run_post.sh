#!/bin/bash
# run_post.sh <run> <game> [--tiling 1] [--keep-png] [--keep-ids]
# After run_remote.sh: describe every still of out/<run>/<game> in 8 parallel Blender processes (metrics/<run>/<game>/), then shrink
# the folder (jpg next to each still, png and id masks dropped unless kept). Same env as run_remote.sh.
set -u
JOB=${DRESS_JOB:-$(pwd)}
BL=${BLENDER:-blender}
run=$1
game=$2
shift 2
tiling=()
keep=()
for a in "$@"; do
  case "$a" in
    --tiling) tiling=(--tiling 1) ;;
    --keep-png) keep+=(--keep-png) ;;
    --keep-ids) keep+=(--keep-ids) ;;
  esac
done
cd "$JOB" || exit 1
mkdir -p "metrics/$run/$game"
for i in 0 1 2 3 4 5 6 7; do
  "$BL" -b --factory-startup --python code/dress/batch_describe.py -- "out/$run/$game" "metrics/$run/$game" --ref-root refs --shard "$i/8" "${tiling[@]}" > "logs/post_${run}_${game}_$i.log" 2>&1 &
done
wait
"$BL" -b --factory-startup --python code/dress/finalize_run.py -- "out/$run/$game" "${keep[@]}" > "logs/fin_${run}_${game}.log" 2>&1
echo "$run $game post done $(ls metrics/$run/$game | wc -l) metrics $(date -u +%FT%TZ)" >> logs/times.txt
