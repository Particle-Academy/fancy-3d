/**
 * @particle-academy/fancy-3d
 *
 * The bridge that lets Particle Academy's fancy components live in 3D
 * interfaces. Engine-agnostic scene types live here; engine-specific
 * adapters live behind subpath imports:
 *
 *   import { Scene, ScreenSpec } from "@particle-academy/fancy-3d";
 *   import { domAdapter } from "@particle-academy/fancy-3d/dom";
 *   import { createBabylonAdapter } from "@particle-academy/fancy-3d/babylon";
 *
 * `react-fancy` and `@babylonjs/core` are both OPTIONAL peer dependencies —
 * import only the adapter you need, install only the engine you target.
 */
export type {
  Scene,
  SceneNode,
  SceneEdge,
  WidgetAdapter,
  WidgetSpec,
  AdapterContext,
  KpiSpec,
  ChartSpec,
  KanbanSpec,
  TableSpec,
  ProfileSpec,
  CalloutSpec,
  FormSpec,
  ActionSpec,
  TimelineSpec,
  CodeSpec,
  ImageSpec,
  TextSpec,
  DemoPageSpec,
  ScreenSpec,
} from "./scene";

export { nextId, renderScene } from "./scene";

/**
 * 3D shape primitives are exported from the babylon subpath since they
 * depend on @babylonjs/core. Use:
 *
 *   import { createPanel, createBuilding } from "@particle-academy/fancy-3d/babylon";
 */

/**
 * `<Canvas>` — engine-pluggable 2D pan/zoom surface. Default `engine="dom"`
 * (no extra runtime), opt into Babylon via `engine="babylon"`, or pass any
 * `CanvasEngine` to embed three.js, native canvas, WebXR, etc. The 2D node
 * graph and the active 3D scene live alongside each other; this is the
 * foundation for hybrid 2D-in-3D and Mixed Reality scenes.
 *
 *   import { Canvas, useCanvas } from "@particle-academy/fancy-3d/canvas";
 *
 * Re-exported here for discoverability; subpath import is tree-shake friendly.
 */
export {
  Canvas,
  useCanvas,
  domEngine,
  babylonEngine,
} from "./canvas";
export type {
  CanvasProps,
  CanvasNodeProps,
  CanvasEdgeProps,
  CanvasMinimapProps,
  CanvasControlsProps,
  CanvasContextValue,
  CanvasEngine,
  CanvasEngineSpec,
  EngineHandle,
  ViewportState,
  EdgeAnchor,
  GridStyle,
} from "./canvas";
