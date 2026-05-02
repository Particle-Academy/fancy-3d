/**
 * Babylon engine adapter. Mounts a Babylon `Engine` + `Scene` + camera into
 * a `<canvas>` element overlaid on the Canvas DOM container, then exposes
 * the live `Scene` via `EngineHandle.root` so child components can register
 * meshes alongside the 2D node graph.
 *
 * `@babylonjs/core` is an optional peer dep — this file only loads when a
 * consumer actually passes `engine="babylon"` to `<Canvas>`.
 */
import type { CanvasEngine, EngineHandle } from "../Canvas.engine";
import type { ViewportState } from "../../hooks/use-pan-zoom";

export const babylonEngine: CanvasEngine = {
  name: "babylon",
  mount(host: HTMLElement, viewport: ViewportState): EngineHandle {
    // Lazy require so non-babylon Canvas users don't pay the parse cost.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BABYLON = require("@babylonjs/core");

    const overlay = document.createElement("canvas");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.pointerEvents = "none";
    overlay.dataset.fancy3dCanvasEngine = "babylon";
    host.appendChild(overlay);

    const engine = new BABYLON.Engine(overlay, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    const camera = new BABYLON.ArcRotateCamera(
      "fancy3d-canvas-camera",
      Math.PI / 2,
      Math.PI / 2.5,
      8,
      BABYLON.Vector3.Zero(),
      scene,
    );
    camera.attachControl(overlay, false);
    new BABYLON.HemisphericLight("fancy3d-canvas-light", new BABYLON.Vector3(0, 1, 0), scene);

    const observer = engine.runRenderLoop(() => scene.render());

    function updateViewport(_v: ViewportState) {
      // Default: 6DoF camera owns view; 2D viewport changes are observed
      // but don't move the Babylon camera. Consumers can override by
      // attaching their own observers to the scene.
    }

    function dispose() {
      try { engine.stopRenderLoop(observer as any); } catch {}
      scene.dispose();
      engine.dispose();
      if (overlay.parentElement === host) host.removeChild(overlay);
    }

    return {
      name: "babylon",
      root: scene,
      updateViewport,
      dispose,
    };
  },
};
