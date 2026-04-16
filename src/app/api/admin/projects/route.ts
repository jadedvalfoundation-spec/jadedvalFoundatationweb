import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["super_admin", "admin", "finance", "support"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("program");
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (programId) filter.program = programId;
  if (status) filter.status = status;

  const projects = await Project.find(filter)
    .populate("program", "name slug")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  const enriched = await Promise.all(
    projects.map(async (p) => {
      const raised = await Donation.aggregate([
        { $match: { project: p._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amountUSD" } } },
      ]);
      return { ...p, amountRaised: raised[0]?.total ?? 0 };
    })
  );

  return ok(enriched);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const body = await req.json();
  const { program, name, duration, startDate, endDate, targetAmount, image, imagePublicId, description, status } = body;

  if (!program || !name || !duration || !targetAmount || !description) {
    return fail("Program, name, duration, targetAmount, and description are required");
  }

  await connectDB();
  const project = await Project.create({
    program,
    name,
    duration,
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    targetAmount: Number(targetAmount),
    image: image ?? null,
    imagePublicId: imagePublicId ?? null,
    description,
    status: status ?? "upcoming",
    createdBy: session!.user.id,
  });

  return ok(project, 201);
}
