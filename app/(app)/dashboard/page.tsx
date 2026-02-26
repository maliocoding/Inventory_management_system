import Link from "next/link";

import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  Boxes,
  Building2,
  Clock3,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import {
  MovementReasonChart,
  MovementVolumeChart,
} from "@/components/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAuditSummary,
  getLocationStockTotals,
  getLowStockProducts,
  getMovementDailySeries,
  getMovementReasonBreakdown,
  getMovementTotals,
  getRecentActivity,
  getTotalItemsInStock,
  getProductsWithStock,
} from "@/lib/inventory-service";

const statCardConfigs = [
  {
    label: "Unique Products",
    description: "Tracked SKUs in the directory",
    icon: Boxes,
    color: "oklch(0.55 0.22 265)",
    bg: "oklch(0.55 0.22 265 / 0.1)",
    border: "oklch(0.55 0.22 265 / 0.2)",
  },
  {
    label: "Items In Stock",
    description: "Net units from movement ledger",
    icon: ArrowRightLeft,
    color: "oklch(0.58 0.20 190)",
    bg: "oklch(0.58 0.20 190 / 0.1)",
    border: "oklch(0.58 0.20 190 / 0.2)",
  },
  {
    label: "Low Stock Alerts",
    description: "Products at or under threshold",
    icon: AlertTriangle,
    color: "oklch(0.62 0.22 25)",
    bg: "oklch(0.62 0.22 25 / 0.1)",
    border: "oklch(0.62 0.22 25 / 0.2)",
  },
  {
    label: "Active Locations",
    description: "Storage nodes available",
    icon: Building2,
    color: "oklch(0.65 0.22 145)",
    bg: "oklch(0.65 0.22 145 / 0.1)",
    border: "oklch(0.65 0.22 145 / 0.2)",
  },
  {
    label: "Movement Entries",
    description: "Ledger lines across products",
    icon: Clock3,
    color: "oklch(0.68 0.20 60)",
    bg: "oklch(0.68 0.20 60 / 0.1)",
    border: "oklch(0.68 0.20 60 / 0.2)",
  },
  {
    label: "Audit Events",
    description: null,
    icon: ShieldCheck,
    color: "oklch(0.60 0.20 295)",
    bg: "oklch(0.60 0.20 295 / 0.1)",
    border: "oklch(0.60 0.20 295 / 0.2)",
  },
];

export default async function DashboardPage() {
  const [
    products,
    totalInStock,
    lowStockProducts,
    recentActivity,
    movementTotals,
    locationTotals,
    auditSummary,
    movementSeries,
    reasonBreakdown,
  ] = await Promise.all([
    getProductsWithStock(),
    getTotalItemsInStock(),
    getLowStockProducts(),
    getRecentActivity(),
    getMovementTotals(),
    getLocationStockTotals(),
    getAuditSummary(),
    getMovementDailySeries(7),
    getMovementReasonBreakdown(),
  ]);

  const uniqueProducts = products.length;
  const activeLocations = locationTotals.filter((l) => l.status === "active").length;

  const statValues = [
    uniqueProducts,
    totalInStock,
    lowStockProducts.length,
    activeLocations,
    movementTotals.count,
    auditSummary.totalEvents,
  ];

  const statDescriptions = [
    statCardConfigs[0].description,
    statCardConfigs[1].description,
    statCardConfigs[2].description,
    statCardConfigs[3].description,
    statCardConfigs[4].description,
    `${auditSummary.warningCount} warning · ${auditSummary.criticalCount} critical`,
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Dashboard
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Inventory Overview
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Monitor products, locations, movements, and audit activity from one control surface.
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
        {statCardConfigs.map((cfg, i) => {
          const Icon = cfg.icon;
          return (
            <Card
              key={cfg.label}
              className="stat-card group relative overflow-hidden border-0 shadow-sm transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${cfg.bg}, oklch(0.99 0.003 260 / 0.8))`,
                boxShadow: `0 1px 3px oklch(0 0 0 / 0.07), 0 0 0 1px ${cfg.border}`,
              }}
            >
              {/* Decorative blob */}
              <div
                className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: cfg.color }}
              />
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cfg.label}
                </CardTitle>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight" style={{ color: cfg.color }}>
                  {statValues[i]}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{statDescriptions[i]}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Charts */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border border-border/70 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-end justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">7-Day Movement Volume</CardTitle>
              <CardDescription className="text-xs">
                Daily inbound vs outbound quantity
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
              <Link href="/movements">Open Movements</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <MovementVolumeChart data={movementSeries} />
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-end justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">Movement Reason Mix</CardTitle>
              <CardDescription className="text-xs">
                Distribution of movement categories in the ledger
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
              <Link href="/audit">Open Audit Trail</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <MovementReasonChart data={reasonBreakdown} />
          </CardContent>
        </Card>
      </section>

      {/* Low stock + Activity */}
      <section className="grid gap-4 xl:grid-cols-[1fr_2fr]">
        {/* Low stock */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
                <CardDescription className="text-xs">
                  Products that may need replenishment
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
                <ShieldCheck className="h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">All stock levels look good!</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.sku}
                  className="group flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 transition-all hover:border-destructive/40 hover:bg-destructive/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.sku}</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                    <Link href={`/products/${encodeURIComponent(product.sku)}`}>Inspect</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Recent Movement Activity</CardTitle>
                <CardDescription className="text-xs">
                  Most recent stock operations with location traceability
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">From</TableHead>
                  <TableHead className="text-xs">To</TableHead>
                  <TableHead className="text-xs">Reference</TableHead>
                  <TableHead className="text-xs">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((entry) => (
                  <TableRow key={entry.id} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {entry.date}
                    </TableCell>
                    <TableCell>
                      {entry.action === "in" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                          <ArrowUpCircle className="h-3 w-3" />
                          In {entry.quantity}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                          <ArrowDownCircle className="h-3 w-3" />
                          Out {entry.quantity}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-foreground">{entry.productName}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.sku}</p>
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-xs text-muted-foreground">
                      {entry.fromLocationName}
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-xs text-muted-foreground">
                      {entry.toLocationName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.reference}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
