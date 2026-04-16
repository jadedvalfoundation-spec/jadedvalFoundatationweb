"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

type FormType = "volunteer" | "individual" | "corporate";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-[#0a1520] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400";

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function SuccessState({ message, onReset }: { message: string; onReset: () => void }) {
  const { dict } = useLocale();
  const d = dict.getInvolved;
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-3xl">✓</div>
      <h3 className="font-heading text-xl font-bold text-white">{d.successTitle}</h3>
      <p className="mt-2 text-gray-400">{message || d.successMessage}</p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand"
      >
        {dict.contact.sendAnother}
      </button>
    </div>
  );
}

function VolunteerForm() {
  const { dict } = useLocale();
  const d = dict.getInvolved;
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", expertise: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "volunteer",
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Volunteer – ${form.role || "General"}`,
          message: `Expertise: ${form.expertise}\n\n${form.message}`,
        }),
      });
      const json = await res.json();
      if (json.success) { setStatus("success"); setMsg(json.message); }
      else { setStatus("error"); setMsg(json.message ?? "Something went wrong."); }
    } catch {
      setStatus("error");
      setMsg("Failed to submit. Please try again.");
    }
  }

  if (status === "success") return <SuccessState message={msg} onReset={() => setStatus("idle")} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.name}>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" className={inputCls} />
        </Field>
        <Field label={d.email}>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.phone}>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
        </Field>
        <Field label={d.role}>
          <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} />
        </Field>
      </div>
      <Field label={d.expertise}>
        <select value={form.expertise} onChange={(e) => set("expertise", e.target.value)} className={inputCls}>
          <option value="" className="bg-[#0a1520]">Select your expertise…</option>
          {["Technology / Engineering", "Healthcare / Medicine", "Education", "Finance / Accounting",
            "Marketing / Communications", "Legal", "Project Management", "Community Development", "Other"].map((o) => (
            <option key={o} value={o} className="bg-[#0a1520]">{o}</option>
          ))}
        </select>
      </Field>
      <Field label={d.yourStory}>
        <textarea required rows={4} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Describe your skills and how you'd like to get involved…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? d.submitting : d.submitApplication}
      </button>
    </form>
  );
}

function IndividualPartnershipForm() {
  const { dict } = useLocale();
  const d = dict.getInvolved;
  const [form, setForm] = useState({ name: "", email: "", phone: "", projectIdea: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partnership",
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Individual Partnership – ${form.projectIdea || "Project Proposal"}`,
          message: form.message,
        }),
      });
      const json = await res.json();
      if (json.success) { setStatus("success"); setMsg(json.message); }
      else { setStatus("error"); setMsg(json.message ?? "Something went wrong."); }
    } catch {
      setStatus("error");
      setMsg("Failed to submit. Please try again.");
    }
  }

  if (status === "success") return <SuccessState message={msg} onReset={() => setStatus("idle")} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.name}>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" className={inputCls} />
        </Field>
        <Field label={d.email}>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
        </Field>
      </div>
      <Field label={d.phone}>
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
      </Field>
      <Field label={d.projectTitle}>
        <input required value={form.projectIdea} onChange={(e) => set("projectIdea", e.target.value)}
          placeholder="e.g. Digital Literacy Hub in Rural Communities" className={inputCls} />
      </Field>
      <Field label={d.projectDesc}>
        <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Outline the project, expected outcomes, your role, and how Jade D'Val Foundation would be involved…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? d.submitting : d.submitPartnership}
      </button>
    </form>
  );
}

function CorporatePartnershipForm() {
  const { dict } = useLocale();
  const d = dict.getInvolved;
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", size: "", projectIdea: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partnership",
          name: form.name,
          email: form.email,
          phone: form.phone,
          organization: `${form.organization}${form.size ? ` (${form.size})` : ""}`,
          subject: `Corporate Partnership – ${form.organization}`,
          message: `Project Idea: ${form.projectIdea}\n\n${form.message}`,
        }),
      });
      const json = await res.json();
      if (json.success) { setStatus("success"); setMsg(json.message); }
      else { setStatus("error"); setMsg(json.message ?? "Something went wrong."); }
    } catch {
      setStatus("error");
      setMsg("Failed to submit. Please try again.");
    }
  }

  if (status === "success") return <SuccessState message={msg} onReset={() => setStatus("idle")} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.contactPerson}>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className={inputCls} />
        </Field>
        <Field label={d.workEmail}>
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.orgName}>
          <input required value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Your organisation" className={inputCls} />
        </Field>
        <Field label={d.orgSize}>
          <select value={form.size} onChange={(e) => set("size", e.target.value)} className={inputCls}>
            <option value="" className="bg-[#0a1520]">Select size…</option>
            {["1–10 employees", "11–50 employees", "51–200 employees", "201–1000 employees", "1000+ employees"].map((o) => (
              <option key={o} value={o} className="bg-[#0a1520]">{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label={d.phone}>
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
      </Field>
      <Field label={d.proposedProject}>
        <input required value={form.projectIdea} onChange={(e) => set("projectIdea", e.target.value)}
          placeholder="e.g. Co-Branded Innovation Lab for Youth Upskilling" className={inputCls} />
      </Field>
      <Field label={d.partnershipDesc}>
        <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Outline the initiative, your organisation's contribution, expected outcomes, and timeline…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? d.submitting : d.submitCorporate}
      </button>
    </form>
  );
}

export default function GetInvolvedForms() {
  const { dict } = useLocale();
  const d = dict.getInvolved;
  const [active, setActive] = useState<FormType>("volunteer");

  const TABS: { value: FormType; label: string; icon: string; desc: string }[] = [
    { value: "volunteer",  label: d.tabVolunteer,  icon: "🤝", desc: d.tabVolunteerDesc },
    { value: "individual", label: d.tabIndividual, icon: "👤", desc: d.tabIndividualDesc },
    { value: "corporate",  label: d.tabCorporate,  icon: "🏢", desc: d.tabCorporateDesc },
  ];

  const activeTab = TABS.find((t) => t.value === active);

  return (
    <div>
      {/* Tab selector */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={`group rounded-2xl p-5 text-left transition-all ${
              active === tab.value
                ? "border border-brand/40 bg-brand/10"
                : "border border-white/08 bg-[#0f1e2a] hover:border-brand/20"
            }`}
            style={{ borderColor: active === tab.value ? "rgba(0,204,187,0.3)" : "rgba(255,255,255,0.08)" }}
          >
            <div className="mb-2 text-2xl">{tab.icon}</div>
            <p className={`font-heading text-sm font-bold ${active === tab.value ? "text-brand" : "text-white"}`}>
              {tab.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* Form panel */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="mb-6 border-b pb-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="font-heading text-xl font-bold text-white">
            {activeTab?.label}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {activeTab?.desc}
          </p>
        </div>

        {active === "volunteer"  && <VolunteerForm />}
        {active === "individual" && <IndividualPartnershipForm />}
        {active === "corporate"  && <CorporatePartnershipForm />}
      </div>
    </div>
  );
}
