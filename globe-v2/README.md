# Globe V2 — learning and build guide

This folder is a clean place to learn and build the globe for 42 Horizon.

The old `site/` and `site-b/` folders are references for ideas and design. We are not trying to copy their code.

This README is only about the **globe part**.

It covers:

- what the globe has to do;
- what the frontend has to do;
- what the small globe backend may do later;
- what Three.js does;
- the small amount of math we need;
- how campus coordinates become points on a sphere;
- how clicks work;
- how camera movement can work;
- how to keep the globe fast;
- how to debug it;
- what to learn in each phase;
- what I should be able to explain during an evaluation.

The goal is simple:

> I should be able to open the globe code, point at any important line, and explain what it does, why it is there, and how I would debug it.

---

# 1. What are we building?

We are not building Google Maps.

We are building a 3D view of the 42 Network around the world.

The basic idea is:

~~~text
Open app
   |
   v
Login / entry screen
   |
   | while this is happening, public globe files can load
   v
3D Earth
   |
   +-- 42 campus points
   |
   +-- drag / touch to rotate
   |
   +-- zoom
   |
   +-- click a campus
   |
   v
Camera moves to the campus
   |
   v
Show campus information
~~~

The globe only needs enough world data to help the user understand where the campuses are.

It does **not** need:

- street maps for the whole world;
- road data for every city;
- building data for every campus;
- a heavy map engine running all the time.

That is one of the main reasons we are rebuilding it.

---

# 2. Current Phase 1

Right now the clean spike contains:

- React;
- Three.js;
- one Earth sphere;
- six sample campuses;
- mouse rotation;
- touch rotation through OrbitControls;
- zoom;
- campus click detection;
- a selected campus card;
- capped device pixel ratio;
- rendering when the view changes instead of running forever.

The six current sample campuses are:

- Mulhouse;
- Paris;
- Tokyo;
- Seoul;
- Singapore;
- Abu Dhabi.

Things that are **not finished yet**:

- all 42 Network campus locations;
- country borders;
- final Earth design;
- atmosphere;
- camera flights;
- labels;
- country selection;
- real globe API;
- database;
- final mobile tuning;
- final loading system.

That is normal.

The point of Phase 1 is to make the small core easy to understand before adding more.

---

# 3. Current files

~~~text
globe-v2/
|
|-- README.md
|-- package.json
|-- package-lock.json
|-- vite.config.js
|-- index.html
|
└-- src/
    |
    |-- main.jsx
    |-- App.jsx
    |-- styles.css
    |
    └-- globe/
        |-- Globe.jsx
        |-- campuses.js
        └-- geo.js
~~~

Simple meaning:

~~~text
main.jsx
   |
   v
starts React
   |
   v
App.jsx
   |
   +-- normal page UI
   |
   +-- selected campus state
   |
   v
Globe.jsx
   |
   +-- Three.js scene
   +-- camera
   +-- renderer
   +-- Earth
   +-- campus markers
   +-- controls
   +-- click system
   |
   +-- campuses.js
   |      |
   |      └-- campus names and coordinates
   |
   └-- geo.js
          |
          └-- latitude/longitude -> x/y/z
~~~

---

# 4. The whole globe in one picture

~~~text
                 USER
                  |
          drag / zoom / click
                  |
                  v
              React page
                  |
                  v
             Globe.jsx
                  |
      +-----------+-----------+
      |           |           |
      v           v           v
    Scene       Camera     Renderer
      |
      +-- Earth mesh
      |
      +-- campus markers
      |
      +-- lights
      |
      +-- future atmosphere
                  |
                  v
             Browser WebGL
                  |
                  v
                 GPU
~~~

React controls the page.

Three.js controls the 3D world.

The browser uses WebGL under Three.js.

The GPU draws the final image.

---

# 5. What Three.js is doing for us

Without Three.js we would have to work much closer to raw WebGL.

That would mean much more setup and much more graphics math.

Three.js gives us simple objects like:

~~~js
const scene = new THREE.Scene();
~~~

Meaning:

> Create the 3D world.

Then:

~~~js
const camera = new THREE.PerspectiveCamera(...);
~~~

Meaning:

> Create the eyes that look at the world.

Then:

~~~js
const renderer = new THREE.WebGLRenderer(...);
~~~

Meaning:

> Create the thing that draws the world.

Then:

~~~js
const geometry = new THREE.SphereGeometry(...);
~~~

Meaning:

> Create the shape of a sphere.

Then:

~~~js
const material = new THREE.MeshStandardMaterial(...);
~~~

Meaning:

> Decide how the sphere surface looks.

Then:

~~~js
const earth = new THREE.Mesh(geometry, material);
~~~

Meaning:

~~~text
shape + appearance = visible 3D object
~~~

Then:

~~~js
scene.add(earth);
~~~

Meaning:

> Put Earth inside the 3D world.

---

# 6. The main Three.js words I need to know

## Scene

The scene is the 3D world.

~~~text
Scene
|
|-- Earth
|-- markers
|-- lights
└-- future effects
~~~

Code:

~~~js
const scene = new THREE.Scene();
~~~

---

## Camera

The camera is our viewpoint.

The Earth can exist in the scene, but if the camera is looking somewhere else we will not see it.

Example:

~~~js
const camera = new THREE.PerspectiveCamera(
  42,
  1,
  0.1,
  100
);

camera.position.set(0, 0, 3.2);
~~~

Basic meaning:

~~~text
42      = field of view
1       = width / height ratio for now
0.1     = nearest visible distance
100     = farthest visible distance
~~~

The camera starts at:

~~~text
x = 0
y = 0
z = 3.2
~~~

The Earth is around the center:

~~~text
x = 0
y = 0
z = 0
~~~

So the camera is sitting in front of it.

---

## Renderer

The renderer turns the scene into pixels.

~~~js
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
~~~

Simple meaning:

~~~text
Scene + Camera
      |
      v
   Renderer
      |
      v
   screen pixels
~~~

---

## Geometry

Geometry is only the shape.

For Earth:

~~~js
new THREE.SphereGeometry(1, 64, 64)
~~~

The first number is the radius.

~~~text
radius = 1
~~~

The other numbers control how many pieces are used to make the sphere look smooth.

More pieces can look smoother, but also create more work.

---

## Material

Material controls how a mesh surface looks.

Example:

~~~js
new THREE.MeshStandardMaterial({
  color: 0x102c38,
  roughness: 0.82,
  metalness: 0.05
});
~~~

This can control things like:

