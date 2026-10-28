// Contextual discovery receives only the records allowed by the caller's current
// section, geography, categories and favorites. It never loads extra candidates.
const validId=id=>typeof id==='string'&&id.length>0||typeof id==='number'&&Number.isFinite(id);

function uniqueEntries(entries){
 const byId=new Map();
 for(const entry of Array.isArray(entries)?entries:[]){
  if(entry&&validId(entry.id)&&!byId.has(entry.id))byId.set(entry.id,entry);
 }
 return [...byId.values()];
}

/** A fresh list of available source records, deduplicated by identity. */
export function availableRandomEntries(entries=[],currentId){
 return uniqueEntries(entries).filter(entry=>entry.id!==currentId);
}

/**
 * Each key owns a bag of unvisited IDs and its previous draw. A changed candidate
 * set removes departed records, retains unvisited ones, and adds new arrivals.
 * An excluded current record stays in the bag until it can be visited. If it is
 * the only record left, a new cycle starts among the other available candidates.
 * A singleton can be drawn once while displayed, then stays unavailable there.
 * Returning to a list makes it available to open again.
 */
export function createRandomDiscovery({random=Math.random}={}){
 const states=new Map(),defaultKey=Symbol('default-discovery-context');
 const sample=typeof random==='function'?random:Math.random;
 function indexFor(length){
  if(length<2)return 0;
  let value;
  try{value=sample();}catch{return 0;}
  if(!Number.isFinite(value))return 0;
  return Math.max(0,Math.min(length-1,Math.floor(value*length)));
 }
 function canPick(entries=[],{key=defaultKey,currentId}={}){
  const records=uniqueEntries(entries);
  if(!records.length)return false;
  if(records.length>1)return true;
  const id=records[0].id;
  return currentId!==id||states.get(key)?.lastId!==id;
 }
 function pick(entries=[],{key=defaultKey,currentId}={}){
  const records=uniqueEntries(entries);
  if(!canPick(records,{key,currentId}))return null;
  const byId=new Map(records.map(entry=>[entry.id,entry]));
  let state=states.get(key);
  if(!state){state={known:new Set(),remaining:new Set(),lastId:undefined};states.set(key,state);}
  // Filtering or fresh data must never leave a stale candidate in the bag.
  for(const id of state.remaining)if(!byId.has(id))state.remaining.delete(id);
  for(const id of byId.keys())if(!state.known.has(id))state.remaining.add(id);
  state.known=new Set(byId.keys());
  const eligible=(records.length===1?records:records.filter(entry=>entry.id!==currentId)).map(entry=>entry.id);
  if(!eligible.length)return null;
  const eligibleIds=new Set(eligible);
  let candidates=[...state.remaining].filter(id=>eligibleIds.has(id));
  if(!candidates.length){
   state.remaining=new Set(byId.keys());
   candidates=[...eligible];
  }
  // The last record of one cycle cannot become the first of the next when an
  // alternative exists. The same rule also covers changing candidate sets.
  if(candidates.includes(state.lastId)&&eligible.length>1){
   if(candidates.length===1){state.remaining=new Set(byId.keys());candidates=[...eligible];}
   candidates=candidates.filter(id=>id!==state.lastId);
  }
  const chosenId=candidates[indexFor(candidates.length)];
  state.remaining.delete(chosenId);state.lastId=chosenId;
  return byId.get(chosenId)||null;
 }
 function reset(key){
  if(key===undefined)states.clear();else states.delete(key);
 }
 return {pick,canPick,reset};
}
