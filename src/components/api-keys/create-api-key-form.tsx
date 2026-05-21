"use client";

import { useActionState } from "react";
import { createApiKey } from "@/app/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { onClose?: () => void };

export function CreateApiKeyForm({ onClose }: Props) {
  const [state, action, pending] = useActionState(createApiKey, undefined);

  if (state?.createdKey) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Copy your API key now — it won&apos;t be shown again.
        </p>
        <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto select-all font-mono break-all">
          {state.createdKey}
        </pre>
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Key name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. iPhone Shortcut"
          autoFocus
          autoComplete="off"
        />
        {state?.errors?.name && (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create Key"}
        </Button>
      </div>
    </form>
  );
}
