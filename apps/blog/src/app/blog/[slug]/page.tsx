import type { Metadata } from "next";
import Image from "next/image";
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
    <main style={{ width: "100%", margin: 0, maxWidth: "100%" }}>
      <article>
        {/* Hero Image */}
        <div
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            padding: "2rem 1rem",
          }}
        >
          {post.heroImage && (
            <Image
              src={post.heroImage}
              alt={post.title}
              width={1020}
              height={510}
              style={{
                display: "block",
                margin: "0 auto",
                borderRadius: "0.75rem",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "cover",
              }}
              priority
            />
          )}
        </div>

        {/* Post content */}
        <div
          style={{
            width: "720px",
            maxWidth: "calc(100% - 2em)",
            margin: "auto",
            padding: "1.5em",
            color: "rgb(55, 65, 81)",
          }}
        >
          {/* Title block */}
          <div
            style={{
              marginBottom: "2em",
              padding: "2em 1em",
              textAlign: "center",
              lineHeight: 1.2,
              background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
              borderBottom: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div
              style={{
                marginBottom: "1em",
                color: "rgb(107, 114, 128)",
                fontSize: "0.9375rem",
              }}
            >
              <FormattedDate date={post.pubDate} />
              {post.updatedDate && (
                <div
                  style={{ fontStyle: "italic", fontSize: "0.875rem" }}
                >
                  Last updated on <FormattedDate date={post.updatedDate} />
                </div>
              )}
            </div>
            <h1
              style={{
                margin: "0 0 0.75em 0",
                color: "rgb(17, 24, 39)",
                fontSize: "2.5rem",
                fontWeight: 700,
              }}
            >
              {post.title}
            </h1>
            <hr />
          </div>

          {/* MDX Content */}
          <div className="prose">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </article>
    </main>
  );
}
