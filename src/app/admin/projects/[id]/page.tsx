import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

async function getData(id: string) {
  await connectDB();
  const project = await Project.findById(id)
    .populate("program", "name _id")
    .populate("createdBy", "name")
    .lean();
  if (!project) return null;

  const raisedAgg = await Donation.aggregate([
    { $match: { project: (project as { _id: unknown })._id, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
  ]);
  const monthly = await Donation.aggregate([
    { $match: { project: (project as { _id: unknown })._id, status: "completed" } },
    { $group: { _id: { $dateToString: { format: "%b %Y", date: "$createdAt" } }, total: { $sum: "$amountUSD" } } },
    { $sort: { _id: 1 } }, { $limit: 6 },
  ]);
  const recentDonors = await Donation.find({ project: (project as { _id: unknown })._id, status: "completed" })
    .sort({ createdAt: -1 }).limit(10).select("donorName donorEmail amountUSD createdAt").lean();

  const amountRaised = raisedAgg[0]?.total ?? 0;
  const donorCount = raisedAgg[0]?.count ?? 0;
  const pct = (project as { targetAmount: number }).targetAmount > 0
    ? Math.min(100, (amountRaised / (project as { targetAmount: number }).targetAmount) * 100)
    : 0;

  return { project, amountRaised, donorCount, pct, monthly, recentDonors };
}

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { project, amountRaised, donorCount, pct, monthly, recentDonors } = data;
  type P = typeof project & {
    name: string; status: string; targetAmount: number; duration: string;
    startDate?: Date; endDate?: Date; description: string; image?: string;
    totalAmountUsed?: number; achievement?: string;
    program: { _id: string; name: string };
    createdBy: { name: string };
  };
  const p = project as unknown as P;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/projects" className="hover:text-brand">Projects</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{p.name}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-start gap-4">
        {p.image && <Image src={p.image} alt={p.name} width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
            <StatusBadge value={p.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Program: <Link href={`/admin/programs/${p.program?._id}`} className="text-brand hover:underline">{p.program?.name}</Link>
            {" · "} Duration: {p.duration}
            {p.startDate && <> · Start: {formatDate(new Date(p.startDate))}</>}
            {p.endDate && <> · End: {formatDate(new Date(p.endDate))}</>}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Target" value={`$${p.targetAmount.toLocaleString()}`} icon="🎯" />
        <StatCard label="Raised" value={`$${amountRaised.toLocaleString()}`} icon="💰" />
        <StatCard label="Donors" value={donorCount} icon="👥" />
        <StatCard label="Progress" value={`${pct.toFixed(1)}%`} icon="📊" />
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-gray-700">Fundraising Progress</span>
          <span className="text-brand font-semibold">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>${amountRaised.toLocaleString()} raised</span>
          <span>${p.targetAmount.toLocaleString()} goal</span>
        </div>
      </div>

      {/* Completed info */}
      {p.status === "completed" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <h2 className="font-semibold text-green-800">Project Completed</h2>
          {p.totalAmountUsed != null && (
            <p className="mt-1 text-sm text-green-700">Total used: <strong>${p.totalAmountUsed.toLocaleString()}</strong></p>
          )}
          {p.achievement && (
            <div className="rich-content mt-2 text-sm text-green-700"
              dangerouslySetInnerHTML={{ __html: p.achievement }} />
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly chart */}
        {monthly.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Monthly Donations</h2>
            <div className="flex h-28 items-end gap-1">
              {monthly.map((m: { _id: string; total: number }) => {
                const max = Math.max(...monthly.map((x: { total: number }) => x.total));
                const h = max > 0 ? (m.total / max) * 100 : 0;
                return (
                  <div key={m._id} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">${Math.round(m.total / 1000)}k</span>
                    <div className="w-full rounded-t bg-brand" style={{ height: `${h}%` }} />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{m._id.split(" ")[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent donors */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Recent Donors</h2>
          </div>
          <table className="w-full text-xs">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-500">Donor</th>
                <th className="px-3 py-2 text-right text-gray-500">Amount</th>
                <th className="px-3 py-2 text-right text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentDonors.map((d: { _id: unknown; donorName: string; donorEmail: string; amountUSD: number; createdAt: Date }) => (
                <tr key={String(d._id)} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-800">{d.donorName}</p>
                    <p className="text-gray-400">{d.donorEmail}</p>
                  </td>
                  <td className="px-3 py-2 text-right text-brand font-semibold">${d.amountUSD.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-gray-400">{formatDate(new Date(d.createdAt))}</td>
                </tr>
              ))}
              {recentDonors.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-400">No donations yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Description */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Project Description</h2>
        <div className="rich-content text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: p.description }} />
      </div>
    </div>
  );
}
