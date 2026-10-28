import test from 'node:test';
import assert from 'node:assert/strict';
import {plan,N22,formats} from './entrance-sync-plan.mjs';
import {scannerTogetherProgress,scannerReturnPosition} from '../../studies/decryption-examples/scanner-return-together.mjs';

test('arrival scan and confirmed decipher preserve n22, followed by the requested readable hold',()=>{
 assert.ok(Math.abs(N22.scanDuration+N22.decipherDuration-6.8)<1e-9);
 assert.equal(N22.revealDuration,1.3);
 assert.equal(N22.logoDuration,.6);assert.equal(N22.ringDuration,.8);assert.equal(N22.globeDuration,1.2);
 assert.equal(plan.variant,22);assert.equal(plan.phrase,'BEYOND THE CODE');
 assert.equal(plan.cipher,'ru%43t 9xu s4tu');
});
test('all 13 letters start together and settle in the web seed-42 order',()=>{
 const cells=plan.cells.filter(c=>c.rank>=0);
 assert.equal(cells.length,13);assert.equal(new Set(plan.order).size,13);
 for(const cell of cells){
  assert.equal(cell.glyphs.length,43);assert.equal(cell.glyphs[0].start,0);
  assert.equal(cell.glyphs.at(-1).character,cell.clear);
  assert.ok(Math.abs(cell.settle-(6.05+.05*cell.rank))<1e-9);
  for(let step=0;step<42;step++){
   const g=cell.glyphs[step],time=N22.scanDuration+(g.start+g.end)/2;
   assert.equal(Math.floor(scannerTogetherProgress(time*1000,cell.rank,13)*42),step);
   assert.equal(g.end,cell.glyphs[step+1].start);
  }
 }
 assert.notDeepEqual(plan.order,[...plan.order].sort((a,b)=>a-b));
});
test('scanner keyframes match the source, with a continuous turnaround',()=>{
 assert.equal(plan.scan[0].time,.6);assert.equal(plan.scan.at(-1).time,3.4);
 assert.equal(plan.scan[28].position,1);
 for(const k of plan.scan)assert.equal(k.position,scannerReturnPosition(k.time*1000));
 for(let i=0;i<plan.scan.length-1;i++){
  const a=plan.scan[i],b=plan.scan[i+1],mid=(a.time+b.time)/2;
  assert.ok(Math.abs((a.position+b.position)/2-scannerReturnPosition(mid*1000))<.0008);
 }
});
test('entry IDs and separate member/visitor destination routes stay explicit',()=>{
 assert.deepEqual(Object.values(formats).map(f=>f.entry),['115:3','123:145']);
 for(const f of Object.values(formats)){
  assert.equal(f.logo.length,2);assert.equal(f.ring.length,2);assert.equal(f.homes.length,2);
  assert.ok(![f.scan,f.decipher,f.reveal].includes(f.logo[1]));
  assert.equal(new Set(f.homes.flat()).size,4);
 }
});
