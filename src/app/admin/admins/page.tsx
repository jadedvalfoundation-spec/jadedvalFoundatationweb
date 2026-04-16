"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDate, generateInitials } from "@/lib/utils";

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "finance", label: "Finance" },
  { value: "support", label: "Support" },
  { value: "super_admin", label: "Super Admin" },
];

const BLANK = { name: "", email: "", password: "", role: "admin" };

export default function AdminsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const isSuperAdmin = role === "super_admin";

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/admins");
    const json = await res.json();
    if (json.success) setAdmins(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  function openCreate() {
    setEditTarget(null);
    setForm(BLANK);
    setError("");
    setModalOpen(true);
  }

  function openEdit(admin: Admin) {
    setEditTarget(admin);
    setForm({ name: admin.name, email: admin.email, password: "", role: admin.role });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = editTarget ? `/api/admin/admins/${editTarget._id}` : "/api/admin/admins";
      const method = editTarget ? "PATCH" : "POST";
      const body: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (!editTarget || form.password) body.password = form.password;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed"); return; }
      await fetchAdmins();
      setModalOpen(false);
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/admins/${deleteTarget._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { await fetchAdmins(); setDeleteTarget(null); }
    setDeleting(false);
  }

  const availableRoles = isSuperAdmin ? ROLE_OPTIONS : ROLE_OPTIONS.filter(r => r.value !== "super_admin");

  return (
    <div>
      <PageHeader
        title="Admin Users"
        description="Manage admin portal access"
        action={
          <Button size="sm" onClick={openCreate}>+ New Admin</Button>
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                        {generateInitials(admin.name)}
                      </div>
                      <span className="font-medium text-gray-800">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                  <td className="px-4 py-3"><StatusBadge value={admin.role} /></td>
                  <td className="px-4 py-3"><StatusBadge value={admin.isActive ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(new Date(admin.createdAt))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(admin)}
                        className="text-xs text-brand hover:underline"
                        disabled={admin.role === "super_admin" && !isSuperAdmin}
                      >
                        Edit
                      </button>
                      {isSuperAdmin && admin._id !== session?.user?.id && (
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No admin users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Admin" : "New Admin"}>
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <Input label={editTarget ? "New Password (leave blank to keep)" : "Password"} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editTarget} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>{editTarget ? "Save Changes" : "Create Admin"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Admin"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
