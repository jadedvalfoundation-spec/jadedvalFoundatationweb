import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin", "finance", "support"]);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const project = await Project.findById(id)
    .populate("program", "name slug")
    .populate("createdBy", "name email")
    .lean();
  if (!project) return fail("Project not found", 404);

  const raisedAgg = await Donation.aggregate([
    { $match: { project: project._id, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
  ]);

  const monthlyDonations = await Donation.aggregate([
    { $match: { project: project._id, status: "completed" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        total: { $sum: "$amountUSD" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const amountRaised = raisedAgg[0]?.total ?? 0;
  const donorCount = raisedAgg[0]?.count ?? 0;
  const percentageRaised = project.targetAmount > 0
    ? Math.min(100, (amountRaised / project.targetAmount) * 100)
    : 0;

  return ok({ ...project, amountRaised, donorCount, percentageRaised, monthlyDonations });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const project = await Project.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!project) return fail("Project not found", 404);

  return ok(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const hasDonations = await Donation.countDocuments({ project: id });
  if (hasDonations > 0) return fail("Cannot delete a project with donations", 409);

  const project = await Project.findByIdAndDelete(id);
  if (!project) return fail("Project not found", 404);

  return ok({ message: "Project deleted" });
}
