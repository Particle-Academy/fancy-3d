# Screen widget

A 3D-native widget shaped like a hardware display: bezel frame, power LED, brightness, and an inner surface that hosts label text, an image, or arbitrary 2D content via a `paint(ctx)` callback. Use it whenever you want a "monitor" or "device screen" inside a 3D scene.

## Why it lives in fancy-3d

`Screen` only makes sense in spatial UIs — it has no meaning in a flat 2D dashboard. That's why it's a fancy-3d widget kind, not a `react-fancy` component. Both the DOM adapter and the Babylon adapter render it; the DOM adapter shows it as a styled card with an inner canvas, the Babylon adapter paints it onto a `DynamicTexture`.

## ScreenSpec

```ts
interface ScreenSpec {
  kind: "screen";
  content:
    | { type: "label"; title: string; subtitle?: string }
    | { type: "image"; src: string; alt?: string }
    | { type: "paint"; paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void };
  bezel?: string;            // CSS hex; default "#0b0f17"
  bezelThickness?: number;   // px; default 14
  on?: boolean;              // default true
  background?: string;       // CSS hex; default "#020617"
  brightness?: number;       // 0..1; default 1 when on, 0.06 when off
}
```

| Field | Description |
|------|-------------|
| content.label | Big centered title with optional subtitle — easiest case |
| content.image | Image source + alt text (Babylon currently shows alt text as a placeholder; supply a `paint` if you need real image rendering on a mesh) |
| content.paint | Freeform 2D — draw charts, animation frames, text, anything |
| bezel | Frame color around the screen |
| bezelThickness | How thick the frame is in canvas pixels |
| on | Toggles the power LED color and the brightness ramp |
| background | Inner screen background when `paint` doesn't fill the canvas |
| brightness | Multiplied via `globalAlpha` on the inner content — useful for "screen powered down" looks |

## Usage

### As a Scene widget (DOM or Babylon)

```ts
const display: SceneNode = {
  id: "monitor",
  position: { x: 0, y: 0 },
  size: { w: 320, h: 200 },
  widget: {
    kind: "screen",
    content: { type: "label", title: "OK", subtitle: "All systems healthy" },
    bezel: "#1f2937",
    on: true,
  },
};
```

The DOM adapter renders this as a `<div>` with bezel styling around an inner canvas. The Babylon adapter paints it onto a plane mesh with the bezel + power LED + glass-reflection sheen as part of the texture.

### Live drawing with `paint`

```ts
const liveScreen: ScreenSpec = {
  kind: "screen",
  content: {
    type: "paint",
    paint: (ctx, w, h) => {
      ctx.fillStyle = "#0ea5e9";
      ctx.font = `bold ${h * 0.2}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(new Date().toLocaleTimeString(), w / 2, h / 2);
    },
  },
};
```

The DOM adapter calls `paint` once on mount and again whenever the `content` reference changes. To animate, wrap the spec in `useMemo` keyed on a tick or change the spec reference each frame.

### Mounted on a primitive

`Screen` is a widget kind, so it works as the `surface` of any primitive:

```ts
import { createBillboard } from "@particle-academy/fancy-3d/babylon";

const tv = createBillboard({
  scene,
  width: 4, height: 2.5,
  surface: { type: "widget", widget: liveScreen },
});
```

## Power LED

A small dot in the bottom-right corner of the bezel:

- `on: true` → emerald LED, full brightness
- `on: false` → slate LED, dimmed inner content (`brightness ≈ 0.06`)

Override `brightness` directly to fade between states for "powering on" animations.
