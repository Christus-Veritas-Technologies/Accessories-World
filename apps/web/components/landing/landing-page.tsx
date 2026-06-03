"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Check, Shield, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { useProducts, type Product } from "@/hooks/use-products";
import { siteConfig } from "@/lib/site";
import type { StorefrontProduct } from "@/lib/api";

/* ─── types ─────────────────────────────────────────────────── */
export interface LandingConfig {
  title: string;
  titleHighlight?: string;
  badge: string;
  icon: LucideIcon;
  heroImage: string;
  floatImages: string[];
  productItems: { name: string; desc: string }[];
  waMessage: string;
  searchTerm?: string;
  trustPoints?: { icon: LucideIcon; title: string; desc: string }[];
}

/* ─── helpers ────────────────────────────────────────────────── */
const WA_NUM = siteConfig.whatsappNumber.replace(/[^0-9]/g, "");
const PHONE_URL = `tel:${siteConfig.phone.replace(/\s+/g, "")}`;
const PRODUCTS_PER_PAGE = 6;

// Google Ads conversion IDs
// WcBoCJryhKYcEIydmppD = WhatsApp / "Begin checkout" conversion (existing)
// TODO: Replace PHONE_CONVERSION_LABEL with the label from your new "Phone call lead" conversion
const CONVERSION_ID = "AW-18040131212";
const WA_CONVERSION_LABEL = "WcBoCJryhKYcEIydmppD";
const PHONE_CONVERSION_LABEL = "WcBoCJryhKYcEIydmppD"; // update once phone conversion is created in Google Ads

function buildWaUrl(msg: string) {
  return `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
}

function fireConversion(label = WA_CONVERSION_LABEL) {
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("event", "conversion", {
      send_to: `${CONVERSION_ID}/${label}`,
      value: 1.0,
      currency: "USD",
    });
  }
}

/* ─── useAnimateIn (IntersectionObserver + CSS transition) ────── */
function useAnimateIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── WhatsApp button ────────────────────────────────────────── */
function WaButton({
  onClick,
  href,
  size = "lg",
  className = "",
}: {
  onClick?: () => void;
  href?: string;
  size?: "lg" | "sm";
  className?: string;
}) {
  const base = `inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold rounded-xl transition-all ${className}`;
  const pad = size === "lg" ? "px-7 py-3.5 text-base" : "py-3 text-sm";

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/whatsapp.svg" alt="WhatsApp" className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {size === "lg" ? "Order via WhatsApp" : "WhatsApp Us"}
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${pad}`} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${pad}`}>
      {inner}
    </button>
  );
}

/* ─── FloatImage ─────────────────────────────────────────────── */
function FloatImage({ src, delay, label }: { src: string; delay: number; label: string }) {
  const { ref, visible } = useAnimateIn();
  return (
    <div
      ref={ref}
      className="relative flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-100"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(48px) scale(0.92)",
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${src}?w=300&q=75&auto=format&fit=crop`}
        alt={label}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────────── */
function Pagination({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`el-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-red-500 text-white"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export function LandingPage({
  title,
  titleHighlight,
  badge,
  icon: Icon,
  heroImage,
  floatImages,
  productItems,
  waMessage,
  searchTerm,
  trustPoints,
}: LandingConfig) {
  const waUrl = buildWaUrl(waMessage);
  const [page, setPage] = useState(1);

  function handleWa() {
    fireConversion();
    window.open(waUrl, "_blank");
  }

  const { data: productsData, isLoading } = useProducts({
    search: searchTerm,
    limit: PRODUCTS_PER_PAGE,
    page,
  });

  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  const defaultTrust = [
    { icon: Shield, title: "Quality guaranteed", desc: "Every item is tested before it reaches you" },
    { icon: Zap, title: "Best prices in Mutare", desc: "Affordable without cutting corners" },
    { icon: Phone, title: "Fast response", desc: "Call or WhatsApp and get help in minutes" },
  ];
  const trust = trustPoints ?? defaultTrust;

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0">

      {/* ── HERO BANNER ── */}
      <section className="bg-red-500 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* left: copy — heading only, no description */}
            <div>
              <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5">
                <Icon className="h-4 w-4" />
                {badge}
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-8">
                {titleHighlight
                  ? title.split(titleHighlight).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="text-yellow-300">{titleHighlight}</span>
                        )}
                      </span>
                    ))
                  : title}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <WaButton onClick={handleWa} size="lg" />
                <a
                  href={PHONE_URL}
                  onClick={() => fireConversion(PHONE_CONVERSION_LABEL)}
                  className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
                >
                  <Phone className="h-5 w-5" />
                  {siteConfig.phone}
                </a>
              </div>
              <p className="text-red-200 text-sm mt-5">
                43 First Street, Mutare — walk in or order online
              </p>
            </div>

            {/* right: hero image — rounded corners, responsive */}
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${heroImage}?w=900&q=85&auto=format&fit=crop`}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-900/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING PRODUCT IMAGES ── */}
      <section className="bg-gray-50 py-8 border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 text-center">
            What we have in stock
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 justify-start sm:justify-center">
            {floatImages.map((src, i) => (
              <FloatImage key={`${src}-${i}`} src={src} delay={i * 0.07} label={`${title} ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT CHECKLIST ── */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-black mb-6 text-center">Everything in this category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {productItems.map((item) => (
              <div key={item.name} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-black leading-snug">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PRODUCTS + PAGINATION ── */}
      {(isLoading || products.length > 0) && (
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Shop Now</h2>
              <p className="text-gray-500">Click a product to enquire — we&apos;ll reply on WhatsApp</p>
            </div>
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-72 rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p as unknown as StorefrontProduct} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  total={total}
                  limit={PRODUCTS_PER_PAGE}
                  onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* ── TRUST ── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {trust.map((t) => (
              <div key={t.title} className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                  <t.icon className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold text-black mb-1 text-sm">{t.title}</h3>
                <p className="text-sm text-gray-500">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-red-500 rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Ready to order?</h2>
            <p className="text-red-100 mb-7 max-w-md mx-auto">
              WhatsApp us now and we&apos;ll sort you out — usually within minutes.
            </p>
            <WaButton
              href={waUrl}
              onClick={fireConversion}
              size="lg"
              className="shadow-md hover:shadow-lg"
            />
            <p className="text-red-200 text-sm mt-4">43 First Street, Mutare</p>
          </div>
        </div>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 flex gap-3 sm:hidden z-50 shadow-lg">
        <WaButton onClick={handleWa} size="sm" className="flex-1" />
        <a
          href={PHONE_URL}
          onClick={() => fireConversion(PHONE_CONVERSION_LABEL)}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm"
        >
          <Phone className="h-4 w-4" /> Call Us
        </a>
      </div>
    </div>
  );
}
