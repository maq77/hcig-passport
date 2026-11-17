from common import *
aS=np.load('aS.npy')
b=(aS>0.5).astype(np.uint8)
cs,_=cv2.findContours(b,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
p=np.vstack([c[:,0,:] for c in cs]).astype(float)+0.5
sel=p[(p[:,0]>590)&(p[:,1]<420)]
c0=np.array([1556-X0,450.0-Y0])
def circfit(q):
    A=np.c_[2*q,np.ones(len(q))]; bb=(q**2).sum(1); s=np.linalg.lstsq(A,bb,rcond=None)[0]
    return s[:2],np.sqrt(s[2]+s[0]**2+s[1]**2)
for it in range(3):
    r=np.hypot(*(sel-c0).T)
    thr=np.median(r)
    outer=sel[r>thr]; inner=sel[r<=thr]
    co,ro=circfit(outer); ci,ri=circfit(inner); c0=(co+ci)/2
print('outer edge circle',co+[X0,Y0],ro,' inner edge circle',ci+[X0,Y0],ri)
np.save('circ.npy',np.r_[co,ro,ci,ri])
# visualize
v=cv2.cvtColor((aS*255).astype(np.uint8),cv2.COLOR_GRAY2BGR)
cv2.circle(v,tuple((co*16).astype(int)),int(ro*16),(0,0,255),1,cv2.LINE_AA,4)
cv2.circle(v,tuple((ci*16).astype(int)),int(ri*16),(255,0,0),1,cv2.LINE_AA,4)
cv2.imwrite('split_viz.png',v)
