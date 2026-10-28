import {test} from 'node:test';
import assert from 'node:assert/strict';
import {joystickVector} from '../src/lib/joystick.mjs';
test('analog dead zone prevents drift while allowing proportional forward and reverse',()=>{
  assert.equal(joystickVector(1,1,34).forward,0);
  const gentle=joystickVector(0,-17,34),full=joystickVector(0,-34,34);
  assert.ok(gentle.forward>0&&gentle.forward<.5);
  assert.equal(full.forward,1);
  assert.equal(joystickVector(0,34,34).forward,-1);
});
test('diagonal and off-base movement keep unit speed and thumb inside the circle',()=>{
  for(const [x,y] of [[34,-34],[1000,1000],[-300,150]]){
    const v=joystickVector(x,y,34);
    assert.ok(Math.abs(Math.hypot(v.x,v.forward)-1)<1e-12);
    assert.ok(Math.abs(Math.hypot(v.thumbX,v.thumbY)-34)<1e-12);
  }
});
test('invalid pointer coordinates cannot introduce non-finite movement',()=>{
  for(const args of [[NaN,0,34],[0,Infinity,34],[4,2,0]])
    assert.deepEqual(joystickVector(...args),{x:0,forward:0,thumbX:0,thumbY:0});
});
