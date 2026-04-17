import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Impact from "@/models/Impact";
import Project from "@/models/Project";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jadedvalfoundation.org";
const LOCALES = ["en", "es", "fr", "ar", "zh"] as const;

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

function staticEntries(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1.0, freq: "daily" as Freq },
    { path: "/impact", priority: 0.9, freq: "weekly" as Freq },
    { path: "/news", priority: 0.9, freq: "daily" as Freq },
    { path: "/programs", priority: 0.8, freq: "weekly" as Freq },
    { path: "/donate", priority: 0.8, freq: "monthly" as Freq },
    { path: "/get-involved", priority: 0.7, freq: "monthly" as Freq },
    { path: "/about", priority: 0.7, freq: "monthly" as Freq },
    { path: "/contact", priority: 0.6, freq: "monthly" as Freq },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of pages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
      });
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticEntries();

  try {
    await connectDB();

    const [posts, impacts, projects] = await Promise.all([
      Blog.find({ isPublished: true })
        .select("_id slug updatedAt")
        .lean() as Promise<Array<{ _id: unknown; slug: string; updatedAt: Date }>>,
      Impact.find({ isPublished: true })
        .select("_id updatedAt")
        .lean() as Promise<Array<{ _id: unknown; updatedAt: Date }>>,
      Project.find({ isActive: true })
        .select("_id slug updatedAt")
        .lean() as Promise<Array<{ _id: unknown; slug?: string; updatedAt: Date }>>,
    ]);

    for (const post of posts) {
      const id = post.slug || String(post._id);
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}/news/${id}`,
          lastModified: post.updatedAt,
          changeFrequency: "weekly",
          priority: 0.85,
        });
      }
    }

    for (const impact of impacts) {
      const id = String(impact._id);
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}/impact/${id}`,
          lastModified: impact.updatedAt,
          changeFrequency: "monthly",
          priority: 0.75,
        });
      }
    }

    for (const project of projects) {
      const id = project.slug || String(project._id);
      for (const locale of LOCALES) {
        entries.push({
          url: `${SITE_URL}/${locale}/projects/${id}`,
          lastModified: project.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // If DB is unavailable, return static entries only
  }

  return entries;
}
