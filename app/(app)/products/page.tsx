import Link from "next/link";

import { ProductDirectoryTable } from "@/components/product-directory-table";
import { Button } from "@/components/ui/button";
import { getProductsWithStock } from "@/lib/inventory-service";

export default async function ProductsPage() {
  const products = await getProductsWithStock();

  const productRows = products.map((product) => ({
    name: product.name,
    sku: product.sku,
    description: product.description ?? undefined,
    lowStockThreshold: product.lowStockThreshold,
    currentStock: product.currentStock,
    movementCount: product.movementCount,
    categoryName: product.categoryName ?? undefined,
    categoryColor: product.categoryColor ?? undefined,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Products</p>
          <h1 className="text-3xl font-semibold tracking-tight">Product Directory</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Search and sort all tracked products with current stock and movement volume.
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">Create Product</Link>
        </Button>
      </header>

      <ProductDirectoryTable products={productRows} />
    </div>
  );
}
