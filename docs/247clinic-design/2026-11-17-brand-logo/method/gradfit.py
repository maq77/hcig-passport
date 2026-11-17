from common import *
import json
res={}
for name in ['outer','inner']:
    a=np.load(f'a_{name}.npy')
    core=cv2.erode((a>0.99).astype(np.uint8),np.ones((5,5),np.uint8))>0
    # exclude C region (filled under C) and anything black text
    ys,xs=np.where(core)
    col=CROP[ys,xs]
    keep=~((xs+X0>1100)&(xs+X0<1240)&(ys+Y0>600)&(ys+Y0<750))
    ys,xs,col=ys[keep]+0.5,xs[keep]+0.5,col[keep]
    best=None
    for th in np.arange(-60,61,2):
        t=np.radians(th); dvec=np.array([np.sin(t),np.cos(t)])  # th=0 -> pure vertical (down)
        proj=xs*dvec[0]+ys*dvec[1]
        bins=np.linspace(proj.min(),proj.max(),80); idx=np.digitize(proj,bins)
        r=0
        for k in np.unique(idx):
            s=col[idx==k]; r+=((s-s.mean(0))**2).sum()
        if best is None or r<best[0]: best=(r,th)
    th=best[1]; t=np.radians(th); dvec=np.array([np.sin(t),np.cos(t)])
    proj=xs*dvec[0]+ys*dvec[1]
    print(name,'best angle',th,'rms',np.sqrt(best[0]/len(col)),'proj range',proj.min(),proj.max())
    # profile
    p0,p1=proj.min(),proj.max(); nb=40
    edges=np.linspace(p0,p1,nb+1); prof=[]
    for k in range(nb):
        s=(proj>=edges[k])&(proj<edges[k+1])
        if s.sum()>5: prof.append(((edges[k]+edges[k+1])/2,np.median(col[s],0)))
    for q,cc in prof[::2]: print('  %.1f'%q,'#%02X%02X%02X'%tuple(cc.astype(int)))
    res[name]={'angle':float(th),'p0':float(p0),'p1':float(p1),'prof':[[float(q),[float(v) for v in cc]] for q,cc in prof]}
json.dump(res,open('grad.json','w'))
