import "dotenv/config";

import { db } from "../lib/db";
import {
  auditEvents,
  categories,
  locations,
  movements,
  products,
} from "../lib/db/schema";
import {
  locations as seedLocations,
  products as seedProducts,
} from "../lib/mock-data";

const seedAuditEvents = [
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

const seedCategories = [
  { id: "cat-001", name: "Electronics",  description: "Electronic components and devices", color: "#6366f1" },
  { id: "cat-002", name: "Safety",       description: "Personal protective equipment and safety gear", color: "#f59e0b" },
  { id: "cat-003", name: "Tools",        description: "Hand tools, power tools and equipment", color: "#10b981" },
  { id: "cat-004", name: "Packaging",    description: "Boxes, bags, wrapping and packing materials", color: "#3b82f6" },
  { id: "cat-005", name: "Consumables",  description: "Everyday consumable supplies", color: "#ec4899" },
];

// Map each mock product SKU to a category id by index pattern
function assignCategory(sku: string): string | null {
  const cats = ["cat-001", "cat-002", "cat-003", "cat-004", "cat-005"];
  // Simple deterministic assignment based on char code sum
  const sum = [...sku].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return cats[sum % cats.length];
}

async function main() {
  await db.delete(movements);
  await db.delete(auditEvents);
  await db.delete(products);
  await db.delete(locations);
  await db.delete(categories);

  await db.insert(categories).values(
    seedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      createdAt: new Date(),
    })),
  );

  await db.insert(locations).values(
    seedLocations.map((location) => ({
      id: location.id,
      name: location.name,
      code: location.code,
      type: location.type,
      manager: location.manager,
      capacity: location.capacity,
      status: location.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  await db.insert(products).values(
    seedProducts.map((product) => ({
      sku: product.sku,
      name: product.name,
      description: product.description ?? null,
      lowStockThreshold: product.lowStockThreshold,
      categoryId: assignCategory(product.sku),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  const flattenedMovements = seedProducts.flatMap((product) =>
    product.ledger.map((entry) => ({
      id: entry.id,
      date: entry.date,
      action: entry.action,
      quantity: entry.quantity,
      reason: entry.reason,
      reference: entry.reference,
      user: entry.user,
      sku: product.sku,
      fromLocationId: entry.fromLocationId ?? null,
      toLocationId: entry.toLocationId ?? null,
      createdAt: new Date(),
    })),
  );

  if (flattenedMovements.length > 0) {
    await db.insert(movements).values(flattenedMovements);
  }

  await db.insert(auditEvents).values(seedAuditEvents);

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
