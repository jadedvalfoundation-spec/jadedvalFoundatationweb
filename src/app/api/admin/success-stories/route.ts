import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SuccessStory from "@/models/SuccessStory";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  await connectDB();
  const stories = await SuccessStory.find().sort({ createdAt: -1 }).lean();
  return ok(stories);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  await connectDB();
  const body = await req.json();
  const story = await SuccessStory.create({ ...body, createdBy: session!.user.id });
  return NextResponse.json({ success: true, data: story }, { status: 201 });
}
