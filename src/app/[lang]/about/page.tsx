import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { translate, translateMany } from "@/lib/translate";

export const dynamic = "force-dynamic";

async function getInfo() {
  try {
    await connectDB();
    return await WebsiteInfo.findOne(
      {},
      { aboutUs: 1, mission: 1, vision: 1, pillars: 1, journey: 1, storyImage: 1 }
    ).lean() as {
      aboutUs?: string; mission?: string; vision?: string;
      pillars?: { icon: string; title: string; description: string }[];
      journey?: { date: string; title: string; description: string }[];
      storyImage?: string;
    } | null;
  } catch {
    return null;
  }
}

export const metadata = {
  title: "About Us",
  description:
    "Learn about Jade D'Val Foundation — our mission, vision, and the values driving our work to empower communities across Africa through grassroots initiatives.",
  openGraph: {
    title: "About Us | Jade D'Val Foundation",
    description: "Our mission, vision, and commitment to empowering communities.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [info, dict] = await Promise.all([getInfo(), getDictionary(lang as Locale)]);
  const d = dict.about;
  const dc = dict.common;

  function stripEmpty(html: string | undefined) {
    if (!html) return "";
    const text = html.replace(/<[^>]+>/g, "").trim();
    return text ? html : "";
  }

  const aboutUs = stripEmpty(info?.aboutUs);
  const mission = stripEmpty(info?.mission);
  const vision  = stripEmpty(info?.vision);
  const pillars = info?.pillars ?? [];
  const journey = info?.journey ?? [];
  const storyImage = info?.storyImage ?? "";

  const pillarTitles = pillars.length > 0 ? await translateMany(pillars.map(p => p.title), lang as Locale) : [];
  const pillarDescs  = pillars.length > 0 ? await translateMany(pillars.map(p => p.description), lang as Locale) : [];
  const displayPillars = pillars.map((p, i) => ({ ...p, title: pillarTitles[i], description: pillarDescs[i] }));

  const journeyTitles = journey.length > 0 ? await translateMany(journey.map(j => j.title), lang as Locale) : [];
  const journeyDescs  = journey.length > 0 ? await translateMany(journey.map(j => j.description), lang as Locale) : [];
  const displayJourney = journey.map((j, i) => ({ ...j, title: journeyTitles[i], description: journeyDescs[i] }));

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Our Story ──────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.badge}</span>
              <h1 className="mt-3 font-heading text-4xl font-bold text-white sm:text-5xl">{d.title}</h1>
              {aboutUs ? (
                <div
                  className="rich-content mt-6 text-gray-400"
                  style={{ lineHeight: "1.8" }}
                  dangerouslySetInnerHTML={{ __html: aboutUs }}
                />
              ) : (
                <p className="mt-6 text-gray-600 italic">Our story is coming soon.</p>
              )}
            </div>

            {/* Right: image */}
            <div className="flex items-center justify-center">
              {storyImage ? (
                <div className="overflow-hidden rounded-2xl">
                  <Image src={storyImage} alt="Our Story" width={520} height={420}
                    className="h-80 w-full object-cover lg:h-[420px]" />
                </div>
              ) : (
                <div className="flex h-80 w-full items-center justify-center rounded-2xl lg:h-[420px]"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-4xl opacity-20">🌍</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ───────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Vision */}
            <div className="rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                👁
              </div>
              <h2 className="font-heading text-xl font-bold text-white">{d.visionTitle}</h2>
              {vision ? (
                <div className="rich-content mt-3 text-gray-400" dangerouslySetInnerHTML={{ __html: vision }} />
              ) : (
                <p className="mt-3 text-gray-600 italic">Vision coming soon.</p>
              )}
            </div>

            {/* Mission */}
            <div className="rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                🎯
              </div>
              <h2 className="font-heading text-xl font-bold text-white">{d.missionTitle}</h2>
              {mission ? (
                <div className="rich-content mt-3 text-gray-400" dangerouslySetInnerHTML={{ __html: mission }} />
              ) : (
                <p className="mt-3 text-gray-600 italic">Mission coming soon.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Pillars of Jade ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white">{d.pillarsTitle}</h2>
          {displayPillars.length > 0 ? (
            <div className={`grid gap-6 sm:grid-cols-2 ${displayPillars.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
              {displayPillars.map((pillar, i) => (
                <div key={i} className="rounded-2xl p-6"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {pillar.icon && (
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl">
                      {pillar.icon}
                    </div>
                  )}
                  <h3 className="font-heading text-base font-bold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{pillar.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 italic">Our pillars are being set up. Check back soon.</p>
          )}
        </div>
      </section>

      {/* ── Our Journey ───────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-14 font-heading text-3xl font-bold text-white">{d.journeyTitle}</h2>

          {displayJourney.length > 0 ? (
            <div className="relative">
              {/* Horizontal connector line (desktop) */}
              <div className="absolute left-0 right-0 top-3 hidden h-px lg:block"
                style={{ background: "rgba(255,255,255,0.08)" }} />

              <div className={`grid gap-8 ${displayJourney.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                {displayJourney.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="mb-6 flex items-center gap-3 lg:mb-0 lg:flex-col lg:items-start">
                      <div className="relative z-10 h-3 w-3 flex-shrink-0 rounded-full bg-brand lg:mb-6" />
                    </div>
                    <div className="rounded-2xl p-6"
                      style={{ background: "#0f1e2a", border: "1px solid rgba(0,204,187,0.2)" }}>
                      <span className="text-xs font-bold text-brand">{item.date}</span>
                      <h3 className="mt-2 font-heading text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 italic">Our journey timeline is being written. Check back soon.</p>
          )}
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white">{dict.impact.detailContinueTitle}</h2>
          <p className="mt-4 text-gray-400">{dict.impact.detailContinueSubtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/${lang}/donate`} className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark">
              {dc.donateNow}
            </Link>
            <Link href={`/${lang}/get-involved`} className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand">
              {dc.learnMore}
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
