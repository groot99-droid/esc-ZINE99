# Behind the Peephole: a request to change `docs/COLLECTION.md`

Phase 3 (accepted 2026-11-15) adds a fifth lock to Lockwork: **the lever lock**, on the watcher's own
office door, night seven. `DEEP_DIVE.md` section 5 says `docs/COLLECTION.md` must name it first. This
file asks for that change; nothing in `docs/` was edited, and the lever lock is not built until the
author approves it.

## The line to change

`docs/COLLECTION.md`, line 69 (the table of 1D games):

```
| Behind the Peephole | Lockwork | Lock picking | The only lock game in the collection: pin tumblers, wafer locks, a safe dial |
```

to:

```
| Behind the Peephole | Lockwork | Lock picking | The only lock game in the collection: pin tumblers, wafer locks, a safe dial, a lever lock |
```

## Why

- The lever lock is the last lock of the game and the one set-piece where the lock is worked **from
  the wrong side**: at 02:00 on night seven Abel Fenn turns a key in the watcher's door from outside,
  and the watcher lifts two levers to the gate while the bolt is thrown (`DEEP_DIVE.md` section 3,
  "Lockwork"). The keyhole sits twenty centimetres under the rose; while the rose is dark someone is
  looking in, so the player works only while it is lit.
- It is still lock picking, the family COLLECTION already gives this game, and no other game in the
  collection has a lock game, so it takes nothing from another game. It only names a fourth kind of
  lock beside the three listed.
- The plate is already drawn by code (`art/maps/lock-lever.svg`).

## What waits on it

- The scene `n7_lever_lock` (1D, Lockwork, night seven) in `data/scenes.json`, `DESIGN.md` section 8
  (night seven) and section 11 (Lockwork), and its row in `storyboard_additions.md`.
- In the web build, Lockwork's stages stay the drawer, the stair door and lost property.

Nothing else in phase 3 depends on it: the knock at your own door is played through the eye (`n7_own_lens`).
