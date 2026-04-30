# Primitives

3D shape factories that take a `SurfaceContent` (color, paint callback, or any fancy-3d `WidgetSpec`) and return a Babylon `Mesh`. Same painters power both Canvas Studio in DOM mode and 3D billboards — drop a fancy widget onto any 3D shape with one call.

## Import

```ts
import {
  createPanel,
  createBillboard,
  createBuilding,
  createPillar,
  createCylinder,
  createCurvedPanel,
  createWidgetTexture,
  type SurfaceContent,
  type PaintFn,
  type BoxFace,
} from "@particle-academy/fancy-3d/babylon";
```

**Peer dependency:** `@babylonjs/core` (optional).

## SurfaceContent

```ts
type SurfaceContent =
  | { type: "color"; color: string }
  | { type: "paint"; paint: PaintFn; pixelWidth?: number; pixelHeight?: number; transparent?: boolean }
  | { type: "widget"; widget: WidgetSpec; pixelWidth?: number; pixelHeight?: number; selected?: boolean };

type PaintFn = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
```

| Type | Use |
|------|-----|
| `color` | Solid CSS-color material — fastest, no texture |
| `paint` | Freeform 2D drawing onto a `DynamicTexture`. Set `transparent: true` if you want non-painted regions to show through |
| `widget` | Render any fancy-3d `WidgetSpec` with the same painters used in 3D scenes |

For `paint` and `widget`, `pixelWidth`/`pixelHeight` are optional — every primitive auto-derives the texture size from its world dimensions (default density: 120 px per world unit, clamped to 1024 max axis). Override only when you need finer control.

## createPanel

A flat single-faced plane.

```ts
const panel = createPanel({
  scene,
  width: 2,             // world units
  height: 1.2,
  surface: { type: "widget", widget: kpiWidget },
});
panel.position.set(0, 1, 0);
```

| Option | Type | Description |
|--------|------|-------------|
| scene | `Scene` | Babylon scene to add the mesh to |
| name | `string` | Optional mesh name (default `"panel"`) |
| width / height | `number` | World-unit dimensions |
| surface | `SurfaceContent` | What to render on the panel |

## createBillboard

Same as `createPanel` plus the option to always face the camera.

```ts
const ad = createBillboard({
  scene,
  width: 6, height: 4,
  surface: { type: "widget", widget: demoTile },
  faceCamera: true,    // mesh.billboardMode = ALL
});
```

| Option | Type | Description |
|--------|------|-------------|
| ...PanelOpts | | All `createPanel` options |
| faceCamera | `boolean` | When true, the mesh's billboardMode is set so it always faces the camera |

## createBuilding

A box. Pass either `surface` (one texture wrapped on every face) or `faces` (per-face surfaces, composited into a UV atlas).

```ts
// Cheap path — one texture all around
const tower = createBuilding({
  scene,
  width: 4, height: 8, depth: 4,
  surface: { type: "color", color: "#1e293b" },
});

// Per-face path — windows on every wall, AC unit on the roof
const office = createBuilding({
  scene,
  width: 5, height: 6, depth: 3,
  faces: {
    front: { type: "paint", paint: paintWindowGrid },
    back:  { type: "paint", paint: paintWindowGrid },
    left:  { type: "paint", paint: paintWindowGrid },
    right: { type: "paint", paint: paintWindowGrid },
    top:   { type: "paint", paint: paintRoof },
  },
});
```

| Option | Type | Description |
|--------|------|-------------|
| scene | `Scene` | Babylon scene |
| width / height / depth | `number` | World-unit dimensions |
| surface | `SurfaceContent?` | Fallback surface used by any face not in `faces` |
| faces | `Partial<Record<BoxFace, SurfaceContent>>` | Per-face overrides. Faces are `'front' \| 'back' \| 'right' \| 'left' \| 'top' \| 'bottom'` |

When `faces` is set, all six faces share one composite texture sized 768×512 px (3×2 atlas of 256×256 face cells).

## createPillar

Convenience for a tall narrow `createBuilding`.

```ts
const post = createPillar({ scene, thickness: 0.2, height: 6, surface: { type: "color", color: "#0b0f17" } });
```

## createCylinder

A capped cylinder.

```ts
const drum = createCylinder({
  scene,
  radius: 1.2, height: 2.4,
  surface: { type: "paint", paint: paintBranding },
  tessellation: 64,    // optional, default 48
});
```

## createCurvedPanel

A partial cylinder section — a curved wraparound panel.

```ts
const wrap = createCurvedPanel({
  scene,
  width: 4,            // arc length
  height: 2,
  arc: Math.PI / 2,    // 90° wrap
  surface: { type: "widget", widget: chartWidget },
});
```

## createWidgetTexture

Lower-level helper — paint any `WidgetSpec` onto a fresh `DynamicTexture` for use on a custom mesh.

```ts
const tex = createWidgetTexture(scene, "settings-tex", formWidget, 360, 240, false);
const myMesh = MeshBuilder.CreatePlane("custom", { width: 2, height: 1.5 }, scene);
const mat = new StandardMaterial("custom-mat", scene);
mat.diffuseTexture = tex;
mat.emissiveTexture = tex;
mat.emissiveColor = new Color3(1, 1, 1);
myMesh.material = mat;
```

## Auto-sizing

Every primitive auto-derives texture pixel size from its world dimensions. A 6m × 3.9m billboard becomes a 720 × 468 px texture; the painters scale every coordinate against that canvas so layouts look right at any pixel size. If you want a specific resolution, pass `pixelWidth`/`pixelHeight` on the surface.
