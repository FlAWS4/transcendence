// Enable remote layers invisibly, then reveal a fresh ready destination view.
// Instantiate before the map's asynchronous source loading to observe errors.
export function createGlobeDetailGate(map, {
 setVisible,
 setOpacity,
 isPrepared = () => true,
 isZoomApproach = () => false,
 reducedMotion = () => false,
 onChange = () => {},
}) {
 const SOURCE = 'openmaptiles';
 let phase = 'local', opacityTarget = 0, rendered = false;
 let destroyed = false, sourceFailed = false, generation = 0, revealTimer = null, localFade = null;
 let movingPreparation=false, preparedRange=null;
 const getState = () => ({phase,opacityTarget});
 const notify = () => onChange(getState());
 function invalidate() {
  generation++;
  rendered = false;
  if(revealTimer !== null){clearTimeout(revealTimer);revealTimer = null;}
  const pending = localFade;localFade = null;
  if(pending){if(pending.timer !== null)clearTimeout(pending.timer);pending.resolve(false);}
  return generation;
 }
 const currentGeneration = current => !destroyed && current === generation;
 function conceal(nextPhase) {
  const current = invalidate();
  const changed = phase !== nextPhase || opacityTarget !== 0;
  phase = nextPhase;opacityTarget = 0;
  setOpacity(0,{duration:0});
  if(!currentGeneration(current))return false;
  setVisible(false);
  if(!currentGeneration(current))return false;
  if(changed)notify();
  return currentGeneration(current);
 }
 function prepare({retry = false,allowMoving = false,zoomRange = null} = {}) {
  if(destroyed || phase === 'revealing' || phase === 'detail')return;
  // Only an explicit new destination/retry may forget old source failures.
  // Repeated prepare calls must not reveal errored tiles GL calls "loaded".
  if(retry)sourceFailed = false;
  if(sourceFailed){conceal('error');return;}
  const current = invalidate();
  movingPreparation=allowMoving;preparedRange=zoomRange;
  phase = 'waiting';opacityTarget = 0;
  // The background is among these layers: hiding it must precede visibility.
  setOpacity(0,{duration:0});
  if(!currentGeneration(current))return;
  setVisible(true);
  if(!currentGeneration(current))return;
  notify();
  if(!currentGeneration(current))return;
  // Repeated preparation can leave all style values unchanged. Still require
  // a fresh source update/render before trusting previously cached readiness.
  refresh();
 }
 // External preparation may finish while GL is idle. Require a rendered frame
 // instead of trusting the frame cached before that preparation completed.
 function refresh() {
  if(destroyed || phase !== 'waiting')return;
  rendered = false;
  map.triggerRepaint();
 }
 function onRender() {
  if(destroyed || phase !== 'waiting')return;
  // GL 5.24 emits render after style/source updates and drawing. Do not wait
  // for idle's additional symbol fades when the actual stationary view is ready.
  rendered = true;
  tryReveal();
 }
 function tryReveal() {
  if(destroyed || phase !== 'waiting' || !rendered || sourceFailed)return;
  const current = generation;
  if((!movingPreparation&&(map.isMoving()||!map.areTilesLoaded())) || !map.isSourceLoaded(SOURCE) || !isPrepared())return;
  // Readiness callbacks can synchronously emit errors or change destination.
  if(destroyed || phase !== 'waiting' || current !== generation || sourceFailed)return;
  // Streaming can reveal during the approach. Only the visible urban source
  // must be ready: background radius downloads and local world tiles do not
  // block this first frame. Starting a late ramp at this zoom prevents a pop.
  const zoom=map.getZoom?.();
  if(movingPreparation&&isZoomApproach()&&map.isMoving()&&!reducedMotion()&&preparedRange&&zoom<16.6){
   const from=Math.max(preparedRange.from,zoom);
   beginZoomFade({from,to:Math.min(17.8,Math.max(preparedRange.to,from+1.2))});
   return;
  }
  const duration = reducedMotion() ? 0 : 450;
  phase = 'revealing';opacityTarget = 1;
  setOpacity(1,{duration});
  notify();
  if(destroyed || current !== generation || phase !== 'revealing')return;
  if(duration === 0){phase = 'detail';notify();return;}
  revealTimer = setTimeout(() => {
   revealTimer = null;
   if(destroyed || current !== generation || phase !== 'revealing')return;
   phase = 'detail';notify();
  },duration);
 }
 function onIdle() {tryReveal();}
 function onError(event) {
  if(destroyed)return;
  const sourceId = event?.sourceId ?? event?.source?.id;
  // Glyph and metadata errors may not carry a sourceId. They must also prevent
  // revealing a cache whose errored tiles MapLibre considers "loaded".
  if(sourceId && sourceId !== SOURCE)return;
  sourceFailed = true;
  if(phase === 'waiting' || phase === 'moving')conceal('error');
 }
 function defer({preserveMoving=false}={}) {
  if(destroyed)return;
  if(phase === 'waiting' || (phase === 'moving'&&!preserveMoving) || localFade)conceal('local');
  // Preserve an already revealed/revealing view during the next camera flight.
 }
 function hide() {
  if(!destroyed)conceal('local');
 }
 /** A ready current view or already-visible outbound view can follow zoom. */
 function beginZoomFade(zoomRange,{opacity=1}={}) {
  if(destroyed||sourceFailed)return false;
  const current=invalidate();phase='moving';opacityTarget=opacity;
  setOpacity(opacity,{duration:0,zoomRange});
  if(!currentGeneration(current))return false;
  setVisible(true);
  if(!currentGeneration(current))return false;
  notify();return currentGeneration(current);
 }
 function finishZoomFade() {
  if(destroyed||sourceFailed||phase!=='moving')return false;
  const current=invalidate();phase='detail';opacityTarget=1;
  setOpacity(1,{duration:0});
  if(!currentGeneration(current))return false;
  notify();return currentGeneration(current);
 }
 /** Resolve only after local paint is exposed; every interruption resolves false. */
 function fadeToLocal({duration = 200} = {}) {
  if(destroyed)return Promise.resolve(false);
  if(phase !== 'detail' && phase !== 'revealing' && phase !== 'fading' && phase !== 'moving') {
   return Promise.resolve(conceal('local'));
  }
  const current = invalidate();
  const milliseconds = reducedMotion() ? 0 : Math.max(0,Number.isFinite(duration) ? duration : 200);
  return new Promise(resolve => {
   const pending = {resolve,timer:null};localFade = pending;
   phase = 'fading';opacityTarget = 0;
   const active = () => currentGeneration(current) && localFade === pending;
   const finish = () => {
    if(!active())return;
    pending.timer = null;
    phase = 'local';
    setVisible(false);
    if(!active())return;
    notify();
    if(!active())return;
    localFade = null;resolve(true);
   };
   // Install cancellation before any setter/notification can re-enter the gate.
   if(milliseconds > 0)pending.timer = setTimeout(finish,milliseconds);
   setOpacity(0,{duration:milliseconds});
   if(!active())return;
   notify();
   if(active() && milliseconds === 0)finish();
  });
 }
 function destroy() {
  if(destroyed)return;
  destroyed = true;invalidate();
  map.off('render',onRender);map.off('idle',onIdle);map.off('error',onError);
 }
 map.on('render',onRender);map.on('idle',onIdle);map.on('error',onError);
 return {prepare,refresh,defer,hide,fadeToLocal,beginZoomFade,finishZoomFade,getState,destroy};
}
