import json,sys
from common import *
from trace import *
C=np.load('circ.npy'); co,ro=C[:2],C[2]
def unitv(v): return v/np.hypot(*v)
def extend_cap(q, mask_idx, target):
    """replace run of points (mask_idx contiguous, cyclic) by extrapolating neighbours' edges"""
    n=len(q); idx=np.where(mask_idx)[0]
    # find run boundaries cyclically
    m=mask_idx.astype(int); starts=[i for i in range(n) if m[i] and not m[i-1]]; 
    assert len(starts)==1, starts
    s=starts[0]; e=s
    while m[(e+1)%n]: e=(e+1)%n
    a=(s-1)%n; b=(e+1)%n
    k=48
    ta=unitv(q[a]-q[(a-k)%n]); tb=unitv(q[b]-q[(b+k)%n])
    A=q[a]+ta*target(q[a],ta); B=q[b]+tb*target(q[b],tb)
    # rebuild contour: from b ... around ... to a, then A, B
    order=[(b+i)%n for i in range(((a-b)%n)+1)]
    return np.vstack([q[order],[A,B]])
def sharpen_tip(q, i, back=9.0, step=0.25, maxext=9.0):
    """at tip corner i, extrapolate both edges (fit over 'back' px) to their intersection"""
    n=len(q); k0=int(1.0/step); k1=int(back/step)
    e1=q[[(i-j)%n for j in range(k0,k1)]]; e2=q[[(i+j)%n for j in range(k0,k1)]]
    def line(e):
        c=e.mean(0); u,s,vt=np.linalg.svd(e-c); return c,vt[0]
    (c1,d1),(c2,d2)=line(e1),line(e2)
    A=np.array([d1,-d2]).T
    if abs(np.linalg.det(A))<1e-9: return q,i
    t=np.linalg.solve(A,c2-c1); X=c1+t[0]*d1
    if np.hypot(*(X-q[i]))>maxext: return q,i
    # replace points within k0..k? keep edges, put X at tip
    rm=set((i+j)%n for j in range(-k0,k0+1))
    keep=[j for j in range(n) if j not in rm]
    pos=keep.index(((i+k0+1)%n)) if ((i+k0+1)%n) in keep else 0
    newq=np.vstack([q[keep[:pos]],[X],q[keep[pos:]]])
    return newq,pos

def tail_rebuild(p):
    aS=np.load('aS.npy')
    def edges(x):
        col=aS[:340-Y0,x-X0]
        up=lo=None
        for i in range(1,len(col)):
            if col[i-1]<=0.5<col[i] and up is None: up=i-1+(0.5-col[i-1])/(col[i]-col[i-1])+0.5
            elif col[i-1]>0.5>=col[i] and up is not None and lo is None: lo=i-1+(col[i-1]-0.5)/(col[i-1]-col[i])+0.5; break
        return up,lo
    xs_u=[];yu=[];xs_l=[];yl=[]
    for x in range(1440,1587):
        u,l=edges(x)
        if u is not None: xs_u.append(x-X0+0.5); yu.append(u)
        if l is not None and x<=1546: xs_l.append(x-X0+0.5); yl.append(l)
    cu=np.polyfit(xs_u,yu,3); cl=np.polyfit(xs_l,yl,3)
    ru=np.array(yu)-np.polyval(cu,xs_u); rl=np.array(yl)-np.polyval(cl,xs_l)
    print('  tail edge fit rms',ru.std().round(3),rl.std().round(3))
    xa=1452-X0
    keep=~((p[:,0]>xa)&(p[:,1]<335-Y0))
    n=len(p); idx=np.where(~keep)[0]
    m=(~keep).astype(int); starts=[i for i in range(n) if m[i] and not m[i-1]]
    assert len(starts)==1
    s0=starts[0]; e=s0
    while m[(e+1)%n]: e=(e+1)%n
    before=p[(s0-1)%n]; after=p[(e+1)%n]
    xe_u=1593-X0; xe_l=1576-X0
    U=np.array([[x,np.polyval(cu,x)] for x in np.arange(xa,xe_u,0.25)])
    L=np.array([[x,np.polyval(cl,x)] for x in np.arange(xa,xe_l,0.25)])
    if before[1]<after[1]: ins=np.vstack([U,L[::-1]])
    else: ins=np.vstack([L,U[::-1]])
    order=[(e+1+i)%n for i in range(n-(e-s0+1 if e>=s0 else n-s0+e+1))]
    rest=p[order]
    return np.vstack([rest,ins])
out={}
for name in ['outer','inner']:
    a=np.load(f'a_{name}.npy')
    cs=[c for c in contours_from_alpha(a) if len(c)>200]
    assert len(cs)==1
    p,st=resample(cs[0],0.25)
    if name=='outer':
        p=tail_rebuild(p)
        p,_=resample(p,0.25)
    # tips: sharpen each once
    cs_,turn=find_corners(p,0.25,span=3.0,thr_deg=100,min_sep=6)
    tips=[i for i in cs_ if turn[i]>130 and not (name=='outer' and p[i,0]+X0>1520 and p[i,1]+Y0<330)]
    print(' tips',[(tuple((p[i]+[X0,Y0]).round(1)),round(float(turn[i]))) for i in tips])
    for i in sorted(tips,reverse=True):
        for bk in (9.0,16.0):
            p2,_=sharpen_tip(p,i,back=bk)
            if len(p2)!=len(p): break
        print('  sharpened',(p[i]+[X0,Y0]).round(1),len(p2)!=len(p))
        p=p2
    p,_=resample(p,0.25)
    curves=[trace_contour(p,err=0.45,smooth=2.5,corner_deg=55,span=3.0,corner_sep=6)]
    pr=render([flatten(curves)])
    vis=a.copy()
    print(name,len(curves[0]),'IoU %.4f'%(np.minimum(pr,a).sum()/np.maximum(pr,a).sum()))
    out[name]=to_path(curves)
json.dump(out,open('sw_trace.json','w'))
