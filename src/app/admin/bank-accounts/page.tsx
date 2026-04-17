"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface BankAccount {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  isActive: boolean;
}

const BLANK = { accountName: "", bankName: "", accountNumber: "" };

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState(BLANK);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    const res = await fetch("/api/admin/bank-accounts");
    const json = await res.json();
    if (json.success) setAccounts(json.data);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(BLANK);
    setError("");
    setModalOpen(true);
  }

  function openEdit(acc: BankAccount) {
    setEditing(acc);
    setForm({ accountName: acc.accountName, bankName: acc.bankName, accountNumber: acc.accountNumber });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.accountName.trim() || !form.bankName.trim() || !form.accountNumber.trim()) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing ? `/api/admin/bank-accounts/${editing._id}` : "/api/admin/bank-accounts",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save."); return; }
      setModalOpen(false);
      fetchAccounts();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(acc: BankAccount) {
    await fetch(`/api/admin/bank-accounts/${acc._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !acc.isActive }),
    });
    fetchAccounts();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/admin/bank-accounts/${deleteTarget._id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    fetchAccounts();
  }

  return (
    <div>
      <PageHeader
        title="Bank Accounts"
        description="Manage donation bank accounts shown to donors on the public donate page"
        action={<Button size="sm" onClick={openAdd}>+ Add Account</Button>}
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
      ) : accounts.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white text-center">
          <p className="text-sm text-gray-500">No bank accounts yet.</p>
          <Button size="sm" variant="outline" onClick={openAdd}>Add First Account</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc._id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-xl">
                  🏦
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{acc.bankName}</p>
                  <p className="text-sm text-gray-500">{acc.accountName}</p>
                  <p className="font-mono text-sm text-gray-700">{acc.accountNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(acc)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    acc.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {acc.isActive ? "Active" : "Inactive"}
                </button>

                <Button size="sm" variant="outline" onClick={() => openEdit(acc)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-500 hover:bg-red-50"
                  onClick={() => setDeleteTarget(acc)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Bank Account" : "Add Bank Account"}
      >
        <div className="space-y-4">
          <Input
            label="Bank Name"
            value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
            placeholder="e.g. First National Bank"
          />
          <Input
            label="Account Name"
            value={form.accountName}
            onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
            placeholder="e.g. Jade D'Val Foundation NGO"
          />
          <Input
            label="Account Number"
            value={form.accountNumber}
            onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
            placeholder="e.g. 0123456789"
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? "Save Changes" : "Add Account"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Bank Account"
        message={`Are you sure you want to delete the account "${deleteTarget?.bankName} — ${deleteTarget?.accountNumber}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
