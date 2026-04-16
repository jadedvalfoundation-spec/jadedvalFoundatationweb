"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";

interface Requisition {
  _id: string; name: string; purpose: string; amount: number; status: string;
  createdBy: { name: string; email: string; role: string };
  reviewedBy?: { name: string };
  reviewReason?: string; createdAt: string; updatedAt: string;
}

type Tab = "pending" | "approved" | "rejected";
const BLANK = { name: "", purpose: "", amount: "" };

export default function RequisitionsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const isSuperAdmin = role === "super_admin";
  const isFinanceOrSuper = ["super_admin", "finance"].includes(role);

  const [reqs, setReqs] = useState<Requisition[]>([]);
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ req: Requisition; action: "approve" | "reject" } | null>(null);
  const [editTarget, setEditTarget] = useState<Requisition | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Requisition | null>(null);
  const [form, setForm] = useState(BLANK);
  const [reviewReason, setReviewReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchReqs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/requisitions?status=${tab}`);
    const json = await res.json();
    if (json.success) setReqs(json.data);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchReqs(); }, [fetchReqs]);

  async function handleCreate() {
    setSaving(true); setError("");
    const res = await fetch("/api/admin/requisitions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, purpose: form.purpose, amount: form.amount }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error ?? "Failed"); setSaving(false); return; }
    setSaving(false); setCreateOpen(false); setForm(BLANK); fetchReqs();
  }

  async function handleReview() {
    if (!reviewTarget) return;
    setSaving(true);
    const res = await fetch(`/api/admin/requisitions/${reviewTarget.req._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: reviewTarget.action, reason: reviewReason }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) { setReviewTarget(null); setReviewReason(""); fetchReqs(); }
  }

  async function handleEdit() {
    if (!editTarget) return;
    setSaving(true); setError("");
    const res = await fetch(`/api/admin/requisitions/${editTarget._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, purpose: form.purpose, amount: form.amount }),
    });
    const json = await res.json();
    setSaving(false);
    if (!json.success) { setError(json.error ?? "Failed"); return; }
    setEditTarget(null); fetchReqs();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    const res = await fetch(`/api/admin/requisitions/${deleteTarget._id}`, { method: "DELETE" });
    const json = await res.json();
    setSaving(false);
    if (json.success) { setDeleteTarget(null); fetchReqs(); }
    else alert(json.error);
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <PageHeader
        title="Requisitions"
        description="Submit and manage fund requests"
        action={<Button size="sm" onClick={() => { setForm(BLANK); setError(""); setCreateOpen(true); }}>+ New Requisition</Button>}
      />

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Purpose</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Submitted By</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                {tab !== "pending" && <th className="px-4 py-3 text-left font-medium text-gray-500">Reason</th>}
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reqs.map(r => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 max-w-xs text-gray-600 truncate">{r.purpose}</td>
                  <td className="px-4 py-3 font-semibold text-brand">${r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    <p>{r.createdBy?.name}</p>
                    <p className="text-gray-400">{r.createdBy?.role}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(new Date(r.createdAt))}</td>
                  {tab !== "pending" && <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.reviewReason ?? "—"}</td>}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {tab === "pending" && isFinanceOrSuper && (
                        <>
                          <button onClick={() => { setReviewTarget({ req: r, action: "approve" }); setReviewReason(""); }}
                            className="text-xs text-green-600 hover:underline">Approve</button>
                          <button onClick={() => { setReviewTarget({ req: r, action: "reject" }); setReviewReason(""); }}
                            className="text-xs text-red-500 hover:underline">Reject</button>
                        </>
                      )}
                      {isSuperAdmin && r.status !== "approved" && (
                        <>
                          <button onClick={() => { setEditTarget(r); setForm({ name: r.name, purpose: r.purpose, amount: String(r.amount) }); setError(""); }}
                            className="text-xs text-gray-500 hover:underline">Edit</button>
                          <button onClick={() => setDeleteTarget(r)} className="text-xs text-red-500 hover:underline">Del</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reqs.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">No {tab} requisitions</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Requisition">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Requisition Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Purpose" rows={3} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required />
          <Input label="Amount (USD)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleCreate}>Submit</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Requisition">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Purpose" rows={3} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
          <Input label="Amount (USD)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title={reviewTarget?.action === "approve" ? "Approve Requisition" : "Reject Requisition"}>
        <div className="space-y-4">
          {reviewTarget && (
            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p className="font-medium">{reviewTarget.req.name}</p>
              <p className="text-gray-600">{reviewTarget.req.purpose}</p>
              <p className="mt-1 font-semibold text-brand">${reviewTarget.req.amount.toLocaleString()}</p>
            </div>
          )}
          <Textarea
            label={reviewTarget?.action === "approve" ? "Approval Note (optional)" : "Rejection Reason *"}
            rows={3} value={reviewReason} onChange={e => setReviewReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button variant={reviewTarget?.action === "approve" ? "primary" : "danger"} size="sm" loading={saving} onClick={handleReview}>
              {reviewTarget?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={saving}
        title="Delete Requisition" message={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" />
    </div>
  );
}
