import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Request from "@/models/Request";

const ALLOWED_TYPES = ["partnership", "volunteer", "donation", "urgent_help"] as const;
type AllowedType = typeof ALLOWED_TYPES[number];

export async function POST(req: globalThis.Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, organization, subject, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const requestType: AllowedType = ALLOWED_TYPES.includes(type) ? (type as AllowedType) : "partnership";

    await Request.create({
      type: requestType,
      name,
      email,
      phone: phone || null,
      organization: organization || null,
      subject: subject || (requestType === "volunteer" ? "Volunteer Application" : "Partnership Enquiry"),
      message,
    });

    return NextResponse.json({ success: true, message: "Your message has been received. We will be in touch soon!" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