- color;
- roughness;
- metal look;
- textures;
- transparency.

---

## Mesh

A mesh is:

~~~text
Geometry + Material
~~~

Example:

~~~js
const earth = new THREE.Mesh(
  earthGeometry,
  earthMaterial
);
~~~

---

## Vector3

A Vector3 is one of the most important things for us.

~~~js
new THREE.Vector3(x, y, z)
~~~

It stores a position or direction in 3D.

Example:

~~~js
new THREE.Vector3(1, 2, 3)
~~~

means:

~~~text
x = 1
y = 2
z = 3
~~~

We will use Vector3 for:

- campus positions;
- camera positions;
- movement direction;
- camera targets;
- distance calculations.

---

# 7. Understanding x, y and z

In our 3D world:

~~~text
          +y
           |
           |
           |
           O------ +x
          /
         /
       +z
~~~

Simple idea:

~~~text
x = left / right
y = up / down
z = forward / backward
~~~

Earth is centered around:

~~~text
(0, 0, 0)
~~~

A campus marker must be placed somewhere around that sphere.

But our campus data does not start as x/y/z.

It starts like this:

~~~text
42 Mulhouse

latitude  = 47.750077
longitude = 7.329914
~~~

So we need to convert:

~~~text
latitude + longitude
        |
        v
      math
        |
        v
     x / y / z
~~~

That is what `geo.js` does.

---

# 8. The small amount of math we need

We do **not** need advanced math.

The useful parts are:

- degrees;
- radians;
- sine;
- cosine;
- vectors;
- distance;
- normalize;
- lerp;
- later, dot product.

We do not need to calculate everything by hand every time.

Three.js does most of the work.

But I still need to understand what the calculations mean.

---

# 9. Degrees and radians

Campus coordinates are normally written in degrees.

Example:

~~~text
latitude = 47.75 degrees
~~~

JavaScript `Math.sin()` and `Math.cos()` work with radians.

Important relationships:

~~~text
180 degrees = PI radians
360 degrees = 2 * PI radians
90 degrees  = PI / 2 radians
~~~

Formula:

~~~text
radians = degrees * PI / 180
~~~

For Mulhouse latitude:

~~~text
47.750077 * PI / 180
≈ 0.8334 radians
~~~

For Mulhouse longitude:

~~~text
7.329914 * PI / 180
≈ 0.1279 radians
~~~

We do not need to type that formula ourselves because Three.js gives us:

~~~js
THREE.MathUtils.degToRad(latitude);
~~~

and:

~~~js
THREE.MathUtils.degToRad(longitude);
~~~

So:

~~~js
const lat = THREE.MathUtils.degToRad(latitude);
const lng = THREE.MathUtils.degToRad(longitude);
~~~

---

# 10. Why sine and cosine appear

Start with a simple 2D circle.

~~~text
             point
               *
             / |
           /   |
         /     |
        O------+
~~~

If we know:

- the radius;
- the angle;

we can calculate where the point is around the circle.

A common simple form is:

~~~text
x = radius * cos(angle)
y = radius * sin(angle)
~~~

A globe is a sphere, so we need one more direction.

Instead of:

~~~text
x
y
~~~

we need:

~~~text
x
y
z
~~~

Latitude controls how high or low the point is.

Longitude controls how far around the Earth the point is.

---

# 11. Our latitude/longitude conversion

Our helper is:

~~~js
export function latLngToVector3(longitude, latitude, radius = 1) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lng = THREE.MathUtils.degToRad(longitude);

  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lng),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lng)
  );
}
~~~

Break it down.

First:

~~~js
const lat = THREE.MathUtils.degToRad(latitude);
~~~

Convert latitude from degrees to radians.

Then:

~~~js
const lng = THREE.MathUtils.degToRad(longitude);
~~~

Convert longitude from degrees to radians.

Then calculate x:

~~~js
radius * Math.cos(lat) * Math.sin(lng)
~~~

Then y:

~~~js
radius * Math.sin(lat)
~~~

Then z:

~~~js
radius * Math.cos(lat) * Math.cos(lng)
~~~

Finally:

~~~js
new THREE.Vector3(x, y, z)
~~~

Now Three.js has a real 3D position.

---

# 12. Mulhouse calculation example

Our current Mulhouse data is:

~~~text
longitude = 7.329914
latitude  = 47.750077
~~~

Our campus marker radius is currently around:

~~~text
radius = 1.025
~~~

Earth radius is:

~~~text
1.0
~~~

The marker radius is a little larger so the marker sits just above the Earth.

First convert degrees to radians:

~~~text
latitude:
47.750077 degrees
≈ 0.8334 radians

longitude:
7.329914 degrees
≈ 0.1279 radians
~~~

Now use the formulas.

### x

~~~text
x =
1.025
* cos(0.8334)
* sin(0.1279)

≈ 0.0879
~~~

### y

~~~text
y =
1.025
* sin(0.8334)

≈ 0.7587
~~~

### z

~~~text
z =
1.025
* cos(0.8334)
* cos(0.1279)

≈ 0.6835
~~~

So Mulhouse is roughly:

~~~text
Vector3(
  0.0879,
  0.7587,
  0.6835
)
~~~

We can check the point is still on our radius.

Formula:

~~~text
length = sqrt(x² + y² + z²)
~~~

Using the numbers:

~~~text
sqrt(
  0.0879²
  + 0.7587²
  + 0.6835²
)

≈ 1.025
~~~

That matches our marker radius.

So the conversion makes sense.

Important:

We do **not** need to calculate every campus by hand.

The function does it.

This example exists so I understand what the function is doing.

---

# 13. Why marker radius is 1.025 and not 1

Earth radius:

~~~text
1.000
~~~

Marker position radius:

~~~text
1.025
~~~

Difference:

~~~text
1.025 - 1.000 = 0.025
~~~

So the marker center sits slightly above the sphere surface.

Simple picture:

~~~text
        marker
          *
          |
          | small gap / marker height
       .-----.
     .'       '.
    /   Earth   \
~~~

If we put the marker too deep, part of it can disappear inside Earth.

If we put it too far out, it looks like it is floating.

This value can be tuned later.

---

# 14. Campus data

Right now we have sample data in `campuses.js`.

The idea is simple:

~~~js
{
  id: "mulhouse",
  name: "42 Mulhouse",
  country: "France",
  coordinates: [7.329914, 47.750077]
}
~~~

Important order:

~~~text
[longitude, latitude]
~~~

Not:

~~~text
[latitude, longitude]
~~~

