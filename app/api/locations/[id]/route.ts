import { NextResponse } from "next/server";

import { getServerSessionFromHeaders } from "@/lib/auth";
import { deleteLocation, updateLocation } from "@/lib/inventory-service";
import { type LocationStatus, type LocationType } from "@/lib/inventory-types";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payload = (await request.json()) as {
      name?: string;
      code?: string;
      type?: LocationType;
      manager?: string;
      capacity?: number;
      status?: LocationStatus;
    };

    const result = await updateLocation(id, {
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
      { error: error instanceof Error ? error.message : "Failed to update location." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const result = await deleteLocation(id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete location." },
      { status: 400 },
    );
  }
}
