import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Program from "@/models/Program";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin", "admin", "finance", "support"]);
  if (error) return error;

  await connectDB();
  const programs = await Program.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  // Attach project + donation stats
  const enriched = await Promise.all(
    programs.map(async (p) => {
      const projectCount = await Project.countDocuments({ program: p._id });
      const donations = await Donation.aggregate([
        { $match: { program: p._id, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amountUSD" } } },
      ]);
      return {
        ...p,
        projectCount,
        totalRaised: donations[0]?.total ?? 0,
      };
    })
  );

  return ok(enriched);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const body = await req.json();
  const { name, description, logo, logoPublicId } = body;

  if (!name || !description) return fail("Name and description are required");

  await connectDB();
  const program = await Program.create({
    name,
    description,
    logo: logo ?? null,
    logoPublicId: logoPublicId ?? null,
    createdBy: session!.user.id,
  });

  return ok(program, 201);
}
