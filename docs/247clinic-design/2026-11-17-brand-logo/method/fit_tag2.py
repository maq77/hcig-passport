import json,sys
from common import *
from scipy.optimize import minimize
c=CROP; R,G=c[...,0],c[...,1]
tT=np.clip((255-G)/(255-33),0,1)
x0,x1,y0,y1=1222,1600,748,783; ox,oy,w,h=x0-X0,y0-Y0,x1-x0,y1-y0
T=tT[oy:oy+h,ox:ox+w]
TXT='TRAVEL MEDICAL SERVICES'
letters=[ch for ch in TXT if ch!=' ']
# rough x starts from column profile
col=(T>0.35).sum(0)
runs=[];inrun=False
for i,v in enumerate(col):
    if v>0 and not inrun: s=i;inrun=True
    if v==0 and inrun: runs.append((s,i));inrun=False
print(len(runs),len(letters))
out={}
for font in sys.argv[1:]:
    capH=FONTS[font]['OS/2'].sCapHeight if hasattr(FONTS[font]['OS/2'],'sCapHeight') else 1400
    sy=19.5/capH; ty=775.0-Y0
    # initial per-letter from even split of total width by advance proportion
    cm=FONTS[font].getBestCmap(); hm=FONTS[font]['hmtx']
    adv=[hm[cm[ord(ch)]][0] for ch in TXT]
    tot=sum(adv); L=(1591-1229)
    k=L/tot
    xs=[];x=1229-X0
    for ch,a in zip(TXT,adv):
        if ch!=' ':
            cs,_=glyph_contours(font,ch); mn=np.vstack(cs).min(0)[0]
            xs.append([x-mn*sy*0.85, sy*0.85])
        x+=a*k
    def polys_all(ty,sy,xs):
        P=[]
        for ch,(tx,sx) in zip(letters,xs): P+=place(glyph_contours(font,ch)[0],tx,ty,sx,sy)
        return P
    def L_all(ty,sy,xs): return float(((render([polys_all(ty,sy,xs)],w,h,ox,oy)-T)**2).sum())
    for it in range(4):
        for i,ch in enumerate(letters):
            def loss(v):
                xx=list(xs); xx[i]=list(v); 
                # local window loss
                return L_all(ty,sy,xx)
            r=minimize(loss,xs[i],method='Powell',options={'maxfev':300,'xtol':1e-3,'ftol':1e-6}); xs[i]=list(r.x)
        r=minimize(lambda v:L_all(v[0],v[1],xs),[ty,sy],method='Powell',options={'maxfev':300,'xtol':1e-5,'ftol':1e-7}); ty,sy=r.x
        P=render([polys_all(ty,sy,xs)],w,h,ox,oy)
        print(font,it,'IoU %.4f'%(np.minimum(P,T).sum()/np.maximum(P,T).sum()),'sy',sy,'mean sx/sy',np.mean([v[1] for v in xs])/sy,flush=True)
    out[font]={'ty':ty,'sy':sy,'xs':xs}
json.dump(out,open('tag_fit2.json','w'))
