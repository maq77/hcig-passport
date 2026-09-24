#!/usr/bin/env bash
# Hero carousel stills for 24/7 Clinic v3 (mood images, not real staff or rooms). Route A: agy generate_image.
AGY=$(command -v agy || echo "$LOCALAPPDATA/Microsoft/WinGet/Packages/Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe/agy.exe")
STYLE="Photorealistic editorial photograph, bright natural daylight, airy light palette, warm soft tones, shallow depth of field, premium hospitality look, wide 16:9 landscape, main subject on the right third with calm open space on the left third, no text, no logos, no watermarks."
gen() {
  local name="$1" scene="$2"
  local out
  out=$("$AGY" -p "Use generate_image once to create: ${scene} ${STYLE} Then reply with only the full absolute file path where the image was saved. Do not call any other tool." --sandbox --output-format text --print-timeout 4m </dev/null 2>&1 | tail -1 | tr -d '\r')
  if [ -f "$(cygpath -u "$out" 2>/dev/null)" ]; then cp "$(cygpath -u "$out")" "generated/hero-${name}.jpg"; echo "OK ${name} ${out}"; else echo "FAIL ${name} ${out}"; fi
}
gen "resort" "A friendly doctor in a white coat carrying a medical bag walks along a sunlit luxury resort pool terrace by the Red Sea, palm trees and turquoise water behind."
gen "message" "A relaxed holiday guest on a white sun lounger at a bright Red Sea beach resort types a message on her smartphone, turquoise sea and white parasols behind, the phone screen not readable."
gen "family" "A caring doctor gently checks a young child's temperature in a bright hotel room with a sea view window, the parent sitting beside the child on the bed, calm and reassuring."
echo DONE
