# FinTrack — Phase 3 Summary

## What Was Built

Mobile API with API key auth — Phase 3 (API key management UI + `POST /api/v1/log` REST endpoint). All features verified working.

### Features
- Create API key (generates `ft_` + 48 hex chars; shown once on creation)
- API key list with masked display (`ft_xxxxxxxx••••••••••••••••••••••`)
- Revoke (delete) API key
- `POST /api/v1/log` — logs a transaction via Bearer token auth
- Request validation with per-field error details
- API Keys nav link in sidebar

---

## New Files

```
src/
├── app/
│   ├── (dashboard)/dashboard/api-keys/
│   │   └── page.tsx                         — server page, lists keys + usage example
│   ├── actions/
│   │   └── api-keys.ts                      — createApiKey / revokeApiKey
│   └── api/v1/log/
│       └── route.ts                         — POST handler, Bearer auth + transaction create
└── components/api-keys/
    ├── api-key-list.tsx                     — client, list + RevokeButton (useTransition)
    ├── create-api-key-button.tsx            — client, Dialog wrapper
    └── create-api-key-form.tsx              — client, useActionState(createApiKey)
```

**Modified:** `src/app/(dashboard)/layout.tsx` — added API Keys nav link with `Key` icon.

---

## API Reference

### `POST /api/v1/log`

**Auth:** `Authorization: Bearer <api-key>`

**Request body:**
```json
{
  "amount": 15.50,
  "description": "Grocery store",
  "category": "Food",
  "type": "EXPENSE",
  "date": "2026-05-21",
  "isRecurring": false
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `amount` | number | yes | must be > 0 |
| `description` | string | yes | trimmed |
| `category` | string | yes | free text |
| `type` | string | yes | `"INCOME"` or `"EXPENSE"` |
| `date` | string | no | ISO date; defaults to now |
| `isRecurring` | boolean | no | defaults to false |

**Responses:**
- `201` — `{ "success": true, "id": "<cuid>" }`
- `400` — `{ "error": "Validation failed", "details": { "field": "message" } }`
- `401` — `{ "error": "Missing or invalid Authorization header" }` or `{ "error": "Invalid or revoked API key" }`

---

## Key Implementation Notes

### Key Generation
```ts
import { randomBytes } from "crypto";
const key = "ft_" + randomBytes(24).toString("hex"); // 51 chars total
```
Stored as plaintext in `ApiKey.key` (unique index). Shown once in the UI after creation; thereafter only the first 10 chars are displayed.

### Security
- `revokeApiKey` uses `deleteMany({ where: { id, userId } })` — userId guard prevents deleting other users' keys.
- API route looks up key with `findUnique({ where: { key } })` and checks `active === true`.
- Transaction is created under `apiKey.userId`, not a session — the key IS the identity proof.

### "Show once" UI pattern
`createApiKey` returns `{ success: true, createdKey: key }` in the server action state.
`CreateApiKeyForm` conditionally renders either the name-input form or a `<pre>` with the full key + "Done" button, based on `state.createdKey`. Once the dialog closes and state resets, the key is gone.

---

## Verification Results

All 9 steps passed (Playwright e2e + API probes):
1. Sign up → dashboard ✅
2. API Keys page loads, heading correct, empty state shown ✅
3. Create key → dialog shows `ft_…` key (51 chars), starts with `ft_` ✅
4. Key listed with name "Test Script" and Active badge ✅
5. `POST /api/v1/log` with key → 201, `{ success: true, id: "<cuid>" }` ✅
6. Transaction appears on `/dashboard/transactions` page ✅
7. 🔍 Empty description → 400 `{ details: { description: "description is required" } }` ✅
8. 🔍 Invalid type `"WRONG"` → 400 `{ details: { type: "type must be \"INCOME\" or \"EXPENSE\"" } }` ✅
9. After revoke, empty state restored; deleted key → 401 `"Invalid or revoked API key"` ✅

---

## Deferred (Phase 4)

- **Phase 4**: Analytics charts (Recharts pie chart by category, subscription burn rate view)
