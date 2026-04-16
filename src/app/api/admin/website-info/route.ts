import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  await connectDB();
  let info = await WebsiteInfo.findOne().lean();
  if (!info) {
    info = await WebsiteInfo.create({});
  }

  return ok(info);
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  const body = await req.json();
  await connectDB();

  const info = await WebsiteInfo.findOneAndUpdate(
    {},
    { ...body, updatedBy: session!.user.id },
    { new: true, upsert: true, runValidators: true }
  );

  return ok(info);
}
