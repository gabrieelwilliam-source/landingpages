#!/bin/sh
set -eu
blender -b --python-exit-code 1 --python tools/build_character.py
CHARACTER_ONLY=true node tools/optimize-assets.mjs
for actor in 0 1 2 3 4 5 6 7; do
  blender -b --python-exit-code 1 --python tools/build_character.py -- --npc "$actor"
done
CAST_ONLY=true node tools/optimize-assets.mjs
node tools/build-character-lods.mjs
node tools/verify-assets.mjs