Mixing those two is a very common bug.

If a campus appears in the wrong place, this is one of the first things to check.

---

# 15. Pseudocode for placing campuses

Pseudocode means explaining the logic without worrying about exact JavaScript syntax.

~~~text
FOR every campus

    read longitude
    read latitude

    convert longitude to radians
    convert latitude to radians

    calculate x
    calculate y
    calculate z

    create a 3D position

    move one marker to that position

END
~~~

Current code does this with Three.js matrices and an InstancedMesh.

---

# 16. Why we use InstancedMesh

We could create 58 different marker objects.

Like:

~~~text
marker 1
marker 2
marker 3
marker 4
...
marker 58
~~~

That would still probably work because 58 is not a huge number.

But Three.js has a better way when many objects share:

- the same shape;
- the same material.

That is `InstancedMesh`.

Think:

~~~text
one marker shape
one marker material
       |
       v
draw it many times
at different positions
~~~

So:

~~~text
one InstancedMesh
      |
      +-- instance 0 = Mulhouse
      +-- instance 1 = Paris
      +-- instance 2 = Tokyo
      +-- ...
~~~

This reduces extra objects and is good practice.

---

# 17. Pseudocode for InstancedMesh

~~~text
create marker geometry

create marker material

create InstancedMesh with:
    geometry
    material
    number of campuses

FOR every campus

    calculate campus x/y/z

    create a temporary object

    move temporary object to x/y/z

    update its matrix

    copy that matrix into the correct instance

END

tell Three.js:
the instance matrices changed
~~~

The temporary object helps us build the position matrix.

The final visible markers still live inside one InstancedMesh.

---

# 18. OrbitControls

OrbitControls lets the user move around the globe.

It handles things like:

~~~text
mouse drag
touch drag
zoom
~~~

Basic setup:

~~~js
const controls = new OrbitControls(
  camera,
  renderer.domElement
);
~~~

Meaning:

~~~text
camera
   |
controlled by
   |
mouse/touch events on the canvas
~~~

Current useful settings include:

~~~js
controls.enablePan = false;
~~~

We do not want the user dragging the whole scene sideways.

We mainly want rotation and zoom.

Then:

~~~js
controls.minDistance = 2.1;
controls.maxDistance = 4.4;
~~~

This stops the user from:

- zooming inside Earth;
- zooming so far away that Earth becomes tiny.

---

# 19. Camera distance

Earth radius is:

~~~text
1
~~~

Camera starts around:

~~~text
z = 3.2
~~~

So the camera is safely outside the sphere.

We can think:

~~~text
camera distance ≈ 3.2
earth radius    = 1.0
~~~

The exact visible size also depends on the field of view.

That is why camera tuning is mostly:

- test;
- look;
- adjust;
- test again.

We do not need to solve a giant formula every time.

---

# 20. Clicking a campus

The browser gives a click in pixels.

Example:

~~~text
mouse x = 700 pixels
mouse y = 350 pixels
~~~

Three.js raycasting uses a different coordinate range.

It expects:

~~~text
x from -1 to +1
y from -1 to +1
~~~

So we convert the mouse position.

Current style:

~~~js
pointer.x =
  ((event.clientX - rect.left) / rect.width) * 2 - 1;

pointer.y =
  -((event.clientY - rect.top) / rect.height) * 2 + 1;
~~~

This looks ugly at first.

Break it down.

---

# 21. Mouse x calculation

Imagine the canvas is:

~~~text
width = 1000 px
~~~

The user clicks in the middle:

~~~text
x = 500 px
~~~

First:

~~~text
500 / 1000 = 0.5
~~~

Now we have a value from:

~~~text
0 to 1
~~~

But Three.js wants:

~~~text
-1 to +1
~~~

So:

~~~text
0.5 * 2 = 1
1 - 1 = 0
~~~

Result:

~~~text
x = 0
~~~

That is the middle.

Left edge:

~~~text
0 / 1000 = 0
0 * 2 - 1 = -1
~~~

Right edge:

~~~text
1000 / 1000 = 1
1 * 2 - 1 = +1
~~~

So:

~~~text
left   = -1
middle = 0
right  = +1
~~~

---

# 22. Why mouse y has a minus sign

Browser coordinates normally start at the top.

~~~text
browser:

0
|
|
v
positive y
~~~

Three.js screen coordinates use the opposite direction.

~~~text
Three.js:

positive y
^
|
|
0
~~~

So we flip it with:

~~~js
-
~~~

That is why y has a minus sign.

---

# 23. What Raycaster does

After we have the mouse position:

~~~js
raycaster.setFromCamera(pointer, camera);
~~~

Think:

~~~text
camera
             invisible line
             * campus marker
                 Earth
~~~

Then:

~~~js
raycaster.intersectObject(markers);
~~~

Meaning:

> Tell me what this invisible line hit.

Because our markers use InstancedMesh, Three.js can also tell us:

~~~text
instanceId
~~~

Example:

~~~text
instanceId = 0
~~~

may mean:

~~~text
campuses[0] = Mulhouse
~~~

Then React can receive that campus.

---

# 24. Pseudocode for campus click

~~~text
WHEN user clicks

    get canvas position

    convert mouse x to -1 ... +1
    convert mouse y to -1 ... +1

    create ray from camera through mouse position

    check marker intersections

    IF no marker was hit
        do nothing
    END

    get instanceId

    find campus using instanceId

    call onCampusSelect(campus)

END
~~~

That is the full idea.

---

# 25. React's job

Three.js should not control the whole website.

Three.js should control the 3D part.

React should control normal app state.

Example:

~~~jsx
const [selectedCampus, setSelectedCampus] = useState(null);
~~~

Meaning:

~~~text
selectedCampus starts as nothing
~~~

Then:

~~~jsx
<Globe onCampusSelect={setSelectedCampus} />
~~~

Meaning:

> Globe, when somebody selects a campus, give it back to React.

Then React can show:

~~~text
42 Mulhouse
France
~~~

in a normal HTML card.

Simple split:

~~~text
Three.js
"What did the user click?"

        |
        v

React
"What should the website show now?"
~~~

---

# 26. Why useRef is useful

React normally works with HTML elements.

Three.js needs a place to attach its canvas.

Example idea:

~~~jsx
const hostRef = useRef(null);
~~~

Then:

~~~jsx
<div ref={hostRef} />
~~~

Now React gives us access to that real HTML element.

Then Three.js can attach its renderer canvas there.

Pseudocode:

~~~text
React creates div

useRef remembers that div

