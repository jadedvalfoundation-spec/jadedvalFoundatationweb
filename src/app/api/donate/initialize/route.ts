import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation";
import { nanoid } from "nanoid";

export async function POST(req: globalThis.Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      donorName, donorEmail, amountUSD, currency, convertedAmount,
      projectId, programId, paymentMethod, note,
    } = body;

    if (!donorName || !donorEmail || !amountUSD || amountUSD <= 0) {
      return NextResponse.json({ success: false, message: "Name, email, and a valid amount are required." }, { status: 400 });
    }

    const txRef = `JDF-${nanoid(12).toUpperCase()}`;

    const donation = await Donation.create({
      donorName,
      donorEmail,
      amountUSD: Number(amountUSD),
      currency: currency || "USD",
      convertedAmount: Number(convertedAmount) || Number(amountUSD),
      project: projectId || null,
      program: programId || null,
      status: "pending",
      transactionRef: txRef,
      paymentMethod: paymentMethod || "flutterwave",
      note: note || null,
    });

    return NextResponse.json({ success: true, txRef, donationId: String(donation._id) });
  } catch (err) {
    console.error("Donation init error:", err);
    return NextResponse.json({ success: false, message: "Failed to initialise donation." }, { status: 500 });
  }
}
