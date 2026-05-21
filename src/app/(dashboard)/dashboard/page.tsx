import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await verifySession();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [allTransactions, monthlyTransactions, recentTransactions] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: session.userId } }),
    prisma.transaction.findMany({
      where: { userId: session.userId, date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const netBalance = allTransactions.reduce(
    (sum: number, t: { type: string; amount: number }) =>
      t.type === "INCOME" ? sum + t.amount : sum - t.amount,
    0
  );
  const monthlyIncome = monthlyTransactions
    .filter((t: { type: string }) => t.type === "INCOME")
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  const monthlyExpenses = monthlyTransactions
    .filter((t: { type: string }) => t.type === "EXPENSE")
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {session.name}</p>
      </div>

      <SummaryCards
        netBalance={netBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No transactions yet. Add your first one!
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t: { id: string; description: string; category: string; date: Date; isRecurring: boolean; type: string; amount: number }) => (
                <div key={t.id} className="flex items-center justify-between py-1">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} · {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {t.isRecurring && (
                      <Badge variant="outline" className="text-xs">Recurring</Badge>
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        t.type === "INCOME" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
