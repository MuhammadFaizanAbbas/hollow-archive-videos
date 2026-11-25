#!/bin/bash
# Turn a faceless-shorts Tall Tale 3D project into a 16:9 (1920x1080) project. Run once, right after new_video.sh.
#   bash compile/landscape.sh ~/faceless-shorts/<slug>
set -e
P="$1"; cd "$P"
sed -i 's/export const W = 1080, H = 1920/export const W = 1920, H = 1080/' src/core/lib.js src/core/engine.js
sed -i 's/Math.round(1080 \* RES); GL.height = Math.round(1920 \* RES)/Math.round(1920 * RES); GL.height = Math.round(1080 * RES)/' src/main.js
sed -i 's/width="1080" height="1920"/width="1920" height="1080"/g' index.html
sed -i 's/--window-size=1080,1920/--window-size=1920,1080/' tools/capture.mjs
sed -i "s/captionText(text, x = 540/captionText(text, x = 960/; s/captionText(c.text, 540, CAP.y/captionText(c.text, 960, CAP.y/" src/core/captions.js
sed -i 's/export const CAP = { y: 1340, size: 88, maxW: 960 }/export const CAP = { y: 900, size: 84, maxW: 1500 }/' src/core/captions.js
grep -q 'W = 1920, H = 1080' src/core/lib.js && grep -q 'W = 1920, H = 1080' src/core/engine.js && grep -q '1920,1080' tools/capture.mjs && echo "landscape OK: $P"
sed -i "s/ctx.drawImage(GL, 0, 0, 1080, 1920)/ctx.drawImage(GL, 0, 0, 1920, 1080)/" src/sheet.js 2>/dev/null || true
