import { Tag } from "lucide-react";

import { CategoryManager } from "@/components/category-manager";
import {
  getCategoryProductCounts,
  listCategories,
} from "@/lib/inventory-service";

export default async function CategoriesPage() {
  const [cats, counts] = await Promise.all([
    listCategories(),
    getCategoryProductCounts(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Configuration
          </p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Product Categories
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Organise your product directory with colour-coded categories. Assign
          categories when creating products and filter by them in the product list.
        </p>
      </header>

      <CategoryManager initialCategories={cats} productCounts={counts} />
    </div>
  );
}