Three.js creates canvas

put Three.js canvas inside the div
~~~

---

# 27. Why useEffect is useful

We do not want to create the Three.js scene on every React render.

We want something closer to:

~~~text
component starts
      |
      v
create Three.js once
      |
      v
use it
      |
      v
component closes
      |
      v
clean everything
~~~

That fits `useEffect`.

Basic idea:

~~~js
useEffect(() => {

  // create globe

  return () => {
    // clean globe
  };

}, []);
~~~

The empty array means the effect is tied to the component life instead of normal state changes.

---

# 28. Cleanup is important

Three.js creates things outside normal React HTML.

Examples:

- geometry;
- materials;
- renderer;
- controls;
- event listeners;
- ResizeObserver;
- GPU resources.

If we create them and never clean them:

~~~text
open globe
close globe
open globe
close globe
open globe
close globe

memory keeps growing
~~~

So we clean them.

Examples:

~~~js
controls.dispose();
markerGeometry.dispose();
markerMaterial.dispose();
earth.geometry.dispose();
earth.material.dispose();
renderer.dispose();
~~~

Also remove listeners and observers.

A good question during debugging is:

> Did I create something that I forgot to destroy?

---

# 29. Resize handling

The user can:

- resize desktop browser;
- rotate phone;
- open side panels;
- use different screen sizes.

So the canvas size can change.

When width or height changes we need to update:

~~~text
camera aspect ratio
renderer size
~~~

Basic formula:

~~~text
aspect = width / height
~~~

Example:

~~~text
width  = 1200
height = 800

aspect = 1200 / 800
       = 1.5
~~~

Then:

~~~js
camera.aspect = width / height;
camera.updateProjectionMatrix();
renderer.setSize(width, height, false);
~~~

If we forget this, the globe can look stretched.

---

# 30. Device pixel ratio

Phones can have very high pixel density.

For example:

~~~text
CSS size:
400 x 800

devicePixelRatio:
3
~~~

A renderer could try to draw roughly:

~~~text
1200 x 2400
~~~

real pixels.

That is much more work.

So we cap it.

Current idea:

~~~js
Math.min(
  window.devicePixelRatio || 1,
  mobile ? 1.5 : 2
);
~~~

Meaning:

~~~text
phone max DPR   = 1.5
desktop max DPR = 2
~~~

This can save a lot of GPU work.

The globe may look almost the same but run better.

---

# 31. Render only when needed

A common 3D app uses:

~~~js
requestAnimationFrame(loop);
~~~

forever.

That means:

~~~text
draw
draw
draw
draw
draw
draw
...
~~~

possibly 60 times every second.

But our globe does not always move.

If the user is just reading a campus card, there is no reason to redraw the exact same Earth 60 times every second.

Current Phase 1 idea:

~~~text
initial load
   |
   v
render once

user rotates
   |
   v
render

user zooms
   |
   v
render

screen resizes
   |
   v
render
~~~

This is good for:

- battery;
- phone heat;
- GPU usage.

Later, camera flights or marker animations may need a temporary animation loop.

Then the rule can be:

~~~text
animation active?
    YES -> render frames

animation finished?
    YES -> stop continuous rendering
~~~

---

# 32. Future camera flight

Right now OrbitControls gives us basic movement.

Later we want something nicer.

Example:

~~~text
world view
   |
click Mulhouse
   |
   v
turn toward Mulhouse
   |
   v
move closer
   |
   v
stop
~~~

We should not teleport the camera.

Bad feeling:

~~~text
world
BAM
Mulhouse
~~~

Better:

~~~text
world
  -> rotate
     -> move closer
        -> slow down
           -> Mulhouse
~~~

---

# 33. Lerp

One useful idea is `lerp`.

Lerp means moving between a start and end value.

Imagine:

~~~text
A--------------------B
~~~

We use a number `t`:

~~~text
t = 0.0 -> A
t = 0.5 -> middle
t = 1.0 -> B
~~~

Simple formula:

~~~text
result = start + (end - start) * t
~~~

Example:

~~~text
start = 10
end   = 20
t     = 0.5

result =
10 + (20 - 10) * 0.5

= 10 + 5
= 15
~~~

Three.js can do this for vectors.

Example idea:

~~~js
position.lerp(target, t);
~~~

We will use this carefully for camera movement.

---

# 34. Easing

Plain lerp over time can feel robotic.

We want:

~~~text
start slowly
speed up
slow down near the end
~~~

That is called easing.

Simple picture:

~~~text
time:

start                   end
|-------------------------|

movement:

slow -> faster -> slow
~~~

We can start with a small easing formula later.

The important thing is understanding the goal before the formula.

---

# 35. Camera target from a campus point

Suppose a campus is at:

~~~text
P = campus Vector3
~~~

That vector points from Earth's center toward the campus.

If we want the camera to sit outside Earth in the same direction, we can use that direction and make it longer.

Simple idea:

~~~text
Earth center
     O
                     * campus
                              C camera target position
~~~

If campus vector length is near:

~~~text
1.025
~~~

we may place camera farther on the same direction, for example around:

~~~text
2.5
or
3.0
~~~

The exact value will be tested.

Pseudocode:

~~~text
campusDirection = campusPosition normalized

cameraDestination =
    campusDirection * wantedCameraDistance
~~~

---

# 36. Normalize

Normalize means:

> Keep the direction, but make the vector length equal to 1.

Example:

~~~text
vector:
(10, 0, 0)

length = 10

normalized:
(1, 0, 0)

length = 1
~~~

Same direction.

Different length.

This is useful because then we can choose our own distance:

~~~text
direction * 3
~~~

becomes a point 3 units from the center in that direction.

---

# 37. Distance between points

Three.js can calculate distance for us.

Concept:

~~~text
camera *----------------* campus
              distance
~~~

This helps when deciding:

- how far camera is from Earth;
- when an animation is almost finished;
- how close the user can zoom.

We do not need to manually calculate every distance.

But the normal 3D distance formula is:

~~~text
distance =
sqrt(
  (x2 - x1)^2
  +
  (y2 - y1)^2
  +
  (z2 - z1)^2
)
~~~

Three.js has helpers for this.

---

# 38. Front side and back side

Later we may show campus labels.

Example:

~~~text
          camera
            *
            |
            |
         Paris *
       .---------.
     .'           '.
    /     Earth     \
   |                 |
    \               /
     '.           .'
       '---------'
           * Tokyo
~~~

If Tokyo is behind Earth, we should not show a floating HTML label through the planet.

