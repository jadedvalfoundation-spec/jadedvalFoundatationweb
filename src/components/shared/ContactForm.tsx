"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function ContactForm() {
  const { dict } = useLocale();
  const d = dict.contact;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setMsg(json.message ?? d.successMessage);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setMsg(json.message ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMsg("Failed to send. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand/10 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-2xl">✓</div>
        <p className="font-semibold text-white">{d.successTitle}</p>
        <p className="mt-2 text-sm text-gray-400">{msg}</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm text-brand hover:underline">
          {d.sendAnother}
        </button>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-white/10 bg-[#0f1e2a] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 sm:p-8" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">{d.formBadge}</span>
      </div>
      <h2 className="mb-6 font-heading text-xl font-bold text-white">{d.formTitle}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gray-400">{d.name}</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={d.name} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gray-400">{d.email}</label>
          <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gray-400">{d.subject}</label>
        <input value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder={d.subject} className={inputCls} />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gray-400">{d.message}</label>
        <textarea required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={d.messagePlaceholder} className={`${inputCls} resize-none`} />
      </div>
      {status === "error" && <p className="mt-3 text-sm text-red-400">{msg}</p>}
      <button type="submit" disabled={status === "loading"} className="mt-5 w-full rounded-full bg-brand py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-60">
        {status === "loading" ? d.sending : d.send}
      </button>
    </form>
  );
}
