import { NextResponse } from "next/server";

import { getServerSessionFromHeaders } from "@/lib/auth";
import { createMovement } from "@/lib/inventory-service";
import { type TransactionAction, type TransactionReason } from "@/lib/inventory-types";

export async function POST(request: Request) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      action?: TransactionAction;
      sku?: string;
      quantity?: number;
      reason?: TransactionReason;
      reference?: string;
      fromLocationId?: string | null;
      toLocationId?: string | null;
    };

    const result = await createMovement(
      {
        action: payload.action ?? "in",
        sku: String(payload.sku ?? ""),
        quantity: Number(payload.quantity ?? 0),
        reason: (payload.reason ?? "New Shipment") as TransactionReason,
        reference: String(payload.reference ?? ""),
        fromLocationId: payload.fromLocationId ?? null,
        toLocationId: payload.toLocationId ?? null,
      },
      session.user.email,
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create movement." },
      { status: 400 },
    );
  }
}
