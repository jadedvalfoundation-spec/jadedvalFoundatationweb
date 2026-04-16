"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/admin/Modal";
import ImageUpload from "@/components/ui/ImageUpload";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { IMPACT_SECTORS } from "@/lib/impact-constants";

type Tab = "impacts" | "stories";

/* ─── Impact ──────────────────────────────────────────────────────── */
interface ImpactMedia { url: string; publicId: string; type: "image" | "video" }
interface ImpactRecord {
  _id: string; title: string; description: string; details: string;
  sector: string; media: ImpactMedia[]; isPublished: boolean; createdAt: string;
}
const BLANK_IMPACT = (): ImpactRecord => ({
  _id: "", title: "", description: "", details: "",
  sector: "Education", media: [], isPublished: false, createdAt: "",
});

/* ─── Success Story ───────────────────────────────────────────────── */
interface StoryRecord {
  _id: string; personName: string; occupation: string; location: string;
  image: string; imagePublicId: string; story: string; isPublished: boolean;
}
const BLANK_STORY = (): StoryRecord => ({
  _id: "", personName: "", occupation: "", location: "",
  image: "", imagePublicId: "", story: "", isPublished: false,
});

/* ─── Component ────────────────────────────────────────────────────── */
export default function ImpactAdminPage() {
  const [tab, setTab] = useState<Tab>("impacts");

  /* Impacts state */
  const [impacts, setImpacts] = useState<ImpactRecord[]>([]);
  const [loadingImpacts, setLoadingImpacts] = useState(true);
  const [impactForm, setImpactForm] = useState<ImpactRecord>(BLANK_IMPACT());
  const [impactModal, setImpactModal] = useState(false);
  const [savingImpact, setSavingImpact] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  /* Stories state */
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [storyForm, setStoryForm] = useState<StoryRecord>(BLANK_STORY());
  const [storyModal, setStoryModal] = useState(false);
  const [savingStory, setSavingStory] = useState(false);

  /* Fetch */
  const fetchImpacts = useCallback(async () => {
    setLoadingImpacts(true);
    const res = await fetch("/api/admin/impact");
    const json = await res.json();
    if (json.success) setImpacts(json.data);
    setLoadingImpacts(false);
  }, []);

  const fetchStories = useCallback(async () => {
    setLoadingStories(true);
    const res = await fetch("/api/admin/success-stories");
    const json = await res.json();
    if (json.success) setStories(json.data);
    setLoadingStories(false);
  }, []);

  useEffect(() => { fetchImpacts(); fetchStories(); }, [fetchImpacts, fetchStories]);

  /* ── Impact handlers ─────────────────────────────────────────────── */
  function openImpact(record?: ImpactRecord) {
    setImpactForm(record ? { ...record } : BLANK_IMPACT());
    setImpactModal(true);
  }

  async function saveImpact() {
    if (!impactForm.title || !impactForm.description || !impactForm.details) return;
    setSavingImpact(true);
    const isNew = !impactForm._id;
    const url = isNew ? "/api/admin/impact" : `/api/admin/impact/${impactForm._id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(impactForm),
    });
    const json = await res.json();
    if (json.success) { setImpactModal(false); fetchImpacts(); }
    setSavingImpact(false);
  }

  async function deleteImpact(id: string) {
    if (!confirm("Delete this impact story?")) return;
    await fetch(`/api/admin/impact/${id}`, { method: "DELETE" });
    fetchImpacts();
  }

  async function toggleImpactPublish(record: ImpactRecord) {
    await fetch(`/api/admin/impact/${record._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !record.isPublished }),
    });
    fetchImpacts();
  }

  function addMedia(url: string, publicId: string, type: "image" | "video") {
    setImpactForm(prev => ({ ...prev, media: [...prev.media, { url, publicId, type }] }));
  }
  function removeMedia(i: number) {
    setImpactForm(prev => ({ ...prev, media: prev.media.filter((_, idx) => idx !== i) }));
  }

  /* ── Story handlers ──────────────────────────────────────────────── */
  function openStory(record?: StoryRecord) {
    setStoryForm(record ? { ...record } : BLANK_STORY());
    setStoryModal(true);
  }

  async function saveStory() {
    if (!storyForm.personName || !storyForm.story) return;
    setSavingStory(true);
    const isNew = !storyForm._id;
    const url = isNew ? "/api/admin/success-stories" : `/api/admin/success-stories/${storyForm._id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storyForm),
    });
    const json = await res.json();
    if (json.success) { setStoryModal(false); fetchStories(); }
    setSavingStory(false);
  }

  async function deleteStory(id: string) {
    if (!confirm("Delete this success story?")) return;
    await fetch(`/api/admin/success-stories/${id}`, { method: "DELETE" });
    fetchStories();
  }

  async function toggleStoryPublish(record: StoryRecord) {
    await fetch(`/api/admin/success-stories/${record._id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !record.isPublished }),
    });
    fetchStories();
  }

  const SECTOR_COLORS: Record<string, string> = {
    Education: "bg-blue-100 text-blue-700", Healthcare: "bg-red-100 text-red-700",
    Sustainability: "bg-green-100 text-green-700", Community: "bg-purple-100 text-purple-700",
    Youth: "bg-yellow-100 text-yellow-700", Digital: "bg-teal-100 text-teal-700",
    Agriculture: "bg-orange-100 text-orange-700", Other: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <PageHeader title="Impact & Success Stories" description="Manage impact stories and beneficiary testimonials" />

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(["impacts", "stories"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors capitalize ${tab === t ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "impacts" ? "🌍 Impact Stories" : "💬 Success Stories"}
          </button>
        ))}
      </div>

      {/* ── Impacts Tab ─────────────────────────────────────────────── */}
      {tab === "impacts" && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => openImpact()}>+ New Impact</Button>
          </div>
          {loadingImpacts ? (
            <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {impacts.map(imp => (
                <div key={imp._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  {/* Cover image */}
                  <div className="relative h-36 bg-gray-100">
                    {imp.media[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imp.media[0].url} alt={imp.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl opacity-30">🌍</div>
                    )}
                    <div className="absolute right-2 top-2 flex gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SECTOR_COLORS[imp.sector] ?? "bg-gray-100 text-gray-600"}`}>
                        {imp.sector}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{imp.title}</h3>
                      <span className={`ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${imp.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {imp.isPublished ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{imp.description}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => openImpact(imp)} className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
                      <button onClick={() => toggleImpactPublish(imp)}
                        className={`flex-1 rounded-md py-1.5 text-xs font-medium ${imp.isPublished ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                        {imp.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deleteImpact(imp._id)} className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100">✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {impacts.length === 0 && (
                <div className="col-span-3 py-16 text-center text-gray-400">No impact stories yet. Click "+ New Impact" to add one.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Stories Tab ─────────────────────────────────────────────── */}
      {tab === "stories" && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => openStory()}>+ New Story</Button>
          </div>
          {loadingStories ? (
            <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map(s => (
                <div key={s._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b p-4">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.personName} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">👤</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{s.personName}</p>
                      <p className="text-xs text-gray-500">{s.occupation}{s.location ? ` · ${s.location}` : ""}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {s.isPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-3 italic">&ldquo;{s.story}&rdquo;</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => openStory(s)} className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
                      <button onClick={() => toggleStoryPublish(s)}
                        className={`flex-1 rounded-md py-1.5 text-xs font-medium ${s.isPublished ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                        {s.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deleteStory(s._id)} className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100">✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {stories.length === 0 && (
                <div className="col-span-3 py-16 text-center text-gray-400">No success stories yet.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Impact Modal ─────────────────────────────────────────────── */}
      <Modal open={impactModal} onClose={() => setImpactModal(false)} title={impactForm._id ? "Edit Impact" : "New Impact"} size="xl">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Title *" value={impactForm.title}
              onChange={e => setImpactForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Unity Primary School Refurbishment" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Sector *</label>
              <select value={impactForm.sector}
                onChange={e => setImpactForm(p => ({ ...p, sector: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand focus:ring-1 focus:ring-brand">
                {IMPACT_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <Textarea label="Short Description * (shown in cards)" rows={2} value={impactForm.description}
            onChange={e => setImpactForm(p => ({ ...p, description: e.target.value }))}
            placeholder="One or two sentences summarising the impact…" />
          <RichTextEditor label="Full Impact Details *" value={impactForm.details}
            onChange={v => setImpactForm(p => ({ ...p, details: v }))}
            placeholder="Write the full story — what happened, who was helped, what changed…" minHeight={200} />

          {/* Media */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Media (Images / Videos)</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {impactForm.media.map((m, i) => (
                <div key={i} className="group relative overflow-hidden rounded-lg bg-gray-100">
                  {m.type === "image"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={m.url} alt="" className="h-28 w-full object-cover" />
                    : <video src={m.url} className="h-28 w-full object-cover" />}
                  <button onClick={() => removeMedia(i)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-xs text-white opacity-0 group-hover:opacity-100 transition">✕</button>
                </div>
              ))}
              <ImageUpload
                value="" label="Add Media"
                accept="image/*,video/*"
                folder="jadedval_foundation/impact"
                uploading={uploadingMedia}
                onChange={(url, publicId) => {
                  const type = url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image";
                  addMedia(url, publicId, type as "image" | "video");
                }}
                onRemove={() => {}}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={impactForm.isPublished}
              onChange={e => setImpactForm(p => ({ ...p, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
            Publish immediately
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setImpactModal(false)}>Cancel</Button>
          <Button onClick={saveImpact} disabled={savingImpact}>{savingImpact ? "Saving…" : "Save Impact"}</Button>
        </div>
      </Modal>

      {/* ── Story Modal ───────────────────────────────────────────────── */}
      <Modal open={storyModal} onClose={() => setStoryModal(false)} title={storyForm._id ? "Edit Story" : "New Success Story"} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Person Name *" value={storyForm.personName}
              onChange={e => setStoryForm(p => ({ ...p, personName: e.target.value }))}
              placeholder="e.g. Amara N." />
            <Input label="Occupation *" value={storyForm.occupation}
              onChange={e => setStoryForm(p => ({ ...p, occupation: e.target.value }))}
              placeholder="e.g. Textile Shop Owner, Lagos" />
          </div>
          <Input label="Location (optional)" value={storyForm.location}
            onChange={e => setStoryForm(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g. Lagos, Nigeria" />
          <ImageUpload
            label="Person Photo"
            value={storyForm.image}
            folder="jadedval_foundation/stories"
            accept="image/*"
            onChange={(url, publicId) => setStoryForm(p => ({ ...p, image: url, imagePublicId: publicId }))}
            onRemove={() => setStoryForm(p => ({ ...p, image: "", imagePublicId: "" }))}
          />
          <Textarea label="Their Story / Testimonial *" rows={5} value={storyForm.story}
            onChange={e => setStoryForm(p => ({ ...p, story: e.target.value }))}
            placeholder="Write their testimonial or success story in their words…" />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={storyForm.isPublished}
              onChange={e => setStoryForm(p => ({ ...p, isPublished: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
            Publish immediately
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setStoryModal(false)}>Cancel</Button>
          <Button onClick={saveStory} disabled={savingStory}>{savingStory ? "Saving…" : "Save Story"}</Button>
        </div>
      </Modal>
    </div>
  );
}
