import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireRole(["super_admin", "finance"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "all" | "pending" | "completed" | "failed"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 50;

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;

  const [donations, total] = await Promise.all([
    Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("project", "name")
      .lean(),
    Donation.countDocuments(filter),
  ]);

  return ok({ donations, total, page, pages: Math.ceil(total / limit) });
}
