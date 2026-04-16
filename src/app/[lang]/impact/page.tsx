import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Impact from "@/models/Impact";
import SuccessStory from "@/models/SuccessStory";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import SuccessStoryCarousel from "@/components/shared/SuccessStoryCarousel";

export const metadata = { title: "Impact — Jade D'Val Foundation" };

async function getData() {
  try {
    await connectDB();
    const [info, impacts, stories] = await Promise.all([
      WebsiteInfo.findOne()
        .select("impactMade countriesReached allocatedCapitalUSD impactAnalytics heroImage")
        .lean() as Promise<{
          impactMade?: number;
          countriesReached?: number;
          allocatedCapitalUSD?: number;
          heroImage?: string;
          impactAnalytics?: Array<{
            sector: string; metric: string; value: string; goal: string; goalYear: string;
          }>;
        } | null>,
      Impact.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .select("_id title description sector media createdAt")
        .lean(),
      SuccessStory.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .select("_id personName occupation location image story")
        .lean(),
    ]);
    return { info: info ?? {}, impacts, stories };
  } catch {
    return { info: {}, impacts: [], stories: [] };
  }
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
  if (n >= 1_000) return Math.round(n / 1_000) + "k+";
  return n + "+";
}

function fmtUSD(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "k";
  return "$" + n;
}

const SECTOR_COLORS: Record<string, string> = {
  Education: "#00CCBB",
  Healthcare: "#FF6B6B",
  Sustainability: "#4CAF50",
  Community: "#FF9800",
  Youth: "#9C27B0",
  Digital: "#2196F3",
  Agriculture: "#8BC34A",
  Other: "#607D8B",
};

