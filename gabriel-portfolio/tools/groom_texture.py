"""Deterministic original short curly-fibre texture, generated without images."""
import numpy as np, math

def curved_fibres(size=512,seed=77311):
 rng=np.random.default_rng(seed)
 grain=rng.uniform(.72,1.05,(size,size,1))
 rgb=np.array([.092,.066,.046],dtype=np.float32)[None,None,:]*grain
 def stroke(a,b,width,color,opacity):
  x0,y0=a;x1,y1=b;left=max(0,int(min(x0,x1)-width-1));right=min(size,int(max(x0,x1)+width+2));bottom=max(0,int(min(y0,y1)-width-1));top=min(size,int(max(y0,y1)+width+2))
  if left>=right or bottom>=top:return
  yy,xx=np.mgrid[bottom:top,left:right];dx=x1-x0;dy=y1-y0;t=np.clip(((xx-x0)*dx+(yy-y0)*dy)/(dx*dx+dy*dy+1e-9),0,1)
  distance=np.sqrt((xx-x0-t*dx)**2+(yy-y0-t*dy)**2)
  alpha=(np.clip(width+.55-distance,0,1)*opacity)[:,:,None]
  view=rgb[bottom:top,left:right];view[:]=view*(1-alpha)+color*alpha
 for hair in range(870):
  x=rng.uniform(-.04,1.04);start=rng.uniform(-.16,1.18);length=rng.uniform(.16,.70);amp=rng.uniform(.002,.010);freq=rng.uniform(4,15);phase=rng.uniform(0,math.tau);drift=rng.uniform(-.030,.030)
  grey=rng.random()<.21
  color=np.array([.31,.285,.25] if grey else [.038,.025,.016])*rng.uniform(.65,1.15)
  width=rng.uniform(.32,.75);opacity=rng.uniform(.35,.78)
  path=[((x+amp*math.sin(f*freq+phase)+drift*f)*size,(start+length*f)*size) for f in np.linspace(0,1,24)]
  for i,(a,b) in enumerate(zip(path,path[1:])):stroke(a,b,width*(.5+.5*math.sin(math.pi*(i+.5)/23)),color,opacity)
 return rgb
