import { UpdateStockForm } from "@/components/update-stock-form";
import { getStockFormData } from "@/lib/inventory-service";

type UpdateStockPageProps = {
  searchParams: Promise<{ sku?: string }>;
};

export default async function UpdateStockPage({ searchParams }: UpdateStockPageProps) {
  const { sku } = await searchParams;
  const { products: stockProducts, locations: locationOptions } =
    await getStockFormData();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Transactions</p>
        <h1 className="text-3xl font-semibold tracking-tight">Update Stock</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Log inbound or outbound movements with reason and destination/reference for full stock traceability.
        </p>
      </header>

      <UpdateStockForm
        initialSku={sku}
        products={stockProducts}
        locations={locationOptions}
      />
    </div>
  );
}
