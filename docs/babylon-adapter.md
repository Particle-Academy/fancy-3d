# Babylon adapter

Renders a fancy-3d `Scene` as BabylonJS meshes. Each widget kind paints onto a 2D canvas that's uploaded to a `DynamicTexture` and applied to a plane. Edges become line meshes. Same `Scene` JSON, 3D output.

## Import

```ts
import {
  createBabylonAdapter,
  paintWidget,
  placeOnCylinder,
  sceneBounds,
  TEX_SCALE,
} from "@particle-academy/fancy-3d/babylon";
```

**Peer dependency:** `@babylonjs/core` (optional — only required when you use this subpath).

## Basic Usage

```tsx
import { Engine, Scene as BJScene, ArcRotateCamera, HemisphericLight, Vector3 } from "@babylonjs/core";
import { createBabylonAdapter, placeOnCylinder, sceneBounds } from "@particle-academy/fancy-3d/babylon";

const engine = new Engine(canvas, true);
const bj = new BJScene(engine);
new ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2.2, 11, new Vector3(0, 0, 0), bj).attachControl(canvas, true);
new HemisphericLight("hemi", new Vector3(0, 1, 0), bj);

const adapter = createBabylonAdapter({
  scene3D: bj,
  sizeFor: (spec) => ({ w: 300, h: 200 }),
});

const bounds = sceneBounds(scene);
scene.nodes.forEach((node) => {
  const mesh = adapter.render(node.widget, { nodeId: node.id, selected: false });
  placeOnCylinder(node, mesh, bounds, { radius: 6, arc: Math.PI * 0.9 });
});

engine.runRenderLoop(() => bj.render());
```

## API

### createBabylonAdapter

```ts
function createBabylonAdapter(deps: BabylonAdapterDeps): WidgetAdapter<Mesh>;

interface BabylonAdapterDeps {
  scene3D: Scene;            // your Babylon Scene
  sizeFor(spec: WidgetSpec): { w: number; h: number };
}
```

| Field | Description |
|------|-------------|
| scene3D | The Babylon `Scene` the meshes should be added to |
| sizeFor | Returns the target pixel size for a widget's texture. The plane mesh is sized world-units = `pixels * (1/180)` |

The adapter's `render(spec, ctx)` returns a Babylon `Mesh` whose `metadata.nodeId` matches `ctx.nodeId` — wire `scene.onPointerObservable` to read `pickedMesh.metadata.nodeId` for selection.

Selected nodes render a 2px indigo border around the painted texture.

### sceneBounds

```ts
function sceneBounds(scene: Scene): {
  minX: number; maxX: number; minY: number; maxY: number;
};
```

Computes the bounding box of all nodes' world-space rectangles. Feed into `placeOnCylinder` (or your own layout function) to map 2D scene coordinates onto a 3D layout.

### placeOnCylinder

```ts
function placeOnCylinder(
  node: SceneNode,
  mesh: Mesh,
  bounds: { minX, maxX, minY, maxY },
  opts?: { radius?: number; arc?: number }
): void;
```

Wraps a node's 2D position onto a partial cylinder facing the camera. Default `radius=6`, `arc=π * 0.9` (~160°). DOM `x` becomes angle around the cylinder; DOM `y` becomes vertical position. Sibling layout helpers (`placeOnGrid`, `placeOnArc`, `placeOnPath`) are planned.

### paintWidget

```ts
function paintWidget(
  ctx: CanvasRenderingContext2D,
  spec: WidgetSpec,
  w: number,
  h: number,
  selected: boolean
): void;
```

Low-level escape hatch — paints any `WidgetSpec` onto a 2D canvas you supply. Used internally by the adapter and by [`createWidgetTexture`](./primitives.md#createwidgettexture). Call this when you want widget content on a custom mesh shape that primitives don't yet expose.

### TEX_SCALE

```ts
const TEX_SCALE: number; // = 2
```

Texture super-sampling factor — primitives create textures `TEX_SCALE×` larger than their pixel size and pre-scale the canvas context, producing crisp output on high-DPI displays.

## Selection & interaction

```ts
import { PointerEventTypes } from "@babylonjs/core";

bj.onPointerObservable.add((pi) => {
  if (pi.type !== PointerEventTypes.POINTERPICK) return;
  const id = (pi.pickInfo?.pickedMesh?.metadata as { nodeId?: string })?.nodeId;
  if (id) handleSelect(id);
});
```

Scale or outline the picked mesh on hover for feedback (`mesh.scaling.setAll(1.04)`, `mesh.renderOutline = true`).

## V-flip

Babylon plane UVs run `V=0` at the bottom; canvas Y runs top-to-bottom. The adapter sets `tex.vScale = -1; tex.vOffset = 1` so painted content reads right-side-up. If you build textures by hand (without `createWidgetTexture` or the primitives), apply this flip yourself.
