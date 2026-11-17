import numpy as np
from scipy.ndimage import gaussian_filter1d
from trace import resample, find_corners, fit_cubic, unit, smooth_segment, bez

def fit_line(pts):
    c=pts.mean(0); u,s,vt=np.linalg.svd(pts-c); d=vt[0]
    return c,d
def snap(c,d,deg):
    ang=np.degrees(np.arctan2(d[1],d[0]))%180
    if min(ang,180-ang)<deg: return c,np.array([1.0,0.0])
    if abs(ang-90)<deg: return c,np.array([0.0,1.0])
    return c,d
def intersect(l1,l2):
    (c1,d1),(c2,d2)=l1,l2
    A=np.array([d1,-d2]).T
    if abs(np.linalg.det(A))<1e-6: return None
    t=np.linalg.solve(A,c2-c1); return c1+t[0]*d1
def proj(l,p):
    c,d=l; return c+((p-c)@d)*d

def trace2(p, err=0.4, step=0.2, smooth=1.0, corner_deg=35, span=1.5, corner_sep=1.6, line_tol=0.35, snap_deg=1.5, min_line=3.0, run_len=0, run_tol=0.3):
    q,st=resample(p,step)
    cs,turn=find_corners(q,st,span=span,thr_deg=corner_deg,min_sep=corner_sep)
    n=len(q)
    if len(cs)<2:
        from trace import trace_contour
        return trace_contour(p,err=err,smooth=smooth,corner_deg=180)
    segs=[]
    for j in range(len(cs)):
        a=cs[j]; b=cs[(j+1)%len(cs)]
        idx=[(a+i)%n for i in range(((b-a)%n or n)+1)]
        segs.append(q[idx])
    info=[]
    for seg in segs:
        L=np.hypot(*(seg[-1]-seg[0])); m=len(seg)
        k=max(1,int(m*0.15)); inner=seg[k:m-k] if m-2*k>=3 else seg
        c,d=fit_line(inner)
        nrm=np.array([-d[1],d[0]])
        dev=np.abs((inner-c)@nrm).max()
        if dev<line_tol and L>=min_line*0 :
            c,d=snap(c,d,snap_deg)
            info.append(('L',(c,d)))
        else:
            info.append(('C',None))
    # corner points
    K=len(segs); P=[]
    for j in range(K):
        prev=info[j-1]; cur=info[j]
        corner=segs[j][0]
        if prev[0]=='L' and cur[0]=='L':
            x=intersect(prev[1],cur[1])
            if x is not None and np.hypot(*(x-corner))<3: corner=x
        elif prev[0]=='L': corner=proj(prev[1],corner)
        elif cur[0]=='L': corner=proj(cur[1],corner)
        P.append(corner)
    out=[]
    for j in range(K):
        a=P[j]; b=P[(j+1)%K]
        if info[j][0]=='L':
            out.append(np.array([a,a+(b-a)/3,a+2*(b-a)/3,b]))
        else:
            seg=segs[j].copy(); seg=smooth_segment(seg,smooth/st)
            seg[0]=a; seg[-1]=b
            m=len(seg); k=min(max(2,int(1.2/st)),m//3) if m>6 else 1
            # tangent: if neighbour is a line, use its direction to keep G1 where the turn is small
            t1=unit(seg[k]-seg[0]); t2=unit(seg[-1-k]-seg[-1])
            for side,nb in ((0,info[j-1]),(1,info[(j+1)%K])):
                if nb[0]=='L':
                    d=nb[1][1]
                    if side==0:
                        dd=d if d@t1>0 else -d
                        if np.degrees(np.arccos(np.clip(dd@t1,-1,1)))<20: t1=dd
                    else:
                        dd=d if d@t2>0 else -d
                        if np.degrees(np.arccos(np.clip(dd@t2,-1,1)))<20: t2=dd
            if run_len>0: out+=fit_curve_with_runs(seg,st,t1,t2,err,run_len,run_tol,snap_deg)
            else: out+=fit_cubic(seg,t1,t2,err)
    return out

def straight_runs(seg, st, min_len=10.0, tol=0.3):
    n=len(seg); w=max(int(min_len/st),5); runs=[]; i=0
    def dev(a,b):
        c,d=fit_line(seg[a:b]); nrm=np.array([-d[1],d[0]]); return np.abs((seg[a:b]-c)@nrm).max()
    while i+w<=n:
        if dev(i,i+w)<tol:
            j=i+w
            while j<n and dev(i,j+1)<tol: j+=1
            runs.append((i,j)); i=j
        else: i+=max(1,w//6)
    return runs

def fit_curve_with_runs(seg, st, t1, t2, err, min_len, tol, snap_deg):
    runs=straight_runs(seg,st,min_len,tol)
    # trim runs so curves between have room
    pieces=[]; last=0; curt=t1
    out=[]
    for (a,b) in runs:
        a=max(a,1); b=min(b,len(seg)-2)
        if b-a<3: continue
        c,d=fit_line(seg[a:b+1]); c,d=snap(c,d,snap_deg)
        pa=proj((c,d),seg[a]); pb=proj((c,d),seg[b])
        dd=unit(pb-pa)
        # curve from last to a
        pre=seg[last:a+1].copy(); pre[-1]=pa
        if len(pre)>=2:
            out+=fit_cubic(pre,curt,-dd,err)
        out.append(np.array([pa,pa+(pb-pa)/3,pa+2*(pb-pa)/3,pb]))
        seg=seg.copy(); seg[b]=pb
        last=b; curt=dd
    post=seg[last:]
    if len(post)>=2: out+=fit_cubic(post,curt,t2,err)
    return out
