"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import { formatDate } from "@/lib/utils";

interface Request {
  _id: string; type: string; name: string; email: string;
  phone?: string; organization?: string; subject?: string;
  message: string; status: string; createdAt: string;
}

type TypeFilter = "" | "donation" | "partnership" | "volunteer" | "urgent_help";
const TYPE_LABELS: Record<string, string> = {
  donation: "Donation", partnership: "Partnership",
  volunteer: "Volunteer", urgent_help: "Urgent Help",
};
const TYPE_ICONS: Record<string, string> = {
  donation: "💳", partnership: "🤝", volunteer: "🙋", urgent_help: "🚨",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState<Request | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const url = `/api/admin/requests${typeFilter ? `?type=${typeFilter}` : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.success) setRequests(json.data);
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const TYPES: { value: TypeFilter; label: string }[] = [
    { value: "", label: "All" },
    { value: "donation", label: "Donation" },
    { value: "partnership", label: "Partnership" },
    { value: "volunteer", label: "Volunteer" },
    { value: "urgent_help", label: "Urgent Help" },
  ];

  // Counts per type
  const counts = requests.reduce((acc, r) => { acc[r.type] = (acc[r.type] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div>
      <PageHeader title="Requests" description="Donation, partnership, volunteer, and urgent help requests" />

      {/* Summary cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {(["donation", "partnership", "volunteer", "urgent_help"] as TypeFilter[]).map(t => (
          <div key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${typeFilter === t ? "border-brand bg-brand-lighter" : "border-gray-200 bg-white hover:border-brand/40"}`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{TYPE_ICONS[t!]}</span>
              <span className="text-2xl font-bold text-gray-800">{counts[t!] ?? 0}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700">{TYPE_LABELS[t!]}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${typeFilter === t.value ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
                      {TYPE_ICONS[r.type]} {TYPE_LABELS[r.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.email}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{r.subject ?? r.message.slice(0, 40) + "…"}</td>
                  <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(new Date(r.createdAt))}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setViewTarget(r)} className="text-xs text-brand hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={`${viewTarget ? TYPE_LABELS[viewTarget.type] : ""} Request`} size="lg">
        {viewTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-400">Name</p><p className="font-medium text-gray-800">{viewTarget.name}</p></div>
              <div><p className="text-xs text-gray-400">Email</p><p className="text-gray-700">{viewTarget.email}</p></div>
              {viewTarget.phone && <div><p className="text-xs text-gray-400">Phone</p><p className="text-gray-700">{viewTarget.phone}</p></div>}
              {viewTarget.organization && <div><p className="text-xs text-gray-400">Organization</p><p className="text-gray-700">{viewTarget.organization}</p></div>}
              <div><p className="text-xs text-gray-400">Date</p><p className="text-gray-700">{formatDate(new Date(viewTarget.createdAt))}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><StatusBadge value={viewTarget.status} /></div>
            </div>
            {viewTarget.subject && (
              <div><p className="text-xs text-gray-400">Subject</p><p className="font-medium text-gray-800">{viewTarget.subject}</p></div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">Message</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">{viewTarget.message}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