export default async function ImpactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { info, impacts, stories } = await getData();

  const livesImpacted = (info as { impactMade?: number }).impactMade ?? 0;
  const countriesReached = (info as { countriesReached?: number }).countriesReached ?? 0;
  const allocatedCapital = (info as { allocatedCapitalUSD?: number }).allocatedCapitalUSD ?? 0;
  const heroImage = (info as { heroImage?: string }).heroImage ?? "";
  const analytics = (info as { impactAnalytics?: Array<{ sector: string; metric: string; value: string; goal: string; goalYear: string }> }).impactAnalytics ?? [];

  const typedImpacts = impacts as Array<{
    _id: unknown; title: string; description: string; sector: string;
    media: Array<{ url: string; type: string }>; createdAt: unknown;
  }>;

  const typedStories = stories as Array<{
    _id: unknown; personName: string; occupation: string; location?: string;
    image: string; story: string;
  }>;

  const carouselStories = typedStories.map((s) => ({
    _id: String(s._id),
    personName: s.personName,
    occupation: s.occupation,
    location: s.location,
    image: s.image,
    story: s.story,
  }));

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[75vh] items-end overflow-hidden pb-20">
        {/* BG */}
        <div className="absolute inset-0">
          {heroImage ? (
            <Image src={heroImage} alt="Impact" fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[#071018]" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,16,24,0.6) 0%, rgba(7,16,24,0.85) 60%, #0c1620 100%)" }} />
        </div>

        {/* Watermark */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-heading font-black leading-none text-white/[0.03] select-none"
          style={{ fontSize: "clamp(5rem, 18vw, 16rem)" }}
          aria-hidden
        >
          IMPACT
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">Our Impact</span>
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Stories of{" "}
              <em className="not-italic text-brand">Change</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Every number represents a life transformed. Every story is proof that precision technology, wielded with radical empathy, creates lasting human change.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-[#071018] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { value: livesImpacted > 0 ? fmtNumber(livesImpacted) : "120k+", label: "Lives Impacted", sub: "and counting" },
              { value: countriesReached > 0 ? countriesReached + "+" : "40+", label: "Global Network", sub: "countries reached" },
              { value: allocatedCapital > 0 ? fmtUSD(allocatedCapital) : "$2.4M+", label: "Allocated Capital", sub: "deployed to programs" },
            ].map((stat) => (
              <div key={stat.label} className="relative overflow-hidden rounded-2xl p-8 text-center" style={{ background: "#0f1e2a", border: "1px solid rgba(0,204,187,0.15)" }}>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-brand/5" />
                <p className="font-heading text-5xl font-black text-brand">{stat.value}</p>
                <p className="mt-2 font-heading text-base font-bold text-white">{stat.label}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Milestones of Success ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">Impact Stories</span>
              <h2 className="mt-2 font-heading text-4xl font-bold text-white">
                Milestones of{" "}
                <em className="not-italic text-brand">Success</em>
              </h2>
            </div>
            <Link
              href={`/${lang}/programs`}
              className="shrink-0 rounded-full border border-brand/40 bg-brand/10 px-6 py-2.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
            >
              View All Projects →
            </Link>
          </div>

          {typedImpacts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {typedImpacts.map((impact) => {
                const coverImage = impact.media.find((m) => m.type === "image");
                const sectorColor = SECTOR_COLORS[impact.sector] ?? "#00CCBB";
                return (
                  <Link
                    key={String(impact._id)}
                    href={`/${lang}/impact/${String(impact._id)}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
                    style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden bg-[#071018]">
                      {coverImage ? (
                        <Image
                          src={coverImage.url}
                          alt={impact.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-5xl">🌟</span>
                        </div>
                      )}
                      {/* Sector badge */}
                      <span
                        className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
                        style={{ background: sectorColor + "cc" }}
                      >
                        {impact.sector}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-brand transition-colors line-clamp-2">
                        {impact.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400 line-clamp-3">
                        {impact.description}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {new Date(impact.createdAt as string).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                        <span className="text-xs font-semibold text-brand group-hover:underline">
                          Read more →
                        </span>
                      </div>
                    </div>

                    {/* Hover accent line */}
                    <div
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full"
                    />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-500">No impact stories published yet.</p>
              <p className="mt-2 text-sm text-gray-600">Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Success Story Carousel ─────────────────────────────────────────── */}
      {carouselStories.length > 0 && (
        <section className="py-24" style={{ background: "#071018" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_1.6fr]">
              {/* Left label */}
              <div className="lg:pt-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand">Success Stories</span>
                </div>
                <h2 className="font-heading text-4xl font-bold leading-tight text-white">
                  This isn&apos;t just aid,{" "}
                  <em className="not-italic text-brand">it&apos;s alchemy.</em>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-400">
                  Real voices. Real change. The people behind the numbers — sharing how the Jade D&apos;Val Foundation transformed their lives.
                </p>
                {/* decorative bar */}
                <div className="mt-8 h-1 w-16 rounded-full bg-brand/40" />
              </div>

              {/* Right carousel */}
              <div className="relative">
                <SuccessStoryCarousel stories={carouselStories} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Precision Impact Analytics ─────────────────────────────────────── */}
      {analytics.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-brand">Data-Driven Results</span>
              <h2 className="mt-2 font-heading text-4xl font-bold text-white">
                Precision Impact{" "}
                <em className="not-italic text-brand">Analytics</em>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-400">
                We measure everything so you can trust that every dollar, every effort, is making a measurable difference.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.map((item, i) => {
                const numValue = parseFloat(item.value) || 0;
                const numGoal = parseFloat(item.goal) || 100;
                const pct = Math.min(100, Math.round((numValue / numGoal) * 100));
                const color = SECTOR_COLORS[item.sector] ?? "#00CCBB";
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-6"
                    style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                          {item.sector}
                        </p>
                        <p className="mt-1 font-heading text-base font-bold text-white">{item.metric}</p>
                      </div>
                      <span className="font-heading text-2xl font-black text-white">{pct}%</span>
                    </div>

                    {/* Bar */}
                    <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{item.value} achieved</span>
                      <span>
                        Goal: {item.goal}
                        {item.goalYear ? ` by ${item.goalYear}` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Fuel the Jade Impact (CTA) ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28" style={{ background: "#071018" }}>
        {/* Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(0,204,187,0.08) 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Take Action</span>
          <h2 className="mt-4 font-heading text-5xl font-bold leading-tight text-white">
            Fuel the Jade{" "}
            <em className="not-italic text-brand">Impact</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-400">
            Your contribution powers communities, transforms lives, and writes the next chapter of change. Every amount makes a difference.
          </p>

          {/* Amount chips */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {[25, 50, 100, 250].map((amt) => (
              <Link
                key={amt}
                href={`/${lang}/donate?amount=${amt}`}
                className="rounded-full border border-brand/40 bg-brand/10 px-7 py-3 font-heading text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                ${amt}
              </Link>
            ))}
            <Link
              href={`/${lang}/donate`}
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand"
            >
              Custom Amount
            </Link>
          </div>

          <Link
            href={`/${lang}/donate`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-10 py-4 font-heading text-base font-bold text-white shadow-lg shadow-brand/30 transition hover:opacity-90"
          >
            Donate Now
            <span>→</span>
          </Link>

          <p className="mt-5 text-xs text-gray-600">
            100% of your donation goes directly to our programs. Secure payment. Tax receipt provided.
          </p>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
