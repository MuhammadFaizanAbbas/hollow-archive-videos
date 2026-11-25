#!/usr/bin/env bash
# Render a designed thumbnail page to a JPG.
#   bash compile/thumbkit/render.sh <project_dir> <page.html in that project> <out.jpg> short|long
# The page must live in the project root (it imports ./src/core/toon.js, ./fonts, ./vendor).
# Renders at 2x for crisp edges, then downsizes: short = 1080x1920, long = 1280x720.
set -e
P="$1"; PAGE="$2"; OUT="$3"; KIND="${4:-short}"
if [ "$KIND" = long ]; then WW=2560; HH=1440; FW=1280; FH=720; else WW=2160; HH=3840; FW=1080; FH=1920; fi
PORT=$((8800 + RANDOM % 100))
( cd "$P" && python3 -m http.server $PORT >/dev/null 2>&1 ) & SRV=$!
sleep 1
timeout 90 google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=$WW,$HH \
  --virtual-time-budget=9000 --screenshot=/tmp/thumb2x.png "http://127.0.0.1:$PORT/$(basename "$PAGE")?k=$KIND" >/dev/null 2>&1 || true
kill $SRV 2>/dev/null || true
convert /tmp/thumb2x.png -resize ${FW}x${FH}! -quality 93 "$OUT"
convert "$OUT" -resize $([ "$KIND" = long ] && echo 320x || echo 270x) "${OUT%.*}_small.jpg"
echo "thumbnail: $OUT (+ ${OUT%.*}_small.jpg for the phone-size check)"
