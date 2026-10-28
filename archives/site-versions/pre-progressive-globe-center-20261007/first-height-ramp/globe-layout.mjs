const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

/** Share the same projection centre with the map and its dock destination.
 * Only the full-page scene opts in; borrowed campus maps keep their own layout.
 */
export function resolveGlobeCenter({width,height,style}){
 const fraction=(name,fallback)=>{
  const raw=style.getPropertyValue(name).trim(),value=parseFloat(raw);
  return Number.isFinite(value)?value/(raw.endsWith('%')?100:1):fallback;
 };
 const x=fraction('--hg-center-x',.5),baseY=fraction('--hg-center-y',.5);
 const enabled=parseFloat(style.getPropertyValue('--horizon-responsive-globe'))===1;
 const lift=enabled&&height>0
  ?64*clamp((900-width)/540,0,1)*clamp((height-440)/240,0,1)
  :0;
 return {x,y:baseY-(height>0?lift/height:0),lift};
}
