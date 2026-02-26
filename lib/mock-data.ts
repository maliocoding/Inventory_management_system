export type TransactionAction = "in" | "out";

export type TransactionReason =
  | "New Shipment"
  | "Return"
  | "Sale"
  | "Internal Transfer"
  | "Damaged/Lost";

export const transactionReasons: TransactionReason[] = [
  "New Shipment",
  "Return",
  "Sale",
  "Internal Transfer",
  "Damaged/Lost",
];

export type LocationType = "Warehouse" | "Retail" | "Transit" | "Returns";
export type LocationStatus = "active" | "maintenance";

export type Location = {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  manager: string;
  capacity: number;
  status: LocationStatus;
};

export type LocationStockTotal = Location & {
  currentStock: number;
  inboundMovements: number;
  outboundMovements: number;
  utilization: number;
};

export type LedgerEntry = {
  id: string;
  date: string;
  action: TransactionAction;
  quantity: number;
  reason: TransactionReason;
  reference: string;
  user: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
};

export type Product = {
  name: string;
  sku: string;
  description?: string;
  lowStockThreshold: number;
  ledger: LedgerEntry[];
};

export type MovementRecord = LedgerEntry & {
  sku: string;
  productName: string;
  fromLocationName: string;
  toLocationName: string;
};

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditEvent = {
  id: string;
  date: string;
  actor: string;
  action: string;
  entityType: "Movement" | "Product" | "Location" | "Auth";
  entityId: string;
  details: string;
  severity: AuditSeverity;
};

export const locations: Location[] = [
  {
    id: "loc-main",
    name: "Main Warehouse",
    code: "WH-A1",
    type: "Warehouse",
    manager: "R. Kim",
    capacity: 1400,
    status: "active",
  },
  {
    id: "loc-retail-b",
    name: "Retail Location B",
    code: "RT-B",
    type: "Retail",
    manager: "M. Davis",
    capacity: 700,
    status: "active",
  },
  {
    id: "loc-staging",
    name: "Shipping Staging",
    code: "STG-2",
    type: "Transit",
    manager: "L. Patel",
    capacity: 500,
    status: "active",
  },
  {
    id: "loc-returns",
    name: "Returns Bay",
    code: "RET-1",
    type: "Returns",
    manager: "A. Carter",
    capacity: 300,
    status: "maintenance",
  },
];

export const products: Product[] = [
  {
    name: "Industrial Gloves",
    sku: "SKU-001",
    description: "Nitrile gloves for handling and packing",
    lowStockThreshold: 40,
    ledger: [
      {
        id: "t-001",
        date: "2026-02-20 09:30",
        action: "in",
        quantity: 200,
        reason: "New Shipment",
        reference: "PO-7821",
        user: "admin@warehouse.com",
        fromLocationId: null,
        toLocationId: "loc-main",
      },
      {
        id: "t-002",
        date: "2026-02-23 14:10",
        action: "out",
        quantity: 120,
        reason: "Sale",
        reference: "Order #9912",
        user: "staff1@warehouse.com",
        fromLocationId: "loc-main",
        toLocationId: null,
      },
      {
        id: "t-008",
        date: "2026-02-26 08:55",
        action: "out",
        quantity: 30,
        reason: "Internal Transfer",
        reference: "Replenish Retail B",
        user: "staff2@warehouse.com",
        fromLocationId: "loc-main",
        toLocationId: "loc-retail-b",
      },
    ],
  },
  {
    name: "Barcode Stickers",
    sku: "SKU-145",
    description: "Durable labels for shelf and bin coding",
    lowStockThreshold: 100,
    ledger: [
      {
        id: "t-003",
        date: "2026-02-18 08:15",
        action: "in",
        quantity: 500,
        reason: "New Shipment",
        reference: "PO-7801",
        user: "admin@warehouse.com",
        fromLocationId: null,
        toLocationId: "loc-main",
      },
      {
        id: "t-004",
        date: "2026-02-25 11:45",
        action: "out",
        quantity: 430,
        reason: "Internal Transfer",
        reference: "Moved to Retail B",
        user: "staff2@warehouse.com",
        fromLocationId: "loc-main",
        toLocationId: "loc-retail-b",
      },
      {
        id: "t-009",
        date: "2026-02-26 10:05",
        action: "out",
        quantity: 25,
        reason: "Sale",
        reference: "Order #10012",
        user: "staff1@warehouse.com",
        fromLocationId: "loc-retail-b",
        toLocationId: null,
      },
    ],
  },
  {
    name: "Packing Tape",
    sku: "SKU-223",
    description: "Heavy-duty tape for outbound shipments",
    lowStockThreshold: 60,
    ledger: [
      {
        id: "t-005",
        date: "2026-02-21 10:00",
        action: "in",
        quantity: 300,
        reason: "New Shipment",
        reference: "PO-7838",
        user: "admin@warehouse.com",
        fromLocationId: null,
        toLocationId: "loc-staging",
      },
      {
        id: "t-006",
        date: "2026-02-24 16:20",
        action: "out",
        quantity: 210,
        reason: "Sale",
        reference: "Order #9975",
        user: "staff1@warehouse.com",
        fromLocationId: "loc-staging",
        toLocationId: null,
      },
      {
        id: "t-007",
        date: "2026-02-25 09:10",
        action: "out",
        quantity: 30,
        reason: "Damaged/Lost",
        reference: "Broken roll set",
        user: "staff2@warehouse.com",
        fromLocationId: "loc-staging",
        toLocationId: "loc-returns",
      },
      {
        id: "t-010",
        date: "2026-02-26 11:20",
        action: "in",
        quantity: 40,
        reason: "Return",
        reference: "Customer Return Batch 44",
        user: "staff3@warehouse.com",
        fromLocationId: null,
        toLocationId: "loc-returns",
      },
    ],
  },
];

