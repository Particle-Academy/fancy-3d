# Canvas

An infinite pannable and zoomable surface for positioning nodes with edges between them. Engine-pluggable: defaults to a pure DOM/CSS3D rendering (zero-overhead Web3D), but can mount a Babylon `Scene` (`engine="babylon"`) or any custom engine implementing the `CanvasEngine` interface. Includes minimap, zoom controls, optional grid, and an obstacle-aware edge renderer.

## Import

```tsx
import { Canvas, useCanvas } from "@particle-academy/fancy-3d/canvas";
// (or from the package root — both work, subpath is tree-shake friendly)
```

## Engines

`<Canvas>` accepts an `engine` prop that selects the 3D backend mounted alongside the 2D canvas:

| Spec | Effect |
|------|--------|
| `"dom"` (default) | No extra runtime — plain DOM/CSS3D. Zero-cost for 2D-only use. |
| `"babylon"` | Mounts a Babylon `Engine` + `Scene` + `ArcRotateCamera` over the canvas. The live `BABYLON.Scene` is exposed via `useCanvas().engine.root` so children can register meshes. Requires `@babylonjs/core` peer dep. |
| `CanvasEngine` (custom) | Any object implementing `{ name, mount(host, viewport): EngineHandle }`. Use this to plug in three.js, native canvas, WebXR, or future spatial runtimes. |

```tsx
<Canvas engine="dom"> ... </Canvas>            // default — 2D only
<Canvas engine="babylon"> ... </Canvas>        // 3D scene mounted alongside
<Canvas engine={myThreeEngine}> ... </Canvas>  // custom engine
```

The `CanvasEngine` interface:

```ts
interface CanvasEngine {
  name: string;
  mount(host: HTMLElement, viewport: ViewportState): EngineHandle;
}

interface EngineHandle {
  name: string;
  root: unknown;                                // engine-specific (e.g. BABYLON.Scene)
  updateViewport(viewport: ViewportState): void;
  dispose(): void;
}
```

Adapter components that target a specific engine should narrow on `name`:

```tsx
const { engine } = useCanvas();
if (engine?.name === "babylon") {
  const scene = engine.root as BABYLON.Scene;
  // attach meshes to `scene` here
}
```

## Roadmap to MR

- **0.3** — texture-mode rendering: project the 2D Canvas surface onto a Babylon plane via `DynamicTexture`, so the same node graph appears as both a flat overlay and a placed-in-space surface.
- **0.4** — depth-aware overlays: per-node `z` projection so 2D widgets sit at the right depth relative to 3D meshes.
- **0.5** — hand-tracking event mapping + WebXR engine adapter: pinch/grab gestures route to existing `<Canvas.Node>` drag handlers; full WebXR session driven from inside `<Canvas>`.

## Basic Usage

```tsx
<Canvas className="h-96 w-full" showGrid>
  <Canvas.Node id="a" x={50} y={50} draggable>
    <div className="rounded border bg-white p-4">Node A</div>
  </Canvas.Node>
  <Canvas.Node id="b" x={300} y={150} draggable>
    <div className="rounded border bg-white p-4">Node B</div>
  </Canvas.Node>
  <Canvas.Edge from="a" to="b" curve="bezier" markerEnd="canvas-arrow" />
  <Canvas.Controls />
  <Canvas.Minimap />
</Canvas>
```

## Props

### Canvas (root)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| viewport | `ViewportState` | - | Controlled viewport `{ panX, panY, zoom }` |
| defaultViewport | `ViewportState` | `{ panX: 0, panY: 0, zoom: 1 }` | Default viewport (uncontrolled) |
| onViewportChange | `(viewport: ViewportState) => void` | - | Callback when viewport changes |
| minZoom | `number` | `0.1` | Minimum zoom level |
| maxZoom | `number` | `3` | Maximum zoom level |
| pannable | `boolean` | `true` | Enable panning (click+drag on background) |
| zoomable | `boolean` | `true` | Enable zoom (Ctrl+scroll) |
| gridSize | `number` | `20` | Grid cell size in canvas-space pixels |
| showGrid | `boolean` | `false` | Display the canvas grid background |
| gridStyle | `'dots' \| 'lines' \| 'none'` | `'dots'` | Grid pattern when shown. `'none'` hides the grid even when `showGrid` is true |
| gridColor | `string` | `'rgb(161 161 170 / 0.3)'` | Any CSS color for grid dots/lines |
| snapToGrid | `boolean` | `false` | Snap dragged nodes to the grid |
| fitOnMount | `boolean` | `false` | Auto-fit all nodes into view on mount |
| className | `string` | - | Additional CSS classes |
| style | `CSSProperties` | - | Inline styles |

### Canvas.Node

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | `string` | - | Unique node identifier (required) |
| x | `number` | - | X position in canvas coordinates (required) |
| y | `number` | - | Y position in canvas coordinates (required) |
| draggable | `boolean` | - | Allow drag-to-move |
| onPositionChange | `(x: number, y: number) => void` | - | Callback when dragged to a new position |
| className | `string` | - | Additional CSS classes |
| style | `CSSProperties` | - | Inline styles |

### Canvas.Edge

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| from | `string` | - | Source node id (required) |
| to | `string` | - | Target node id (required) |
| fromAnchor | `EdgeAnchor` | - | Anchor point on source: `"top"`, `"bottom"`, `"left"`, `"right"`, `"center"`, `"auto"` |
| toAnchor | `EdgeAnchor` | - | Anchor point on target |
| curve | `"bezier" \| "step" \| "straight"` | - | Path interpolation |
| color | `string` | - | Stroke color |
| strokeWidth | `number` | - | Stroke width |
| dashed | `boolean` | - | Dashed line |
| animated | `boolean` | - | Animated dash pattern |
| label | `ReactNode` | - | Label at the midpoint |
| markerStart | `string` | - | SVG marker id for start (e.g. `"canvas-arrow"`, `"canvas-circle"`, `"canvas-diamond"`) |
| markerEnd | `string` | - | SVG marker id for end |
| className | `string` | - | Additional CSS classes |

### Canvas.Controls

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showZoomIn | `boolean` | - | Show zoom-in button |
| showZoomOut | `boolean` | - | Show zoom-out button |
| showReset | `boolean` | - | Show reset-viewport button |
| showFitAll | `boolean` | - | Show fit-all button |
| className | `string` | - | Additional CSS classes |

### Canvas.Minimap

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | - | Minimap width in px |
| height | `number` | - | Minimap height in px |
| className | `string` | - | Additional CSS classes |

### ViewportState

```ts
{ panX: number; panY: number; zoom: number }
```

## Built-in SVG Markers

The Canvas includes predefined SVG markers for edge endpoints: `"canvas-arrow"`, `"canvas-circle"`, `"canvas-diamond"`, `"canvas-one"`, `"canvas-crow-foot"`.
