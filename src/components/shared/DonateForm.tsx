"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface BankAccount {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}

interface DonateFormProps {
  projectId?: string;
  projectName?: string;
  programId?: string;
  flwPublicKey?: string;
  bankAccounts?: BankAccount[];
  userCurrency?: string;
}

const PRESET_USD = [100, 200, 300, 500, 1000];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh", ZAR: "R",
  CAD: "CA$", AUD: "A$", JPY: "¥", CNY: "¥", INR: "₹", BRL: "R$", MXN: "$",
  AED: "AED", SAR: "SAR", EGP: "EGP", MAD: "MAD", TZS: "TZS", UGX: "UGX",
  ZMW: "ZMW", ETB: "ETB", XOF: "CFA", XAF: "CFA",
};

// Fallback rates used immediately so presets are always converted — replaced by live data when API responds
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.93, GBP: 0.79, NGN: 1610, GHS: 15.6, KES: 129,
  ZAR: 18.5, CAD: 1.36, AUD: 1.54, JPY: 149, CNY: 7.24, INR: 83.1,
  BRL: 4.97, MXN: 17.2, AED: 3.67, SAR: 3.75, EGP: 30.9, MAD: 10.1,
  XOF: 610, XAF: 610, TZS: 2530, UGX: 3760, ZMW: 26.8, ETB: 56.5,
};

