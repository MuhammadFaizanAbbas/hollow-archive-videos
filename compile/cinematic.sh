#!/bin/bash
# Upgrade a Tall Tale 3D project to the Hollow Archive cinematic look and sound. Run once, right after new_video.sh
# (and after compile/landscape.sh for long videos).   bash compile/cinematic.sh ~/faceless-shorts/<slug>
set -e
D="$(cd "$(dirname "$0")" && pwd)"; P="$1"; cd "$P"
cp "$D/cinematic/fx.js" src/core/fx.js
cp "$D/cinematic/mix_pro.py" tools/mix.py
grep -q "import \* as FX" src/main.js || sed -i "s#^import { buildShots } from './shots.js';#import { buildShots } from './shots.js';\nimport * as FX from './core/fx.js';#" src/main.js
grep -q "FX.post(sh" src/main.js || sed -i "s#  ctx.save(); sh.draw(lt, d, t, blit); ctx.restore();#  ctx.save(); sh.draw(lt, d, t, blit); ctx.restore();\n  FX.post(sh, lt, d, t);#" src/main.js
# sharp by default: depth-of-field blur only when a shot asks for it with dof:true (it blurred faces and objects)
sed -i 's#bokeh.enabled = (look.aperture ?? 0.0015) > 0;#bokeh.enabled = look.dof === true \&\& (look.aperture ?? 0) > 0; /* HA: sharp by default */#' src/core/engine.js
# caption-free frames for thumbnails: add &nocap=1 to QS when grabbing cover frames
grep -q 'nocap' src/main.js || sed -i 's/^  drawCaption(t);/  if (!location.search.includes("nocap")) drawCaption(t);/' src/main.js
grep -q "FX.post(sh" src/main.js && grep -q "HA: sharp" src/core/engine.js && grep -q "voice_chain" tools/mix.py && echo "cinematic OK: $P"
