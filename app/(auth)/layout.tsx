import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,oklch(0.86_0.08_210_/_0.24),transparent_30%),radial-gradient(circle_at_10%_90%,oklch(0.9_0.05_85_/_0.2),transparent_36%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel-grid hidden border-r border-border/70 px-10 py-14 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Warehouse Ops System
            </p>
            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-foreground">
                Track every SKU movement with a clean inventory ledger.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Built for warehouse teams to record stock additions, sales, transfers, and losses in one audit-ready workflow.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card/85 p-5 text-xs leading-relaxed text-muted-foreground">
            Live dashboard previews, low-stock alerts, and per-product movement history are available after sign-in.
          </div>
        </section>
        <section className="flex items-center justify-center px-4 py-8 sm:px-8">{children}</section>
      </div>
    </div>
  );
}
