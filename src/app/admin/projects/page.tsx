"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import { formatDate } from "@/lib/utils";

interface Program { _id: string; name: string; }
interface Project {
  _id: string; name: string; status: string;
  targetAmount: number; amountRaised: number;
  duration: string; startDate?: string; endDate?: string;
  image?: string; description: string;
  program: { _id: string; name: string };
  createdAt: string;
}

const BLANK = {
  program: "", name: "", duration: "", startDate: "",
  targetAmount: "", image: "", imagePublicId: "", description: "", status: "upcoming",
  totalAmountUsed: "", achievement: "",
};
const STATUS_OPTIONS = ["upcoming", "ongoing", "completed"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [pjRes, pgRes] = await Promise.all([
      fetch(`/api/admin/projects${filter ? `?status=${filter}` : ""}`),
      fetch("/api/admin/programs"),
    ]);
    const [pj, pg] = await Promise.all([pjRes.json(), pgRes.json()]);
    if (pj.success) setProjects(pj.data);
    if (pg.success) setPrograms(pg.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openCreate() { setEditTarget(null); setForm(BLANK); setError(""); setModalOpen(true); }
  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({
      program: p.program._id, name: p.name, duration: p.duration,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",

      targetAmount: String(p.targetAmount), image: p.image ?? "", imagePublicId: "",
      description: p.description, status: p.status,
      totalAmountUsed: "", achievement: "",
    });
    setError(""); setModalOpen(true);
  }

  async function handleSave() {
    if (!form.program) { setError("Please select a program before saving."); return; }
    setSaving(true); setError("");
    try {
      const url = editTarget ? `/api/admin/projects/${editTarget._id}` : "/api/admin/projects";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed"); return; }
      await fetchAll(); setModalOpen(false);
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/projects/${deleteTarget._id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { await fetchAll(); setDeleteTarget(null); }
    else alert(json.error);
    setDeleting(false);
  }

  const filtered = filter ? projects.filter(p => p.status === filter) : projects;

  return (
    <div>
      <PageHeader title="Projects" description="Manage all foundation projects" action={<Button size="sm" onClick={openCreate}>+ New Project</Button>} />

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {["", ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === s ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Program</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Target</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Raised</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => {
                const pct = p.targetAmount > 0 ? Math.min(100, (p.amountRaised / p.targetAmount) * 100) : 0;
                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && <Image src={p.image} alt={p.name} width={32} height={32} className="h-8 w-8 rounded object-cover" />}
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.program?.name}</td>
                    <td className="px-4 py-3"><StatusBadge value={p.status} /></td>
                    <td className="px-4 py-3 text-gray-600">${p.targetAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-600">${p.amountRaised.toLocaleString()}</span>
                        <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.duration}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/projects/${p._id}`} className="text-xs text-brand hover:underline">View</Link>
                        <button onClick={() => openEdit(p)} className="text-xs text-gray-500 hover:underline">Edit</button>
                        <button onClick={() => setDeleteTarget(p)} className="text-xs text-red-500 hover:underline">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">No projects found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Project" : "New Project"} size="xl">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Program *</label>
            {programs.length === 0 ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                No programs exist yet. You must{" "}
                <a href="/admin/programs" className="font-semibold underline hover:text-amber-900">
                  create a program
                </a>{" "}
                before adding a project.
              </div>
            ) : (
              <select
                value={form.program}
                onChange={e => setForm({ ...form, program: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="" disabled>Select a program…</option>
                {programs.map(pg => <option key={pg._id} value={pg._id}>{pg.name}</option>)}
              </select>
            )}
          </div>
          <Input label="Project Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (e.g. 3 months) *" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            <Input label="Target Amount (USD) *" type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
          </div>
          <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          {form.status === "completed" && (
            <>
              <Input label="Total Amount Used (USD)" type="number" value={form.totalAmountUsed} onChange={e => setForm({ ...form, totalAmountUsed: e.target.value })} />
              <RichTextEditor
                label="What did the project achieve?"
                value={form.achievement}
                onChange={html => setForm(f => ({ ...f, achievement: html }))}
                placeholder="Describe the outcomes and impact…"
                minHeight={140}
              />
            </>
          )}
          <RichTextEditor
            label="Project Description (full details) *"
            value={form.description}
            onChange={html => setForm(f => ({ ...f, description: html }))}
            placeholder="Describe the project… use headings, bold text, bullet points, etc."
            minHeight={220}
          />
          <ImageUpload
            label="Project Image"
            value={form.image}
            onChange={(url, publicId) => setForm(f => ({ ...f, image: url, imagePublicId: publicId }))}
            onRemove={() => setForm(f => ({ ...f, image: "", imagePublicId: "" }))}
            uploading={uploading}
            folder="jadedval_foundation/projects"
            hint="Recommended: 1200×630px or wider"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>{editTarget ? "Save Changes" : "Create Project"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Project" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}
