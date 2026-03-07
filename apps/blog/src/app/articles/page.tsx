import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/consts";
import { getSortedPostsData } from "@/lib/posts";

export const metadata: Metadata = {
  title: `All Articles | ${SITE_TITLE}`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `All Articles | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/articles",
  },
};

export default function ArticlesPage() {
  const posts = getSortedPostsData();

  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Page header */}
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
        <div style={{ flex: "1 1 360px" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 700,
              color: "rgb(17,24,39)",
              margin: "0 0 0.5rem 0",
              lineHeight: 1.1,
            }}
          >
            All Articles
          </h1>
        </div>
        <div style={{ flex: "0 1 360px", paddingTop: "0.5rem" }}>
          <p style={{ fontSize: "1.125rem", color: "rgb(107,114,128)", margin: 0, lineHeight: 1.7 }}>
            Accessories tips, gadget guides, and product reviews from Mutare, Zimbabwe.
          </p>
        </div>
      </section>

      {/* Divider with count + back-to-home */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "2.5rem 0 1.5rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgb(107,114,128)", whiteSpace: "nowrap" }}>
          {posts.length} article{posts.length !== 1 ? "s" : ""}
        </span>
        <div style={{ flex: 1, height: "1px", background: "rgb(229,231,235)" }} />
        <Link
          href="/"
          style={{ fontSize: "0.875rem", color: "rgb(107,114,128)", textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}
        >
          ← Back to home
        </Link>
      </div>

      {/* Post grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
          gap: "2rem",
          paddingBottom: "4rem",
        }}
      >
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
