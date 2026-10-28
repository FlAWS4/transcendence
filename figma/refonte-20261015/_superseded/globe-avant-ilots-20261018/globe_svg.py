#!/usr/bin/env python3
"""Vector globe for the Figma rebuild of 15 October 2026 (read-only on the prototype).

Rebuilds the resting Explorer globe of work/visualizations/horizon-welcome as editable SVG paths, with
the camera, geography, colours and markers of the real page:

* camera: MapLibre GL 5.24, style projection {type:'globe'} = vertical perspective up to zoom 11. The
  sphere has a radius of R = 512 * 2**zoom / (2 pi cos(centre latitude)) px and is seen from a camera
  f = 0.5 / tan(fov / 2) * height = 1.5 * height px above the point at the centre of the canvas
  (fov 0.6435 rad = 36.87 deg). Its disc therefore has a radius R / sqrt(1 + 2R/f): a little smaller
  than an orthographic globe of the same sphere, with the centre magnified (see ../assets/globe/README.md).
* zoom and centre: integrated-globe.mjs (world: centre [6, 18], zoom from --hg-radius; country: centroid
  of its campuses, zoom fitted to the bounds of the part that contains it), --hg-radius from globe-framing.css
  and design-review-selection.css (globe in the free space between the stats line and the status line).
* geography: Natural Earth 1:10m topology of the site (geography/world-countries.topo.json), land =
  union of the 258 countries, borders = the whole TopoJSON mesh (coasts included) like the site.
* colours: globe-style.mjs palettes (world zoom) and the marker styles of the captured DOM.

Outputs (../assets/globe/, documented in its README.md):
    globe-monde--desktop.svg, globe-monde--mobile.svg              world view at rest (1440x960, 390x844)
    globe-pays-france--desktop.svg, globe-pays-france--mobile.svg  country view, France
    globe-medaillon.svg                                            world disc docked in the 32 px filter medallion
    globe-params.json                                              cameras, colours light/dark, sources, measures
    compare-*.png (with --compare)                                 boards against the reference captures
    medaillon-capture/ (with --capture-medallion)                  real docked medallion, x1 and x8

Usage:
    python3 globe_svg.py                      # SVG files and globe-params.json
    python3 globe_svg.py --compare            # also renders the SVGs (Inkscape) and builds the comparison boards
    python3 globe_svg.py --capture-medallion  # one headless Chrome through capture_lib (server on :8765)
"""
import argparse
import datetime
import gzip
import json
import math
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
from collections import defaultdict
from xml.sax.saxutils import escape

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
BASE = HERE.parent
REPO = HERE.parents[3]
PROTO = REPO / 'work' / 'visualizations' / 'horizon-welcome'
TOPOLOGY = PROTO / 'geography' / 'world-countries.topo.json'
CAMPUSES = PROTO / 'campuses.json'
OVERRIDES = PROTO / 'campus-location-overrides.json'
DOM = BASE / 'dom' / 'explorer'
REF = BASE / 'reference' / 'explorer'
OUT = BASE / 'assets' / 'globe'
JOST_DIR = REPO / 'work' / 'visualizations' / 'assets'   # jost-1.ttf = Jost Medium, for the Inkscape renders

# ---------------------------------------------------------------------------------------------------
# Constants read in the prototype (file and line given for each one).
# ---------------------------------------------------------------------------------------------------
FOV = 0.6435011087932844          # vendor/maplibre-gl.js 5.24.0: this._fovInRadians (36.87 deg)
TILE = 512                        # MapLibre world size = 512 * 2**zoom
WORLD_CENTER = (6.0, 18.0)        # integrated-globe.mjs: center:[6,18] (reset, prepareWorldRender)

# globe-style.mjs, palettes.light / palettes.dark, layers h42-world-water / -land / -border.
PALETTE = {
    'light': {'water': '#D9EEEE', 'land': '#19B8B5', 'landCountry': '#96D8CE', 'border': '#C4F3EF'},
    'dark': {'water': '#25232B', 'land': '#256967', 'landCountry': '#245755', 'border': '#A5DBD2'},
}
BORDER_WIDTH = ((0, .4), (5, .75), (10, 1.1))                 # line-width   zoom(0,.4,5,.75,10,1.1)
BORDER_OPACITY = ((0, .72), (7, .75), (11, .25), (14, 0))     # line-opacity zoom(0,.72,7,.75,11,.25,14,0)

# Marker styles (integrated-globe.css, welcome.css:107 for the light pill, DOM of the captures).
MARKER = {
    'light': {'dot': '#ED3491', 'pill': '#FFFFFF', 'pillBorder': '#FFFFFF', 'label': '#1B1B1B',
              'shadow': '0 5px 18px rgba(24,61,60,.09), 0 0 0 1px rgba(24,61,60,.03)'},
    'dark': {'dot': '#ED3491', 'pill': '#202026', 'pillBorder': '#412030', 'label': '#FFFFFF',
             'shadow': '0 8px 26px rgba(237,52,145,.10)'},
}
PAGE_BG = {'light': '#F7FAFA', 'dark': '#1B1B1B'}     # --h42-color-bg (fade of the country view)
JOST_ASCENT, JOST_DESCENT = 1.070, 0.375             # Jost hhea metrics (units per em = 1000)

# Formats. --hg-radius: globe-framing.css (.425 desktop, .46 at max-width 700px); on desktop the resting globe
# is fitted by design-review-selection.css between the stats line (168.3 px) and the status line (196 px).
FORMATS = {
    'desktop': dict(W=1440, H=960, scale=1, base_radius=.425, fit=(168.3, 196.0), blur=12),
    'mobile': dict(W=390, H=844, scale=2, base_radius=.46, fit=None, blur=8),
}
VIEWS = {
    'monde--desktop': dict(kind='world', fmt='desktop', dom='explore--desktop', svg='globe-monde--desktop.svg'),
    'monde--mobile': dict(kind='world', fmt='mobile', dom='explore--mobile', svg='globe-monde--mobile.svg'),
    'pays-france--desktop': dict(kind='country', country='FRA', fmt='desktop', dom='explore-country--desktop',
                                 svg='globe-pays-france--desktop.svg'),
    'pays-france--mobile': dict(kind='country', country='FRA', fmt='mobile', dom='explore-country--mobile',
                                svg='globe-pays-france--mobile.svg'),
}
CHAR_BUDGET = 44_500          # requested: < 45 000 characters per SVG file
TOLERANCES = tuple(round(.5 + .05 * k, 2) for k in range(31))   # 0.5 … 2.0 px, smallest that fits

# Medallion of the section filter (span.scope-medallion, 32 px, dock-navigation.css): outside Explorer the
# same full-viewport world scene is docked by dock-navigation.mjs, scaled by 32 / (2 x disc radius) around the
# disc centre and clipped to the disc (clip-path circle(radius)), under the 1 px border of the medallion
# (--control-glass-edge, control-glass.css). Drawn in a 320-unit viewBox shown at 32 px (0.05 px precision).
MEDALLION = {'file': 'globe-medaillon.svg', 'view': 'monde--desktop', 'size': 32, 'units': 320,
             'tolerance': .5, 'minIslandArea': 2.0,
             'edge': {'light': ('#FFFFFF', .72), 'dark': ('#FFFFFF', .25)}}


def interpolate(stops, z):
    if z <= stops[0][0]:
        return stops[0][1]
    for (z0, v0), (z1, v1) in zip(stops, stops[1:]):
        if z <= z1:
            return v0 + (v1 - v0) * (z - z0) / (z1 - z0)
    return stops[-1][1]


