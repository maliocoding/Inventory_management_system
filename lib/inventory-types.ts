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

export type AuditSeverity = "info" | "warning" | "critical";

export type LocationStockTotal = {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  manager: string;
  capacity: number;
  status: LocationStatus;
  currentStock: number;
  inboundMovements: number;
  outboundMovements: number;
  utilization: number;
};

export type MovementRecord = {
  id: string;
  date: string;
  action: TransactionAction;
  quantity: number;
  reason: TransactionReason;
  reference: string;
  user: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  sku: string;
  productName: string;
  fromLocationName: string;
  toLocationName: string;
};

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
