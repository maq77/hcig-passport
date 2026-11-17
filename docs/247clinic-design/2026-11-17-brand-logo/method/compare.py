import cv2,numpy as np,json,sys
g=json.load(open(sys.argv[1]+'/geom.json'))
ren=cv2.imread(sys.argv[2])
X=int(1031+g['OX']); Y=int(203+g['OY']); w,h=int(g['VW']),int(g['VH'])
pg=cv2.imread('../bg/full4.jpg')
ref=pg[Y:Y+h,X:X+w]
ren=cv2.resize(ren,(w,h),interpolation=cv2.INTER_AREA) if ren.shape[1]!=w else ren
def ink(im): return im[...,1]<128
a,b=ink(ref),ink(ren)
iou=(a&b).sum()/(a|b).sum()
print('binary IoU (G<128) %.4f'%iou)
# colour error on ink
m=a&b
de=np.abs(ref.astype(int)-ren.astype(int))[m].mean(0)
print('mean abs colour diff on shared ink (BGR)',de.round(1))
diff=np.zeros_like(ref); diff[a&~b]=(0,0,255); diff[b&~a]=(255,128,0); diff[a&b]=(200,200,200)
sbs=np.concatenate([ref,np.full((h,10,3),255,np.uint8),ren,np.full((h,10,3),255,np.uint8),diff],1)
cv2.imwrite(sys.argv[3]+'_sbs.png',sbs)
cv2.imwrite(sys.argv[3]+'_diff.png',diff)
absd=np.abs(ref.astype(int)-ren.astype(int)).sum(2)
cv2.imwrite(sys.argv[3]+'_absdiff.png',np.clip(255-absd,0,255).astype(np.uint8))
