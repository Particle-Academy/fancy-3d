# DOM adapter

Renders a fancy-3d `Scene` to React elements composed from `@particle-academy/react-fancy`. The reference 2D adapter — useful when you want the same scene data to power a flat dashboard alongside its 3D rendering, or as a graceful fallback when WebGL isn't available.

## Import

```ts
import { domAdapter } from "@particle-academy/fancy-3d/dom";
```

**Peer dependency:** `@particle-academy/react-fancy` (optional — only required when you use this subpath).

## Basic Usage

```tsx
import { Canvas } from "@particle-academy/react-fancy";
import { domAdapter } from "@particle-academy/fancy-3d/dom";
import type { Scene } from "@particle-academy/fancy-3d";

const scene: Scene = {
  nodes: [
    { id: "rev", position: { x: 60, y: 60 }, size: { w: 220, h: 110 },
      widget: { kind: "kpi", label: "Revenue", value: "$48k", delta: "+12%", trend: "up" } },
    { id: "chart", position: { x: 60, y: 200 }, size: { w: 460, h: 220 },
      widget: { kind: "chart", title: "Trend", variant: "area",
                series: [12, 18, 14, 22, 28, 24, 32], color: "#6366f1" } },
  ],
  edges: [{ id: "e1", from: "rev", to: "chart", curve: "bezier" }],
};

export function Dashboard() {
  return (
    <Canvas showGrid fitOnMount className="h-[600px] w-full">
      {scene.nodes.map((n) => (
        <Canvas.Node key={n.id} id={n.id} x={n.position.x} y={n.position.y}
          style={{ width: n.size?.w, height: n.size?.h }}>
          {domAdapter.render(n.widget, { nodeId: n.id, selected: false })}
        </Canvas.Node>
      ))}
      {scene.edges.map((e) => (
        <Canvas.Edge key={e.id} from={e.from} to={e.to} curve={e.curve} />
      ))}
    </Canvas>
  );
}
```

## API

### domAdapter

```ts
const domAdapter: WidgetAdapter<ReactNode>;
```

Singleton adapter — no construction needed. Call `domAdapter.render(spec, ctx)` to get a React element for any `WidgetSpec`.

### AdapterContext

```ts
interface AdapterContext {
  nodeId: string;
  selected: boolean;
  onSelect?: (id: string) => void;
}
```

| Field | Description |
|------|-------------|
| nodeId | Forwarded to the rendered element so click handlers know which node was clicked |
| selected | When `true`, the element gets an indigo ring outline |
| onSelect | Called on `mousedown` with the `nodeId` — wire selection state in the host |

## Widget coverage

The DOM adapter handles every kind in [Scene types](./scene.md#widgetspec):

| Widget kind | Rendered as |
|-------------|-------------|
| kpi | `<Card>` with label + big value + delta |
| chart | `<Card>` with inline SVG sparkline (line / bar / area) |
| kanban | `<Card>` with column tracks + card chips |
| table | `<Card>` with `<table>` rows |
| profile | `<Profile>` inside `<Card>` |
| callout | `<Callout>` with tone-mapped color |
| form | `<Card>` with `<Switch>` and native inputs |
| action | `<Card>` with `<Action>` buttons |
| timeline | `<Card>` with `<Timeline events={...}>` |
| code | `<Card>` with `<pre>` block + language badge |
| image | `<Card>` wrapping `<img>` |
| text | `<Card>` with heading + body |
| demoPage | Card with accent header bar, category chip, path, title, description, CTA |
| screen | Inner `<canvas>` (when `paint` provided) or static label/image, framed by a styled bezel + power LED |

## Adding more kinds

Adding a new `WidgetSpec` discriminant requires updates in three places: `scene.ts` (type), `painters.ts` (Babylon paint case), and `dom.tsx` (React render case). Both adapters are kept in lock-step so any consumer can swap engines without losing widgets.
