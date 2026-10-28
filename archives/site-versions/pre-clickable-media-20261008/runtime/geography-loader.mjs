/** One in-flight preparation per session; failures may be retried explicitly. */
export function createGeographyLoader({workerFactory,url,rawUrl,timeoutMs=45000,onState=()=>{}}) {
 let pending=null,worker=null;
 function load(){
  if(pending)return pending;
  pending=new Promise((resolve,reject)=>{
   let finished=false,timer;
   const finish=(error,world)=>{
    if(finished)return;finished=true;clearTimeout(timer);worker?.terminate();worker=null;
    if(error){queueMicrotask(()=>{pending=null;});onState({phase:'error',message:error.message});reject(error);}
    else resolve(world);
   };
   try {
    worker=workerFactory();onState({phase:'downloading'});
    timer=setTimeout(()=>finish(new Error('Geography preparation timed out')),timeoutMs);
    worker.onmessage=({data})=>{
     if(finished)return;
     if(data.phase==='error')finish(new Error(data.message));
     else if(data.phase==='prepared'){onState({phase:'prepared',features:data.features});finish(null,data.world);}
     else onState(data);
    };
    worker.onerror=()=>finish(new Error('Geography worker failed'));
    worker.postMessage({url,rawUrl});
   }catch(error){finish(error);}
  });
  return pending;
 }
 return {load};
}
