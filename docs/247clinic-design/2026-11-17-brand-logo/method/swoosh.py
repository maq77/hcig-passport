from common import *
c=CROP; R,G,B=c[...,0],c[...,1],c[...,2]
aG=np.clip((255-G)/(255-28),0,1)
nonwhite=(c.min(2)<200).astype(np.uint8)
n,lab,st,cen=cv2.connectedComponentsWithStats(nonwhite,8)
big=np.argmax(st[1:,4])+1
comp=cv2.dilate((lab==big).astype(np.uint8),np.ones((5,5),np.uint8))>0
aS=aG*comp
# C region removal
yy,xx=np.mgrid[0:H,0:W]
Creg=(xx>=1100-X0)&(xx<1240-X0)&(yy>=605-Y0)&(yy<750-Y0)
Cpix=Creg&(R<150)
aS[Cpix]=0
# right edge (subpixel) per row in band rows
def right_edge(y):
    row=aS[y-Y0]; xs=np.arange(1040-X0,1260-X0)
    v=row[xs]
    # find swoosh run starting at first >0.5
    on=np.where(v>0.5)[0]
    if len(on)==0: return None
    i=on[0]
    while i+1<len(v) and v[i+1]>0.5: i+=1
    if i+1>=len(v): return None
    a,b=v[i],v[i+1]; t=(a-0.5)/(a-b) if a!=b else 0
    return xs[i]+0.5+t, xs[on[0]]
pts=[]
for y in list(range(560,652))+list(range(746,800)):
    r=right_edge(y)
    if r: pts.append((y+0.5-Y0,r[0]))
pts=np.array(pts)
co=np.polyfit(pts[:,0],pts[:,1],3)
res=pts[:,1]-np.polyval(co,pts[:,0]); print('edge fit resid max %.2f rms %.2f'%(abs(res).max(),res.std()))
# fill under C
for y in range(636,752):
    xr=np.polyval(co,y-Y0+0.5)
    yi=y-Y0
    # left edge stays as observed; right part: replace by interpolated edge
    xl=np.where(aS[yi,1040-X0:1200-X0]>0.5)[0]
    if len(xl)==0: continue
    xl=xl[0]+1040-X0
    for x in range(xl+2,1245-X0):
        cov=float(np.clip(xr-x,0,1))
        aS[yi,x]=cov
np.save('aS.npy',aS)
cv2.imwrite('aS.png',(aS*255).astype(np.uint8))
cv2.imwrite('aS_zoom.png',cv2.resize((aS[560-Y0:800-Y0,1040-X0:1260-X0]*255).astype(np.uint8),None,fx=3,fy=3,interpolation=cv2.INTER_NEAREST))
