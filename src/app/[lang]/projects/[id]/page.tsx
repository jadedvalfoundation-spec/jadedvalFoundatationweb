import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import mongoose from "mongoose";

async function getData(id: string) {
  try {
    await connectDB();
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, isActive: true }
      : { slug: id, isActive: true };

    const project = await Project.findOne(query)
      .populate("program", "name")
      .lean();
    if (!project) return null;

    const p = project as typeof project & {
      _id: unknown; name: string; status: string; targetAmount: number;
      duration: string; startDate?: Date; description: string; image?: string;
      totalAmountUsed?: number; achievement?: string;
      program: { name: string };
    };

    const raisedAgg = await Donation.aggregate([
      { $match: { project: p._id as never, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
    ]);

    const amountRaised = raisedAgg[0]?.total ?? 0;
    const donorCount = raisedAgg[0]?.count ?? 0;
    const pct = p.targetAmount > 0
      ? Math.min(100, (amountRaised / p.targetAmount) * 100)
      : 0;

    return { p, amountRaised, donorCount, pct };
  } catch {
    return null;
  }
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-300",
  ongoing: "bg-brand/20 text-brand",
  completed: "bg-green-500/20 text-green-300",
};

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const data = await getData(id);
  if (!data) notFound();

  const { p, amountRaised, donorCount, pct } = data;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Hero image */}
      {p.image && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-[420px]">
          <Image src={p.image} alt={p.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1620] via-[#0c1620]/30 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/${lang}`} className="hover:text-brand transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400 truncate">{p.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{p.name}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[p.status] ?? "bg-gray-500/20 text-gray-300"}`}>
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Program: <span className="text-brand">{p.program?.name}</span>
              {" · "}Duration: {p.duration}
              {p.startDate && (
                <> · Start: {new Date(p.startDate).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Goal", value: `$${p.targetAmount.toLocaleString()}` },
            { label: "Raised", value: `$${amountRaised.toLocaleString()}` },
            { label: "Donors", value: donorCount.toLocaleString() },
            { label: "Progress", value: `${pct.toFixed(1)}%` },
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
            <span className="font-medium text-gray-300">Fundraising Progress</span>
            <span className="font-bold text-brand">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>${amountRaised.toLocaleString()} raised</span>
            <span>${p.targetAmount.toLocaleString()} goal</span>
          </div>
        </div>

        {/* Donate CTA */}
        {p.status !== "completed" && (
          <div className="mt-6 flex gap-3">
            <Link
              href={`/${lang}/donate?project=${String(p._id)}&name=${encodeURIComponent(p.name)}`}
              className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              Donate to This Project
            </Link>
          </div>
        )}

        {/* Completed achievement */}
        {p.status === "completed" && (
          <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
            <h2 className="font-semibold text-green-300">Project Completed</h2>
            {p.totalAmountUsed != null && (
              <p className="mt-1 text-sm text-green-400">
                Total used: <strong>${p.totalAmountUsed.toLocaleString()}</strong>
              </p>
            )}
            {p.achievement && (
              <div
                className="rich-content mt-3 text-green-200/80"
                dangerouslySetInnerHTML={{ __html: p.achievement }}
              />
            )}
          </div>
        )}

        {/* Description */}
        <div className="mt-10">
          <div className="mb-4 h-px bg-white/8" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div
            className="rich-content text-gray-300"
            dangerouslySetInnerHTML={{ __html: p.description }}
          />
        </div>

        {/* Back */}
        <div className="mt-12">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      <Footer lang={lang as Locale} />
    </div>
  );
}
