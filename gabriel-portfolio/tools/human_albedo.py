"""Original procedural textile/skin detail; no portrait or concept-art pixels."""
import bpy,math,random

def smooth(x):
 x=max(0,min(1,x));return x*x*(3-2*x)

def add_human_albedo(material):
 w,h=1024,512;rng=random.Random(99107);pixels=[]
 for y in range(h):
  for x in range(w):
   tile=x//256+(y//256)*4;u=(x%256)/255;v=(y%256)/255
   noise=rng.uniform(-1,1);value=1;rgb=(1,1,1)
   if tile in [1,2,6]:
    weave=math.sin(x*math.pi)*math.sin(y*math.pi)+math.sin(x*1.7+y*.17)*.3
    value=.90+noise*.027+weave*.035;rgb=(value,value,value)
   elif tile==4:
    phase=u+.014*math.sin(v*20+u*18)+.006*math.sin(v*65+u*50)
    fine=math.sin(phase*math.tau*96);clump=math.sin((u+.025*math.sin(v*16+u*9))*math.tau*9)
    value=.82+.10*clump+.08*fine+noise*.015
    silver=max(0,(math.sin(phase*math.tau*37)-.95)/.05)*.18
    rgb=tuple(value*(c*(1-silver)+.32*silver) for c in (.22,.15,.095))
   elif tile==7:
    # Undo the UV tile padding and reconstruct cylindrical facial coordinates.
    a=((u-.03)/.94-.5)*math.tau;z=1.50+(v-.03)/.94*.34
    xx=math.sin(a)*.115;front=max(0,math.cos(a));value=.98+noise*.017
    # Freckles/pores stay subtle; darker orbital creases and under-nose contact.
    orbital=math.exp(-((abs(xx)-.038)/.027)**2-((z-1.689)/.017)**2)*front**8
    nostril=math.exp(-((abs(xx)-.014)/.008)**2-((z-1.635)/.006)**2)*front**12
    line=1.64-.058*(1-smooth((abs(xx)-.025)/.07))
    stubble=smooth((line-z)/.012)*smooth((z-1.515)/.02)*front**2
    lip=math.exp(-((xx/.034)**4+((z-1.593)/.009)**4))*front**12
    beard=.23+noise*.045
    value*=1-orbital*.08-nostril*.16
    rgb=(value*(1-stubble)+beard*stubble, value*(1-stubble)+beard*.85*stubble, value*(1-stubble)+beard*.7*stubble)
    rgb=tuple(c*(1-lip*.15) for c in rgb)
   pixels.extend((*rgb,1))
 image=bpy.data.images.new('Original skin and cotton albedo atlas',width=w,height=h);image.colorspace_settings.name='sRGB';image.pixels=pixels;image.pack()
 tex=material.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
 vc=next(n for n in material.node_tree.nodes if n.type=='VERTEX_COLOR');p=material.node_tree.nodes.get('Principled BSDF')
 material.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
 return image
