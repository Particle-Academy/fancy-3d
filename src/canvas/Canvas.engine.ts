import type { ViewportState } from "../hooks/use-pan-zoom";

/**
 * The CanvasEngine interface lets `<Canvas>` host any 3D backend alongside
 * its 2D pan/zoom surface. Built-in engines: `dom` (default — plain DOM/CSS3D,
 * what fancy-3d has used so far) and `babylon` (mounts a Babylon `Scene` and
 * camera adjacent to the canvas DOM container).
 *
 * Implement this interface to plug in three.js, native canvas, WebXR, or any
 * future spatial runtime. Pass the implementation directly to `<Canvas engine>`.
 */
export interface CanvasEngine {
  /** Identifier surfaced via {@link EngineHandle.name} for adapters that
   *  branch on engine type. */
  name: string;

  /**
   * Mount the engine onto a host element (the Canvas's outer container).
   * Called once when the Canvas mounts. Return an {@link EngineHandle} that
   * exposes the engine's scene root and lifecycle hooks.
   */
  mount(host: HTMLElement, viewport: ViewportState): EngineHandle;
}

export interface EngineHandle {
  /** Same as {@link CanvasEngine.name}. */
  name: string;
  /**
   * Engine-native scene root. Type is `unknown` because the shape varies per
   * engine — Babylon engines expose a `BABYLON.Scene`, three.js a `THREE.Scene`,
   * the `dom` engine the host `HTMLElement` itself.
   *
   * Adapter components that target a specific engine should narrow with
   * `if (engine?.name === "babylon") { const scene = engine.root as BJScene; ... }`.
   */
  root: unknown;
  /**
   * Sync engine state from Canvas pan/zoom. For 2D engines this is the
   * `ViewportState` directly; 3D engines may map it to camera transforms or
   * (for MR) leave it as a no-op when 6DoF tracking owns viewport state.
   */
  updateViewport(viewport: ViewportState): void;
  /** Engine teardown on Canvas unmount. */
  dispose(): void;
}

/** Built-in engine string shorthands. */
export type CanvasEngineSpec = CanvasEngine | "dom" | "babylon";
