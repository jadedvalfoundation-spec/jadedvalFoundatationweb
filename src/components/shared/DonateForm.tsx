"use client";

import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

interface BankDetails {
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSortCode?: string;
  bankSwiftCode?: string;
  bankTransferNote?: string;
}

interface DonateFormProps {
  projectId?: string;
  projectName?: string;
  programId?: string;
  flwPublicKey?: string;
  bankDetails?: BankDetails;
  userCurrency?: string;
}

const PRESET_USD = [100, 200, 300, 500, 1000];
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", NGN: "₦", GHS: "₵", KES: "KSh", ZAR: "R",
  CAD: "CA$", AUD: "A$", JPY: "¥", CNY: "¥", INR: "₹", BRL: "R$", MXN: "$",
  AED: "AED", SAR: "SAR", EGP: "EGP", MAD: "MAD", TZS: "TZS", UGX: "UGX",
  ZMW: "ZMW", ETB: "ETB", XOF: "CFA", XAF: "CFA",
};

type PayMethod = "flutterwave" | "bank_transfer";
type Stage = "form" | "bank_pending" | "success" | "error";

function fmtAmt(n: number, sym: string) {
  if (n >= 1000) return `${sym}${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${sym}${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`;
}

export default function DonateForm({
  projectId, projectName, programId,
  flwPublicKey, bankDetails, userCurrency = "USD",
}: DonateFormProps) {
  // currency state: "local" | "USD"
  const [currencyMode, setCurrencyMode] = useState<"local" | "USD">(
    userCurrency === "USD" ? "USD" : "local"
  );
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  const activeCurrency = currencyMode === "USD" ? "USD" : userCurrency;
  const activeRate = rates[activeCurrency] ?? 1;
  const symbol = CURRENCY_SYMBOLS[activeCurrency] ?? activeCurrency + " ";

  // Form fields
  const [customAmt, setCustomAmt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>(flwPublicKey ? "flutterwave" : "bank_transfer");
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch exchange rates once
  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((j) => { if (j.success) setRates(j.rates); })
      .finally(() => setRatesLoaded(true));
  }, []);

  // Load Flutterwave script
  useEffect(() => {
    if (!flwPublicKey) return;
    if (document.getElementById("flw-script")) return;
    const s = document.createElement("script");
    s.id = "flw-script";
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.async = true;
    document.body.appendChild(s);
  }, [flwPublicKey]);

  // Compute the amount in USD from the form value
  const getRawAmt = useCallback(() => {
    const v = selectedPreset !== null
      ? (currencyMode === "USD" ? selectedPreset : selectedPreset * activeRate)
      : parseFloat(customAmt);
    return isNaN(v) || v <= 0 ? 0 : v;
  }, [selectedPreset, customAmt, currencyMode, activeRate]);

  const amountInActiveCurrency = getRawAmt();
  const amountUSD = activeCurrency === "USD"
    ? amountInActiveCurrency
    : amountInActiveCurrency / activeRate;

  // Preset chips converted to active currency
  const presetAmounts = PRESET_USD.map((usd) =>
    currencyMode === "USD" ? usd : Math.round(usd * activeRate)
  );

  async function initDonation() {
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
        paymentMethod: payMethod,
      }),
    });
    return res.json();
  }

  async function handleFlutterwave() {
    if (!window.FlutterwaveCheckout) {
      setErrorMsg("Payment system not ready. Please refresh and try again.");
      return;
    }
    setSubmitting(true);
    try {
      const init = await initDonation();
      if (!init.success) { setErrorMsg(init.message); setStage("error"); return; }

      const txRef: string = init.txRef;

      window.FlutterwaveCheckout({
        public_key: flwPublicKey,
        tx_ref: txRef,
        amount: amountInActiveCurrency,
        currency: activeCurrency,
        payment_options: "card,banktransfer,ussd,mobilemoney",
        customer: { email, name },
        customizations: {
          title: "Jade D'Val Foundation",
          description: projectName ? `Donation to: ${projectName}` : "General Donation",
          logo: "/logo.png",
        },
        callback: async (response: { status: string; transaction_id: number }) => {
          if (response.status === "successful") {
            const verifyRes = await fetch("/api/donate/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ txRef, transactionId: response.transaction_id }),
            });
            const v = await verifyRes.json();
            setStage(v.success ? "success" : "error");
            if (!v.success) setErrorMsg(v.message);
          } else {
            setStage("error");
            setErrorMsg("Payment was not completed.");
          }
        },
        onclose: () => setSubmitting(false),
      });
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBankTransfer() {
    setSubmitting(true);
    try {
      const init = await initDonation();
      if (!init.success) { setErrorMsg(init.message); setStage("error"); return; }
      setStage("bank_pending");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amountInActiveCurrency <= 0) {
      setErrorMsg("Please select or enter a valid amount.");
      return;
    }
    setErrorMsg("");
    if (payMethod === "flutterwave") await handleFlutterwave();
    else await handleBankTransfer();
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/20 text-4xl">✓</div>
        <h2 className="font-heading text-2xl font-bold text-white">Thank You!</h2>
        <p className="mt-2 text-gray-400">
          Your donation of <span className="font-semibold text-brand">{symbol}{amountInActiveCurrency.toLocaleString()}</span> has been received.
        </p>
        {projectName && <p className="mt-1 text-sm text-gray-500">Directed to: {projectName}</p>}
        <p className="mt-4 text-sm text-gray-500">A confirmation will be sent to {email}.</p>
      </div>
    );
  }

  // ── Bank Transfer Pending ─────────────────────────────────────────────────
  if (stage === "bank_pending" && bankDetails) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-brand/30 bg-brand/10 p-5">
          <h3 className="font-heading text-lg font-bold text-white">Complete Your Transfer</h3>
          <p className="mt-1 text-sm text-gray-400">
            Please transfer <span className="font-bold text-brand">{symbol}{amountInActiveCurrency.toLocaleString()}</span> to the account below and use your name as reference.
          </p>
        </div>
        <div className="space-y-3 rounded-2xl p-5" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[
            { label: "Bank", value: bankDetails.bankName },
            { label: "Account Name", value: bankDetails.bankAccountName },
            { label: "Account Number", value: bankDetails.bankAccountNumber },
            { label: "Sort / Routing", value: bankDetails.bankSortCode },
            { label: "SWIFT / BIC", value: bankDetails.bankSwiftCode },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} className="flex justify-between border-b border-white/8 pb-2 last:border-0 last:pb-0">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{row.label}</span>
              <span className="font-mono text-sm font-semibold text-white">{row.value}</span>
            </div>
          ))}
        </div>
        {bankDetails.bankTransferNote && (
          <p className="rounded-xl bg-white/5 p-4 text-sm text-gray-400">{bankDetails.bankTransferNote}</p>
        )}
        <p className="text-xs text-gray-500 text-center">
          Our team will confirm your donation within 2–3 business days.
        </p>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-white/10 bg-[#0a1520] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Currency toggle */}
      {userCurrency !== "USD" && ratesLoaded && (
        <div className="flex items-center justify-between rounded-xl p-1"
          style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="pl-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Currency</span>
          <div className="flex rounded-lg overflow-hidden">
            <button type="button" onClick={() => { setCurrencyMode("local"); setSelectedPreset(null); setCustomAmt(""); }}
              className={`px-4 py-2 text-sm font-semibold transition ${currencyMode === "local" ? "bg-brand text-white" : "text-gray-400 hover:text-white"}`}>
              {activeCurrency !== "USD" ? activeCurrency : userCurrency}
            </button>
            <button type="button" onClick={() => { setCurrencyMode("USD"); setSelectedPreset(null); setCustomAmt(""); }}
              className={`px-4 py-2 text-sm font-semibold transition ${currencyMode === "USD" ? "bg-brand text-white" : "text-gray-400 hover:text-white"}`}>
              USD
            </button>
          </div>
        </div>
      )}

      {/* Preset chips */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Select Amount</p>
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
          Or Enter Custom Amount ({activeCurrency})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand">{symbol}</span>
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
        {amountUSD > 0 && activeCurrency !== "USD" && (
          <p className="mt-1.5 text-right text-xs text-gray-500">
            ≈ ${amountUSD.toFixed(2)} USD
          </p>
        )}
      </div>

      {/* Donor info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputCls} />
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Payment Method</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {flwPublicKey && (
            <button type="button" onClick={() => setPayMethod("flutterwave")}
              className={`flex items-center gap-3 rounded-xl p-4 text-left transition ${
                payMethod === "flutterwave"
                  ? "border border-brand/50 bg-brand/10"
                  : "border border-white/10 bg-[#0f1e2a] hover:border-brand/20"
              }`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-lg">💳</div>
              <div>
                <p className="text-sm font-semibold text-white">Pay Online</p>
                <p className="text-xs text-gray-500">Card, bank, USSD, mobile</p>
              </div>
              {payMethod === "flutterwave" && (
                <span className="ml-auto h-4 w-4 rounded-full bg-brand" />
              )}
            </button>
          )}
          {bankDetails?.bankAccountNumber && (
            <button type="button" onClick={() => setPayMethod("bank_transfer")}
              className={`flex items-center gap-3 rounded-xl p-4 text-left transition ${
                payMethod === "bank_transfer"
                  ? "border border-brand/50 bg-brand/10"
                  : "border border-white/10 bg-[#0f1e2a] hover:border-brand/20"
              }`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-lg">🏦</div>
              <div>
                <p className="text-sm font-semibold text-white">Bank Transfer</p>
                <p className="text-xs text-gray-500">Direct deposit</p>
              </div>
              {payMethod === "bank_transfer" && (
                <span className="ml-auto h-4 w-4 rounded-full bg-brand" />
              )}
            </button>
          )}
        </div>
      </div>

      {errorMsg && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{errorMsg}</p>}

      {/* Amount summary */}
      {amountInActiveCurrency > 0 && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-center">
          <span className="text-2xl font-bold text-brand">{symbol}{amountInActiveCurrency.toLocaleString()}</span>
          {activeCurrency !== "USD" && <span className="ml-2 text-xs text-gray-500">(≈ ${amountUSD.toFixed(2)} USD)</span>}
          {projectName && <p className="mt-1 text-xs text-gray-400">→ {projectName}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || amountInActiveCurrency <= 0 || !name || !email}
        className="w-full rounded-full bg-brand py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {submitting ? "Processing…" : payMethod === "bank_transfer" ? "Get Bank Details" : `Donate ${symbol}${amountInActiveCurrency > 0 ? amountInActiveCurrency.toLocaleString() : ""}`}
      </button>

      <p className="text-center text-xs text-gray-600">
        Your contribution is secure and goes directly towards our programs.
      </p>
    </form>
  );
}
