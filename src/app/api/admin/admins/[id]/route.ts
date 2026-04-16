import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole, ok, fail } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole(["super_admin", "admin"]);
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { name, email, role, isActive, password } = body;

  await connectDB();
  const target = await User.findById(id);
  if (!target) return fail("Admin not found", 404);

  // Only super_admin can promote/demote super_admin
  if (role === "super_admin" && session!.user.role !== "super_admin") {
    return fail("Only super admins can assign the super_admin role", 403);
  }
  if (target.role === "super_admin" && session!.user.role !== "super_admin") {
    return fail("Only super admins can edit another super admin", 403);
  }

  if (name) target.name = name;
  if (email) target.email = email.toLowerCase();
  if (role) target.role = role;
  if (typeof isActive === "boolean") target.isActive = isActive;
  if (password) target.password = password; // pre-save hook rehashes

  await target.save();
  const { password: _p, ...safe } = target.toObject();
  void _p;

  return ok(safe);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireRole(["super_admin"]);
  if (error) return error;

  const { id } = await params;
  if (id === session!.user.id) return fail("Cannot delete your own account");

  await connectDB();
  const target = await User.findById(id);
  if (!target) return fail("Admin not found", 404);

  await target.deleteOne();
  return ok({ message: "Admin deleted" });
}
