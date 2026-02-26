import { NextResponse } from "next/server";

import { getServerSessionFromHeaders } from "@/lib/auth";
import { createCategory, deleteCategory, listCategories } from "@/lib/inventory-service";

export async function GET() {
  const cats = await listCategories();
  return NextResponse.json({ data: cats });
}

export async function POST(request: Request) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      color?: string;
    };

    const result = await createCategory({
      name: String(payload.name ?? ""),
      description: payload.description ? String(payload.description) : undefined,
      color: payload.color ? String(payload.color) : undefined,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const result = await deleteCategory(id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete category." },
      { status: 400 },
    );
  }
}
