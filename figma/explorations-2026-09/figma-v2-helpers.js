const created=[];const mutated=[];const v=Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(x=>[x.name,x]));await Promise.all(["Regular","Medium","SemiBold","Bold"].map(style=>figma.loadFontAsync({family:"Jost",style})));const styles=Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s=>[s.name.replace("42/",""),s]));function track(n){created.push(n.id);return n;}function paint(key,opacity=1){return {...figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:0,g:0,b:0}},"color",v[key]),opacity};}function fill(n,key){n.fills=key?[paint(key)]:[];}function rad(n,key){for(const prop of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"])n.setBoundVariable(prop,v["radius/"+key]);}function pad(n,p){for(const prop of ["paddingLeft","paddingRight","paddingTop","paddingBottom"])n.setBoundVariable(prop,v["space/"+p]);}function gap(n,p){n.setBoundVariable("itemSpacing",v["space/"+p]);}function box(parent,name,w,h,color,dir=null){const n=track(dir?figma.createAutoLayout(dir):figma.createFrame());n.name=name;parent.appendChild(n);n.resize(w,h);n.layoutSizingHorizontal="FIXED";n.layoutSizingVertical="FIXED";fill(n,color);return n;}async function txt(parent,name,value,style="Body",color="color/text",w){const n=track(figma.createText());n.name=name;n.fontName=styles[style].fontName;parent.appendChild(n);await n.setTextStyleIdAsync(styles[style].id);n.characters=value;fill(n,color);if(w){n.textAutoResize="HEIGHT";n.resize(w,n.height);}else n.textAutoResize="WIDTH_AND_HEIGHT";return n;}function rect(parent,name,w,h,color){const n=track(figma.createRectangle());n.name=name;parent.appendChild(n);n.resize(w,h);fill(n,color);return n;}function ids(n){return [n.id,...("findAll"in n?n.findAll(()=>true).map(x=>x.id):[])];}async function snap(n){await n.screenshot({scale:0.7});}function result(extra={}){return {...extra,createdNodeIds:[...new Set(created)],mutatedNodeIds:[...new Set(mutated)]};}
async function button(parent,label,style="Primary",width){const base=await figma.getNodeByIdAsync("13:2");const c=base.children.find(n=>n.name==="Style="+style+", State=Default");const i=track(c.createInstance());parent.appendChild(i);created.push(...ids(i).slice(1));i.name="Action · "+label;i.setProperties({["Label#13:0"]:label});if(width)i.resize(width,44);return i;}
async function nav(parent,label,active=false){const c=await figma.getNodeByIdAsync(active?"13:8":"13:5");const i=track(c.createInstance());parent.appendChild(i);created.push(...ids(i).slice(1));i.name="Navigation · "+label;i.setProperties({["Label#13:13"]:label});return i;}
async function card(parent,category,title,description,action){const c=await figma.getNodeByIdAsync("14:2");const i=track(c.createInstance());parent.appendChild(i);created.push(...ids(i).slice(1));const k={"Category":"Category#14:0","Title":"Title#14:1","Description":"Description#14:2","Action":"Action#14:3"};i.setProperties({[k.Category]:category,[k.Title]:title,[k.Description]:description,[k.Action]:action});i.name="Carte · "+title;return i;}
function stop(position,key,alpha=1){const q=key==="color/fade-clear"?0:key==="color/fade-veil"?.9:alpha;return {position,color:{r:1,g:1,b:1,a:q},boundVariables:{color:{type:"VARIABLE_ALIAS",id:v[key].id}}};}
await figma.loadFontAsync({family:"Noto Sans Symbols2",style:"Regular"});

function radiusRole(n,key){for(const p of ["topLeftRadius","topRightRadius","bottomLeftRadius","bottomRightRadius"])n.setBoundVariable(p,v[key]);}
async function componentText(owner,parent,name,value,style="Body",color="color/text",width){const t=await txt(parent,name,value,style,color,width);const key=owner.addComponentProperty(name,"TEXT",value);t.componentPropertyReferences={characters:key};return {node:t,key};}
async function doc(parent,title,description,x=120,y=120,w=1200){const f=box(parent,title+" · Guide",w,180,"color/bg","VERTICAL");f.x=x;f.y=y;f.layoutSizingVertical="HUG";pad(f,32);gap(f,16);await txt(f,"Titre",title,"H1","color/text",w-64);await txt(f,"Description",description,"Body","color/muted",w-64);return f;}
function frameBounds(nodes){return {width:Math.max(...nodes.map(n=>n.x+n.width)),height:Math.max(...nodes.map(n=>n.y+n.height))};}

async function icon(parent,key,size=20,color="color/text"){const c=await figma.getNodeByIdAsync({"search":"47:7","close":"47:14","plus":"47:20","minus":"47:26","check":"47:32","chevron_down":"47:38","chevron_right":"47:45","arrow_left":"47:51","arrow_right":"47:57","info":"47:63","warning":"47:70","user":"47:76","globe":"47:84","eye":"47:92","upload":"47:99","edit":"47:105","heart":"47:111","message":"47:117","sun":"47:125","moon":"47:132","menu":"47:138","lock":"47:144","notification":"47:151"}[key]);const i=track(c.createInstance());parent.appendChild(i);created.push(...ids(i).slice(1));i.rescale(size/24);for(const n of i.findAll(n=>"strokes"in n&&n.strokes.length)){n.strokes=[paint(color)];}return i;}
/**
 * createComponentWithVariants
 *
 * Creates a component set by generating all combinations of `variantAxes`,
 * building one Figma component per combination, then calling
 * `figma.combineAsVariants` to produce the component set. After combining,
 * the variants are repositioned into a grid so they don't all stack at (0, 0).
 *
 * @param {{
 *   name: string,
 *   description?: string,
 *   variantAxes: Record<string, string[]>,
 *   baseProps: {
 *     width: number,
 *     height: number,
 *     fills?: Paint[],
 *     padding?: {top?: number, bottom?: number, left?: number, right?: number},
 *     radius?: number,
 *     layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE',
 *     itemSpacing?: number
 *   },
 *   page: PageNode
 * }} config
 *   - `name`: Component set name (e.g. "Button").
 *   - `description`: Optional human-readable purpose and usage guidance.
 *   - `variantAxes`: Each key is a variant property name; each value is an array of
 *     allowed values. All combinations are generated (Cartesian product).
 *     Example: { Size: ['Small', 'Medium', 'Large'], Style: ['Primary', 'Ghost'] }
 *     produces 6 variants.
 *   - `baseProps`: Visual properties applied to every variant.
 *   - `page`: The PageNode to create components on (must be set as current page by caller).
 * @returns {Promise<{
 *   componentSet: ComponentSetNode,
 *   variants: ComponentNode[]
 * }>}
 */
async function createComponentWithVariants(config) {
  const { name, variantAxes, baseProps, page } = config

  // Ensure we are on the correct page
  // Current page selected by caller

  // Compute Cartesian product of variant axes
  const axisNames = Object.keys(variantAxes)
  const axisValues = axisNames.map((k) => variantAxes[k])
  const combinations = cartesianProduct(axisValues)

  // Build one component per combination
  const components = []
  for (const combo of combinations) {
    const comp = figma.createComponent()

    // Name: "Property=Value, Property=Value, ..."
    comp.name = axisNames.map((ax, i) => `${ax}=${combo[i]}`).join(', ')

    // Base geometry
    comp.resize(baseProps.width, baseProps.height)

    // Fills
    if (baseProps.fills !== undefined) {
      comp.fills = baseProps.fills
    } else {
      comp.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }]
    }

    // Corner radius
    if (baseProps.radius !== undefined) {
      comp.cornerRadius = baseProps.radius
    }

    // Auto-layout
    if (baseProps.layoutMode && baseProps.layoutMode !== 'NONE') {
      comp.layoutMode = baseProps.layoutMode
      comp.primaryAxisAlignItems = 'CENTER'
      comp.counterAxisAlignItems = 'CENTER'
      if (baseProps.itemSpacing !== undefined) {
        comp.itemSpacing = baseProps.itemSpacing
      }
    }

    // Padding
    if (baseProps.padding) {
      comp.paddingTop = baseProps.padding.top ?? 0
      comp.paddingBottom = baseProps.padding.bottom ?? 0
      comp.paddingLeft = baseProps.padding.left ?? 0
      comp.paddingRight = baseProps.padding.right ?? 0
    }

    page.appendChild(comp)
    components.push(comp)
  }

  // Combine into a component set
  const componentSet = figma.combineAsVariants(components, page)
  componentSet.name = name
  if (config.description) {
    componentSet.description = config.description
  }

  // Grid layout — variants stack at (0, 0) after combineAsVariants; reposition them.
  const GRID_GAP = 16
  const cols = Math.max(1, axisValues[axisValues.length - 1]?.length ?? 1)
  const variantWidth = baseProps.width
  const variantHeight = baseProps.height

  componentSet.children.forEach((variant, idx) => {
    const col = idx % cols
    const row = Math.floor(idx / cols)
    variant.x = col * (variantWidth + GRID_GAP)
    variant.y = row * (variantHeight + GRID_GAP)
  })

  // Resize component set to wrap its children with padding
  const totalCols = Math.min(cols, combinations.length)
  const totalRows = Math.ceil(combinations.length / cols)
  const PADDING = 40
  componentSet.resize(
    totalCols * variantWidth + (totalCols - 1) * GRID_GAP + PADDING * 2,
    totalRows * variantHeight + (totalRows - 1) * GRID_GAP + PADDING * 2,
  )

  // Position component set at a safe canvas location
  componentSet.x = 480
  componentSet.y = 80

  return { componentSet, variants: componentSet.children }
}

/**
 * Computes the Cartesian product of multiple arrays.
 * cartesianProduct([[A, B], [1, 2]]) → [[A,1], [A,2], [B,1], [B,2]]
 *
 * @param {Array<string[]>} arrays
 * @returns {string[][]}
 */
function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, curr) => acc.flatMap((combo) => curr.map((val) => [...combo, val])),
    [[]],
  )
}

