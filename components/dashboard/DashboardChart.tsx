"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface ChartData {
  day: string;
  masuk: number;
  keluar: number;
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0e0e10",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="masuk"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMasuk)"
          />
          <Area
            type="monotone"
            dataKey="keluar"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorKeluar)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
