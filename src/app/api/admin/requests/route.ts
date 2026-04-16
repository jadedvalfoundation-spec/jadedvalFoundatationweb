import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const requests = await Request.find(filter)
    .populate("respondedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return ok(requests);
}
