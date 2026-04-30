# Scene types

Engine-agnostic data structures that every adapter consumes. A scene is plain JSON-serializable data; consumers describe what to render, adapters decide how.

## Import

```ts
import type {
  Scene,
  SceneNode,
  SceneEdge,
  WidgetSpec,
  WidgetAdapter,
  AdapterContext,
} from "@particle-academy/fancy-3d";

import { renderScene, nextId } from "@particle-academy/fancy-3d";
```

## Scene

```ts
interface Scene {
  nodes: SceneNode[];
  edges: SceneEdge[];
}
```

| Field | Type | Description |
|------|------|-------------|
| nodes | `SceneNode[]` | One render output per node (mesh / React element / `Object3D` / etc.) |
| edges | `SceneEdge[]` | Connectors between nodes — bezier, step, or straight |

## SceneNode

```ts
interface SceneNode {
  id: string;
  position: { x: number; y: number; z?: number };
  size?: { w: number; h: number };
  widget: WidgetSpec;
}
```

| Field | Type | Description |
|------|------|-------------|
| id | `string` | Unique node identifier |
| position | `{ x, y, z? }` | 2D position in pixel space (or 3D if z given) |
| size | `{ w, h }` | Display size — adapters may use this for texture sizing or layout |
| widget | `WidgetSpec` | Discriminated union describing the content |

## SceneEdge

```ts
interface SceneEdge {
  id: string;
  from: string;        // source node id
  to: string;          // target node id
  label?: string;
  curve?: "bezier" | "step" | "straight";
  animated?: boolean;
}
```

## WidgetSpec

A discriminated union — each kind maps to one painter / renderer in every adapter.

| Kind | Use |
|------|-----|
| `kpi` | Big-number stat with optional delta and trend |
| `chart` | Line / bar / area sparkline |
| `kanban` | Multi-column board with cards |
| `table` | Header + rows |
| `profile` | Avatar + name + role |
| `callout` | Tone-coded notice (info / success / warning / danger) |
| `form` | Title + labelled fields (text / number / switch) |
| `action` | Title + button row (primary / secondary / ghost) |
| `timeline` | Title + chronological events |
| `code` | Code snippet with language tag |
| `image` | Image with optional caption |
| `text` | Free-form heading + body |
| `demoPage` | Marketing-style tile with accent header, title, description, CTA |
| `screen` | 3D-native screen with bezel, power LED, optional `paint(ctx)` callback — see [Screen widget](./screen.md) |

Each kind has a TypeScript spec interface (`KpiSpec`, `ChartSpec`, etc.) re-exported from the package root.

## WidgetAdapter

```ts
interface WidgetAdapter<T> {
  render(spec: WidgetSpec, ctx: AdapterContext): T;
}

interface AdapterContext {
  nodeId: string;
  selected: boolean;
  onSelect?: (id: string) => void;
}
```

A `WidgetAdapter<T>` renders one `WidgetSpec` to `T` — a `ReactNode` for the DOM adapter, a Babylon `Mesh` for the Babylon adapter, an `Object3D` for a hypothetical three.js adapter, etc. Drop in a new adapter and the scene description does not change.

## renderScene

```ts
function renderScene<T>(
  scene: Scene,
  adapter: WidgetAdapter<T>,
  ctxFor: (node: SceneNode) => AdapterContext
): { node: SceneNode; rendered: T }[];
```

Walks `scene.nodes` and calls the adapter on each one. Engine-agnostic — every adapter can reuse it. The host is responsible for placing the returned render results inside its scene graph.

## nextId

```ts
function nextId(prefix: string): string;
```

Convenience monotonic id generator — useful when you spawn nodes at runtime and need a fresh `SceneNode.id`.
