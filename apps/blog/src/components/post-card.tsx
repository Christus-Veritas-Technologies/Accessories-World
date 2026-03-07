import Image from "next/image";
import Link from "next/link";
import { FormattedDate } from "./formatted-date";
import type { PostMeta } from "@/lib/posts";

interface PostCardProps {
  post: PostMeta;
  /** Featured cards use a taller 16:9 image, regular cards use a 3:2 */
  featured?: boolean;
}

export function PostCard({ post, featured }: PostCardProps) {
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "0.75rem",
        overflow: "hidden",
        background: "white",
        border: "1px solid rgb(229,231,235)",
      }}
    >
      {/* Image with overlay */}
      <Link
        href={`/blog/${post.slug}`}
        style={{ display: "block", textDecoration: "none", position: "relative", flexShrink: 0 }}
        aria-label={post.title}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: featured ? "16 / 9" : "3 / 2",
            overflow: "hidden",
            background: "rgb(243,244,246)",
          }}
        >
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 600px"
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "rgb(229,231,235)" }} />
          )}

          {/* Bottom gradient + date overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "2.5rem 1rem 0.875rem",
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.8125rem",
                fontWeight: 500,
              }}
            >
              <FormattedDate date={post.pubDate} />
            </span>
            <span
              style={{
                background: "#DC2626",
                color: "white",
                fontSize: "0.6875rem",
                fontWeight: 600,
                padding: "0.2rem 0.5rem",
                borderRadius: "0.25rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Article
            </span>
          </div>
        </div>
      </Link>

      {/* Card body */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem" }}>
        <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              margin: 0,
              fontSize: featured ? "1.375rem" : "1.0625rem",
              fontWeight: 700,
              color: "rgb(17,24,39)",
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </h3>
        </Link>

        {post.description && (
          <p
            style={{
              margin: 0,
              color: "rgb(107,114,128)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              flex: 1,
              overflow: "hidden",
              display: "-webkit-box",
            } as React.CSSProperties}
          >
            {post.description}
          </p>
        )}

        <Link
          href={`/blog/${post.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            color: "rgb(55,65,81)",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            marginTop: "0.5rem",
          }}
        >
          Read post <span aria-hidden="true" style={{ fontSize: "1rem" }}>↗</span>
        </Link>
      </div>
    </article>
  );
}
