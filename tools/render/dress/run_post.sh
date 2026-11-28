#!/bin/bash
# run_post.sh <run> <game> [--tiling 1] [--keep-png] [--keep-ids]
# After run_remote.sh: describe every still of out/<run>/<game> (metrics/<run>/<game>/), then shrink the folder (jpg next to each
# still, png and id masks dropped unless kept). Same env as run_remote.sh. With $PY set (a Python with numpy, e.g. Blender's bundled one),
# the describe is one Python process with 8 workers and no Blender (the jpg step stays one Blender) (P1: one Blender of ours at a time on a shared box);
# without it, 8 parallel Blender processes as before.
set -u
JOB=${DRESS_JOB:-$(pwd)}
BL=${BLENDER:-blender}
PY=${PY:-}
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
if [ -n "$PY" ]; then
  # the png files are dropped only after every still was described (a failed describe keeps them for a re-run)
  "$PY" code/dress/batch_describe.py "out/$run/$game" "metrics/$run/$game" --ref-root refs --jobs 8 "${tiling[@]}" > "logs/post_${run}_${game}.log" 2>&1 &&   "$BL" -b --factory-startup --python code/dress/finalize_run.py -- "out/$run/$game" "${keep[@]}" > "logs/fin_${run}_${game}.log" 2>&1
else
  for i in 0 1 2 3 4 5 6 7; do
    "$BL" -b --factory-startup --python code/dress/batch_describe.py -- "out/$run/$game" "metrics/$run/$game" --ref-root refs --shard "$i/8" "${tiling[@]}" > "logs/post_${run}_${game}_$i.log" 2>&1 &
  done
  wait
  "$BL" -b --factory-startup --python code/dress/finalize_run.py -- "out/$run/$game" "${keep[@]}" > "logs/fin_${run}_${game}.log" 2>&1
fi
echo "$run $game post done $(ls metrics/$run/$game | wc -l) metrics $(date -u +%FT%TZ)" >> logs/times.txt
