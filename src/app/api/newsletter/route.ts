import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, message: "This email is already subscribed." },
          { status: 409 }
        );
      }
      // Re-activate if previously unsubscribed
      existing.isActive = true;
      await existing.save();
      return NextResponse.json({ success: true, message: "Welcome back! You have been re-subscribed." });
    }

    await Newsletter.create({ email });
    return NextResponse.json({ success: true, message: "Thank you for subscribing!" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
