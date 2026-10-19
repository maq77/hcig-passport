#!/usr/bin/env bash
# Daytime twin of the Night Network hero (B), for the light theme. agy image-generator on gemini-3.8-flash-high.
AGY=$(command -v agy || echo "$LOCALAPPDATA/Microsoft/WinGet/Packages/Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe/agy.exe")
OUT="/d/Healthcare international group/hcig-v3/material/generated"
REF="D:\Healthcare international group\hcig-v3\material\generated\earth-network.jpg"
run() {
  local name="$1" prompt="$2" res unix
  res=$("$AGY" --agent image-generator --model gemini-3.8-flash-high --add-dir "D:\Healthcare international group\hcig-v3\material\generated" -p "$prompt Then reply with only the full absolute file path where the new image was saved. Do not call any other tool." --sandbox --output-format text --print-timeout 6m </dev/null 2>&1 | tail -1 | tr -d '\r')
  unix=$(cygpath -u "$res" 2>/dev/null)
  if [ -f "$unix" ]; then cp "$unix" "$OUT/$name.jpg" && echo "OK $name"; else echo "FAIL $name: $res"; fi
}
DAY="Planet Earth seen from orbit in bright daylight, the same view as the reference: the curve of the Earth across the frame, Europe, the Mediterranean, Egypt and the Red Sea lit by the sun, sunlit seas in clear turquoise and deep blue, soft white clouds, pale sand-coloured land, a thin glowing pale blue atmosphere, and above the horizon a soft high-key white and very pale turquoise sky instead of black space. Thin luminous turquoise #0A7F84 arcs connect European cities to the Red Sea coast of Egypt. Airy, light, luxury editorial mood, ultra high quality, wide 16:9, generous calm empty area on the left third for headline text, no text, no logos, no watermark."
run earth-day-edit "Use generate_image once, passing the image file $REF as the reference image to edit, to create: $DAY" &
run earth-day "Use generate_image once to create: $DAY" &
wait
