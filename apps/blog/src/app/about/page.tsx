import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about our mission to inspire and guide you through the world of quality accessories",
  openGraph: {
    title: "About | Accessories World Blog",
    description:
      "Learn about our mission to inspire and guide you through the world of quality accessories",
  },
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Page header â€” matching blog hero design */}
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
            About Us
          </h1>
        </div>
        <div style={{ flex: "0 1 360px", paddingTop: "0.5rem" }}>
          <p style={{ fontSize: "1.125rem", color: "rgb(107,114,128)", margin: 0, lineHeight: 1.7 }}>
            Learn about our mission to inspire and guide you through the world of quality accessories.
          </p>
        </div>
      </section>

      {/* Hero image */}
      <div style={{ padding: "2.5rem 0", borderBottom: "1px solid rgb(229,231,235)" }}>
        <div style={{ position: "relative", borderRadius: "0.75rem", overflow: "hidden", aspectRatio: "21 / 9", maxHeight: "420px" }}>
          <Image
            src="/blog-assets/blog-placeholder-about.jpg"
            alt="About Accessories World Blog"
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: "720px",
          margin: "3rem auto 4rem",
          color: "rgb(55, 65, 81)",
        }}
      >
        <div className="prose">
          <h2>About Us</h2>
          <p>
            Welcome to the Accessories World Blogâ€”your trusted resource for all
            things accessories. We believe that accessories are more than just
            add-ons to an outfit; they&apos;re expressions of your personality,
            statements of your values, and investments in quality craftsmanship.
          </p>

          <h3>Our Mission</h3>
          <p>
            We&apos;re dedicated to helping you make informed decisions about
            your accessory purchases. Whether you&apos;re looking for the
            perfect bag, exploring seasonal styling options, or understanding how
            color can enhance your wardrobe, we&apos;re here to guide you.
          </p>

          <h3>Why Accessories Matter</h3>
          <p>
            In a world of fast fashion and disposable goods, we advocate for
            thoughtful consumption. Quality accessories can outlast trends and
            become beloved staples of your personal style. They tell a story,
            carry memories, and deserve to be chosen with intention.
          </p>

          <h3>What We Believe</h3>
          <ul>
            <li>
              <strong>Quality over quantity:</strong> One excellent bag beats ten
              mediocre ones.
            </li>
            <li>
              <strong>Sustainability matters:</strong> Well-made accessories
              reduce waste and environmental impact.
            </li>
            <li>
              <strong>Personal style is paramount:</strong> Trends are temporary;
              your style is timeless.
            </li>
            <li>
              <strong>Accessibility is important:</strong> Quality doesn&apos;t
              have to be expensive.
            </li>
            <li>
              <strong>Community counts:</strong> We learn from each other&apos;s
              experiences and choices.
            </li>
          </ul>

          <h3>Join Our Community</h3>
          <p>
            Whether you&apos;re a minimalist, a maximalist, or somewhere in
            between, there&apos;s a place for you here. Explore our blog posts,
            discover new perspectives on accessories, and join us in celebrating
            the art and utility of great design.
          </p>

          <p>
            Visit{" "}
            <a
              href="https://accessoriesworld.co.zw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accessories World
            </a>{" "}
            to explore our curated collection of quality accessories that embody
            these values. Every item in our store has been selected with care and
            an understanding of what makes an accessory truly excellent.
          </p>
        </div>

        <div style={{ marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgb(229,231,235)" }}>
          <Link
            href="/blog"
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
            Browse our articles →
          </Link>
        </div>
      </div>
    </main>
  );
}