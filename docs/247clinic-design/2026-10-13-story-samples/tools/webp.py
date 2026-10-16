import sys, os
from PIL import Image
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for n in sys.argv[1:]:
    src = os.path.join(here, 'img', n + '.jpg')
    if not os.path.exists(src): print('missing', n); continue
    im = Image.open(src).convert('RGB')
    if im.width > 1376: im = im.resize((1376, round(im.height * 1376 / im.width)), Image.LANCZOS)
    out = os.path.join(here, 'web', n + '.webp'); im.save(out, 'WEBP', quality=80, method=6)
    print(n, im.size, os.path.getsize(out))
