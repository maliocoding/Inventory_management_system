"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Pencil, Plus, Trash2, X } from "lucide-react";

import type {
  LocationStatus,
  LocationStockTotal,
  LocationType,
} from "@/lib/inventory-types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const locationTypes: LocationType[] = ["Warehouse", "Retail", "Transit", "Returns"];
const locationStatuses: LocationStatus[] = ["active", "maintenance"];

type LocationCrudManagerProps = {
  initialLocations: LocationStockTotal[];
};

type LocationFormState = {
  name: string;
  code: string;
  type: LocationType;
  manager: string;
  capacity: string;
  status: LocationStatus;
};

function createDefaultFormState(): LocationFormState {
  return {
    name: "",
    code: "",
    type: "Warehouse",
    manager: "",
    capacity: "200",
    status: "active",
  };
}

function toFormState(location: LocationStockTotal): LocationFormState {
  return {
    name: location.name,
    code: location.code,
    type: location.type,
    manager: location.manager,
    capacity: String(location.capacity),
    status: location.status,
  };
}

export function LocationCrudManager({ initialLocations }: LocationCrudManagerProps) {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationStockTotal[]>(initialLocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationFormState>(createDefaultFormState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"info" | "error">("info");

  const summary = useMemo(() => {
    const totalCapacity = locations.reduce((sum, location) => sum + location.capacity, 0);
    const totalStock = locations.reduce((sum, location) => sum + location.currentStock, 0);
    return {
      count: locations.length,
      totalCapacity,
      totalStock,
    };
  }, [locations]);

  const isEditing = Boolean(editingId);

  useEffect(() => {
    setLocations(initialLocations);
  }, [initialLocations]);

  function setInfo(message: string) {
    setFeedbackTone("info");
    setFeedback(message);
  }

  function setError(message: string) {
    setFeedbackTone("error");
    setFeedback(message);
  }

  function resetForm() {
    setForm(createDefaultFormState());
    setEditingId(null);
  }

  function startEdit(location: LocationStockTotal) {
    setEditingId(location.id);
    setForm(toFormState(location));
    setInfo(`Editing ${location.name} (${location.code}).`);
  }

  function removeLocation(location: LocationStockTotal) {
    if (location.currentStock > 0) {
      setError(`Cannot delete ${location.code} while it still has stock.`);
      return;
    }

    const confirmed = window.confirm(
      `Delete location ${location.name} (${location.code})?`,
    );
    if (!confirmed) return;

    void (async () => {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Failed to delete location.");
        return;
      }

      if (editingId === location.id) {
        resetForm();
      }
      setInfo(`Deleted ${location.name} (${location.code}).`);
      router.refresh();
    })();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const manager = form.manager.trim();
    const capacityNumber = Number(form.capacity);

    if (!name || !code || !manager) {
      setError("Name, code, manager, and capacity are required.");
      return;
    }

    if (!Number.isFinite(capacityNumber) || capacityNumber <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    const duplicateCode = locations.find(
      (item) => item.code.toLowerCase() === code.toLowerCase() && item.id !== editingId,
    );
    if (duplicateCode) {
      setError(`Code ${code} already exists. Use a unique location code.`);
      return;
    }

    void (async () => {
      const response = await fetch(
        editingId ? `/api/locations/${editingId}` : "/api/locations",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            code,
            type: form.type,
            manager,
            capacity: Math.round(capacityNumber),
            status: form.status,
          }),
        },
      );

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Failed to save location.");
        return;
      }

      if (editingId) {
        setInfo(`Updated location ${name} (${code}).`);
      } else {
        setInfo(`Created location ${name} (${code}).`);
      }

      resetForm();
      router.refresh();
    })();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tracked Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.count}</p>
            <p className="text-xs text-muted-foreground">
              Active + maintenance locations.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.totalCapacity}</p>
            <p className="text-xs text-muted-foreground">
              Combined location unit capacity.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Stock at Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.totalStock}</p>
            <p className="text-xs text-muted-foreground">
              Net units allocated across locations.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Location" : "Create Location"}</CardTitle>
          <CardDescription>
            Manage storage nodes and operating status from this panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location-name">Location Name</Label>
                <Input
                  id="location-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Main Warehouse"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-code">Code</Label>
                <Input
                  id="location-code"
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, code: event.target.value }))
                  }
                  placeholder="WH-A1"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value as LocationType }))
                  }
                >
                  <SelectTrigger id="location-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value as LocationStatus }))
                  }
                >
                  <SelectTrigger id="location-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location-manager">Manager</Label>
                <Input
                  id="location-manager"
                  value={form.manager}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, manager: event.target.value }))
                  }
                  placeholder="R. Kim"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location-capacity">Capacity</Label>
                <Input
                  id="location-capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, capacity: event.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4" />
                {isEditing ? "Save Changes" : "Create Location"}
              </Button>
              {isEditing ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4" />
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </form>

          {feedback ? (
            <p
              className={
                feedbackTone === "error"
                  ? "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  : "rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"
              }
            >
              {feedback}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle>Location Breakdown</CardTitle>
          <CardDescription>
            Current stock, utilization, and CRUD actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead className="text-right">In / Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <p className="font-semibold">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.code}</p>
                  </TableCell>
                  <TableCell>{location.type}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {location.manager}
                  </TableCell>
                  <TableCell className="text-right">{location.capacity}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {location.currentStock}
                  </TableCell>
                  <TableCell>
                    <div className="w-32 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {location.utilization.toFixed(1)}%
                      </p>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${location.utilization}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {location.inboundMovements} / {location.outboundMovements}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        location.status === "active" ? "secondary" : "destructive"
                      }
                    >
                      {location.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(location)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeLocation(location)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
