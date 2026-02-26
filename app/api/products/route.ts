import { NextResponse } from "next/server";

import { getServerSessionFromHeaders } from "@/lib/auth";
import { createProduct } from "@/lib/inventory-service";

export async function POST(request: Request) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      sku?: string;
      description?: string;
      lowStockThreshold?: number;
      categoryId?: string;
    };

    const result = await createProduct({
      name: String(payload.name ?? ""),
      sku: String(payload.sku ?? ""),
      description: payload.description ? String(payload.description) : undefined,
      lowStockThreshold: Number(payload.lowStockThreshold ?? 0),
      categoryId: payload.categoryId ? String(payload.categoryId) : null,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product." },
      { status: 400 },
    );
  }
}
