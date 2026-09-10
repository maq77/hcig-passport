@echo off
REM ---------------------------------------------------------------------------
REM  Make an image with Gemini.
REM
REM    image                          show what each model costs and the total
REM                                   spent so far
REM    image "a prompt" my-name       generate, saved to src\assets\my-name
REM
REM  Add --model lite for icons, --model pro when the image needs text in it.
REM  Add --ar 1:1 or --ar 4:3 to change the shape, --size 1K to spend less.
REM
REM  What must never be generated is in docs\ai-images-guide.md.
REM ---------------------------------------------------------------------------
cd /d "%~dp0.."
if "%~1"=="" (
  call node scripts/gemini.js cost
) else (
  call node scripts/gemini.js gen %*
)
echo.
pause
