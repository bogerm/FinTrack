import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ApiKeyList } from "@/components/api-keys/api-key-list";
import { CreateApiKeyButton } from "@/components/api-keys/create-api-key-button";

export default async function ApiKeysPage() {
  const session = await verifySession();

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.userId },
    orderBy: { id: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Log transactions from mobile apps or scripts.
          </p>
        </div>
        <CreateApiKeyButton />
      </div>

      <div className="bg-background rounded-lg border">
        <ApiKeyList apiKeys={apiKeys} />
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <p className="text-sm font-medium">Usage</p>
        <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre font-mono">{`POST /api/v1/log
Authorization: Bearer <your-api-key>
Content-Type: application/json

{
  "amount": 15.50,
  "description": "Grocery store",
  "category": "Food",
  "type": "EXPENSE",
  "date": "2026-05-21",
  "isRecurring": false
}`}</pre>
      </div>
    </div>
  );
}
