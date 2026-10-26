#!/usr/bin/env bash
# Round-2 home images (owner's notes 2026-10-26): Nano Banana through agy route A, one prompt at a time.
# Every scene keeps one clean, flat surface where the real HC logo is placed afterwards (never an AI-drawn logo).
# Output: hcig-v6/material/media/generated/r2/<key>.jpg (material/ is gitignored) and a log per image.
set -u
AGY=$(command -v agy || echo "$LOCALAPPDATA/Microsoft/WinGet/Packages/Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe/agy.exe")
OUT="$(dirname "$0")/../material/media/generated/r2"
mkdir -p "$OUT"
STYLE="Photorealistic premium editorial photograph, landscape 16:9, natural light, calm and confident. Colour palette only: white, soft greys, dim gray #565759, black, with turquoise #12C0C6 as the single accent colour. No red crosses, no text, no letters, no logos, no watermarks, no signage."

gen() {
  local key="$1" prompt="$2"
  [ -s "$OUT/$key.jpg" ] && { echo "skip $key"; return; }
  echo "== $key $(date +%T)"
  local log="$OUT/$key.log"
  "$AGY" --agent image-generator -p "Use generate_image once to create: $prompt $STYLE Then reply with only the full absolute file path where the image was saved. Do not call any other tool." --sandbox --output-format text --print-timeout 5m </dev/null >"$log" 2>&1
  local win; win=$(grep -oE '[A-Za-z]:\\[^"]+\.(jpg|jpeg|png|webp)' "$log" | tail -1)
  if [ -n "$win" ] && [ -f "$(cygpath -u "$win")" ]; then cp "$(cygpath -u "$win")" "$OUT/$key.jpg" && echo "ok $key"; else echo "FAIL $key"; fi
}

gen cta "Aerial view at blue hour of the Red Sea coast near Hurghada: a luxury resort, a modern hospital building, a marina with a white cruise ship and a small airport, all joined by thin glowing turquoise light lines like a network, showing one connected healthcare system for travellers. The left half of the frame is calm dark sea and sky, kept empty for text."
gen maritime-hero "A large white luxury cruise ship at anchor in clear turquoise Red Sea water off the Egyptian coast at golden hour, seen from a high three-quarter angle; a small white medical tender boat with a turquoise stripe and a blank white hull panel runs alongside it. Mountains of the Eastern Desert on the horizon."
gen onboard-clinic "Inside the medical centre of a modern cruise ship: a bright white treatment room with round porthole windows showing the sea, dim gray cabinetry, a thin turquoise light line along the ceiling, a doctor in a white coat checking the blood pressure of a relaxed passenger. A blank frosted glass panel on the wall behind them."
gen ship-to-shore "At a Red Sea cruise terminal at sunset, a calm medical team in navy and white uniforms moves a patient on a stretcher from a cruise ship gangway to a modern white ambulance van with a turquoise stripe and a blank white side panel. Professional, reassuring, no blood."
gen svc-hospital "A modern hospital imaging suite with a white MRI scanner, warm wood floor, dim gray walls, a turquoise light line in the ceiling, a radiographer in white guiding a calm patient. A blank frosted glass wall panel in the foreground right."
gen svc-tourism "An international patient couple arrives at the lobby of a luxury Red Sea hotel and is welcomed by a medical travel coordinator in a dark suit holding a white tablet with a blank back; suitcases, marble floor, sea view through tall windows."
gen svc-urgent "A calm on-site clinic room inside a five-star beach resort: a doctor in a white coat dresses a minor wound on a tourist's forearm, white treatment chair, dim gray cabinets, turquoise accents, the sea seen through a large window. A blank white wall panel above the desk."
gen svc-wellness "A serene longevity and wellness suite by the sea: a white reclining lounge chair, folded white towels, a glass of water, green plants, soft morning light over the Red Sea through floor to ceiling glass, a blank frosted glass door panel."
gen svc-corporate "A corporate healthcare planning meeting in a glass boardroom overlooking a modern city skyline: two executives and a doctor review a health programme, a closed white laptop with a blank lid faces the camera on the table, glass of water, notebook."
gen svc-concierge "Elite medical concierge at the entrance of a five-star hotel at dusk: a coordinator in a dark suit opens the rear door of a black luxury car for a guest, holding a slim dim gray medical case with a blank flat front panel. Warm lights, polished stone."
gen svc-accreditation "A healthcare training workshop in a modern conference room: doctors and nurses in white coats and scrubs listen to a presenter beside a large screen that glows soft turquoise with no text on it. Professional, focused, daylight."
echo "done $(date +%T)"
