import {removePolarBorderSeams} from './polar-geometry.mjs';
// Download, inflate and parse away from the entrance animation's main thread.
self.onmessage = async ({data:{url,rawUrl}}) => {
 try {
  const compressed = typeof DecompressionStream === 'function';
  const response = await fetch(compressed ? url : rawUrl);
  if(!response.ok)throw new Error(`Geography HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  self.postMessage({phase:'downloaded',bytes:bytes.byteLength});
  const stream = new Blob([bytes]).stream();
  const text = await new Response(compressed ? stream.pipeThrough(new DecompressionStream('gzip')) : stream).text();
  let world = JSON.parse(text);
  if(world.type==='Topology'){
   await import('../shared/map-data/topojson.min.js');
   const topology=world,object=topology.objects.countries||topology.objects.features||Object.values(topology.objects)[0];
   world=self.topojson.feature(topology,object);
   world.borders=removePolarBorderSeams(self.topojson.mesh(topology,object));
  }
  if(world.type!=='FeatureCollection'||!world.features?.length)throw new Error('Invalid geography');
  self.postMessage({phase:'prepared',world,features:world.features.length});
 }catch(error){self.postMessage({phase:'error',message:error.message});}
};
