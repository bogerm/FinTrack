import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";

const ALL_CATEGORIES = [
  "Food", "Rent", "Subscriptions", "Transport", "Entertainment",
  "Salary", "Freelance", "Dividend", "Gift", "Other",
];

type SearchParams = Promise<{ category?: string }>;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await verifySession();
  const { category } = await searchParams;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">{transactions.length} transactions</p>
        </div>
        <AddTransactionButton />
      </div>

      <div className="flex gap-2 flex-wrap">
        <CategoryFilter current={category} />
      </div>

      <div className="bg-background rounded-lg border">
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}

function CategoryFilter({ current }: { current?: string }) {
  const filters = [{ label: "All", value: "all" }, ...ALL_CATEGORIES.map((c) => ({ label: c, value: c }))];
  return (
    <>
      {filters.map((f) => {
        const isActive = (!current && f.value === "all") || current === f.value;
        return (
          <a
            key={f.value}
            href={f.value === "all" ? "/dashboard/transactions" : `/dashboard/transactions?category=${f.value}`}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-border"
            }`}
          >
            {f.label}
          </a>
        );
      })}
    </>
  );
}
