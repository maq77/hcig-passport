import json,re,sys,os
from common import *
from trace import contours_from_alpha, flatten, to_path, bez
from trace2 import trace2
OUT=sys.argv[1] if len(sys.argv)>1 else 'out'
os.makedirs(OUT,exist_ok=True)
sw=json.load(open('sw_trace.json')); tx=json.load(open('text_trace_final.json'))
grad=json.load(open('grad.json')); tag=json.load(open('tag_final.json'))
# ---- tagline paths from Calisto MT Bold
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
TXT='TRAVEL MEDICAL SERVICES'; letters=[ch for ch in TXT if ch!=' ']
f=FONTS[tag['font']]; gs=f.getGlyphSet(); cm=f.getBestCmap()
def path_nums(d): return [float(v) for v in re.findall(r'-?\d+\.?\d*(?:e-?\d+)?',d)]
# collect all geometry to find bbox
def parse_pts(d):
    return np.array(path_nums(d)).reshape(-1,2)
tag_d=[]
for ch,t in zip(letters,tag['txs']):
    pen=SVGPathPen(gs, ntos=lambda v: ('%.2f'%v).rstrip('0').rstrip('.'))
    tp=TransformPen(pen,(tag['sx'],0,0,-tag['sy'],t,tag['ty']))
    gs[cm[ord(ch)]].draw(tp); tag_d.append(pen.getCommands())
tag_path=''.join(tag_d)
from fillprev import parse
allpts=np.vstack([np.vstack(parse(sw[k])) for k in ('outer','inner')]+[np.vstack(parse(tx[k])) for k in ('red','black')])
mn=np.floor(allpts.min(0)-0.5); mx=np.ceil(allpts.max(0)+0.5)
OX,OY=mn; VW,VH=mx-mn
print('viewBox offset (crop)',OX,OY,'size',VW,VH,'page origin',OX+X0,OY+Y0)
def shift(d):
    # shift absolute path coordinates (M,C,L,Q,Z only, absolute)
    out=[];toks=re.findall(r'[A-Za-z]|-?\d+\.?\d*(?:e-?\d+)?',d); i=0; cmd=None; k=0
    res=[]
    for t in toks:
        if t.isalpha():
            cmd=t; k=0; res.append(t); continue
        v=float(t)
        if cmd in 'MCLQT': v=v-(OX if k%2==0 else OY)
        elif cmd=='H': v-=OX
        elif cmd=='V': v-=OY
        k+=1
        s=('%.2f'%v).rstrip('0').rstrip('.')
        if s=='-0': s='0'
        if res and not res[-1].isalpha() and not s.startswith('-'): res.append(' ')
        res.append(s)
    return ''.join(res)
def stops_for(name, simplify=1.5):
    g=grad[name]; prof=g['prof']; t=np.array([p[0] for p in prof]); c=np.array([p[1] for p in prof])
    p0,p1=g['p0'],g['p1']
    # extend ends
    u=(t-p0)/(p1-p0)
    # douglas-peucker on colour
    keep=[0,len(u)-1]
    def dp(a,b):
        if b<=a+1: return
        seg=u[a:b+1]; ca,cb=c[a],c[b]
        interp=ca+(cb-ca)*((seg-u[a])/(u[b]-u[a]))[:,None]
        e=np.abs(interp-c[a:b+1]).max(1); i=int(np.argmax(e))
        if e[i]>simplify: keep.append(a+i); dp(a,a+i); dp(a+i,b)
    dp(0,len(u)-1); keep=sorted(set(keep))
    th=np.radians(g['angle']); d=np.array([np.sin(th),np.cos(th)])
    # line through bbox centre region: anchor at origin projection
    P0=d*p0; P1=d*p1
    st=[]
    red=np.array([0xDD,0x1B,0x24])
    for i in keep:
        col=np.clip(np.round(c[i]),0,255).astype(int)
        if np.abs(col-red).max()<=4:
            st.append((float(u[i]),'#DD1B24')); break
        if col.max()<=3: col=np.array([0,0,0])
        st.append((float(u[i]),'#%02X%02X%02X'%tuple(col)))
    # drop duplicate leading blacks
    while len(st)>2 and st[0][1]=='#000000' and st[1][1]=='#000000': st.pop(0)
    return P0,P1,st
def grad_def(gid,name):
    P0,P1,st=stops_for(name)
    s='<linearGradient id="%s" gradientUnits="userSpaceOnUse" x1="%.2f" y1="%.2f" x2="%.2f" y2="%.2f">'%(gid,P0[0]-OX,P0[1]-OY,P1[0]-OX,P1[1]-OY)
    for o,col in st: s+='<stop offset="%.4f" stop-color="%s"/>'%(max(0,min(1,o)),col)
    return s+'</linearGradient>'
RED='#DD1B24'; BLACK='#000000'; TAGRED='#BF212F'; IVORY='#FCFFEA'
def svg(variant, tagline=True):
    W_,H_=VW,VH
    head='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %g %g" width="%g" height="%g" role="img" aria-label="24/7 Clinic%s">'%(W_,H_,W_,H_,' Travel Medical Services' if tagline else '')
    parts=[head,'<title>24/7 Clinic%s</title>'%(' - Travel Medical Services' if tagline else '')]
    if variant=='color':
        parts.append('<defs>'+grad_def('c247-swoosh-outer','outer')+grad_def('c247-swoosh-inner','inner')+'</defs>')
        fo,fi,fr,fk,ft='url(#c247-swoosh-outer)','url(#c247-swoosh-inner)',RED,BLACK,TAGRED
    else:
        fo=fi=fr=fk=ft=IVORY
    parts.append('<path fill="%s" d="%s"/>'%(fo,shift(sw['outer'])))
    parts.append('<path fill="%s" d="%s"/>'%(fi,shift(sw['inner'])))
    parts.append('<path fill="%s" d="%s"/>'%(fk,shift(tx['black'])))
    parts.append('<path fill="%s" d="%s"/>'%(fr,shift(tx['red'])))
    if tagline: parts.append('<path fill="%s" d="%s"/>'%(ft,shift(tag_path)))
    parts.append('</svg>')
    return ''.join(parts)
files={'247-logo.svg':svg('color',True),'247-mark.svg':svg('color',False),'247-logo-ivory.svg':svg('ivory',True),'247-mark-ivory.svg':svg('ivory',False)}
for k,v in files.items(): open(os.path.join(OUT,k),'w',encoding='utf-8').write(v); print(k,len(v))
json.dump({'OX':float(OX),'OY':float(OY),'VW':float(VW),'VH':float(VH)},open(os.path.join(OUT,'geom.json'),'w'))
