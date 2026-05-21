# FinTrack — Phase 2 Summary

## What Was Built

Stock portfolio tracker — Phase 2 (holdings CRUD, mock price sync, portfolio dashboard). All features verified working.

### Features
- Add stock holding (ticker, shares, avg cost) with validation
- Duplicate ticker → weighted-average cost accumulation (upsert, not duplicate)
- Delete holding
- Sync Prices (mock — deterministic base ± 3% noise per sync)
- Portfolio summary cards: Portfolio Value, Cost Basis, Total Gain/Loss
- Holdings table: Ticker, Shares, Avg Cost, Price, Market Value, Gain/Loss (with % badge)
- "Prices as of [date]" subtitle when prices have been synced
- Portfolio nav link in sidebar

---

## New Files

```
src/
├── app/
│   ├── (dashboard)/dashboard/portfolio/
│   │   └── page.tsx                      — server page, fetches holdings + prices
│   └── actions/
│       └── portfolio.ts                  — addHolding / deleteHolding / syncPrices
└── components/portfolio/
    ├── add-holding-button.tsx            — client, Dialog wrapper
    ├── holding-form.tsx                  — client, useActionState(addHolding)
    ├── holdings-table.tsx                — client, table + DeleteButton (useTransition)
    ├── portfolio-summary.tsx             — server component, 3 summary cards
    └── sync-prices-button.tsx            — client, useTransition(syncPrices), spin anim
```

**Modified:** `src/app/(dashboard)/layout.tsx` — added Portfolio nav link with `TrendingUp` icon.

---

## Schema (already migrated in Phase 1 init)

```prisma
model StockHolding {
  id        String   @id @default(cuid())
  userId    String
  ticker    String
  shares    Float
  avgCost   Float
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, ticker])   // key for upsert: userId_ticker
}

model StockPrice {
  ticker      String   @id
  price       Float
  lastUpdated DateTime @default(now())
  // global (no userId) — prices are universal
}
```

No new migration was needed — both models were already in `20260521114715_init`.

---

## Key Implementation Notes

### Weighted Average Cost Upsert
`addHolding` reads existing holding via `findUnique({ where: { userId_ticker: { userId, ticker } } })`.
If found: `newAvgCost = (existingShares * existingAvgCost + newShares * newAvgCost) / totalShares`.
If not: plain `create`.

### Mock Price Generation
```ts
const MOCK_BASE_PRICES: Record<string, number> = {
  AAPL: 213.32, MSFT: 415.50, GOOGL: 178.25, AMZN: 197.12,
  TSLA: 245.80, NVDA: 135.72, META: 612.45, NFLX: 692.30,
  SPY: 582.10, QQQ: 498.75, BRK: 423.80, JPM: 246.40,
  V: 312.60, MA: 518.20, DIS: 98.45, BABA: 87.30,
  INTC: 21.80, AMD: 168.40, PLTR: 28.90, COIN: 245.10,
};

function mockPrice(ticker: string): number {
  const base = MOCK_BASE_PRICES[ticker] ??
    (ticker.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 491) + 10;
  return parseFloat((base * (1 + (Math.random() - 0.5) * 0.06)).toFixed(2));
}
```
Unknown tickers get a deterministic ASCII-hash base in the range [10, 500], then ±3% noise per sync call.

### Security
`deleteHolding` uses `deleteMany({ where: { id, userId } })` — userId guard prevents deleting other users' holdings.
`syncPrices` fetches only the calling user's tickers before upserting prices.

### Portfolio Page Data Flow
```
Server page:
  1. verifySession()
  2. prisma.stockHolding.findMany({ where: { userId } })
  3. prisma.stockPrice.findMany({ where: { ticker: { in: tickers } } })
  4. Build priceMap, compute lastSynced, enrich holdings with currentPrice
  5. totalCost = Σ(shares × avgCost), totalValue = Σ(shares × (currentPrice ?? avgCost))
  6. Pass enrichedHoldings → HoldingsTable, totals → PortfolioSummary
```

### Gain/Loss Display
- Has price: colored green/red, shows `+$X.XX (+Y.Y%)`
- No price yet: `—` dash (both Price and Gain/Loss columns)
- Summary cards also show "sync prices to update" hint when `hasPrices=false`

---

## Verification Results

All 6 test steps + 1 probe passed (Playwright e2e against dev server):
1. Sign up → dashboard ✅
2. Portfolio page: empty state, summary cards at $0, Add Holding + Sync Prices buttons visible ✅
3. Add AAPL 10 shares @ $150 → appears in table, Price and Gain/Loss show `—` ✅
4. Sync Prices → price populated ($216.26), gain +$662.60 (+44.17%), summary cards updated ✅
5. Add AAPL again 5 shares @ $200 → upserted: 15 total shares, $166.67 avg cost ✅
6. Delete holding → empty state, summary cards reset to $0 ✅
7. 🔍 Invalid ticker "123" → validation error shown ✅

---

## Deferred (Phases 3–4)

- **Phase 3**: Mobile API (`POST /api/v1/log` with API key auth, `ApiKey` model already in schema)
- **Phase 4**: Analytics charts (Recharts pie chart, subscription burn rate view)
