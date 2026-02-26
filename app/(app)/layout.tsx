import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNavLinks } from "@/components/app-nav-links";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/movements", label: "Movements" },
  { href: "/locations", label: "Locations" },
  { href: "/audit", label: "Audit Trail" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/products/new", label: "New Product" },
  { href: "/transactions/new", label: "Update Stock" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          borderColor: "oklch(0.87 0.012 265 / 0.6)",
          background: "oklch(0.97 0.005 260 / 0.85)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Logo */}
            <Link href="/dashboard" className="group flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
                style={{
                  background: "linear-gradient(135deg, oklch(0.55 0.22 265), oklch(0.58 0.20 190))",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-white"
                >
                  <rect x="1" y="8" width="6" height="7" rx="1" fill="currentColor" opacity="0.9" />
                  <rect x="9" y="1" width="6" height="14" rx="1" fill="currentColor" />
                  <rect x="1" y="1" width="6" height="5" rx="1" fill="currentColor" opacity="0.6" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
                  Warehouse IMS
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Inventory Management System
                </p>
              </div>
            </Link>

            {/* User info */}
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium"
              >
                {session.user.email}
              </Badge>
              <LogoutButton />
            </div>
          </div>
          <AppNavLinks items={navItems} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="panel-grid rounded-2xl border border-border/70 bg-card/70 p-4 shadow-[0_20px_60px_-20px_oklch(0.55_0.22_265_/_0.12)] sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
