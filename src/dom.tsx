/**
 * DOM adapter for `@particle-academy/fancy-3d`.
 *
 * Renders an engine-agnostic `Scene` to React elements composed from
 * `@particle-academy/react-fancy` components. This is the reference 2D
 * adapter — siblings include `./babylon` for 3D.
 *
 * `@particle-academy/react-fancy` is an OPTIONAL peer dependency.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { Action, Badge, Card, Callout, Profile, Switch, Timeline } from "@particle-academy/react-fancy";
import type { ActionColor } from "@particle-academy/react-fancy";
import type { AdapterContext, ActionSpec, ScreenSpec, WidgetAdapter, WidgetSpec } from "./scene";

function ScreenWidget({ spec }: { spec: ScreenSpec }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const t = spec.bezelThickness ?? 14;
  const on = spec.on ?? true;
  const brightness = spec.brightness ?? (on ? 1 : 0.06);
  const bezel = spec.bezel ?? "#0b0f17";
  const bg = spec.background ?? "#020617";

  useEffect(() => {
    if (spec.content.type !== "paint") return;
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio ?? 1;
    const rect = cv.getBoundingClientRect();
    cv.width = rect.width * dpr;
    cv.height = rect.height * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    spec.content.paint(ctx, rect.width, rect.height);
  }, [spec.content]);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ background: bezel, padding: t }}
    >
      <div
        className="relative h-full w-full overflow-hidden rounded-md"
        style={{ background: bg, opacity: brightness }}
      >
        {spec.content.type === "label" && (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-zinc-100">{spec.content.title}</div>
            {spec.content.subtitle && (
              <div className="mt-1 text-xs text-zinc-400">{spec.content.subtitle}</div>
            )}
          </div>
        )}
        {spec.content.type === "image" && (
          <img src={spec.content.src} alt={spec.content.alt ?? ""} className="h-full w-full object-cover" />
        )}
        {spec.content.type === "paint" && <canvas ref={ref} className="block h-full w-full" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      </div>
      <span
        className="absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full"
        style={{ background: on ? "#10b981" : "#475569" }}
      />
    </div>
  );
}

function Sparkline({ values, variant, color = "#6366f1" }: { values: number[]; variant: "line" | "bar" | "area"; color?: string }) {
  const w = 100;
  const h = 40;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = w / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => [i * step, h - ((v - min) / range) * h] as const);

  if (variant === "bar") {
    const bw = w / values.length - 2;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
        {values.map((v, i) => {
          const bh = ((v - min) / range) * h;
          return <rect key={i} x={i * (bw + 2)} y={h - bh} width={bw} height={Math.max(bh, 0.5)} fill={color} rx={1} />;
        })}
      </svg>
    );
  }

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      {variant === "area" && <path d={areaPath} fill={color} fillOpacity={0.18} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function actionColorFor(b: ActionSpec["buttons"][number]): ActionColor | undefined {
  if (b.variant === "primary") return "indigo";
  return undefined;
}

function actionVariantFor(b: ActionSpec["buttons"][number]): "default" | "ghost" {
  return b.variant === "ghost" ? "ghost" : "default";
}

function renderWidget(spec: WidgetSpec): ReactNode {
  switch (spec.kind) {
    case "kpi":
      return (
        <Card className="h-full">
          <Card.Body>
            <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{spec.value}</div>
              {spec.delta && (
                <span
                  className={
                    spec.trend === "up"
                      ? "text-xs font-medium text-emerald-600"
                      : spec.trend === "down"
                      ? "text-xs font-medium text-rose-600"
                      : "text-xs font-medium text-zinc-500"
                  }
                >
                  {spec.delta}
                </span>
              )}
            </div>
          </Card.Body>
        </Card>
      );

    case "chart":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full flex-col">
            <div className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
            <div className="min-h-0 flex-1">
              <Sparkline values={spec.series} variant={spec.variant} color={spec.color} />
            </div>
          </Card.Body>
        </Card>
      );

    case "kanban":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full gap-2">
            {spec.columns.map((col) => (
              <div key={col.title} className="flex flex-1 flex-col rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/50">
                <div className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">{col.title}</div>
                <div className="flex flex-col gap-1.5">
                  {col.cards.map((c) => (
                    <div key={c} className="rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      );

    case "table":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full flex-col">
            <div className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-zinc-500">
                    {spec.columns.map((c) => (
                      <th key={c} className="border-b border-zinc-200 py-1.5 font-medium dark:border-zinc-700">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spec.rows.map((row, i) => (
                    <tr key={i} className="text-zinc-700 dark:text-zinc-300">
                      {row.map((cell, j) => (
                        <td key={j} className="border-b border-zinc-100 py-1.5 dark:border-zinc-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      );

    case "profile":
      return (
        <Card className="h-full">
          <Card.Body>
            <Profile
              name={spec.name}
              subtitle={spec.role}
              fallback={spec.initials}
              status={spec.status === "online" ? "online" : spec.status === "away" ? "away" : undefined}
            />
          </Card.Body>
        </Card>
      );

    case "callout": {
      const color = spec.tone === "danger" ? "red" : spec.tone === "warning" ? "amber" : spec.tone === "success" ? "green" : "blue";
      return (
        <Callout color={color}>
          <div className="text-sm font-semibold">{spec.title}</div>
          <div className="mt-0.5 text-xs">{spec.body}</div>
        </Callout>
      );
    }

    case "form":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full flex-col gap-2">
            <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
            {spec.fields.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2">
                <label className="text-xs text-zinc-600 dark:text-zinc-400">{f.label}</label>
                {f.type === "switch" ? (
                  <Switch defaultChecked />
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    className="w-28 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    placeholder={f.label}
                  />
                )}
              </div>
            ))}
          </Card.Body>
        </Card>
      );

    case "action":
      return (
        <Card className="h-full">
          <Card.Body>
            <div className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
            <div className="flex flex-wrap gap-2">
              {spec.buttons.map((b) => (
                <Action
                  key={b.label}
                  variant={actionVariantFor(b)}
                  color={actionColorFor(b)}
                  size="sm"
                >
                  {b.label}
                </Action>
              ))}
            </div>
          </Card.Body>
        </Card>
      );

    case "timeline":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full flex-col">
            <div className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
            <div className="min-h-0 flex-1 overflow-auto">
              <Timeline events={spec.events.map((e) => ({ date: e.at, title: e.label }))} />
            </div>
          </Card.Body>
        </Card>
      );

    case "code":
      return (
        <Card className="h-full">
          <Card.Body className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{spec.title}</div>
              <Badge size="sm">{spec.language}</Badge>
            </div>
            <pre className="min-h-0 flex-1 overflow-auto rounded bg-zinc-900 p-2 font-mono text-[11px] leading-relaxed text-zinc-100">
              {spec.code}
            </pre>
          </Card.Body>
        </Card>
      );

    case "image":
      return (
        <Card className="h-full overflow-hidden">
          <img src={spec.src} alt={spec.alt} className="h-full w-full object-cover" />
          {spec.caption && <Card.Body className="text-xs text-zinc-500">{spec.caption}</Card.Body>}
        </Card>
      );

    case "text":
      return (
        <Card className="h-full">
          <Card.Body>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{spec.heading}</div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{spec.body}</p>
          </Card.Body>
        </Card>
      );

    case "screen":
      return <ScreenWidget spec={spec} />;

    case "demoPage":
      return (
        <Card className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2" style={{ background: spec.accent }}>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
              {spec.category}
            </span>
            <span className="font-mono text-[10px] text-white/85">{spec.path}</span>
          </div>
          <Card.Body className="flex flex-1 flex-col">
            <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{spec.name}</div>
            <p className="mt-1 flex-1 text-xs text-zinc-500">{spec.description}</p>
            <span className="mt-2 inline-flex items-center self-start rounded-md px-2 py-1 text-[11px] font-semibold" style={{ background: spec.accent, color: "#0f172a" }}>
              Open demo →
            </span>
          </Card.Body>
        </Card>
      );
  }
}

export const domAdapter: WidgetAdapter<ReactNode> = {
  render(spec, ctx: AdapterContext) {
    return (
      <div
        className={
          ctx.selected
            ? "h-full w-full rounded-xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950"
            : "h-full w-full"
        }
        onMouseDown={() => ctx.onSelect?.(ctx.nodeId)}
      >
        {renderWidget(spec)}
      </div>
    );
  },
};
