#!/bin/bash
# Eye-catching Shorts thumbnail (1080x1920 JPG) from one video frame, in the channel's caption style.
#   bash compile/thumb_short.sh frame.jpg "LINE ONE" "LINE TWO" out.jpg ["STICKER"]   (default TRUE STORY)
# The yellow banner sits over the burned-in caption zone (y 1160-1560), so pick a frame whose face/key object is
# ABOVE y 1150. Keep each line at 13 characters or fewer.
set -e
STICK="${5:-TRUE STORY}"
D="$(cd "$(dirname "$0")" && pwd)"; F="$D/assets/Inter-Black.otf"; T=$(mktemp -d)
convert "$1" -resize 1080x1920^ -gravity center -extent 1080x1920 -modulate 103,135 -sigmoidal-contrast 3x50% "$T/bg.png"
# the banner: yellow card, thick ink border, two lines of heavy text (line two in red), tilted
line() { # $1 text, $2 fill, $3 out, $4 outline width (0 = none): auto-fitted into 960x175
  local ps; ps=$(convert -size 960x175 -font "$F" caption:"$1" -format '%[caption:pointsize]' info:)
  ps=$(python3 -c "print(min(170, int(float('$ps') * 0.97)))")
  convert -background none -size 1000x200 -gravity center -font "$F" -pointsize "$ps" -fill '#1F1C33' -stroke '#1F1C33' -strokewidth "$4" label:"$1" "$3.o.png"
  convert -background none -size 1000x200 -gravity center -font "$F" -pointsize "$ps" -fill "$2" label:"$1" "$3.f.png"
  convert "$3.o.png" "$3.f.png" -composite "$3"; }
line "$2" '#1F1C33' "$T/l1.png" 0; line "$3" '#E63946' "$T/l2.png" 12
convert -size 1040x430 xc:none -fill '#1F1C33' -draw "roundrectangle 0,0 1039,429 40,40" \
  -fill '#FFD54A' -draw "roundrectangle 14,14 1025,415 30,30" \
  "$T/l1.png" -gravity north -geometry +0+18 -composite "$T/l2.png" -gravity north -geometry +0+212 -composite \
  -background none -rotate -4 "$T/banner.png"
convert "$T/banner.png" \( +clone -background black -shadow 60x14+0+18 \) +swap -background none -layers merge +repage "$T/banner_s.png"
# the TRUE STORY sticker
convert -background none -font "$F" -pointsize 64 -fill white label:"$STICK" "$T/st_t.png"
SW=$(( $(identify -format %w "$T/st_t.png") + 76 ))
convert -size ${SW}x120 xc:none -fill '#1F1C33' -draw "roundrectangle 0,0 $((SW-1)),119 26,26" -fill '#E63946' -draw "roundrectangle 8,8 $((SW-9)),111 20,20" \
  "$T/st_t.png" -gravity center -composite -background none -rotate 6 "$T/sticker.png"
convert "$T/bg.png" "$T/banner_s.png" -gravity north -geometry +0+1120 -composite \
  "$T/sticker.png" -gravity northwest -geometry +36+70 -composite \
  \( "$D/assets/logo.png" -resize 190x190 \) -gravity southeast -geometry +36+60 -composite -quality 90 "$4"
rm -rf "$T"; echo "$4"
