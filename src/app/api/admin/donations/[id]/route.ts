import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation";
import Project from "@/models/Project";
import { requireRole, ok, fail } from "@/lib/api-helpers";
import { sendMail } from "@/lib/mailer";
import { donationVerifiedEmail } from "@/lib/email-templates/donation-verified";
import { donationRejectedEmail } from "@/lib/email-templates/donation-rejected";
import mongoose from "mongoose";

// PATCH /api/admin/donations/[id]  — update status (verify / reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin", "finance"]);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id", 404);

  const body = await req.json();
  const { status } = body;

  if (!["completed", "failed", "pending"].includes(status)) {
    return fail("status must be completed, failed, or pending");
  }

  await connectDB();

  const donation = await Donation.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate("project", "name");

  if (!donation) return fail("Donation not found", 404);

  // Send email on verification or rejection
  if (status === "completed" || status === "failed") {
    const projectName =
      (donation.project as { name?: string } | null)?.name ?? undefined;

    const emailPayload = {
      donorName: donation.donorName,
      amountUSD: donation.amountUSD,
      currency: donation.currency,
      convertedAmount: donation.convertedAmount,
      projectName,
      transactionRef: donation.transactionRef,
    };

    try {
      if (status === "completed") {
        await sendMail({
          to: donation.donorEmail,
          subject: `Your gift has been confirmed — thank you, ${donation.donorName.split(" ")[0]}! 💚`,
          html: donationVerifiedEmail(emailPayload),
        });
      } else {
        await sendMail({
          to: donation.donorEmail,
          subject: `We could not confirm your transfer — please reach out to us`,
          html: donationRejectedEmail(emailPayload),
        });
      }
    } catch (emailErr) {
      // Don't fail the request if email delivery fails — log and continue
      console.error("Donation email failed:", emailErr);
    }
  }

  // Lean return (strip mongoose internals)
  const result = {
    _id: String(donation._id),
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    amountUSD: donation.amountUSD,
    currency: donation.currency,
    convertedAmount: donation.convertedAmount,
    status: donation.status,
    transactionRef: donation.transactionRef,
  };

  return ok(result);
}

// keep Project model registered for populate
void Project;