We need to know:

~~~text
is campus facing camera?
~~~

One tool for that is the dot product.

We do not need it in the first phase.

We can learn it when labels need it.

---

# 39. Dot product in simple words

A dot product helps compare two directions.

Very simple idea:

~~~text
same direction
   -> positive

90 degree angle
   -> around zero

opposite direction
   -> negative
~~~

That can help us decide whether a point is on the visible side of the globe.

We will not add it just because it sounds advanced.

We add it when we actually need it.

---

# 40. Country borders

Country borders are visual data.

The goal is not to run a full street map engine.

A simple approach can be:

~~~text
small world border data
        |
        v
convert lines to globe positions
        |
        v
draw lines slightly above Earth
~~~

Similar to campus points:

~~~text
longitude + latitude
        |
        v
      x/y/z
~~~

But instead of one point, a border contains many points.

Example:

~~~text
point 1
point 2
point 3
point 4
...
~~~

We connect them into a line.

The main danger is using world data that is too detailed.

We want enough detail to look good, not millions of points.

---

# 41. Earth texture vs country lines

We have a few possible visual styles.

## Option A — texture

~~~text
sphere
  +
Earth image texture
~~~

Easy to understand visually.

Can look realistic.

Need to keep image size reasonable.

## Option B — country border lines

~~~text
dark sphere
  +
simple country outlines
~~~

Can fit the Horizon design better.

## Option C — both

~~~text
subtle Earth texture
  +
light border lines
~~~

We should test performance before adding too much.

---

# 42. Atmosphere

A simple atmosphere can make the globe look much better.

Idea:

~~~text
outer transparent sphere
        +
soft glow material
~~~

But this is polish.

Order should be:

~~~text
working globe
   |
   v
correct campuses
   |
   v
good controls
   |
   v
camera
   |
   v
performance
   |
   v
atmosphere
~~~

Not the other way around.

---

# 43. The small globe backend

The globe does not need a huge backend just to draw Earth.

The first version can even use local campus JSON.

Later a small API can return campus information.

Simple flow:

~~~text
Three.js / React
      |
      | GET /api/globe/campuses
      v
globe backend
      |
      v
campus data
~~~

The backend should return normal world data.

Example:

~~~json
[
  {
    "id": "mulhouse",
    "name": "42 Mulhouse",
    "country": "France",
    "countryCode": "FR",
    "latitude": 47.750077,
    "longitude": 7.329914
  }
]
~~~

The backend should **not** return:

~~~text
x
y
z
~~~

Why?

Because x/y/z belong to how the frontend draws the globe.

The backend should know:

~~~text
where the campus is on Earth
~~~

The frontend should know:

~~~text
how that Earth position becomes a Three.js position
~~~

---

# 44. Possible globe API

Later, simple endpoints could be:

~~~text
GET /api/globe/campuses

GET /api/globe/campuses/:id

GET /api/globe/countries
~~~

Maybe:

~~~text
GET /api/globe/countries/FR/campuses
~~~

if we actually need it.

Do not create endpoints just to have more endpoints.

---

# 45. Backend pseudocode

~~~text
WHEN frontend asks for /api/globe/campuses

    backend receives GET request

    service gets campus data

    return:
        id
        name
        country
        latitude
        longitude

    send JSON response

END
~~~

Then frontend:

~~~text
request campus data

wait for response

convert JSON response to JavaScript objects

FOR every campus
    convert lat/lng to x/y/z
    place marker
END
~~~

---

# 46. Frontend fetch pseudocode

~~~text
start request to /api/globe/campuses

IF request fails
    show safe fallback or error
    stop
END

read JSON

validate needed fields

save campus list

build marker positions
~~~

Possible JavaScript shape later:

~~~js
const response = await fetch("/api/globe/campuses");

if (!response.ok) {
  throw new Error("Could not load campuses");
}

const campuses = await response.json();
~~~

We do not need this in Phase 1 while our data is local.

---

# 47. Loading globe data during login

Public globe data can start loading while the user is on the entry/login screen.

Example:

~~~text
APP OPENS
   |
   +--------------------------+
   |                          |
   v                          v
show login              start globe load
                           |
                           +-- campus data
                           +-- Earth texture
                           +-- border data
                           +-- Three.js code
   |                          |
   v                          v
login success             ready
   |                          |
   +------------+-------------+
                |
                v
            show globe
~~~

Important:

Only public globe data should preload before login.

Private user data should still wait for authentication.

---

# 48. We should not preload everything

Good preload:

- small Earth asset;
- campus locations;
- small country border file;
- Three.js code needed for the globe.

Bad preload:

- every campus photo;
- every project;
- every profile;
- every city map;
- every possible future page.

Goal:

~~~text
small useful preload
not
download the whole website
~~~

---

# 49. What can go wrong?

## Globe is black

Check:

~~~text
Is renderer attached?
Is camera pointing correctly?
Is Earth inside camera range?
Does material need lights?
Did WebGL fail?
~~~

---

## Earth is stretched

Check:

~~~text
camera.aspect
camera.updateProjectionMatrix()
renderer size
~~~

---

## Campus is in the wrong country

Check:

~~~text
latitude / longitude order
longitude sign
latitude sign
globe rotation/orientation
data itself
~~~

Very common bug:

~~~text
[lat, lng]
~~~

used where code expects:

~~~text
[lng, lat]
~~~

---

## Campus is inside Earth

Check marker radius.

~~~text
Earth radius  = 1.0
marker radius > 1.0
~~~

---

## Click selects wrong campus

Check:

~~~text
mouse coordinate conversion
canvas bounding rectangle
instanceId
campuses array order
marker instance order
~~~

Important rule:

~~~text
instance 0 must still match campuses[0]
instance 1 must still match campuses[1]
...
~~~

---

## Click works until browser resizes

Check:

~~~text
renderer size
camera aspect
canvas rect
resize observer
~~~

---

## Phone is slow

Check:

~~~text
device pixel ratio
texture size
number of draw calls
continuous render loop
post-processing
too many labels
too many border points
~~~

Do not immediately blame Three.js.

Measure first.

---

## Memory keeps growing

Check:

~~~text
event listeners
ResizeObserver
geometry.dispose()
material.dispose()
renderer.dispose()
controls.dispose()
animation frame cancellation
~~~

---

# 50. Debugging with simple tools

## Console

Use logs for values.

Example:

~~~js
console.log(campus);
console.log(position);
console.log(intersections);
~~~

Do not leave hundreds of logs forever.

