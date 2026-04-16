import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import NewsGrid from "@/components/shared/NewsGrid";

export const metadata = { title: "The Journal — Jade D'Val Foundation" };

const LIMIT = 6;

async function getInitialPosts() {
  try {
    await connectDB();
    const [posts, total] = await Promise.all([
      Blog.find({ isPublished: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(LIMIT)
        .select("_id title slug description media publishedAt createdAt")
        .lean(),
      Blog.countDocuments({ isPublished: true }),
    ]);
    return { posts, total };
  } catch {
    return { posts: [], total: 0 };
  }
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { posts, total } = await getInitialPosts();

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Hero */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                Stories &amp; Updates
              </span>
              <h1 className="mt-2 font-heading text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
                The Journal
              </h1>
              <p className="mt-4 max-w-xl text-gray-400">
                Archiving our digital evolution across the globe.
              </p>
            </div>
            {total > 0 && (
              <p className="hidden text-sm text-gray-500 sm:block">{total} article{total !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsGrid
            initialPosts={posts as unknown as Parameters<typeof NewsGrid>[0]["initialPosts"]}
            total={total}
            lang={lang as Locale}
            limit={LIMIT}
          />
        </div>
      </section>

      <Footer lang={lang as Locale} />
    </div>
  );
}
