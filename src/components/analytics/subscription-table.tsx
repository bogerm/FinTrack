import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type Subscription = {
  description: string;
  category: string;
  type: string;
  amount: number;
};

export function SubscriptionTable({
  subscriptions,
  monthlyBurn,
  monthlyIncome,
}: {
  subscriptions: Subscription[];
  monthlyBurn: number;
  monthlyIncome: number;
}) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground px-4">
        No recurring transactions yet. Check the "Recurring" box when adding a transaction.
      </div>
    );
  }

  const net = monthlyIncome - monthlyBurn;

  return (
    <div>
      <div className="divide-y">
        {subscriptions.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate">{s.description}</p>
              <p className="text-xs text-muted-foreground">{s.category}</p>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <Badge
                variant="outline"
                className={
                  s.type === "INCOME"
                    ? "text-xs text-green-600 border-green-200"
                    : "text-xs text-red-500 border-red-200"
                }
              >
                {s.type === "INCOME" ? "Income" : "Expense"}
              </Badge>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  s.type === "INCOME" ? "text-green-600" : "text-red-500"
                }`}
              >
                {s.type === "INCOME" ? "+" : "-"}
                {formatCurrency(s.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-3 flex items-center justify-between bg-muted/40 rounded-b-xl">
        <p className="text-sm font-medium text-muted-foreground">Monthly net</p>
        <span
          className={`text-sm font-bold tabular-nums ${
            net >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {net >= 0 ? "+" : "-"}
          {formatCurrency(Math.abs(net))}
        </span>
      </div>
    </div>
  );
}
