import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const metadata = { title: "Admin Dashboard" };

async function getStats() {
  try {
    await connectDB();
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const admins = await User.countDocuments({ role: "admin" });
    return { totalUsers, activeUsers, admins };
  } catch {
    return { totalUsers: 0, activeUsers: 0, admins: 0 };
  }
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Users",
            value: stats.totalUsers,
            icon: "👥",
            color: "blue",
          },
          {
            label: "Active Users",
            value: stats.activeUsers,
            icon: "✅",
            color: "green",
          },
          {
            label: "Admins",
            value: stats.admins,
            icon: "🛡️",
            color: "purple",
          },
          {
            label: "Media Files",
            value: 0,
            icon: "🖼️",
            color: "orange",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Manage Users", href: "/admin/users", icon: "👥" },
            { label: "Upload Media", href: "/admin/media", icon: "🖼️" },
            { label: "View Site", href: "/", icon: "🌐" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand hover:bg-brand"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