type Stage = "form" | "bank_details" | "flutterwave_soon" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtAmt(n: number, sym: string) {
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${sym}${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${sym}${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`;
}

export default function DonateForm({
  projectId,
  projectName,
  programId,
  bankAccounts = [],
  userCurrency = "USD",
}: DonateFormProps) {
  const { dict } = useLocale();
  const d = dict.donate;

  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Currency — default to local if non-USD
  const [currencyMode, setCurrencyMode] = useState<"local" | "USD">(
    userCurrency === "USD" ? "USD" : "local"
  );
  // Initialise with fallback so amounts are converted immediately without waiting for the fetch
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);

  const activeCurrency = currencyMode === "USD" ? "USD" : userCurrency;
  const activeRate = rates[activeCurrency] ?? 1;
  const symbol = CURRENCY_SYMBOLS[activeCurrency] ?? `${activeCurrency} `;

  // Form fields
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmt, setCustomAmt] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch live rates and replace fallback silently
  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((j) => { if (j.success && j.rates) setRates(j.rates); })
      .catch(() => {/* keep fallback */});
  }, []);

  const getRawAmt = useCallback(() => {
    const v =
      selectedPreset !== null
        ? currencyMode === "USD"
          ? selectedPreset
          : selectedPreset * activeRate
        : parseFloat(customAmt);
    return isNaN(v) || v <= 0 ? 0 : v;
  }, [selectedPreset, customAmt, currencyMode, activeRate]);

  const amountInActiveCurrency = getRawAmt();
  const amountUSD =
    activeCurrency === "USD"
      ? amountInActiveCurrency
      : amountInActiveCurrency / activeRate;

  const presetAmounts = PRESET_USD.map((usd) =>
    currencyMode === "USD" ? usd : Math.round(usd * activeRate)
  );

  // Validate form before proceeding to payment method step
  function validateAndGo(nextStage: "bank_details" | "flutterwave_soon") {
    if (amountInActiveCurrency <= 0) {
      setErrorMsg("Please select or enter a valid amount.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setStage(nextStage);
  }

  async function handleConfirmTransfer() {
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setStage("form");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/donate/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: name,
          donorEmail: email,
          amountUSD: amountUSD.toFixed(2),
          currency: activeCurrency,
          convertedAmount: amountInActiveCurrency.toFixed(2),
          projectId: projectId || null,
          programId: programId || null,
          paymentMethod: "bank_transfer",
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setErrorMsg(json.message ?? "Something went wrong.");
        setStage("error");
        return;
      }
      setStage("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-[#0a1520] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition";

  // ── Success ───────────────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/20 text-5xl">
          ✓
        </div>
        <h2 className="font-heading text-2xl font-bold text-white">{d.successTitle}</h2>
        <p className="mt-2 text-gray-400">{d.successMessage}</p>
        {projectName && (
          <p className="mt-1 text-sm text-gray-500">
            {d.donatingTo}: {projectName}
          </p>
        )}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (stage === "error") {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-4xl">
          ✗
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-400">{errorMsg}</p>
        <button
          onClick={() => { setStage("form"); setErrorMsg(""); }}
          className="mt-6 rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-gray-400 transition hover:border-brand/30 hover:text-brand"
        >
          ← Try Again
        </button>
      </div>
    );
  }

  // ── Bank account details + confirm ────────────────────────────────────────
  if (stage === "bank_details") {
    return (
      <div className="space-y-5">
        {/* Amount reminder */}
        <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-3">
            {d.bankTransferDetails}
          </p>

          {/* Primary amount */}
          <p className="text-3xl font-bold text-white">
            {symbol}{amountInActiveCurrency.toLocaleString()}
          </p>

          {/* Equivalent in the other currency */}
          {activeCurrency === "USD" && userCurrency !== "USD" && (
            <p className="mt-1 text-base font-semibold text-brand">
              = {CURRENCY_SYMBOLS[userCurrency] ?? userCurrency + " "}
              {Math.round(amountInActiveCurrency * (rates[userCurrency] ?? 1)).toLocaleString()}
            </p>
          )}
          {activeCurrency !== "USD" && (
            <p className="mt-1 text-base font-semibold text-brand">
              = ${amountUSD.toFixed(2)} USD
            </p>
          )}

          <p className="mt-3 text-sm text-gray-400">
            Transfer this amount to one of the accounts below.
            Use <span className="font-semibold text-white">{name}</span> as your transfer reference.
          </p>
        </div>

        {/* Accounts */}
        {bankAccounts.length > 0 ? (
          <div className="space-y-3">
            {bankAccounts.map((acc) => (
              <div
                key={acc._id}
                className="rounded-2xl p-5"
                style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">
                  {acc.bankName}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {d.accountName}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {acc.accountName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {d.accountNumber}
                    </span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {acc.accountNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white/5 p-4 text-sm text-center text-gray-400">
            No account details available. Please contact us.
          </p>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirmTransfer}
          disabled={submitting}
          className="w-full rounded-full bg-brand py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {submitting ? "Processing…" : "I Have Made the Transfer"}
        </button>

        <button
          type="button"
          onClick={() => setStage("form")}
          className="w-full rounded-full border border-white/10 py-3 text-sm font-semibold text-gray-400 transition hover:border-brand/30 hover:text-brand"
        >
          ← Back
        </button>

        <p className="text-center text-xs text-gray-600">{d.disclaimer}</p>
      </div>
    );
  }

  // ── Flutterwave coming soon ───────────────────────────────────────────────
  if (stage === "flutterwave_soon") {
    return (
      <div className="flex flex-col items-center py-12 text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-4xl">
          💳
        </div>
        <h2 className="font-heading text-xl font-bold text-white">Coming Soon</h2>
        <p className="text-sm text-gray-400">
          Online payment via Flutterwave will be available shortly.
          <br />
          Please use the bank transfer option for now.
        </p>
        <button
          type="button"
          onClick={() => setStage("form")}
          className="mt-2 rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-gray-400 transition hover:border-brand/30 hover:text-brand"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Main form (amount + donor info + choose method) ───────────────────────
  return (
    <div className="space-y-6">
      {/* Currency toggle */}
      {userCurrency !== "USD" && (
        <div
          className="flex items-center justify-between rounded-xl p-1"
          style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="pl-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Currency
          </span>
          <div className="flex overflow-hidden rounded-lg">
            <button
              type="button"
              onClick={() => { setCurrencyMode("local"); setSelectedPreset(null); setCustomAmt(""); }}
              className={`px-4 py-2 text-sm font-semibold transition ${
                currencyMode === "local" ? "bg-brand text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {userCurrency}
            </button>
            <button
              type="button"
              onClick={() => { setCurrencyMode("USD"); setSelectedPreset(null); setCustomAmt(""); }}
              className={`px-4 py-2 text-sm font-semibold transition ${
                currencyMode === "USD" ? "bg-brand text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              USD
            </button>
          </div>
        </div>
      )}

      {/* Preset chips */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          Select Amount
        </p>
        <div className="grid grid-cols-5 gap-2">
          {presetAmounts.map((amt, i) => (
            <button
              key={PRESET_USD[i]}
              type="button"
              onClick={() => { setSelectedPreset(PRESET_USD[i]); setCustomAmt(""); }}
              className={`rounded-xl py-3 text-center text-sm font-bold transition ${
                selectedPreset === PRESET_USD[i]
                  ? "bg-brand text-white shadow-lg shadow-brand/20"
                  : "border border-white/10 bg-[#0f1e2a] text-gray-300 hover:border-brand/40 hover:text-white"
              }`}
            >
              {fmtAmt(amt, symbol)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">
          Or enter custom amount ({activeCurrency})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand">
            {symbol}
          </span>
          <input
            type="number"
            min="1"
            step="any"
            value={customAmt}
            onChange={(e) => { setCustomAmt(e.target.value); setSelectedPreset(null); }}
            placeholder="Enter amount"
            className={`${inputCls} pl-9`}
          />
        </div>
        {amountInActiveCurrency > 0 && activeCurrency !== "USD" && (
          <p className="mt-1.5 text-right text-xs text-gray-500">
            ≈ ${amountUSD.toFixed(2)} USD
          </p>
        )}
      </div>

      {/* Donor info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">
            {dict.getInvolved.name}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">
            {dict.getInvolved.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={inputCls}
          />
        </div>
      </div>

      {/* Amount summary */}
      {amountInActiveCurrency > 0 && (
        <div
          className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-center"
        >
          <span className="text-2xl font-bold text-brand">
            {symbol}{amountInActiveCurrency.toLocaleString()}
          </span>
          {activeCurrency !== "USD" && (
            <span className="ml-2 text-xs text-gray-500">
              (≈ ${amountUSD.toFixed(2)} USD)
            </span>
          )}
          {projectName && (
            <p className="mt-1 text-xs text-gray-400">→ {projectName}</p>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</p>
      )}

      {/* Choose payment method */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          Choose payment method
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Bank Transfer */}
          <button
            type="button"
            onClick={() => validateAndGo("bank_details")}
            className="group flex items-center gap-3 rounded-xl p-4 text-left transition hover:-translate-y-0.5"
            style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xl transition group-hover:bg-brand/20">
              🏦
            </div>
            <div>
              <p className="text-sm font-bold text-white transition group-hover:text-brand">
                Direct Transfer
              </p>
              <p className="text-xs text-gray-500">Bank / mobile banking</p>
            </div>
            <span className="ml-auto text-brand opacity-0 transition group-hover:opacity-100">→</span>
          </button>

          {/* Flutterwave — Coming Soon */}
          <button
            type="button"
            onClick={() => validateAndGo("flutterwave_soon")}
            className="group relative flex items-center gap-3 rounded-xl p-4 text-left transition hover:-translate-y-0.5"
            style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="absolute right-3 top-3 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
              Soon
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">
              💳
            </div>
            <div>
              <p className="text-sm font-bold text-white">Pay with Flutterwave</p>
              <p className="text-xs text-gray-500">Card, USSD, mobile money</p>
            </div>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600">{d.disclaimer}</p>
    </div>
  );
}
