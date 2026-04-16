"use client";

import { useState, useEffect, useCallback } from "react";
import StatCard from "@/components/admin/StatCard";
import PageHeader from "@/components/admin/PageHeader";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface FinanceData {
  totalRaised: number;
  totalDonations: number;
  totalExpenses: number;
  netBalance: number;
  donationsOverTime: { _id: string; total: number; count: number }[];
  expenses: { _id: string; total: number; count: number }[];
  byProgram: { programName: string; total: number; count: number }[];
  byProject: { projectName: string; total: number; count: number }[];
  topDonors: { donorName: string; donorEmail: string; totalDonated: number; donationCount: number; lastDonation: string }[];
}

const COLORS = ["#00ccbb", "#009e91", "#007a70", "#33d7cc", "#e6faf9", "#0088fe", "#00C49F"];
const PERIODS = [{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }];

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/finance?period=${period}`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-400">Loading financial data…</div>;
  if (!data) return <div className="text-center text-red-500">Failed to load data</div>;

  const chartDonations = data.donationsOverTime.map(d => ({ name: d._id, Donations: d.total, Count: d.count }));
  const chartExpenses = data.expenses.map(e => ({ name: e._id, Expenses: e.total }));
  const combined = chartDonations.map((d, i) => ({ ...d, Expenses: chartExpenses[i]?.Expenses ?? 0 }));
  const pieData = data.byProgram.slice(0, 6).map(p => ({ name: p.programName ?? "General", value: p.total }));

  return (
    <div>
      <PageHeader title="Financial Dashboard" description="Revenue, expenses, and donor analytics" />

      {/* Period selector */}
      <div className="mb-6 flex gap-2">
        {PERIODS.map(p => (
          <button key={p.value} onClick={() => setPeriod(p.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${period === p.value ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Raised" value={`$${data.totalRaised.toLocaleString()}`} icon="💰" />
        <StatCard label="Total Donations" value={data.totalDonations.toLocaleString()} icon="📈" />
        <StatCard label="Total Expenses" value={`$${data.totalExpenses.toLocaleString()}`} icon="📉" />
        <StatCard label="Net Balance" value={`$${data.netBalance.toLocaleString()}`} icon={data.netBalance >= 0 ? "✅" : "⚠️"} />
      </div>

      {/* Income vs Expenses chart */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combined}>
            <defs>
              <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ccbb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ccbb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="Donations" stroke="#00ccbb" fill="url(#colorDonations)" strokeWidth={2} />
            <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* By Program Pie */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Donations by Program</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">No program data</p>
          )}
        </div>

        {/* Top projects bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Top Projects by Donations</h2>
          {data.byProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.byProject.slice(0, 6).map(p => ({ name: p.projectName ?? "General", total: p.total }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="total" fill="#00ccbb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-gray-400">No project data</p>
          )}
        </div>
      </div>

      {/* Top 100 Donors */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold text-gray-800">Top 100 Donors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total Donated</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Donations</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Last Donation</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.topDonors.map((d, i) => (
                <tr key={d.donorEmail} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{d.donorName}</td>
                  <td className="px-4 py-3 text-gray-500">{d.donorEmail}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand">${d.totalDonated.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{d.donationCount}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">{new Date(d.lastDonation).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.topDonors.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No donors yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
