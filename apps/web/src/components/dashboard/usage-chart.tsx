"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const data = [
  { day: "Mon", messages: 5800, calls: 710 },
  { day: "Tue", messages: 6400, calls: 860 },
  { day: "Wed", messages: 8000, calls: 920 },
  { day: "Thu", messages: 7600, calls: 980 },
  { day: "Fri", messages: 9100, calls: 1020 },
  { day: "Sat", messages: 7300, calls: 760 },
  { day: "Sun", messages: 6900, calls: 720 }
];

export function UsageChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="messagesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1674bf" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#1674bf" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7dce2" />
          <XAxis dataKey="day" stroke="#738194" />
          <YAxis stroke="#738194" />
          <Tooltip />
          <Area type="monotone" dataKey="messages" stroke="#1674bf" fill="url(#messagesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
