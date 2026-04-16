import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types";

export async function requireRole(allowed: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  if (!(allowed as string[]).includes(session.user.role ?? "")) {
    return {
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
