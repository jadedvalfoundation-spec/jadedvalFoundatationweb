import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import BankAccount from "@/models/BankAccount";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function GET() {
  const { error } = await requireRole(["super_admin"]);
  if (error) return error;

  await connectDB();
  const accounts = await BankAccount.find().sort({ createdAt: -1 }).lean();
  return ok(accounts);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole(["super_admin"]);
  if (error) return error;

  const body = await req.json();
  const { accountName, bankName, accountNumber } = body;

  if (!accountName?.trim() || !bankName?.trim() || !accountNumber?.trim()) {
    return fail("accountName, bankName, and accountNumber are required");
  }

  await connectDB();
  const account = await BankAccount.create({
    accountName: accountName.trim(),
    bankName: bankName.trim(),
    accountNumber: accountNumber.trim(),
    createdBy: session!.user.id,
  });

  return ok(account, 201);
}
