#!/bin/bash
# Standard Short mix: narration over the owner's music bed (owner request 2026-11-18, use for ALL Shorts from now on).
# Usage: bash mix_short.sh narration.(mp3|wav) out.m4a [music_start_seconds=20]
V="$1"; OUT="$2"; S="${3:-20}"; M="$(dirname "$0")/owner_bed.m4a"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
ffmpeg -y -i "$V" -ss "$S" -t $(python3 -c "print($D+1.5)") -i "$M" -filter_complex "[0:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=300|300,apad=pad_dur=1.5,asplit=2[v][vsc];[1:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.55,afade=t=in:d=1.2,afade=t=out:st=$(python3 -c "print($D+0.3-1.5)"):d=1.8[m];[m][vsc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[md];[v][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[o]" -map "[o]" -t $(python3 -c "print($D+1.8)") -c:a aac -b:a 192k "$OUT"