def mix(hex_a, hex_b, t):
    a = [int(hex_a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(hex_b[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join('%02X' % round(x + (y - x) * t) for x, y in zip(a, b))


def land_color(theme, z):
    """fill-color zoom(0, landWorld, 5, landWorld, 9, landCountry, …): uniform up to zoom 5."""
    p = PALETTE[theme]
    if z <= 5:
        return p['land']
    return mix(p['land'], p['landCountry'], min(1, (z - 5) / 4))


# ---------------------------------------------------------------------------------------------------
# Data: topology, campuses, cameras.
# ---------------------------------------------------------------------------------------------------
class Topology:
    """Natural Earth TopoJSON of the site: quantized arcs, country polygons as arc references."""

    def __init__(self, path):
        data = json.loads(path.read_text())
        (sx, sy), (tx, ty) = data['transform']['scale'], data['transform']['translate']
        self.q, self.ll = [], []
        for arc in data['arcs']:
            q = np.cumsum(np.asarray(arc, dtype=np.int64), axis=0)
            self.q.append(q)
            self.ll.append(np.column_stack([q[:, 0] * sx + tx, q[:, 1] * sy + ty]))
        self.geometries = []
        for g in data['objects']['countries']['geometries']:
            polygons = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
            self.geometries.append((g['id'], polygons))
        self.use = np.zeros(len(self.q), dtype=int)
        for _, polygons in self.geometries:
            for polygon in polygons:
                for ring in polygon:
                    for ref in ring:
                        self.use[ref if ref >= 0 else ~ref] += 1

    def ring_ll(self, ring):
        parts = []
        for k, ref in enumerate(ring):
            a = self.ll[ref] if ref >= 0 else self.ll[~ref][::-1]
            parts.append(a if k == 0 else a[1:])
        return np.concatenate(parts)

    def union_rings(self):
        """Rings of the union of all countries (topojson.merge): arcs used once, stitched end to start."""
        refs = [ref for _, polygons in self.geometries for polygon in polygons for ring in polygon
                for ref in ring if self.use[ref if ref >= 0 else ~ref] == 1]
        start = lambda r: tuple(self.q[r][0]) if r >= 0 else tuple(self.q[~r][-1])
        end = lambda r: tuple(self.q[r][-1]) if r >= 0 else tuple(self.q[~r][0])
        by_start = defaultdict(list)
        for r in refs:
            by_start[start(r)].append(r)
        unused, rings = set(refs), []
        for r0 in refs:
            if r0 not in unused:
                continue
            unused.discard(r0)
            ring, s, e = [r0], start(r0), end(r0)
            while e != s:
                nxt = next((r for r in by_start[e] if r in unused), None)
                if nxt is None:
                    raise RuntimeError('open land ring in the topology')
                unused.discard(nxt)
                ring.append(nxt)
                e = end(nxt)
            rings.append(ring)
        return rings

    def mesh_ranges(self, a):
        """Vertex ranges of arc a kept by polar-geometry.mjs removePolarBorderSeams (Antarctic seams)."""
        ll = self.ll[a]
        A, B = ll[:-1], ll[1:]
        pole = (np.abs(A[:, 1] + 90) <= 1e-5) & (np.abs(B[:, 1] + 90) <= 1e-5)
        line = ((A[:, 1] < -60) & (B[:, 1] < -60) & (np.abs(np.abs(A[:, 0]) - 180) <= 1e-5)
                & (np.abs(np.abs(B[:, 0]) - 180) <= 1e-5) & (np.sign(A[:, 0]) == np.sign(B[:, 0])))
        bad = np.flatnonzero(pole | line)
        if not len(bad):
            return [(0, len(ll) - 1)]
        ranges, first = [], 0
        for i in bad:
            if i > first:
                ranges.append((first, i))
            first = i + 1
        if first < len(ll) - 1:
            ranges.append((first, len(ll) - 1))
        return ranges


def load_campuses():
    data = json.loads(CAMPUSES.read_text())
    overrides = {o['campusId']: o for o in json.loads(OVERRIDES.read_text())}
    campuses = []
    for c in data['campuses']:   # welcome.mjs initializeGlobe: corrections replace the coordinates
        c = dict(c)
        if c['id'] in overrides:
            c['coordinates'] = overrides[c['id']]['coordinates']
        campuses.append(c)
    return data['countries'], campuses


def unit(lon, lat):
    lo, la = math.radians(lon), math.radians(lat)
    return np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])


def geo_centroid(points):
    """d3.geoCentroid of a MultiPoint: normalised mean of the unit vectors."""
    v = sum(unit(*p) for p in points)
    return [math.degrees(math.atan2(v[1], v[0])), math.degrees(math.asin(v[2] / np.linalg.norm(v)))]


def point_in_ring(lon, lat, ring):
    x, y = ring[:, 0], ring[:, 1]
    x2, y2 = np.roll(x, -1), np.roll(y, -1)
    crosses = ((y > lat) != (y2 > lat)) & (lon < (x2 - x) * (lat - y) / np.where(y2 == y, 1e-12, y2 - y) + x)
    return bool(np.count_nonzero(crosses) % 2)


def hg_radius(fmt):
    """--hg-radius as computed by the CSS (design-review-selection.css, registered <number>)."""
    f = FORMATS[fmt]
    if not f['fit']:
        return f['base_radius']
    W, H = f['W'], f['H']
    top, bottom = f['fit']
    disc = max(16, min(H / 2 - top, H / 2 - bottom) - 17)
    q = disc / (1.5 * H)
    r = min(f['base_radius'], disc / min(W, H) * (q + math.sqrt(q * q + 1)) / 1.23668)
    return float('%.6g' % r)    # computed value of the registered number, read with parseFloat


def world_zoom(fmt):
    f = FORMATS[fmt]   # integrated-globe.mjs readLayout()
    return math.log2(min(f['W'], f['H']) / 600) + 1.88 + math.log2(hg_radius(fmt) / .425)


def country_camera(topology, campuses, country_id, fmt):
    """integrated-globe.mjs: country centre (centroid of its campuses) and countryZoom()."""
    f = FORMATS[fmt]
    center = geo_centroid([c['coordinates'] for c in campuses if c['country'] == country_id])
    polygons = next(p for gid, p in topology.geometries if gid == country_id)
    rings = [topology.ring_ll(polygon[0]) for polygon in polygons]
    part = next((r for r in rings if point_in_ring(center[0], center[1], r)), None)
    if part is None:
        part = max(rings, key=len)
    west, south = part.min(axis=0)
    east, north = part.max(axis=0)
    span = max(east - west, (north - south) / max(.25, math.cos(math.radians(center[1]))), 1.3)
    zoom = math.log2(min(f['W'], f['H']) * .64 * 360 / (512 * (span + 1)))
    zoom = max(world_zoom(fmt) + 1.35, min(6.7, zoom))
    return center, zoom, [[west, south], [east, north]]


class View:
    """MapLibre 5.24 vertical-perspective camera at zero pitch and bearing, no padding."""

    def __init__(self, W, H, lon0, lat0, zoom):
        self.W, self.H, self.lon0, self.lat0, self.zoom = W, H, lon0, lat0, zoom
        self.cx, self.cy = W / 2, H / 2
        self.R = TILE * 2 ** zoom / (2 * math.pi * math.cos(math.radians(lat0)))
        self.f = 0.5 / math.tan(FOV / 2) * H
        self.D = self.R + self.f
        self.c = self.R / self.D                       # visible when the view-frame z exceeds c
        self.disc = self.f * self.R / math.sqrt(self.D ** 2 - self.R ** 2)
        self.horizon = math.degrees(math.acos(self.c))

    def xyz(self, ll):
        lam = np.radians(ll[:, 0] - self.lon0)
        phi = np.radians(ll[:, 1])
        p0 = math.radians(self.lat0)
        cp = np.cos(phi)
        return np.column_stack([cp * np.sin(lam),
                                math.cos(p0) * np.sin(phi) - math.sin(p0) * cp * np.cos(lam),
                                math.sin(p0) * np.sin(phi) + math.cos(p0) * cp * np.cos(lam)])

    def screen(self, v):
        s = self.f * self.R / (self.D - self.R * v[:, 2])
        return np.column_stack([self.cx + s * v[:, 0], self.cy - s * v[:, 1]])

    def project(self, lon, lat):
        v = self.xyz(np.array([[lon, lat]], dtype=float))
        return self.screen(v)[0], bool(v[0, 2] > self.c)

    def orthographic(self, lon, lat):
        """Orthographic globe with the same disc, for the README comparison only."""
        v = self.xyz(np.array([[lon, lat]], dtype=float))[0]
        return self.cx + self.disc * v[0], self.cy - self.disc * v[1]

    def scaled(self, k, cx, cy, size):
        """Same camera seen through a uniform scale around the disc centre (docked medallion)."""
        m = View(self.W, self.H, self.lon0, self.lat0, self.zoom)
        m.R, m.f = self.R * k, self.f * k
        m.D = m.R + m.f
        m.c = m.R / m.D
        m.disc = m.f * m.R / math.sqrt(m.D ** 2 - m.R ** 2)
        m.cx, m.cy, m.W, m.H = cx, cy, size, size
        return m


# ---------------------------------------------------------------------------------------------------
# Geometry: horizon clipping, simplification, ring assembly, rejoin along the silhouette, rectangle clip.
# ---------------------------------------------------------------------------------------------------
def horizon_point(a, b, c):
    t = (c - a[2]) / (b[2] - a[2])
    v = a + t * (b - a)
    r, h = math.sqrt(1 - c * c), math.hypot(v[0], v[1])
    return np.array([v[0] * r / h, v[1] * r / h, c])   # exactly on the silhouette circle


def visible_runs(view, xyz):
    """Visible parts of a polyline, each with its horizon crossings: (points, starts_on_horizon, ends_on_horizon)."""
    vis = xyz[:, 2] > view.c
    n = len(vis)
    if not vis.any():
        return []
    if vis.all():
        return [(xyz, False, False)]
    d = np.diff(vis.astype(np.int8))
    starts = list(np.flatnonzero(d == 1) + 1)
    ends = list(np.flatnonzero(d == -1))
    if vis[0]:
        starts.insert(0, 0)
    if vis[-1]:
        ends.append(n - 1)
    runs = []
    for s, e in zip(starts, ends):
        parts = [xyz[s:e + 1]]
        if s > 0:
            parts.insert(0, horizon_point(xyz[s], xyz[s - 1], view.c)[None])
        if e < n - 1:
            parts.append(horizon_point(xyz[e], xyz[e + 1], view.c)[None])
        runs.append((np.concatenate(parts), s > 0, e < n - 1))
    return runs


def dp_keep(pts, tol):
    """Douglas-Peucker on screen points (end points kept)."""
    n = len(pts)
    keep = np.zeros(n, dtype=bool)
    keep[0] = keep[-1] = True
    if n <= 2:
        return keep
    tol2 = tol * tol
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = pts[i], pts[j]
        seg = pts[i + 1:j]
        d = b - a
        L2 = float(d @ d)
        if L2 == 0:
            dist2 = ((seg - a) ** 2).sum(1)
        else:
            t = np.clip(((seg - a) @ d) / L2, 0, 1)
            dist2 = ((seg - (a + t[:, None] * d)) ** 2).sum(1)
        k = int(np.argmax(dist2))
        if dist2[k] > tol2:
            m = i + 1 + k
            keep[m] = True
            stack.append((i, m))
            stack.append((m, j))
    return keep


class Scene:
    """Projected, horizon-clipped arcs of one view; simplified for a given tolerance on demand."""

    def __init__(self, topology, view, land_rings):
        self.topology, self.view, self.land_rings = topology, view, land_rings
        self.runs = {}            # arc -> [(screen points, starts_on_horizon, ends_on_horizon)]
        # Border strokes, kind 'countries' (shared arcs) or 'coast' (arcs used once): either a reference
        # (kind, arc, run index) to the land runs, so strokes and fills coincide after simplification, or
        # (kind, None, screen points) for the Antarctic arcs whose seams are cut from the lines only.
        self.mesh = []
        for a, ll in enumerate(topology.ll):
            xyz = view.xyz(ll)
            if not (xyz[:, 2] > view.c).any():
                continue
            self.runs[a] = [(view.screen(p), s, e) for p, s, e in visible_runs(view, xyz)]
            kind = 'countries' if topology.use[a] >= 2 else 'coast'
            ranges = topology.mesh_ranges(a)
            if ranges == [(0, len(ll) - 1)]:
                self.mesh.extend((kind, a, k) for k in range(len(self.runs[a])))
            else:   # polar-geometry.mjs removePolarBorderSeams
                for i, j in ranges:
                    for p, _, _ in visible_runs(view, xyz[i:j + 1]):
                        self.mesh.append((kind, None, view.screen(p)))

    def simplified(self, tol):
        """Douglas-Peucker on every visible run; returns the land runs and the border strokes."""
        runs = {a: [(p[dp_keep(p, tol)], s, e) for p, s, e in rs] for a, rs in self.runs.items()}
        lines = defaultdict(list)
        for kind, a, ref in self.mesh:
            lines[kind].append(ref[dp_keep(ref, tol)] if a is None else runs[a][ref][0])
        return runs, lines

    def land(self, runs):
        """Closed visible rings and open segments (both ends on the silhouette) of the land union."""
        closed, segments = [], []
        for ring in self.land_rings:
            pieces = []
            for ref in ring:
                rs = runs.get(ref if ref >= 0 else ~ref, [])
                if ref < 0:
                    rs = [(p[::-1], e, s) for p, s, e in reversed(rs)]
                pieces.extend(rs)
            if not pieces:
                continue
            merged = []
            for p, s, e in pieces:
                if merged and not merged[-1][2] and not s:
                    q, s0, _ = merged[-1]
                    merged[-1] = (np.concatenate([q, p[1:]]), s0, e)
                else:
                    merged.append((p, s, e))
            if len(merged) > 1 and not merged[0][1] and not merged[-1][2]:
                q, s0, _ = merged.pop()
                merged[0] = (np.concatenate([q, merged[0][0][1:]]), s0, merged[0][2])
            for p, s, e in merged:
                if not s and not e:
                    closed.append(p[:-1] if np.allclose(p[0], p[-1]) else p)
                elif s and e:
                    segments.append(p)
                else:
                    raise RuntimeError('land ring with a single horizon crossing')
        return closed, segments


def rejoin(segments, view):
    """Close the clipped land along the silhouette (d3 clipRejoin): exterior rings are clockwise, so after
    leaving the visible cap the land continues clockwise (increasing screen angle) to the next entry."""
    ang = lambda p: math.atan2(p[1] - view.cy, p[0] - view.cx)
    entries = [ang(s[0]) for s in segments]
    exits = [ang(s[-1]) for s in segments]
    used, rings, anomalies = [False] * len(segments), [], 0
    for i in range(len(segments)):
        if used[i]:
            continue
        ring, j = [], i
        while True:
            used[j] = True
            ring.append(('line', segments[j]))
            a_out = exits[j]
            dist = [(entries[k] - a_out) % (2 * math.pi) for k in range(len(segments))]
            nxt = min(range(len(segments)), key=lambda k: dist[k])
            between = [k for k in range(len(segments)) if k != j and (exits[k] - a_out) % (2 * math.pi) < dist[nxt]]
            anomalies += bool(between)
            ring.append(('arc', a_out, a_out + dist[nxt]))
            if nxt == i or used[nxt]:
                anomalies += nxt != i
                break
            j = nxt
        rings.append(ring)
    return rings, anomalies


def arc_points(view, a0, a1, step=math.radians(1)):
    n = max(2, int(math.ceil(abs(a1 - a0) / step)) + 1)
    t = np.linspace(a0, a1, n)
    return np.column_stack([view.cx + view.disc * np.cos(t), view.cy + view.disc * np.sin(t)])


def clip_polygon(pts, x0, y0, x1, y1):
    """Sutherland-Hodgman against an axis-aligned rectangle."""
    def clip(points, inside, cut):
        out = []
        n = len(points)
        for k in range(n):
            cur, prev = points[k], points[k - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(cut(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(cut(prev, cur))
        return out

    def at_x(x):
        return lambda p, q: (x, p[1] + (q[1] - p[1]) * (x - p[0]) / (q[0] - p[0]))

    def at_y(y):
        return lambda p, q: (p[0] + (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]), y)

    points = [tuple(p) for p in pts]
    for inside, cut in ((lambda p: p[0] >= x0, at_x(x0)), (lambda p: p[0] <= x1, at_x(x1)),
                        (lambda p: p[1] >= y0, at_y(y0)), (lambda p: p[1] <= y1, at_y(y1))):
        if not points:
            break
        points = clip(points, inside, cut)
    return np.array(points) if len(points) >= 3 else None


def clip_line(pts, x0, y0, x1, y1):
    """Liang-Barsky on each segment; returns the visible polylines."""
    out, cur = [], []
    for p, q in zip(pts[:-1], pts[1:]):
        dx, dy = q[0] - p[0], q[1] - p[1]
        t0, t1, ok = 0.0, 1.0, True
        for pk, qk in ((-dx, p[0] - x0), (dx, x1 - p[0]), (-dy, p[1] - y0), (dy, y1 - p[1])):
            if pk == 0:
                if qk < 0:
                    ok = False
                    break
            else:
                r = qk / pk
                if pk < 0:
                    t0 = max(t0, r)
                else:
                    t1 = min(t1, r)
                if t0 > t1:
                    ok = False
                    break
        if not ok:
            if len(cur) > 1:
                out.append(np.array(cur))
            cur = []
            continue
        a = (p[0] + t0 * dx, p[1] + t0 * dy)
        b = (p[0] + t1 * dx, p[1] + t1 * dy)
        if not cur or t0 > 0:
            if len(cur) > 1:
                out.append(np.array(cur))
            cur = [a]
        cur.append(b)
        if t1 < 1:
            out.append(np.array(cur))
            cur = []
    if len(cur) > 1:
        out.append(np.array(cur))
    return out


# ---------------------------------------------------------------------------------------------------
# SVG writing: coordinates rounded to 0.5 px, relative commands.
# ---------------------------------------------------------------------------------------------------
def num(h):
    """Half-pixel integer -> shortest SVG number."""
    if h % 2 == 0:
        return str(h // 2)
    s = '%.1f' % (h / 2)
    return s[1:] if s.startswith('0.') else ('-' + s[2:] if s.startswith('-0.') else s)


def nums(values):
    out = []
    for k, s in enumerate(values):
        if k and not s.startswith('-'):
            out.append(' ')
        out.append(s)
    return ''.join(out)


def half(p):
    return np.rint(np.asarray(p, dtype=float) * 2).astype(np.int64)


def dedupe(q):
    if len(q) < 2:
        return q
    keep = np.r_[True, np.any(np.diff(q, axis=0) != 0, axis=1)]
    return q[keep]


def area_half(q):
    x, y = q[:, 0].astype(float), q[:, 1].astype(float)
    return 0.5 * float(np.dot(x, np.roll(y, -1)) - np.dot(np.roll(x, -1), y)) / 4   # px^2


def polyline_d(q, closed):
    d = 'M' + nums([num(q[0, 0]), num(q[0, 1])])
    if len(q) > 1:
        deltas = np.diff(q, axis=0)
        d += 'l' + nums([num(v) for v in deltas.ravel()])
    return d + ('z' if closed else '')


def stitch(polylines):
    """Join rounded polylines sharing an end point (like topojson.mesh), fewer 'M' commands."""
    ends = defaultdict(list)
    for i, q in enumerate(polylines):
        ends[tuple(q[0])].append(i)
        ends[tuple(q[-1])].append(i)
    used, out = [False] * len(polylines), []
    for i in range(len(polylines)):
        if used[i]:
            continue
        used[i] = True
        chain = [polylines[i]]
        for forward in (True, False):
            while True:
                tip = tuple(chain[-1][-1]) if forward else tuple(chain[0][0])
                if tuple(chain[0][0]) == tuple(chain[-1][-1]) and len(chain) > 1:
                    break
                j = next((j for j in ends[tip] if not used[j]), None)
                if j is None:
                    break
                used[j] = True
                q = polylines[j]
                if forward:
                    q = q if tuple(q[0]) == tip else q[::-1]
                    chain.append(q[1:])
                else:
                    q = q if tuple(q[-1]) == tip else q[::-1]
                    chain.insert(0, q[:-1])
        out.append(dedupe(np.concatenate(chain)))
    return out


def lines_d(polylines, min_area, box=None):
    """Border/coast strokes: rounded, stitched; closed loops smaller than the dropped islands removed."""
    pieces = []
    for p in polylines:
        for c in (clip_line(p, *box) if box else [p]):
            q = dedupe(half(c))
            if len(q) >= 2:
                pieces.append(q)
    ds = []
    for q in stitch(pieces):
        closed = len(q) >= 3 and np.all(q[0] == q[-1])
        if closed and (len(q) < 4 or abs(area_half(q[:-1])) < min_area):
            continue
        if np.abs(np.diff(q, axis=0)).sum() < 2:
            continue
        ds.append(polyline_d(q[:-1], True) if closed else polyline_d(q, False))
    return ''.join(ds)


def ring_with_arcs_d(ring, radius_half):
    """World views: land pieces joined by elliptical arcs along the silhouette (sweep 1 = clockwise)."""
    cur, pending_arc, first, tokens = None, None, None, []
    for item in ring:
        if item[0] == 'line':
            q = dedupe(half(item[1]))
            if first is None:
                first = q[0]
                tokens.append('M' + nums([num(q[0, 0]), num(q[0, 1])]))
                cur = q[0]
            elif pending_arc is not None:
                d = q[0] - cur
                r = num(radius_half)
                tokens.append('a' + nums([r, r, '0', str(pending_arc), '1', num(d[0]), num(d[1])]))
                cur = q[0]
            rest = q[1:]
            if len(rest):
                deltas = np.diff(np.vstack([cur, rest]), axis=0)
                deltas = deltas[np.any(deltas != 0, axis=1)]
                if len(deltas):
                    tokens.append('l' + nums([num(v) for v in deltas.ravel()]))
                cur = rest[-1]
            pending_arc = None
        else:
            pending_arc = int((item[2] - item[1]) > math.pi)
    if pending_arc is not None and first is not None:
        d = first - cur
        if np.any(d != 0):
            r = num(radius_half)
            tokens.append('a' + nums([r, r, '0', str(pending_arc), '1', num(d[0]), num(d[1])]))
    return ''.join(tokens) + 'z'


def fmt_attr(v, digits=2):
    s = ('%.' + str(digits) + 'f') % v
    s = s.rstrip('0').rstrip('.') if '.' in s else s
    if s.startswith('0.'):
        s = s[1:]
    elif s.startswith('-0.'):
        s = '-' + s[2:]
    return s or '0'


def build_svg(spec, scene, tol, min_area, markers, theme='light'):
    view = scene.view
    W, H = view.W, view.H
    runs, lines = scene.simplified(tol)
    closed, segments = scene.land(runs)
    world = spec['kind'] == 'world'
    rings, anomalies = rejoin(segments, view)
    stats = {'tolerance': tol, 'minIslandArea': min_area, 'rejoinAnomalies': anomalies}
    land_d = []
    if world:
        radius_half = int(round(view.disc * 2))
        for p in closed:
            q = dedupe(half(p))
            if len(q) >= 3 and abs(area_half(q)) >= min_area:
                land_d.append(polyline_d(q, True))
        for ring in rings:
            land_d.append(ring_with_arcs_d(ring, radius_half))
        border_paths = {kind: lines_d(polylines, min_area) for kind, polylines in lines.items()}
    else:   # the silhouette is off-screen: polylines along it, then the viewport (+2 px)
        m = 2.0
        box = (-m, -m, W + m, H + m)
        polygons = list(closed)
        for ring in rings:
            pts = []
            for item in ring:
                pts.append(item[1] if item[0] == 'line' else arc_points(view, item[1], item[2]))
            polygons.append(np.concatenate(pts))
        for p in polygons:
            xs, ys = p[:, 0], p[:, 1]
            if xs.max() < box[0] or xs.min() > box[2] or ys.max() < box[1] or ys.min() > box[3]:
                continue
            c = clip_polygon(p, *box)
            if c is None:
                continue
            q = dedupe(half(c))
            if len(q) >= 2 and np.all(q[0] == q[-1]):
                q = q[:-1]
            if len(q) >= 3 and abs(area_half(q)) >= min_area:
                land_d.append(polyline_d(q, True))
        border_paths = {kind: lines_d(polylines, min_area, (-1, -1, W + 1, H + 1))
                        for kind, polylines in lines.items()}

    pal = PALETTE[theme]
    z = view.zoom
    bw = fmt_attr(interpolate(BORDER_WIDTH, z), 3)
    bo = fmt_attr(interpolate(BORDER_OPACITY, z), 3)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" fill="none">']
    if not world:
        fx, fy = spec['fade']
        bg = PAGE_BG[theme]
        out.append('<defs>'
                   f'<linearGradient id="fade-x-paint"><stop offset="0" stop-color="{bg}"/>'
                   f'<stop offset="{fmt_attr(fx / W, 5)}" stop-color="{bg}" stop-opacity="0"/>'
                   f'<stop offset="{fmt_attr(1 - fx / W, 5)}" stop-color="{bg}" stop-opacity="0"/>'
                   f'<stop offset="1" stop-color="{bg}"/></linearGradient>'
                   f'<linearGradient id="fade-y-paint" x2="0" y2="1"><stop offset="0" stop-color="{bg}"/>'
                   f'<stop offset="{fmt_attr(fy / H, 5)}" stop-color="{bg}" stop-opacity="0"/>'
                   f'<stop offset="{fmt_attr(1 - fy / H, 5)}" stop-color="{bg}" stop-opacity="0"/>'
                   f'<stop offset="1" stop-color="{bg}"/></linearGradient></defs>')
    cx, cy, rr = fmt_attr(view.cx), fmt_attr(view.cy), fmt_attr(view.disc, 2)
    if world:
        out.append(f'<g id="sphere"><circle id="ocean" cx="{cx}" cy="{cy}" r="{rr}" fill="{pal["water"]}"/></g>')
    else:
        out.append(f'<g id="sphere"><rect id="ocean" width="{W}" height="{H}" fill="{pal["water"]}"/></g>')
    out.append(f'<g id="land"><path id="land-union" fill="{land_color(theme, z)}" d="{"".join(land_d)}"/></g>')
    out.append(f'<g id="borders">')
    for kind in ('countries', 'coast'):
        if border_paths.get(kind):
            out.append(f'<path id="borders-{kind}" fill="none" stroke="{pal["border"]}" stroke-opacity="{bo}" '
                       f'stroke-width="{bw}" stroke-linejoin="round" d="{border_paths[kind]}"/>')
    out.append('</g>')
    if world:
        out.append(f'<g id="outline"><circle id="silhouette" cx="{cx}" cy="{cy}" r="{rr}" fill="none"/></g>')
    else:
        out.append(f'<g id="fade"><rect id="fade-x" width="{W}" height="{H}" fill="url(#fade-x-paint)"/>'
                   f'<rect id="fade-y" width="{W}" height="{H}" fill="url(#fade-y-paint)"/></g>')
    out.append(markers_svg(markers, theme))
    out.append('</svg>')
    svg = ''.join(out)
    stats.update(chars=len(svg), landPathChars=sum(map(len, land_d)),
                 borderPathChars={k: len(v) for k, v in border_paths.items()})
    return svg, stats


def build_medallion(scene, theme='light'):
    """Square SVG of the world disc only (no borders: 0.03 px wide once docked; no markers)."""
    view, units, size = scene.view, MEDALLION['units'], MEDALLION['size']
    runs, _ = scene.simplified(MEDALLION['tolerance'])
    closed, segments = scene.land(runs)
    rings, anomalies = rejoin(segments, view)
    land_d = []
    for p in closed:
        q = dedupe(half(p))
        if len(q) >= 3 and abs(area_half(q)) >= MEDALLION['minIslandArea']:
            land_d.append(polyline_d(q, True))
    land_d += [ring_with_arcs_d(r, int(round(view.disc * 2))) for r in rings]
    c, r = fmt_attr(units / 2), fmt_attr(view.disc, 3)
    px = units / size
    edge, opacity = MEDALLION['edge'][theme]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {units} {units}" fill="none">'
           f'<g id="sphere"><circle id="ocean" cx="{c}" cy="{c}" r="{r}" fill="{PALETTE[theme]["water"]}"/></g>'
           f'<g id="land"><path id="land-union" fill="{land_color(theme, view.zoom)}" d="{"".join(land_d)}"/></g>'
           f'<g id="outline"><circle id="medallion-border" cx="{c}" cy="{c}" r="{fmt_attr(units / 2 - px / 2)}" fill="none" '
           f'stroke="{edge}" stroke-opacity="{fmt_attr(opacity)}" stroke-width="{fmt_attr(px)}"/></g></svg>')
    return svg, {'rejoinAnomalies': anomalies, 'tolerance': MEDALLION['tolerance'] / px,
                 'minIslandArea': MEDALLION['minIslandArea'] / px / px}


def markers_svg(markers, theme):
    if not markers:
        return '<g id="markers"/>'
    c = MARKER[theme]
    out = ['<g id="markers">']
    for m in markers:
        dx, dy = m['dot']
        parts = [f'<g id="marker-{m["id"]}">']
        if not m['compact']:
            bx, by, bw_, bh = m['box']
            parts.append(f'<rect id="{m["id"]}-pill" x="{fmt_attr(bx + .5)}" y="{fmt_attr(by + .5)}" width="{fmt_attr(bw_ - 1)}" '
                         f'height="{fmt_attr(bh - 1)}" rx="{fmt_attr(bh / 2 - .5)}" fill="{c["pill"]}" '
                         f'stroke="{c["pillBorder"]}"/>')
        parts.append(f'<circle id="{m["id"]}-halo" cx="{fmt_attr(dx)}" cy="{fmt_attr(dy)}" r="9" fill="{c["dot"]}" fill-opacity=".12"/>')
        parts.append(f'<circle id="{m["id"]}-dot" cx="{fmt_attr(dx)}" cy="{fmt_attr(dy)}" r="4" fill="{c["dot"]}"/>')
        if not m['compact'] and m.get('label'):
            lb = m['label']
            size, line = m['fontSize'], m['lineHeight']
            baseline = lb['y'] + (line - (JOST_ASCENT + JOST_DESCENT) * size) / 2 + JOST_ASCENT * size
            parts.append(f'<text id="{m["id"]}-label" x="{fmt_attr(lb["x"])}" y="{fmt_attr(baseline)}" font-family="Jost" '
                         f'font-weight="500" font-size="{fmt_attr(size)}" fill="{c["label"]}">{escape(lb["text"])}</text>')
        parts.append('</g>')
        out.append(''.join(parts))
    out.append('</g>')
    return ''.join(out)


# ---------------------------------------------------------------------------------------------------
# Markers from the captured DOM (rest state of the reference screenshots).
# ---------------------------------------------------------------------------------------------------
def read_dom(name):
    path = DOM / f'{name}.json.gz'
    if not path.exists():
        return None
    return json.load(gzip.open(path))


def dom_markers(dom):
    nodes = dom['nodes']
    children = defaultdict(list)
    for x in nodes:
        children[x['p']].append(x)
    out = []
    for x in nodes:
        classes = (x.get('cls') or '').split()
        if x.get('tag') != 'button' or 'hg-marker' not in classes:
            continue
        compact = 'hg-compact' in classes
        anchor = (x['x'] + 7, x['y'] + 7) if compact else (x['x'] + 13, x['y'] + 22)
        kids = children[x['i']]
        label = next((k for k in kids if 'hg-marker-label' in (k.get('cls') or '')), None)
        dot = next((k for k in kids if 'hg-marker-dot' in (k.get('cls') or '')), None)
        font = re.match(r'\S+ (\d+) ([\d.]+)px/([\d.]+)px', x['s']['font'])
        out.append({'anchor': anchor, 'compact': compact, 'box': (x['x'], x['y'], x['w'], x['h']),
                    'dot': (dot['x'] + 4, dot['y'] + 4) if dot else anchor,
                    'label': None if compact or not label else
                    {'text': label.get('text'), 'x': label['x'], 'y': label['y'], 'w': label['w']},
                    'fontWeight': int(font.group(1)), 'fontSize': float(font.group(2)),
                    'lineHeight': float(font.group(3))})
    return out


def stored_markers(entries):
    """Markers recorded in globe-params.json by an earlier run (the DOM dumps are not versioned)."""
    return [{'id': e['id'], 'name': e['name'], 'anchor': tuple(e['anchor']), 'compact': e['compact'],
             'box': tuple(e['box']), 'dot': tuple(e['dot']), 'fontWeight': e['fontWeight'],
             'fontSize': e['fontSize'], 'lineHeight': e['lineHeight'], 'error': e['projectionErrorPx'],
             'label': e['labelBox'] and {'text': e['label'], 'x': e['labelBox'][0], 'y': e['labelBox'][1],
                                         'w': e['labelBox'][2]}} for e in entries]


def match_markers(markers, candidates):
    """Name each captured marker after the nearest projected country/campus."""
    for m in markers:
        best = min(candidates, key=lambda c: math.dist(c['xy'], m['anchor']))
        m['id'] = best['id']
        m['name'] = best['name']
        m['projected'] = [round(best['xy'][0], 3), round(best['xy'][1], 3)]
        m['error'] = round(math.dist(best['xy'], m['anchor']), 3)
    return markers


# ---------------------------------------------------------------------------------------------------
# Comparison with the reference captures (Inkscape render + numpy).
# ---------------------------------------------------------------------------------------------------
def inkscape_render(svg_text, width, height, workdir):
    exe = shutil.which('inkscape')
    if not exe:
        raise RuntimeError('Inkscape is needed for --compare')
    src = pathlib.Path(workdir) / 'in.svg'
    dst = pathlib.Path(workdir) / 'out.png'
    src.write_text(svg_text)
    conf = pathlib.Path(workdir) / 'fonts.conf'
    conf.write_text('<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>'
                    '<include ignore_missing="yes">/etc/fonts/fonts.conf</include>'
                    f'<dir>{escape(str(JOST_DIR))}</dir><cachedir>{escape(str(workdir))}/fc</cachedir></fontconfig>')
    env = dict(os.environ, FONTCONFIG_FILE=str(conf))
    subprocess.run([exe, str(src), '--export-type=png', f'--export-filename={dst}', '--export-area-page',
                    f'--export-width={width}', f'--export-height={height}'],
                   check=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=240)
    from PIL import Image
    return np.asarray(Image.open(dst).convert('RGBA')).astype(np.float64) / 255


def box_blur(img, r, axis):
    if r < 1:
        return img
    pad = [(0, 0)] * img.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(img, pad, mode='edge'), axis=axis)
    n = img.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return (hi - lo) / (2 * r + 1)


def gaussian(img, sigma):
    """Three box blurs (CSS blur(): Gaussian of standard deviation sigma)."""
    w = math.sqrt(12 * sigma * sigma / 3 + 1)
    r = max(0, int(round((w - 1) / 2)))
    for _ in range(3):
        img = box_blur(box_blur(img, r, 0), r, 1)
    return img


def css_edge_blur(img, sigma, focus=(.5, .5)):
    """Emulates .hg-map::after: backdrop-filter blur masked by radial-gradient(ellipse closest-side,
    transparent 52%, #0003 72%, #0009 88%, #000 100%) (globe-framing.css)."""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    cx, cy = w * focus[0], h * focus[1]
    rx, ry = min(cx, w - cx), min(cy, h - cy)
    rho = np.sqrt(((xx + .5 - cx) / rx) ** 2 + ((yy + .5 - cy) / ry) ** 2)
    alpha = np.interp(rho, [0, .52, .72, .88, 1.0], [0, 0, .2, .6, 1.0])[..., None]
    return img * (1 - alpha) + gaussian(img, sigma) * alpha


def classify(img, land, water):
    """t = 1 on land colour, 0 on water colour (projection on the land-water segment)."""
    l, wv = np.array(land), np.array(water)
    d = l - wv
    return np.clip(((img[..., :3] - wv) @ d) / float(d @ d), -1, 2)


def hexrgb(h):
    return [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]


def edges(mask):
    e = np.zeros_like(mask)
    e[:-1] |= mask[:-1] != mask[1:]
    e[:, :-1] |= mask[:, :-1] != mask[:, 1:]
    return e


def grow(mask, n=1):
    out = mask.copy()
    for _ in range(n):
        g = out.copy()
        g[1:] |= out[:-1]
        g[:-1] |= out[1:]
        g[:, 1:] |= out[:, :-1]
        g[:, :-1] |= out[:, 1:]
        out = g
    return out


def closing(mask, n=1):
    """Removes water lines up to 2n px wide inside land (thin border strokes), keeps the coastline."""
    return ~grow(~grow(mask, n), n)


def distance_to(mask, max_d=8):
    """Chebyshev distance (px) to the nearest True pixel, capped at max_d."""
    dist = np.full(mask.shape, max_d, dtype=np.int16)
    cur = mask.copy()
    dist[cur] = 0
    for d in range(1, max_d):
        grown = cur.copy()
        grown[1:] |= cur[:-1]
        grown[:-1] |= cur[1:]
        grown[:, 1:] |= grown[:, :-1].copy()
        grown[:, :-1] |= grown[:, 1:].copy()
        dist[grown & ~cur] = d
        cur = grown
    return dist


def disc_fit(coverage, cx, cy, r, scale, keep=None):
    """Disc edge measured along 720 rays on a coverage map (1 inside the globe, 0 outside): sub-pixel
    crossing of 0.5, then a circle fit (Kasa) with outlier rejection. keep(angle) filters the rays."""
    h, w = coverage.shape
    pts = []
    for k in range(720):
        t = 2 * math.pi * k / 720
        if keep and not keep(t):
            continue
        ux, uy = math.cos(t), math.sin(t)
        rs = np.arange((r - 10) * scale, (r + 10) * scale, .25)
        xs, ys = cx * scale + rs * ux, cy * scale + rs * uy
        ok = (xs >= 0) & (xs < w - 1) & (ys >= 0) & (ys < h - 1)
        rs, xs, ys = rs[ok], xs[ok], ys[ok]
        if len(rs) < 40 or rs[0] > (r - 6) * scale or rs[-1] < (r + 1.5) * scale:
            continue
        x0, y0 = np.floor(xs).astype(int), np.floor(ys).astype(int)
        fx, fy = xs - x0, ys - y0
        prof = (coverage[y0, x0] * (1 - fx) * (1 - fy) + coverage[y0, x0 + 1] * fx * (1 - fy)
                + coverage[y0 + 1, x0] * (1 - fx) * fy + coverage[y0 + 1, x0 + 1] * fx * fy)
        if prof[:8].min() < .8 or prof[-4:].max() > .2:
            continue
        i = int(np.flatnonzero(prof < .5)[0])
        a, b = prof[i - 1], prof[i]
        rr = rs[i - 1] + (rs[i] - rs[i - 1]) * (a - .5) / (a - b)
        pts.append((cx * scale + rr * ux + .5, cy * scale + rr * uy + .5))   # pixel i is centred on i + 0.5
    if len(pts) < 20:
        return None
    P = np.array(pts)
    for _ in range(4):
        A = np.column_stack([2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))])
        sol = np.linalg.lstsq(A, (P ** 2).sum(1), rcond=None)[0]
        x0, y0 = sol[0], sol[1]
        R = math.sqrt(sol[2] + x0 * x0 + y0 * y0)
        res = np.abs(np.hypot(P[:, 0] - x0, P[:, 1] - y0) - R)
        P = P[res <= max(.5 * scale, np.percentile(res, 90))]
    return [round(x0 / scale, 2), round(y0 / scale, 2), round(R / scale, 2), len(P)]


def board_font(size=13):
    from PIL import ImageFont
    try:
        return ImageFont.truetype(str(JOST_DIR / 'jost-0.ttf'), size)
    except OSError:
        return ImageFont.load_default()


def load_rgb(path):
    from PIL import Image
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float64) / 255


