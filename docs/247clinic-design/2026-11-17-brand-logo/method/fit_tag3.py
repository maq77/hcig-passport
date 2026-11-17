import json,sys
from common import *
from scipy.optimize import minimize
c=CROP; R,G=c[...,0],c[...,1]
tT=np.clip((255-G)/(255-33),0,1)
x0,x1,y0,y1=1222,1600,748,783; ox,oy,w,h=x0-X0,y0-Y0,x1-x0,y1-y0
T=tT[oy:oy+h,ox:ox+w]
TXT='TRAVEL MEDICAL SERVICES'; letters=[ch for ch in TXT if ch!=' ']
font='B'
f2=json.load(open('tag_fit2.json'))['B']
ty,sy=f2['ty'],f2['sy']; sx=np.mean([v[1] for v in f2['xs']])
# convert to left-side-bearing-independent: keep tx so glyph centre is preserved
txs=[]
for ch,(tx,sxi) in zip(letters,f2['xs']):
    cs,_=glyph_contours(font,ch); a=np.vstack(cs); cx=(a[:,0].min()+a[:,0].max())/2
    txs.append(tx+sxi*cx-sx*cx)
def polys_all(ty,sy,sx,txs):
    P=[]
    for ch,tx in zip(letters,txs): P+=place(glyph_contours(font,ch)[0],tx,ty,sx,sy)
    return P
def L(ty,sy,sx,txs): return float(((render([polys_all(ty,sy,sx,txs)],w,h,ox,oy)-T)**2).sum())
for it in range(3):
    for i in range(len(letters)):
        def loss(v):
            t=list(txs); t[i]=v[0]; return L(ty,sy,sx,t)
        r=minimize(loss,[txs[i]],method='Powell',options={'maxfev':200,'xtol':1e-3}); txs[i]=float(np.atleast_1d(r.x)[0])
    r=minimize(lambda v:L(v[0],v[1],v[2],txs),[ty,sy,sx],method='Powell',options={'maxfev':400,'xtol':1e-6,'ftol':1e-8}); ty,sy,sx=r.x
    P=render([polys_all(ty,sy,sx,txs)],w,h,ox,oy)
    print(it,'IoU %.4f'%(np.minimum(P,T).sum()/np.maximum(P,T).sum()),'sx/sy %.4f'%(sx/sy),'capheight px %.2f'%(sy*1408),flush=True)
json.dump({'font':'B','ty':ty,'sy':sy,'sx':sx,'txs':txs},open('tag_final.json','w'))
s=6
for part,(a,b) in enumerate([(1222,1420),(1400,1600)]):
    ref=cv2.resize(CROP[oy:oy+h,a-X0:b-X0].astype(np.uint8)[...,::-1],None,fx=s,fy=s,interpolation=cv2.INTER_CUBIC)
    for p in polys_all(ty,sy,sx,txs): cv2.polylines(ref,[(((p-[a-X0,oy])*s)*16).round().astype(np.int32)],True,(255,170,0),1,cv2.LINE_AA,4)
    cv2.imwrite(f'tagfin_{part}.png',ref)
