import {model} from '../../studies/decryption-examples/shared.mjs';
import {resolutionOrder, resolutionTime, scannerReturnPosition} from '../../studies/decryption-examples/scanner-return-together.mjs';

// This file describes the existing web motion. It never writes to Figma.
export const N22 = Object.freeze({duration:6.8, scanDuration:3.65, decipherDuration:3.15, revealDuration:1.3,
  scanStart:.6, scanTurn:2, scanEnd:3.4, firstSettle:6.05, lastSettle:6.65,
  logoDuration:.6, ringDuration:.8, globeDuration:1.2});
export const formats = Object.freeze({
  desktop:{entry:'115:3',scan:'119:49',decipher:'119:62',reveal:'119:75',scene:'116:4',
    login:'116:8',guest:'116:17',access:'116:7',confirm:'118:67',logo:['119:88','119:133'],
    ring:['142:462','142:509'],archive:['144:582','144:630'],homes:[['115:4','125:243'],['119:178','125:296']],
    width:1440,height:960,sceneWidth:1100,sceneHeight:320,fontSize:86,logoWidth:128,ringDiameter:200},
  mobile:{entry:'123:145',scan:'128:358',decipher:'128:371',reveal:'128:384',scene:'123:148',
    login:'123:152',guest:'123:153',access:'123:151',confirm:'128:490',logo:['128:397','128:442'],
    ring:['142:556','142:603'],archive:['144:678','144:726'],homes:[['123:162','125:349'],['125:198','125:402']],
    width:390,height:844,sceneWidth:342,sceneHeight:240,fontSize:48,logoWidth:112,ringDiameter:174},
});

export function createPlan(){
 const order=resolutionOrder(model.PHRASE,'random');
 const bytes=model.sample(0).map(s=>s.encryptedByte);
 const cells=Array.from(model.PHRASE,(clear,index)=>{
  const byte=bytes[index],cipher=String.fromCharCode(byte),rank=order.indexOf(index);
  const origin=model.ALPHABET.indexOf(cipher),settle=rank<0?null:resolutionTime(rank,order.length)/1000;
  const glyphs=rank<0?[]:Array.from({length:model.KEY+1},(_,step)=>({
   character:step===model.KEY?clear:model.ALPHABET[(origin-step+model.ALPHABET.length)%model.ALPHABET.length],
   start:(settle-N22.scanDuration)*step/model.KEY,
   end:step===model.KEY?N22.decipherDuration:(settle-N22.scanDuration)*(step+1)/model.KEY,
   settled:step===model.KEY,
  }));
  return {index,clear,byte,cipher,rank,settle,binary:byte.toString(2).padStart(8,'0'),hex:byte.toString(16).padStart(2,'0').toUpperCase(),glyphs};
 });
 // Sampling the exact cosine path bounds the native linear approximation.
 const scan=Array.from({length:57},(_,i)=>{const time=(600+i*50)/1000;return{time,position:scannerReturnPosition(time*1000)};});
 return {source:'scanner-return-random.mjs / scanner-return-together.mjs',variant:22,phrase:model.PHRASE,cipher:bytes.map(b=>String.fromCharCode(b)).join(''),key:model.KEY,order,timing:N22,formats,cells,scan};
}

export const plan=createPlan();
