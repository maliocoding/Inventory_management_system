"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: string;
  name: string;
  color: string;
};

export function CreateProductForm() {
  const router = useRouter();
  const [submittedSku, setSubmittedSku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("__none__");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json() as Promise<{ data?: Category[] }>)
      .then((json) => {
        if (json.data) setCategories(json.data);
      })
      .catch(() => {/* silently ignore */});
  }, []);

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>New Product Profile</CardTitle>
        <CardDescription>
          Initial stock is not set here. Record first inventory via an &quot;In&quot; transaction to preserve ledger integrity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              setError(null);
              setPending(true);

              const form = event.currentTarget;
              const formData = new FormData(form);
              const name = String(formData.get("name") ?? "").trim();
              const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
              const lowStockThreshold = Number(formData.get("lowStockThreshold") ?? 0);
              const description = String(formData.get("description") ?? "").trim();

              const response = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  sku,
                  lowStockThreshold,
                  description: description || undefined,
                  categoryId: selectedCategory && selectedCategory !== "__none__" ? selectedCategory : null,
                }),
              });

              const result = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(result.error ?? "Failed to save product.");
                setPending(false);
                return;
              }

              setSubmittedSku(sku || null);
              setSelectedCategory("__none__");
              form.reset();
              router.refresh();
              setPending(false);
            })();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" name="name" placeholder="Industrial Gloves" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sku">SKU (Unique)</Label>
              <Input id="product-sku" name="sku" placeholder="SKU-001" required />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-threshold">Low Stock Threshold</Label>
              <Input
                id="product-threshold"
                name="lowStockThreshold"
                type="number"
                min={0}
                defaultValue={40}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Category (Optional)</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">No category</span>
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: cat.color }}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Description (Optional)</Label>
            <Textarea
              id="product-description"
              name="description"
              placeholder="Nitrile gloves for handling and packing."
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save Product"}
          </Button>
        </form>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
        {submittedSku ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            Product <span className="font-semibold">{submittedSku}</span> created successfully.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
