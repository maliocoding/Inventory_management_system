import Link from "next/link";
import { notFound } from "next/navigation";

import { Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getAllMovements,
  getCurrentStockBySku,
  getProductBySku,
} from "@/lib/inventory-service";

type ProductLedgerPageProps = {
  params: Promise<{ sku: string }>;
};

export default async function ProductLedgerPage({ params }: ProductLedgerPageProps) {
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const product = await getProductBySku(decodedSku);

  if (!product) {
    notFound();
  }

  const [currentStock, allMovements] = await Promise.all([
    getCurrentStockBySku(product.sku),
    getAllMovements(),
  ]);

  const ledger = allMovements.filter((entry) => entry.sku === product.sku);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Item Ledger</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            {product.category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: product.category.color }}
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {product.sku} · Current Stock:{" "}
            <span className="font-semibold text-foreground">{currentStock}</span> units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/products">Back to Products</Link>
          </Button>
          <Button asChild>
            <Link href={`/transactions/new?sku=${encodeURIComponent(product.sku)}`}>Update Stock</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Available Stock</CardDescription>
            <CardTitle className="text-2xl">{currentStock}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Low Stock Threshold</CardDescription>
            <CardTitle className="text-2xl">{product.lowStockThreshold}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Movement Entries</CardDescription>
            <CardTitle className="text-2xl">{ledger.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Product Profile</CardTitle>
              <CardDescription>{product.description ?? "No description provided."}</CardDescription>
            </div>
            {product.category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: product.category.color }}
              >
                <Tag className="h-3 w-3" />
                {product.category.name}
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Chronological stock movements for this SKU.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                  <TableCell>
                    {entry.action === "in" ? (
                      <Badge variant="secondary">In</Badge>
                    ) : (
                      <Badge variant="outline">Out</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{entry.quantity}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell className="max-w-44 text-xs text-muted-foreground">{entry.fromLocationName}</TableCell>
                  <TableCell className="max-w-44 text-xs text-muted-foreground">{entry.toLocationName}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.reference}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
