"use client";

import { useActionState, useEffect } from "react";
import { addHolding } from "@/app/actions/portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSuccess?: () => void;
};

export function HoldingForm({ onSuccess }: Props) {
  const [state, action, pending] = useActionState(addHolding, undefined);

  useEffect(() => {
    if (state?.success) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="ticker">Ticker Symbol</Label>
        <Input
          id="ticker"
          name="ticker"
          placeholder="e.g. AAPL"
          autoCapitalize="characters"
          autoComplete="off"
        />
        {state?.errors?.ticker && (
          <p className="text-xs text-destructive">{state.errors.ticker[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="shares">Shares</Label>
          <Input
            id="shares"
            name="shares"
            type="number"
            step="0.001"
            min="0.001"
            placeholder="10"
          />
          {state?.errors?.shares && (
            <p className="text-xs text-destructive">{state.errors.shares[0]}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="avgCost">Avg Cost / Share ($)</Label>
          <Input
            id="avgCost"
            name="avgCost"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="150.00"
          />
          {state?.errors?.avgCost && (
            <p className="text-xs text-destructive">{state.errors.avgCost[0]}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Already hold this ticker? Shares will be added and cost basis averaged.
      </p>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Adding…" : "Add Holding"}
      </Button>
    </form>
  );
}
