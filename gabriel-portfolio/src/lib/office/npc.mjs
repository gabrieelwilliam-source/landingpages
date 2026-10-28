import actors from '../../data/studio-actors.json' with {type:'json'};
export {actors};
export function crowdLimit(quality,software=false){return quality==='low'?6:quality==='medium'?7:software&&quality==='auto'?6:8;}
/** Closed, time-parameterized local route; no random or network state. */
export function npcRoutine(actor,time){
 const t=((Math.max(0,time)+actor.offset)%90+90)%90;
 const home={x:actor.x,d:actor.d,yaw:actor.yaw,clip:actor.action,seat:actor.seat,phase:t};
 if(!actor.route.length || t<38 || t>66)return home;
 if(t<40)return {...home,clip:actor.seat?'StandUp':'Idle',phase:t-38,seat:actor.seat};
 if(t>64)return {...home,clip:actor.seat?'SitDown':'Idle',phase:t-64,seat:actor.seat};
 const points=[...actor.route,actor.route[0]];
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 const total=lengths.reduce((a,b)=>a+b,0);let travel=(t-40)/24*total;
 for(let i=0;i<lengths.length;i++){
  if(travel<=lengths[i] || i===lengths.length-1){
   const a=points[i],b=points[i+1],f=lengths[i]?travel/lengths[i]:0;
   return {x:a[0]+(b[0]-a[0])*f,d:a[1]+(b[1]-a[1])*f,yaw:Math.atan2(b[0]-a[0],-(b[1]-a[1])),clip:'Walk',seat:false,phase:t-40};
  }travel-=lengths[i];
 }return home;
}
export function bodyBlocked(x,d,bodies,ignoreId){return bodies.some(b=>b.id!==ignoreId&&Math.hypot(x-b.x,d-b.d)<.66);}
export function crowdSafeMove(previous,next,bodies){
 const x=bodyBlocked(next.x,previous.distance,bodies)?previous.x:next.x;
 const distance=bodyBlocked(x,next.distance,bodies)?previous.distance:next.distance;
 return {...next,x,distance,vx:x===previous.x?0:next.vx,vz:distance===previous.distance?0:next.vz};
}
export function nearbyTarget(position,targets,range=3.8){
 return targets.map(t=>({...t,separation:Math.hypot(t.x-position.x,t.d-position.distance)})).filter(t=>t.separation<=range).sort((a,b)=>a.separation-b.separation||a.id.localeCompare(b.id))[0]||null;
}

export function characterDetail(quality,software=false,distance=0){return quality==='low'||(quality==='auto'&&software)||distance>(quality==='high'?40:16)?'low':'high';}
