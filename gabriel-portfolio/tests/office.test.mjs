import test from 'node:test';
import assert from 'node:assert/strict';
import {actors,npcRoutine,crowdLimit,characterDetail,crowdSafeMove,nearbyTarget} from '../src/lib/office/npc.mjs';
import {guideX,reconnectPath,freePoint} from '../src/lib/office/motion.mjs';
import {scenarios,initialSimulation,simulationStep} from '../src/lib/office/simulation.mjs';
import {safeCamera} from '../src/lib/office-camera.mjs';
import {contactChannel} from '../src/lib/contact-channel.mjs';
import office from '../src/data/office-layout.json' with {type:'json'};
test('cast has eight fictional identities and a useful scripted role in every sector',()=>{
 assert.equal(actors.length,8);assert.equal(new Set(actors.map(a=>a.id)).size,8);
 assert.deepEqual([...new Set(actors.slice(0,6).map(a=>a.area))],[0,1,2,3,4,5]);
 assert.equal(crowdLimit('low'),6);assert.equal(crowdLimit('medium'),7);assert.equal(crowdLimit('high'),8);
 assert.equal(crowdLimit('auto',true),6);assert.equal(crowdLimit('auto',false),8);
 actors.forEach(a=>{assert.ok(a.intro.length>40);assert.ok(a.detail.length>40);assert.ok(a.target);});
});
test('NPC routines are deterministic, periodic and remain inside the facade',()=>{
 for(const actor of actors)for(let t=0;t<180;t+=.1){
  const value=npcRoutine(actor,t),repeat=npcRoutine(actor,t+90);
  assert.ok(Math.abs(value.x-repeat.x)<1e-8);assert.ok(Math.abs(value.d-repeat.d)<1e-8);
  assert.ok(Math.abs(value.x)<office.halfWidth&&value.d>=0&&value.d<=office.length);
  assert.deepEqual(value,npcRoutine(actor,t));
 }
});
test('walking actors follow closed local routes rather than teleporting between workstations',()=>{
 for(const actor of actors.filter(a=>a.route.length)){
  let prior;
  for(let phase=40.01;phase<63.99;phase+=.02){
   const t=(phase-actor.offset+90)%90,r=npcRoutine(actor,t);
   assert.equal(r.clip,'Walk');if(prior)assert.ok(Math.hypot(r.x-prior.x,r.d-prior.d)<.08);
   prior=r;
  }
 }
});
test('guide curve and reconnect segments clear physical furniture and the glass facade',()=>{
 for(let d=0;d<=90;d+=.1)assert.ok(freePoint(guideX(d),d,office),`guide blocked at ${d}`);
 for(const start of [{x:4,distance:16},{x:-3,distance:24},{x:3,distance:47},{x:-3,distance:65},{x:0,distance:80}]){
  assert.ok(freePoint(start.x,start.distance,office));const path=reconnectPath(start,office);
  assert.ok(path.length>0);assert.ok(Math.abs(path.at(-1).x-guideX(start.distance))<.01);
  for(let i=1;i<path.length;i++)for(let f=0;f<=1;f+=.05){
   const a=path[i-1],b=path[i];assert.ok(freePoint(a.x+(b.x-a.x)*f,a.d+(b.d-a.d)*f,office));
  }
 }
 const desk=office.colliders.find(b=>b.name.startsWith('Solid walnut desk'));
 assert.deepEqual(reconnectPath({x:desk.x,distance:desk.d},office),[]);
});
test('a reconnect route goes around an occupied local point',()=>{
 const start={x:3,distance:24},body={id:'person',x:1.5,d:24},path=reconnectPath(start,office,[body]);
 assert.ok(path.length>0);for(const p of path)assert.ok(Math.hypot(p.x-body.x,p.d-body.d)>=.77);
});
test('visitor movement stops at people and nearby activation respects distance',()=>{
 const old={x:0,distance:12,vx:1,vz:0},wanted={...old,x:.4},bodies=[{id:'n',x:.8,d:12}];
 assert.equal(crowdSafeMove(old,wanted,bodies).x,0);
 assert.equal(nearbyTarget(old,[{id:'far',x:5,d:12}],3.8),null);
 assert.equal(nearbyTarget(old,[{id:'far',x:5,d:12},{id:'near',x:1,d:12}],3.8).id,'near');
});
test('camera clipping includes a standing person as well as architecture',()=>{
 const person={x:0,d:2,w:.51,h:.51,top:1.85};
 const clipped=safeCamera({x:0,y:1.35,d:0},{x:0,y:1.4,d:5},{...office,colliders:[person]});
 assert.ok(clipped.d<1.65);assert.ok(clipped.y>=1.15);
});
test('all four simulations expose three real local state transitions, reset and no overrun',()=>{
 for(const kind of Object.keys(scenarios)){
  let state=initialSimulation(kind);state=simulationStep(state,{type:'choice',value:scenarios[kind].choices[1]});
  for(let i=1;i<=3;i++){state=simulationStep(state,{type:'next'});assert.equal(state.step,i);assert.equal(state.history.length,i);}
  assert.equal(simulationStep(state,{type:'next'}),state);assert.equal(simulationStep(state,{type:'choice',value:'unexpected'}),state);
  assert.equal(simulationStep(state,{type:'reset'}).step,0);
 }
});
test('contact CTA accepts configured public channels and rejects unsafe or invented destinations',()=>{
 for(const value of [null,'','javascript:alert(1)','http://example.org','https://user:password@example.org'])assert.equal(contactChannel(value),null);
 assert.equal(contactChannel('https://example.org/contact'),'https://example.org/contact');
 assert.equal(contactChannel('mailto:hello@example.org'),'mailto:hello@example.org');
});
test('overhead light bounds stop the camera while leaving the floor route open',()=>{
 const beam={x:0,d:3,w:1.8,h:.35,bottom:2.8,top:3.2};const scene={...office,colliders:[beam]};
 assert.equal(safeCamera({x:0,y:1.35,d:0},{x:0,y:1.8,d:5},scene).d,5);
 assert.ok(safeCamera({x:0,y:1.35,d:0},{x:0,y:4,d:5},scene).d<2.8);
 assert.ok(office.cameraObstacles.length>=10);assert.ok(office.cameraObstacles.every(b=>b.bottom>3&&b.top>b.bottom));
});

test('geometry LOD follows explicit quality and distance while high keeps the protagonist detailed',()=>{
 assert.equal(characterDetail('low',false,0),'low');assert.equal(characterDetail('auto',true,0),'low');
 assert.equal(characterDetail('high',true,0),'high');assert.equal(characterDetail('medium',false,0),'high');
 assert.equal(characterDetail('medium',false,20),'low');assert.equal(characterDetail('auto',false,20),'low');
});
