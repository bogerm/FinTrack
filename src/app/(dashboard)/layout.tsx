import Link from "next/link";
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Key, BarChart3, LogOut } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { signout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 flex-shrink-0 border-r bg-background flex flex-col">
        <div className="p-4">
          <span className="text-lg font-bold tracking-tight">FinTrack</span>
        </div>
        <Separator />
        <nav className="flex-1 p-2 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Transactions
          </Link>
          <Link
            href="/dashboard/portfolio"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Portfolio
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Key className="h-4 w-4" />
            API Keys
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </nav>
        <Separator />
        <div className="p-3 space-y-1">
          <p className="px-3 py-1 text-xs text-muted-foreground truncate">{session.email}</p>
          <form action={signout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20">{children}</main>
    </div>
  );
}
