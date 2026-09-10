import assert from 'node:assert/strict';
import {test} from 'node:test';
import {selectionReducer,initialSelection,zoomAt} from '../src/viewer-state.ts';
test('single, additive selection and removal preserve the displayed photo',()=>{
 let s=selectionReducer(initialSelection,{type:'select',photo:3,additive:false});
 s=selectionReducer(s,{type:'select',photo:9,additive:true});assert.deepEqual(s.photos,[3,9]);assert.equal(s.active,9);
 s=selectionReducer(s,{type:'activate',photo:3});assert.equal(s.active,3);assert.deepEqual(s.photos,[3,9]);
 s=selectionReducer(s,{type:'select',photo:3,additive:true});assert.equal(s.active,9);
 s=selectionReducer(s,{type:'select',photo:9,additive:true});assert.equal(s.open,false);assert.equal(s.active,null);
});
test('feature opens all associated photos and its reference',()=>{
 const s=selectionReducer(initialSelection,{type:'feature',id:'A2',photos:[7,8,9],reference:9});assert.deepEqual(s.photos,[7,8,9]);assert.equal(s.active,9);assert.equal(s.feature,'A2');
 assert.equal(selectionReducer(s,{type:'close'}).open,false);
});
test('wheel zoom preserves the point under the cursor, including limits',()=>{
 const old={x:23,y:-40,scale:.6},point={x:200,y:300};
 for(const factor of [1.6,.8,100,.0001]){const n=zoomAt(old,point,factor);assert.ok(n.scale>=.15&&n.scale<=8);assert.ok(Math.abs((point.x-n.x)/n.scale-(point.x-old.x)/old.scale)<1e-9);assert.ok(Math.abs((point.y-n.y)/n.scale-(point.y-old.y)/old.scale)<1e-9);}
});
