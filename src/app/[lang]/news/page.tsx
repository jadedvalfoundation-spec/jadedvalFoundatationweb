import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import NewsGrid from "@/components/shared/NewsGrid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Journal",
  description:
    "Read the latest news, stories of impact, and updates from Jade D'Val Foundation — empowering communities across Africa and beyond.",
  openGraph: {
    title: "The Journal | Jade D'Val Foundation",
    description:
      "Latest news, stories of impact, and updates from Jade D'Val Foundation.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

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
    // Serialize mongoose docs to plain objects (ObjectId → string, Date → ISO string)
    const serialized = JSON.parse(JSON.stringify(posts));
    return { posts: serialized, total };
  } catch {
    return { posts: [], total: 0 };
  }
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [{ posts, total }, dict] = await Promise.all([
    getInitialPosts(),
    getDictionary(lang as Locale),
  ]);
  const d = dict.news;

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Hero */}
      <section className="py-20" style={{ background: "#0a1520" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand">
                {d.heroBadge}
              </span>
              <h1 className="mt-2 font-heading text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
                {d.heroTitle}{" "}
                <em className="not-italic text-brand">{d.heroHighlight}</em>
              </h1>
              <p className="mt-4 max-w-xl text-gray-400">
                {d.heroSubtitle}
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
