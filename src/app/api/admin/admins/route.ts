import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole, ok, fail } from "@/lib/api-helpers";

const ALLOWED = ["super_admin", "admin"] as const;

export async function GET() {
  const { error } = await requireRole([...ALLOWED]);
  if (error) return error;

  await connectDB();
  const admins = await User.find({
    role: { $in: ["super_admin", "admin", "finance", "support"] },
  })
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 })
    .lean();

  return ok(admins);
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireRole([...ALLOWED]);
  if (error) return error;

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return fail("Name, email, password, and role are required");
  }

  // Only super_admin can create another super_admin
  if (role === "super_admin" && session!.user.role !== "super_admin") {
    return fail("Only super admins can create other super admins", 403);
  }

  const allowed_roles = ["super_admin", "admin", "finance", "support"];
  if (!allowed_roles.includes(role)) {
    return fail("Invalid role");
  }

  await connectDB();
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return fail("Email already in use", 409);

  const newAdmin = await User.create({ name, email, password, role, isActive: true });
  const { password: _p, ...safe } = newAdmin.toObject();
  void _p;

  return ok(safe, 201);
}
