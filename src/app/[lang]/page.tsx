import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Blog from "@/models/Blog";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import NewsletterForm from "@/components/shared/NewsletterForm";

async function getData() {
  try {
    await connectDB();
    const [info, posts] = await Promise.all([
      WebsiteInfo.findOne().lean() as Promise<{
        impactMade?: number; countriesReached?: number; communitiesImpacted?: number; heroImage?: string;
      } | null>,
      Blog.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select("title description media createdAt")
        .lean(),
    ]);
    return { info: info ?? {}, posts };
  } catch {
    return { info: {}, posts: [] };
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { info, posts } = await getData();

  const heroImage = (info as { heroImage?: string }).heroImage ?? "";
  const impactMade = (info as { impactMade?: number }).impactMade ?? 0;
  const communitiesImpacted = (info as { communitiesImpacted?: number }).communitiesImpacted ?? 0;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c1620] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Transforming Communities</span>
              </div>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Transforming Lives with{" "}
                <span className="italic text-brand">Compassion</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-400">
                We are the architects of community growth, fusing digital innovation with human-centered support to empower children and stabilize families in need.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={`/${lang}/donate`}
                  className="rounded-full bg-brand px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                >
                  Donate Now
                </Link>
                <Link
                  href={`/${lang}/impact`}
                  className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand"
                >
                  Community Impact
                </Link>
              </div>
              {/* Carousel dots */}
              <div className="mt-10 flex gap-2">
                <span className="h-2 w-6 rounded-full bg-brand" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative">
              {heroImage ? (
                <div className="overflow-hidden rounded-2xl">
                  <Image src={heroImage} alt="Community impact" width={600} height={480}
                    className="h-80 w-full object-cover lg:h-[480px]" />
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#132535] lg:h-[480px]"
                  style={{ background: "linear-gradient(135deg, #132535 0%, #1a3a50 100%)" }}>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
                      <span className="text-3xl">🌍</span>
                    </div>
                    <p className="text-sm text-gray-500">Upload hero image in admin → Website Info → Media</p>
                  </div>
                </div>
              )}
              {/* Floating stat card */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-[#0f1e2a] p-4 shadow-xl"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-2xl font-bold text-brand">{impactMade > 0 ? impactMade.toLocaleString() + "+" : "10,000+"}</p>
                <p className="text-xs text-gray-400">Lives Impacted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stories of Resilience ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                Stories of{" "}
                <em className="not-italic text-brand">Resilience</em>
              </h2>
              <p className="mt-3 max-w-lg text-gray-400">
                Witness the tangible results of combining digital precision with radical compassion in community development.
              </p>
            </div>
            {/* Stats */}
            <div className="flex gap-10 lg:flex-shrink-0">
              <div>
                <p className="font-heading text-4xl font-bold text-brand">
                  {impactMade > 0 ? Math.round(impactMade / 1000) + "K+" : "250K+"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                  Families Supported
                </p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-brand">
                  {communitiesImpacted > 0 ? communitiesImpacted + "%" : "85%"}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                  Literacy Increase
                </p>
              </div>
            </div>
          </div>

          {/* Impact story cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.length > 0 ? posts.map((post) => {
              const p = post as {
                _id: unknown; title: string; description: string;
                media?: { url: string; type: string }[]; createdAt: Date;
              };
              const img = p.media?.find(m => m.type === "image")?.url ?? "";
              return (
                <article key={String(p._id)}
                  className="group overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative h-48 overflow-hidden bg-[#132535]">
                    {img ? (
                      <Image src={img} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-4xl opacity-30">📰</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand">Impact Story</span>
                    <h3 className="mt-2 font-heading text-base font-bold text-white line-clamp-2">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-3">{p.description}</p>
                  </div>
                </article>
              );
            }) : (
              /* Placeholder cards when no blog posts yet */
              [
                { tag: "Child Empowerment #32", title: "Asha's Journey to Leadership", desc: "How digital literacy programs helped a 12-year-old transform her village's water management." },
                { tag: "Direct Support #841", title: "Stabilizing the Moreno Family", desc: "Comprehensive family support that turned a housing crisis into a community small business." },
                { tag: "Community Development #68", title: "The Hub for Future Growth", desc: "Transforming abandoned spaces into vibrant digital-human community centers." },
              ].map((card) => (
                <article key={card.title}
                  className="overflow-hidden rounded-2xl"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="h-48 bg-gradient-to-br from-[#132535] to-[#1a3a50]" />
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand">{card.tag}</span>
                    <h3 className="mt-2 font-heading text-base font-bold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{card.desc}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Stay Connected (Newsletter) ───────────────────────────────────── */}
      <section className="py-24" style={{ background: "#0c1620" }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">Live Connection</span>
          </div>
          <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">Stay Connected</h2>
          <p className="mt-4 text-lg text-gray-400">
            Receive updates on community breakthroughs, child empowerment milestones, and new ways to provide direct support.
          </p>
          <NewsletterForm />
          <p className="mt-4 text-xs text-gray-600">
            Join our network of compassionate digital alchemists. Your privacy is our priority.
          </p>
        </div>
      </section>

      {/* ── Fuel the Impact / Donate ──────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: donate */}
            <div className="rounded-2xl p-8" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="font-heading text-3xl font-bold text-white">
                Fuel the{" "}
                <span className="text-brand">Jade Impact</span>
              </h2>
              <p className="mt-3 text-gray-400">
                Your contribution directly powers our digital literacy programs and family stabilization efforts. Choose how you want to make a difference today.
              </p>
              <div className="mt-6 flex gap-3">
                {["$25", "$50", "$100"].map((amount) => (
                  <button key={amount}
                    className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">
                    {amount}
                  </button>
                ))}
              </div>
              <Link
                href={`/${lang}/donate`}
                className="mt-6 block rounded-full bg-brand px-6 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark"
              >
                Donate Now
              </Link>
            </div>

            {/* Right: volunteer */}
            <div className="rounded-2xl p-8" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <span className="text-2xl">♦</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">More Than Money</h2>
              <p className="mt-3 text-gray-400">
                Join our on-the-ground team or contribute your digital skills to help us scale our impact globally.
              </p>
              <Link
                href={`/${lang}/get-involved`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                Become a Volunteer →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
