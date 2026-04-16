import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const post = await Blog.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!post) return fail("Blog post not found", 404);

  return ok(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const post = await Blog.findByIdAndDelete(id);
  if (!post) return fail("Blog post not found", 404);

  return ok({ message: "Post deleted" });
}
