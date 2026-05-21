# FinTrack — Phase 4 Summary

## What Was Built

Analytics dashboard — Phase 4 (spending pie chart by category + subscription burn rate view). All features verified working.

### Features
- Analytics nav link in sidebar (`BarChart3` icon)
- **Spending by Category** — Recharts pie chart of all-time expense breakdown by category
  - Color-coded slices with inline percentage labels (hidden below 5%)
  - Tooltip showing exact `$amount` on hover
  - Legend listing all categories
  - Total expenses shown in card description
  - Empty state when no expense transactions exist
- **Subscription Burn Rate** — recurring transaction list
  - Deduplicates by description: one row per unique recurring item (latest amount wins)
  - Sorted by amount descending
  - Income/Expense badge per item (green/red)
  - Monthly net row at the bottom (recurring income − recurring expenses)
  - Card description shows monthly EXPENSE burn total
  - Empty state when no recurring transactions exist

---

## New Files

```
src/
├── app/
│   └── (dashboard)/dashboard/analytics/
│       └── page.tsx                        — server page, fetches + aggregates data
└── components/analytics/
    ├── spending-pie-chart.tsx              — client, Recharts PieChart
    └── subscription-table.tsx             — server component, subscription list
```

**Modified:** `src/app/(dashboard)/layout.tsx` — added Analytics nav link with `BarChart3` icon.

**Added package:** `recharts@3.8.1`

---

## Key Implementation Notes

### Data aggregation (server-side, in page.tsx)

**Spending by category:**
```ts
const expenseMap = new Map<string, number>();
for (const t of transactions) {
  if (t.type === "EXPENSE") {
    expenseMap.set(t.category, (expenseMap.get(t.category) ?? 0) + t.amount);
  }
}
const categoryData = Array.from(expenseMap.entries())
  .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
  .sort((a, b) => b.value - a.value);
```

**Subscription dedup (latest amount per description):**
```ts
const seen = new Set<string>();
for (const t of transactions) { // ordered date desc
  if (t.isRecurring && !seen.has(t.description)) {
    seen.add(t.description);
    subscriptions.push({ description: t.description, category: t.category, type: t.type, amount: t.amount });
  }
}
```

### Recharts PieChart (client component)
```tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366f1", "#f43f5e", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899",
];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name"
      label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""}
      labelLine={false}
    >
      {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
    </Pie>
    <Tooltip formatter={(value: number) => [formatCurrency(value), "Spending"]} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

## Verification Results

All 16 steps passed (Playwright e2e against dev server):
1. Sign up → dashboard ✅
2. Analytics nav link present in sidebar ✅
3. Analytics page loads with correct heading ✅
4. Empty pie chart message shown when no data ✅
5. Empty subscription message shown when no data ✅
6. Added 4 transactions (Food $50, Transport $30, Netflix $15 recurring, Spotify $9 recurring) ✅
7. Recharts SVG rendered on analytics page ✅
8. Food appears in chart/legend ✅
9. Transport appears in chart/legend ✅
10. Subscriptions appears in chart/legend ✅
11. Netflix appears in subscription table ✅
12. Spotify appears in subscription table ✅
13. Total expenses $104.00 shown in card header ✅
14. Monthly burn $24.00 shown in subscription card header ✅
15. Monthly net row present in subscription footer ✅
16. 🔍 Re-navigation to analytics page works ✅
