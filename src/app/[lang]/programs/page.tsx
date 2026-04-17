import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import Program from "@/models/Program";
import Project from "@/models/Project";
import Donation from "@/models/Donation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import ProgramsDisplay from "@/components/shared/ProgramsDisplay";
import type { ProgramSection, ProjectCard } from "@/components/shared/ProgramsDisplay";

export const metadata = {
  title: "Programs & Projects",
  description:
    "Explore Jade D'Val Foundation's active programs and projects driving change in education, healthcare, sustainability, and community development.",
  openGraph: {
    title: "Programs & Projects | Jade D'Val Foundation",
    description: "Active programs and projects driving change across communities.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

async function getData() {
  try {
    await connectDB();

    const [programs, projects, donationTotals] = await Promise.all([
      Program.find({ isActive: true }).sort({ createdAt: 1 }).lean(),
      Project.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      Donation.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$project", total: { $sum: "$amountUSD" }, count: { $sum: 1 } } },
      ]),
    ]);

    // Build lookup map: projectId → donation totals
    const donationMap = new Map<string, { total: number; count: number }>(
      donationTotals.map((d) => [String(d._id), { total: d.total, count: d.count }])
    );

    // Group projects by program
    const projectsByProgram = new Map<string, ProjectCard[]>();
    for (const proj of projects) {
      const p = proj as typeof proj & {
        _id: unknown; name: string; status: string; targetAmount: number;
        description: string; image?: string; program: unknown;
        manualAmountRaised?: number | null;
      };
      const progId = String(p.program);
      if (!projectsByProgram.has(progId)) projectsByProgram.set(progId, []);
      const donations = donationMap.get(String(p._id)) ?? { total: 0, count: 0 };
      const raised = p.manualAmountRaised != null ? p.manualAmountRaised : donations.total;
      projectsByProgram.get(progId)!.push({
        _id: String(p._id),
        name: p.name,
        description: p.description,
        image: p.image ?? undefined,
        status: p.status as ProjectCard["status"],
        targetAmount: p.targetAmount,
        raised,
        donorCount: donations.count,
      });
    }

    // Build program sections
    const sections: ProgramSection[] = programs
      .map((prog) => {
        const pr = prog as typeof prog & { _id: unknown; name: string; description: string; logo?: string };
        return {
          _id: String(pr._id),
          name: pr.name,
          description: pr.description,
          logo: pr.logo ?? undefined,
          projects: projectsByProgram.get(String(pr._id)) ?? [],
        };
      })
      .filter((s) => s.projects.length > 0);

    return { sections, totalPrograms: programs.length, totalProjects: projects.length };
  } catch {
    return { sections: [], totalPrograms: 0, totalProjects: 0 };
  }
}

export default async function ProgramsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [{ sections, totalPrograms, totalProjects }, dict] = await Promise.all([
    getData(),
    getDictionary(lang as Locale),
  ]);
  const d = dict.programs;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 lg:py-32" style={{ background: "#0a1520" }}>
        {/* Watermark */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 text-center font-heading font-black leading-none text-white/[0.03] select-none"
          style={{ fontSize: "clamp(5rem, 15vw, 14rem)" }}
          aria-hidden
        >
          EMPOWERING
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">{d.heroBadge}</span>
            </div>

            <h1 className="font-heading text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              {d.heroTitle}{" "}
              <em className="not-italic text-brand">{d.heroHighlight}</em>{" "}
              {d.heroSubtitle}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-400">{d.heroBody}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#programs" className="rounded-full border border-brand bg-brand/10 px-7 py-3 text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                {d.exploreProjects}
              </a>
              <Link href={`/${lang}/impact`} className="rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition hover:border-brand hover:text-brand">
                {d.viewAnnualReport}
              </Link>
            </div>

            <div className="mt-10 flex gap-8">
              <div>
                <p className="font-heading text-3xl font-bold text-brand">{totalPrograms}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-500">{d.programs}</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold text-brand">{totalProjects}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-500">{d.projects}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs + Projects ───────────────────────────────────────────── */}
      <div id="programs">
        {sections.length > 0 ? (
          <ProgramsDisplay programs={sections} lang={lang as Locale} />
        ) : (
          <div className="py-32 text-center">
            <p className="text-gray-500">{d.noProjects}</p>
            <p className="mt-2 text-sm text-gray-600">{d.checkBack}</p>
          </div>
        )}
      </div>

      <Footer lang={lang as Locale} />
    </div>
  );
}
