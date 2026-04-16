import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Requisition from "@/models/Requisition";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole(["super_admin", "admin", "finance"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { action, reason, name, purpose, amount } = body;

  await connectDB();
  const requisition = await Requisition.findById(id);
  if (!requisition) return fail("Requisition not found", 404);

  // Approve / Reject — only finance + super_admin
  if (action === "approve" || action === "reject") {
    if (!["super_admin", "finance"].includes(session!.user.role ?? "")) {
      return fail("Only finance or super admins can approve/reject", 403);
    }
    if (requisition.status !== "pending") {
      return fail("Only pending requisitions can be reviewed");
    }
    requisition.status = action === "approve" ? "approved" : "rejected";
    requisition.reviewedBy = session!.user.id as unknown as typeof requisition.reviewedBy;
    if (reason) requisition.reviewReason = reason;
    await requisition.save();
    return ok(requisition);
  }

  // Edit fields — only super_admin, and only if still pending
  if (!["super_admin"].includes(session!.user.role ?? "")) {
    return fail("Only super admins can edit requisitions", 403);
  }
  if (requisition.status === "approved") {
    return fail("Approved requisitions cannot be edited");
  }
  if (name) requisition.name = name;
  if (purpose) requisition.purpose = purpose;
  if (amount) requisition.amount = Number(amount);
  await requisition.save();

  return ok(requisition);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin"]);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const requisition = await Requisition.findById(id);
  if (!requisition) return fail("Requisition not found", 404);
  if (requisition.status === "approved") return fail("Approved requisitions cannot be deleted");

  await requisition.deleteOne();
  return ok({ message: "Requisition deleted" });
}
