/**
 * Prepare the parent geometry used by the first polar rotation behind the
 * entrance. Uses public MapLibre 5.24 camera/readiness/event APIs only.
 * Caller owns the navigation lock and must suppress its normal moveend handler
 * inside moveView. On failure the caller keeps the entrance and disposes/retries.
 */
export async function prepareWorldRender(map, {
 getView,
 moveView = view => map.jumpTo(view),
 sourceIds = ['world','world-borders'],
 signal,
 timeoutMs = 15000,
 onProgress = () => {},
} = {}) {
 if(typeof getView !== 'function')throw new TypeError('A final world camera is required.');
 if(!Number.isFinite(timeoutMs)||timeoutMs<=0)throw new RangeError('Invalid world preparation timeout.');
 const sources=sourceIds.filter(id=>map.getSource(id));
 if(!sources.length)throw new Error('Local world sources are unavailable.');
 const abortError=()=>new DOMException('World preparation cancelled.','AbortError');
 const deadline=performance.now()+timeoutMs;

 function renderView(view){
  return new Promise((resolve,reject)=>{
   let rendered=false,settled=false,timer=null;
   function finish(error){
    if(settled)return;settled=true;
    clearTimeout(timer);map.off('render',render);map.off('idle',check);map.off('error',failed);
    signal?.removeEventListener('abort',aborted);
    if(error)reject(error);else resolve();
   }
   function check(){
    if(settled||!rendered)return;
    try{
     const ready=!map.isMoving()&&map.areTilesLoaded()&&sources.every(id=>map.isSourceLoaded(id));
     if(!settled&&ready)finish();
    }catch(error){finish(error);}
   }
   function render(){rendered=true;check();}
   function failed(event){
    const id=event?.sourceId??event?.source?.id;
    if(id&&!sources.includes(id))return;
    finish(event?.error instanceof Error?event.error:new Error('Local world rendering failed.'));
   }
   function aborted(){finish(abortError());}
   if(signal?.aborted){reject(abortError());return;}
   const remaining=deadline-performance.now();
   if(remaining<=0){reject(new Error('World rendering preparation timed out.'));return;}
   map.on('render',render);map.on('idle',check);map.on('error',failed);
   signal?.addEventListener('abort',aborted,{once:true});
   timer=setTimeout(()=>finish(new Error('World rendering preparation timed out.')),remaining);
   try{moveView(view);if(!settled)map.triggerRepaint();}catch(error){finish(error);}
  });
 }

 for(const [index,zoom] of [0,1].entries()){
  if(signal?.aborted)throw abortError();
  onProgress({phase:'parents',index,zoom});
  await renderView({...getView(),zoom});
 }
 // Cover the far hemisphere at the initial world's own LOD as well. Parent
 // tiles prevent holes; this pass also prepares the southern z2 geometry.
 const opposite={...getView()},center=opposite.center;
 if(!Array.isArray(center)||center.length<2||!center.every(Number.isFinite)){
  throw new TypeError('World preparation requires a [longitude, latitude] center.');
 }
 opposite.center=[((center[0]+360)%360+360)%360-180,-center[1]];
 onProgress({phase:'opposite',zoom:opposite.zoom});
 await renderView(opposite);
 // Read the destination again: the viewport may have changed during a worker
 // preparation. Keep the same map and geometry, and reveal only its final view.
 for(;;){
  const finalView=getView(),signature=JSON.stringify(finalView);
  onProgress({phase:'restoring',zoom:finalView.zoom});
  await renderView({...finalView});
  if(signal?.aborted)throw abortError();
  // A resize can also happen while the final geometry is being prepared.
  // Require the current destination to have rendered, within the same deadline.
  if(JSON.stringify(getView())!==signature)continue;
  onProgress({phase:'ready',zoom:finalView.zoom});
  return {preparedZooms:[0,1],zoom:finalView.zoom};
 }
}
