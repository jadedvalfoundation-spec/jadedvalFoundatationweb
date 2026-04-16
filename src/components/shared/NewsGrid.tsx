"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  media?: { url: string; type: string }[];
  publishedAt?: string;
  createdAt: string;
}

interface NewsGridProps {
  initialPosts: BlogPost[];
  total: number;
  lang: Locale;
  limit?: number;
}

function readTime(description: string) {
  const words = description.split(" ").length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsGrid({ initialPosts, total, lang, limit = 6 }: NewsGridProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const hasMore = posts.length < total;

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/blog?page=${nextPage}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => [...prev, ...json.data]);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => {
          const img = post.media?.find((m) => m.type === "image")?.url ?? "";
          const date = post.publishedAt ?? post.createdAt;
          const mins = readTime(post.description);
          const isLarge = i === 0 && posts.length >= 3;

          return (
            <article
              key={post._id}
              className={`group overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 ${isLarge ? "sm:col-span-2 lg:col-span-1" : ""}`}
              style={{ background: "#0f1e2a", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Link href={`/${lang}/news/${post._id}`} className="block">
                <div className="relative h-52 overflow-hidden bg-[#132535]">
                  {img ? (
                    <Image
                      src={img}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-5xl opacity-20">📰</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand/80">
                    {formatDate(date)} &nbsp;·&nbsp; {mins} MIN READ
                  </p>
                  <h3 className="mt-2 font-heading text-base font-bold leading-snug text-white line-clamp-2 group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 line-clamp-3">
                    {post.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Read More <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-brand px-10 py-3 text-sm font-bold uppercase tracking-widest text-brand transition hover:bg-brand hover:text-white disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load More Articles"}
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <p className="py-20 text-center text-gray-500">No articles published yet.</p>
      )}
    </>
  );
}
