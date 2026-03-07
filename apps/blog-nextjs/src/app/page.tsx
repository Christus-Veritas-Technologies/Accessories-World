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

    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
