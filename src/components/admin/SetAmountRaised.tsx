"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface Props {
  projectId: string;
  targetAmount: number;
  currentManual: number | null;
  donationTotal: number;
}

export default function SetAmountRaised({
  projectId,
  targetAmount,
  currentManual,
  donationTotal,
}: Props) {
  const [value, setValue] = useState(
    currentManual !== null ? String(currentManual) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const numValue = parseFloat(value);
  const effectiveAmount = currentManual !== null ? currentManual : donationTotal;
  const pct =
    targetAmount > 0 ? Math.min(100, (effectiveAmount / targetAmount) * 100) : 0;

  // Live preview from input
  const previewAmt = !isNaN(numValue) && numValue >= 0 ? numValue : effectiveAmount;
  const previewPct =
    targetAmount > 0 ? Math.min(100, (previewAmt / targetAmount) * 100) : 0;

  async function handleSave() {
    setError("");
    if (value !== "" && (isNaN(numValue) || numValue < 0)) {
      setError("Please enter a valid amount (0 or greater).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/fundraising`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualAmountRaised: value === "" ? null : numValue,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed to save."); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setValue("");
    setSaving(true);
    setError("");
    try {
      await fetch(`/api/admin/projects/${projectId}/fundraising`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualAmountRaised: null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-800">Amount Raised</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Set a manual value to override the donation total on the public page.
            Leave empty to use the verified donation total automatically.
          </p>
        </div>
        {currentManual !== null && (
          <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            Manual override active
          </span>
        )}
      </div>

      {/* Current values */}
      <div className="mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Target</p>
          <p className="mt-1 font-bold text-gray-800">${targetAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Donation Total</p>
          <p className="mt-1 font-bold text-gray-600">${donationTotal.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 ${currentManual !== null ? "bg-brand/10" : "bg-gray-50"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {currentManual !== null ? "Manual (active)" : "Showing"}
          </p>
          <p className={`mt-1 font-bold ${currentManual !== null ? "text-brand" : "text-gray-600"}`}>
            ${effectiveAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Live progress preview */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs text-gray-500">
          <span>Public progress bar preview</span>
          <span className="font-semibold text-brand">{previewPct.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${previewPct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>${previewAmt.toLocaleString()} raised</span>
          <span>${targetAmount.toLocaleString()} goal</span>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            $
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => { setValue(e.target.value); setSaved(false); }}
            placeholder={`Auto (${donationTotal.toLocaleString()})`}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-7 pr-3 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <Button size="sm" loading={saving} onClick={handleSave}>
          {saved ? "✓ Saved!" : "Set Amount"}
        </Button>
        {currentManual !== null && (
          <Button size="sm" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
      {saved && (
        <p className="mt-2 text-xs text-green-600">
          ✓ Saved — the public project page will now reflect this amount.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Changes take effect immediately on the public page. The percentage is
        auto-calculated as <strong>(amount raised ÷ target) × 100</strong>.
      </p>
    </div>
  );
}
