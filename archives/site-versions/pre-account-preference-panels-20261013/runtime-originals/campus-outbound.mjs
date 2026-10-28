// Leave a rendered neighbourhood while still inside the existing v17 raw
// coverage (camera-centre disk + viewport, minimum manual zoom 14.5). A
// low-zoom retreat recentres inside that disk while lowering pitch, so it
// can show some actual camera travel without extending the raw coverage.
// The source remains above its native minimum zoom 14. No fetching,
// source installation or extra WebGL context is performed here.
export function createCampusOutbound(map, {
 detailGate, reducedMotion=()=>false, getOpacity=()=>1,
}={}) {
 let active=null,destroyed=false;
 const current=job=>!destroyed&&active===job&&!job.finished;
 function finish(job,done){
  if(job.finished)return;
  job.finished=true;
  map.off('move',job.onMove);map.off('moveend',job.onMoveEnd);
  if(active===job)active=null;
  job.resolve(done);
 }
 function cancel(){
  if(!active)return;
  const job=active;finish(job,false);
  // Cancel the gate's pending fade as well, so it cannot hide a newer view.
  detailGate.defer();
 }
 function start({duration=2200,center}={}){
  cancel();if(destroyed)return Promise.resolve(false);
  if(reducedMotion()){detailGate.hide();return Promise.resolve(true);}
  const startZoom=map.getZoom();
  const canRecenter=Array.isArray(center)&&center.length===2&&center.every(Number.isFinite)&&Math.abs(center[1])<=85.051129;
  // Keep the accepted high-zoom retreat unchanged. Near the manual lower
  // limit, reserve a relative retreat (14.5 -> 14.01 is a 1.40x wider view),
  // using the existing camera-centre margin instead of fetching parents.
  const endZoom=canRecenter?Math.max(14.01,Math.min(14.5,startZoom-.75)):14.5;
  if(startZoom<=endZoom){detailGate.hide();return Promise.resolve(true);}
  const job={finished:false,startZoom,endZoom};
  job.promise=new Promise(resolve=>{job.resolve=resolve;});active=job;
  const complete=()=>{
   if(!current(job))return;
   // The zoom expression is already zero here. Hide before handing the
   // camera to a journey whose viewport may leave the cached neighbourhood.
   detailGate.hide();if(current(job))finish(job,true);
  };
  job.onMove=()=>{if(current(job)&&map.getZoom()<=job.endZoom+.00001)complete();};
  job.onMoveEnd=()=>{if(current(job)&&map.getZoom()<=job.endZoom+.00001)complete();};
  map.on('move',job.onMove);map.on('moveend',job.onMoveEnd);
  // Leave enough actual camera travel for a visible fade: the last 2.1 zoom
  // units take over a second, rather than a few frames at the end of retreat.
  if(!detailGate.beginZoomFade({from:endZoom,to:Math.min(16.6,startZoom)},{opacity:getOpacity()})){
   detailGate.hide();finish(job,true);return job.promise;
  }
  try{
   map.easeTo({zoom:endZoom,pitch:0,bearing:0,...(endZoom<14.5?{center:[...center]}:{}),
    duration:Number.isFinite(duration)?Math.max(0,duration):2200,
    easing:t=>t*t*(3-2*t),essential:false});
  }catch(error){finish(job,false);throw error;}

  return job.promise;
 }
 function finishForLayout(){
  if(!active)return;
  const job=active;
  // A larger viewport is not covered by the old footprint. Conceal before
  // resizing; do not fetch an expanded neighbourhood for an outbound journey.
  detailGate.hide();if(current(job))finish(job,true);
 }
 function destroy(){if(destroyed)return;cancel();destroyed=true;}
 return {start,cancel,finishForLayout,destroy};
}
