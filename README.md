# @particle-academy/fancy-3d

A UI kit designed to make it easy for humans and agents to create rich, data-driven 3D applications. Describe what you want with engine-agnostic scene data, drop in primitives like `createBuilding` or `createBillboard`, and pick a renderer — DOM (react-fancy) or 3D (BabylonJS today; three.js / native canvas pluggable). Same JSON, two render targets, ergonomic enough that an LLM can author scenes directly.

## Installation

```bash
# npm
npm install @particle-academy/fancy-3d

# Plus whichever engine you target (both peer deps are optional):
npm install @particle-academy/react-fancy   # for the DOM adapter
npm install @babylonjs/core                 # for the Babylon adapter
```

**Peer dependencies (all optional):** `react >= 18`, `react-dom >= 18`, `@particle-academy/react-fancy`, `@babylonjs/core >= 7`

Install only the engines you target — the package is split into subpath imports so unused engines don't pull into your bundle.

## Quick Start

```tsx
import type { Scene } from "@particle-academy/fancy-3d";
import { domAdapter } from "@particle-academy/fancy-3d/dom";
import { Canvas } from "@particle-academy/react-fancy";

const scene: Scene = {
  nodes: [
    { id: "rev", position: { x: 0, y: 0 }, size: { w: 220, h: 110 },
      widget: { kind: "kpi", label: "Revenue", value: "$48k", delta: "+12%", trend: "up" } },
  ],
  edges: [],
};

export function Dashboard() {
  return (
    <Canvas showGrid className="h-96 w-full">
      {scene.nodes.map((n) => (
        <Canvas.Node key={n.id} id={n.id} x={n.position.x} y={n.position.y}
          style={{ width: n.size?.w, height: n.size?.h }}>
          {domAdapter.render(n.widget, { nodeId: n.id, selected: false })}
        </Canvas.Node>
      ))}
    </Canvas>
  );
}
```

To render the same scene in 3D:

```tsx
import { createBabylonAdapter, createBillboard, placeOnCylinder, sceneBounds } from "@particle-academy/fancy-3d/babylon";

const adapter = createBabylonAdapter({ scene3D: bjScene, sizeFor: (s) => ({ w: 300, h: 200 }) });
const bounds = sceneBounds(scene);
scene.nodes.forEach((node) => {
  const mesh = adapter.render(node.widget, { nodeId: node.id, selected: false });
  placeOnCylinder(node, mesh, bounds);
});
```

## Architecture

`@particle-academy/fancy-3d` exists to deliver `react-fancy` components into 3D environments — in **all the ways a 3D UI might need them**:

| Mode | What | When |
|------|------|------|
| **Texture** | Paint a widget into a `DynamicTexture` and apply it to any primitive's surface. | Static panels, billboards, dashboards, signage. Shipped today. |
| **Mount** | Host a live React tree on a 3D mesh via DOM overlay + `matrix3d` projection — fully interactive, keyboard accessible. | Anywhere you want the actual interactive UI inside a 3D scene. Shipped today via `<Stage>` + `<Screen>`. |
| **Bump-out / Puffy** | Extruded 3D interpretations of 2D components — buttons that physically protrude, cards with depth, embossed badges. Each interactive subregion is its own pickable mesh. | Spatial / mixed-reality UIs where the interface IS the geometry. Planned. |

The data layer underneath is engine-agnostic — same `Scene` JSON renders across DOM, Babylon, and (pluggable) three.js / native canvas. Subpath imports keep the bundle minimal:

```
@particle-academy/fancy-3d           Scene types (Scene, WidgetSpec, WidgetAdapter)
@particle-academy/fancy-3d/dom       DOM adapter — renders to react-fancy components
@particle-academy/fancy-3d/babylon   Babylon adapter + 3D shape primitives
@particle-academy/fancy-3d/react     <Stage> + <Screen> for live React on 3D meshes
```

`react-fancy` is a peer dependency by design: this package exists *to put react-fancy in 3D*, so consumers always install both — the peer relationship just lets you pin the react-fancy version.

## Documentation

- [Scene types & widget kinds](./docs/scene.md) — the engine-agnostic data model
- [DOM adapter](./docs/dom-adapter.md) — render Scene as react-fancy components
- [Babylon adapter](./docs/babylon-adapter.md) — render Scene as Babylon meshes + dynamic textures
- [Primitives](./docs/primitives.md) — `createPanel`, `createBillboard`, `createBuilding`, `createCylinder`, `createCurvedPanel`, `createWidgetTexture`, `createSign`, `createMonitor`, `createCard3D`, `createSphere`, `createDisc`, `createPillar`, `createDecal`
- [Screen widget](./docs/screen.md) — 3D-native widget for hardware-display visuals

## License

MIT
