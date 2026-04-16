import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import mongoose from "mongoose";

type BlogMedia = { url: string; publicId: string; type: "image" | "video" };

interface BlogDoc {
  _id: unknown;
  title: string;
  slug: string;
  description: string;
  details: string;
  media: BlogMedia[];
  publishedAt?: Date;
  createdAt: Date;
}

async function getPost(id: string): Promise<BlogDoc | null> {
  try {
    await connectDB();
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, isPublished: true }
      : { slug: id, isPublished: true };
    const post = await Blog.findOne(query).lean();
    return post as BlogDoc | null;
  } catch {
    return null;
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const post = await getPost(id);
  if (!post) notFound();

  const heroImg = post.media?.find((m) => m.type === "image")?.url ?? "";
  const date = post.publishedAt ?? post.createdAt;
  const words = post.details.split(" ").length;
  const readMins = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="min-h-screen bg-[#0c1620]">
      <Navbar lang={lang as Locale} />

      {/* Hero image */}
      {heroImg && (
        <div className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-[480px]">
          <Image src={heroImg} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1620] via-[#0c1620]/40 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href={`/${lang}/news`} className="hover:text-brand transition-colors">
            The Journal
          </Link>
          <span>/</span>
          <span className="text-gray-400 truncate">{post.title}</span>
        </nav>

        {/* Meta */}
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          {new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          &nbsp;·&nbsp;{readMins} min read
        </p>

        {/* Title */}
        <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        {/* Lead */}
        <p className="mt-5 text-lg leading-relaxed text-gray-400">{post.description}</p>

        {/* Divider */}
        <div className="my-8 h-px w-16 bg-brand" />

        {/* Rich content body */}
        <div
          className="rich-content text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.details }}
        />

        {/* Media gallery (images/videos beyond the first hero) */}
        {post.media && post.media.length > 1 && (
          <div className="mt-12">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {post.media.slice(1).map((m, i) =>
                m.type === "image" ? (
                  <div key={i} className="relative aspect-video overflow-hidden rounded-xl">
                    <Image src={m.url} alt={`Media ${i + 2}`} fill className="object-cover" />
                  </div>
                ) : (
                  <video key={i} src={m.url} controls className="w-full rounded-xl" />
                )
              )}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link
            href={`/${lang}/news`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            ← Back to The Journal
          </Link>
        </div>
      </div>

      <Footer lang={lang as Locale} />
    </div>
  );
}