def over(rgba, plate):
    return rgba[..., :3] * rgba[..., 3:] + plate * (1 - rgba[..., 3:])


def themed_comparison(key, spec, view, theme, svg, svg_plain, markers, workdir):
    """One theme: the capture against the SVG composited on the capture without globe (same page, same UI).
    Returns the metrics and the images of the board."""
    f = FORMATS[spec['fmt']]
    W, H, s = f['W'], f['H'], f['scale']
    ref = load_rgb(REF / f'{spec["dom"]}--fr-{theme}.png')
    plate = load_rgb(REF / f'explore-noglobe--{spec["fmt"]}--fr-{theme}.png')
    rgba = inkscape_render(svg, W * s, H * s, workdir)
    rgba_plain = inkscape_render(svg_plain, W * s, H * s, workdir)
    comp, comp_plain = over(rgba, plate), over(rgba_plain, plate)
    # The backdrop blur only reaches what lies under .hg-map::after: the globe layer (blurred here with its
    # alpha) over the page, not the header, filter and dock above it. Markers are above it too (z-index 2).
    premul = np.concatenate([rgba_plain[..., :3] * rgba_plain[..., 3:], rgba_plain[..., 3:]], -1)
    layer = css_edge_blur(premul, f['blur'] * s)
    blurred = layer[..., :3] + plate * (1 - layer[..., 3:])
    marker_alpha = np.clip(np.abs(rgba[..., :3] - rgba_plain[..., :3]).sum(-1, keepdims=True) * 4, 0, 1)
    blurred = comp * marker_alpha + blurred * (1 - marker_alpha)

    land, water = hexrgb(land_color(theme, view.zoom)), hexrgb(PALETTE[theme]['water'])
    lr, ls = classify(ref, land, water) > .5, classify(comp_plain, land, water) > .5
    yy, xx = np.mgrid[0:H * s, 0:W * s].astype(float)
    px, py = (xx + .5) / s, (yy + .5) / s
    roi = np.ones((H * s, W * s), dtype=bool)
    if spec['kind'] == 'world':
        roi &= np.hypot(px - view.cx, py - view.cy) < view.disc - 3
    else:
        fx, fy = spec['fade']
        roi &= (px > fx) & (px < W - fx) & (py > fy) & (py < H - fy)
    sharp = np.hypot((px - W / 2) / (W / 2), (py - H / 2) / (H / 2)) < .5   # no CSS blur below 52 %
    for m in markers:   # pills, dots and their shadows hide the map in the capture
        bx, by, bw_, bh = m['box'] if not m['compact'] else (m['anchor'][0] - 9, m['anchor'][1] - 9, 18, 18)
        roi &= ~((px > bx - 10) & (px < bx + bw_ + 10) & (py > by - 8) & (py < by + bh + 14))
    for x0, y0, x1, y1 in ui_boxes(spec['dom']):
        roi &= ~((px > x0 - 6) & (px < x1 + 6) & (py > y0 - 6) & (py < y1 + 6))
    metrics = {}
    for name, zone in (('all', roi), ('sharp', roi & sharp)):
        n = int(zone.sum())
        if not n:
            continue
        agree = float((lr == ls)[zone].mean())
        best = (0, 0, agree)
        for ddx in range(-3 * s, 3 * s + 1):
            for ddy in range(-3 * s, 3 * s + 1):
                a = float((lr == np.roll(np.roll(ls, ddy, 0), ddx, 1))[zone].mean())
                if a > best[2] + 1e-9:
                    best = (ddx, ddy, a)
        cr, cs = closing(lr, s), closing(ls, s)   # coastlines only (border strokes closed)
        er, es = edges(cr) & zone, edges(cs) & zone
        d_rs, d_sr = distance_to(es)[er], distance_to(er)[es]
        metrics[name] = {
            'pixels': n, 'landAgreement': round(agree, 4),
            'bestShiftPx': [best[0] / s, best[1] / s], 'agreementAtBestShift': round(best[2], 4),
            'coastCaptureToSvgPx': {'mean': round(float(d_rs.mean()) / s, 3),
                                    'p95': round(float(np.percentile(d_rs, 95)) / s, 3),
                                    'within1px': round(float((d_rs <= s).mean()), 4),
                                    'within2px': round(float((d_rs <= 2 * s).mean()), 4)},
            'coastSvgToCapturePx': {'mean': round(float(d_sr.mean()) / s, 3),
                                    'p95': round(float(np.percentile(d_sr, 95)) / s, 3),
                                    'within1px': round(float((d_sr <= s).mean()), 4),
                                    'within2px': round(float((d_sr <= 2 * s).mean()), 4)},
        }
    if spec['kind'] == 'world':
        # Capture: difference with the same page without globe (normalised by the ocean contrast); SVG: alpha.
        contrast = np.abs(np.array(water) - plate[int((view.cy - view.disc - 12) * s), int(view.cx * s)]).sum()
        cover_ref = np.clip(np.abs(ref - plate).sum(-1) / contrast, 0, 1)
        hidden = np.zeros(cover_ref.shape, dtype=bool)
        for m in markers:
            bx, by, bw_, bh = m['box'] if not m['compact'] else (m['anchor'][0] - 9, m['anchor'][1] - 9, 18, 18)
            hidden |= (px > bx - 14) & (px < bx + bw_ + 14) & (py > by - 12) & (py < by + bh + 20)
        cover_ref[hidden] = np.nan
        def sharp_ray(t):   # rays away from the markers (a symmetric blur keeps the 50 % crossing in place)
            ex, ey = view.cx + view.disc * math.cos(t), view.cy + view.disc * math.sin(t)
            j, i = int(ey * s), int(ex * s)
            return (0 <= j < H * s and 0 <= i < W * s
                    and not hidden[max(0, j - 30 * s):j + 30 * s, max(0, i - 30 * s):i + 30 * s].any())
        cover_ref = np.nan_to_num(cover_ref, nan=0.5)
        fr = disc_fit(cover_ref, view.cx, view.cy, view.disc, s, sharp_ray)
        fs = disc_fit(rgba_plain[..., 3], view.cx, view.cy, view.disc, s, sharp_ray)
        metrics['disc'] = {'expected': [round(view.cx, 2), round(view.cy, 2), round(view.disc, 2)],
                           'capture': fr and fr[:3], 'captureRays': fr and fr[3],
                           'svg': fs and fs[:3], 'svgRays': fs and fs[3]}
    overlay = np.repeat((ref * .55 + .45).mean(-1, keepdims=True), 3, -1)
    only_ref, only_svg = lr & ~ls & roi, ls & ~lr & roi
    overlay[edges(ls) & roi] = [.1, .1, .1]
    overlay[only_ref] = [.93, .2, .57]
    overlay[only_svg] = [0, .55, .75]
    return metrics, ref, blurred, overlay


