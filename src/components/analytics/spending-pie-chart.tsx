"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type CategoryDataItem = { name: string; value: number };

const COLORS = [
  "#6366f1", "#f43f5e", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899",
];

export function SpendingPieChart({ data }: { data: CategoryDataItem[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground text-center px-4">
        No expense data yet. Add transactions to see your spending breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }: { name: string; percent: number }) =>
            percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), "Spending"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
