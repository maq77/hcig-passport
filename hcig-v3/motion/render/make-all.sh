#!/usr/bin/env bash
# Render and encode the HCIG group film. Frames: 60 fps x 3 subframes, blended with tmix for motion blur.
set -e
R="C:/Users/maqmo/AppData/Local/Temp/claude/D--Healthcare-international-group/1dda97a7-9b53-498c-91a0-4f342513676e/scratchpad/render"
OUT="D:/Healthcare international group/hcig-v3/material/motion-film"
mkdir -p "$OUT"; cd "$R"
node audio.mjs "$OUT/hcig-group-film.wav"
BLUR="tmix=frames=3:weights='1 1 1',select='not(mod(n\,3))',setpts=N/60/TB"
for V in "dark 1920 1080 16x9" "light 1920 1080 16x9" "dark 1080 1920 9x16"; do
  set -- $V; THEME=$1; W=$2; H=$3; TAG=$4
  F="frames-$THEME-$TAG"; rm -rf "$F"
  node render.mjs full "$THEME" "$W" "$H" "$F"
  BASE="$OUT/hcig-group-film-$TAG-$THEME"
  BG=$([ "$THEME" = dark ] && echo "0x07080A" || echo "0xFFFFFF")
  # 1 web: transparent WebM (VP9 with alpha), no sound, for the page
  ffmpeg -y -loglevel error -framerate 180 -i "$F/%05d.png" -vf "$BLUR,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -row-mt 1 -auto-alt-ref 0 "$BASE-alpha.webm"
  # 2 editors: ProRes 4444 with alpha and sound
  ffmpeg -y -loglevel error -framerate 180 -i "$F/%05d.png" -i "$OUT/hcig-group-film.wav" -vf "$BLUR" -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -c:a pcm_s16le -shortest "$BASE-alpha.mov"
  # 3 social and review: MP4 on the night or day background, with sound
  ffmpeg -y -loglevel error -f lavfi -i "color=c=$BG:s=${W}x${H}:r=60:d=30" -framerate 180 -i "$F/%05d.png" -i "$OUT/hcig-group-film.wav" -filter_complex "[1:v]$BLUR[fg];[0:v][fg]overlay=format=auto,format=yuv420p" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -movflags +faststart -shortest "$BASE.mp4"
  rm -rf "$F"
  echo "done $TAG $THEME"
done
ls -la "$OUT"