def compare_view(key, spec, view, svgs, markers, workdir):
    """Board: per theme, capture | SVG composited (+ simulated CSS edge blur) | differences; light crops."""
    from PIL import Image, ImageDraw
    f = FORMATS[spec['fmt']]
    W, H, s = f['W'], f['H'], f['scale']
    to_img = lambda a: Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    tw = 600 if spec['fmt'] == 'desktop' else 300
    th = int(round(tw * H / W))
    crops = crop_boxes(key, view)
    cw = 300 if spec['fmt'] == 'desktop' else 150
    results, metrics = {}, {}
    for theme in ('light', 'dark'):
        m, ref, blurred, overlay = themed_comparison(key, spec, view, theme, svgs[theme], svgs[theme + '-plain'],
                                                     markers, workdir)
        metrics[theme] = m
        results[theme] = (ref, blurred, overlay)
    rows = [('light', 'clair'), ('crops', None), ('dark', 'sombre')]
    height = 12 + 2 * (th + 30) + (cw + 30)
    board = Image.new('RGB', (3 * tw + 4 * 12, height), (255, 255, 255))
    draw = ImageDraw.Draw(board)
    font = board_font()
    y = 6
    for row, label in rows:
        if row == 'crops':
            ref, blurred, _ = results['light']
            for k, (name, (x0, y0, x1, y1)) in enumerate(crops[:3]):
                x = 12 + k * (tw + 12)
                half_w = (tw - 6) // 2
                for j, a in enumerate((ref, blurred)):
                    im = to_img(a).crop((int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s)))
                    im = im.resize((half_w, int(round(half_w * (y1 - y0) / (x1 - x0)))), Image.NEAREST)
                    board.paste(im, (x + j * (half_w + 6), y + 16))
                draw.text((x, y), f'{name} : site | SVG (x{half_w / (x1 - x0):.1f} px CSS)', fill=(30, 30, 30), font=font)
            y += cw + 30
            continue
        titles = (f'Capture du site ({label})', f'SVG ({label}) + flou CSS simulé',
                  'Terres : rose = site seul, bleu = SVG seul, noir = contours SVG')
        for k, (title, a) in enumerate(zip(titles, results[row])):
            x = 12 + k * (tw + 12)
            board.paste(to_img(a).resize((tw, th), Image.LANCZOS), (x, y + 16))
            draw.text((x, y), title, fill=(30, 30, 30), font=font)
        y += th + 30
    return board, metrics


