import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import GetInvolvedForms from "@/components/shared/GetInvolvedForms";

export const metadata = { title: "Get Involved — Jade D'Val Foundation" };

async function getStats() {
  try {
    await connectDB();
    const info = await WebsiteInfo.findOne()
      .select("impactMade countriesReached communitiesImpacted")
      .lean() as { impactMade?: number; countriesReached?: number; communitiesImpacted?: number } | null;
    return info ?? {};
  } catch {
    return {};
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + "M+";
  if (n >= 1_000) return Math.round(n / 1_000) + "k+";
  return n.toLocaleString();
}

const INDIVIDUAL_PERKS = [
  { icon: "📊", title: "Quarterly Impact Reports", desc: "Personalised insights into exactly where your resources are creating change." },
  { icon: "🏔", title: "Priority Access to Summits", desc: "Exclusive invitations to our annual Digital Alchemist global summits." },
  { icon: "🎯", title: "Advisory Roles", desc: "Lend your strategic expertise to our project steering committees." },
];

const CORPORATE_PERKS = [
  { icon: "🤝", title: "CSR Alignment", desc: "Strategic integration of our mission with your corporate social goals." },
  { icon: "⚗️", title: "Co-Branded Innovation Labs", desc: "Jointly fund and develop proprietary humanitarian technology." },
  { icon: "📈", title: "Employee Engagement", desc: "Technical volunteering opportunities for your engineering and creative teams." },
];

export default async function GetInvolvedPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const stats = await getStats();
  const impactMade = stats.impactMade ?? 0;
  const countriesReached = stats.countriesReached ?? 0;
  const communitiesImpacted = stats.communitiesImpacted ?? 0;

  const heroStats = [
    { value: impactMade > 0 ? fmt(impactMade) : "120k", label: "Lives Impacted" },
    { value: countriesReached > 0 ? countriesReached.toString() : "45", label: "Tech Hubs Active" },
    { value: communitiesImpacted > 0 ? fmt(communitiesImpacted) : "10k+", label: "Communities Served" },
  ];

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">Get Involved</span>
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your Contribution Is the{" "}
              <em className="not-italic text-brand">Catalyst</em>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              Direct financial support drives the research, development, and deployment of our high-tech humanitarian infrastructure.
            </p>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap gap-0 divide-x divide-white/10">
              {heroStats.map((s) => (
                <div key={s.label} className="pr-8 pl-0 first:pl-0 [&:not(:first-child)]:pl-8">
                  <p className="font-heading text-3xl font-bold text-white">{s.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand/70">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href={`/${lang}/donate`}
                className="inline-block rounded-lg border-2 border-brand bg-brand/10 px-8 py-3.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                Make a Donation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partnership Ecosystems ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-white">Partnership Ecosystems</h2>
            <div className="mx-auto mt-3 h-0.5 w-12 bg-brand" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Individual */}
            <div className="flex flex-col rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="font-heading text-2xl font-bold text-white">Individual Partnership</h3>
              <ul className="mt-6 flex-1 space-y-5">
                {INDIVIDUAL_PERKS.map((perk) => (
                  <li key={perk.title} className="flex gap-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-lg">
                      {perk.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{perk.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-400">{perk.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a href="#get-involved-forms"
                className="mt-8 block rounded-lg border border-brand bg-brand/10 py-3.5 text-center text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                Apply for Membership
              </a>
            </div>

            {/* Corporate */}
            <div className="flex flex-col rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="font-heading text-2xl font-bold text-white">Corporate Partnership</h3>
              <ul className="mt-6 flex-1 space-y-5">
                {CORPORATE_PERKS.map((perk) => (
                  <li key={perk.title} className="flex gap-4">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-lg">
                      {perk.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{perk.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-400">{perk.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a href="#get-involved-forms"
                className="mt-8 block rounded-lg border border-brand bg-brand/10 py-3.5 text-center text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                Request Prospectus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Forms ────────────────────────────────────────────────────────── */}
      <section id="get-involved-forms" className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Join Us</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">
              How Would You Like to Get Involved?
            </h2>
            <p className="mt-3 text-gray-400">
              Choose the path that fits you best. Every form of support transforms lives.
            </p>
          </div>

          <GetInvolvedForms />
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
