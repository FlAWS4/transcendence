/**
 * Render actual Antarctic interior directly on the unit sphere. GeoJSON's
 * Mercator conversion cannot represent this region faithfully. No coastline,
 * geographic source or selection polygon is changed by this layer.
 * Uses MapLibre GL 5.24's public CustomRenderMethodInput.defaultProjectionData:
 * https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/CustomRenderMethodInput/
 */
export const POLAR_CAP_LATITUDE = -85.23;
const RADIANS = Math.PI/180;
const COLORS = {light:[25/255,184/255,181/255,1],dark:[37/255,105/255,103/255,1]};

/** Small sphere mesh: every point lies south of the last real source coast. */
export function createPolarCapMesh({segments=180,rings=10}={}) {
 if(!Number.isInteger(segments) || segments<3 || !Number.isInteger(rings) || rings<1 || segments*rings+1>65535)throw new RangeError('Invalid polar mesh resolution');
 const vertices = new Float32Array((1+segments*rings)*3);
 vertices.set([0,-1,0]);
 const indices = [];
 const vertex = (ring,segment) => 1+(ring-1)*segments+(segment%segments);
 for(let ring=1;ring<=rings;ring++) {
  const latitude = (-90+(90+POLAR_CAP_LATITUDE)*ring/rings)*RADIANS;
  for(let segment=0;segment<segments;segment++) {
   const longitude = segment*2*Math.PI/segments;
   vertices.set([Math.sin(longitude)*Math.cos(latitude),Math.sin(latitude),Math.cos(longitude)*Math.cos(latitude)],vertex(ring,segment)*3);
   if(ring===1)indices.push(0,vertex(ring,segment+1),vertex(ring,segment));
   else {
    const a=vertex(ring-1,segment),b=vertex(ring-1,segment+1),c=vertex(ring,segment),d=vertex(ring,segment+1);
    indices.push(a,b,c,c,b,d);
   }
  }
 }
 return {vertices,indices:new Uint16Array(indices)};
}

function compile(gl,type,source) {
 const shader = gl.createShader(type);
 gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
  const message = gl.getShaderInfoLog(shader);gl.deleteShader(shader);
  throw new Error(`Polar cap shader: ${message}`);
 }
 return shader;
}

