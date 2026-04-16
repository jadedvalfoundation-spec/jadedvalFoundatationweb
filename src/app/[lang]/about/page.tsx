import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

async function getInfo() {
  try {
    await connectDB();
    return await WebsiteInfo.findOne().lean() as {
      aboutUs?: string; mission?: string; vision?: string;
      pillars?: { icon: string; title: string; description: string }[];
      journey?: { date: string; title: string; description: string }[];
      storyImage?: string;
    } | null;
  } catch {
    return null;
  }
}

export const metadata = { title: "About Us — Jade D'Val Foundation" };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const info = await getInfo();

  const aboutUs = info?.aboutUs ?? "";
  const mission = info?.mission ?? "";
  const vision = info?.vision ?? "";
  const pillars = info?.pillars ?? [];
  const journey = info?.journey ?? [];
  const storyImage = info?.storyImage ?? "";

  const defaultPillars = [
    { icon: "🛡", title: "Integrity", description: "Honoring our promises with radical transparency in every project we initiate." },
    { icon: "💚", title: "Empathy", description: "Understanding lived experiences before implementing technical solutions." },
    { icon: "📈", title: "Growth", description: "Committing to continuous evolution for both our foundation and our partners." },
    { icon: "♦", title: "Transparency", description: "Open-access reporting to ensure every contribution drives measurable impact." },
  ];

  const displayPillars = pillars.length > 0 ? pillars : defaultPillars;

  const defaultJourney = [
    { date: "Jan 2024", title: "The Genesis", description: "Foundation established with an initial focus on regional digital literacy hubs." },
    { date: "April 2024", title: "Alpha Pilot", description: "Successful deployment of our first AI-assisted learning initiative in three rural districts." },
    { date: "Present", title: "The Expansion", description: "Scaling operations globally, reaching over 50,000 lives through decentralized empowerment models." },
  ];

  const displayJourney = journey.length > 0 ? journey : defaultJourney;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Our Story ──────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* Left: text */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                The Digital Alchemy
              </span>
              <h1 className="mt-3 font-heading text-4xl font-bold text-white sm:text-5xl">
                Our Story
              </h1>
              {aboutUs ? (
                <div
                  className="rich-content mt-6 text-gray-400"
                  style={{ lineHeight: "1.8" }}
                  dangerouslySetInnerHTML={{ __html: aboutUs }}
                />
              ) : (
                <div className="mt-6 space-y-4 text-gray-400" style={{ lineHeight: "1.8" }}>
                  <p>
                    Born in the early days of 2024, the Jade D&apos;Val Foundation emerged from a singular, powerful realization: that the rapid evolution of technology must be tethered to an unwavering commitment to human welfare.
                  </p>
                  <p>
                    We began as a collective of technologists and social advocates who saw &ldquo;Digital Alchemy&rdquo; not as a buzzword, but as a practice — transforming cold data and systems into golden opportunities for community development.
                  </p>
                </div>
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
                <div className="flex h-80 w-full flex-col items-center justify-center rounded-2xl lg:h-[420px]"
                  style={{ background: "linear-gradient(135deg, #132535 0%, #1a3a50 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="rounded-2xl bg-[#0c1620]/60 p-8 text-center">
                    <p className="font-heading text-2xl font-bold text-brand">Jade the Hub</p>
                    <p className="mt-2 text-sm text-gray-400">Community DevlUPoment</p>
                  </div>
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
              <h2 className="font-heading text-xl font-bold text-white">Vision</h2>
              {vision ? (
                <div className="rich-content mt-3 text-gray-400" dangerouslySetInnerHTML={{ __html: vision }} />
              ) : (
                <p className="mt-3 leading-relaxed text-gray-400">
                  To create a global ecosystem where every community possesses the digital literacy and empathetic support required to architect their own prosperity and lasting empowerment.
                </p>
              )}
            </div>

            {/* Mission */}
            <div className="rounded-2xl p-8"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                🎯
              </div>
              <h2 className="font-heading text-xl font-bold text-white">The Mission</h2>
              {mission ? (
                <div className="rich-content mt-3 text-gray-400" dangerouslySetInnerHTML={{ __html: mission }} />
              ) : (
                <p className="mt-3 leading-relaxed text-gray-400">
                  To bridge the gap between innovation and accessibility, fostering self-reliance through advanced technical training paired with deep-rooted community compassion.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Pillars of Jade ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white">
            The Pillars of Jade
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayPillars.map((pillar, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-xl">
                  {pillar.icon}
                </div>
                <h3 className="font-heading text-base font-bold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Journey ───────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-14 font-heading text-3xl font-bold text-white">Our Journey</h2>

          {/* Timeline */}
          <div className="relative">
            {/* Horizontal connector line (desktop) */}
            <div className="absolute left-0 right-0 top-3 hidden h-px lg:block"
              style={{ background: "rgba(255,255,255,0.08)" }} />

            <div className="grid gap-8 lg:grid-cols-3">
              {displayJourney.map((item, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className="mb-6 flex items-center gap-3 lg:mb-0 lg:flex-col lg:items-start">
                    <div className="relative z-10 h-3 w-3 flex-shrink-0 rounded-full bg-brand lg:mb-6" />
                  </div>
                  {/* Card */}
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
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-3xl font-bold text-white">Be Part of the Story</h2>
          <p className="mt-4 text-gray-400">
            Whether you donate, volunteer, or partner with us — every action creates a ripple that transforms lives.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={`/${lang}/donate`}
              className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark">
              Donate Now
            </Link>
            <Link href={`/${lang}/get-involved`}
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand">
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
