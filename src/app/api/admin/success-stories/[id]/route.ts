import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import SuccessStory from "@/models/SuccessStory";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  const { id } = await params;
  await connectDB();
  const body = await req.json();
  const updated = await SuccessStory.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return fail("Not found", 404);
  return ok(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;
  const { id } = await params;
  await connectDB();
  await SuccessStory.findByIdAndDelete(id);
  return ok({ deleted: true });
}
