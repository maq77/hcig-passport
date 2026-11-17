import cv2, numpy as np
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
FD=r'D:/Healthcare international group/247 material/'
FONTS={'B':TTFont(FD+'Calisto MT Bold.ttf'),'R':TTFont(FD+'Calisto MT Regular.ttf'),'TR':TTFont('C:/Windows/Fonts/times.ttf'),'TB':TTFont('C:/Windows/Fonts/timesbd.ttf'),'GR':TTFont('C:/Windows/Fonts/georgia.ttf'),'GB':TTFont('C:/Windows/Fonts/georgiab.ttf')}
X0,Y0,W,H=1031,203,700,675
IM=cv2.imread('../bg/full4.jpg')[:,:,::-1].astype(float)
CROP=IM[Y0:Y0+H,X0:X0+W]

class FlatPen(BasePen):
    def __init__(s,gs): super().__init__(gs); s.contours=[]; s.cur=None
    def _moveTo(s,p): s.cur=[p]; s.contours.append(s.cur)
    def _lineTo(s,p): s.cur.append(p)
    def _curveToOne(s,p1,p2,p3):
        p0=s.cur[-1]
        for t in np.linspace(0,1,10)[1:]:
            u=1-t; s.cur.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    def _qCurveToOne(s,p1,p2):
        p0=s.cur[-1]
        for t in np.linspace(0,1,8)[1:]:
            u=1-t; s.cur.append((u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0],u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]))
    def _closePath(s): pass

_cache={}
def glyph_contours(font,ch):
    k=(font,ch)
    if k not in _cache:
        f=FONTS[font]; gs=f.getGlyphSet(); gn=f.getBestCmap()[ord(ch)]
        p=FlatPen(gs); gs[gn].draw(p)
        _cache[k]=([np.array(c,float) for c in p.contours], gs[gn].width)
    return _cache[k]

def place(cs,tx,ty,sx,sy,sk=0.0):
    # font units -> crop pixel coords; sk = horizontal shear (x += sk*y_font*sy)
    return [np.stack([tx+sx*c[:,0]+sk*sy*c[:,1], ty-sy*c[:,1]],1) for c in cs]

SS=4
def render(polys_list, w=W, h=H, ox=0, oy=0):
    """polys in crop coords; render coverage over window [ox,ox+w)x[oy,oy+h)"""
    m=np.zeros((h*SS,w*SS),np.uint8)
    pts=[]
    for polys in polys_list:
        for p in polys:
            q=(((p-[ox,oy])*SS-0.5)*16).round().astype(np.int32)  # shift=4, area convention
            pts.append(q)
    if pts: cv2.fillPoly(m,pts,255,lineType=cv2.LINE_8,shift=4)
    return cv2.resize(m.astype(np.float32)/255,(w,h),interpolation=cv2.INTER_AREA)
