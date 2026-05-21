"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { revokeApiKey } from "@/app/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  active: boolean;
};

function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() => startTransition(() => revokeApiKey(id))}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}

export function ApiKeyList({ apiKeys }: { apiKeys: ApiKey[] }) {
  if (apiKeys.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No API keys yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {apiKeys.map((k) => (
        <div key={k.id} className="flex items-center justify-between px-4 py-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{k.name}</span>
              {k.active ? (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Revoked
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {k.key.slice(0, 10)}••••••••••••••••••••••••
            </p>
          </div>
          <RevokeButton id={k.id} />
        </div>
      ))}
    </div>
  );
}
