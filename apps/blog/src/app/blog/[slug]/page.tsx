import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FormattedDate } from "@/components/formatted-date";
import { SITE_TITLE, SITE_URL } from "@/lib/consts";
import { getAllPostSlugs, getPostData } from "@/lib/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const slugs = getAllPostSlugs();
  if (!slugs.includes(slug)) return {};

  const post = getPostData(slug);
  const ogImage = post.heroImage
    ? `${SITE_URL}${post.heroImage}`
    : `${SITE_URL}/blog-assets/blog-placeholder-1.jpg`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: `${post.title} | ${SITE_TITLE}`,
      description: post.description,
      url: `${SITE_URL}/blog/${slug}`,
      publishedTime: post.pubDate.toISOString(),
      modifiedTime: post.updatedDate?.toISOString(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const slugs = getAllPostSlugs();
  if (!slugs.includes(slug)) notFound();

  const post = getPostData(slug);

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
      <article>
        {/* Breadcrumb + post header — same layout as other pages */}
        <section
          style={{
            padding: "4rem 0 3rem",
            borderBottom: "1px solid rgb(229,231,235)",
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: "1 1 400px" }}>
            <Link
              href="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.875rem",
                color: "rgb(107,114,128)",
                textDecoration: "none",
                fontWeight: 500,
                marginBottom: "1rem",
              }}
            >
              ← All articles
            </Link>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 700,
                color: "rgb(17,24,39)",
                margin: "0 0 0.75rem 0",
                lineHeight: 1.15,
              }}
            >
              {post.title}
            </h1>
          </div>
          <div style={{ flex: "0 1 360px", paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {post.description && (
              <p style={{ fontSize: "1.0625rem", color: "rgb(107,114,128)", margin: 0, lineHeight: 1.7 }}>
                {post.description}
              </p>
            )}
            <p style={{ margin: 0, fontSize: "0.875rem", color: "rgb(156,163,175)", fontWeight: 500 }}>
              <FormattedDate date={post.pubDate} />
              {post.updatedDate && (
                <span style={{ fontStyle: "italic" }}>
                  {" · "}Updated <FormattedDate date={post.updatedDate} />
                </span>
              )}
            </p>
          </div>
        </section>

        {/* Hero image */}
        {post.heroImage && (
          <div style={{ padding: "2.5rem 0", borderBottom: "1px solid rgb(229,231,235)" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "0.75rem",
                overflow: "hidden",
                aspectRatio: "21 / 9",
                maxHeight: "460px",
              }}
            >
              <Image
                src={post.heroImage}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </div>
          </div>
        )}

        {/* Article body */}
        <div
          style={{
            maxWidth: "720px",
            margin: "3rem auto 4rem",
            color: "rgb(55, 65, 81)",
          }}
        >
          <div className="prose">
            <MDXRemote source={post.content} />
          </div>

          {/* Footer nav */}
          <div
            style={{
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgb(229,231,235)",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <Link
              href="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.875rem",
                color: "rgb(107,114,128)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← All articles
            </Link>
            <a
              href="https://accessoriesworld.co.zw"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "0.5rem 1.25rem",
                background: "#DC2626",
                color: "white",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Shop Now
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
