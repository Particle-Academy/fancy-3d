import { describe, expect, it } from "vitest";
import {
    bezierPath,
    getAnchorPoint,
    getEdgePath,
    stepPath,
    straightPath,
    type Point,
} from "../src/canvas/canvas.utils";
import { nextId, renderScene } from "../src/scene";
import type { Scene, SceneNode, WidgetAdapter } from "../src/scene";

const rect = (x: number, y: number, width = 100, height = 50) => ({ id: "n", x, y, width, height });

/**
 * Trace an SVG path's commands and report where the pen finishes.
 *
 * Only the four commands these helpers emit are handled — M, L, C, H, V. `H`
 * and `V` move one axis and leave the other, which is exactly why comparing the
 * raw string against an expected suffix gives the wrong answer for step paths.
 */
function endpointOf(d: string): Point {
    let x = 0;
    let y = 0;
    for (const [, cmd, argStr] of d.matchAll(/([MLCHV])([-\d.,\s]*)/g)) {
        const n = (argStr ?? "").trim().split(/[\s,]+/).filter(Boolean).map(Number);
        if (cmd === "H") x = n.at(-1)!;
        else if (cmd === "V") y = n.at(-1)!;
        else {
            x = n.at(-2)!;
            y = n.at(-1)!;
        }
    }
    return { x, y };
}

describe("getAnchorPoint", () => {
    it("places each named anchor on the right edge midpoint", () => {
        const r = rect(0, 0, 100, 50);

        expect(getAnchorPoint(r, "top")).toEqual({ x: 50, y: 0 });
        expect(getAnchorPoint(r, "bottom")).toEqual({ x: 50, y: 50 });
        expect(getAnchorPoint(r, "left")).toEqual({ x: 0, y: 25 });
        expect(getAnchorPoint(r, "right")).toEqual({ x: 100, y: 25 });
        expect(getAnchorPoint(r, "center")).toEqual({ x: 50, y: 25 });
    });

    it("auto-anchors toward the other node on the dominant axis", () => {
        // This is what stops an edge leaving the wrong side of a box and looping
        // back across it. Purely positional, so it is exactly the kind of thing
        // that looks fine until two nodes are stacked instead of side by side.
        const from = rect(0, 0, 100, 50);

        // Other node far to the right → leave from the right edge.
        expect(getAnchorPoint(from, "auto", rect(500, 0))).toEqual({ x: 100, y: 25 });
        // Far to the left → left edge.
        expect(getAnchorPoint(from, "auto", rect(-500, 0))).toEqual({ x: 0, y: 25 });
        // Far below → bottom edge.
        expect(getAnchorPoint(from, "auto", rect(0, 500))).toEqual({ x: 50, y: 50 });
        // Far above → top edge.
        expect(getAnchorPoint(from, "auto", rect(0, -500))).toEqual({ x: 50, y: 0 });
    });

    it("falls back to the centre when auto has nothing to aim at", () => {
        expect(getAnchorPoint(rect(0, 0), "auto")).toEqual({ x: 50, y: 25 });
    });
});

describe("edge paths", () => {
    const from: Point = { x: 0, y: 0 };
    const to: Point = { x: 100, y: 100 };

    it("always starts at `from` and lands on `to`, whichever curve", () => {
        // The one invariant every curve shares. A path that does not land on its
        // endpoints reads as a rendering glitch rather than a geometry bug.
        //
        // Asserted on the traced position rather than the string: a step path
        // legitimately ends `H100`, because the vertical leg already set y. A
        // naive endsWith("100,100") would fail a correct path.
        for (const curve of ["bezier", "step", "straight"] as const) {
            const d = getEdgePath(from, to, curve);
            expect(d.startsWith("M0,0"), `${curve} start`).toBe(true);
            expect(endpointOf(d), `${curve} end`).toEqual(to);
        }
    });

    it("routes a step path through the horizontal midpoint", () => {
        expect(stepPath({ x: 0, y: 0 }, { x: 100, y: 40 })).toBe("M0,0 H50 V40 H100");
    });

    it("draws a straight path as a single line", () => {
        expect(straightPath(from, to)).toBe("M0,0 L100,100");
    });

    it("bends a bezier along the dominant axis", () => {
        // Wide-and-short gets horizontal control points; tall-and-narrow gets
        // vertical ones. Swapping them produces an S-curve that crosses itself.
        const horizontal = bezierPath({ x: 0, y: 0 }, { x: 200, y: 10 });
        const vertical = bezierPath({ x: 0, y: 0 }, { x: 10, y: 200 });

        // Horizontal: first control point shares the START's y.
        expect(horizontal).toContain("C100,0");
        // Vertical: first control point shares the START's x.
        expect(vertical).toContain("C0,100");
    });

    it("gives a vertical bezier a minimum bend so short edges still curve", () => {
        // Without the floor, two nodes a few pixels apart get a control offset
        // near zero and the edge renders as a straight stub.
        const d = bezierPath({ x: 0, y: 0 }, { x: 0, y: 4 });

        expect(d).toContain("C0,30");
    });

    it("defaults to bezier", () => {
        expect(getEdgePath(from, to)).toBe(bezierPath(from, to));
    });
});

describe("nextId", () => {
    it("never returns the same id twice", () => {
        const ids = new Set(Array.from({ length: 500 }, () => nextId("node")));

        expect(ids.size).toBe(500);
    });

    it("keeps the prefix so ids stay readable", () => {
        expect(nextId("edge").startsWith("edge-")).toBe(true);
    });
});

describe("renderScene", () => {
    const node = (id: string): SceneNode =>
        ({ id, widget: { kind: "kpi", label: id }, position: { x: 0, y: 0, z: 0 } }) as unknown as SceneNode;

    it("renders every node through the adapter, in order, paired with its node", () => {
        // The shared walk each engine adapter reuses. Dropping or reordering
        // nodes here would surface as a missing widget in Babylon and three
        // alike, with nothing pointing back at the shared helper.
        const scene = { nodes: [node("a"), node("b"), node("c")], edges: [] } as unknown as Scene;
        const adapter: WidgetAdapter<string> = { render: (w) => `rendered:${(w as { label: string }).label}` };

        const out = renderScene(scene, adapter, () => ({}) as never);

        expect(out.map((o) => o.rendered)).toEqual(["rendered:a", "rendered:b", "rendered:c"]);
        expect(out.map((o) => o.node.id)).toEqual(["a", "b", "c"]);
    });

    it("hands the adapter the context built for THAT node", () => {
        const scene = { nodes: [node("a"), node("b")], edges: [] } as unknown as Scene;
        const seen: string[] = [];
        const adapter: WidgetAdapter<null> = {
            render: (_w, ctx) => {
                seen.push((ctx as unknown as { id: string }).id);
                return null;
            },
        };

        renderScene(scene, adapter, (n) => ({ id: n.id }) as never);

        expect(seen).toEqual(["a", "b"]);
    });

    it("returns an empty list for an empty scene", () => {
        const out = renderScene({ nodes: [], edges: [] } as unknown as Scene, { render: () => null }, () => ({}) as never);

        expect(out).toEqual([]);
    });
});
