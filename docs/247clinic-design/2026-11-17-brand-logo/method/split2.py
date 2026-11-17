from common import *
aS=np.load('aS.npy'); C=np.load('circ.npy'); co,ro=C[:2],C[2]
yy,xx=np.mgrid[0:H,0:W]+0.5
d=np.hypot(xx-co[0],yy-co[1])
PX,PY=xx+X0,yy+Y0
sector=(PX>1520)&(PX<1610)&(PY<330)
inner=np.where(sector,np.minimum(aS,np.clip(ro-d+0.5,0,1)),aS*(d<ro+2))*(PY<640)*(PX>1380)
outer=aS*(d>ro+1.5)*(PX<1600)
def largest(a):
    b=(a>0.5).astype(np.uint8); n,l,st,_=cv2.connectedComponentsWithStats(b,8); k=np.argmax(st[1:,4])+1
    return a*(cv2.dilate((l==k).astype(np.uint8),np.ones((3,3),np.uint8))>0)
inner=largest(inner); outer=largest(outer)
np.save('a_outer.npy',outer); np.save('a_inner.npy',inner)
