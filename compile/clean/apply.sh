#!/usr/bin/env bash
# Clean look for a Tall Tale project: skin/hair/stubble on characters, gentle post (no grain, light vignette, soft grades),
# cleaner captions, shot cross-dissolves (shot.dissolve = seconds), clean-look sets (src/core/world2.js) and overlay marks (src/core/fx2.js).
set -e
P="${1:?project dir}"; D="$(cd "$(dirname "$0")" && pwd)"
cp "$D/world2.js" "$P/src/core/world2.js"; cp "$D/fx2.js" "$P/src/core/fx2.js"
python3 "$D/patch.py" "$P"
grep -q "HA-CLEAN" "$P/src/core/toon.js" && grep -q "HA-CLEAN" "$P/src/main.js" && echo "clean OK"
