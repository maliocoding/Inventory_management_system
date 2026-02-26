import Link from "next/link";

import { ArrowRightLeft, TrendingDown, TrendingUp } from "lucide-react";

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
import { getAllMovements, getMovementTotals } from "@/lib/inventory-service";

export default async function MovementsPage() {
  const [movements, totals] = await Promise.all([
    getAllMovements(),
    getMovementTotals(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Movements
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Movement Ledger</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Complete stock movement timeline with source and destination
            locations.
          </p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">Log New Movement</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Movements</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totals.count}</p>
            <p className="text-xs text-muted-foreground">
              Entries logged in the ledger.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Inbound Units</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totals.totalIn}</p>
            <p className="text-xs text-muted-foreground">
              Units moved into internal locations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Outbound Units</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totals.totalOut}</p>
            <p className="text-xs text-muted-foreground">
              Units moved out of internal locations.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Movement Records</CardTitle>
          <CardDescription>
            Action, quantity, reason, and location traceability for each
            movement.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap">{movement.date}</TableCell>
                  <TableCell>
                    <Badge variant={movement.action === "in" ? "secondary" : "outline"}>
                      {movement.action === "in" ? "In" : "Out"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{movement.productName}</p>
                    <p className="text-xs text-muted-foreground">{movement.sku}</p>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.quantity}
                  </TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell className="max-w-44 text-xs text-muted-foreground">
                    {movement.fromLocationName}
                  </TableCell>
                  <TableCell className="max-w-44 text-xs text-muted-foreground">
                    {movement.toLocationName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{movement.reference}</TableCell>
                  <TableCell className="text-muted-foreground">{movement.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
