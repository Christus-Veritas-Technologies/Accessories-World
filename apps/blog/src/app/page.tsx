import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/consts";
import { getSortedPostsData } from "@/lib/posts";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  const posts = getSortedPostsData();
  const recent = posts.slice(0, 5);

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Hero — title left, description right */}
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
        className="blog-hero"
      >
        <div style={{ flex: "1 1 360px" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 700,
              color: "rgb(17,24,39)",
              margin: "0 0 0.75rem 0",
              lineHeight: 1.1,
            }}
          >
            Accessories World Blog
          </h1>
        </div>
        <div style={{ flex: "0 1 360px", paddingTop: "0.5rem" }}>
          <p style={{ fontSize: "1.125rem", color: "rgb(107,114,128)", margin: "0 0 1.5rem 0", lineHeight: 1.7 }}>
            {SITE_DESCRIPTION}
          </p>
          <Link
            href="/articles"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.5rem",
              background: "#DC2626",
              color: "white",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            Browse all articles
          </Link>
        </div>
      </section>

      {/* Divider label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "2.5rem 0 1.5rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "rgb(17,24,39)", whiteSpace: "nowrap" }}>
          Latest articles
        </h2>
        <div style={{ flex: 1, height: "1px", background: "rgb(229,231,235)" }} />
      </div>

      {/* Recent posts grid — up to 5 */}
      {recent.length > 0 && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {recent.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      )}

      {/* View all CTA — shown when there are more than 5 posts */}
      {posts.length > 5 && (
        <div style={{ textAlign: "center", paddingBottom: "4rem" }}>
          <Link
            href="/articles"
            style={{
              display: "inline-block",
              padding: "0.75rem 2.5rem",
              border: "1px solid rgb(229,231,235)",
              borderRadius: "0.5rem",
              fontWeight: 600,
              color: "rgb(55,65,81)",
              textDecoration: "none",
              fontSize: "0.9375rem",
            }}
          >
            View all articles →
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .blog-hero { padding: 2.5rem 0 2rem; }
        }
      `}</style>
    </main>
  );
}
