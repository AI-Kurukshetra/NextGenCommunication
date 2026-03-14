"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ChartPoint = Record<string, string | number | null | undefined>;

type Series = {
  key: string;
  label: string;
  color: string;
};

type BaseChartProps = {
  data: ChartPoint[];
  className?: string;
  height?: number;
};

type GradientAreaChartProps = BaseChartProps & {
  xKey: string;
  series: Series[];
};

type GroupedBarChartProps = BaseChartProps & {
  xKey: string;
  series: Series[];
};

type DonutChartProps = BaseChartProps & {
  nameKey: string;
  valueKey: string;
  colors?: string[];
};

const defaultDonutColors = ["#0f766e", "#0369a1", "#f59e0b", "#ef4444", "#6d28d9", "#334155"];

function renderTooltipValue(value: string | number | Array<string | number> | null | undefined): string | number {
  if (Array.isArray(value)) {
    return value.map((item) => renderTooltipValue(item)).join(" / ");
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-US");
  }

  return value ?? "-";
}

export function GradientAreaChart({ data, xKey, series, className, height = 260 }: GradientAreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {series.map((item) => (
              <linearGradient key={item.key} id={`gradient-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={item.color} stopOpacity={0.42} />
                <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#dbe4ef" />
          <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <Tooltip
            formatter={(value) => renderTooltipValue(value)}
            contentStyle={{ borderRadius: "12px", borderColor: "#dbe4ef" }}
          />
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              fill={`url(#gradient-${item.key})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GroupedBarChart({ data, xKey, series, className, height = 260 }: GroupedBarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#dbe4ef" />
          <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <Tooltip
            formatter={(value) => renderTooltipValue(value)}
            contentStyle={{ borderRadius: "12px", borderColor: "#dbe4ef" }}
          />
          {series.map((item) => (
            <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color} radius={[8, 8, 2, 2]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  data,
  nameKey,
  valueKey,
  colors = defaultDonutColors,
  className,
  height = 260
}: DonutChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip
            formatter={(value) => renderTooltipValue(value)}
            contentStyle={{ borderRadius: "12px", borderColor: "#dbe4ef" }}
          />
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            innerRadius={62}
            outerRadius={96}
            paddingAngle={3}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
