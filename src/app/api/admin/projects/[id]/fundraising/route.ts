import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import { requireRole, ok, fail } from "@/lib/api-helpers";
import mongoose from "mongoose";

// PATCH /api/admin/projects/[id]/fundraising
// Allows super_admin, admin, and finance to manually set the amount raised
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin", "finance"]);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid project id", 404);

  const body = await req.json();
  const { manualAmountRaised } = body;

  // Allow null to clear the manual override (falls back to donation aggregate)
  if (manualAmountRaised !== null && (typeof manualAmountRaised !== "number" || manualAmountRaised < 0)) {
    return fail("manualAmountRaised must be a non-negative number or null");
  }

  await connectDB();
  const project = await Project.findByIdAndUpdate(
    id,
    { manualAmountRaised: manualAmountRaised ?? null },
    { new: true }
  ).select("name manualAmountRaised targetAmount");

  if (!project) return fail("Project not found", 404);

  return ok(project);
}
