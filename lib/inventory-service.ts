import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditEvents, categories, locations, movements, products } from "@/lib/db/schema";
import {
  transactionReasons,
  type AuditEvent,
  type AuditSeverity,
  type LocationStatus,
  type LocationStockTotal,
  type LocationType,
  type MovementRecord,
  type TransactionAction,
  type TransactionReason,
} from "@/lib/inventory-types";

function byDateDescending<T extends { date: string }>(left: T, right: T) {
  return left.date < right.date ? 1 : -1;
}

function isTransactionReason(value: string): value is TransactionReason {
  return transactionReasons.includes(value as TransactionReason);
}

function isLocationType(value: string): value is LocationType {
  return ["Warehouse", "Retail", "Transit", "Returns"].includes(value);
}

function isLocationStatus(value: string): value is LocationStatus {
  return ["active", "maintenance"].includes(value);
}

function resolveLocationName(
  locationLookup: Map<string, { name: string; code: string }>,
  locationId: string | null,
) {
  if (!locationId) {
    return "External";
  }

  const location = locationLookup.get(locationId);
  return location ? `${location.name} (${location.code})` : locationId;
}

function assertAction(action: string): asserts action is TransactionAction {
  if (action !== "in" && action !== "out") {
    throw new Error("Invalid movement action.");
  }
}

function assertReason(reason: string): asserts reason is TransactionReason {
  if (!isTransactionReason(reason)) {
    throw new Error("Invalid movement reason.");
  }
}

type ProductRow = typeof products.$inferSelect;
type LocationRow = typeof locations.$inferSelect;
type MovementRow = typeof movements.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(): Promise<CategoryRow[]> {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return cat ?? null;
}

type CreateCategoryInput = {
  name: string;
  description?: string;
  color?: string;
};

export async function createCategory(input: CreateCategoryInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");

  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name))
    .limit(1);
  if (existing) throw new Error(`Category "${name}" already exists.`);

  const id = `cat-${Date.now().toString(36)}`;
  await db.insert(categories).values({
    id,
    name,
    description: input.description?.trim() || null,
    color: input.color ?? "#6366f1",
    createdAt: new Date(),
  });

  return { id };
}

export async function deleteCategory(id: string) {
  // Unlink any products first
  await db
    .update(products)
    .set({ categoryId: null, updatedAt: new Date() })
    .where(eq(products.categoryId, id));

  await db.delete(categories).where(eq(categories.id, id));
  return { id };
}