/** Add before h42-world-border, then call setTheme(dark)/setVisible(bool). */
export function createPolarCapLayer({id='h42-polar-cap'}={}) {
 const mesh = createPolarCapMesh();
 let map,context,resources=null,dark=false,visible=true;
 let colorFrom=COLORS.light,colorTo=COLORS.light,colorStarted=0,colorDuration=0;
 const currentColor = (time=performance.now()) => {
  const progress=colorDuration?Math.min(1,Math.max(0,(time-colorStarted)/colorDuration)):1;
  if(progress===1)return colorTo;
  return colorTo.map((value,index)=>colorFrom[index]+(value-colorFrom[index])*progress);
 };
 function release() {
  if(!resources || !context)return;
  const {program,vertexBuffer,indexBuffer,vao} = resources;
  context.deleteProgram(program);context.deleteBuffer(vertexBuffer);context.deleteBuffer(indexBuffer);
  if(vao)context.deleteVertexArray(vao);
  resources = null;
 }
 function initialize() {
  const gl=context;
  if(gl.isContextLost())return;
  release();
  const modern = typeof gl.createVertexArray === 'function';
  const version = modern ? '#version 300 es\n' : '';
  const vertexShader = compile(gl,gl.VERTEX_SHADER,`${version}
   precision highp float;
   ${modern?'in':'attribute'} vec3 a_sphere;
   uniform mat4 u_matrix;
   ${modern?'out':'varying'} vec3 v_sphere;
   void main(){
    v_sphere=a_sphere;
    gl_Position=u_matrix*vec4(a_sphere,1.0);
    gl_Position.z=0.0;
   }`);
  let fragmentShader,program;
  try {
   fragmentShader = compile(gl,gl.FRAGMENT_SHADER,`${version}
    precision highp float;
    ${modern?'in':'varying'} vec3 v_sphere;
    uniform vec4 u_horizon;
    uniform vec4 u_color;
    ${modern?'out vec4 fragColor;':''}
    void main(){
     if(dot(normalize(v_sphere),u_horizon.xyz)+u_horizon.w<0.0)discard;
     ${modern?'fragColor':'gl_FragColor'}=u_color;
    }`);
   program=gl.createProgram();gl.attachShader(program,vertexShader);gl.attachShader(program,fragmentShader);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(`Polar cap program: ${gl.getProgramInfoLog(program)}`);
  } catch(error) {
   if(program)gl.deleteProgram(program);
   throw error;
  } finally {
   gl.deleteShader(vertexShader);if(fragmentShader)gl.deleteShader(fragmentShader);
  }
  const vertexBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer(),vao=modern?gl.createVertexArray():null;
  if(vao)gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,mesh.indices,gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_sphere');
  gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
  if(vao)gl.bindVertexArray(null);
  resources={program,vertexBuffer,indexBuffer,vao,position,matrix:gl.getUniformLocation(program,'u_matrix'),horizon:gl.getUniformLocation(program,'u_horizon'),color:gl.getUniformLocation(program,'u_color')};
 }
 const contextLost = () => {resources=null;};
 const contextRestored = () => {initialize();map.triggerRepaint();};
 return {
  id,type:'custom',renderingMode:'2d',
  onAdd(nextMap,gl) {
   map=nextMap;context=gl;initialize();
   map.on('webglcontextlost',contextLost);map.on('webglcontextrestored',contextRestored);
  },
  setTheme(value,{duration=450}={}) {
   const next=Boolean(value);if(dark===next)return;
   colorFrom=currentColor();dark=next;colorTo=dark?COLORS.dark:COLORS.light;
   colorStarted=performance.now();colorDuration=map?Math.max(0,duration):0;
   map?.triggerRepaint();
  },
  setVisible(value) {const next=Boolean(value);if(visible!==next){visible=next;map?.triggerRepaint();}},
  render(gl,{defaultProjectionData:data}) {
   // The cap is globe-only. It must never be drawn with a Mercator matrix or
   // during the globe-to-Mercator transition used for the campus approach.
   if(!visible || !resources || !data || data.projectionTransition<.999)return;
   const plane=data.clippingPlane;
   const angle=(90+POLAR_CAP_LATITUDE)*RADIANS;
   // Conservative bound: skip the entire GL draw while the pole is hidden.
   const a=-plane[1],b=Math.hypot(plane[0],plane[2]);
   if(a+b*Math.sin(angle)+Math.abs(a)*(1-Math.cos(angle))+plane[3]<0)return;
   const previous=[gl.DEPTH_TEST,gl.CULL_FACE,gl.STENCIL_TEST].map(flag=>[flag,gl.isEnabled(flag)]);
   try {
    // Horizon clipping is explicit in the shader. Avoid Mercator/depth-layer
    // assumptions, while preserving all GL capabilities for following layers.
    for(const [flag] of previous)gl.disable(flag);
    gl.useProgram(resources.program);
    if(resources.vao)gl.bindVertexArray(resources.vao);
    else {
     gl.bindBuffer(gl.ARRAY_BUFFER,resources.vertexBuffer);
     gl.enableVertexAttribArray(resources.position);gl.vertexAttribPointer(resources.position,3,gl.FLOAT,false,0,0);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,resources.indexBuffer);
    }
    gl.uniformMatrix4fv(resources.matrix,false,data.mainMatrix);
    gl.uniform4fv(resources.horizon,plane);gl.uniform4fv(resources.color,currentColor());
    gl.drawElements(gl.TRIANGLES,mesh.indices.length,gl.UNSIGNED_SHORT,0);
    if(performance.now()<colorStarted+colorDuration)map.triggerRepaint();
   } finally {
    if(resources.vao)gl.bindVertexArray(null);
    for(const [flag,enabled] of previous)gl[enabled?'enable':'disable'](flag);
   }
  },
  onRemove() {
   map?.off('webglcontextlost',contextLost);map?.off('webglcontextrestored',contextRestored);
   release();map=null;context=null;
  },
 };
}
