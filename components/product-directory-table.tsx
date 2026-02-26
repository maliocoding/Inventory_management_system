"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ArrowUpDown, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ProductRow = {
  name: string;
  sku: string;
  description?: string;
  lowStockThreshold: number;
  currentStock: number;
  movementCount: number;
  categoryName?: string | null;
  categoryColor?: string | null;
};

type SortField = "name" | "sku" | "currentStock";

type ProductDirectoryTableProps = {
  products: ProductRow[];
};

export function ProductDirectoryTable({ products }: ProductDirectoryTableProps) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [ascending, setAscending] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("__all__");

  // Build unique category list from products
  const uniqueCategories = useMemo(() => {
    const seen = new Map<string, string>(); // name → color
    for (const p of products) {
      if (p.categoryName && p.categoryColor) {
        seen.set(p.categoryName, p.categoryColor);
      }
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let filtered = normalizedQuery
      ? products.filter((product) => {
          return (
            product.name.toLowerCase().includes(normalizedQuery) ||
            product.sku.toLowerCase().includes(normalizedQuery) ||
            (product.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
            (product.categoryName?.toLowerCase().includes(normalizedQuery) ?? false)
          );
        })
      : products;

    if (categoryFilter && categoryFilter !== "__all__") {
      filtered = filtered.filter((p) => p.categoryName === categoryFilter);
    }

    return [...filtered].sort((a, b) => {
      if (sortField === "currentStock") {
        return ascending ? a.currentStock - b.currentStock : b.currentStock - a.currentStock;
      }

      const left = a[sortField].toLowerCase();
      const right = b[sortField].toLowerCase();

      return ascending ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [ascending, categoryFilter, products, query, sortField]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <Input
          aria-label="Search products"
          placeholder="Search by name, SKU, description, or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All categories</SelectItem>
            {uniqueCategories.map(([catName, catColor]) => (
              <SelectItem key={catName} value={catName}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: catColor }}
                  />
                  {catName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort: Product Name</SelectItem>
            <SelectItem value="sku">Sort: SKU</SelectItem>
            <SelectItem value="currentStock">Sort: Current Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button type="button" variant="outline" onClick={() => setAscending((prev) => !prev)}>
          <ArrowUpDown className="h-4 w-4" />
          {ascending ? "Ascending" : "Descending"}
        </Button>
      </div>

      <div className="rounded-lg border border-border/80 bg-card/75">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Low Threshold</TableHead>
              <TableHead className="text-right">Movements</TableHead>
              <TableHead className="text-right">Ledger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell className="py-6 text-center text-sm text-muted-foreground" colSpan={7}>
                  No products match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.sku} className="hover:bg-muted/30">
                  <TableCell>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.description ?? "No description"}</p>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    {product.categoryName ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                        style={{ background: product.categoryColor ?? "#6366f1" }}
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {product.categoryName}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={product.currentStock <= product.lowStockThreshold ? "destructive" : "secondary"}>
                      {product.currentStock} units
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{product.lowStockThreshold}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{product.movementCount}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/products/${encodeURIComponent(product.sku)}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
