import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import BankAccount from "@/models/BankAccount";
import { requireRole, ok, fail } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin"]);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id", 404);

  const body = await req.json();
  const { accountName, bankName, accountNumber, isActive } = body;

  if (accountName !== undefined && !accountName?.trim()) return fail("accountName cannot be empty");
  if (bankName !== undefined && !bankName?.trim()) return fail("bankName cannot be empty");
  if (accountNumber !== undefined && !accountNumber?.trim()) return fail("accountNumber cannot be empty");

  await connectDB();
  const update: Record<string, unknown> = {};
  if (accountName !== undefined) update.accountName = accountName.trim();
  if (bankName !== undefined) update.bankName = bankName.trim();
  if (accountNumber !== undefined) update.accountNumber = accountNumber.trim();
  if (isActive !== undefined) update.isActive = isActive;

  const account = await BankAccount.findByIdAndUpdate(id, update, { new: true });
  if (!account) return fail("Account not found", 404);

  return ok(account);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole(["super_admin"]);
  if (error) return error;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Invalid id", 404);

  await connectDB();
  const account = await BankAccount.findByIdAndDelete(id);
  if (!account) return fail("Account not found", 404);

  return ok({ deleted: true });
}
