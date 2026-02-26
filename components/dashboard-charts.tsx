"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MovementChartPoint = {
  date: string;
  label: string;
  stockIn: number;
  stockOut: number;
};

type ReasonChartPoint = {
  reason: string;
  count: number;
};

type MovementVolumeChartProps = {
  data: MovementChartPoint[];
};

type MovementReasonChartProps = {
  data: ReasonChartPoint[];
};

const CHART_COLORS = [
  "oklch(0.55 0.22 265)",
  "oklch(0.58 0.20 190)",
  "oklch(0.65 0.22 145)",
  "oklch(0.68 0.20 60)",
  "oklch(0.60 0.24 20)",
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm text-xs">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MovementVolumeChart({ data }: MovementVolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm text-muted-foreground">No movement data available yet.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label,
    "Stock In": d.stockIn,
    "Stock Out": d.stockOut,
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "oklch(0.55 0.22 265)" }}
          />
          Stock In
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: "oklch(0.58 0.20 190)" }}
          />
          Stock Out
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="oklch(0.55 0.22 265)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.58 0.20 190)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="oklch(0.58 0.20 190)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.87 0.012 265 / 0.5)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "oklch(0.50 0.015 260)" }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "oklch(0.50 0.015 260)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="Stock In"
            stroke="oklch(0.55 0.22 265)"
            strokeWidth={2.5}
            fill="url(#gradIn)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "oklch(0.55 0.22 265)" }}
          />
          <Area
            type="monotone"
            dataKey="Stock Out"
            stroke="oklch(0.58 0.20 190)"
            strokeWidth={2.5}
            fill="url(#gradOut)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "oklch(0.58 0.20 190)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MovementReasonChart({ data }: MovementReasonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-sm text-muted-foreground">No reason distribution to display.</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.87 0.012 265 / 0.5)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "oklch(0.50 0.015 260)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="reason"
            width={100}
            tick={{ fontSize: 11, fill: "oklch(0.40 0.015 260)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "oklch(0.87 0.012 265 / 0.2)" }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
