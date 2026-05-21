"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteHolding } from "@/app/actions/portfolio";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Holding = {
  id: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number | null;
};

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() => startTransition(() => deleteHolding(id))}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No holdings yet. Add your first stock.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="text-left px-4 py-3 font-medium">Ticker</th>
            <th className="text-right px-4 py-3 font-medium">Shares</th>
            <th className="text-right px-4 py-3 font-medium">Avg Cost</th>
            <th className="text-right px-4 py-3 font-medium">Price</th>
            <th className="text-right px-4 py-3 font-medium">Market Value</th>
            <th className="text-right px-4 py-3 font-medium">Gain / Loss</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {holdings.map((h) => {
            const price = h.currentPrice ?? h.avgCost;
            const marketValue = h.shares * price;
            const costBasis = h.shares * h.avgCost;
            const gainLoss = h.currentPrice !== null ? marketValue - costBasis : null;
            const gainLossPct =
              h.currentPrice !== null && costBasis > 0
                ? ((marketValue - costBasis) / costBasis) * 100
                : null;

            return (
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-bold tracking-wide">{h.ticker}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {h.shares % 1 === 0 ? h.shares.toLocaleString() : h.shares.toFixed(3)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatCurrency(h.avgCost)}
                </td>
                <td className="px-4 py-3 text-right">
                  {h.currentPrice !== null ? (
                    formatCurrency(h.currentPrice)
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(marketValue)}
                </td>
                <td className="px-4 py-3 text-right">
                  {gainLoss !== null ? (
                    <span className={gainLoss >= 0 ? "text-green-600" : "text-red-500"}>
                      {gainLoss >= 0 ? "+" : ""}
                      {formatCurrency(gainLoss)}
                      {gainLossPct !== null && (
                        <span className="text-xs ml-1 opacity-70">
                          ({gainLossPct >= 0 ? "+" : ""}
                          {gainLossPct.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton id={h.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