Use them to answer a question.

Example:

> Did the click return the campus I expected?

---

## Browser Network tab

Useful when backend/API arrives.

Check:

~~~text
Was request sent?
What URL?
What status?
How long?
What JSON came back?
~~~

---

## Browser Performance tab

Useful for:

~~~text
frame time
long tasks
CPU work
rendering problems
~~~

---

## Browser Memory tools

Useful if:

~~~text
open / close globe repeatedly
and memory keeps increasing
~~~

---

# 51. Debug one layer at a time

Do not debug the whole globe at once.

Bad:

~~~text
"globe is broken"
~~~

Better:

~~~text
Does the scene exist?
      |
      yes
      v
Does Earth render?
      |
      yes
      v
Does camera move?
      |
      yes
      v
Do markers render?
      |
      yes
      v
Are marker positions correct?
      |
      yes
      v
Does raycaster hit?
      |
      yes
      v
Does React receive selected campus?
~~~

This makes bugs much easier.

---

# 52. Useful temporary debug tricks

If markers are hard to see:

~~~text
make them bigger
~~~

If Earth orientation is unclear:

~~~text
add a temporary axis helper
~~~

If raycasting is unclear:

~~~text
log intersections
~~~

If camera target is unclear:

~~~text
place a temporary visible debug object there
~~~

If one campus is wrong:

~~~text
test only that campus
~~~

Debug code does not have to look beautiful.

It only has to answer a question.

Then remove it.

---

# 53. Performance target

We only have around the number of campuses in the 42 Network, not millions of objects.

So the base globe should be light.

A simple scene could be:

~~~text
1 Earth mesh
1 InstancedMesh for campus markers
a few lights
1 camera
1 renderer
some border lines
~~~

That is not a crazy 3D scene.

Most performance problems would probably come from adding unnecessary things such as:

- huge textures;
- too much post-processing;
- too many HTML labels;
- large border files;
- constant rendering;
- too high DPR;
- many transparent layers;
- too many animated effects.

---

# 54. Mobile rules

The globe must be tested on a real phone.

Not only Chrome desktop mobile mode.

Things to check:

~~~text
Can I rotate with one finger?
Can I zoom without fighting the page?
Can I tap a campus?
Are markers large enough?
Does the phone become hot?
Does it stay smooth?
Does rotating the phone break the canvas?
~~~

We should test mobile early, not after the whole globe is finished.

---

# 55. Accessibility and reduced motion

Some users do not want large camera animations.

Browsers can expose:

~~~text
prefers-reduced-motion
~~~

Later we can respect that.

Example idea:

~~~text
normal motion:
smooth 1 second camera flight

reduced motion:
short movement or direct change
~~~

Also, globe search or a campus list can give users another way to select a campus without needing perfect 3D control.

---

# 56. Learning phase 1 — JavaScript needed for the globe

Before making the globe bigger, be comfortable with:

~~~text
const
let

functions
arrow functions

objects
arrays

forEach
map

import
export

async
await
~~~

Example:

~~~js
campuses.forEach((campus, index) => {
  console.log(index, campus.name);
});
~~~

I should understand:

~~~text
campuses
forEach
campus
index
arrow function
~~~

---

# 57. Learning phase 2 — React needed for the globe

Learn only what we use:

~~~text
component
props
useState
useEffect
useRef
~~~

I do not need to learn all of React before touching Three.js.

Goal:

I should understand this flow:

~~~text
App owns selectedCampus

App gives callback to Globe

Globe detects click

Globe calls callback

App updates selectedCampus

React shows campus information
~~~

---

# 58. Learning phase 3 — Three.js basics

Be able to explain:

~~~text
Scene
Camera
Renderer
Geometry
Material
Mesh
Light
Vector3
~~~

Small exercise:

~~~text
1. Create empty scene.
2. Create camera.
3. Create renderer.
4. Create one sphere.
5. Add light.
6. Render.
~~~

If I cannot explain that small scene, do not add country borders yet.

---

# 59. Learning phase 4 — coordinates

Understand:

~~~text
x
y
z

latitude
longitude

degrees
radians

sin
cos
~~~

Main exercise:

Take Mulhouse.

Explain how:

~~~text
7.329914, 47.750077
~~~

becomes roughly:

~~~text
0.0879, 0.7587, 0.6835
~~~

at radius 1.025.

I do not need to memorize the result.

I need to understand the steps.

---

# 60. Learning phase 5 — controls

Understand:

~~~text
OrbitControls
camera
target
minDistance
maxDistance
change event
~~~

Test:

~~~text
remove controls
see what stops working

add controls back
change minDistance
change maxDistance
~~~

This helps understand the code instead of memorizing it.

---

# 61. Learning phase 6 — Raycaster

Understand:

~~~text
browser click
      |
      v
normalized mouse position
      |
      v
ray from camera
      |
      v
marker intersection
      |
      v
instanceId
      |
      v
campus
~~~

Exercise:

Log:

~~~text
pointer x/y
intersection
instanceId
campus name
~~~

Then click different markers.

---

# 62. Learning phase 7 — camera flight

Learn:

~~~text
Vector3
normalize
multiply by distance
lerp
time
easing
~~~

Build it in a small way first.

Do not mix:

- country selection;
- labels;
- effects;
- API;
- camera flight;

all in one commit.

---

# 63. Learning phase 8 — globe API

Only after the local globe is understood.

Learn:

~~~text
GET
JSON
fetch
response.ok
async/await
basic error handling
~~~

Then replace:

~~~text
local campuses.js
~~~

with something like:

~~~text
GET /api/globe/campuses
~~~

if the team actually needs dynamic data.

---

# 64. Learning phase 9 — backend basics

For the globe backend only, understand:

~~~text
route
controller
service
response
JSON
~~~

Possible future flow:

~~~text
GET /api/globe/campuses
        |
        v
GlobeController
        |
        v
GlobeService
        |
        v
campus data
        |
        v
JSON response
~~~

We do not need a complicated backend just to prove the globe works.

---

# 65. Learning phase 10 — profile and polish

Only after function is correct.

Check:

~~~text
desktop
phone
touch
FPS/frame time
memory
DPR
asset sizes
~~~

Then add visual polish.

Possible order:

~~~text
country borders
Earth surface
better lighting
atmosphere
marker style
selected marker effect
labels
camera polish
~~~

---

# 66. Suggested build order

This is the order I want to follow.

~~~text
PHASE 1
simple sphere
6 campuses
controls
click
        |
        v
