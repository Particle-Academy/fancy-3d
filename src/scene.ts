/**
 * Engine-agnostic scene description.
 *
 * A scene is plain JSON-serializable data. Adapters consume it to render the
 * scene into a concrete engine — DOM, BabylonJS, three.js, native canvas, etc.
 * The same `Scene` should produce a recognizably similar result on every
 * supported engine.
 */

export type WidgetSpec =
  | KpiSpec
  | ChartSpec
  | KanbanSpec
  | TableSpec
  | ProfileSpec
  | CalloutSpec
  | FormSpec
  | ActionSpec
  | TimelineSpec
  | CodeSpec
  | ImageSpec
  | TextSpec
  | DemoPageSpec
  | ScreenSpec;

export interface KpiSpec {
  kind: "kpi";
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface ChartSpec {
  kind: "chart";
  title: string;
  variant: "line" | "bar" | "area";
  series: number[];
  color?: string;
}

export interface KanbanSpec {
  kind: "kanban";
  columns: { title: string; cards: string[] }[];
}

export interface TableSpec {
  kind: "table";
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export interface ProfileSpec {
  kind: "profile";
  name: string;
  role: string;
  initials: string;
  status?: "online" | "away" | "offline";
}

export interface CalloutSpec {
  kind: "callout";
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  body: string;
}

export interface FormSpec {
  kind: "form";
  title: string;
  fields: { id: string; label: string; type: "text" | "switch" | "number" }[];
}

export interface ActionSpec {
  kind: "action";
  title: string;
  buttons: { label: string; variant?: "primary" | "secondary" | "ghost" }[];
}

export interface TimelineSpec {
  kind: "timeline";
  title: string;
  events: { at: string; label: string }[];
}

export interface CodeSpec {
  kind: "code";
  title: string;
  language: string;
  code: string;
}

export interface ImageSpec {
  kind: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface TextSpec {
  kind: "text";
  heading: string;
  body: string;
}

export interface DemoPageSpec {
  kind: "demoPage";
  name: string;
  description: string;
  path: string;
  accent: string;
  category: string;
}

/**
 * A 3D-native widget — a screen-shaped panel with a bezel frame, status LED,
 * and optional 2D content drawn into the screen surface. Designed to feel
 * like a hardware display in a 3D scene.
 */
export interface ScreenSpec {
  kind: "screen";
  /** Screen contents — either a static label or a paint callback that draws
   *  onto a 2D context sized to the screen's inner area. */
  content:
    | { type: "label"; title: string; subtitle?: string }
    | { type: "image"; src: string; alt?: string }
    | { type: "paint"; paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void };
  /** Bezel color (CSS hex). Defaults to a dark frame. */
  bezel?: string;
  /** Bezel thickness in pixels, scaled with the screen's pixel size. */
  bezelThickness?: number;
  /** Power state — controls the LED + screen brightness. */
  on?: boolean;
  /** Background fill color when the content does not fill the screen. */
  background?: string;
  /** Brightness multiplier, 0..1. Defaults to 1 when on, 0.05 when off. */
  brightness?: number;
}

export interface SceneNode {
  id: string;
  position: { x: number; y: number; z?: number };
  size?: { w: number; h: number };
  widget: WidgetSpec;
}

export interface SceneEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  curve?: "bezier" | "step" | "straight";
  animated?: boolean;
}

export interface Scene {
  nodes: SceneNode[];
  edges: SceneEdge[];
}

/**
 * A WidgetAdapter renders one WidgetSpec for one engine. Each engine ships
 * its own adapter; the scene data does not change.
 *
 * The DOM adapter returns a React element. A BabylonJS adapter returns a
 * `Mesh`. A three.js adapter would return an `Object3D`.
 */
export interface WidgetAdapter<T> {
  render(spec: WidgetSpec, ctx: AdapterContext): T;
}

export interface AdapterContext {
  /** Notify the host when the widget requests selection. */
  onSelect?: (id: string) => void;
  /** The id of the node this widget belongs to. */
  nodeId: string;
  /** Whether the node is currently selected — adapters may render an outline. */
  selected: boolean;
}

let _seq = 1000;
export function nextId(prefix: string): string {
  _seq += 1;
  return `${prefix}-${_seq}`;
}

/**
 * Convenience: walk a Scene and call the adapter on every node.
 *
 * Engine-agnostic — every adapter (DOM, Babylon, three) can share it. The
 * host is responsible for placing the returned render results inside its
 * scene graph.
 */
export function renderScene<T>(
  scene: Scene,
  adapter: WidgetAdapter<T>,
  ctxFor: (node: SceneNode) => AdapterContext
): { node: SceneNode; rendered: T }[] {
  return scene.nodes.map((node) => ({ node, rendered: adapter.render(node.widget, ctxFor(node)) }));
}
