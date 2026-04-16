import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";

export async function GET() {
  await connectDB();
  const info = await WebsiteInfo.findOne().lean();
  return NextResponse.json({ success: true, data: info ?? {} });
}