PHASE 2
understand every current line
        |
        v
PHASE 3
all campus data
        |
        v
PHASE 4
country/world outlines
        |
        v
PHASE 5
camera flight
        |
        v
PHASE 6
selected campus state
better marker feedback
        |
        v
PHASE 7
mobile test and performance
        |
        v
PHASE 8
visual polish
        |
        v
PHASE 9
optional globe API
        |
        v
PHASE 10
final cleanup and evaluation practice
~~~

---

# 67. Things we should avoid

Do not turn the globe into a giant file.

Bad:

~~~text
Globe.jsx
3000 lines
everything inside
~~~

Better later:

~~~text
globe/
|
|-- Globe.jsx
|-- geo.js
|-- campuses.js
|-- camera.js
|-- markers.js
|-- interaction.js
└-- maybe loaders.js
~~~

But also do not split every five lines into a new file.

Split when one part has a clear job.

---

# 68. Keep jobs separate

Good mental split:

~~~text
geo.js
"Where is this campus in 3D?"

markers.js
"How do markers get created?"

interaction.js
"What did the user click?"

camera.js
"Where should camera move?"

Globe.jsx
"Connect the globe pieces together."
~~~

We may not need all these files immediately.

This is the direction if Globe.jsx becomes too large.

---

# 69. Naming matters

Bad names:

~~~js
a
b
tmp2
thing
stuff
~~~

Better:

~~~js
campusPosition
cameraTarget
markerMesh
pointer
raycaster
earthRadius
~~~

Simple names make evaluation and debugging easier.

---

# 70. Comments

Comments should explain **why**, not repeat the code.

Bad:

~~~js
// set x to 1
x = 1;
~~~

Better:

~~~js
// Keep markers slightly above the Earth so they do not sink into the sphere.
const markerRadius = 1.025;
~~~

Do not comment every line.

If the code is clear, let the code speak.

---

# 71. Error handling

When API work arrives, never assume everything works.

Think:

~~~text
request succeeds?
    |
   yes
    |
JSON valid?
    |
   yes
    |
needed fields exist?
    |
   yes
    |
render campuses
~~~

If something fails:

~~~text
do not crash the whole page
~~~

We can show a small error or use safe local fallback data depending on the final design.

---

# 72. Data checks

Before using a campus:

~~~text
name exists?
latitude is a number?
longitude is a number?

latitude between -90 and +90?
longitude between -180 and +180?
~~~

Useful ranges:

~~~text
latitude:
-90 to +90

longitude:
-180 to +180
~~~

If data is outside that range, something is wrong.

---

# 73. Common coordinate mistakes

## Mistake 1

~~~text
latitude and longitude swapped
~~~

## Mistake 2

~~~text
negative sign lost
~~~

West longitudes are often negative.

South latitudes are negative.

## Mistake 3

~~~text
degrees passed directly into sin/cos
~~~

We must convert to radians first.

## Mistake 4

~~~text
world texture and coordinate formula use different rotation
~~~

The marker math can be correct but the Earth image can be rotated differently.

Then every campus looks shifted.

Fix the orientation once.

Do not manually change every campus coordinate.

---

# 74. How I should debug wrong globe orientation

Use known places far apart.

For example:

~~~text
Paris
Tokyo
Singapore
Abu Dhabi
~~~

Check:

~~~text
Is Europe where expected?
Is Japan on the right side of Asia?
Is Singapore near the equator?
~~~

If all markers are shifted the same way:

~~~text
probably globe orientation
~~~

If only one marker is wrong:

~~~text
probably data
~~~

---

# 75. Understanding lights

Some materials need lights to be visible.

Current globe uses simple lights like:

~~~text
HemisphereLight
DirectionalLight
~~~

A directional light is similar to light coming strongly from one direction.

Simple picture:

~~~text
LIGHT  ----->  Earth
~~~

A hemisphere light gives softer general light from above/below.

We do not need ten lights.

A small setup is easier to tune and explain.

---

# 76. Why Earth should not be too realistic

The project is about the 42 Network.

The important information is:

~~~text
campuses
selection
movement
campus content
~~~

If Earth has:

- giant clouds;
- very bright cities;
- heavy stars;
- strong bloom;
- too much texture;

then the campus points can become harder to see.

Design goal:

~~~text
Earth supports the information.
Earth does not fight the information.
~~~

---

# 77. Campus marker rules

Markers should be:

- visible;
- easy to click;
- not huge;
- clear on mobile;
- different when selected.

Possible states:

~~~text
normal
hovered
selected
~~~

On mobile there is no real hover.

So click/tap must always work without hover.

---

# 78. Selected campus

Possible simple behavior:

~~~text
normal marker:
small

selected marker:
slightly larger
or brighter
or ring around it
~~~

Avoid ten effects at once.

One clear selected state is enough.

---

# 79. Labels

Do not show 58 big labels all the time.

That would create:

~~~text
Paris
Mulhouse
Madrid
Barcelona
Rome
...
~~~

all overlapping.

Better idea:

~~~text
far away:
dots only

closer:
some labels

selected:
full campus name/card
~~~

This is easier to read and better for performance.

---

# 80. Search and globe can share state

Later a search box can control the same selected campus.

Example:

~~~text
User types:
Mulhouse

      |
      v

React finds Mulhouse
      |
      v

selectedCampus = Mulhouse
      |
      +-- card updates
      |
      └-- globe camera moves to Mulhouse
~~~

The globe should not be the only way to find a campus.

---

# 81. Backend and frontend boundary

A good rule:

## Backend owns

~~~text
campus id
campus name
country
latitude
longitude
public campus information
~~~

## Frontend owns

~~~text
x/y/z
camera position
marker size
marker color
animation
Three.js scene
raycasting
visual state
~~~

Do not put Three.js logic in the backend.

---

# 82. What happens if backend is down?

The globe shell can still load.

Depending on final design we can:

~~~text
show Earth
show loading/error for campuses
retry
~~~

or if campus locations are static enough:

~~~text
keep small location data bundled locally
use backend only for richer campus details
~~~

We will choose based on the final project needs.

---

# 83. Why local campus data is good for learning

For the first phases:

~~~text
campuses.js
~~~

is better than immediately adding:

~~~text
backend
database
API
authentication
~~~

because if a marker is wrong we know the bug is probably in:

~~~text
data
math
Three.js
~~~

not ten different systems.

After the globe works, replacing the data source is much easier.

---

# 84. Git strategy for the globe

Keep changes small.

Good commits:

~~~text
add all campus data

add country outlines

