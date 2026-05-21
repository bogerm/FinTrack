import { TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  totalValue: number;
  totalCost: number;
  holdingsCount: number;
  hasPrices: boolean;
};

export function PortfolioSummary({ totalValue, totalCost, holdingsCount, hasPrices }: Props) {
  const gainLoss = totalValue - totalCost;
  const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {holdingsCount === 0
              ? "No holdings"
              : hasPrices
              ? "Based on last synced prices"
              : "Based on cost basis (sync to refresh)"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cost Basis</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total amount invested</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {gainLoss >= 0 ? "Total Gain" : "Total Loss"}
          </CardTitle>
          {gainLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${gainLoss >= 0 ? "text-green-600" : "text-red-500"}`}>
            {gainLoss >= 0 ? "+" : ""}
            {formatCurrency(gainLoss)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {gainLossPct >= 0 ? "+" : ""}
            {gainLossPct.toFixed(2)}% overall return
            {!hasPrices && holdingsCount > 0 && " · sync prices to update"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
