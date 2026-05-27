/**
 * @particle-academy/fancy-3d
 *
 * Engine-agnostic 3D core for Particle Academy's fancy components. Owns the
 * `Scene` types, the `<Canvas>` surface, and the DOM (CSS-3D) renderer. WebGL
 * adapters ship as sibling packages so engine costs are only paid by consumers
 * that actually need WebGL:
 *
 *   - `@particle-academy/fancy-3d-babylon` — BabylonJS adapter (Stage, Monitor,
 *     Card3D, primitives, layouts; WebGL renderer)
 *   - sibling packages can ship three.js, WebGPU, WebXR, etc.
 *
 * Typical import shape:
 *
 *   import { Scene, ScreenSpec, Canvas } from "@particle-academy/fancy-3d";
 *   import { domAdapter }                from "@particle-academy/fancy-3d/dom";
 *   import { Stage, Monitor, Card3D }    from "@particle-academy/fancy-3d-babylon/react";
 *   import { babylonEngine }             from "@particle-academy/fancy-3d-babylon/engine";
 *
 * `@particle-academy/react-fancy` is an optional peer dependency — only the
 * DOM adapter needs it.
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
 * `<Canvas>` — engine-pluggable 2D pan/zoom surface. Default `engine="dom"`
 * (no extra runtime). For WebGL pass an engine object from a companion
 * adapter — e.g.
 *
 *   import { Canvas } from "@particle-academy/fancy-3d";
 *   import { babylonEngine } from "@particle-academy/fancy-3d-babylon/engine";
 *   <Canvas engine={babylonEngine} />
 *
 * or implement `CanvasEngine` yourself for three.js / native canvas / WebXR.
 * The 2D node graph and the active 3D scene live alongside each other; this
 * is the foundation for hybrid 2D-in-3D and Mixed Reality scenes.
 *
 *   import { Canvas, useCanvas } from "@particle-academy/fancy-3d/canvas";
 *
 * Re-exported here for discoverability; the subpath import is tree-shake friendly.
 */
export {
  Canvas,
  useCanvas,
  domEngine,
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
