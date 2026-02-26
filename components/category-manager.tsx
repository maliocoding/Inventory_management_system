"use client";

import { useEffect, useRef, useState } from "react";

import { Palette, Plus, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Category = {
  id: string;
  name: string;
  description: string | null;
  color: string;
};

const PRESET_COLORS = [
  "#6366f1", "#3b82f6", "#10b981", "#f59e0b",
  "#ec4899", "#ef4444", "#8b5cf6", "#14b8a6",
];

type CategoryManagerProps = {
  initialCategories: Category[];
  productCounts: Record<string, number>;
};

export function CategoryManager({ initialCategories, productCounts }: CategoryManagerProps) {
  const [cats, setCats] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, color }),
    });

    const json = (await res.json()) as { data?: { id: string }; error?: string };
    setPending(false);

    if (!res.ok) {
      setError(json.error ?? "Failed to create category.");
      return;
    }

    const newCat: Category = { id: json.data!.id, name: name.trim(), description: description.trim() || null, color };
    setCats((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setDescription("");
    setColor(PRESET_COLORS[0]);
    setSuccess(`Category "${newCat.name}" created.`);
    nameRef.current?.focus();
  }

  async function handleDelete(id: string, catName: string) {
    if (!confirm(`Delete category "${catName}"? Products will be uncategorized.`)) return;

    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setCats((prev) => prev.filter((c) => c.id !== id));
      setSuccess(`Category "${catName}" deleted.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <Card className="border border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Plus className="h-4 w-4 text-primary" />
            New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  ref={nameRef}
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electronics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-description">Description (optional)</Label>
                <Input
                  id="cat-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                Badge Color
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: color === c ? "oklch(0.18 0.02 260)" : "transparent",
                    }}
                    title={c}
                  />
                ))}
                <div className="flex items-center gap-2 ml-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-7 w-7 cursor-pointer rounded border border-border/60"
                    title="Custom color"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{color}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Preview badge */}
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: color }}
              >
                <Tag className="h-3 w-3" />
                {name || "Preview"}
              </span>

              <Button type="submit" disabled={pending} size="sm">
                {pending ? "Saving..." : "Create Category"}
              </Button>
            </div>
          </form>

          {error && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
              {success}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category list */}
      {cats.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 py-10 text-center">
          <Tag className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No categories yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => {
            const count = productCounts[cat.id] ?? 0;
            return (
              <div
                key={cat.id}
                className="group relative flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-shadow hover:shadow-md"
                style={{ borderLeftColor: cat.color, borderLeftWidth: "3px" }}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: cat.color }}
                    >
                      <Tag className="h-2.5 w-2.5 text-white" />
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">{cat.name}</span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                  <p className="text-[11px] font-medium" style={{ color: cat.color }}>
                    {count} product{count !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => void handleDelete(cat.id, cat.name)}
                  className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  title="Delete category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
