"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface Donation {
  _id: string;
  donorName: string;
  donorEmail: string;
  amountUSD: number;
  currency: string;
  convertedAmount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  transactionRef: string;
  project?: { name: string } | null;
  createdAt: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Verified" },
  { value: "failed", label: "Failed" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed:    "bg-red-100 text-red-500",
  refunded:  "bg-gray-100 text-gray-500",
};

function fmtCurrency(amount: number, currency: string) {
  const sym: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh",
    ZAR: "R", CAD: "CA$", AUD: "A$",
  };
  const s = sym[currency] ?? currency + " ";
  if (amount >= 1_000_000) return `${s}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1000) return `${s}${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `${s}${amount.toLocaleString()}`;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    donation: Donation;
    nextStatus: "completed" | "failed";
  } | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/donations?status=${statusFilter}&page=${page}`
    );
    const json = await res.json();
    if (json.success) {
      setDonations(json.data.donations);
      setTotal(json.data.total);
      setPages(json.data.pages);
    }
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [statusFilter]);

  async function applyStatus(donationId: string, status: "completed" | "failed") {
    setActioning(true);
    await fetch(`/api/admin/donations/${donationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActioning(false);
    setConfirmAction(null);
    fetchDonations();
  }

  const pendingCount = statusFilter === "all"
    ? donations.filter((d) => d.status === "pending").length
    : 0;

  return (
    <div>
      <PageHeader
        title="Donations"
        description="Review and verify incoming donations from donors"
      />

      {/* Status filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
            {f.value === "all" && total > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">
                {total}
              </span>
            )}
          </button>
        ))}

        {pendingCount > 0 && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            {pendingCount} awaiting verification
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Donor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Method</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    Loading donations…
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    No donations found
                  </td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    {/* Name */}
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {d.donorName}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-500">
                      {d.donorEmail}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">
                        ${d.amountUSD.toLocaleString()}
                      </span>
                      {d.currency !== "USD" && (
                        <span className="ml-1.5 text-xs text-gray-400">
                          ({fmtCurrency(d.convertedAmount, d.currency)})
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        {d.paymentMethod === "bank_transfer" ? "🏦 Bank" : "💳 Online"}
                      </span>
                    </td>

                    {/* Project */}
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                      {d.project?.name ?? <span className="text-gray-300">General</span>}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}{" "}
                      <span className="text-gray-300">
                        {new Date(d.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          STATUS_STYLES[d.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {d.status === "completed" ? "Verified" : d.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {d.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setConfirmAction({ donation: d, nextStatus: "completed" })
                            }
                            className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({ donation: d, nextStatus: "failed" })
                            }
                            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-xs text-gray-400">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm verify / reject */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() =>
          confirmAction && applyStatus(confirmAction.donation._id, confirmAction.nextStatus)
        }
        title={
          confirmAction?.nextStatus === "completed"
            ? "Verify Payment"
            : "Reject Payment"
        }
        message={
          confirmAction
            ? confirmAction.nextStatus === "completed"
              ? `Mark the $${confirmAction.donation.amountUSD.toLocaleString()} donation from ${confirmAction.donation.donorName} (${confirmAction.donation.donorEmail}) as verified?`
              : `Reject the $${confirmAction.donation.amountUSD.toLocaleString()} donation from ${confirmAction.donation.donorName}? This marks it as failed.`
            : ""
        }
        confirmLabel={
          confirmAction?.nextStatus === "completed" ? "Yes, Verify" : "Yes, Reject"
        }
        variant={confirmAction?.nextStatus === "completed" ? "primary" : "danger"}
        loading={actioning}
      />
    </div>
  );
}
