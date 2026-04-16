import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Requisition from "@/models/Requisition";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "finance"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};

  // Admin can only see their own pending requests + all approved/rejected
  if (session!.user.role === "admin") {
    if (status === "pending") {
      filter.createdBy = session!.user.id;
    }
    // admin can see approved/rejected from everyone
    if (status) filter.status = status;
  } else {
    if (status) filter.status = status;
  }

  const reqs = await Requisition.find(filter)
    .populate("createdBy", "name email role")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return ok(reqs);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "finance"]);
  if (error) return error;

  const body = await req.json();
  const { name, purpose, amount } = body;

  if (!name || !purpose || !amount) return fail("Name, purpose, and amount are required");

  await connectDB();
  const req_ = await Requisition.create({
    name,
    purpose,
    amount: Number(amount),
    createdBy: session!.user.id,
  });

  return ok(req_, 201);
}
