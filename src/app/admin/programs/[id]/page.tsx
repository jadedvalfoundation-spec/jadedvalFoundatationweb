import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import Program from "@/models/Program";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

async function getData(id: string) {
  await connectDB();
  const program = await Program.findById(id).populate("createdBy", "name").lean();
  if (!program) return null;

  const projects = await Project.find({ program: id }).lean();
  const donations = await Donation.aggregate([
    { $match: { program: (program as { _id: unknown })._id, status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
  ]);
  const monthly = await Donation.aggregate([
    { $match: { program: (program as { _id: unknown })._id, status: "completed" } },
    { $group: { _id: { $dateToString: { format: "%b %Y", date: "$createdAt" } }, total: { $sum: "$amountUSD" } } },
    { $sort: { _id: 1 } }, { $limit: 6 },
  ]);

  return {
    program,
    projects,
    totalRaised: donations[0]?.total ?? 0,
    donorCount: donations[0]?.count ?? 0,
    monthly,
  };
}

export default async function ProgramDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { program, projects, totalRaised, donorCount, monthly } = data;
  const p = program as typeof program & { name: string; description: string; logo?: string; createdBy: { name: string } };

  const upcoming = projects.filter(pr => pr.status === "upcoming").length;
  const ongoing = projects.filter(pr => pr.status === "ongoing").length;
  const completed = projects.filter(pr => pr.status === "completed").length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/programs" className="hover:text-brand">Programs</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{p.name}</span>
      </div>

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
          {p.logo ? <Image src={p.logo} alt={p.name} width={64} height={64} className="h-16 w-16 object-cover" /> : <span className="text-3xl">📋</span>}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">{p.description}</p>
          <p className="mt-1 text-xs text-gray-400">Created by {(p.createdBy as unknown as { name: string })?.name}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={projects.length} icon="🚀" />
        <StatCard label="Total Raised" value={`$${totalRaised.toLocaleString()}`} icon="💰" />
        <StatCard label="Total Donors" value={donorCount} icon="👥" />
        <StatCard label="Ongoing" value={ongoing} icon="⚡" />
      </div>

      {/* Monthly donations bar chart */}
      {monthly.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Monthly Donations</h2>
          <div className="flex h-32 items-end gap-2">
            {monthly.map((m: { _id: string; total: number }) => {
              const max = Math.max(...monthly.map((x: { total: number }) => x.total));
              const height = max > 0 ? (m.total / max) * 100 : 0;
              return (
                <div key={m._id} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">${(m.total / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t bg-brand transition-all" style={{ height: `${height}%` }} />
                  <span className="text-xs text-gray-400">{m._id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-800">Projects in this Program</h2>
          <div className="flex gap-2 text-xs text-gray-500">
            <span>🔵 {upcoming} upcoming</span>
            <span>🟢 {ongoing} ongoing</span>
            <span>✅ {completed} completed</span>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Target</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Start</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.map(pr => (
              <tr key={String(pr._id)} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{pr.name}</td>
                <td className="px-4 py-3"><StatusBadge value={pr.status} /></td>
                <td className="px-4 py-3 text-gray-600">${pr.targetAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{pr.duration}</td>
                <td className="px-4 py-3 text-gray-500">{pr.startDate ? formatDate(new Date(pr.startDate)) : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/projects/${pr._id}`} className="text-xs text-brand hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No projects yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
