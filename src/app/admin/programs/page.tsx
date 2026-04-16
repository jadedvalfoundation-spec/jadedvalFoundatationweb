"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/admin/PageHeader";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";

interface Program {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  logoPublicId?: string;
  isActive: boolean;
  projectCount: number;
  totalRaised: number;
  createdAt: string;
}

const BLANK = { name: "", description: "", logo: "", logoPublicId: "" };

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/programs");
    const json = await res.json();
    if (json.success) setPrograms(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  function openCreate() { setEditTarget(null); setForm(BLANK); setError(""); setModalOpen(true); }
  function openEdit(p: Program) {
    setEditTarget(p);
    setForm({ name: p.name, description: p.description, logo: p.logo ?? "", logoPublicId: p.logoPublicId ?? "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const url = editTarget ? `/api/admin/programs/${editTarget._id}` : "/api/admin/programs";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed"); return; }
      await fetchPrograms(); setModalOpen(false);
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/programs/${deleteTarget._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { await fetchPrograms(); setDeleteTarget(null); }
    else { alert(json.error); }
    setDeleting(false);
  }

  return (
    <div>
      <PageHeader title="Programs" description="Manage foundation programs" action={<Button size="sm" onClick={openCreate}>+ New Program</Button>} />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map(p => (
            <div key={p._id} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-gray-100">
                {p.logo ? (
                  <Image src={p.logo} alt={p.name} width={100} height={100} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">📋</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>🚀 {p.projectCount} projects</span>
                  <span>💰 ${p.totalRaised.toLocaleString()} raised</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/admin/programs/${p._id}`} className="flex-1 rounded-md border border-brand px-3 py-1.5 text-center text-xs font-medium text-brand hover:bg-brand-lighter">
                    View Dashboard
                  </Link>
                  <button onClick={() => openEdit(p)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => setDeleteTarget(p)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50">Del</button>
                </div>
              </div>
            </div>
          ))}
          {programs.length === 0 && (
            <div className="col-span-3 py-16 text-center text-gray-400">No programs yet. Create one to get started.</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Program" : "New Program"} size="lg">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Program Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <ImageUpload
            label="Logo"
            value={form.logo}
            onChange={(url, publicId) => setForm(f => ({ ...f, logo: url, logoPublicId: publicId }))}
            onRemove={() => setForm(f => ({ ...f, logo: "", logoPublicId: "" }))}
            uploading={uploading}
            folder="jadedval_foundation/programs"
            hint="PNG, JPG, SVG recommended"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>{editTarget ? "Save Changes" : "Create Program"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Program" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete"
      />
    </div>
  );
}
