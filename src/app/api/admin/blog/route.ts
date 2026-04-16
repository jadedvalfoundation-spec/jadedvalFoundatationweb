import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  await connectDB();
  const posts = await Blog.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return ok(posts);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  const body = await req.json();
  const { title, description, details, media, isPublished } = body;

  if (!title || !description || !details) {
    return fail("Title, description, and details are required");
  }

  await connectDB();
  const post = await Blog.create({
    title,
    description,
    details,
    media: media ?? [],
    isPublished: isPublished ?? false,
    createdBy: session!.user.id,
  });

  return ok(post, 201);
}
