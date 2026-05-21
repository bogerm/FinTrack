import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Props = {
  netBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
};

export function SummaryCards({ netBalance, monthlyIncome, monthlyExpenses }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All-time income minus expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">This Month's Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
          <p className="text-xs text-muted-foreground mt-1">Current calendar month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">This Month's Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-500">{formatCurrency(monthlyExpenses)}</p>
          <p className="text-xs text-muted-foreground mt-1">Current calendar month</p>
        </CardContent>
      </Card>
    </div>
  );
}
