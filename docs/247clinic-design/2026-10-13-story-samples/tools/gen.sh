#!/bin/bash
# usage: gen.sh NAME "PROMPT"   (retries when the image tool is missing or nothing comes back)
ST="C:/Users/maqmo/AppData/Local/Temp/claude/D--Healthcare-international-group/2097dba6-3823-4e98-8b9a-765bfec34b0c/scratchpad/story"
AGY="/c/Users/maqmo/AppData/Local/Microsoft/WinGet/Packages/Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe/agy"
STYLE="Photorealistic cinematic film still, wide 16:9 landscape frame, shot on ARRI Alexa with anamorphic lens, shallow depth of field, natural film grain, rich luxurious color grade, five-star hotel campaign quality. Absolutely no text, no letters, no logos, no watermarks anywhere."
[ -f "$ST/img/$1.jpg" ] && { echo "SKIP $1"; exit 0; }
for try in 1 2; do
  out=$("$AGY" --agent image-generator -p "Use the generate_image tool once to create this image: $2 $STYLE Then reply with only the full absolute file path where the image was saved. Do not call any other tool." --sandbox --output-format text --print-timeout 9m </dev/null 2>"$ST/log/$1.err")
  echo "$out" > "$ST/log/$1.out"
  p=$(echo "$out" | grep -iE '\.(jpg|jpeg|png|webp)\s*$' | tail -1 | tr -d '\r' | sed 's/^[^A-Za-z]*//')
  if [ -n "$p" ] && [ -f "$(cygpath -u "$p")" ]; then cp "$(cygpath -u "$p")" "$ST/img/$1.jpg" && echo "OK $1 (try $try)"; exit 0; fi
  if echo "$out" | grep -qi "policy\|sensitive"; then echo "BLOCKED $1"; exit 1; fi
  sleep 5
done
echo "FAIL $1"
