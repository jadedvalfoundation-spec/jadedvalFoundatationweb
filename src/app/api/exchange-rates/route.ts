import { NextResponse } from "next/server";

// Cached server-side fetch — revalidates every hour
async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Rate fetch failed");
    const json = await res.json();
    return json.rates ?? {};
  } catch {
    // Fallback static rates if API is unreachable
    return {
      USD: 1, EUR: 0.93, GBP: 0.79, NGN: 1610, GHS: 15.6, KES: 129,
      ZAR: 18.5, CAD: 1.36, AUD: 1.54, JPY: 149, CNY: 7.24, INR: 83.1,
      BRL: 4.97, MXN: 17.2, AED: 3.67, SAR: 3.75, EGP: 30.9, MAD: 10.1,
      XOF: 610, XAF: 610, TZS: 2530, UGX: 3760, ZMW: 26.8, ETB: 56.5,
    };
  }
}

export async function GET() {
  const rates = await fetchRates();
  return NextResponse.json({ success: true, rates }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
  });
}
