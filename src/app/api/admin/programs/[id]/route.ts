import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Program from "@/models/Program";
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

  const program = await Program.findById(id).populate("createdBy", "name email").lean();
  if (!program) return fail("Program not found", 404);

  const projects = await Project.find({ program: id })
    .select("name status targetAmount startDate endDate")
    .lean();

  const donations = await Donation.aggregate([
    { $match: { program: program._id, status: "completed" } },
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

  const totalRaised = await Donation.aggregate([
    { $match: { program: program._id, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amountUSD" } } },
  ]);

  return ok({
    ...program,
    projects,
    monthlyDonations: donations,
    totalRaised: totalRaised[0]?.total ?? 0,
    projectCount: projects.length,
  });
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
  const program = await Program.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!program) return fail("Program not found", 404);

  return ok(program);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const hasProjects = await Project.countDocuments({ program: id });
  if (hasProjects > 0) return fail("Cannot delete a program that has projects", 409);

  const program = await Program.findByIdAndDelete(id);
  if (!program) return fail("Program not found", 404);

  return ok({ message: "Program deleted" });
}
