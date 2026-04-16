import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Impact from "@/models/Impact";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  await connectDB();
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector");
  const filter: Record<string, unknown> = {};
  if (sector) filter.sector = sector;
  const impacts = await Impact.find(filter).sort({ createdAt: -1 }).lean();
  return ok(impacts);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  await connectDB();
  const body = await req.json();
  const impact = await Impact.create({ ...body, createdBy: session!.user.id });
  return NextResponse.json({ success: true, data: impact }, { status: 201 });
}
