#!/usr/bin/env bash
# Generates v3 hero backgrounds with Nano Banana through agy (image-generator agent, gemini-3.8-flash-high).
AGY=$(command -v agy || echo "$LOCALAPPDATA/Microsoft/WinGet/Packages/Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe/agy.exe")
OUT="/d/Healthcare international group/hcig-v3/material/generated"
STYLE="Ultra high quality cinematic photograph, wide 16:9 landscape, luxury editorial mood, palette of deep black, white and turquoise #12C0C6 accents, soft natural light, generous calm empty area on the left third for headline text, no text, no logos, no watermark."
gen() {
  local name="$1" prompt="$2"
  local res
  res=$("$AGY" --agent image-generator --model gemini-3.8-flash-high -p "Use generate_image once to create: $prompt $STYLE Then reply with only the full absolute file path where the image was saved. Do not call any other tool." --sandbox --output-format text --print-timeout 5m </dev/null 2>&1 | tail -1 | tr -d '\r')
  local unix; unix=$(cygpath -u "$res" 2>/dev/null)
  if [ -f "$unix" ]; then cp "$unix" "$OUT/$name.jpg" && echo "OK $name"; else echo "FAIL $name: $res"; fi
}
gen red-sea-aerial "Aerial view of the Red Sea coast of Hurghada, Egypt at golden hour, turquoise lagoons, coral reefs and elegant low-rise luxury resorts along the shore, desert mountains in soft haze." &
gen earth-network "Planet Earth seen from orbit at night, Europe, the Mediterranean and Egypt with the Red Sea glowing with city lights, thin luminous turquoise arcs of light connecting European cities to the Red Sea coast of Egypt, deep space black." &
gen patient-lounge "An elegant private international patient lounge in a luxury medical centre, white marble floor, soft cream leather armchairs, warm indirect light, tall windows with a view of the Red Sea, a single turquoise floral arrangement, no people." &
wait
gen boardroom-sea "A premium boardroom at dusk with floor-to-ceiling windows overlooking the Red Sea, a long dark walnut table, two business people in tailored suits seen from behind, softly out of focus, no faces visible." &
gen medical-jet "A white private medical evacuation jet without any markings parked on a desert airport apron at dawn, Red Sea mountains behind, warm sunrise light, a stretcher ramp lowered, no people." &
gen resort-pool "A luxury beach resort infinity pool at blue hour on the Red Sea, palm silhouettes, calm turquoise water reflecting the evening sky, minimal and serene, no people." &
wait
gen marble-light "Abstract luxury texture, polished black marble with fine white veins, a soft rippling turquoise caustic light reflection from water moving across the surface, shallow depth of field." &
wait
ls -la "$OUT"
