import { NextResponse } from "next/server";

import { getServerSessionFromHeaders } from "@/lib/auth";
import { createLocation } from "@/lib/inventory-service";
import { type LocationStatus, type LocationType } from "@/lib/inventory-types";

export async function POST(request: Request) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      code?: string;
      type?: LocationType;
      manager?: string;
      capacity?: number;
      status?: LocationStatus;
    };

    const result = await createLocation({
      name: String(payload.name ?? ""),
      code: String(payload.code ?? ""),
      type: (payload.type ?? "Warehouse") as LocationType,
      manager: String(payload.manager ?? ""),
      capacity: Number(payload.capacity ?? 0),
      status: (payload.status ?? "active") as LocationStatus,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create location." },
      { status: 400 },
    );
  }
}