export async function getCategoryProductCounts(): Promise<Record<string, number>> {
  const productRows = await db.select({ sku: products.sku, categoryId: products.categoryId }).from(products);
  const counts: Record<string, number> = {};
  for (const row of productRows) {
    if (row.categoryId) {
      counts[row.categoryId] = (counts[row.categoryId] ?? 0) + 1;
    }
  }
  return counts;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProductsWithStock() {
  const [productRows, movementRows, categoryRows] = await Promise.all([
    db.select().from(products),
    db.select().from(movements),
    db.select().from(categories),
  ]);

  const categoryMap = new Map(categoryRows.map((c) => [c.id, c]));
  const stockBySku = new Map<string, number>();
  const movementCountBySku = new Map<string, number>();

  for (const movement of movementRows) {
    const currentStock = stockBySku.get(movement.sku) ?? 0;
    const quantity = movement.action === "in" ? movement.quantity : -movement.quantity;
    stockBySku.set(movement.sku, currentStock + quantity);
    movementCountBySku.set(
      movement.sku,
      (movementCountBySku.get(movement.sku) ?? 0) + 1,
    );
  }

  return productRows.map((product) => {
    const category = product.categoryId ? categoryMap.get(product.categoryId) ?? null : null;
    return {
      ...product,
      currentStock: stockBySku.get(product.sku) ?? 0,
      movementCount: movementCountBySku.get(product.sku) ?? 0,
      categoryName: category?.name ?? null,
      categoryColor: category?.color ?? null,
    };
  });
}

export async function getProductBySku(sku: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  if (!product) return null;

  const category = product.categoryId
    ? await getCategoryById(product.categoryId)
    : null;

  return { ...product, category };
}

export async function getCurrentStockBySku(sku: string) {
  const movementRows = await db
    .select()
    .from(movements)
    .where(eq(movements.sku, sku));

  return movementRows.reduce((sum, movement) => {
    return movement.action === "in" ? sum + movement.quantity : sum - movement.quantity;
  }, 0);
}

export async function getAllMovements(): Promise<MovementRecord[]> {
  const [movementRows, productRows, locationRows] = await Promise.all([
    db.select().from(movements),
    db.select().from(products),
    db.select().from(locations),
  ]);

  const productLookup = new Map(productRows.map((product) => [product.sku, product.name]));
  const locationLookup = new Map(
    locationRows.map((location) => [
      location.id,
      { name: location.name, code: location.code },
    ]),
  );

  return movementRows
    .map((movement) => {
      assertAction(movement.action);
      assertReason(movement.reason);

      return {
        id: movement.id,
        date: movement.date,
        action: movement.action,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        user: movement.user,
        fromLocationId: movement.fromLocationId,
        toLocationId: movement.toLocationId,
        sku: movement.sku,
        productName: productLookup.get(movement.sku) ?? movement.sku,
        fromLocationName: resolveLocationName(locationLookup, movement.fromLocationId),
        toLocationName: resolveLocationName(locationLookup, movement.toLocationId),
      } satisfies MovementRecord;
    })
    .sort(byDateDescending);
}

export async function getRecentActivity(limit = 8) {
  const allMovements = await getAllMovements();
  return allMovements.slice(0, limit);
}

export async function getTotalItemsInStock() {
  const productRows = await getProductsWithStock();
  return productRows.reduce((sum, product) => sum + product.currentStock, 0);
}

export async function getLowStockProducts() {
  const productRows = await getProductsWithStock();
  return productRows.filter(
    (product) => product.currentStock <= product.lowStockThreshold,
  );
}

export async function getLocationStockTotals(): Promise<LocationStockTotal[]> {
  const [locationRows, movementRows] = await Promise.all([
    db.select().from(locations),
    db.select().from(movements),
  ]);

  const stockByLocation = new Map(locationRows.map((location) => [location.id, 0]));
  const inboundByLocation = new Map(locationRows.map((location) => [location.id, 0]));
  const outboundByLocation = new Map(locationRows.map((location) => [location.id, 0]));

  for (const movement of movementRows) {
    if (movement.toLocationId && stockByLocation.has(movement.toLocationId)) {
      stockByLocation.set(
        movement.toLocationId,
        (stockByLocation.get(movement.toLocationId) ?? 0) + movement.quantity,
      );
      inboundByLocation.set(
        movement.toLocationId,
        (inboundByLocation.get(movement.toLocationId) ?? 0) + 1,
      );
    }

    if (movement.fromLocationId && stockByLocation.has(movement.fromLocationId)) {
      stockByLocation.set(
        movement.fromLocationId,
        (stockByLocation.get(movement.fromLocationId) ?? 0) - movement.quantity,
      );
      outboundByLocation.set(
        movement.fromLocationId,
        (outboundByLocation.get(movement.fromLocationId) ?? 0) + 1,
      );
    }
  }

  return locationRows
    .map((location) => {
      if (!isLocationType(location.type) || !isLocationStatus(location.status)) {
        throw new Error(`Invalid location type/status for ${location.id}.`);
      }

      const currentStock = stockByLocation.get(location.id) ?? 0;
      const utilization =
        location.capacity > 0 ? (currentStock / location.capacity) * 100 : 0;

      return {
        id: location.id,
        name: location.name,
        code: location.code,
        type: location.type,
        manager: location.manager,
        capacity: location.capacity,
        status: location.status,
        currentStock,
        inboundMovements: inboundByLocation.get(location.id) ?? 0,
        outboundMovements: outboundByLocation.get(location.id) ?? 0,
        utilization: Math.max(0, Math.min(100, utilization)),
      };
    })
    .sort((left, right) => right.currentStock - left.currentStock);
}

export async function getMovementTotals() {
  const movementRows = await db.select().from(movements);

  const totalIn = movementRows.reduce((sum, movement) => {
    return movement.action === "in" ? sum + movement.quantity : sum;
  }, 0);

  const totalOut = movementRows.reduce((sum, movement) => {
    return movement.action === "out" ? sum + movement.quantity : sum;
  }, 0);

  return {
    count: movementRows.length,
    totalIn,
    totalOut,
    net: totalIn - totalOut,
  };
}

export async function getMovementDailySeries(days = 7) {
  const movementRows = await db.select().from(movements);

  const grouped = new Map<
    string,
    { date: string; label: string; stockIn: number; stockOut: number }
  >();

  for (const movement of movementRows) {
    const dateKey = movement.date.slice(0, 10);
    const existing = grouped.get(dateKey) ?? {
      date: dateKey,
      label: dateKey.slice(5).replace("-", "/"),
      stockIn: 0,
      stockOut: 0,
    };

    if (movement.action === "in") {
      existing.stockIn += movement.quantity;
    } else {
      existing.stockOut += movement.quantity;
    }

    grouped.set(dateKey, existing);
  }

  return [...grouped.keys()]
    .sort()
    .slice(-days)
    .map((key) => grouped.get(key))
    .filter(
      (
        item,
      ): item is { date: string; label: string; stockIn: number; stockOut: number } =>
        Boolean(item),
    );
}

export async function getMovementReasonBreakdown() {
  const movementRows = await db.select().from(movements);
  const counts = new Map<TransactionReason, number>(
    transactionReasons.map((reason) => [reason, 0]),
  );

  for (const movement of movementRows) {
    assertReason(movement.reason);
    counts.set(movement.reason, (counts.get(movement.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count);
}

async function getMovementAuditEvents(): Promise<AuditEvent[]> {
  const allMovements = await getAllMovements();

  return allMovements.map((movement) => ({
    id: `audit-${movement.id}`,
    date: movement.date,
    actor: movement.user,
    action:
      movement.action === "in" ? "Stock movement added" : "Stock movement removed",
    entityType: "Movement",
    entityId: movement.id,
    details: `${movement.quantity} units of ${movement.sku} (${movement.reason}) from ${movement.fromLocationName} to ${movement.toLocationName}.`,
    severity: movement.reason === "Damaged/Lost" ? "warning" : "info",
  }));
}

export async function getAuditTrail(limit?: number): Promise<AuditEvent[]> {
  const [savedAuditRows, movementAudits] = await Promise.all([
    db.select().from(auditEvents),
    getMovementAuditEvents(),
  ]);

  const savedAudits: AuditEvent[] = savedAuditRows.map((audit) => {
    if (!["info", "warning", "critical"].includes(audit.severity)) {
      throw new Error(`Invalid audit severity for event ${audit.id}.`);
    }

    return {
      id: audit.id,
      date: audit.date,
      actor: audit.actor,
      action: audit.action,
      entityType: audit.entityType as AuditEvent["entityType"],
      entityId: audit.entityId,
      details: audit.details,
      severity: audit.severity as AuditSeverity,
    };
  });

  const merged = [...savedAudits, ...movementAudits].sort(byDateDescending);
  return typeof limit === "number" ? merged.slice(0, limit) : merged;
}

export async function getAuditSummary() {
  const trail = await getAuditTrail();
  const warningCount = trail.filter((event) => event.severity === "warning").length;
  const criticalCount = trail.filter(
    (event) => event.severity === "critical",
  ).length;

  return {
    totalEvents: trail.length,
    warningCount,
    criticalCount,
  };
}

export async function getStockFormData() {
  const [productRows, locationRows] = await Promise.all([
    getProductsWithStock(),
    db.select().from(locations),
  ]);

  return {
    products: productRows.map((product) => ({
      sku: product.sku,
      name: product.name,
      currentStock: product.currentStock,
    })),
    locations: locationRows.map((location) => ({
      id: location.id,
      name: location.name,
      code: location.code,
    })),
  };
}

type CreateProductInput = {
  name: string;
  sku: string;
  description?: string;
  lowStockThreshold: number;
  categoryId?: string | null;
};

export async function createProduct(input: CreateProductInput) {
  const sku = input.sku.trim().toUpperCase();
  const name = input.name.trim();

  if (!name || !sku) {
    throw new Error("Product name and SKU are required.");
  }

  if (!Number.isFinite(input.lowStockThreshold) || input.lowStockThreshold < 0) {
    throw new Error("Low stock threshold must be zero or greater.");
  }

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  if (existing) {
    throw new Error(`SKU ${sku} already exists.`);
  }

  // Validate categoryId if provided
  if (input.categoryId) {
    const cat = await getCategoryById(input.categoryId);
    if (!cat) throw new Error("Selected category does not exist.");
  }

  const now = new Date();
  await db.insert(products).values({
    sku,
    name,
    description: input.description?.trim() || null,
    lowStockThreshold: Math.round(input.lowStockThreshold),
    categoryId: input.categoryId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return { sku };
}

type CreateMovementInput = {
  action: TransactionAction;
  sku: string;
  quantity: number;
  reason: TransactionReason;
  reference: string;
  fromLocationId: string | null;
  toLocationId: string | null;
};

export async function createMovement(input: CreateMovementInput, actorEmail: string) {
  const sku = input.sku.trim().toUpperCase();
  const reference = input.reference.trim();

  if (!sku || !reference) {
    throw new Error("SKU and reference are required.");
  }

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  if (!product) {
    throw new Error(`Product ${sku} not found.`);
  }

  const currentStock = await getCurrentStockBySku(sku);
  if (input.action === "out" && input.quantity > currentStock) {
    throw new Error("Validation error: 'Out' quantity cannot exceed current stock.");
  }

  if (input.action === "out" && !input.fromLocationId) {
    throw new Error("Select an internal origin location for 'Out' transactions.");
  }

  if (input.action === "in" && !input.toLocationId) {
    throw new Error("Select an internal destination location for 'In' transactions.");
  }

  if (
    input.reason === "Internal Transfer" &&
    (!input.fromLocationId ||
      !input.toLocationId ||
      input.fromLocationId === input.toLocationId)
  ) {
    throw new Error(
      "Internal Transfer requires different internal origin and destination locations.",
    );
  }

  const [fromLocation] = input.fromLocationId
    ? await db
        .select()
        .from(locations)
        .where(eq(locations.id, input.fromLocationId))
        .limit(1)
    : [null];

  const [toLocation] = input.toLocationId
    ? await db
        .select()
        .from(locations)
        .where(eq(locations.id, input.toLocationId))
        .limit(1)
    : [null];

  if (input.fromLocationId && !fromLocation) {
    throw new Error("Origin location not found.");
  }

  if (input.toLocationId && !toLocation) {
    throw new Error("Destination location not found.");
  }

  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(
    2,
    "0",
  )}:${String(now.getMinutes()).padStart(2, "0")}`;
  const movementId = `m-${Date.now().toString(36)}`;

  await db.insert(movements).values({
    id: movementId,
    date: timestamp,
    action: input.action,
    quantity: Math.round(input.quantity),
    reason: input.reason,
    reference,
    user: actorEmail,
    sku,
    fromLocationId: input.fromLocationId,
    toLocationId: input.toLocationId,
  });

  await db.insert(auditEvents).values({
    id: `audit-custom-${movementId}`,
    date: timestamp,
    actor: actorEmail,
    action: "Movement submitted",
    entityType: "Movement",
    entityId: movementId,
    details: `${input.action.toUpperCase()} ${input.quantity} units for ${sku} (${input.reason}) [${input.fromLocationId ?? "external"} -> ${input.toLocationId ?? "external"}]`,
    severity: input.reason === "Damaged/Lost" ? "warning" : "info",
  });

  return { movementId, sku };
}

type CreateLocationInput = {
  name: string;
  code: string;
  type: LocationType;
  manager: string;
  capacity: number;
  status: LocationStatus;
};

export async function createLocation(input: CreateLocationInput) {
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const manager = input.manager.trim();

  if (!name || !code || !manager) {
    throw new Error("Name, code, manager, and capacity are required.");
  }

  if (!Number.isFinite(input.capacity) || input.capacity <= 0) {
    throw new Error("Capacity must be a positive number.");
  }

  const [duplicate] = await db
    .select()
    .from(locations)
    .where(eq(locations.code, code))
    .limit(1);

  if (duplicate) {
    throw new Error(`Code ${code} already exists. Use a unique location code.`);
  }

  const id = `loc-${Date.now().toString(36)}`;
  const now = new Date();

  await db.insert(locations).values({
    id,
    name,
    code,
    type: input.type,
    manager,
    capacity: Math.round(input.capacity),
    status: input.status,
    createdAt: now,
    updatedAt: now,
  });

  return { id };
}

type UpdateLocationInput = {
  name: string;
  code: string;
  type: LocationType;
  manager: string;
  capacity: number;
  status: LocationStatus;
};

export async function updateLocation(id: string, input: UpdateLocationInput) {
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const manager = input.manager.trim();

  if (!name || !code || !manager) {
    throw new Error("Name, code, manager, and capacity are required.");
  }

  if (!Number.isFinite(input.capacity) || input.capacity <= 0) {
    throw new Error("Capacity must be a positive number.");
  }

  const [existing] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);

  if (!existing) {
    throw new Error("Location not found.");
  }

  if (existing.code !== code) {
    const [sameCode] = await db
      .select()
      .from(locations)
      .where(eq(locations.code, code))
      .limit(1);
    if (sameCode && sameCode.id !== id) {
      throw new Error(`Code ${code} already exists. Use a unique location code.`);
    }
  }

  await db
    .update(locations)
    .set({
      name,
      code,
      type: input.type,
      manager,
      capacity: Math.round(input.capacity),
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(locations.id, id));

  return { id };
}

export async function deleteLocation(id: string) {
  const locationTotals = await getLocationStockTotals();
  const location = locationTotals.find((entry) => entry.id === id);

  if (!location) {
    throw new Error("Location not found.");
  }

  if (location.currentStock > 0) {
    throw new Error(`Cannot delete ${location.code} while it still has stock.`);
  }

  await db.delete(locations).where(eq(locations.id, id));
  return { id };
}

export async function getLatestMovements(limit = 200): Promise<MovementRow[]> {
  return db.select().from(movements).orderBy(desc(movements.createdAt)).limit(limit);
}

export async function listProducts(): Promise<ProductRow[]> {
  return db.select().from(products);
}

export async function listLocations(): Promise<LocationRow[]> {
  return db.select().from(locations);
}