MEDALLION_CAPTURE = OUT / 'medaillon-capture'   # written by --capture-medallion (48 x 48 px clips, medallion at 8,8)


def capture_medallion():
    """Real docked medallion of the active prototype (capture_lib: one headless Chrome, always closed).
    Explorer with the real globe, then the Projects section: clips of span.scope-medallion at x1 and x8."""
    import base64
    import time
    sys.path.insert(0, str(HERE))
    from capture_lib import start, open_app, DESKTOP
    MEDALLION_CAPTURE.mkdir(parents=True, exist_ok=True)
    state_js = ('''(()=>{const m=document.querySelector('#scope-medallion'),r=m.getBoundingClientRect(),st=document.querySelector('#globe'),cs=getComputedStyle(st);
const markers=[...document.querySelectorAll('#globe .hg-marker')].filter(b=>!b.hidden&&getComputedStyle(b).visibility==='visible').map(b=>b.getBoundingClientRect());
return {section:document.querySelector('#app').dataset.section,docked:document.querySelector('#app').dataset.globeDocked,
medallion:{x:r.x,y:r.y,w:r.width,h:r.height,border:getComputedStyle(m).borderTopColor},
stage:{transform:cs.transform,clipPath:cs.clipPath,scale:st.style.getPropertyValue('--dock-scale'),radius:st.style.getPropertyValue('--dock-clip-radius')},
markersShown:markers.length,markersInMedallion:markers.filter(q=>q.x+q.width>r.x&&q.x<r.right&&q.y+q.height>r.y&&q.y<r.bottom).length}})()''')
    t0, results = time.time(), {'date': '2026-10-16', 'page': 'content-preview.html#explore puis Projets (1440 x 960)'}
    s = start()
    try:
        s.out = MEDALLION_CAPTURE
        open_app(s, 'explore', DESKTOP, theme='light', lang='fr', block_globe=False)
        s.wait('(document.querySelector("#globe-hint")?.textContent||"").includes("campus")', 40)
        for theme in ('light', 'dark'):
            if theme == 'dark':
                s.settings('fr', 'dark')
                time.sleep(1.5)
            s.click('#main-nav button[data-section=projects]')
            s.wait('document.querySelector("#app").dataset.globeDocked==="true"', 15)
            time.sleep(2.0)
            s.away(); s.blur(); time.sleep(.5)
            state = s.js(state_js)
            results[theme] = state
            r = state['medallion']
            for scale in (1, 8):
                data = s.c.call('Page.captureScreenshot', {'format': 'png', 'clip': {
                    'x': r['x'] - 8, 'y': r['y'] - 8, 'width': r['w'] + 16, 'height': r['h'] + 16, 'scale': scale}},
                    timeout=60)['data']
                (MEDALLION_CAPTURE / f'medallion-{theme}-x{scale}.png').write_bytes(base64.b64decode(data))
            s.click('#main-nav button[data-section=explore]')
            s.wait('document.querySelector("#app").dataset.globeDocked!=="true"', 15)
            time.sleep(1.0)
        results['pageErrors'] = s.errors()
    finally:
        s.close()
    results['seconds'] = round(time.time() - t0, 1)
    (MEDALLION_CAPTURE / 'state.json').write_text(json.dumps(results, ensure_ascii=False, indent=1) + '\n')
    return results


