import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import GetInvolvedForms from "@/components/shared/GetInvolvedForms";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Get Involved",
  description:
    "Volunteer, partner, or collaborate with Jade D'Val Foundation. Join us in empowering communities through education, healthcare, and sustainable development.",
  openGraph: {
    title: "Get Involved | Jade D'Val Foundation",
    description: "Volunteer, partner, or collaborate to empower communities.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

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

  const [stats, dict] = await Promise.all([
    getStats(),
    getDictionary(lang as Locale),
  ]);
  const d = dict.getInvolved;
  const dc = dict.common;

  const impactMade = stats.impactMade ?? 0;
  const countriesReached = stats.countriesReached ?? 0;
  const communitiesImpacted = stats.communitiesImpacted ?? 0;

  const heroStats = [
    { value: impactMade > 0 ? fmt(impactMade) : "120k", label: dc.livesImpacted },
    { value: countriesReached > 0 ? countriesReached.toString() : "45", label: dc.countriesReached },
    { value: communitiesImpacted > 0 ? fmt(communitiesImpacted) : "10k+", label: dc.communitiesServed },
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
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">{d.heroBadge}</span>
            </div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {d.heroTitle}{" "}
              <em className="not-italic text-brand">{d.heroHighlight}</em>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              {d.heroSubtitle}
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
                {dc.donateNow}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partnership Ecosystems ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.ecosystemBadge}</span>
            <h2 className="mt-2 font-heading text-4xl font-bold text-white">
              {d.ecosystemTitle}{" "}
              <em className="not-italic text-brand">{d.ecosystemHighlight}</em>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">{d.ecosystemSubtitle}</p>
            <div className="mx-auto mt-3 h-0.5 w-12 bg-brand" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Individual */}
            <div className="flex flex-col rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.individualBadge}</span>
              <h3 className="mt-1 font-heading text-2xl font-bold text-white">{d.individualTitle}</h3>
              <p className="mt-2 text-sm text-gray-400">{d.individualDesc}</p>
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
                {d.tabIndividual}
              </a>
            </div>

            {/* Corporate */}
            <div className="flex flex-col rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.corporateBadge}</span>
              <h3 className="mt-1 font-heading text-2xl font-bold text-white">{d.corporateTitle}</h3>
              <p className="mt-2 text-sm text-gray-400">{d.corporateDesc}</p>
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
                {d.tabCorporate}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Forms ────────────────────────────────────────────────────────── */}
      <section id="get-involved-forms" className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">{dict.nav.getInvolved}</span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">
              {d.ecosystemTitle} · {d.heroHighlight}?
            </h2>
            <p className="mt-3 text-gray-400">
              {d.ecosystemSubtitle}
            </p>
          </div>

          <GetInvolvedForms />
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
