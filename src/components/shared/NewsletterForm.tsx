"use client";

import { useState } from "react";

interface NewsletterFormProps {
  compact?: boolean;
}

export default function NewsletterForm({ compact = false }: NewsletterFormProps) {
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
      <div className={`rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand ${compact ? "mt-4" : "mt-8"}`}>
        {message}
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex overflow-hidden rounded-lg border border-white/10 bg-[#0f1e2a]">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={status === "loading" ? "Joining…" : "your@email.com"}
            disabled={status === "loading"}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center px-4 text-brand transition hover:text-white disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        {status === "error" && (
          <p className="mt-1.5 text-xs text-red-400">{message}</p>
        )}
      </form>
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
