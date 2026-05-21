"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type Transaction = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  type: string;
  isRecurring: boolean;
};

type Props = {
  transactions: Transaction[];
};

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() => startTransition(() => deleteTransaction(id))}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No transactions found. Add one to get started.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 px-1">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{t.description}</p>
            <p className="text-xs text-muted-foreground">
              {t.category} · {formatDate(t.date)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {t.isRecurring && (
              <Badge variant="outline" className="text-xs hidden sm:flex">Recurring</Badge>
            )}
            <span
              className={`text-sm font-semibold min-w-[80px] text-right ${
                t.type === "INCOME" ? "text-green-600" : "text-red-500"
              }`}
            >
              {t.type === "INCOME" ? "+" : "-"}
              {formatCurrency(t.amount)}
            </span>
            <DeleteButton id={t.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
