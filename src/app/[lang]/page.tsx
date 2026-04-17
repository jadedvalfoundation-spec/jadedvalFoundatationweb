import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Project from "@/models/Project";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { translate } from "@/lib/translate";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    await connectDB();
    const [info, projects] = await Promise.all([
      WebsiteInfo.findOne().lean() as Promise<{
        impactMade?: number; countriesReached?: number; communitiesImpacted?: number; heroImage?: string;
      } | null>,
      Project.aggregate([
        { $match: { isActive: true } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$program", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $lookup: { from: "programs", localField: "program", foreignField: "_id", as: "programInfo" } },
        { $limit: 5 },
      ]),
    ]);
    return { info: info ?? {}, projects };
  } catch {
    return { info: {}, projects: [] };
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [{ info, projects }, dict] = await Promise.all([
    getData(),
    getDictionary(lang as Locale),
  ]);

  const heroImage = (info as { heroImage?: string }).heroImage ?? "";
  const impactMade = (info as { impactMade?: number }).impactMade ?? 0;
  const communitiesImpacted = (info as { communitiesImpacted?: number }).communitiesImpacted ?? 0;

  const d = dict.home;
  const dc = dict.common;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c1620] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">{d.heroBadge}</span>
              </div>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {d.heroTitle}{" "}
                <span className="italic text-brand">{d.heroHighlight}</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-400">{d.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={`/${lang}/donate`} className="rounded-full bg-brand px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-dark">
                  {d.heroDonate}
                </Link>
                <Link href={`/${lang}/impact`} className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand">
                  {d.heroCommunity}
                </Link>
              </div>
              <div className="mt-10 flex gap-2">
                <span className="h-2 w-6 rounded-full bg-brand" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </div>
            </div>

            <div className="relative">
              {heroImage ? (
                <div className="overflow-hidden rounded-2xl">
                  <Image src={heroImage} alt="Community impact" width={600} height={480} className="h-80 w-full object-cover lg:h-[480px]" />
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#132535] lg:h-[480px]" style={{ background: "linear-gradient(135deg, #132535 0%, #1a3a50 100%)" }}>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand/20">
                      <span className="text-3xl">🌍</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-[#0f1e2a] p-4 shadow-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-2xl font-bold text-brand">{impactMade > 0 ? impactMade.toLocaleString() + "+" : "10,000+"}</p>
                <p className="text-xs text-gray-400">{dc.livesImpacted}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stories of Resilience ─────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                {d.storiesTitle}{" "}
                <em className="not-italic text-brand">{d.storiesHighlight}</em>
              </h2>
              <p className="mt-3 max-w-lg text-gray-400">{d.storiesSubtitle}</p>
            </div>
            <div className="flex gap-10 lg:flex-shrink-0">
              <div>
                <p className="font-heading text-4xl font-bold text-brand">{impactMade > 0 ? Math.round(impactMade / 1000) + "K+" : "250K+"}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">{d.familiesSupported}</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-bold text-brand">{communitiesImpacted > 0 ? communitiesImpacted + "%" : "85%"}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">{d.literacyIncrease}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex justify-end">
            <Link href={`/${lang}/programs`} className="text-sm font-semibold text-brand hover:underline">{d.viewAllProjects}</Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.length > 0 ? await Promise.all(projects.map(async (proj) => {
              const pr = proj as { _id: unknown; name: string; description: string; image?: string; status: string; programInfo?: { name: string }[] };
              const programName = await translate(pr.programInfo?.[0]?.name ?? "Foundation", lang as Locale);
              const projectName = await translate(pr.name, lang as Locale);
              const desc = pr.description.replace(/<[^>]+>/g, " ").slice(0, 160);
              const translatedDesc = await translate(desc, lang as Locale);
              return (
                <Link key={String(pr._id)} href={`/${lang}/projects/${String(pr._id)}`}
                  className="group block overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative h-48 overflow-hidden bg-[#132535]">
                    {pr.image ? (
                      <Image src={pr.image} alt={projectName} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#132535] to-[#1a3a50]">
                        <span className="text-4xl opacity-20">🌍</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand">{programName}</span>
                    <h3 className="mt-2 font-heading text-base font-bold text-white line-clamp-2 group-hover:text-brand transition-colors">{projectName}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-3">{translatedDesc}…</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      {dc.readMore} <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              );
            })) : (
              [
                { tag: "Child Empowerment", title: "Asha's Journey to Leadership", desc: "How digital literacy programs helped a 12-year-old transform her village's water management." },
                { tag: "Direct Support", title: "Stabilizing the Moreno Family", desc: "Comprehensive family support that turned a housing crisis into a community small business." },
                { tag: "Community Development", title: "The Hub for Future Growth", desc: "Transforming abandoned spaces into vibrant digital-human community centers." },
              ].map((card) => (
                <article key={card.title} className="overflow-hidden rounded-2xl" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
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

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "#0c1620" }}>
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-brand">{d.newsletterBadge}</span>
          </div>
          <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">{d.newsletterTitle}</h2>
          <p className="mt-4 text-lg text-gray-400">{d.newsletterSubtitle}</p>
          <NewsletterForm lang={lang as Locale} />
          <p className="mt-4 text-xs text-gray-600">{d.newsletterPrivacy}</p>
        </div>
      </section>

      {/* ── Donate / Volunteer ───────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl p-8" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="font-heading text-3xl font-bold text-white">
                {d.fuelTitle}{" "}<span className="text-brand">{d.fuelHighlight}</span>
              </h2>
              <p className="mt-3 text-gray-400">{d.fuelSubtitle}</p>
              <div className="mt-6 flex gap-3">
                {["$25", "$50", "$100"].map((amount) => (
                  <button key={amount} className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">{amount}</button>
                ))}
              </div>
              <Link href={`/${lang}/donate`} className="mt-6 block rounded-full bg-brand px-6 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-brand-dark">
                {dc.donateNow}
              </Link>
            </div>

            <div className="rounded-2xl p-8" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <span className="text-2xl">♦</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-white">{d.moreThanMoney}</h2>
              <p className="mt-3 text-gray-400">{d.volunteerSubtitle}</p>
              <Link href={`/${lang}/get-involved`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
                {d.becomeVolunteer}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
