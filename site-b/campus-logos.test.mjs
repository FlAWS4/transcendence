import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {inflateSync} from 'node:zlib';

// The printed logos of the version B Explorer (SPEC-B-HALO §6.3): site-b/tools/build-campus-logo-prints.py adds a
// `print` field, last, to every campus of campus-logos.json and writes the masks and Codam's cropped sticker to
// assets/campus-logos/print/.
const site=new URL('./',import.meta.url);
const {campuses}=JSON.parse(readFileSync(new URL('./campus-logos.json',site),'utf8'));
const catalogue=JSON.parse(readFileSync(new URL('./campuses.json',site),'utf8')).campuses.map(campus=>campus.id).sort();
const read=src=>readFileSync(new URL(src,site));
const PRINTS='assets/campus-logos/print/';
const stem=src=>src.slice(src.lastIndexOf('/')+1).replace(/\.[^.]+$/,'');

// A PNG file: its IHDR and, for 8-bit non-interlaced images, its rows after unfiltering.
function png(bytes){
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],'PNG signature');
 const chunks=[];
 for(let at=8;at<bytes.length;){
  const length=bytes.readUInt32BE(at),type=bytes.toString('latin1',at+4,at+8);
  chunks.push({type,data:bytes.subarray(at+8,at+8+length)});at+=12+length;
 }
 const ihdr=chunks[0].data;
 assert.equal(chunks[0].type,'IHDR');
 const header={width:ihdr.readUInt32BE(0),height:ihdr.readUInt32BE(4),depth:ihdr[8],colourType:ihdr[9],interlace:ihdr[12]};
 return {...header,types:chunks.map(chunk=>chunk.type),rows:()=>{
  assert.equal(header.depth,8);assert.equal(header.interlace,0);
  const channels={0:1,2:3,3:1,4:2,6:4}[header.colourType],stride=header.width*channels;
  const raw=inflateSync(Buffer.concat(chunks.filter(chunk=>chunk.type==='IDAT').map(chunk=>chunk.data)));
  assert.equal(raw.length,header.height*(stride+1));
  const rows=[];let previous=new Uint8Array(stride);
  for(let y=0;y<header.height;y++){
   const filter=raw[y*(stride+1)],line=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1)),row=new Uint8Array(stride);
   for(let i=0;i<stride;i++){
    const a=i>=channels?row[i-channels]:0,b=previous[i],c=i>=channels?previous[i-channels]:0;
    const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
    const predictor=[0,a,b,(a+b)>>1,pa<=pb&&pa<=pc?a:pb<=pc?b:c][filter];
    assert.notEqual(predictor,undefined,`filter ${filter}`);
    row[i]=(line[i]+predictor)&255;
   }
   rows.push(row);previous=row;
  }
  return rows;
 }};
}
const prints=Object.entries(campuses).filter(([,entry])=>entry.print?.src.startsWith(PRINTS));

test('every campus of the catalogue has a print, the last field of its entry',()=>{
 assert.deepEqual(Object.keys(campuses).sort(),catalogue);
 assert.equal(Object.keys(campuses).length,58);
 for(const [id,entry] of Object.entries(campuses)){
  assert.equal(Object.keys(entry).at(-1),'print',id);
  assert.deepEqual(Object.keys(entry.print),['kind','src','width','height','aspectRatio','sha256','bytes'],id);
 }
});

test('Codam is the only sticker; the SVG logos are masks drawn from their original files',()=>{
 const kinds=Object.entries(campuses).map(([id,{print}])=>[id,print.kind]);
 assert.deepEqual(kinds.filter(([,kind])=>kind==='sticker').map(([id])=>id),['codam']);
 assert.ok(kinds.every(([,kind])=>kind==='mask'||kind==='sticker'));
 assert.equal(campuses.codam.print.src,`${PRINTS}codam.png`,'the sticker is the original cropped to its ink box');
 const svgs=Object.entries(campuses).filter(([,entry])=>entry.format==='svg');
 assert.deepEqual(svgs.map(([id])=>id).sort(),['antwerp','brussels','wels','zurich']);
 for(const [id,entry] of svgs)assert.deepEqual([entry.print.kind,entry.print.src],['mask',entry.src],id);
 for(const [id,entry] of Object.entries(campuses))if(entry.format!=='svg')
  assert.equal(entry.print.src,`${PRINTS}${stem(entry.src)}.png`,id);
 assert.equal(prints.length,54,'51 print files, one of them for the four 1337 campuses');
});

