"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { syncPrices } from "@/app/actions/portfolio";
import { Button } from "@/components/ui/button";

export function SyncPricesButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || pending}
      onClick={() => startTransition(() => syncPrices())}
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Syncing…" : "Sync Prices"}
    </Button>
  );
}
