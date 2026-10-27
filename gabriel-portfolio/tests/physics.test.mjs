import {test} from 'node:test';
import assert from 'node:assert/strict';
import {step,chapterAt,WORLD_END} from '../src/lib/physics.mjs';
test('world boundaries and checkpoint progression',()=>{assert.equal(step({x:0,y:0,vy:0},-1,false,.04).x,0);assert.equal(step({x:WORLD_END,y:0,vy:0},1,false,.04).x,WORLD_END);assert.equal(chapterAt(601),1);assert.equal(chapterAt(3000),5)});
test('obstacle blocks walking but a timed jump clears it and lands',()=>{let p={x:270,y:0,vy:0};for(let i=0;i<20;i++)p=step(p,1,false,.016);assert.equal(p.x,282);p=step(p,1,true,.016);for(let i=0;i<60;i++)p=step(p,1,false,.016);assert.ok(p.x>338);assert.equal(p.y,0);assert.equal(p.vy,0)});
test('large elapsed time is capped after tab inactivity',()=>{assert.equal(step({x:0,y:0,vy:0},1,false,4).x,10)});
