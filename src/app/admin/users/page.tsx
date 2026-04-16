import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Donation from "@/models/Donation";
import { formatDate, generateInitials } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";

export const metadata = { title: "All Users" };

async function getData() {
  await connectDB();
  const users = await User.find({ role: "user" })
    .select("-password -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const donorStats = await Donation.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$donorEmail",
        totalDonated: { $sum: "$amountUSD" },
        count: { $sum: 1 },
      },
    },
  ]);

  const donorMap = new Map(donorStats.map(d => [d._id, { totalDonated: d.totalDonated, count: d.count }]));

  const enriched = users.map(u => ({
    ...u,
    donorStats: donorMap.get(u.email) ?? null,
  }));

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const donors = donorStats.length;
  const totalRaised = donorStats.reduce((s, d) => s + d.totalDonated, 0);

  return { users: enriched, totalUsers, activeUsers, donors, totalRaised };
}

export default async function UsersPage() {
  const { users, totalUsers, activeUsers, donors, totalRaised } = await getData();

  return (
    <div>
      <PageHeader title="All Users" description="Donors, volunteers, and registered users" />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} icon="👥" />
        <StatCard label="Active Users" value={activeUsers} icon="✅" />
        <StatCard label="Donors" value={donors} icon="💳" />
        <StatCard label="Total Raised" value={`$${totalRaised.toLocaleString()}`} icon="💰" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Total Donated</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Donations</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={String(user._id)} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                      {generateInitials(user.name)}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={user.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-right">
                  {user.donorStats ? (
                    <span className="font-semibold text-brand">${user.donorStats.totalDonated.toLocaleString()}</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{user.donorStats?.count ?? "—"}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                  {formatDate(new Date(user.createdAt as Date))}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