def compare_medallion(view, svgs, markers, workdir):
    """The medallion SVG against the real docked medallion (--capture-medallion), at 32 px and x8.
    Without those captures, the resting Explorer capture reduced to 32 px stands in for the site."""
    from PIL import Image, ImageDraw
    size = MEDALLION['size']
    to_img = lambda a: Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    tiles, metrics = [], {}
    for theme in ('light', 'dark'):
        real = (MEDALLION_CAPTURE / f'medallion-{theme}-x1.png').exists()
        if real:
            cap1 = Image.open(MEDALLION_CAPTURE / f'medallion-{theme}-x1.png').convert('RGB').crop((8, 8, 8 + size, 8 + size))
            cap8 = Image.open(MEDALLION_CAPTURE / f'medallion-{theme}-x8.png').convert('RGB').crop((64, 64, 64 + 8 * size, 64 + 8 * size))
        else:
            box = (view.cx - view.disc, view.cy - view.disc, view.cx + view.disc, view.cy + view.disc)
            src = Image.open(REF / f'explore--desktop--fr-{theme}.png').convert('RGB')
            cap1, cap8 = src.resize((size, size), Image.BOX, box=box), src.resize((8 * size, 8 * size), Image.LANCZOS, box=box)
        c1, c8 = (np.asarray(c).astype(float) / 255 for c in (cap1, cap8))
        s1, s8 = inkscape_render(svgs[theme], size, size, workdir), inkscape_render(svgs[theme], 8 * size, 8 * size, workdir)
        s1, s8 = over(s1, c1), over(s8, c8)   # transparent corners show the filter around the seat
        land, water = np.array(hexrgb(land_color(theme, view.zoom))), np.array(hexrgb(PALETTE[theme]['water']))
        d = land - water

        def classes(img):
            v = img[..., :3] - water
            t = (v @ d) / float(d @ d)
            perp = np.linalg.norm(v - t[..., None] * d, axis=-1)
            return t > .5, (t > -.15) & (t < 1.15) & (perp < .07)   # (land, plain map pixel)
        k = size / (2 * view.disc)   # dock-navigation.mjs --dock-scale

        def free(n):   # pixels of an n x n grid away from the docked markers (pills, dots and shadows)
            yy, xx = np.mgrid[0:n, 0:n].astype(float)
            u, v = (xx + .5) * size / n, (yy + .5) * size / n
            ok = np.hypot(u - size / 2, v - size / 2) < size / 2 - 1.2
            for m in markers:
                bx, by, bw_, bh = m['box'] if not m['compact'] else (m['anchor'][0] - 9, m['anchor'][1] - 9, 18, 18)
                x0, y0 = (bx - view.cx) * k + size / 2, (by - view.cy) * k + size / 2
                ok &= ~((u > x0 - 1.2) & (u < x0 + bw_ * k + 1.2) & (v > y0 - 1.2) & (v < y0 + bh * k + 1.6))
            return ok
        lc, okc = classes(c8)
        ls, oks = classes(s8)
        zone = free(8 * size) & okc & oks
        inner1 = free(size)
        metrics[theme] = {'source': 'capture du médaillon ancré' if real else 'capture Explorer réduite',
                          'landAgreementX8': round(float((lc == ls)[zone].mean()), 4), 'pixelsX8': int(zone.sum()),
                          'meanAbsDiff32px0to255': round(float(np.abs(c1 - s1)[inner1].mean() * 255), 2),
                          'pixels32px': int(inner1.sum()), 'note': 'hors repères réduits du site et hors bordure'}
        tiles.append((theme, [cap1.resize((256, 256), Image.NEAREST), to_img(s1).resize((256, 256), Image.NEAREST),
                              cap8, to_img(s8)]))
    titles = ('Site, 32 px (x8)', 'SVG, 32 px (x8)', 'Site rendu x8', 'SVG rendu x8')
    board = Image.new('RGB', (4 * 256 + 5 * 12, 2 * (256 + 30) + 12), (255, 255, 255))
    draw = ImageDraw.Draw(board)
    font = board_font()
    for r, (theme, imgs) in enumerate(tiles):
        y = 6 + r * (256 + 30)
        for k, (title, im) in enumerate(zip(titles, imgs)):
            board.paste(im, (12 + k * 268, y + 16))
            draw.text((12 + k * 268, y), f'{title} — {"clair" if theme == "light" else "sombre"}', fill=(30, 30, 30), font=font)
    return board, metrics


