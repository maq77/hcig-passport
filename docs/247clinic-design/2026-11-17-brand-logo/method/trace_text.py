import json,sys
from common import *
from trace import contours_from_alpha, flatten, to_path
from trace2 import trace2
c=CROP; R,G=c[...,0],c[...,1]
aR=np.clip((255-G)/(255-28),0,1)*(R>=150)
box=np.zeros_like(aR)
for x0,x1,y0,y1 in [(1155,1405,338,595),(1425,1575,430,642)]: box[y0-Y0:y1-Y0,x0-X0:x1-X0]=1
aR=aR*box
aK=np.clip(1-R/255,0,1)
redn=cv2.dilate(((R-G)>60).astype(np.uint8),np.ones((7,7),np.uint8))>0
yy,xx=np.mgrid[0:H,0:W]
zone=redn&(xx+X0<1170)&(yy+Y0>600)&(yy+Y0<760)
aK=np.where(zone,np.clip(1-R/205,0,1),aK)
# black text: CLINIC + slash; remove swoosh (reddish)
red=((R-G)>50)&(R>150)
aK=aK*(~red)
kb=np.zeros_like(aK)
kb[488-Y0:600-Y0,1375-X0:1450-X0]=1
kb[604-Y0:752-Y0,1100-X0:1722-X0]=1
aK=aK*kb
# C over swoosh: pixels mixing C and red: treat C edge by colour: alpha_black where red mix -> use 1-(G/Gred) ? keep simple
np.save('aK.npy',aK); np.save('aR.npy',aR)
kw=dict(err=float(sys.argv[1]),smooth=float(sys.argv[2]),line_tol=float(sys.argv[3]),run_len=float(sys.argv[4]),run_tol=float(sys.argv[5]))
res={}
for name,a in [('red',aR),('black',aK)]:
    cs=contours_from_alpha(a)
    cs=[p for p in cs if len(p)>40]
    curves=[trace2(p,**kw) for p in cs]
    pr=render([flatten(curves)])
    print(name,len(cs),'segs',sum(len(x) for x in curves),'IoU %.4f'%(np.minimum(pr,a).sum()/np.maximum(pr,a).sum()))
    res[name]=to_path(curves)
json.dump(res,open('text_trace.json','w'))
