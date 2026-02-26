"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { transactionReasons, type TransactionReason } from "@/lib/inventory-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXTERNAL_NODE = "external";

type StockAction = "in" | "out";

export type StockCatalogProduct = {
  sku: string;
  name: string;
  currentStock: number;
};

export type StockLocationOption = {
  id: string;
  name: string;
  code: string;
};

type UpdateStockFormProps = {
  products: StockCatalogProduct[];
  locations: StockLocationOption[];
  initialSku?: string;
};

export function UpdateStockForm({
  products,
  locations,
  initialSku,
}: UpdateStockFormProps) {
  const router = useRouter();
  const initialProductSku = products.some((product) => product.sku === initialSku)
    ? initialSku
    : products.length > 0
      ? products[0].sku
      : "";

  const firstLocationId = locations[0]?.id ?? EXTERNAL_NODE;

  const [selectedSku, setSelectedSku] = useState(initialProductSku ?? "");
  const [action, setAction] = useState<StockAction>("in");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<TransactionReason>(transactionReasons[0]);
  const [reference, setReference] = useState("");
  const [fromLocationId, setFromLocationId] = useState(EXTERNAL_NODE);
  const [toLocationId, setToLocationId] = useState(firstLocationId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.sku === selectedSku),
    [products, selectedSku],
  );

  const locationLookup = useMemo(
    () =>
      new Map(
        locations.map((location) => [
          location.id,
          `${location.name} (${location.code})`,
        ]),
      ),
    [locations],
  );

  const quantityNumber = Number(quantity);
  const quantityIsValid = Number.isFinite(quantityNumber) && quantityNumber > 0;
  const exceedsStock =
    action === "out" && selectedProduct
      ? quantityNumber > selectedProduct.currentStock
      : false;

  const projectedStock = selectedProduct
    ? action === "in"
      ? selectedProduct.currentStock + (quantityIsValid ? quantityNumber : 0)
      : selectedProduct.currentStock - (quantityIsValid ? quantityNumber : 0)
    : 0;

  const fromLocationValid = action === "out" ? fromLocationId !== EXTERNAL_NODE : true;
  const toLocationValid = action === "in" ? toLocationId !== EXTERNAL_NODE : true;
  const internalTransferValid =
    reason !== "Internal Transfer" ||
    (fromLocationId !== EXTERNAL_NODE &&
      toLocationId !== EXTERNAL_NODE &&
      fromLocationId !== toLocationId);
  const hasReference = reference.trim().length > 0;

  const canSubmit =
    Boolean(selectedProduct) &&
    quantityIsValid &&
    !exceedsStock &&
    hasReference &&
    fromLocationValid &&
    toLocationValid &&
    internalTransferValid;

  const resolvedFromLocation =
    fromLocationId === EXTERNAL_NODE
      ? "External"
      : locationLookup.get(fromLocationId) ?? "Unknown";
  const resolvedToLocation =
    toLocationId === EXTERNAL_NODE
      ? "External"
      : locationLookup.get(toLocationId) ?? "Unknown";

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle>Log Stock Movement</CardTitle>
        <CardDescription>
          Record every inventory movement with action, quantity, reason, and
          location traceability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              if (!selectedProduct || !canSubmit) return;
              setError(null);
              setPending(true);

              const response = await fetch("/api/movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action,
                  sku: selectedProduct.sku,
                  quantity: quantityNumber,
                  reason,
                  reference,
                  fromLocationId:
                    fromLocationId === EXTERNAL_NODE ? null : fromLocationId,
                  toLocationId: toLocationId === EXTERNAL_NODE ? null : toLocationId,
                }),
              });

              const result = (await response.json()) as { error?: string };
              if (!response.ok) {
                setError(result.error ?? "Failed to submit movement.");
                setPending(false);
                return;
              }

              const actionLabel = action === "in" ? "added to" : "removed from";
              setFeedback(
                `${quantityNumber} unit(s) ${actionLabel} ${selectedProduct.sku} [${resolvedFromLocation} -> ${resolvedToLocation}] for "${reason}" (${reference}).`,
              );
              setPending(false);
              router.refresh();
            })();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock-product">Product</Label>
              <Select value={selectedSku} onValueChange={setSelectedSku}>
                <SelectTrigger id="stock-product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.sku} value={product.sku}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-action">Action</Label>
              <Select
                value={action}
                onValueChange={(value) => setAction(value as StockAction)}
              >
                <SelectTrigger id="stock-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">In (Add)</SelectItem>
                  <SelectItem value="out">Out (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Quantity</Label>
              <Input
                id="stock-quantity"
                name="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-reason">Reason / Category</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value as TransactionReason)}
              >
                <SelectTrigger id="stock-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionReasons.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-location">Origin (From)</Label>
              <Select value={fromLocationId} onValueChange={setFromLocationId}>
                <SelectTrigger id="from-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXTERNAL_NODE}>External</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-location">Destination (To)</Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger id="to-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXTERNAL_NODE}>External</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-reference">Destination / Reference</Label>
            <Input
              id="stock-reference"
              name="reference"
              placeholder='Order #456, "Moved to Retail B", damage note, etc.'
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              required
            />
          </div>

          <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <p>
              Current stock:{" "}
              <span className="font-semibold text-foreground">
                {selectedProduct ? selectedProduct.currentStock : 0}
              </span>
            </p>
            {quantityIsValid ? (
              <p>
                Projected stock after transaction:{" "}
                <span className="font-semibold text-foreground">
                  {Math.max(projectedStock, 0)}
                </span>
              </p>
            ) : null}
            <p>
              Route:{" "}
              <span className="font-semibold text-foreground">
                {resolvedFromLocation} -&gt; {resolvedToLocation}
              </span>
            </p>
          </div>

          {exceedsStock ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Validation error: &quot;Out&quot; quantity cannot exceed current available
              stock.
            </p>
          ) : null}

          {!fromLocationValid ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Select an internal origin location for &quot;Out&quot; transactions.
            </p>
          ) : null}

          {!toLocationValid ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Select an internal destination location for &quot;In&quot; transactions.
            </p>
          ) : null}

          {!internalTransferValid ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Internal Transfer requires different internal origin and
              destination locations.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canSubmit || pending}>
              {pending ? "Submitting..." : "Submit Movement"}
            </Button>
            {action === "in" ? (
              <Badge variant="secondary">Action: Stock In</Badge>
            ) : (
              <Badge variant="outline">Action: Stock Out</Badge>
            )}
          </div>
        </form>

        {feedback ? (
          <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
