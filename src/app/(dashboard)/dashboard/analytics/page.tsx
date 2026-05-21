import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SpendingPieChart } from "@/components/analytics/spending-pie-chart";
import { SubscriptionTable } from "@/components/analytics/subscription-table";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const session = await verifySession();

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
  });

  // Expense breakdown by category — all time
  const expenseMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "EXPENSE") {
      expenseMap.set(t.category, (expenseMap.get(t.category) ?? 0) + t.amount);
    }
  }
  const categoryData = Array.from(expenseMap.entries())
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
  const totalExpenses = categoryData.reduce((sum, d) => sum + d.value, 0);

  // Subscription burn rate — one entry per unique description (latest amount wins)
  const seen = new Set<string>();
  const subscriptions: Array<{
    description: string;
    category: string;
    type: string;
    amount: number;
  }> = [];
  for (const t of transactions) {
    if (t.isRecurring && !seen.has(t.description)) {
      seen.add(t.description);
      subscriptions.push({
        description: t.description,
        category: t.category,
        type: t.type,
        amount: t.amount,
      });
    }
  }
  subscriptions.sort((a, b) => b.amount - a.amount);

  const monthlyBurn = subscriptions
    .filter((s) => s.type === "EXPENSE")
    .reduce((sum, s) => sum + s.amount, 0);
  const monthlyRecurringIncome = subscriptions
    .filter((s) => s.type === "INCOME")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Spending breakdown and subscription tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by Category</CardTitle>
            <CardDescription>
              All-time expense breakdown
              {totalExpenses > 0 && ` · ${formatCurrency(totalExpenses)} total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingPieChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Burn Rate</CardTitle>
            <CardDescription>
              Recurring transactions
              {subscriptions.length > 0 &&
                ` · ${formatCurrency(monthlyBurn)}/mo expenses`}
            </CardDescription>
          </CardHeader>
          <CardContent className="!p-0">
            <SubscriptionTable
              subscriptions={subscriptions}
              monthlyBurn={monthlyBurn}
              monthlyIncome={monthlyRecurringIncome}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
