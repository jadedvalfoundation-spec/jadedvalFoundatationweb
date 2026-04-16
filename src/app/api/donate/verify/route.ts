import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation";

export async function POST(req: globalThis.Request) {
  try {
    await connectDB();
    const { txRef, transactionId } = await req.json();

    if (!txRef) {
      return NextResponse.json({ success: false, message: "Transaction reference required." }, { status: 400 });
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ success: false, message: "Payment verification not configured." }, { status: 500 });
    }

    // Verify with Flutterwave
    const flwRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const flwData = await flwRes.json();

    if (flwData.status !== "success" || flwData.data?.status !== "successful") {
      await Donation.findOneAndUpdate({ transactionRef: txRef }, { status: "failed" });
      return NextResponse.json({ success: false, message: "Payment could not be verified." }, { status: 400 });
    }

    // Update donation to completed
    const donation = await Donation.findOneAndUpdate(
      { transactionRef: txRef },
      { status: "completed" },
      { new: true }
    );

    if (!donation) {
      return NextResponse.json({ success: false, message: "Donation record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Donation verified. Thank you!" });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ success: false, message: "Verification failed." }, { status: 500 });
  }
}
