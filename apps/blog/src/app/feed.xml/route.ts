import { Feed } from "feed";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/consts";
import { getSortedPostsData } from "@/lib/posts";

export const dynamic = "force-static";

export async function GET() {
  const posts = getSortedPostsData();

  const feed = new Feed({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `© ${new Date().getFullYear()} Accessories World Zimbabwe`,
    feedLinks: {
      rss2: `${SITE_URL}/feed.xml`,
    },
    author: {
      name: "Accessories World Zimbabwe",
      link: SITE_URL,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      date: post.pubDate,
      image: post.heroImage ? `${SITE_URL}${post.heroImage}` : undefined,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
