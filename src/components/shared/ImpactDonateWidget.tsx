"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  lang: string;
  ctaCustom: string;
  ctaDonate: string;
}

const AMOUNTS = [25, 50, 100, 250];

export default function ImpactDonateWidget({ lang, ctaCustom, ctaDonate }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const donateHref = selected
    ? `/${lang}/donate?amount=${selected}`
    : `/${lang}/donate`;

  return (
    <>
      {/* Amount chips */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => setSelected(selected === amt ? null : amt)}
            className={`rounded-full border px-7 py-3 font-heading text-sm font-bold transition ${
              selected === amt
                ? "border-brand bg-brand text-white"
                : "border-brand/40 bg-brand/10 text-brand hover:bg-brand hover:text-white"
            }`}
          >
            ${amt}
          </button>
        ))}
        <button
          onClick={() => setSelected(null)}
          className={`rounded-full border px-7 py-3 text-sm font-bold transition ${
            selected === null
              ? "border-brand/40 bg-brand/10 text-brand"
              : "border-white/20 text-white hover:border-brand hover:text-brand"
          }`}
        >
          {ctaCustom}
        </button>
      </div>

      <Link
        href={donateHref}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-10 py-4 font-heading text-base font-bold text-white shadow-lg shadow-brand/30 transition hover:opacity-90"
      >
        {ctaDonate}
        <span>→</span>
      </Link>
    </>
  );
}
