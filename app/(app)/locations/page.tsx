import { LocationCrudManager } from "@/components/location-crud-manager";
import { getLocationStockTotals } from "@/lib/inventory-service";

export default async function LocationsPage() {
  const locationTotals = await getLocationStockTotals();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Locations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Location Inventory</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Storage and transit nodes with stock totals, utilization, and movement
          counts.
        </p>
      </header>

      <LocationCrudManager initialLocations={locationTotals} />
    </div>
  );
}