def ui_boxes(dom_name):
    dom = read_dom(f'{dom_name}--fr-light')
    if not dom:
        return []
    boxes = []
    for x in dom['nodes']:
        k = x.get('k', '')
        if 'div#globe:' in k or x.get('tag') in ('main',) or k.endswith('div#app:1') or '>div:1' == k[-6:]:
            continue
        if x['w'] * x['h'] > 0.5 * dom['viewport'][0] * dom['viewport'][1]:
            continue
        if x.get('text') or x.get('tag') in ('button', 'svg', 'img', 'a', 'input') or x.get('s', {}).get('bg'):
            boxes.append((x['x'], x['y'], x['x'] + x['w'], x['y'] + x['h']))
    return boxes


def crop_boxes(key, view):
    if key == 'monde--desktop':
        return [('Europe, Méditerranée', (620, 270, 800, 390)), ('Mer Rouge, Golfe', (820, 380, 1000, 500)),
                ('Bord du disque (ouest)', (450, 440, 630, 560))]
    if key == 'monde--mobile':
        return [('Europe', (150, 290, 250, 360)), ('Afrique australe', (200, 520, 300, 590)),
                ('Bord du disque (bas)', (140, 560, 240, 630))]
    if key == 'pays-france--desktop':
        return [('Bretagne, Manche', (330, 200, 570, 360)), ('Alpes, Ligurie', (800, 380, 1040, 540)),
                ('Pyrénées, golfe du Lion', (520, 560, 760, 720))]
    return [('Manche', (60, 330, 200, 430)), ('Alpes', (220, 420, 360, 520)), ('Corse, Sardaigne', (240, 520, 380, 620))]


