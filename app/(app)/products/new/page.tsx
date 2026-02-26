import { CreateProductForm } from "@/components/create-product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Product Management</p>
        <h1 className="text-3xl font-semibold tracking-tight">Create Product</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Add product metadata and unique SKU. Initial stock should be logged as the first stock-in transaction.
        </p>
      </header>

      <CreateProductForm />
    </div>
  );
}
