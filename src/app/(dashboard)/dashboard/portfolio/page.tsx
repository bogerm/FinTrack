import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { AddHoldingButton } from "@/components/portfolio/add-holding-button";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { SyncPricesButton } from "@/components/portfolio/sync-prices-button";
import { formatDate } from "@/lib/utils";

export default async function PortfolioPage() {
  const session = await verifySession();

  const holdings = await prisma.stockHolding.findMany({
    where: { userId: session.userId },
    orderBy: { ticker: "asc" },
  });

  const tickers = holdings.map((h) => h.ticker);
  const prices =
    tickers.length > 0
      ? await prisma.stockPrice.findMany({ where: { ticker: { in: tickers } } })
      : [];

  const priceMap = Object.fromEntries(prices.map((p) => [p.ticker, p]));

  const lastSynced = prices.reduce<Date | null>((latest, p) => {
    const d = new Date(p.lastUpdated);
    return !latest || d > latest ? d : latest;
  }, null);

  const enrichedHoldings = holdings.map((h) => ({
    ...h,
    currentPrice: priceMap[h.ticker]?.price ?? null,
  }));

  const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
  const totalValue = enrichedHoldings.reduce(
    (s, h) => s + h.shares * (h.currentPrice ?? h.avgCost),
    0
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            {holdings.length} {holdings.length === 1 ? "holding" : "holdings"}
            {lastSynced && ` · prices as of ${formatDate(lastSynced)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <SyncPricesButton disabled={holdings.length === 0} />
          <AddHoldingButton />
        </div>
      </div>

      <PortfolioSummary
        totalValue={totalValue}
        totalCost={totalCost}
        holdingsCount={holdings.length}
        hasPrices={prices.length > 0}
      />

      <div className="bg-background rounded-lg border">
        <HoldingsTable holdings={enrichedHoldings} />
      </div>
    </div>
  );
}