# ---------------------------------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--compare', action='store_true', help='render the SVGs with Inkscape and build compare-*.png')
    ap.add_argument('--budget', type=int, default=CHAR_BUDGET, help='maximum characters per SVG file')
    ap.add_argument('--capture-medallion', action='store_true',
                    help='capture the real docked medallion once (capture_lib, local server on :8765)')
    args = ap.parse_args()
    if args.capture_medallion:
        print(json.dumps(capture_medallion(), ensure_ascii=False)[:2000], flush=True)
    OUT.mkdir(parents=True, exist_ok=True)
    print('topology…', flush=True)
    topology = Topology(TOPOLOGY)
    land_rings = topology.union_rings()
    countries, campuses = load_campuses()
    country_centers = {c['id']: geo_centroid([k['coordinates'] for k in campuses if k['country'] == c['id']])
                       for c in countries}
    country_names = {c['id']: c['name'] for c in countries}
    previous = {}
    if (OUT / 'globe-params.json').exists():
        previous = json.loads((OUT / 'globe-params.json').read_text())

    params = {
        'generated': datetime.date.today().isoformat(), 'script': 'work/figma/refonte-20261015/scripts/globe_svg.py',
        'projection': {
            'type': 'MapLibre GL 5.24 « globe » = perspective verticale (vertical-perspective) jusqu’au zoom 11',
            'sphereRadiusPx': '512 * 2^zoom / (2π cos(latitude du centre))',
            'cameraDistancePx': '0.5 / tan(fov / 2) * hauteur = 1.5 * hauteur (fov 0.6435011 rad = 36.87°)',
            'discRadiusPx': 'R / sqrt(1 + 2R / f)',
            'screen': 'x = cx + s·cosφ·sin(λ−λ0), y = cy − s·(cosφ0·sinφ − sinφ0·cosφ·cos(λ−λ0)), '
                      's = f·R / (R + f − R·cos c), visible si cos c > R / (R + f)',
            'sources': ['vendor/maplibre-gl.js 5.24.0 (_fovInRadians, cameraToCenterDistance, gi())',
                        'integrated-globe.mjs readLayout() worldZoom, countryZoom(), center [6,18]',
                        'design-review-selection.css --globe-fit-radius, globe-framing.css --horizon-globe-radius'],
        },
        'geography': {'source': 'work/visualizations/horizon-welcome/geography/world-countries.topo.json '
                                '(Natural Earth 1:10m 5.1.1, voir PROVENANCE.md)',
                      'land': 'union des 258 pays (arcs utilisés une seule fois)',
                      'borders': 'maillage TopoJSON complet comme le site (frontières partagées + côtes), '
                                 'coutures antarctiques retirées (polar-geometry.mjs)'},
        'colors': {},
        'views': {},
    }

    for key, spec in VIEWS.items():
        f = FORMATS[spec['fmt']]
        W, H = f['W'], f['H']
        if spec['kind'] == 'world':
            lon0, lat0 = WORLD_CENTER
            zoom = world_zoom(spec['fmt'])
            bounds = None
        else:
            (lon0, lat0), zoom, bounds = country_camera(topology, campuses, spec['country'], spec['fmt'])
            # integrated-globe.mjs refreshFade(): amount = 1 at the country zoom
            spec['fade'] = (round(min(W * .14, 180)), round(min(H * .18, 150)))
        view = View(W, H, lon0, lat0, zoom)
        print(f'{key}: centre {lon0:.6f},{lat0:.6f} zoom {zoom:.6f} R {view.R:.3f} disc {view.disc:.3f}', flush=True)
        scene = Scene(topology, view, land_rings)

        # Markers at rest, from the captured DOM (labelled or compact as decluttered by the site).
        if spec['kind'] == 'world':
            candidates = [{'id': cid, 'name': country_names[cid], 'xy': view.project(*ll)[0]}
                          for cid, ll in country_centers.items() if view.project(*ll)[1]]
        else:
            candidates = [{'id': c['id'], 'name': c['name'], 'xy': view.project(*c['coordinates'])[0]}
                          for c in campuses if c['country'] == spec['country']]
        locales = {}
        for variant in ('fr-light', 'fr-dark', 'en-light', 'ar-light', 'ar-dark'):
            dom = read_dom(f'{spec["dom"]}--{variant}')
            if dom:
                locales[variant] = match_markers(dom_markers(dom), candidates)
        stored = previous.get('views', {}).get(key, {}).get('markers', {})
        markers = locales.get('fr-light') or stored_markers(stored.get('fr-light', []))

        svg, stats = None, None
        for tol in TOLERANCES:
            min_area = max(.75, tol * tol)
            svg, stats = build_svg(spec, scene, tol, min_area, markers)
            if len(svg) <= args.budget:
                break
        (OUT / spec['svg']).write_text(svg)
        print(f'  {spec["svg"]}: {len(svg)} caractères, tolérance {stats["tolerance"]} px, '
              f'anomalies de raccord {stats["rejoinAnomalies"]}', flush=True)
        spec.update(_svg=svg, _scene=scene, _stats=stats, _view=view, _markers=markers,
                    _markers_dark=locales.get('fr-dark') or stored_markers(stored.get('fr-dark', [])) or markers)
        ortho = []
        for m in markers:
            ll = country_centers.get(m['id']) or next(c['coordinates'] for c in campuses if c['id'] == m['id'])
            ox, oy = view.orthographic(*ll)
            ortho.append(math.dist((ox, oy), m['anchor']))
        params['views'][key] = {
            'file': spec['svg'], 'chars': len(svg), 'bytes': len(svg.encode()),
            'viewport': [W, H], 'captureScale': f['scale'],
            'reference': f'reference/explorer/{spec["dom"]}--fr-light.png',
            'center': [round(lon0, 10), round(lat0, 10)], 'zoom': round(zoom, 6),
            'hgRadius': hg_radius(spec['fmt']) if spec['kind'] == 'world' else None,
            'countryBounds': bounds and [[round(v, 5) for v in p] for p in bounds],
            'sphereRadiusPx': round(view.R, 3), 'cameraDistancePx': round(view.f, 3),
            'discCenterPx': [view.cx, view.cy], 'discRadiusPx': round(view.disc, 3),
            'horizonDeg': round(view.horizon, 4),
            'borderWidthPx': round(interpolate(BORDER_WIDTH, zoom), 4),
            'borderOpacity': round(interpolate(BORDER_OPACITY, zoom), 4),
            'landColorAtZoom': {'light': land_color('light', zoom), 'dark': land_color('dark', zoom)},
            'edgeFadePx': spec.get('fade') and {'x': spec['fade'][0], 'y': spec['fade'][1]},
            'edgeBlurPx': f['blur'],
            'simplification': {k: v for k, v in stats.items() if k != 'chars'},
            'markerProjectionMaxErrorPx': max((m['error'] for m in markers), default=None),
            'orthographicMarkerErrorPx': {'max': round(max(ortho), 2), 'mean': round(sum(ortho) / len(ortho), 2)}
            if ortho else None,
            'markers': {variant: [{'id': m['id'], 'name': m['name'], 'anchor': list(m['anchor']),
                                   'compact': m['compact'], 'label': m['label'] and m['label']['text'],
                                   'labelBox': m['label'] and [m['label']['x'], m['label']['y'], m['label']['w']],
                                   'pillBox': None if m['compact'] else list(m['box']),
                                   'fontSize': m['fontSize'], 'lineHeight': m['lineHeight'],
                                   'dot': list(m['dot']), 'box': list(m['box']),
                                   'fontWeight': m['fontWeight'], 'projectionErrorPx': m['error']}
                                  for m in ms] for variant, ms in locales.items()} or
                       previous.get('views', {}).get(key, {}).get('markers', {}),
        }

    # Medallion: the resting desktop world disc, scaled into the 32 px seat of the section filter.
    base = VIEWS[MEDALLION['view']]['_view']
    units = MEDALLION['units']
    medallion_view = base.scaled(units / 2 / base.disc, units / 2, units / 2, units)
    medallion_scene = Scene(topology, medallion_view, land_rings)
    medallion_svg, medallion_stats = build_medallion(medallion_scene)
    (OUT / MEDALLION['file']).write_text(medallion_svg)
    print(f'{MEDALLION["file"]}: {len(medallion_svg)} caractères', flush=True)
    params['medallion'] = {
        'file': MEDALLION['file'], 'chars': len(medallion_svg), 'bytes': len(medallion_svg.encode()),
        'sizePx': MEDALLION['size'], 'viewBox': [0, 0, units, units],
        'source': 'span.scope-medallion (32 px, bordure 1 px --control-glass-edge) ; dock-navigation.mjs : la scène '
                  'Monde ordinateur au repos, mise à l’échelle 32 / (2 × rayon du disque) et découpée au disque',
        'camera': f'vue {MEDALLION["view"]} (centre [6, 18], zoom {round(base.zoom, 6)}), échelle '
                  f'{round(MEDALLION["size"] / (2 * base.disc), 6)}',
        'simplification': {'tolerancePxAt32': round(medallion_stats['tolerance'], 4),
                           'minIslandAreaPx2At32': round(medallion_stats['minIslandArea'], 5),
                           'rejoinAnomalies': medallion_stats['rejoinAnomalies']},
        'groups': 'sphere, land, outline (bordure du médaillon) ; ni frontières (0,03 px une fois réduites) ni repères',
        'capture': 'medaillon-capture/ (python3 globe_svg.py --capture-medallion) : la page montre aussi les 25 repères '
                   'réduits à des points (pastilles de 5 à 10 × 2,6 px, points roses ≈ 0,5 px), non repris ici',
        'outline': {'light': 'rgba(255,255,255,.72)', 'dark': 'rgba(255,255,255,.25)', 'cssVar': '--control-glass-edge'},
    }

    params['colors'] = {
        'sphere': {'light': PALETTE['light']['water'], 'dark': PALETTE['dark']['water'], 'cssVar': None,
                   'source': 'globe-style.mjs palettes.*.waterWorld (couche h42-world-water, fond du globe)'},
        'land': {'light': PALETTE['light']['land'], 'dark': PALETTE['dark']['land'], 'cssVar': None,
                 'source': 'globe-style.mjs palettes.*.landWorld (couche h42-world-land, uniforme jusqu’au zoom 5)'},
        'borders': {'light': PALETTE['light']['border'], 'dark': PALETTE['dark']['border'], 'cssVar': None,
                    'source': 'globe-style.mjs palettes.*.border (couche h42-world-border)',
                    'width': 'zoom(0, .4, 5, .75, 10, 1.1) px', 'opacity': 'zoom(0, .72, 7, .75, 11, .25, 14, 0)'},
        'outline': {'light': None, 'dark': None, 'cssVar': None,
                    'source': 'aucun contour dessiné : le bord du disque est l’antialiasing de la sphère, '
                              'sans ciel ni atmosphère (style sans « sky »)'},
        'edgeBlur': {'desktop': '12px', 'mobile': '8px', 'cssVar': None,
                     'source': 'globe-framing.css .hg-map::after backdrop-filter blur(12px) / 8px sous 701 px',
                     'mask': 'radial-gradient(ellipse closest-side at 50% var(--hg-focus-y,50%), '
                             'transparent 52%, #0003 72%, #0009 88%, #000 100%)'},
        'edgeFade': {'light': PAGE_BG['light'], 'dark': PAGE_BG['dark'], 'cssVar': '--h42-color-bg',
                     'source': 'integrated-globe.css .hg-map.hg-faded mask-image (vue Pays) : '
                               'le fond de page apparaît ; dégradés fade-x / fade-y de ce SVG'},
        'pageBackground': {'light': 'linear-gradient(145deg, #FFFFFF 8%, #F7FAFA 70%) + radial-gradient(at 77% 42%, '
                                    'rgba(0,186,188,.07), transparent 44%) + radial-gradient(at 8% 97%, '
                                    'rgba(236,51,145,.043), transparent 36%)', 'dark': None,
                           'note': 'fond de la page sous le globe (#app > div:1), hors SVG'},
        'markerDot': {'light': MARKER['light']['dot'], 'dark': MARKER['dark']['dot'], 'cssVar': '--h42-pink'},
        'markerHalo': {'light': MARKER['light']['dot'], 'dark': MARKER['dark']['dot'], 'opacity': .12,
                       'cssVar': '--h42-pink', 'source': 'box-shadow 0 0 0 5px color-mix(--h42-pink 12%)'},
        'markerPill': {'light': MARKER['light']['pill'], 'dark': MARKER['dark']['pill'], 'cssVar': '--h42-color-surface'},
        'markerPillBorder': {'light': MARKER['light']['pillBorder'], 'dark': MARKER['dark']['pillBorder'],
                             'cssVar': '--warm-line (sombre) ; #FFFFFF codé en dur en clair (welcome.css:107)'},
        'markerLabel': {'light': MARKER['light']['label'], 'dark': MARKER['dark']['label'], 'cssVar': '--h42-color-text',
                        'font': 'Jost 500, 14px/20px ordinateur, 12px/20px sous 701 px'},
        'markerShadow': {'light': MARKER['light']['shadow'], 'dark': MARKER['dark']['shadow'], 'cssVar': None,
                         'source': 'welcome.css:107 (clair), integrated-globe.css .hg-marker (sombre) ; '
                                   'non inclus dans le SVG'},
    }

    if args.compare:
        with tempfile.TemporaryDirectory() as workdir:
            for key, spec in VIEWS.items():
                print(f'comparaison {key}…', flush=True)
                tol, area, scene = spec['_stats']['tolerance'], spec['_stats']['minIslandArea'], spec['_scene']
                svgs = {'light': spec['_svg'], 'light-plain': build_svg(spec, scene, tol, area, [])[0],
                        'dark': build_svg(spec, scene, tol, area, spec['_markers_dark'], 'dark')[0],
                        'dark-plain': build_svg(spec, scene, tol, area, [], 'dark')[0]}
                board, metrics = compare_view(key, spec, spec['_view'], svgs, spec['_markers'], workdir)
                board.save(OUT / f'compare-{key}.png', optimize=True)
                params['views'][key]['comparison'] = metrics
                print(json.dumps(metrics, ensure_ascii=False), flush=True)
            print('comparaison médaillon…', flush=True)
            board, metrics = compare_medallion(base, {'light': medallion_svg,
                                                      'dark': build_medallion(medallion_scene, 'dark')[0]},
                                               VIEWS[MEDALLION['view']]['_markers'], workdir)
            board.save(OUT / 'compare-medaillon.png', optimize=True)
            params['medallion']['comparison'] = metrics
            print(json.dumps(metrics, ensure_ascii=False), flush=True)
    elif previous:   # keep the last measured comparisons when only the SVG files are rebuilt
        for key in VIEWS:
            if 'comparison' in previous.get('views', {}).get(key, {}):
                params['views'][key]['comparison'] = previous['views'][key]['comparison']
        if 'comparison' in previous.get('medallion', {}):
            params['medallion']['comparison'] = previous['medallion']['comparison']
    (OUT / 'globe-params.json').write_text(json.dumps(params, ensure_ascii=False, indent=1) + '\n')
    print('ok')


if __name__ == '__main__':
    main()
