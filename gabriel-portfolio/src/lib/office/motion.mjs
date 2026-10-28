/** Gentle, reversible guide curve, always inside the verified central circulation. */
export function guideX(distance){return Math.sin(distance*.12)*.36;}
export function freePoint(x,d,office,padding=0){return Math.abs(x)<=office.halfWidth&&d>=0&&d<=office.length&&!office.colliders.some(b=>Math.abs(x-b.x)<b.w+padding&&Math.abs(d-b.d)<b.h+padding);}
/** Local A* reconnect, including diagonal corner checks. No straight line through desks. */
export function reconnectPath(position,office,bodies=[]){
 const step=.35,goal={x:guideX(position.distance),d:position.distance};
 const blocked=(x,d)=>!freePoint(x,d,office)||bodies.some(b=>Math.hypot(x-b.x,d-b.d)<.78);
 const key=(x,y)=>x+','+y,base=position.distance;
 if(blocked(position.x,base))return [];
 const start={x:0,y:0};
 const open=[{...start,g:0,f:Math.abs(position.x-goal.x),parent:null}],seen=new Map();
 let end;
 while(open.length&&seen.size<7000){
  open.sort((a,b)=>a.f-b.f);const current=open.shift(),id=key(current.x,current.y);
  if(seen.has(id))continue;seen.set(id,current);
  const x=position.x+current.x*step,d=base+current.y*step;
  if(Math.hypot(x-goal.x,d-goal.d)<.36){end=current;break;}
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]]){
   const nx=x+dx*step,nd=d+dy*step;
   if(blocked(nx,nd)||(dx&&dy&&(blocked(nx,d)||blocked(x,nd))))continue;
   const g=current.g+Math.hypot(dx,dy)*step;
   if(!seen.has(key(current.x+dx,current.y+dy)))open.push({x:current.x+dx,y:current.y+dy,g,f:g+Math.hypot(nx-goal.x,nd-goal.d),parent:current});
  }
 }
 if(!end)return [];
 const path=[];for(let item=end;item;item=item.parent)path.unshift({x:position.x+item.x*step,d:base+item.y*step});
 path[0]={x:position.x,d:position.distance};
 if(!blocked(goal.x,goal.d))path.push(goal);
 return path;
}