const baseAuditEvents: AuditEvent[] = [
  {
    id: "a-001",
    date: "2026-02-26 07:40",
    actor: "admin@warehouse.com",
    action: "Updated low stock threshold",
    entityType: "Product",
    entityId: "SKU-223",
    details: "Changed threshold from 50 to 60 units.",
    severity: "info",
  },
  {
    id: "a-002",
    date: "2026-02-26 08:10",
    actor: "staff2@warehouse.com",
    action: "Location maintenance status set",
    entityType: "Location",
    entityId: "loc-returns",
    details: "Returns Bay marked as maintenance for rack inspection.",
    severity: "warning",
  },
  {
    id: "a-003",
    date: "2026-02-26 09:05",
    actor: "staff1@warehouse.com",
    action: "Authentication challenge",
    entityType: "Auth",
    entityId: "session-173",
    details: "Failed sign-in attempt from unrecognized device.",
    severity: "critical",
  },
];

function byDateDescending<T extends { date: string }>(left: T, right: T) {
  return left.date < right.date ? 1 : -1;
}

function resolveLocationName(locationId: string | null | undefined) {
  if (!locationId) {
    return "External";
  }

  const location = locations.find((item) => item.id === locationId);
  if (!location) {
    return locationId;
  }

  return `${location.name} (${location.code})`;
}

export function getCurrentStock(product: Product): number {
  return product.ledger.reduce((sum, entry) => {
    return entry.action === "in" ? sum + entry.quantity : sum - entry.quantity;
  }, 0);
}

export function getLowStockProducts() {
  return products.filter((product) => getCurrentStock(product) <= product.lowStockThreshold);
}

export function getAllMovements() {
  return products
    .flatMap((product) =>
      product.ledger.map(
        (entry): MovementRecord => ({
          ...entry,
          sku: product.sku,
          productName: product.name,
          fromLocationName: resolveLocationName(entry.fromLocationId),
          toLocationName: resolveLocationName(entry.toLocationId),
        }),
      ),
    )
    .sort(byDateDescending);
}

export function getRecentActivity(limit = 8) {
  return getAllMovements().slice(0, limit);
}

export function getTotalItemsInStock() {
  return products.reduce((sum, product) => sum + getCurrentStock(product), 0);
}

export function getProductBySku(sku: string) {
  return products.find((product) => product.sku === sku);
}

export function getLocationById(locationId: string) {
  return locations.find((location) => location.id === locationId);
}

export function getLocationStockTotals(): LocationStockTotal[] {
  const stockByLocation = new Map(locations.map((location) => [location.id, 0]));
  const inboundByLocation = new Map(locations.map((location) => [location.id, 0]));
  const outboundByLocation = new Map(locations.map((location) => [location.id, 0]));

  for (const movement of getAllMovements()) {
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

  return locations
    .map((location) => {
      const currentStock = stockByLocation.get(location.id) ?? 0;
      const utilization = location.capacity > 0 ? (currentStock / location.capacity) * 100 : 0;

      return {
        ...location,
        currentStock,
        inboundMovements: inboundByLocation.get(location.id) ?? 0,
        outboundMovements: outboundByLocation.get(location.id) ?? 0,
        utilization: Math.max(0, Math.min(100, utilization)),
      };
    })
    .sort((left, right) => right.currentStock - left.currentStock);
}

export function getMovementTotals() {
  const movements = getAllMovements();

  const totalIn = movements.reduce((sum, movement) => {
    return movement.action === "in" ? sum + movement.quantity : sum;
  }, 0);

  const totalOut = movements.reduce((sum, movement) => {
    return movement.action === "out" ? sum + movement.quantity : sum;
  }, 0);

  return {
    count: movements.length,
    totalIn,
    totalOut,
    net: totalIn - totalOut,
  };
}

export function getMovementDailySeries(days = 7) {
  const grouped = new Map<
    string,
    {
      date: string;
      label: string;
      stockIn: number;
      stockOut: number;
    }
  >();

  for (const movement of getAllMovements()) {
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
    .map((key) => grouped.get(key)!)
    .filter(Boolean);
}

export function getMovementReasonBreakdown() {
  const counts = new Map<TransactionReason, number>(
    transactionReasons.map((reason) => [reason, 0]),
  );

  for (const movement of getAllMovements()) {
    counts.set(movement.reason, (counts.get(movement.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count);
}

export function getAuditTrail(limit?: number) {
  const movementAudits: AuditEvent[] = getAllMovements().map((movement) => ({
    id: `audit-${movement.id}`,
    date: movement.date,
    actor: movement.user,
    action: movement.action === "in" ? "Stock movement added" : "Stock movement removed",
    entityType: "Movement",
    entityId: movement.id,
    details: `${movement.quantity} units of ${movement.sku} (${movement.reason}) from ${movement.fromLocationName} to ${movement.toLocationName}.`,
    severity: movement.reason === "Damaged/Lost" ? "warning" : "info",
  }));

  const merged = [...baseAuditEvents, ...movementAudits].sort(byDateDescending);
  return typeof limit === "number" ? merged.slice(0, limit) : merged;
}

export function getAuditSummary() {
  const trail = getAuditTrail();
  const warningCount = trail.filter((event) => event.severity === "warning").length;
  const criticalCount = trail.filter((event) => event.severity === "critical").length;

  return {
    totalEvents: trail.length,
    warningCount,
    criticalCount,
  };
}
