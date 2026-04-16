"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { formatDate } from "@/lib/utils";

interface BlogMedia { url: string; publicId: string; type: "image" | "video" }
interface BlogPost {
  _id: string; title: string; description: string; details: string;
  media: BlogMedia[]; isPublished: boolean; publishedAt?: string;
  createdBy: { name: string }; createdAt: string;
}

const BLANK = { title: "", description: "", details: "", isPublished: false, media: [] as BlogMedia[] };

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/blog");
    const json = await res.json();
    if (json.success) setPosts(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function removeMedia(idx: number) { setForm(f => ({ ...f, media: f.media.filter((_, i) => i !== idx) })); }

  function openCreate() { setEditTarget(null); setForm(BLANK); setError(""); setModalOpen(true); }
  function openEdit(p: BlogPost) {
    setEditTarget(p);
    setForm({ title: p.title, description: p.description, details: p.details, isPublished: p.isPublished, media: p.media });
    setError(""); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const url = editTarget ? `/api/admin/blog/${editTarget._id}` : "/api/admin/blog";
    const method = editTarget ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    setSaving(false);
    if (!json.success) { setError(json.error ?? "Failed"); return; }
    await fetchPosts(); setModalOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    const res = await fetch(`/api/admin/blog/${deleteTarget._id}`, { method: "DELETE" });
    const json = await res.json();
    setSaving(false);
    if (json.success) { await fetchPosts(); setDeleteTarget(null); }
  }

  return (
    <div>
      <PageHeader title="Blog" description="Create and manage blog posts" action={<Button size="sm" onClick={openCreate}>+ New Post</Button>} />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Post</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Media</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={p.isPublished ? "published" : "draft"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.media.slice(0, 3).map((m, i) => (
                        <div key={i} className="h-8 w-8 rounded overflow-hidden bg-gray-100">
                          {m.type === "image" ? (
                            <Image src={m.url} alt="" width={32} height={32} className="h-full w-full object-cover" />
                          ) : <span className="flex h-full items-center justify-center text-xs">🎬</span>}
                        </div>
                      ))}
                      {p.media.length > 3 && <span className="text-xs text-gray-400 self-center">+{p.media.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.createdBy?.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(new Date(p.createdAt))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-brand hover:underline">Edit</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No posts yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Post" : "New Blog Post"} size="xl">
        <div className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description (excerpt) *" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <RichTextEditor
            label="Full Blog Content *"
            value={form.details}
            onChange={html => setForm(f => ({ ...f, details: html }))}
            placeholder="Write your blog post here… use the toolbar for headings, bold, lists, etc."
            minHeight={280}
          />
          {/* Media */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Media (images / videos)</label>

            {/* Existing media previews */}
            {form.media.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.media.map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    <div className="relative flex items-center justify-center" style={{ minHeight: 100 }}>
                      {m.type === "image" ? (
                        <Image src={m.url} alt="" width={200} height={120} className="h-28 w-full object-cover" unoptimized />
                      ) : (
                        <video src={m.url} className="h-28 w-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-2 py-1.5">
                      <span className="text-xs text-gray-400">{m.type === "video" ? "🎬 Video" : "🖼 Image"}</span>
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new media */}
            <ImageUpload
              value=""
              onChange={(url, publicId) => {
                const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("/video/");
                setForm(f => ({
                  ...f,
                  media: [...f.media, { url, publicId, type: isVideo ? "video" : "image" }],
                }));
              }}
              accept="image/*,video/*"
              folder="jadedval_foundation/blog"
              hint="Images or videos — click to add more"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>{editTarget ? "Save Changes" : "Create Post"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={saving}
        title="Delete Post" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" />
    </div>
  );
}