test('every print file exists with its recorded SHA-256, size and pixel dimensions',()=>{
 for(const [id,{print}] of Object.entries(campuses)){
  const bytes=read(print.src);
  assert.equal(bytes.length,print.bytes,id);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),print.sha256,id);
  assert.equal(print.aspectRatio,Math.round(print.width/print.height*1e4)/1e4,`${id}: aspect ratio to 4 decimals`);
  if(print.src.endsWith('.svg')){
   const viewBox=/<svg\b[^>]*\bviewBox="([^"]+)"/.exec(bytes.toString('utf8'))?.[1]?.trim().split(/[\s,]+/).map(Number);
   assert.deepEqual(viewBox?.slice(2),[print.width,print.height],`${id}: the viewBox of the SVG`);
  }else{
   const {width,height}=png(bytes);
   assert.deepEqual([width,height],[print.width,print.height],`${id}: IHDR size`);
  }
 }
});

test('the four 1337 campuses share one print and every file of print/ is referenced',()=>{
 const shared=['1337-ben-guerir','1337-khouribga','1337-med','1337-rabat'].map(id=>campuses[id].print);
 assert.ok(shared.every(print=>JSON.stringify(print)===JSON.stringify(shared[0])));
 assert.equal(shared[0].src,`${PRINTS}1337.png`);
 const referenced=new Set(prints.map(([,{print}])=>print.src.slice(PRINTS.length)));
 assert.deepEqual(readdirSync(new URL(PRINTS,site)).sort(),[...referenced].sort());
 assert.equal(referenced.size,51);
 const total=[...referenced].reduce((sum,name)=>sum+read(PRINTS+name).length,0);
 assert.ok(total<600*1024,`${total} bytes of prints`);
});

test('prints are grey-and-alpha PNG masks whose grey is 0: the ink is in the alpha channel only',()=>{
 for(const name of new Set(prints.filter(([,{print}])=>print.kind==='mask').map(([,{print}])=>print.src))){
  const image=png(read(name));
  assert.equal(image.colourType,4,`${name}: colour type 4 (LA)`);
  assert.equal(image.depth,8,name);
  assert.ok(!image.types.some(type=>/^(tEXt|zTXt|iTXt|tIME|pHYs|gAMA|cHRM|sRGB|iCCP)$/.test(type)),`${name}: no metadata`);
  let ink=0;
  for(const row of image.rows())for(let i=0;i<row.length;i+=2){
   assert.equal(row[i],0,`${name}: grey ${row[i]}`);
   ink+=row[i+1];
  }
  assert.ok(ink>0,`${name} has ink`);
 }
});

test('the Codam sticker is its original cropped, pixels unchanged, with only white plate left outside the crop',()=>{
 const original=png(read(campuses.codam.src)),print=png(read(campuses.codam.print.src));
 assert.deepEqual([print.colourType,print.depth],[original.colourType,original.depth],'same pixel format');
 assert.ok(!print.types.some(type=>/^(tEXt|zTXt|iTXt|tIME|pHYs|gAMA|cHRM|sRGB|iCCP)$/.test(type)),'no metadata');
 assert.ok(print.width<original.width&&print.height<original.height);
 const channels={0:1,2:3,4:2,6:4}[original.colourType],source=original.rows(),crop=print.rows();
 const at=[];
 for(let y=0;y<=original.height-print.height;y++)for(let x=0;x<=original.width-print.width;x++){
  const row=source[y].subarray(x*channels,(x+print.width)*channels);
  if(Buffer.compare(Buffer.from(row),Buffer.from(crop[0]))===0&&crop.every((line,dy)=>
   Buffer.compare(Buffer.from(source[y+dy].subarray(x*channels,(x+print.width)*channels)),Buffer.from(line))===0))at.push([x,y]);
 }
 assert.ok(at.length>0,'the print is a crop of the original');
 const [x0,y0]=at[0];
 source.forEach((row,y)=>{for(let x=0;x<original.width;x++){
  if(y>=y0&&y<y0+print.height&&x>=x0&&x<x0+print.width)continue;
  for(let c=0;c<channels;c++)assert.equal(row[x*channels+c],255,`ink outside the crop at ${x},${y}`);
 }});
});
