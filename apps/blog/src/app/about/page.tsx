import type { Metadata } from "next";
import Image from "next/image";
import { FormattedDate } from "@/components/formatted-date";

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
    <main>
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
          padding: "2rem 1rem",
        }}
      >
        <Image
          src="/blog-assets/blog-placeholder-about.jpg"
          alt="About Accessories World Blog"
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
      </div>

      <div
        style={{
          width: "720px",
          maxWidth: "calc(100% - 2em)",
          margin: "auto",
          padding: "1.5em",
          color: "rgb(55, 65, 81)",
        }}
      >
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
          <div style={{ marginBottom: "1em", color: "rgb(107,114,128)", fontSize: "0.9375rem" }}>
            <FormattedDate date={new Date("February 2026")} />
          </div>
          <h1 style={{ margin: "0 0 0.75em 0", color: "rgb(17,24,39)", fontSize: "2.5rem", fontWeight: 700 }}>
            About Accessories World Blog
          </h1>
          <hr />
        </div>

        <div className="prose">
          <h2>About Us</h2>
          <p>
            Welcome to the Accessories World Blog—your trusted resource for all
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
      </div>
    </main>
  );
}
