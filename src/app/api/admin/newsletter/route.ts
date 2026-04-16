import connectDB from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";
import { requireRole, ok } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin", "admin", "support"]);
  if (error) return error;

  await connectDB();
  const subscribers = await Newsletter.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  return ok(subscribers);
}
