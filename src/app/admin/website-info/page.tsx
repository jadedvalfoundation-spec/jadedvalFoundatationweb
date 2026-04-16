"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ui/ImageUpload";

interface FAQ { question: string; answer: string }
interface Pillar { icon: string; title: string; description: string }
interface JourneyItem { date: string; title: string; description: string }

interface Info {
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  aboutUs: string;
  mission: string;
  vision: string;
  impactMade: number;
  countriesReached: number;
  communitiesImpacted: number;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  faqs: FAQ[];
  pillars: Pillar[];
  journey: JourneyItem[];
  heroImage: string;
  storyImage: string;
}

const BLANK: Info = {
  contactPhone: "",
  contactEmail: "",
  officeAddress: "",
  aboutUs: "",
  mission: "",
  vision: "",
  impactMade: 0,
  countriesReached: 0,
  communitiesImpacted: 0,
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  faqs: [],
  pillars: [],
  journey: [],
  heroImage: "",
  storyImage: "",
};

const SECTIONS = ["Contact", "About", "Stats", "Social Media", "FAQ", "Pillars", "Journey", "Media"] as const;
type Section = typeof SECTIONS[number];

export default function WebsiteInfoPage() {
  const [info, setInfo] = useState<Info>(BLANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("Contact");

  useEffect(() => {
    fetch("/api/admin/website-info")
      .then(r => r.json())
      .then(json => {
        if (json.success) setInfo({ ...BLANK, ...json.data });
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/website-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  // FAQ helpers
  function addFaq() {
    setInfo(i => ({ ...i, faqs: [...i.faqs, { question: "", answer: "" }] }));
  }
  function removeFaq(idx: number) {
    setInfo(i => ({ ...i, faqs: i.faqs.filter((_, j) => j !== idx) }));
  }
  function updateFaq(idx: number, field: "question" | "answer", val: string) {
    setInfo(i => ({ ...i, faqs: i.faqs.map((f, j) => j === idx ? { ...f, [field]: val } : f) }));
  }

  // Pillar helpers
  function addPillar() {
    setInfo(i => ({ ...i, pillars: [...i.pillars, { icon: "", title: "", description: "" }] }));
  }
  function removePillar(idx: number) {
    setInfo(i => ({ ...i, pillars: i.pillars.filter((_, j) => j !== idx) }));
  }
  function updatePillar(idx: number, field: keyof Pillar, val: string) {
    setInfo(i => ({ ...i, pillars: i.pillars.map((p, j) => j === idx ? { ...p, [field]: val } : p) }));
  }

  // Journey helpers
  function addJourneyItem() {
    setInfo(i => ({ ...i, journey: [...i.journey, { date: "", title: "", description: "" }] }));
  }
  function removeJourneyItem(idx: number) {
    setInfo(i => ({ ...i, journey: i.journey.filter((_, j) => j !== idx) }));
  }
  function updateJourneyItem(idx: number, field: keyof JourneyItem, val: string) {
    setInfo(i => ({ ...i, journey: i.journey.map((item, j) => j === idx ? { ...item, [field]: val } : item) }));
  }

  if (loading) return <div className="flex h-40 items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="Website Info"
        description="Manage site content, contact, FAQ, pillars, journey, and media"
        action={
          <Button size="sm" loading={saving} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </Button>
        }
      />

      <div className="flex gap-6">
        {/* Section nav */}
        <div className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeSection === s ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {activeSection === "Contact" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Contact Information</h2>
              <Input
                label="Phone Number"
                value={info.contactPhone}
                onChange={e => setInfo({ ...info, contactPhone: e.target.value })}
                placeholder="+1 (000) 000-0000"
              />
              <Input
                label="Email Address"
                type="email"
                value={info.contactEmail}
                onChange={e => setInfo({ ...info, contactEmail: e.target.value })}
                placeholder="info@jadedvalfoundation.org"
              />
              <Textarea
                label="Office Address"
                rows={3}
                value={info.officeAddress}
                onChange={e => setInfo({ ...info, officeAddress: e.target.value })}
                placeholder="123 Main Street, City, Country"
              />
            </div>
          )}

          {activeSection === "About" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">About the Foundation</h2>
              <Textarea
                label="About Us"
                rows={5}
                value={info.aboutUs}
                onChange={e => setInfo({ ...info, aboutUs: e.target.value })}
              />
              <Textarea
                label="Our Mission"
                rows={4}
                value={info.mission}
                onChange={e => setInfo({ ...info, mission: e.target.value })}
              />
              <Textarea
                label="Our Vision"
                rows={4}
                value={info.vision}
                onChange={e => setInfo({ ...info, vision: e.target.value })}
              />
            </div>
          )}

          {activeSection === "Stats" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Impact Statistics</h2>
              <Input
                label="Impact Made (number of lives)"
                type="number"
                value={info.impactMade}
                onChange={e => setInfo({ ...info, impactMade: Number(e.target.value) })}
              />
              <Input
                label="Countries Reached"
                type="number"
                value={info.countriesReached}
                onChange={e => setInfo({ ...info, countriesReached: Number(e.target.value) })}
              />
              <Input
                label="Communities Impacted"
                type="number"
                value={info.communitiesImpacted}
                onChange={e => setInfo({ ...info, communitiesImpacted: Number(e.target.value) })}
              />
            </div>
          )}

          {activeSection === "Social Media" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-800">Social Media Links</h2>
              <Input
                label="Facebook URL"
                value={info.facebook}
                onChange={e => setInfo({ ...info, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
              <Input
                label="Twitter / X URL"
                value={info.twitter}
                onChange={e => setInfo({ ...info, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
              />
              <Input
                label="Instagram URL"
                value={info.instagram}
                onChange={e => setInfo({ ...info, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
              <Input
                label="YouTube URL"
                value={info.youtube}
                onChange={e => setInfo({ ...info, youtube: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          )}

          {activeSection === "FAQ" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">Frequently Asked Questions</h2>
                <Button variant="outline" size="sm" onClick={addFaq}>+ Add FAQ</Button>
              </div>
              <div className="space-y-4">
                {info.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">FAQ #{i + 1}</span>
                      <button onClick={() => removeFaq(i)} className="text-xs text-red-400 hover:text-red-600">
                        Remove
                      </button>
                    </div>
                    <Input
                      label="Question"
                      value={faq.question}
                      onChange={e => updateFaq(i, "question", e.target.value)}
                      className="mb-3"
                    />
                    <Textarea
                      label="Answer"
                      rows={3}
                      value={faq.answer}
                      onChange={e => updateFaq(i, "answer", e.target.value)}
                    />
                  </div>
                ))}
                {info.faqs.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No FAQs yet. Click &quot;+ Add FAQ&quot; to create one.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === "Pillars" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">Pillars of Jade</h2>
                <Button variant="outline" size="sm" onClick={addPillar}>+ Add Pillar</Button>
              </div>
              <div className="space-y-4">
                {info.pillars.map((pillar, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">Pillar #{i + 1}</span>
                      <button onClick={() => removePillar(i)} className="text-xs text-red-400 hover:text-red-600">
                        Remove
                      </button>
                    </div>
                    <Input
                      label="Icon (emoji or icon name)"
                      value={pillar.icon}
                      onChange={e => updatePillar(i, "icon", e.target.value)}
                      className="mb-3"
                      placeholder="e.g. 💎 or shield"
                    />
                    <Input
                      label="Title"
                      value={pillar.title}
                      onChange={e => updatePillar(i, "title", e.target.value)}
                      className="mb-3"
                      placeholder="e.g. Integrity"
                    />
                    <Textarea
                      label="Description"
                      rows={3}
                      value={pillar.description}
                      onChange={e => updatePillar(i, "description", e.target.value)}
                      placeholder="Short description of this pillar..."
                    />
                  </div>
                ))}
                {info.pillars.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No pillars yet. Click &quot;+ Add Pillar&quot; to create one.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === "Journey" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800">Our Journey Timeline</h2>
                <Button variant="outline" size="sm" onClick={addJourneyItem}>+ Add Item</Button>
              </div>
              <div className="space-y-4">
                {info.journey.map((item, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">Journey Item #{i + 1}</span>
                      <button onClick={() => removeJourneyItem(i)} className="text-xs text-red-400 hover:text-red-600">
                        Remove
                      </button>
                    </div>
                    <Input
                      label="Date / Year"
                      value={item.date}
                      onChange={e => updateJourneyItem(i, "date", e.target.value)}
                      className="mb-3"
                      placeholder="e.g. 2020 or March 2021"
                    />
                    <Input
                      label="Title"
                      value={item.title}
                      onChange={e => updateJourneyItem(i, "title", e.target.value)}
                      className="mb-3"
                      placeholder="e.g. Foundation Established"
                    />
                    <Textarea
                      label="Description"
                      rows={3}
                      value={item.description}
                      onChange={e => updateJourneyItem(i, "description", e.target.value)}
                      placeholder="What happened at this milestone..."
                    />
                  </div>
                ))}
                {info.journey.length === 0 && (
                  <p className="py-6 text-center text-sm text-gray-400">
                    No journey items yet. Click &quot;+ Add Item&quot; to create one.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeSection === "Media" && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-gray-800">Site Media</h2>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Hero Image
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Displayed on the home page hero section (right column).
                </p>
                <ImageUpload
                  label="Hero Image"
                  value={info.heroImage}
                  folder="jadedval_foundation/hero"
                  hint="Recommended: 800×600px or larger"
                  onChange={(url) => setInfo(prev => ({ ...prev, heroImage: url }))}
                  onRemove={() => setInfo(prev => ({ ...prev, heroImage: "" }))}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Our Story Image
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Displayed on the About Us page next to the story text.
                </p>
                <ImageUpload
                  label="Story Image"
                  value={info.storyImage}
                  folder="jadedval_foundation/about"
                  hint="Recommended: 600×700px or larger"
                  onChange={(url) => setInfo(prev => ({ ...prev, storyImage: url }))}
                  onRemove={() => setInfo(prev => ({ ...prev, storyImage: "" }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
