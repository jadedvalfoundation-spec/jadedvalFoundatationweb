"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/PageHeader";
import Button from "@/components/ui/Button";

interface Project {
  _id: string;
  name: string;
  targetAmount: number;
  manualAmountRaised: number | null;
  status: string;
  program: { name: string } | null;
}

export default function FundraisingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/projects?limit=200")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setProjects(Array.isArray(j.data) ? j.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const selected = projects.find((p) => p._id === selectedId) ?? null;

  const numAmount = parseFloat(amount);
  const pct =
    selected && !isNaN(numAmount) && numAmount >= 0 && selected.targetAmount > 0
      ? Math.min(100, (numAmount / selected.targetAmount) * 100)
      : selected && selected.manualAmountRaised != null && selected.targetAmount > 0
      ? Math.min(100, (selected.manualAmountRaised / selected.targetAmount) * 100)
      : 0;

  const displayPct = !isNaN(numAmount) && amount !== "" ? pct : (
    selected
      ? Math.min(
          100,
          ((selected.manualAmountRaised ?? 0) / (selected.targetAmount || 1)) * 100
        )
      : 0
  );

  async function handleSave() {
    if (!selectedId) { setError("Please select a project."); return; }
    if (amount === "" || isNaN(numAmount) || numAmount < 0) {
      setError("Please enter a valid amount (0 or more).");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${selectedId}/fundraising`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualAmountRaised: numAmount }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save."); return; }

      // Update local state so the UI reflects the new value immediately
      setProjects((prev) =>
        prev.map((p) =>
          p._id === selectedId ? { ...p, manualAmountRaised: numAmount } : p
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setSaving(false);
    }
  }

  function handleSelectProject(id: string) {
    setSelectedId(id);
    setAmount("");
    setSaved(false);
    setError("");
    const proj = projects.find((p) => p._id === id);
    if (proj?.manualAmountRaised != null) {
      setAmount(String(proj.manualAmountRaised));
    }
  }

  const STATUS_DOT: Record<string, string> = {
    ongoing: "bg-brand",
    upcoming: "bg-blue-400",
    completed: "bg-green-500",
  };

  return (
    <div>
      <PageHeader
        title="Update Amount Raised"
        description="Select a project and manually set how much has been raised — updates the public page instantly"
      />

      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">

          {/* Project dropdown */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Select Project
            </label>
            {loading ? (
              <div className="h-10 animate-pulse rounded-md bg-gray-100" />
            ) : (
              <select
                value={selectedId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="">— Choose a project —</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                    {p.program ? ` (${p.program.name})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Project info card — shown after selection */}
          {selected && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  {selected.program && (
                    <p className="text-xs text-gray-400">{selected.program.name}</p>
                  )}
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[selected.status] ?? "bg-gray-400"}`} />
                  {selected.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white p-3 border border-gray-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Target</p>
                  <p className="mt-1 font-bold text-gray-800">
                    ${selected.targetAmount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-gray-100 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Current amount raised
                  </p>
                  <p className="mt-1 font-bold text-brand">
                    ${(selected.manualAmountRaised ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress bar preview */}
              <div>
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Progress preview</span>
                  <span className="font-semibold text-brand">{displayPct.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-300"
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Amount Raised (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setSaved(false); }}
                placeholder="e.g. 5000"
                disabled={!selectedId}
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            {selected && !isNaN(numAmount) && amount !== "" && (
              <p className="mt-1.5 text-xs text-gray-500">
                This will show as{" "}
                <strong className="text-brand">{displayPct.toFixed(1)}%</strong> of the{" "}
                ${selected.targetAmount.toLocaleString()} goal on the public page.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>
          )}

          {saved && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <span className="text-lg">✓</span>
              <span>
                Saved! The public project page now shows{" "}
                <strong>${numAmount.toLocaleString()}</strong> raised (
                {displayPct.toFixed(1)}%).
              </span>
            </div>
          )}

          <Button
            className="w-full"
            loading={saving}
            disabled={!selectedId || amount === ""}
            onClick={handleSave}
          >
            Save & Update Project
          </Button>
        </div>
      </div>
    </div>
  );
}
