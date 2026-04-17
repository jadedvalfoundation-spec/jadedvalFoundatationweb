import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import WebsiteInfo from "@/models/WebsiteInfo";
import Project from "@/models/Project";
import BankAccount from "@/models/BankAccount";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import DonateForm from "@/components/shared/DonateForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Donate",
  description:
    "Support Jade D'Val Foundation and help transform lives. Your donation funds education, healthcare, and community development programs across Africa.",
  openGraph: {
    title: "Donate | Jade D'Val Foundation",
    description: "Help transform lives — fund education, healthcare, and community development.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

async function getData(projectId?: string) {
  try {
    await connectDB();
    const [info, project, bankAccounts] = await Promise.all([
      WebsiteInfo.findOne()
        .select("impactMade")
        .lean() as Promise<{ impactMade?: number } | null>,
      projectId
        ? Project.findById(projectId).select("name program status").lean()
        : null,
      BankAccount.find({ isActive: true })
        .select("accountName bankName accountNumber")
        .sort({ createdAt: 1 })
        .lean() as Promise<{ _id: unknown; accountName: string; bankName: string; accountNumber: string }[]>,
    ]);
    return { info: info ?? {}, project, bankAccounts };
  } catch {
    return { info: {}, project: null, bankAccounts: [] };
  }
}

export default async function DonatePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ project?: string; name?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  if (!hasLocale(lang)) notFound();

  const [{ info, project, bankAccounts }, dict] = await Promise.all([
    getData(sp.project),
    getDictionary(lang as Locale),
  ]);
  const d = dict.donate;

  const cookieStore = await cookies();
  const userCurrency = cookieStore.get("user_currency")?.value ?? "USD";

  const projectName = (project as { name?: string } | null)?.name ?? sp.name;
  const projectId = sp.project;

  const impactMade = (info as { impactMade?: number }).impactMade ?? 0;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-start">

          {/* Left — impact copy */}
          <div className="lg:sticky lg:top-24">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">{d.badge}</span>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              {d.title}{" "}
              <em className="not-italic text-brand">{d.titleHighlight}</em>{" "}
              {d.titleEnd}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              {d.subtitle}
            </p>

            {projectName && (
              <div className="mt-6 rounded-2xl p-5"
                style={{ background: "#0f1e2a", border: "1px solid rgba(0,204,187,0.3)" }}>
                <p className="text-xs font-bold uppercase tracking-widest text-brand">{d.donatingTo}</p>
                <p className="mt-1 font-heading text-lg font-bold text-white">{projectName}</p>
              </div>
            )}

            {/* Impact stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: impactMade > 0 ? (impactMade >= 1000 ? Math.round(impactMade / 1000) + "k+" : impactMade + "+") : "120k+", label: d.statLives },
                { value: "100%", label: d.statPrograms },
                { value: "48h", label: d.statResponse },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 text-center"
                  style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="font-heading text-2xl font-bold text-brand">{s.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="mt-8 space-y-3">
              {[
                { icon: "🔒", text: d.trustSecure },
                { icon: "📧", text: d.trustEmail },
                { icon: "📊", text: d.trustReport },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl p-6 sm:p-8"
            style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="mb-6 font-heading text-xl font-bold text-white">
              {projectName ? `${d.support} "${projectName}"` : d.makeADonation}
            </h2>
            <DonateForm
              projectId={projectId}
              projectName={projectName}
              bankAccounts={bankAccounts.map((a) => ({
                _id: String(a._id),
                accountName: a.accountName,
                bankName: a.bankName,
                accountNumber: a.accountNumber,
              }))}
              userCurrency={userCurrency}
            />
          </div>
        </div>
      </div>

      <Footer lang={lang as Locale} />
    </div>
  );
}
