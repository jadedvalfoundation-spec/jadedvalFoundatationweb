import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import Impact from "@/models/Impact";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

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

async function getImpact(id: string) {
  try {
    await connectDB();
    const impact = await Impact.findOne({ _id: id, isPublished: true }).lean();
    return impact;
  } catch {
    return null;
  }
}

export default async function ImpactDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const impact = await getImpact(id) as {
    _id: unknown; title: string; description: string; details: string;
    sector: string; media: Array<{ url: string; publicId: string; type: "image" | "video" }>;
    createdAt: unknown;
  } | null;

  if (!impact) notFound();

  const sectorColor = SECTOR_COLORS[impact.sector] ?? "#00CCBB";
  const coverImage = impact.media.find((m) => m.type === "image");
  const additionalMedia = impact.media.slice(1);

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[60vh] items-end overflow-hidden pb-16">
        {/* BG */}
        <div className="absolute inset-0">
          {coverImage ? (
            <Image src={coverImage.url} alt={impact.title} fill className="object-cover" priority />
          ) : (
            <div className="h-full w-full bg-[#071018]" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(7,16,24,0.4) 0%, rgba(7,16,24,0.9) 70%, #0c1620 100%)" }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href={`/${lang}/impact`} className="transition hover:text-brand">Impact</Link>
            <span>/</span>
            <span className="text-gray-300 line-clamp-1">{impact.title}</span>
          </nav>

          {/* Sector badge */}
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
            style={{ background: sectorColor + "cc" }}
          >
            {impact.sector}
          </span>

          <h1 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl max-w-3xl">
            {impact.title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-300">
            {impact.description}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            {new Date(impact.createdAt as string).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Rich text content */}
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: impact.details }}
          />

          {/* Additional media gallery */}
          {additionalMedia.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 font-heading text-xl font-bold text-white">Gallery</h2>
              <div className={`grid gap-4 ${additionalMedia.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>
                {additionalMedia.map((m, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl bg-[#071018]">
                    {m.type === "image" ? (
                      <div className="relative aspect-video w-full">
                        <Image
                          src={m.url}
                          alt={`${impact.title} media ${i + 2}`}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <video
                        src={m.url}
                        controls
                        className="aspect-video w-full rounded-xl"
                        playsInline
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-16 border-t border-white/5 pt-10">
            <Link
              href={`/${lang}/impact`}
              className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-6 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white"
            >
              ← Back to All Impact Stories
            </Link>
          </div>
        </div>
      </section>

      {/* ── Donate CTA ───────────────────────────────────────────────────── */}
      <section
        className="py-20"
        style={{ background: "#071018", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Continue the Work</p>
          <h3 className="mt-3 font-heading text-3xl font-bold text-white">
            Be Part of the Next Story
          </h3>
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            Your donation helps us create more stories like this one. Every contribution — big or small — drives real change.
          </p>
          <Link
            href={`/${lang}/donate`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-10 py-4 font-heading text-base font-bold text-white shadow-lg shadow-brand/30 transition hover:opacity-90"
          >
            Donate Now →
          </Link>
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
