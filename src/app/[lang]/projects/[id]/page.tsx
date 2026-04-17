import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { translate } from "@/lib/translate";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import "@/models/Program"; // register model so populate("program") resolves
import Donation from "@/models/Donation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jadedvalfoundation.org";

async function getData(id: string) {
  try {
    await connectDB();
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: new mongoose.Types.ObjectId(id) }
      : { slug: id };

    const project = await Project.findOne(query)
      .populate("program", "name")
      .lean();
    if (!project) return null;

    const p = project as typeof project & {
      _id: unknown; name: string; status: string; targetAmount: number;
      duration: string; startDate?: Date; description: string; image?: string;
      manualAmountRaised?: number | null; totalAmountUsed?: number; achievement?: string;
      program: { name: string };
    };

    const raisedAgg = await Donation.aggregate([
      { $match: { project: p._id as never, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
    ]);

    const donationTotal = raisedAgg[0]?.total ?? 0;
    const donorCount = raisedAgg[0]?.count ?? 0;
    // Use manually set amount if available, otherwise fall back to verified donations
    const amountRaised = p.manualAmountRaised != null ? p.manualAmountRaised : donationTotal;
    const pct = p.targetAmount > 0
      ? Math.min(100, (amountRaised / p.targetAmount) * 100)
      : 0;

    return { p, amountRaised, donorCount, pct };
  } catch {
    return null;
  }
}

// STATUS_LABEL is built from dict inside the component

const STATUS_COLOR: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-300",
  ongoing: "bg-brand/20 text-brand",
  completed: "bg-green-500/20 text-green-300",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const data = await getData(id);
  if (!data) return {};

  const { p } = data;
  const desc = (p.description as string).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  const canonical = `${SITE_URL}/${lang}/projects/${id}`;

  return {
    title: p.name,
    description: desc,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        ["en", "es", "fr", "ar", "zh"].map((l) => [l, `${SITE_URL}/${l}/projects/${id}`])
      ),
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: p.name,
      description: desc,
      images: p.image ? [{ url: p.image as string, width: 1200, height: 630, alt: p.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description: desc,
      images: p.image ? [p.image as string] : [],
    },
  };
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [data, dict] = await Promise.all([
    getData(id),
    getDictionary(lang as Locale),
  ]);
  if (!data) notFound();

  const { p, amountRaised, donorCount, pct } = data;
  const d = dict.project;
  const dp = dict.programs;

  // Translate dynamic DB content for non-English locales
  const [projectName, programName] = lang === "en"
    ? [p.name, p.program?.name ?? ""]
    : await Promise.all([
        translate(p.name, lang as Locale),
        p.program?.name ? translate(p.program.name, lang as Locale) : Promise.resolve(""),
      ]);

  // Rich HTML fields: keep original markup (translating rich HTML risks breaking tags)
  const projectDescription = p.description;
  const projectAchievement = p.achievement ?? "";

  const STATUS_LABEL: Record<string, string> = {
    upcoming: dp.filterUpcoming,
    ongoing: dp.filterOngoing,
    completed: dp.filterCompleted,
  };

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Hero image */}
      {p.image && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-[420px]">
          <Image src={p.image} alt={projectName} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1620] via-[#0c1620]/30 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/${lang}`} className="hover:text-brand transition-colors">{dict.nav.home}</Link>
          <span>/</span>
          <span className="text-gray-400 truncate">{projectName}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{projectName}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[p.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              {d.badge}: <span className="text-brand">{programName}</span>
              {" · "}{p.duration}
              {p.startDate && (
                <> · Start: {new Date(p.startDate).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: d.goal, value: `$${p.targetAmount.toLocaleString()}` },
            { label: d.raised, value: `$${amountRaised.toLocaleString()}` },
            { label: d.status, value: `${pct.toFixed(1)}%` },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 text-center"
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-heading text-2xl font-bold text-brand">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 rounded-xl p-5" style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-gray-300">{d.raised}</span>
            <span className="font-bold text-brand">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>${amountRaised.toLocaleString()} {dp.raised}</span>
            <span>${p.targetAmount.toLocaleString()} {d.goal}</span>
          </div>
        </div>

        {/* Donate CTA */}
        {p.status !== "completed" && (
          <div className="mt-6 flex gap-3">
            <Link
              href={`/${lang}/donate?project=${String(p._id)}&name=${encodeURIComponent(projectName)}`}
              className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              {d.donateNow}
            </Link>
          </div>
        )}

        {/* Completed achievement */}
        {p.status === "completed" && (
          <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
            <h2 className="font-semibold text-green-300">{dp.filterCompleted}</h2>
            {p.totalAmountUsed != null && (
              <p className="mt-1 text-sm text-green-400">
                Total used: <strong>${p.totalAmountUsed.toLocaleString()}</strong>
              </p>
            )}
            {projectAchievement && (
              <div
                className="rich-content mt-3 text-green-200/80"
                dangerouslySetInnerHTML={{ __html: projectAchievement }}
              />
            )}
          </div>
        )}

        {/* Description */}
        <div className="mt-10">
          <div className="mb-4 h-px bg-white/8" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div
            className="rich-content text-gray-300"
            dangerouslySetInnerHTML={{ __html: projectDescription }}
          />
        </div>

        {/* Back */}
        <div className="mt-12">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            ← {d.backToPrograms}
          </Link>
        </div>
      </div>

      <Footer lang={lang as Locale} />
    </div>
  );
}
