import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Impact from "@/models/Impact";

export async function GET() {
  try {
    await connectDB();
    const impacts = await Impact.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select("_id title description sector media createdAt")
      .lean();
    return NextResponse.json({ success: true, data: impacts });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}
