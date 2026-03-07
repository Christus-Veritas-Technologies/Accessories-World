import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FormattedDate } from "@/components/formatted-date";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/consts";
import { getSortedPostsData } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `Blog | ${SITE_TITLE}`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getSortedPostsData();

  return (
    <main
      style={{
        width: "960px",
        maxWidth: "calc(100% - 2em)",
        margin: "auto",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          padding: "2rem 0",
          borderBottom: "1px solid rgb(229, 231, 235)",
        }}
      >
        <h1
          style={{
            color: "#DC2626",
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Blog
        </h1>
        <p
          style={{
            color: "rgb(107, 114, 128)",
            fontSize: "1.125rem",
            margin: "0.5rem 0 0 0",
          }}
        >
          Insights and tips for accessories lovers
        </p>
      </div>

      <section>
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
            listStyleType: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {posts.map((post) => (
            <li
              key={post.slug}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  textDecoration: "none",
                }}
              >
                {post.heroImage && (
                  <Image
                    src={post.heroImage}
                    alt={post.title}
                    width={320}
                    height={200}
                    style={{
                      marginBottom: "1rem",
                      borderRadius: "0.75rem",
                      objectFit: "cover",
                      height: "200px",
                      width: "100%",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "rgb(17,24,39)",
                    lineHeight: 1.3,
                    fontSize: "1.125rem",
                    fontWeight: 600,
                  }}
                >
                  {post.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "rgb(107,114,128)",
                    fontSize: "0.875rem",
                    marginTop: "auto",
                  }}
                >
                  <FormattedDate date={post.pubDate} />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
