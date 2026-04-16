"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setMessage(json.message ?? "Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.message ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-brand/30 bg-brand/10 px-6 py-4 text-brand">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-1 rounded-full border border-white/10 bg-[#0f1e2a] px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-brand px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "loading" ? "Joining…" : "Join the Mission"}
      </button>
      {status === "error" && (
        <p className="w-full text-center text-xs text-red-400">{message}</p>
      )}
    </form>
  );
}
