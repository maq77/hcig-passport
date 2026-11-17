import numpy as np, cv2
from scipy.ndimage import gaussian_filter1d

def contours_from_alpha(alpha, up=8, thr=0.5, pre_sigma=0.0):
    a=alpha.astype(np.float32)
    if pre_sigma>0: a=cv2.GaussianBlur(a,(0,0),pre_sigma)
    A=cv2.resize(a,None,fx=up,fy=up,interpolation=cv2.INTER_CUBIC)
    A=cv2.GaussianBlur(A,(0,0),up*0.35)
    b=(A>=thr).astype(np.uint8)
    cs,hier=cv2.findContours(b,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    out=[]
    for c in cs:
        p=c[:,0,:].astype(float)
        if len(p)<up*4: continue
        out.append((p+0.5)/up)
    return out

def resample(p, step=0.25):
    q=np.vstack([p,p[:1]])
    d=np.r_[0,np.cumsum(np.hypot(*np.diff(q,axis=0).T))]
    L=d[-1]; n=max(int(L/step),8)
    s=np.linspace(0,L,n,endpoint=False)
    return np.stack([np.interp(s,d,q[:,0]),np.interp(s,d,q[:,1])],1), L/n

def turning(p, k):
    a=p-np.roll(p,k,0); b=np.roll(p,-k,0)-p
    ang=np.arctan2(a[:,0]*b[:,1]-a[:,1]*b[:,0], (a*b).sum(1))
    return np.abs(ang)

def find_corners(p, step, span=2.0, thr_deg=40, min_sep=3.0, forced=None):
    k=max(int(span/step),1)
    t=np.degrees(turning(p,k))
    n=len(p); cand=[]
    w=max(int(min_sep/step),1)
    for i in range(n):
        if t[i]<thr_deg: continue
        idx=[(i+j)%n for j in range(-w,w+1)]
        if t[i]>=t[idx].max(): cand.append(i)
    # dedupe
    cand=sorted(set(cand)); res=[]
    for i in cand:
        if res and (i-res[-1])<w: 
            if t[i]>t[res[-1]]: res[-1]=i
            continue
        res.append(i)
    if len(res)>1 and (res[0]+n-res[-1])<w:
        if t[res[0]]>=t[res[-1]]: res.pop()
        else: res.pop(0)
    if forced is not None:
        for f in forced:
            d=np.hypot(*(p-f).T); res.append(int(np.argmin(d)))
        res=sorted(set(res))
    return res, t

# ---------- Schneider bezier fitting ----------
def bez(ctrl,t):
    t=t[:,None]; u=1-t
    return u**3*ctrl[0]+3*u*u*t*ctrl[1]+3*u*t*t*ctrl[2]+t**3*ctrl[3]
def bez_d1(c,t):
    t=t[:,None]; u=1-t
    return 3*u*u*(c[1]-c[0])+6*u*t*(c[2]-c[1])+3*t*t*(c[3]-c[2])
def bez_d2(c,t):
    t=t[:,None]; u=1-t
    return 6*u*(c[2]-2*c[1]+c[0])+6*t*(c[3]-2*c[2]+c[1])
def chord_param(pts):
    d=np.r_[0,np.cumsum(np.hypot(*np.diff(pts,axis=0).T))]
    return d/d[-1] if d[-1]>0 else np.linspace(0,1,len(pts))
def gen_bez(pts,u,t1,t2):
    p0,p3=pts[0],pts[-1]
    A1=t1[None,:]*(3*(1-u)**2*u)[:,None]; A2=t2[None,:]*(3*(1-u)*u**2)[:,None]
    C=np.array([[ (A1*A1).sum(), (A1*A2).sum()],[ (A1*A2).sum(), (A2*A2).sum()]])
    tmp=pts-bez(np.array([p0,p0,p3,p3]),u)
    X=np.array([(A1*tmp).sum(),(A2*tmp).sum()])
    det=C[0,0]*C[1,1]-C[0,1]*C[1,0]
    seg=np.hypot(*(p3-p0))
    if abs(det)>1e-12:
        a1=(X[0]*C[1,1]-X[1]*C[0,1])/det; a2=(C[0,0]*X[1]-C[1,0]*X[0])/det
    else: a1=a2=seg/3
    eps=1e-6*seg
    if a1<eps or a2<eps: a1=a2=seg/3
    return np.array([p0,p0+t1*a1,p3+t2*a2,p3])
def reparam(c,pts,u):
    d=bez(c,u)-pts; d1=bez_d1(c,u); d2=bez_d2(c,u)
    num=(d*d1).sum(1); den=(d1*d1).sum(1)+(d*d2).sum(1)
    with np.errstate(all='ignore'): un=u-np.where(np.abs(den)>1e-12,num/den,0)
    return np.clip(un,0,1)
def max_err(c,pts,u):
    d=np.hypot(*(bez(c,u)-pts).T); i=int(np.argmax(d)); return d[i],i
def unit(v):
    n=np.hypot(*v); return v/n if n>0 else v
def fit_cubic(pts,t1,t2,err):
    if len(pts)==2:
        dist=np.hypot(*(pts[1]-pts[0]))/3
        return [np.array([pts[0],pts[0]+t1*dist,pts[1]+t2*dist,pts[1]])]
    u=chord_param(pts); c=gen_bez(pts,u,t1,t2); e,i=max_err(c,pts,u)
    if e<err: return [c]
    if e<err*4:
        for _ in range(20):
            u=reparam(c,pts,u); c=gen_bez(pts,u,t1,t2); e,i=max_err(c,pts,u)
            if e<err: return [c]
    i=min(max(i,1),len(pts)-2)
    tc=unit(pts[i-1]-pts[i+1])
    return fit_cubic(pts[:i+1],t1,tc,err)+fit_cubic(pts[i:],-tc,t2,err)

def fit_open(pts,err):
    k=min(4,len(pts)-1)
    t1=unit(pts[k]-pts[0]); t2=unit(pts[-1-k]-pts[-1])
    return fit_cubic(pts,t1,t2,err)

def smooth_segment(seg,sigma_pts):
    if len(seg)<5 or sigma_pts<=0: return seg
    s=gaussian_filter1d(seg,sigma_pts,axis=0,mode='nearest')
    # pin endpoints and blend near them
    n=len(seg); w=np.clip(np.minimum(np.arange(n),np.arange(n)[::-1])/(3*sigma_pts),0,1)[:,None]
    s=w*s+(1-w)*seg; s[0]=seg[0]; s[-1]=seg[-1]
    return s

def is_line(seg,tol):
    p0,p1=seg[0],seg[-1]; d=p1-p0; L=np.hypot(*d)
    if L<1e-6: return True
    n=np.array([-d[1],d[0]])/L
    return np.abs((seg-p0)@n).max()<tol

def trace_contour(p, err=0.35, step=0.25, smooth=0.8, corner_deg=40, span=2.0, line_tol=0.0, forced=None, corner_sep=3.0):
    q,st=resample(p,step)
    cs,_=find_corners(q,st,span=span,thr_deg=corner_deg,min_sep=corner_sep,forced=forced)
    n=len(q); segs=[]
    if not cs:
        # closed smooth: split at two far points
        s=gaussian_filter1d(q,smooth/st,axis=0,mode='wrap')
        i0=0; i1=n//2
        a=np.vstack([s[i0:i1+1]]); b=np.vstack([s[i1:],s[:1]])
        t=unit(s[1]-s[-1]); t1=unit(s[i1+1]-s[i1-1])
        return fit_cubic(a,t,-t1,err)+fit_cubic(b,t1,-t,err)
    out=[]
    for j in range(len(cs)):
        a=cs[j]; b=cs[(j+1)%len(cs)]
        idx=[(a+i)%n for i in range(((b-a)%n or n)+1)]
        seg=q[idx]
        seg=smooth_segment(seg,smooth/st)
        if line_tol>0 and is_line(seg,line_tol):
            out.append(np.array([seg[0],seg[0]+(seg[-1]-seg[0])/3,seg[0]+2*(seg[-1]-seg[0])/3,seg[-1]]))
        else:
            out+=fit_open(seg,err)
    return out

def to_path(curves_list, prec=2):
    f=lambda v: ('%.*f'%(prec,v)).rstrip('0').rstrip('.') if '.' in '%.*f'%(prec,v) else '%.*f'%(prec,v)
    parts=[]
    for curves in curves_list:
        c0=curves[0][0]; parts.append('M%s %s'%(f(c0[0]),f(c0[1])))
        for c in curves:
            parts.append('C%s %s %s %s %s %s'%(f(c[1][0]),f(c[1][1]),f(c[2][0]),f(c[2][1]),f(c[3][0]),f(c[3][1])))
        parts.append('Z')
    return ''.join(parts)

def flatten(curves_list, n=12):
    polys=[]
    for curves in curves_list:
        pts=[bez(c,np.linspace(0,1,n,endpoint=False)) for c in curves]
        polys.append(np.vstack(pts))
    return polys
