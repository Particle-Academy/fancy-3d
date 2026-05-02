import type { CanvasEngine, EngineHandle } from "../Canvas.engine";
import type { ViewportState } from "../../hooks/use-pan-zoom";

/**
 * Default engine — plain DOM with optional CSS3D `matrix3d` projection per
 * node, the approach `<Stage>`, `<Screen>`, and `<dom.tsx>` already use.
 *
 * It's a deliberate no-op: there's no extra runtime to mount because the
 * Canvas already renders DOM nodes inside a transformed wrapper. The handle
 * exposes the host element so adapters that target DOM (e.g. CSS3D overlays
 * for hybrid 2D-in-3D scenes) can attach to it.
 */
export const domEngine: CanvasEngine = {
  name: "dom",
  mount(host: HTMLElement, _viewport: ViewportState): EngineHandle {
    return {
      name: "dom",
      root: host,
      updateViewport: () => {},
      dispose: () => {},
    };
  },
};
