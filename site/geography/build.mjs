// Run from any directory; build dependencies live outside the prototype.
import {readFile, writeFile, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const directory = dirname(fileURLToPath(import.meta.url));
const sourceUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_10m_admin_0_countries.geojson';
const sourceSha256 = '239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255';
const sha256 = data => createHash('sha256').update(data).digest('hex');
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, argument, index, all) => {
 if(argument.startsWith('--'))pairs.push([argument.slice(2),all[index+1]]);
 return pairs;
},[]));
const cli = resolve(args.mapshaper || '/tmp/horizon-geography-build/node_modules/mapshaper/bin/mapshaper');
const packageDirectory = dirname(dirname(cli));
const require = createRequire(import.meta.url);
if(require(join(packageDirectory,'package.json')).version !== '0.6.113')throw new Error('Mapshaper 0.6.113 required; see PROVENANCE.md.');
const mapshaper = require(packageDirectory);
mapshaper.enableLogging();
const temporary = await mkdtemp(join(tmpdir(),'horizon-geography-'));
try {
 let input;
 if(args.source)input = await readFile(resolve(args.source));
 else {
  const response = await fetch(sourceUrl);
  if(!response.ok)throw new Error(`Natural Earth HTTP ${response.status}`);
  input = Buffer.from(await response.arrayBuffer());
 }
 if(sha256(input) !== sourceSha256)throw new Error('Unexpected Natural Earth source checksum; review before rebuilding.');
 const source = join(temporary,'source.geojson');
 await writeFile(source,input);
 await mapshaper.runCommands([source,
  '-simplify','dp','interval=10','keep-shapes','stats',
  '-each','id=ISO_A3==="-99"?ADM0_A3:ISO_A3,name=NAME_EN',
  '-filter-fields','id,name','-rename-layers','countries',
  '-o','format=topojson','quantization=10000000','id-field=id',join(temporary,'world-countries.topo.json'),
  '-o','format=geojson','gj2008','precision=0.00001','fix-geometry','id-field=id',join(temporary,'world-countries.geojson'),
 ]);
 await mkdir(directory,{recursive:true});
 const files = {};
 for(const name of ['world-countries.topo.json','world-countries.geojson']) {
  const data = Buffer.from(JSON.stringify(JSON.parse(await readFile(join(temporary,name),'utf8'))));
  const compressed = gzipSync(data,{level:9});
  await writeFile(join(directory,name),data);
  await writeFile(join(directory,`${name}.gz`),compressed);
  files[name] = {bytes:data.length,sha256:sha256(data),gzipBytes:compressed.length,gzipSha256:sha256(compressed)};
 }
 const report = {sourceUrl,sourceSha256,sourceBytes:input.length,mapshaper:'0.6.113',
  simplification:{algorithm:'spherical Ramer-Douglas-Peucker',thresholdMeters:10,keepShapes:true},
  topologyQuantization:10000000,geojsonPrecisionDegrees:0.00001,files};
 await writeFile(join(directory,'BUILD.json'),`${JSON.stringify(report,null,2)}\n`);
 console.log(JSON.stringify(report,null,2));
 await import('./verify.mjs');
} finally {
 await rm(temporary,{recursive:true,force:true});
}
