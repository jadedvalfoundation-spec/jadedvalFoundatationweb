import { auth } from "@/auth";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Program from "@/models/Program";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import Requisition from "@/models/Requisition";
import Request from "@/models/Request";
import StatCard from "@/components/admin/StatCard";
import { isAdminRole } from "@/models/User";

export const metadata = { title: "Admin Dashboard" };

async function getStats() {
  try {
    await connectDB();
    const [totalUsers, activeUsers, programs, projects, donationAgg, pendingReqs, newRequests] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "user", isActive: true }),
        Program.countDocuments(),
        Project.countDocuments(),
        Donation.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amountUSD" } } },
        ]),
        Requisition.countDocuments({ status: "pending" }),
        Request.countDocuments({ status: "new" }),
      ]);
    return {
      totalUsers,
      activeUsers,
      programs,
      projects,
      totalRaised: donationAgg[0]?.total ?? 0,
      pendingReqs,
      newRequests,
    };
  } catch {
    return { totalUsers: 0, activeUsers: 0, programs: 0, projects: 0, totalRaised: 0, pendingReqs: 0, newRequests: 0 };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role ?? "";
  const stats = await getStats();

  const canSeeFinance = ["super_admin", "admin", "finance"].includes(role);
  const canSeePrograms = ["super_admin", "admin"].includes(role);
  const canSeeRequests = ["super_admin", "admin"].includes(role);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 capitalize">
          {role.replace("_", " ")} ·{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canSeePrograms && (
          <>
            <StatCard label="Programs" value={stats.programs} icon="📋" />
            <StatCard label="Projects" value={stats.projects} icon="🚀" />
          </>
        )}
        {canSeeFinance && (
          <>
            <StatCard
              label="Total Raised"
              value={`$${stats.totalRaised.toLocaleString()}`}
              icon="💰"
            />
            <StatCard label="Pending Requisitions" value={stats.pendingReqs} icon="📝" />
          </>
        )}
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Active Users" value={stats.activeUsers} icon="✅" />
        {canSeeRequests && (
          <StatCard label="New Requests" value={stats.newRequests} icon="📨" />
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-gray-700">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {canSeePrograms && (
            <>
              <Link href="/admin/programs" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md">
                <span className="text-2xl">📋</span>
                <div><p className="text-sm font-semibold text-gray-800">Programs</p><p className="text-xs text-gray-500">Manage programs</p></div>
              </Link>
              <Link href="/admin/projects" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md">
                <span className="text-2xl">🚀</span>
                <div><p className="text-sm font-semibold text-gray-800">Projects</p><p className="text-xs text-gray-500">Manage projects</p></div>
              </Link>
            </>
          )}
          {canSeeFinance && (
            <Link href="/admin/finance" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md">
              <span className="text-2xl">💰</span>
              <div><p className="text-sm font-semibold text-gray-800">Finance</p><p className="text-xs text-gray-500">Charts & analytics</p></div>
            </Link>
          )}
          {["super_admin", "admin", "support"].includes(role) && (
            <Link href="/admin/blog" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md">
              <span className="text-2xl">📰</span>
              <div><p className="text-sm font-semibold text-gray-800">Blog</p><p className="text-xs text-gray-500">Create & manage posts</p></div>
            </Link>
          )}
          {isAdminRole(role) && (
            <Link href="/admin/requisitions" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-md">
              <span className="text-2xl">📝</span>
              <div><p className="text-sm font-semibold text-gray-800">Requisitions</p><p className="text-xs text-gray-500">Submit & track</p></div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
