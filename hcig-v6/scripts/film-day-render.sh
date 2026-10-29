#!/usr/bin/env bash
# Re-render the group film's day versions (the ones the site plays) and encode them for the site.
# Needs: hcig-v3 served on 127.0.0.1:8765 (python -m http.server 8765 --bind 127.0.0.1, from hcig-v3).
set -e
V6="D:/Healthcare international group/hcig-v6"; MF="D:/Healthcare international group/hcig-v3/material/motion-film"
TMP="D:/Healthcare international group/.playwright-mcp/film9"; VID="$V6/material/media/video"
BLUR="tmix=frames=3:weights='1 1 1',select='not(mod(n\,3))',setpts=N/60/TB"
for V in "1920 1080 16x9 film-full-day 1280:720 1280" "1080 1920 9x16 film-full-phone-day 720:1280 720"; do
  set -- $V; W=$1; H=$2; TAG=$3; NAME=$4; SC=$5; SZ=$6
  F="$TMP/full-$TAG"; rm -rf "$F"
  (cd "$V6" && node scripts/film-render.mjs full light "$W" "$H" "$F")
  M="$MF/hcig-group-film-$TAG-light.mp4"; [ -f "$M.8brands.mp4" ] || cp "$M" "$M.8brands.mp4"
  ffmpeg -y -loglevel error -f lavfi -i "color=c=0xFFFFFF:s=${W}x${H}:r=60:d=30" -framerate 180 -i "$F/%05d.png" -i "$MF/hcig-group-film.wav" -filter_complex "[1:v]$BLUR[fg];[0:v][fg]overlay=format=auto,format=yuv420p" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -movflags +faststart -shortest "$M"
  for e in mp4 webm; do [ -f "$VID/$NAME-$SZ.$e.8brands" ] || cp "$VID/$NAME-$SZ.$e" "$VID/$NAME-$SZ.$e.8brands"; done
  ffmpeg -y -loglevel error -i "$M" -vf "scale=$SC:flags=lanczos,fps=30" -c:v libx264 -profile:v high -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart "$VID/$NAME-$SZ.mp4"
  ffmpeg -y -loglevel error -i "$M" -vf "scale=$SC:flags=lanczos,fps=30" -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -c:a libopus -b:a 96k "$VID/$NAME-$SZ.webm"
  rm -rf "$F"; echo "done $TAG"
done
