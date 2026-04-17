import connectDB from "@/lib/mongodb";
import BankAccount from "@/models/BankAccount";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  await connectDB();
  const accounts = await BankAccount.find({ isActive: true })
    .select("accountName bankName accountNumber")
    .sort({ createdAt: 1 })
    .lean();
  return ok(accounts);
}
