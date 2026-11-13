#!/bin/bash
# Eye-catching 16:9 thumbnail (1280x720 JPG) for long videos, same look as the Shorts thumbnails.
#   bash compile/thumb_long.sh frame.jpg "LINE ONE" "LINE TWO" out.jpg ["STICKER"]   (default TRUE STORY)
# The yellow banner covers the bottom-centre caption zone (y 450-700): pick a frame whose faces / key object sit in
# the top 60%. Lines of 14 characters or fewer read best.
set -e
STICK="${5:-TRUE STORY}"
D="$(cd "$(dirname "$0")" && pwd)"; F="$D/assets/Inter-Black.otf"; T=$(mktemp -d)
convert "$1" -resize 1280x720^ -gravity center -extent 1280x720 -modulate 103,135 -sigmoidal-contrast 3x50% "$T/bg.png"
line() { local ps; ps=$(convert -size 860x135 -font "$F" caption:"$1" -format '%[caption:pointsize]' info:)
  ps=$(python3 -c "print(min(150, int(float('$ps') * 0.97)))")
  convert -background none -size 880x150 -gravity center -font "$F" -pointsize "$ps" -fill '#1F1C33' -stroke '#1F1C33' -strokewidth "$4" label:"$1" "$3.o.png"
  convert -background none -size 880x150 -gravity center -font "$F" -pointsize "$ps" -fill "$2" label:"$1" "$3.f.png"
  convert "$3.o.png" "$3.f.png" -composite "$3"; }
line "$2" '#1F1C33' "$T/l1.png" 0; line "$3" '#E63946' "$T/l2.png" 9
convert -size 920x320 xc:none -fill "#1F1C33" -draw "roundrectangle 0,0 919,319 30,30" -fill "#FFD54A" -draw "roundrectangle 10,10 909,309 22,22" \
  "$T/l1.png" -gravity north -geometry +0+8 -composite "$T/l2.png" -gravity north -geometry +0+158 -composite -background none -rotate -3 "$T/banner.png"
convert "$T/banner.png" \( +clone -background black -shadow 60x12+0+14 \) +swap -background none -layers merge +repage "$T/banner_s.png"
convert -background none -font "$F" -pointsize 46 -fill white label:"$STICK" "$T/st_t.png"
SW=$(( $(identify -format %w "$T/st_t.png") + 55 ))
convert -size ${SW}x86 xc:none -fill '#1F1C33' -draw "roundrectangle 0,0 $((SW-1)),85 20,20" -fill '#E63946' -draw "roundrectangle 8,8 $((SW-9)),77 14,14" \
  "$T/st_t.png" -gravity center -composite -background none -rotate 5 "$T/sticker.png"
convert "$T/bg.png" "$T/banner_s.png" -gravity south -geometry -60+10 -composite "$T/sticker.png" -gravity northwest -geometry +24+22 -composite \
  \( "$D/assets/logo.png" -resize 150x150 \) -gravity southeast -geometry +22+22 -composite -quality 90 "$4"
rm -rf "$T"; echo "$4"
