import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/consts";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <section
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          padding: "3rem 1rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
          borderBottom: "1px solid rgb(229, 231, 235)",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
            color: "#DC2626",
            fontWeight: 700,
          }}
        >
          Accessories World Blog
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "rgb(107, 114, 128)",
            fontWeight: 500,
            margin: 0,
          }}
        >
          Your guide to style, quality, and accessories that matter
        </p>
      </section>

      <section
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "rgb(17, 24, 39)",
            fontSize: "2rem",
            fontWeight: 700,
          }}
        >
          Welcome
        </h2>
        <p>
          Discover insights, tips, and inspiration for choosing accessories that
          enhance your personal style and stand the test of time. From
          understanding quality materials to navigating seasonal trends, our blog
          is your companion in the world of accessories.
        </p>

        <h3
          style={{
            color: "rgb(17, 24, 39)",
            fontSize: "1.5rem",
            fontWeight: 600,
            marginTop: "1.5em",
          }}
        >
          What We Cover
        </h3>
        <ul style={{ listStyle: "disc", paddingLeft: "1.5em" }}>
          {[
            "How to choose quality bags, belts, and wallets",
            "Seasonal accessory styling tips",
            "The psychology of color and personal expression",
            "Trends and timeless pieces in the accessory world",
            "Care and maintenance for your accessories",
          ].map((item) => (
            <li
              key={item}
              style={{ marginBottom: "0.5em", color: "rgb(55, 65, 81)" }}
            >
              {item}
            </li>
          ))}
        </ul>

        <p>
          Whether you&apos;re a minimalist, a maximalist, or somewhere in
          between, we believe that accessories are where personality meets
          practicality. Let&apos;s explore together.
        </p>
      </section>
    </main>
  );
}
