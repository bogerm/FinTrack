# FinTrack — Phase 1 Summary

## What Was Built

Multi-user personal finance tracker — Phase 1 (transactions + dashboard). All features verified working.

### Features
- Email/password sign-up and sign-in
- Session-protected dashboard with summary cards (net balance, monthly income, monthly expenses)
- Transaction list with category filter (URL-based, server-side)
- Add transaction dialog (amount, date, description, category, type, recurring)
- Delete transaction
- Sign out

---

## Tech Stack (Key Decisions)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16.2.6, App Router, Turbopack | Latest; App Router required for server actions |
| Auth | Custom JWT via `jose` + `bcryptjs` | NextAuth v5 + PrismaAdapter had compatibility issues with Next.js 16 |
| Database | SQLite via `@prisma/adapter-libsql` + `@libsql/client` | Prisma 7 requires driver adapters; libSQL works locally |
| Prisma | v7.8.0, `prisma-client` generator, output `src/generated/prisma` | Prisma 7 breaking changes: new config pattern, no barrel index |
| UI | Shadcn UI (Nova preset) → Base UI (`@base-ui/react`) | Nova preset replaced Radix UI — `asChild` → `render` prop |
| Mutations | Server Actions (`"use server"`) + `useActionState` | No API routes needed; React 19 pattern |
| Routing protection | `src/proxy.ts` (exports `proxy`) | Next.js 16 replaced `middleware.ts` with `proxy.ts` |

---

## Critical Architecture Notes

### Prisma 7
- Config lives in `prisma.config.ts`, not just `schema.prisma`
- Generated client at `src/generated/prisma/` — import as `@/generated/prisma/client`
- **Requires a driver adapter** — `PrismaLibSql` takes `{ url: string }`, not a `Client` instance:
  ```ts
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
  new PrismaClient({ adapter });
  ```

### Next.js 16 Proxy
- File: `src/proxy.ts` (not `middleware.ts`)
- Default export must be named `proxy`, not `middleware`
- Same `config` export shape as before

### Shadcn Nova / Base UI
- `DialogTrigger` uses `render` prop, not `asChild`:
  ```tsx
  <DialogTrigger render={<Button>...</Button>} />
  ```

### Session
- Stateless JWT cookie (`session`, `httpOnly`, `sameSite: lax`, 7-day expiry)
- `src/lib/session.ts` — encrypt/decrypt/create/delete/get (server-only)
- `src/lib/dal.ts` — `verifySession()` wrapped in `cache()` for per-render memoization

### Server Actions Pattern
```ts
// State type
type State = { errors?: {...}; message?: string; success?: boolean } | undefined;

// Action
export async function doThing(state: State, formData: FormData): Promise<State>

// Client
const [state, action, pending] = useActionState(doThing, undefined);
<form action={action}>
```

### `searchParams` in Next.js 16
Must be typed as `Promise` and awaited:
```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
}
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx       — client, useActionState(signin)
│   │   └── sign-up/page.tsx       — client, useActionState(signup)
│   ├── (dashboard)/
│   │   ├── layout.tsx             — server, sidebar + signout form
│   │   └── dashboard/
│   │       ├── page.tsx           — server, summary cards + recent 5
│   │       └── transactions/
│   │           └── page.tsx       — server, category filter + list
│   ├── actions/
│   │   ├── auth.ts                — signup / signin / signout
│   │   └── transactions.ts        — createTransaction / deleteTransaction
│   └── layout.tsx
├── components/
│   ├── dashboard/summary-cards.tsx
│   └── transactions/
│       ├── add-transaction-button.tsx  — client, Dialog wrapper
│       ├── transaction-form.tsx        — client, useActionState
│       └── transaction-list.tsx        — client, delete with useTransition
├── lib/
│   ├── dal.ts        — verifySession() (server-only, cached)
│   ├── prisma.ts     — singleton with PrismaLibSql adapter
│   ├── session.ts    — JWT helpers (server-only)
│   └── utils.ts      — cn(), formatCurrency(), formatDate()
├── generated/prisma/ — Prisma 7 generated client
└── proxy.ts          — route protection (Next.js 16)
prisma/
├── schema.prisma
├── prisma.config.ts
└── migrations/
.env                  — DATABASE_URL, AUTH_SECRET, AUTH_URL
```

---

## Environment Variables

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<32-byte base64 secret>"
AUTH_URL="http://localhost:3000"
```

---

## Verification Results

All 9 test steps passed:
1. Root redirects to `/sign-in`
2. Sign-up form shows name/email/password fields
3. Sign up → land on `/dashboard`
4. Dashboard shows `$0.00 / $0.00 / $0.00` summary cards
5. Transactions page shows Add Transaction button
6. Added Food expense $15.50 → transaction appears in list
7. Transaction list count = 1
8. Dashboard cards update: net `-$15.50`, expenses `$15.50`
9. Sign out → `/sign-in`

---

## Deferred (Phases 2–4)

- **Phase 2**: Stock portfolio (holdings CRUD, mock price sync, portfolio dashboard)
- **Phase 3**: Mobile API (`POST /api/v1/log` with API key auth)
- **Phase 4**: Analytics charts (Recharts pie chart, subscription burn rate view)

Unused installed packages to clean up: `next-auth@beta`, `@auth/prisma-adapter`
