import sys, os, torch
from PIL import Image, ImageFilter
from transformers import pipeline
dev = 0 if torch.cuda.is_available() else -1
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Base-hf", device=dev)
for src in sys.argv[2:]:
    name = os.path.splitext(os.path.basename(src))[0]
    im = Image.open(src).convert("RGB")
    d = pipe(im)["depth"].convert("L").resize(im.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.6))
    out = os.path.join(sys.argv[1], name + "-depth.jpg"); d.save(out, quality=88); print("depth", out, d.size)
