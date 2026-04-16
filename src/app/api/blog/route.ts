import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(12, parseInt(searchParams.get("limit") ?? "6"));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Blog.find({ isPublished: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("_id title slug description media publishedAt createdAt")
        .lean(),
      Blog.countDocuments({ isPublished: true }),
    ]);

    return NextResponse.json({ success: true, data: posts, total, page, limit });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch posts" }, { status: 500 });
  }
}
