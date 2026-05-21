"use client";

import { useActionState, useEffect } from "react";
import { createTransaction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPENSE_CATEGORIES = ["Food", "Rent", "Subscriptions", "Transport", "Entertainment", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Dividend", "Gift", "Other"];

type Props = {
  onSuccess?: () => void;
};

export function TransactionForm({ onSuccess }: Props) {
  const [state, action, pending] = useActionState(createTransaction, undefined);

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue="EXPENSE">
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
          />
          {state?.errors?.amount && (
            <p className="text-xs text-destructive">{state.errors.amount[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="What was this for?" />
        {state?.errors?.description && (
          <p className="text-xs text-destructive">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Select name="category">
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" disabled>Expenses</SelectItem>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
              <SelectItem value="" disabled>Income</SelectItem>
              {INCOME_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.category && (
            <p className="text-xs text-destructive">{state.errors.category[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={today} />
          {state?.errors?.date && (
            <p className="text-xs text-destructive">{state.errors.date[0]}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="isRecurring" name="isRecurring" />
        <Label htmlFor="isRecurring" className="font-normal cursor-pointer">
          Recurring (monthly)
        </Label>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Adding…" : "Add Transaction"}
      </Button>
    </form>
  );
}
