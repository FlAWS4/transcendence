# Globe V2 — clean technical spike

This directory is intentionally separate from `site/` and `site-b/`.

Those folders remain design references. **No implementation code is copied from them.**

## Goal

Test whether the 42 Horizon explorer can be rebuilt as a lightweight dedicated 3D visualization of the 42 Network.

The globe is not a street map. Its first responsibility is only:

- render Earth;
- show 42 campus locations;
- support mouse and touch rotation;
- allow a campus marker to be selected;
- remain small enough to profile on mobile early.

## Phase 1

This first spike contains:

- React for UI/state;
- Three.js for the globe;
- one sphere;
- six sample campuses using coordinates from the existing prototype dataset;
- instanced campus markers;
- OrbitControls for mouse/touch rotation;
- capped device pixel ratio;
- rendering only when the view changes.

Not included yet:

- all 58 campuses;
- country borders;
- country selection;
- camera flights;
- backend/API;
- database;
- authentication;
- detailed campus maps;
- final visual design.

## Architecture direction

```text
React UI
   |
   +-- selected campus / future search / navigation
   |
   v
Three.js Globe
   |
   +-- Earth sphere
   +-- campus markers
   +-- camera + interaction

Future:
Frontend ---- HTTPS/JSON ---- Main backend
                              |
                              +-- campus metadata/database
```

The backend should return geographic/domain data such as campus id, name, country, latitude and longitude. It should not calculate Three.js X/Y/Z positions.

## Run

```bash
cd globe-v2
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Next validation

Before expanding this spike:

1. Run it on desktop.
2. Run it on a real phone.
3. Check touch rotation and visual clarity.
4. Profile frame time and memory.
5. Only then import all campus locations and add country borders.
