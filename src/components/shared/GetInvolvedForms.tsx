"use client";

import { useState } from "react";

type FormType = "volunteer" | "individual" | "corporate";

const TABS: { value: FormType; label: string; icon: string; desc: string }[] = [
  { value: "volunteer",  label: "Volunteer",              icon: "🤝", desc: "Offer your time and skills" },
  { value: "individual", label: "Individual Partnership", icon: "👤", desc: "Partner with us on a project" },
  { value: "corporate",  label: "Organisation Partnership", icon: "🏢", desc: "Corporate collaboration" },
];

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
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20 text-3xl">✓</div>
      <h3 className="font-heading text-xl font-bold text-white">Submission Received!</h3>
      <p className="mt-2 text-gray-400">{message}</p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand"
      >
        Submit another
      </button>
    </div>
  );
}

function VolunteerForm() {
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
        <Field label="Full Name">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" className={inputCls} />
        </Field>
        <Field label="Email Address">
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
        </Field>
        <Field label="Role / Title">
          <input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} />
        </Field>
      </div>
      <Field label="Area of Expertise">
        <select value={form.expertise} onChange={(e) => set("expertise", e.target.value)} className={inputCls}>
          <option value="" className="bg-[#0a1520]">Select your expertise…</option>
          {["Technology / Engineering", "Healthcare / Medicine", "Education", "Finance / Accounting",
            "Marketing / Communications", "Legal", "Project Management", "Community Development", "Other"].map((o) => (
            <option key={o} value={o} className="bg-[#0a1520]">{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Tell us how you'd like to contribute">
        <textarea required rows={4} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Describe your skills and how you'd like to get involved…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? "Submitting…" : "Apply to Volunteer"}
      </button>
    </form>
  );
}

function IndividualPartnershipForm() {
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
        <Field label="Full Name">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your full name" className={inputCls} />
        </Field>
        <Field label="Email Address">
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
        </Field>
      </div>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
      </Field>
      <Field label="Project Title / Idea">
        <input required value={form.projectIdea} onChange={(e) => set("projectIdea", e.target.value)}
          placeholder="e.g. Digital Literacy Hub in Rural Communities" className={inputCls} />
      </Field>
      <Field label="Describe your project and partnership goals">
        <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Outline the project, expected outcomes, your role, and how Jade D'Val Foundation would be involved…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? "Submitting…" : "Send Partnership Proposal"}
      </button>
    </form>
  );
}

function CorporatePartnershipForm() {
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
        <Field label="Contact Person">
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className={inputCls} />
        </Field>
        <Field label="Work Email">
          <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@company.com" className={inputCls} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Organisation Name">
          <input required value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="Your organisation" className={inputCls} />
        </Field>
        <Field label="Organisation Size">
          <select value={form.size} onChange={(e) => set("size", e.target.value)} className={inputCls}>
            <option value="" className="bg-[#0a1520]">Select size…</option>
            {["1–10 employees", "11–50 employees", "51–200 employees", "201–1000 employees", "1000+ employees"].map((o) => (
              <option key={o} value={o} className="bg-[#0a1520]">{o}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
      </Field>
      <Field label="Project / Initiative Title">
        <input required value={form.projectIdea} onChange={(e) => set("projectIdea", e.target.value)}
          placeholder="e.g. Co-Branded Innovation Lab for Youth Upskilling" className={inputCls} />
      </Field>
      <Field label="Describe the partnership scope and goals">
        <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)}
          placeholder="Outline the initiative, your organisation's contribution, expected outcomes, and timeline…"
          className={`${inputCls} resize-none`} />
      </Field>
      {status === "error" && <p className="text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? "Submitting…" : "Request Prospectus"}
      </button>
    </form>
  );
}

export default function GetInvolvedForms() {
  const [active, setActive] = useState<FormType>("volunteer");

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
            {TABS.find((t) => t.value === active)?.label}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {active === "volunteer" && "Join our team as a professional or expert volunteer. We'll match your skills to where they're needed most."}
            {active === "individual" && "Have a project idea? Tell us how we can collaborate to bring it to life."}
            {active === "corporate" && "Align your organisation's mission with ours. Let's build something impactful together."}
          </p>
        </div>

        {active === "volunteer"  && <VolunteerForm />}
        {active === "individual" && <IndividualPartnershipForm />}
        {active === "corporate"  && <CorporatePartnershipForm />}
      </div>
    </div>
  );
}