add campus camera movement

fix marker click on mobile

cap globe pixel ratio
~~~

Bad commit:

~~~text
finish globe
~~~

with 40 unrelated changes.

Small commits make debugging much easier.

---

# 85. How to learn a file

For each important file, ask:

~~~text
1. What is this file responsible for?

2. What does it import?

3. What does it create?

4. What data comes in?

5. What data goes out?

6. What events can change it?

7. What must be cleaned up?

8. What breaks if I remove this line?
~~~

That is much better than memorizing code.

---

# 86. How to learn Globe.jsx

Go from top to bottom.

Do not try to understand the whole file in one look.

Suggested order:

~~~text
imports

refs

useEffect

scene

camera

renderer

Earth

lights

markers

controls

resize

raycaster

cleanup
~~~

After each section, stop and explain it in your own words.

---

# 87. Evaluation questions I should be ready for

## What is Three.js?

Simple answer:

> Three.js is the browser 3D library we use to create the scene, camera, renderer, Earth, markers and interactions on top of WebGL.

---

## Why React and Three.js together?

Simple answer:

> React manages the normal website UI and state. Three.js manages the 3D scene.

---

## Why not use raw WebGL?

Simple answer:

> Raw WebGL is much lower level. Three.js gives us useful objects like Scene, Camera, Mesh, Vector3 and Raycaster while still using WebGL underneath.

---

## Why InstancedMesh?

Simple answer:

> All campus markers share the same shape and material, so InstancedMesh lets us draw many copies with different positions without creating a separate full mesh setup for every campus.

---

## How does a campus get placed?

Simple answer:

> We receive latitude and longitude, convert degrees to radians, then use sine and cosine to calculate an x/y/z point on the sphere.

---

## Why convert to radians?

Simple answer:

> JavaScript sine and cosine functions use radians, while normal map coordinates are given in degrees.

---

## How does clicking work?

Simple answer:

> We convert the mouse position to Three.js screen coordinates, send a ray from the camera through that position, check which marker it hits, and use the instance id to find the campus.

---

## Why clean up Three.js objects?

Simple answer:

> Three.js uses browser and GPU resources that React does not automatically free for us, so we dispose them and remove listeners when the globe component closes.

---

## Why cap pixel ratio?

Simple answer:

> High-DPI phones can make the renderer draw far more pixels than needed. A cap keeps the globe sharp enough while reducing GPU work.

---

## Why do we not render forever?

Simple answer:

> If nothing is moving, redrawing the same frame wastes battery and GPU time. We render when something changes, and only use a continuous loop while an animation needs it.

---

# 88. What I should NOT memorize

Do not memorize:

~~~text
every Three.js constructor argument
every sine/cosine value
every campus coordinate
every API method
~~~

Understand:

~~~text
what the object does
why we use it
where the data comes from
where the data goes
how to find the answer when needed
~~~

That is real understanding.

---

# 89. First study checklist

Before Phase 2 work, I should be able to explain:

- [ ] What is a Scene?
- [ ] What is a Camera?
- [ ] What is a Renderer?
- [ ] What is Geometry?
- [ ] What is Material?
- [ ] What is a Mesh?
- [ ] What is Vector3?
- [ ] What are x/y/z?
- [ ] What are latitude and longitude?
- [ ] Why do degrees become radians?
- [ ] Why do we use sin/cos?
- [ ] Why is marker radius slightly bigger than Earth radius?
- [ ] What does OrbitControls do?
- [ ] What does Raycaster do?
- [ ] Why do we use InstancedMesh?
- [ ] Why do we update camera aspect on resize?
- [ ] Why do we cap device pixel ratio?
- [ ] Why do we dispose Three.js resources?

If I cannot explain one item, that is what I should study next.

---

# 90. Second study checklist

Before camera flights:

- [ ] I understand Vector3.
- [ ] I understand vector length.
- [ ] I understand normalize.
- [ ] I understand distance.
- [ ] I understand basic lerp.
- [ ] I can explain start, target and t.
- [ ] I understand why an animation needs repeated frames.
- [ ] I know when to stop the animation loop.

---

# 91. Third study checklist

Before adding backend data:

- [ ] I understand GET.
- [ ] I understand JSON.
- [ ] I understand fetch.
- [ ] I understand async/await.
- [ ] I understand response.ok.
- [ ] I know what happens if a request fails.
- [ ] I know which data belongs to backend.
- [ ] I know x/y/z stays in frontend.

---

# 92. Current run commands

From the repository:

~~~bash
git switch globe-rebuild
cd globe-v2
npm install
npm run dev
~~~

Vite prints a local address.

Open it in the browser.

---

# 93. Test on phone later

When we are ready for real phone testing, Vite can listen on the local network.

Example:

~~~bash
npm run dev -- --host 0.0.0.0
~~~

Then use the computer's local network IP from a phone on the same Wi-Fi.

This is for testing only.

We still need to handle firewall/network setup depending on the machine.

---

# 94. What Phase 1 should look like

Do not expect a final beautiful planet yet.

Current Phase 1 should prove:

~~~text
sphere renders
     |
     v
markers render
     |
     v
drag works
     |
     v
zoom works
     |
     v
campus click works
     |
     v
React receives selection
~~~

If those work, Phase 1 did its job.

---

# 95. What comes next

The next step should not be "add everything".

The next step should be:

~~~text
understand current Globe.jsx line by line
~~~

Then likely:

~~~text
add all campus coordinates
        |
        v
add a lightweight world reference
        |
        v
check orientation
        |
        v
test phone
        |
        v
build camera movement
~~~

Each step should stay understandable.

---

# 96. Final mental model

If I remember only one big picture, remember this:

~~~text
Campus data
longitude + latitude
        |
        v
     geo.js
        |
        v
      x/y/z
        |
        v
Three.js marker
        |
        +-------------------+
        |                   |
        v                   v
  OrbitControls         Raycaster
        |                   |
        v                   v
 move camera          detect campus
        |                   |
        +---------+---------+
                  |
                  v
               React
                  |
                  v
          selected campus UI
~~~

And later:

~~~text
globe backend
      |
      v
latitude / longitude data
      |
      v
frontend
      |
      v
same exact 3D pipeline
~~~

---

# 97. Main rule for this rebuild

Do not add a feature if I cannot explain the part under it.

Build:

~~~text
small
understand
test
debug
commit
repeat
~~~

The final globe can look advanced.

The code underneath should still feel simple enough that I can follow it from campus data all the way to the pixel on the screen.
