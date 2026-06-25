import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jadedvalfoundation.org";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    await connectDB();

    const posts = await Blog.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(50)
      .select("title slug description media publishedAt createdAt")
      .lean<
        Array<{
          title: string;
          slug: string;
          description: string;
          media: Array<{ url: string; type: string }>;
          publishedAt?: Date;
          createdAt: Date;
        }>
      >();

    const items = posts
      .map((post) => {
        const url = `${SITE_URL}/en/news/${post.slug}`;
        const pubDate = new Date(
          post.publishedAt ?? post.createdAt
        ).toUTCString();
        const image = post.media?.find((m) => m.type === "image");

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>${
        image
          ? `
      <enclosure url="${escapeXml(image.url)}" type="image/jpeg" length="0" />`
          : ""
      }
    </item>`;
      })
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Journal | Jade D&apos;Val Foundation</title>
    <link>${SITE_URL}/en/news</link>
    <description>Latest news, stories of impact, and updates from Jade D&apos;Val Foundation — empowering communities across Africa and beyond.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/logo.png</url>
      <title>Jade D&apos;Val Foundation</title>
      <link>${SITE_URL}</link>
    </image>${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
